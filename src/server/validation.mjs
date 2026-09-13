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
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
