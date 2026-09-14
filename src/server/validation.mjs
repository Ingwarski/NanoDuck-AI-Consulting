const text = (value, maximum) => typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
const identifier = value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value);
const forbiddenHostSuffixes = Object.freeze([".ru", ".by", ".su", ".xn--p1ai", ".xn--90ais"]);
const forbiddenLanguage = /[ЁёЫыЪъЭэЎў]|(?:^|[^\p{L}])(?:russian|belarusian|россия|русск(?:ий|ая|ие|ого|им|их)?|беларус(?:ь|ский|кая|кие|кого|ким|ких)?|как|это|какой|какая|какие|котор(?:ый|ая|ые|ого|ому|ых|ыми)?|сегодня|сейчас|только|может|нужно|должен|будет|время|деньги|рынок|решение|вопрос|источник|исследование|данные|продажи|цена|цены|гэта|які|якая|якія|крыніца|даследаванне|рашэнне|пытанне|сёння|цяпер|толькі|можа|павінен|будзе|рынак)(?=$|[^\p{L}])/iu;

export const hasProhibitedLanguage = value => typeof value === "string" && forbiddenLanguage.test(value);
export const hasProhibitedSourceHost = hostname => hostname === "ru" || hostname === "by" || hostname === "su" || hostname === "xn--p1ai" || hostname === "xn--90ais" || forbiddenHostSuffixes.some(suffix => hostname.endsWith(suffix));

export function parseJson(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  return value;
}

const externalUrlMatch = /\bhttps?:\/\/[^\s<>"']+/gu;
const trimUrlPunctuation = value => value.replace(/[),.;:!?]+$/gu, "");
export const hasUnsafeExternalUrl = value => typeof value === "string" && [...value.matchAll(externalUrlMatch)].some(match => !safeExternalUrl(trimUrlPunctuation(match[0])));

export function parseMessage(value) {
  const body = parseJson(value);
  if (!body || !text(body.body, 32_000) || !identifier(body.clientRequestId) || hasProhibitedLanguage(body.body) || hasUnsafeExternalUrl(body.body)) return undefined;
  const attachmentIds = body.attachmentIds === undefined ? [] : body.attachmentIds;
  if (!Array.isArray(attachmentIds) || attachmentIds.length > maxAttachmentsPerMessage || attachmentIds.some(item => !identifier(item)) || new Set(attachmentIds).size !== attachmentIds.length) return undefined;
  return Object.freeze({ body: body.body.trim(), clientRequestId: body.clientRequestId, attachmentIds: Object.freeze([...attachmentIds]) });
}

export function messageError(value) {
  const body = parseJson(value);
  return body && (hasProhibitedLanguage(body.body) || hasUnsafeExternalUrl(body.body)) ? "language_not_supported" : "invalid_message";
}

export function parseSettings(value, catalog = undefined) {
  const body = parseJson(value);
  if (!body) return undefined;
  const validEfforts = new Set(["xhigh", "ultra"]);
  const validSpecialistCounts = new Set(["1", "2", "3", "5", "auto"]);
  const validDiscussionDepths = new Set(["1", "3", "5", "auto"]);
  const allowed = Array.isArray(catalog) && catalog.length
    ? catalog.some(model => model?.id === body.headModel && model.id === body.criticModel && Array.isArray(model.efforts) && model.efforts.includes(body.headReasoning) && model.efforts.includes(body.criticReasoning))
    : body.headModel === "gpt-6-astra" && body.criticModel === "gpt-6-astra" && validEfforts.has(body.headReasoning) && validEfforts.has(body.criticReasoning);
  if (!allowed || !validSpecialistCounts.has(body.specialistCount) || !validDiscussionDepths.has(body.discussionDepth)) return undefined;
  return Object.freeze({ headModel: body.headModel, headReasoning: body.headReasoning, criticModel: body.criticModel, criticReasoning: body.criticReasoning, specialistCount: body.specialistCount, discussionDepth: body.discussionDepth });
}

export function parseConversationId(value) {
  return identifier(value) ? value : undefined;
}

export function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u)?.slice(1).map(Number);
    const privateIpv4 = ipv4 && (ipv4.some(part => part > 255) || ipv4[0] === 0 || ipv4[0] === 10 || ipv4[0] === 127 || (ipv4[0] === 169 && ipv4[1] === 254) || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168));
    const privateIpv6 = hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:");
    if (url.protocol !== "https:" || url.username || url.password || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || hasProhibitedSourceHost(hostname) || privateIpv4 || privateIpv6) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
import { maxAttachmentsPerMessage } from "./attachments.mjs";
