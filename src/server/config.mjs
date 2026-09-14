import { createHash } from "node:crypto";

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

export function loadConfig(environment = process.env) {
  const mode = environment.NODE_ENV ?? "production";
  if (!["development", "test", "production"].includes(mode)) throw new Error("NODE_ENV is invalid.");
  const origin = optionalUrl(environment.APP_ORIGIN, "APP_ORIGIN");
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
  const sessionKey = environment.SESSION_SIGNING_KEY === undefined
    ? (mode === "production" ? undefined : createHash("sha256").update("nanoduck-development-session-key").digest())
    : Buffer.from(environment.SESSION_SIGNING_KEY, "base64url");
  if (!sessionKey || sessionKey.byteLength < 32) throw new Error("SESSION_SIGNING_KEY must contain at least 32 bytes.");
  const databaseUrl = environment.DATABASE_URL;
  if (mode === "production" && (typeof databaseUrl !== "string" || databaseUrl.length === 0)) {
    throw new Error("DATABASE_URL is required in production.");
  }
  const databaseSslCaPath = environment.DATABASE_SSL_CA_PATH;
  if (mode === "production" && (typeof databaseSslCaPath !== "string" || databaseSslCaPath.length === 0)) {
    throw new Error("DATABASE_SSL_CA_PATH is required in production.");
  }
  const ownerSubject = environment.OWNER_GOOGLE_SUBJECT;
  const googleClientId = environment.GOOGLE_CLIENT_ID;
  const googleClientSecret = environment.GOOGLE_CLIENT_SECRET;
  if (mode === "production" && (![ownerSubject, googleClientId, googleClientSecret].every(value => typeof value === "string" && value.length > 0))) {
    throw new Error("Google owner identity configuration is required in production.");
  }
  const codexAuthPath = environment.CODEX_APP_SERVER_AUTH_PATH;
  if (mode === "production" && (typeof codexAuthPath !== "string" || codexAuthPath.length === 0)) {
    throw new Error("CODEX_APP_SERVER_AUTH_PATH is required in production.");
  }

  const runtimeDataKey = decodedKey ?? createHash("sha256").update("nanoduck-development-data-key").digest();
  const runtimeRecoveryKey = decodedRecoveryKey ?? createHash("sha256").update("nanoduck-development-recovery-key").digest();
  const maxAttachmentBytes = positiveInteger(environment.MAX_ATTACHMENT_BYTES, 8 * 1024 * 1024, "MAX_ATTACHMENT_BYTES");
  if (maxAttachmentBytes > 8 * 1024 * 1024) throw new Error("MAX_ATTACHMENT_BYTES cannot exceed 8 MiB.");
  return Object.freeze({
    mode,
    port: positiveInteger(environment.PORT, 3000, "PORT"),
    origin,
    databaseUrl,
    databaseSslCaPath,
    dataKey: runtimeDataKey,
    recoveryKey: runtimeRecoveryKey,
    sessionKey,
    sessionLifetimeSeconds: positiveInteger(environment.SESSION_ABSOLUTE_SECONDS, 86_400, "SESSION_ABSOLUTE_SECONDS"),
    maxAttachmentBytes,
    google: ownerSubject && googleClientId && googleClientSecret && origin
      ? Object.freeze({ ownerSubject, clientId: googleClientId, clientSecret: googleClientSecret, redirectUri: `${origin}/auth/google/callback` })
      : undefined,
    developmentOwnerEmail: mode === "development" ? environment.DEV_OWNER_EMAIL : undefined,
    codexCommand: environment.CODEX_APP_SERVER_COMMAND ?? "codex",
    codexAuthPath,
    readyForProvider: Boolean(codexAuthPath)
  });
}
