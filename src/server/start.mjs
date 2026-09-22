const [major, minor] = process.versions.node.split(".").map(Number);
if (!((major === 22 && minor >= 13) || major === 24)) throw new Error("NanoDuck requires Node.js 22.13+ or 24.");
await import("./index.mjs");
