import { constants, closeSync, fstatSync, openSync, readFileSync, readSync, realpathSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { X509Certificate, createPrivateKey } from "node:crypto";
import { FORBIDDEN_RUNTIME_ENVIRONMENT_NAMES } from "./forbidden-environment.mjs";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-files.mjs";
import { localHostname, privateAddress } from "./local-request.mjs";
import { validPasswordRecord } from "./password.mjs";

const require = createRequire(import.meta.url);
const repositoryDirectory = fileURLToPath(new URL("../../", import.meta.url));
const optionalString = value => typeof value === "string" && value.trim() ? value.trim() : undefined;
const positiveInteger = (value, fallback, name, maximum) => {
  if (value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!/^\d+$/u.test(String(value)) || !Number.isSafeInteger(number) || number < 1 || number > maximum) throw new Error(`${name} must be an integer from 1 to ${maximum}.`);
  return number;
};
const modelCandidates = value => {
  if (!value) return Object.freeze([]);
  const candidates = [...new Set(value.split(",").map(item => item.trim()).filter(Boolean))];
  if (candidates.length > 12 || candidates.some(item => !/^[A-Za-z0-9._-]{1,128}$/u.test(item))) throw new Error("CLAUDE_CODE_MODEL_CANDIDATES contains an invalid model id.");
  return Object.freeze(candidates);
};

const defaultDataDirectory = (environment, home) => {
  if (process.platform === "darwin") return join(home, "Library", "Application Support", "NanoDuck Consulting");
  if (process.platform === "win32") return join(optionalString(environment.LOCALAPPDATA) ?? join(home, "AppData", "Local"), "NanoDuck Consulting");
  return join(optionalString(environment.XDG_DATA_HOME) ?? join(home, ".local", "share"), "nanoduck-consulting");
};


export function resolveDataDirectory(environment = process.env) {
  const home = resolve(optionalString(environment.HOME) ?? optionalString(environment.USERPROFILE) ?? homedir());
  if (environment.NODE_ENV === "test" && !optionalString(environment.NANODUCK_DATA_DIR)) throw new Error("Tests require an isolated NANODUCK_DATA_DIR.");
  const requested = resolve(optionalString(environment.NANODUCK_DATA_DIR) ?? defaultDataDirectory(environment, home));
  const fromRepository = relative(realpathSync(repositoryDirectory), requested);
  if (!fromRepository || (!fromRepository.startsWith("..") && !isAbsolute(fromRepository))) throw new Error("The local data directory must be outside the repository.");
  return ensurePrivateDirectory(requested);
}

export function readPrivateFile(filename, maximum = 65536) {
  ensurePrivateFile(filename);
  const descriptor = openSync(filename, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const info = fstatSync(descriptor);
    if (!info.isFile() || info.nlink !== 1 || info.size > maximum) throw new Error("Invalid local private file.");
    const buffer = Buffer.alloc(maximum + 1); let length = 0;
    while (length < buffer.length) { const count = readSync(descriptor, buffer, length, buffer.length - length, null); if (!count) break; length += count; }
    if (length > maximum) throw new Error("Local private file exceeds its size limit.");
    return buffer.subarray(0, length).toString("utf8");
  } finally { closeSync(descriptor); }
}

export function readWorkspaceConfiguration(dataDirectory) {
  let input;
  try { input = JSON.parse(readPrivateFile(join(dataDirectory, "config.json"))); }
  catch (error) { if (error.code === "ENOENT") throw new Error("Local workspace is not configured. Run npm run setup first."); throw error; }
  if (input.version !== 2 || !validPasswordRecord(input.password) || !/^[a-f0-9]{32}$/u.test(input.certificateVersion ?? "") || !Array.isArray(input.hostnames) || !input.hostnames.length || input.hostnames.some(name => !localHostname(name))) throw new Error("Invalid local workspace configuration; do not replace its encryption keys.");
  const keys = ["dataKey", "recoveryKey", "sessionKey"].map(name => {
    const value = input[name];
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/u.test(value) || Buffer.from(value, "base64url").toString("base64url") !== value) throw new Error("Invalid local key configuration.");
    return value;
  });
  if (new Set(keys).size !== 3) throw new Error("Local encryption and session keys must differ.");
  return input;
}

const packageCommand = (name, binary) => {
  const metadataPath = require.resolve(`${name}/package.json`);
  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  const filename = resolve(dirname(metadataPath), typeof metadata.bin === "string" ? metadata.bin : metadata.bin[binary]);
  return /\.[cm]?js$/u.test(filename)
    ? { command: process.execPath, args: Object.freeze([filename]) }
    : { command: filename, args: Object.freeze([]) };
};

