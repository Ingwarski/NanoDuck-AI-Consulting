import assert from "node:assert/strict";
import test from "node:test";
import { createConsultationService } from "../src/server/consultation.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";

const waitFor = async (predicate, milliseconds = 1_000) => {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    const value = await predicate();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("timed_out");
};

test("sensitive current-topic questions do not enable public web research", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "What is the current market price? Contact me at owner@example.com.", clientRequestId: "sensitive-research-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 5);
  assert.equal(calls.every(call => call.research === false), true);
});
