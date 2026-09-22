import { X509Certificate } from "node:crypto";
import { setupWorkspace } from "./local-setup.mjs";

const flags = process.argv.slice(2);
if (flags.length > 1 || flags.some(flag => !["--renew-certificate", "--reset-password"].includes(flag))) throw new Error("Usage: npm run setup [-- --renew-certificate | --reset-password]");
const renewCertificate = flags[0] === "--renew-certificate";
const resetPassword = flags[0] === "--reset-password";

function readPassword(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Password setup requires an interactive terminal. Password arguments and environment variables are not accepted.");
  return new Promise((resolve, reject) => {
    let value = ""; const wasRaw = process.stdin.isRaw;
    const finish = (error) => { process.stdin.off("data", onData); process.stdin.setRawMode(wasRaw); process.stdin.pause(); process.stdout.write("\n"); error ? reject(error) : resolve(value); };
    const onData = chunk => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u0003" || character === "\u0004") return finish(new Error("Setup cancelled."));
        if (character === "\u007f" || character === "\b") value = [...value].slice(0, -1).join("");
        else if (character >= " " && Buffer.byteLength(value, "utf8") < 1024) value += character;
      }
    };
    process.stdout.write(prompt); process.stdin.setEncoding("utf8"); process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.on("data", onData);
  });
}

let password;
if (!renewCertificate) {
  password = await readPassword("Workspace password (at least 12 characters): ");
  if (password !== await readPassword("Repeat password: ")) throw new Error("Passwords do not match.");
}
const result = await setupWorkspace({ password, renewCertificate, resetPassword });
process.stdout.write(`Local workspace ready.\nTrust only this public CA certificate on your devices: ${result.dataDirectory}/trust/nanoduck-local-ca.crt\nCA SHA-256 fingerprint: ${new X509Certificate(result.caCertificate).fingerprint256}\nCertificate names: ${result.hostnames.join(", ")}\nRun npm start. Keep this computer running for LAN access.\n`);