function codexCommand() {
  const architectures = { x64: "x86_64", arm64: "aarch64" };
  const systems = { darwin: "apple-darwin", linux: "unknown-linux-musl", win32: "pc-windows-msvc" };
  const architecture = architectures[process.arch]; const system = systems[process.platform];
  if (!architecture || !system) throw new Error("The bundled Codex CLI supports macOS, Linux and Windows on x64 or arm64.");
  const triple = `${architecture}-${system}`;
  let root;
  try { root = dirname(require.resolve(`@openai/codex-${process.platform}-${process.arch}/package.json`)); }
  catch { root = dirname(require.resolve("@openai/codex/package.json")); }
  return { command: join(root, "vendor", triple, "bin", process.platform === "win32" ? "codex.exe" : "codex"), args: Object.freeze([]) };
}

export function loadConfig(environment = process.env) {
  const forbidden = FORBIDDEN_RUNTIME_ENVIRONMENT_NAMES.filter(name => optionalString(environment[name]));
  if (forbidden.length) throw new Error(`Unsupported provider environment: ${forbidden.join(", ")}. Use subscription sign-in.`);
  const mode = environment.NODE_ENV ?? "production";
  if (!["development", "test", "production"].includes(mode)) throw new Error("NODE_ENV is invalid.");
  const port = positiveInteger(environment.PORT, 3000, "PORT", 65_535);
  const host = optionalString(environment.NANODUCK_HOST) ?? "0.0.0.0";
  if (host !== "0.0.0.0" && host !== "::" && !privateAddress(host)) throw new Error("NANODUCK_HOST must be a local interface address.");
  const maxAttachmentBytes = positiveInteger(environment.MAX_ATTACHMENT_BYTES, 8 * 1024 * 1024, "MAX_ATTACHMENT_BYTES", 8 * 1024 * 1024);
  if (environment.SESSION_ABSOLUTE_SECONDS !== undefined && environment.SESSION_ABSOLUTE_SECONDS !== "86400") throw new Error("Sessions have a fixed 24-hour absolute lifetime.");
  const sessionLifetimeSeconds = 86_400;
  const claudeModelCandidates = modelCandidates(environment.CLAUDE_CODE_MODEL_CANDIDATES);
  const dataDirectory = resolveDataDirectory(environment);
  const saved = readWorkspaceConfiguration(dataDirectory);
  const tlsDirectory = join(dataDirectory, "tls", saved.certificateVersion);
  const certificate = readPrivateFile(join(tlsDirectory, "server.crt"));
  const parsed = new X509Certificate(certificate);
  const privateKey = readPrivateFile(join(tlsDirectory, "server-key.pem"));
  if (!parsed.checkPrivateKey(createPrivateKey(privateKey)) || saved.hostnames.some(name => !(name.includes(":") || /^\d+\.\d+\.\d+\.\d+$/u.test(name) ? parsed.checkIP(name) : parsed.checkHost(name, { wildcards: false })))) throw new Error("Local certificate key or host names do not match the workspace configuration.");
  if (Date.parse(parsed.validTo) <= Date.now() || Date.parse(parsed.validFrom) > Date.now()) throw new Error("Local HTTPS certificate is not current. Run npm run setup -- --renew-certificate.");
  const allowedHosts = saved.hostnames.map(name => `${name.includes(":") ? `[${name}]` : name}${port === 443 ? "" : `:${port}`}`);
  const codex = codexCommand(); const claude = packageCommand("@anthropic-ai/claude-code", "claude");
  const home = resolve(optionalString(environment.HOME) ?? optionalString(environment.USERPROFILE) ?? homedir());
  const codexHome = optionalString(environment.CODEX_HOME) ?? (mode === "test" ? undefined : join(home, ".codex"));
  const codexAuthPath = codexHome ? join(resolve(codexHome), "auth.json") : undefined;
  let readyForProvider = false;
  try { readyForProvider = Boolean(codexAuthPath && statSync(codexAuthPath).isFile()); } catch { /* Sign-in is optional at startup. */ }
  const testCommand = mode === "test" ? optionalString(environment.NANODUCK_TEST_CODEX_COMMAND) : undefined;
  return Object.freeze({
    mode, host, port, origin: `https://127.0.0.1${port === 443 ? "" : `:${port}`}`, allowedHosts: Object.freeze(allowedHosts), dataDirectory,
    ...Object.fromEntries(["dataKey", "recoveryKey", "sessionKey"].map(name => [name, Buffer.from(saved[name], "base64url")])),
    password: Object.freeze(saved.password),
    tls: Object.freeze({ key: privateKey, cert: certificate, minVersion: "TLSv1.2" }),
    maxAttachmentBytes, sessionLifetimeSeconds,
    codexCommand: testCommand ? process.execPath : codex.command,
    codexCommandArgs: testCommand ? Object.freeze([resolve(testCommand)]) : codex.args,
    codexAuthPath, readyForProvider,
    claudeCommand: claude.command, claudeCommandArgs: claude.args,
    claudeOAuthToken: optionalString(environment.CLAUDE_CODE_OAUTH_TOKEN), claudeModelCandidates
  });
}
