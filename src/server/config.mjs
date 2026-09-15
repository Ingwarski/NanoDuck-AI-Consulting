import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

const required = (value, name) => {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${name} is required.`);
  return value.trim();
};

const optionalUrl = (value, name) => {
  if (value === undefined || value === "") return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must be a clean HTTPS origin.`);
  }
  return url.origin;
};

const positiveInteger = (value, fallback, name) => {
  if (value === undefined || value === "") return fallback;
  if (!/^\d+$/u.test(value)) throw new Error(`${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be positive.`);
  return parsed;
};

const utf8Text = (decoded, name) => {
  if (!decoded.byteLength) throw new Error(`${name} must contain UTF-8 text.`);
  const text = decoded.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(decoded)) throw new Error(`${name} must contain UTF-8 text.`);
  return text;
};

const optionalBase64urlText = (value, name) => {
  if (value === undefined || value === "") return undefined;
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) throw new Error(`${name} must be base64url-encoded UTF-8 text.`);
  const decoded = Buffer.from(value, "base64url");
  if (!decoded.byteLength || decoded.toString("base64url") !== value) throw new Error(`${name} must be canonical base64url-encoded UTF-8 text.`);
  return utf8Text(decoded, name);
};

const optionalBase64urlBytes = (value, name) => {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/u.test(value)) throw new Error(`${name} must be base64url-encoded bytes.`);
  const decoded = Buffer.from(value, "base64url");
  if (!decoded.byteLength || decoded.toString("base64url") !== value) throw new Error(`${name} must be canonical base64url-encoded bytes.`);
  return decoded;
};

const optionalGzipBase64urlBytes = (value, name) => {
  const compressed = optionalBase64urlBytes(value, name);
  if (!compressed) return undefined;
  try {
    return gunzipSync(compressed, { maxOutputLength: 64 * 1024 });
  } catch {
    throw new Error(`${name} must be valid gzip-compressed base64url bytes of at most 64 KiB.`);
  }
};

const optionalGzipBase64urlText = (value, name) => {
  const decoded = optionalGzipBase64urlBytes(value, name);
  return decoded === undefined ? undefined : utf8Text(decoded, name);
};

const optionalString = value => typeof value === "string" && value.trim() ? value.trim() : undefined;

const goDaddyDatabaseUrl = environment => {
  const existing = optionalString(environment.DATABASE_URL);
  if (existing) return existing;
  const host = optionalString(environment.DB_HOST);
  const port = optionalString(environment.DB_PORT);
  const name = optionalString(environment.DB_NAME);
  const user = optionalString(environment.DB_USER);
  const password = optionalString(environment.DB_PASSWORD);
  if (![host, port, name, user, password].some(Boolean)) return undefined;
  if (![host, port, name, user, password].every(Boolean) || !/^\d+$/u.test(port) || Number(port) < 1 || Number(port) > 65_535) {
    throw new Error("DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD must form one valid managed database connection.");
  }
  const url = new URL("mysql://localhost");
  url.hostname = host; url.port = port; url.username = user; url.password = password; url.pathname = `/${name}`;
  return url.toString();
};

