import { isJpeg, isPng, isWebp } from "./image-structure.mjs";

export const maxAttachmentsPerMessage = 4;

export function inspectImageAttachment(content) {
  if (!Buffer.isBuffer(content) || content.byteLength < 4) return undefined;
  if (isJpeg(content)) return "image/jpeg";
  if (isPng(content)) return "image/png";
  if (isWebp(content)) return "image/webp";
  return undefined;
}

export async function readImageAttachment(request, maximum) {
  const declaredLength = request.headers["content-length"];
  if (typeof declaredLength === "string" && /^\d+$/u.test(declaredLength) && Number(declaredLength) > maximum) {
    request.resume();
    throw Object.assign(new Error("attachment_too_large"), { code: "attachment_too_large" });
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.byteLength;
    if (size > maximum) {
      request.resume();
      throw Object.assign(new Error("attachment_too_large"), { code: "attachment_too_large" });
    }
    chunks.push(chunk);
  }
  const content = Buffer.concat(chunks);
  const contentType = inspectImageAttachment(content);
  if (!contentType) throw Object.assign(new Error("invalid_image_attachment"), { code: "invalid_image_attachment" });
  return Object.freeze({ content, contentType, byteLength: content.byteLength });
}

export const attachmentExtension = contentType => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[contentType]);
