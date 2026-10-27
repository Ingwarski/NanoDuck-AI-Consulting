import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const options = Object.freeze({ N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
export const validPassword = password => typeof password === "string" && [...password].length >= 12 && Buffer.byteLength(password, "utf8") <= 1024;
export function validPasswordRecord(record) { return record?.algorithm === "scrypt-v1" && /^[A-Za-z0-9_-]{22}$/u.test(record.salt ?? "") && /^[A-Za-z0-9_-]{86}$/u.test(record.hash ?? ""); }
export async function hashPassword(password) {
  if (!validPassword(password)) throw new Error("Use a password of at least 12 characters and at most 1024 UTF-8 bytes.");
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, options);
  return { algorithm: "scrypt-v1", salt: salt.toString("base64url"), hash: hash.toString("base64url") };
}
export async function verifyPassword(password, record) {
  if (!validPassword(password) || !validPasswordRecord(record)) return false;
  const expected = Buffer.from(record.hash, "base64url");
  const actual = await scrypt(password, Buffer.from(record.salt, "base64url"), 64, options);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
