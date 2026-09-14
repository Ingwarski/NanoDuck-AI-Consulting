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
  assert.equal(calls.length, 1);
  assert.equal(calls.every(call => call.research === false), true);
});

test("ordinary consultations can use restricted live research without a keyword", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "ordinary-research-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 5);
  assert.equal(calls.every(call => call.research === true), true);
});

test("a simple Ukrainian explanation receives one direct Head Consultant answer", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Що таке валова маржа?", clientRequestId: "direct-answer-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 1);
  assert.match(calls[0].assignment, /direct, self-contained answer/u);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [["owner", null], ["Head Consultant", null]]);
});

test("a Ukrainian finance question assigns the Finance Consultant and directs the Critic reply", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Які грошові та маржинальні цілі зроблять цю пропозицію життєздатною?", clientRequestId: "finance-routing-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.match(calls[0].assignment, /Finance Consultant/u);
  assert.match(calls[1].assignment, /^You are the Finance Consultant/u);
  assert.match(calls[2].assignment, /Finance Consultant directly/u);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [
    ["owner", null],
    ["Head Consultant", "Finance Consultant"],
    ["Finance Consultant", "Critic"],
    ["Critic", "Finance Consultant"],
    ["Finance Consultant", "Head Consultant"],
    ["Head Consultant", null]
  ]);
});

test("a resumed consultation continues after its last confirmed message", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "resume-routing-0001" }, defaultSettings);
  await store.appendAgentMessage(conversation.id, accepted.run.generation, { role: "Head Consultant", recipient: "Strategy Consultant", body: "Test the commercial premise.", sources: [] });
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.resume();
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 4);
  assert.match(calls[0].assignment, /^You are the Strategy Consultant/u);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [
    ["owner", null],
    ["Head Consultant", "Strategy Consultant"],
    ["Strategy Consultant", "Critic"],
    ["Critic", "Strategy Consultant"],
    ["Strategy Consultant", "Head Consultant"],
    ["Head Consultant", null]
  ]);
});

test("Continue resumes at the next uncommitted turn after Stop", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "continue-routing-0001" }, defaultSettings);
  await store.appendAgentMessage(conversation.id, accepted.run.generation, { role: "Head Consultant", recipient: "Strategy Consultant", body: "Test the commercial premise.", sources: [] });
  await store.stop(conversation.id);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: "A qualified answer.", sources: [] }; } };
  const service = createConsultationService({ store, provider });
  assert.ok(await service.continue(conversation.id));
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 4);
  assert.match(calls[0].assignment, /^You are the Strategy Consultant/u);
});

test("a late stopped run cannot unregister the newer run controller", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we change the offer?", clientRequestId: "controller-replacement-0001" }, defaultSettings);
  const calls = []; const deferred = [];
  const provider = {
    invoke(input) {
      calls.push(input);
      return new Promise(resolve => deferred.push(resolve));
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(() => calls.length === 1);
  await service.stop(conversation.id);
  assert.equal((await store.run(conversation.id))?.status, "stopped");
  const resumed = await service.continue(conversation.id);
  assert.ok(resumed);
  await waitFor(() => calls.length === 2);
  deferred[0]({ ok: false, code: "cancelled" });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls[1].signal.aborted, false);
  await service.stop(conversation.id);
  assert.equal(calls[1].signal.aborted, true);
  deferred[1]({ ok: false, code: "cancelled" });
});
