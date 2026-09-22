import { createLocalStore } from "../../src/server/local-store.mjs";

if (typeof global.gc !== "function" || typeof process.send !== "function") throw new Error("ownership_fixture_requires_gc_and_ipc");
const store = await createLocalStore({ dataDirectory: process.argv[2], dataKey: Buffer.from(process.argv[3], "hex") });
const conversation = await store.createConversation();

// The live handler retains the store and its SQLite handles for the child lifetime.
process.on("message", async message => {
  if (message?.type !== "inspect") return;
  try {
    global.gc();
    const conversations = await store.listConversations();
    process.send({ type: "inspected", conversationIds: conversations.map(item => item.id) });
  } catch (error) {
    process.send({ type: "error", error: error.message });
  }
});
process.send({ type: "ready", conversation });
