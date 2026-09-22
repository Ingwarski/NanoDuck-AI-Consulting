import assert from "node:assert/strict";
import test from "node:test";
import { crc32 } from "node:zlib";
import { inspectImageAttachment } from "../src/server/attachments.mjs";
import { jpeg, png, webp, progressiveJpeg, losslessWebp, animatedWebp, pngChunk, withImageMetadata } from "./fixtures/images.mjs";

test("real encoder output, progressive JPEG and static/animated WebP retain their media type", () => {
  for (const [bytes, type] of [[jpeg, "jpeg"], [progressiveJpeg, "jpeg"], [png, "png"], [webp, "webp"], [losslessWebp, "webp"], [animatedWebp, "webp"]]) {
    assert.equal(inspectImageAttachment(bytes), `image/${type}`);
    for (let end = 0; end < bytes.length; end++) assert.equal(inspectImageAttachment(bytes.subarray(0, end)), undefined, `${type} prefix ${end}`);
  }
});

test("bare signatures and forged terminal markers are not images", () => {
  for (const bytes of [Buffer.from([255, 216, 255, 217]), Buffer.concat([png.subarray(0, 8), png.subarray(-8)]), Buffer.from("524946460c000000574542505650382000000000", "hex")]) assert.equal(inspectImageAttachment(bytes), undefined);
});

test("binary identifiers reject high-bit lookalikes", () => {
  const corruptPng = Buffer.from(png); corruptPng[12] |= 128; corruptPng.writeUInt32BE(crc32(corruptPng.subarray(12, 29)), 29);
  const corruptWebp = Buffer.from(webp); corruptWebp[0] |= 128;
  for (const bytes of [corruptPng, corruptWebp]) assert.equal(inspectImageAttachment(bytes), undefined);
});

test("PNG requires bounded chunks, valid CRC, nonzero dimensions and image data", () => {
  const badCrc = Buffer.from(png); badCrc[29] ^= 1;
  const oversizedChunk = Buffer.from(png); oversizedChunk.writeUInt32BE(0xffffffff, 8);
  const zeroSizeHeader = Buffer.from(png.subarray(16, 29)); zeroSizeHeader.writeUInt32BE(0, 0);
  const zeroDimensions = Buffer.concat([png.subarray(0, 8), pngChunk("IHDR", zeroSizeHeader), png.subarray(33)]);
  const noData = Buffer.concat([png.subarray(0, 33), png.subarray(-12)]);
  for (const bytes of [badCrc, oversizedChunk, zeroDimensions, noData]) assert.equal(inspectImageAttachment(bytes), undefined);
});

test("JPEG requires complete frame and scan segments, entropy bytes and final EOI", () => {
  const oversizedSegment = Buffer.from(jpeg); oversizedSegment.writeUInt16BE(0xffff, 4);
  const frame = jpeg.indexOf(Buffer.from([255, 192])); assert.ok(frame > 0);
  const zeroHeight = Buffer.from(jpeg); zeroHeight.writeUInt16BE(0, frame + 5);
  const noScan = Buffer.concat([jpeg.subarray(0, jpeg.indexOf(Buffer.from([255, 218]))), Buffer.from([255, 217])]);
  for (const bytes of [oversizedSegment, zeroHeight, noScan, Buffer.concat([jpeg, Buffer.from([0])])]) assert.equal(inspectImageAttachment(bytes), undefined);
});

test("WebP rejects chunks beyond the envelope, missing bitstreams and overflowing animation frames", () => {
  const oversizedChunk = Buffer.from(webp); oversizedChunk.writeUInt32LE(0xffffffff, 16);
  const noBitstream = Buffer.from(webp.subarray(0, 30)); noBitstream.writeUInt32LE(noBitstream.length - 8, 4);
  const frame = animatedWebp.indexOf(Buffer.from("ANMF")); assert.ok(frame > 0);
  const overflowingFrame = Buffer.from(animatedWebp); overflowingFrame.writeUIntLE(0xffffff, frame + 8, 3);
  for (const bytes of [oversizedChunk, noBitstream, overflowingFrame]) assert.equal(inspectImageAttachment(bytes), undefined);
});

test("image metadata remains opaque bytes and receives no decoding or execution", () => {
  const metadata = Buffer.from('<script>throw "must remain inert"</script>');
  for (const [bytes, type] of [[jpeg, "jpeg"], [png, "png"], [webp, "webp"]]) {
    const image = withImageMetadata(bytes, metadata);
    assert.equal(inspectImageAttachment(image), `image/${type}`);
    assert.equal(image.includes(metadata), true);
  }
});
