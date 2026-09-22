import { isIP } from "node:net";

export function privateAddress(address) {
  const value = address?.startsWith("::ffff:") ? address.slice(7) : address;
  if (value === "::1") return true;
  if (isIP(value) === 4) {
    const [a, b] = value.split(".").map(Number);
    return a === 127 || a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
  }
  return isIP(value) === 6 && /^(?:f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:)/iu.test(value);
}

export function localHostname(value) {
  if (typeof value !== "string" || value.length > 253) return false;
  if (isIP(value)) return privateAddress(value);
  return /^(?:localhost|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.local)?)$/u.test(value);
}

export function requestOrigin(request, config) {
  if (!request.socket?.encrypted || !privateAddress(request.socket.remoteAddress)) return undefined;
  const host = request.headers.host;
  if (typeof host !== "string" || !config.allowedHosts.includes(host)) return undefined;
  return `https://${host}`;
}

// Host is pinned to certificate names; browser mutations must match this exact origin.
export function localRequestAllowed(request, config) {
  const expected = requestOrigin(request, config);
  if (!expected) return false;
  const target = request.url ?? "/";
  if (!target.startsWith("/") || target.startsWith("//")) return false;
  const origin = request.headers.origin;
  if (origin !== undefined && origin !== expected) return false;
  if (request.headers["sec-fetch-site"] === "cross-site") return false;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && origin !== expected) return false;
  return true;
}
