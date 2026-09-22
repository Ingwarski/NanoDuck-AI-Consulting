import { crc32 } from "node:zlib";

// Inspect bounded container framing only. Never decompress pixels or interpret
// metadata; a structurally accepted file is not proof of decoder validity.
export function isPng(content) {
  if (content.length < 57 || !content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return false;
  let position = 8; let header = false; let palette = false; let indexed = false; let data = 0; let seenData = false; let dataEnded = false;
  const depths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
  while (position + 12 <= content.length) {
    const length = content.readUInt32BE(position); const start = position + 8; const end = start + length;
    if (end + 4 > content.length) return false;
    const kind = content.toString("latin1", position + 4, start);
    if (!/^[A-Za-z]{2}[A-Z][A-Za-z]$/u.test(kind) || crc32(content.subarray(position + 4, end)) !== content.readUInt32BE(end)) return false;
    if (!header && kind !== "IHDR") return false;
    if (kind === "IHDR") {
      if (header || length !== 13) return false;
      const width = content.readUInt32BE(start); const height = content.readUInt32BE(start + 4);
      if (!width || !height || width > 0x7fffffff || height > 0x7fffffff || !depths[content[start + 9]]?.includes(content[start + 8]) || content[start + 10] !== 0 || content[start + 11] !== 0 || content[start + 12] > 1) return false;
      indexed = content[start + 9] === 3; header = true;
    } else if (kind === "PLTE") {
      if (palette || seenData || !length || length > 768 || length % 3) return false;
      palette = true;
    } else if (kind === "IDAT") {
      if (dataEnded || (indexed && !palette)) return false;
      seenData = true; data += length;
    } else if (kind === "IEND") return length === 0 && data > 0 && end + 4 === content.length;
    else {
      if (kind[0] === kind[0].toUpperCase()) return false;
      if (seenData) dataEnded = true;
    }
    position = end + 4;
  }
  return false;
}

const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
export function isJpeg(content) {
  if (content.length < 4 || content[0] !== 0xff || content[1] !== 0xd8) return false;
  let position = 2; let frame = false; let scan = false; let entropy = 0;
  while (position < content.length) {
    if (content[position++] !== 0xff) return false;
    while (content[position] === 0xff) position++;
    const marker = content[position++];
    if (marker === 0xd9) return frame && scan && entropy > 0 && position === content.length;
    if (marker === undefined || marker === 0 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) return false;
    if (marker === 0x01) continue;
    if (position + 2 > content.length) return false;
    const length = content.readUInt16BE(position); const start = position + 2; const end = position + length;
    if (length < 2 || end > content.length) return false;
    if (frameMarkers.has(marker)) {
      if (frame || length < 11 || !content.readUInt16BE(start + 1) || !content.readUInt16BE(start + 3) || !content[start + 5] || length !== 8 + 3 * content[start + 5]) return false;
      frame = true;
    }
    if (marker === 0xda) {
      if (!frame || length < 8 || !content[start] || length !== 6 + 2 * content[start]) return false;
      scan = true; position = end;
      while (position < content.length) {
        if (content[position] !== 0xff) { entropy++; position++; continue; }
        const next = content[position + 1];
        if (next === 0) { entropy++; position += 2; }
        else if (next >= 0xd0 && next <= 0xd7) position += 2;
        else if (next === 0xff) position++;
        else break;
      }
    } else position = end;
  }
  return false;
}

function imageDimensions(kind, bytes) {
  if (kind === "VP8 " && bytes.length > 10 && !(bytes[0] & 1) && bytes[3] === 0x9d && bytes[4] === 1 && bytes[5] === 0x2a) {
    const width = bytes.readUInt16LE(6) & 0x3fff; const height = bytes.readUInt16LE(8) & 0x3fff;
    return width && height ? [width, height] : undefined;
  }
  if (kind === "VP8L" && bytes.length > 5 && bytes[0] === 0x2f && !(bytes[4] & 0xe0)) {
    const bits = bytes.readUInt32LE(1); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
}
function riffChunks(content, start, end) {
  const chunks = [];
  while (start + 8 <= end) {
    const length = content.readUInt32LE(start + 4); const next = start + 8 + length + (length & 1);
    if (next > end || ((length & 1) && content[next - 1] !== 0)) return undefined;
    chunks.push({ kind: content.toString("latin1", start, start + 4), bytes: content.subarray(start + 8, start + 8 + length) });
    start = next;
  }
  return start === end ? chunks : undefined;
}
export function isWebp(content) {
  if (content.length < 20 || content.toString("latin1", 0, 4) !== "RIFF" || content.toString("latin1", 8, 12) !== "WEBP" || content.readUInt32LE(4) !== content.length - 8) return false;
  const chunks = riffChunks(content, 12, content.length);
  if (!chunks?.length) return false;
  if (chunks[0].kind !== "VP8X") return chunks.length === 1 && Boolean(imageDimensions(chunks[0].kind, chunks[0].bytes));
  const header = chunks[0].bytes;
  if (header.length !== 10 || (header[0] & 0xc1) || header[1] || header[2] || header[3]) return false;
  const width = header.readUIntLE(4, 3) + 1; const height = header.readUIntLE(7, 3) + 1;
  const animated = Boolean(header[0] & 2); let animation = false; let frames = 0; let image = false;
  for (const { kind, bytes } of chunks.slice(1)) {
    if (kind === "VP8X") return false;
    if (kind === "ANIM") { if (!animated || animation || frames || bytes.length !== 6) return false; animation = true; }
    else if (kind === "ANMF") {
      if (!animated || !animation || bytes.length < 24 || (bytes[15] & 0xfc)) return false;
      const frameWidth = bytes.readUIntLE(6, 3) + 1; const frameHeight = bytes.readUIntLE(9, 3) + 1;
      if (bytes.readUIntLE(0, 3) * 2 + frameWidth > width || bytes.readUIntLE(3, 3) * 2 + frameHeight > height) return false;
      const nested = riffChunks(bytes, 16, bytes.length);
      const payloads = nested?.filter(chunk => chunk.kind === "VP8 " || chunk.kind === "VP8L");
      if (payloads?.length !== 1) return false;
      const dimensions = imageDimensions(payloads[0].kind, payloads[0].bytes);
      if (!dimensions || dimensions[0] !== frameWidth || dimensions[1] !== frameHeight) return false;
      frames++;
    } else if (kind === "VP8 " || kind === "VP8L") {
      if (animated || image) return false;
      const dimensions = imageDimensions(kind, bytes);
      if (!dimensions || dimensions[0] !== width || dimensions[1] !== height) return false;
      image = true;
    }
  }
  return animated ? animation && frames > 0 : image;
}
