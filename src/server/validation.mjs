const text = (value, maximum) => typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
const identifier = value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value);

export function parseJson(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  return value;
}

export function parseMessage(value) {
  const body = parseJson(value);
  if (!body || !text(body.body, 32_000) || !identifier(body.clientRequestId)) return undefined;
  return Object.freeze({ body: body.body.trim(), clientRequestId: body.clientRequestId });
}

export function parseSettings(value, catalog = undefined) {
  const body = parseJson(value);
  if (!body) return undefined;
  const validEfforts = new Set(["xhigh", "ultra"]);
  const validSpeed = new Set(["fast", "balanced", "thorough"]);
  const allowed = Array.isArray(catalog) && catalog.length
    ? catalog.some(model => model?.id === body.headModel && model.id === body.criticModel && Array.isArray(model.efforts) && model.efforts.includes(body.headReasoning) && model.efforts.includes(body.criticReasoning))
    : body.headModel === "gpt-6-astra" && body.criticModel === "gpt-6-astra" && validEfforts.has(body.headReasoning) && validEfforts.has(body.criticReasoning);
  if (!allowed || !validSpeed.has(body.speed)) return undefined;
  return Object.freeze({ headModel: body.headModel, headReasoning: body.headReasoning, criticModel: body.criticModel, criticReasoning: body.criticReasoning, speed: body.speed });
}

export function parseConversationId(value) {
  return identifier(value) ? value : undefined;
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u)?.slice(1).map(Number);
    const privateIpv4 = ipv4 && (ipv4.some(part => part > 255) || ipv4[0] === 0 || ipv4[0] === 10 || ipv4[0] === 127 || (ipv4[0] === 169 && ipv4[1] === 254) || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168));
    const privateIpv6 = hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:");
    if (url.protocol !== "https:" || url.username || url.password || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || privateIpv4 || privateIpv6) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
