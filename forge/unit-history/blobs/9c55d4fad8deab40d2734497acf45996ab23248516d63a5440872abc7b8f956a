import { randomBytes, X509Certificate } from "node:crypto";
import { closeSync, existsSync, fsyncSync, openSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { hostname, networkInterfaces } from "node:os";
import { isIP } from "node:net";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { generate } from "selfsigned";
import { resolveDataDirectory, readWorkspaceConfiguration, readPrivateFile } from "./config.mjs";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-files.mjs";
import { localHostname, privateAddress } from "./local-request.mjs";
import { hashPassword } from "./password.mjs";

const randomName = () => randomBytes(16).toString("hex");
function writePrivate(filename, value) {
  const descriptor = openSync(filename, "wx", 0o600);
  try { writeFileSync(descriptor, value); fsyncSync(descriptor); } finally { closeSync(descriptor); }
  ensurePrivateFile(filename);
}
function atomicReplace(filename, value) {
  const candidate = `${filename}.${randomName()}.tmp`;
  writePrivate(candidate, value);
  try { renameSync(candidate, filename); } finally { try { unlinkSync(candidate); } catch (error) { if (error.code !== "ENOENT") throw error; } }
  ensurePrivateFile(filename);
}
function certificateNames(environment) {
  const supplied = environment.NANODUCK_ALLOWED_HOSTS?.trim();
  const names = supplied ? supplied.split(",").map(value => value.trim().toLowerCase()) : [
    "localhost", "127.0.0.1", "::1", hostname().toLowerCase(),
    ...Object.values(networkInterfaces()).flat().filter(item => item && privateAddress(item.address) && !item.address.includes("%")).map(item => item.address)
  ];
  const hostnames = [...new Set(names)].filter(name => name && (supplied || localHostname(name)));
  if (!hostnames.length || hostnames.length > 40 || hostnames.some(name => !localHostname(name))) throw new Error("NANODUCK_ALLOWED_HOSTS must contain at most 40 exact private IPs, local machine names, or .local names; no ports or wildcards.");
  return hostnames;
}

export async function setupWorkspace({ environment = process.env, password, renewCertificate = false, resetPassword = false } = {}) {
  const dataDirectory = resolveDataDirectory(environment);
  const ownershipPath = join(dataDirectory, "ownership.sqlite");
  for (const suffix of ["", "-journal", "-wal", "-shm"]) if (existsSync(`${ownershipPath}${suffix}`)) ensurePrivateFile(`${ownershipPath}${suffix}`);
  const lock = new DatabaseSync(ownershipPath);
  ensurePrivateFile(ownershipPath);
  try {
    try { lock.exec("PRAGMA busy_timeout=0; BEGIN EXCLUSIVE;"); }
    catch { throw new Error("Stop NanoDuck before running setup, certificate renewal, or password reset."); }
    const configured = existsSync(join(dataDirectory, "config.json"));
    if (!configured && existsSync(join(dataDirectory, "state.sqlite"))) throw new Error("Existing workspace data has no key configuration. Restore the original config.json; generating replacement keys would lose access to the data.");
    const previous = configured ? readWorkspaceConfiguration(dataDirectory) : undefined;
    if (previous && !renewCertificate && !resetPassword) throw new Error("This workspace is already configured. Use --renew-certificate or --reset-password after stopping NanoDuck.");
    if (!previous && (renewCertificate || resetPassword)) throw new Error("Run initial setup before renewing a certificate or resetting a password.");
    if (renewCertificate && resetPassword) throw new Error("Choose one setup operation at a time.");
    const passwordRecord = !previous || resetPassword ? await hashPassword(password) : previous.password;
    let saved = previous ? { ...previous, password: passwordRecord } : {
      version: 2, password: passwordRecord,
      ...Object.fromEntries(["dataKey", "recoveryKey", "sessionKey"].map(name => [name, randomBytes(32).toString("base64url")]))
    };
    if (resetPassword) saved.sessionKey = randomBytes(32).toString("base64url");
    let caCertificate;
    if (!previous || renewCertificate) {
      const hostnames = certificateNames(environment);
      const before = new Date(Date.now() - 5 * 60_000);
      let ca;
      if (previous) {
        const directory = join(dataDirectory, "tls", previous.certificateVersion);
        ca = { key: readPrivateFile(join(directory, "ca-key.pem")), cert: readPrivateFile(join(directory, "ca.crt")) };
        if (Date.parse(new X509Certificate(ca.cert).validTo) < Date.now() + 398 * 86_400_000) throw new Error("The local CA expires too soon. Create a fresh workspace certificate authority and trust it on your devices before continuing.");
      } else {
        const created = await generate([{ name: "commonName", value: "NanoDuck Local Certificate Authority" }], {
          keyType: "ec", curve: "P-256", algorithm: "sha256", notBeforeDate: before, notAfterDate: new Date(Date.now() + 3650 * 86_400_000),
          extensions: [{ name: "basicConstraints", cA: true, pathLenConstraint: 0, critical: true }, { name: "keyUsage", keyCertSign: true, cRLSign: true, critical: true }]
        });
        ca = { key: created.private, cert: created.cert };
      }
      const server = await generate([{ name: "commonName", value: hostnames[0] }], {
        keyType: "ec", curve: "P-256", algorithm: "sha256", ca,
        notBeforeDate: before, notAfterDate: new Date(Date.now() + 397 * 86_400_000),
        extensions: [{ name: "basicConstraints", cA: false, critical: true }, { name: "keyUsage", digitalSignature: true, critical: true }, { name: "extKeyUsage", serverAuth: true }, { name: "subjectAltName", altNames: hostnames.map(name => isIP(name) ? { type: 7, ip: name } : { type: 2, value: name }) }]
      });
      const certificateVersion = randomName(); const tlsDirectory = ensurePrivateDirectory(join(dataDirectory, "tls", certificateVersion));
      for (const [filename, value] of [["server-key.pem", server.private], ["server.crt", server.cert], ["ca-key.pem", ca.key], ["ca.crt", ca.cert]]) writePrivate(join(tlsDirectory, filename), value);
      saved = { ...saved, certificateVersion, hostnames }; caCertificate = ca.cert;
    } else caCertificate = readPrivateFile(join(dataDirectory, "tls", saved.certificateVersion, "ca.crt"));
    atomicReplace(join(dataDirectory, "config.json"), `${JSON.stringify(saved)}\n`);
    const trustDirectory = ensurePrivateDirectory(join(dataDirectory, "trust"));
    atomicReplace(join(trustDirectory, "nanoduck-local-ca.crt"), caCertificate);
    return { dataDirectory, caCertificate, hostnames: [...saved.hostnames] };
  } finally { try { lock.exec("ROLLBACK;"); } catch {} lock.close(); }
}