export function loadConfig(environment = process.env) {
  const mode = environment.NODE_ENV ?? "production";
  if (!["development", "test", "production"].includes(mode)) throw new Error("NODE_ENV is invalid.");
  const origin = optionalUrl(environment.APP_ORIGIN ?? environment.SETTINGS_PUBLIC_ORIGIN, "APP_ORIGIN");
  if (mode === "production" && origin === undefined) throw new Error("APP_ORIGIN is required in production.");
  const dataKey = environment.DATA_ENCRYPTION_KEY;
  const decodedKey = dataKey === undefined ? undefined : Buffer.from(dataKey, "base64url");
  if (mode === "production" && (!decodedKey || decodedKey.byteLength !== 32)) {
    throw new Error("DATA_ENCRYPTION_KEY must be a 32-byte base64url key in production.");
  }
  if (decodedKey !== undefined && decodedKey.byteLength !== 32) throw new Error("DATA_ENCRYPTION_KEY must contain 32 bytes.");
  const recoveryKey = environment.RECOVERY_ENCRYPTION_KEY;
  const decodedRecoveryKey = recoveryKey === undefined ? undefined : Buffer.from(recoveryKey, "base64url");
  if (mode === "production" && (!decodedRecoveryKey || decodedRecoveryKey.byteLength !== 32)) {
    throw new Error("RECOVERY_ENCRYPTION_KEY must be a separate 32-byte base64url key in production.");
  }
  if (decodedRecoveryKey !== undefined && decodedRecoveryKey.byteLength !== 32) throw new Error("RECOVERY_ENCRYPTION_KEY must contain 32 bytes.");
  if (decodedKey && decodedRecoveryKey && decodedKey.equals(decodedRecoveryKey)) throw new Error("RECOVERY_ENCRYPTION_KEY must differ from DATA_ENCRYPTION_KEY.");
  const sessionKeyValue = environment.SESSION_SIGNING_KEY ?? environment.SETTINGS_SESSION_HMAC_KEY;
  const sessionKey = sessionKeyValue === undefined
    ? (mode === "production" ? undefined : createHash("sha256").update("nanoduck-development-session-key").digest())
    : Buffer.from(sessionKeyValue, "base64url");
  if (!sessionKey || sessionKey.byteLength < 32) throw new Error("SESSION_SIGNING_KEY must contain at least 32 bytes.");
  const databaseUrl = goDaddyDatabaseUrl(environment);
  if (mode === "production" && (typeof databaseUrl !== "string" || databaseUrl.length === 0)) {
    throw new Error("DATABASE_URL or the managed DB_* connection is required in production.");
  }
  const databaseSslCaPath = optionalString(environment.DATABASE_SSL_CA_PATH);
  const ownerSubject = optionalString(environment.OWNER_GOOGLE_SUBJECT);
  const ownerEmail = optionalString(environment.OWNER_GOOGLE_EMAIL ?? environment.SETTINGS_OWNER_GOOGLE_EMAIL)?.toLowerCase();
  const googleClientId = environment.GOOGLE_CLIENT_ID;
  const googleClientSecret = environment.GOOGLE_CLIENT_SECRET;
  if (mode === "production" && (![googleClientId, googleClientSecret].every(value => typeof value === "string" && value.length > 0) || (!ownerSubject && !ownerEmail))) {
    throw new Error("Google owner identity configuration is required in production.");
  }
  const codexAuthPath = typeof environment.CODEX_APP_SERVER_AUTH_PATH === "string" && environment.CODEX_APP_SERVER_AUTH_PATH.trim()
    ? environment.CODEX_APP_SERVER_AUTH_PATH.trim()
    : undefined;
  const codexAuthBase64Bytes = optionalBase64urlBytes(environment.CODEX_APP_SERVER_AUTH_B64, "CODEX_APP_SERVER_AUTH_B64");
  const codexAuthGzipBytes = optionalGzipBase64urlBytes(environment.CODEX_APP_SERVER_AUTH_GZIP_B64, "CODEX_APP_SERVER_AUTH_GZIP_B64");
  if (codexAuthBase64Bytes && codexAuthGzipBytes) {
    throw new Error("Use only one Codex app-server auth secret.");
  }
  const codexAuthBytes = codexAuthBase64Bytes ?? codexAuthGzipBytes;
  if (mode === "production" && !codexAuthPath && !codexAuthBytes) {
    throw new Error("CODEX_APP_SERVER_AUTH_PATH, CODEX_APP_SERVER_AUTH_B64 or CODEX_APP_SERVER_AUTH_GZIP_B64 is required in production.");
  }

  const runtimeDataKey = decodedKey ?? createHash("sha256").update("nanoduck-development-data-key").digest();
  const runtimeRecoveryKey = decodedRecoveryKey ?? createHash("sha256").update("nanoduck-development-recovery-key").digest();
  const runtimeInstructionsBootstrapPlain = optionalBase64urlText(environment.RUNTIME_INSTRUCTIONS_BOOTSTRAP_B64, "RUNTIME_INSTRUCTIONS_BOOTSTRAP_B64");
  const runtimeInstructionsBootstrapGzip = optionalGzipBase64urlText(environment.RUNTIME_INSTRUCTIONS_BOOTSTRAP_GZIP_B64, "RUNTIME_INSTRUCTIONS_BOOTSTRAP_GZIP_B64");
  if (runtimeInstructionsBootstrapPlain && runtimeInstructionsBootstrapGzip) {
    throw new Error("Use only one runtime-instructions bootstrap secret.");
  }
  const runtimeInstructionsBootstrap = runtimeInstructionsBootstrapPlain ?? runtimeInstructionsBootstrapGzip;
  const maxAttachmentBytes = positiveInteger(environment.MAX_ATTACHMENT_BYTES, 8 * 1024 * 1024, "MAX_ATTACHMENT_BYTES");
  if (maxAttachmentBytes > 8 * 1024 * 1024) throw new Error("MAX_ATTACHMENT_BYTES cannot exceed 8 MiB.");
  return Object.freeze({
    mode,
    port: positiveInteger(environment.PORT, 3000, "PORT"),
    origin,
    databaseUrl,
    databaseSslCaPath,
    dataKey: runtimeDataKey,
    runtimeInstructionsBootstrap,
    recoveryKey: runtimeRecoveryKey,
    sessionKey,
    sessionLifetimeSeconds: positiveInteger(environment.SESSION_ABSOLUTE_SECONDS, 86_400, "SESSION_ABSOLUTE_SECONDS"),
    maxAttachmentBytes,
    google: (ownerSubject || ownerEmail) && googleClientId && googleClientSecret && origin
      ? Object.freeze({ ownerSubject, ownerEmail, clientId: googleClientId, clientSecret: googleClientSecret, redirectUri: `${origin}/auth/google/callback` })
      : undefined,
    developmentOwnerEmail: mode === "development" ? environment.DEV_OWNER_EMAIL : undefined,
    codexCommand: environment.CODEX_APP_SERVER_COMMAND ?? "codex",
    codexAuthPath,
    codexAuthBytes,
    readyForProvider: Boolean(codexAuthPath || codexAuthBytes)
  });
}
