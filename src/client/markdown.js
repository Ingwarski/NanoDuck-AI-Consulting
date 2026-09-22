const forbiddenHostSuffixes = Object.freeze([".ru", ".by", ".su", ".xn--p1ai", ".xn--90ais"]);
const protectEscapedMarkdown = value => value.replace(/\\([\\`*_[\]{}()#+\-.!])/gu, "\uE000$1");
const unescapeMarkdown = value => value.replace(/\uE000(.)/gu, "$1").replace(/\\([\\`*_[\]{}()#+\-.!])/gu, "$1");
const text = value => Object.freeze({ type: "text", value: unescapeMarkdown(value) });
const isForbiddenHost = hostname => hostname === "ru" || hostname === "by" || hostname === "su" || hostname === "xn--p1ai" || hostname === "xn--90ais" || forbiddenHostSuffixes.some(suffix => hostname.endsWith(suffix));

export function safeMarkdownHref(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u)?.slice(1).map(Number);
    const privateIpv4 = ipv4 && (ipv4.some(part => part > 255) || ipv4[0] === 0 || ipv4[0] === 10 || ipv4[0] === 127 || (ipv4[0] === 169 && ipv4[1] === 254) || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168));
    const privateIpv6 = hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:");
    if (url.protocol !== "https:" || url.username || url.password || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal") || isForbiddenHost(hostname) || privateIpv4 || privateIpv6) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

const inlinePattern = /(?<![\\\uE000*_])(\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|`([^`\n]+)`|\*([^*\n]+)\*|_([^_\n]+)_)/gu;

export function parseInline(value) {
  const input = protectEscapedMarkdown(String(value ?? ""));
  const tokens = [];
  let cursor = 0;
  for (const match of input.matchAll(inlinePattern)) {
    const index = match.index ?? 0;
    if (index > cursor) tokens.push(text(input.slice(cursor, index)));
    if (match[2] !== undefined) {
      const href = safeMarkdownHref(match[3]);
      tokens.push(href ? Object.freeze({ type: "link", value: unescapeMarkdown(match[2]), href }) : text(match[0]));
    } else if (match[4] !== undefined || match[5] !== undefined) tokens.push(Object.freeze({ type: "strong", value: unescapeMarkdown(match[4] ?? match[5]) }));
    else if (match[6] !== undefined) tokens.push(Object.freeze({ type: "code", value: unescapeMarkdown(match[6]) }));
    else tokens.push(Object.freeze({ type: "emphasis", value: unescapeMarkdown(match[7] ?? match[8]) }));
    cursor = index + match[0].length;
  }
  if (cursor < input.length) tokens.push(text(input.slice(cursor)));
  return Object.freeze(tokens);
}

const inlineLines = lines => Object.freeze(lines.flatMap((line, index) => index === 0 ? parseInline(line) : [Object.freeze({ type: "break" }), ...parseInline(line)]));
const headingLine = /^(#{1,3})\s+(.+?)\s*#*$/u;
const unorderedLine = /^\s*[-+*]\s+(.+)$/u;
const orderedLine = /^\s*\d+[.)]\s+(.+)$/u;
const quoteLine = /^\s*>\s?(.*)$/u;

export function parseMarkdown(value) {
  const lines = String(value ?? "").replace(/\r\n?/gu, "\n").split("\n");
  const blocks = [];
  for (let index = 0; index < lines.length;) {
    if (!lines[index].trim()) { index += 1; continue; }
    const heading = lines[index].match(headingLine);
    if (heading) {
      blocks.push(Object.freeze({ type: "heading", level: Math.min(4, heading[1].length + 2), content: parseInline(heading[2]) }));
      index += 1; continue;
    }
    const firstList = lines[index].match(unorderedLine) ?? lines[index].match(orderedLine);
    if (firstList) {
      const ordered = Boolean(lines[index].match(orderedLine)); const items = [];
      while (index < lines.length) {
        const item = lines[index].match(ordered ? orderedLine : unorderedLine);
        if (!item) break;
        items.push(parseInline(item[1])); index += 1;
      }
      blocks.push(Object.freeze({ type: "list", ordered, items: Object.freeze(items) })); continue;
    }
    if (quoteLine.test(lines[index])) {
      const quote = [];
      while (index < lines.length) {
        const line = lines[index].match(quoteLine); if (!line) break;
        quote.push(line[1]); index += 1;
      }
      blocks.push(Object.freeze({ type: "quote", content: inlineLines(quote) })); continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !headingLine.test(lines[index]) && !unorderedLine.test(lines[index]) && !orderedLine.test(lines[index]) && !quoteLine.test(lines[index])) {
      paragraph.push(lines[index]); index += 1;
    }
    blocks.push(Object.freeze({ type: "paragraph", content: inlineLines(paragraph) }));
  }
  return Object.freeze(blocks);
}
