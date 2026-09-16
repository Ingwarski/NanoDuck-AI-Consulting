import assert from "node:assert/strict";
import test from "node:test";
import { createConsultationService } from "../src/server/consultation.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

const settings = { ...defaultSettings, specialistCount: "2", discussionDepth: "1", runtimeInstructions: testRuntimeInstructions };
const waitFor = async predicate => {
  for (let attempt = 0; attempt < 300; attempt++) {
    if (await predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error("timed_out");
};
const response = input => ({ ok: true, body: `${input.outputKind} confirmed.${["specialist_reply", "critic_final"].includes(input.outputKind) ? " [CONSILIUM: REACHED]" : ""}`, sources: [] });
const createRun = async (overrides = {}) => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should a fictional bakery test preorders?", clientRequestId: "consolidation-test-0001" }, { ...settings, ...overrides });
  return { store, id: conversation.id, run: accepted.run };
};

test("Head waits for every closing position and Critic assessment, and receives their actual messages", async () => {
  const { store, id, run } = await createRun();
  const calls = []; let releaseReview;
  const provider = { async invoke(input) {
    calls.push(input);
    if (input.outputKind === "critic_final") return new Promise(resolve => { releaseReview = () => resolve(response(input)); });
    if (input.outputKind === "head_final") {
      assert.equal(input.evidence.events.filter(event => event.recipient === "Head Consultant").length, 3);
      assert.match(input.evidence.discussion, /specialist_final confirmed/u);
      assert.match(input.evidence.discussion, /critic_final confirmed/u);
      assert.equal(input.research, false);
    }
    return response(input);
  } };
  await createConsultationService({ store, provider }).start(id, run);
  await waitFor(() => releaseReview);
  assert.equal(calls.some(call => call.outputKind === "head_final"), false);
  assert.equal((await store.run(id)).status, "active");
  releaseReview();
  await waitFor(async () => (await store.run(id)).status === "complete");
  assert.deepEqual(calls.slice(-4).map(call => call.outputKind), ["specialist_final", "specialist_final", "critic_final", "head_final"]);
  assert.match((await store.events(id)).at(-1).body, /^## Consolidated advice\n\n/u);
});

test("failure in any closing contribution prevents Head synthesis", async t => {
  for (const failedIndex of [0, 1, 2]) await t.test(`closing contribution ${failedIndex + 1}`, async () => {
    const { store, id, run } = await createRun();
    let closingIndex = 0; const calls = [];
    const provider = { async invoke(input) {
      calls.push(input.outputKind);
      if (["specialist_final", "critic_final"].includes(input.outputKind) && closingIndex++ === failedIndex) return { ok: false, code: "provider_unavailable" };
      return response(input);
    } };
    await createConsultationService({ store, provider }).start(id, run);
    await waitFor(async () => (await store.run(id)).status === "failed");
    assert.equal(calls.includes("head_final"), false);
    assert.equal((await store.events(id)).at(-1).role, "System");
  });
});

test("resume reuses every confirmed closing message, even when its agreement metadata was not saved", async t => {
  const source = await createRun();
  await createConsultationService({ store: source.store, provider: { invoke: async input => response(input) } }).start(source.id, source.run);
  await waitFor(async () => (await source.store.run(source.id)).status === "complete");
  const messages = (await source.store.events(source.id)).slice(1);
  for (const savedCount of [8, 9, 10, 11, 12]) await t.test(`${savedCount} saved contributions`, async () => {
    const { store, id, run } = await createRun();
    for (const message of messages.slice(0, savedCount)) await store.appendAgentMessage(id, run.generation, message);
    const calls = [];
    await createConsultationService({ store, provider: { async invoke(input) { calls.push(input); return response(input); } } }).resume();
    await waitFor(async () => (await store.run(id)).status === "complete");
    const saved = (await store.events(id)).slice(1);
    assert.equal(calls.length, messages.length - savedCount);
    assert.deepEqual(saved.map(({ role, recipient, body }) => ({ role, recipient, body })), messages.map(({ role, recipient, body }) => ({ role, recipient, body })));
    if (savedCount === 11) assert.match(calls.at(-1).assignment, /status is unresolved or unconfirmed/u);
  });
});

test("Auto continues after specialist agreement when the closing Critic still objects", async () => {
  const { store, id, run } = await createRun({ discussionDepth: "auto" });
  let reviews = 0;
  const provider = { async invoke(input) {
    if (input.outputKind === "critic_final") return { ok: true, body: ++reviews === 1 ? "The final positions conflict. [CONSILIUM: CONTINUE]" : "The positions now support the same test. [CONSILIUM: REACHED]", sources: [] };
    return response(input);
  } };
  await createConsultationService({ store, provider }).start(id, run);
  await waitFor(async () => (await store.run(id)).status === "complete");
  const snapshot = (await store.run(id)).snapshot;
  assert.equal(snapshot.autoDepthCompleted, 2);
  assert.equal(snapshot.consiliumReached, true);
  assert.deepEqual(snapshot.consolidationReviews, [{ reached: false }, { reached: true }]);
  assert.equal((await store.events(id)).filter(event => event.role === "Head Consultant" && !event.recipient).length, 1);
});

test("Critic disagreement stays explicit at fixed depth and at the Auto cap", async t => {
  for (const depth of ["1", "auto"]) await t.test(depth, async () => {
    const { store, id, run } = await createRun({ discussionDepth: depth });
    const calls = [];
    const provider = { async invoke(input) {
      calls.push(input);
      if (input.outputKind === "critic_final") return { ok: true, body: "The final positions still conflict. [CONSILIUM: CONTINUE]", sources: [] };
      if (input.outputKind === "head_final") {
        assert.match(input.assignment, /status is unresolved or unconfirmed/u);
        assert.match(input.assignment, /explicitly call the advice provisional/u);
        return { ok: true, body: "Provisional advice: a conflict remains and needs more evidence.", sources: [] };
      }
      return response(input);
    } };
    await createConsultationService({ store, provider }).start(id, run);
    await waitFor(async () => (await store.run(id)).status === "complete");
    assert.equal((await store.run(id)).snapshot.consiliumReached, false);
    assert.equal(calls.filter(call => call.outputKind === "critic_challenge").length, depth === "auto" ? 20 : 2);
    assert.match((await store.events(id)).at(-1).body, /^## Consolidated advice\n\nProvisional advice/u);
    assert.equal((await store.events(id)).some(event => event.role === "Critic" && event.body.includes("[CONSILIUM:")), false);
  });
});

test("an old premature Head answer cannot substitute for the missing closing review", async () => {
  const { store, id, run } = await createRun();
  const roles = [["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"], ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"], ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"], ["Critic", "Finance Consultant"], ["Finance Consultant", "Critic"], ["Head Consultant", null]];
  for (const [role, recipient] of roles) await store.appendAgentMessage(id, run.generation, { role, recipient, body: "Legacy contribution.", sources: [] });
  let calls = 0;
  await createConsultationService({ store, provider: { async invoke(input) { calls++; return response(input); } } }).resume();
  await waitFor(async () => (await store.run(id)).status === "failed");
  assert.equal(calls, 0);
});

test("Auto restart with a saved closing review but missing agreement continues without replay", async () => {
  const { store, id, run } = await createRun({ discussionDepth: "auto", criticReview: { agreements: [true, true] } });
  const roles = [["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"], ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"], ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"], ["Critic", "Finance Consultant"], ["Finance Consultant", "Critic"], ["Strategy Consultant", "Head Consultant"], ["Finance Consultant", "Head Consultant"], ["Critic", "Head Consultant"]];
  for (const [role, recipient] of roles) await store.appendAgentMessage(id, run.generation, { role, recipient, body: "Confirmed before restart.", sources: [] });
  const calls = [];
  await createConsultationService({ store, provider: { async invoke(input) { calls.push(input); return response(input); } } }).resume();
  await waitFor(async () => (await store.run(id)).status === "complete");
  assert.equal(calls[0].outputKind, "critic_challenge");
  assert.equal((await store.run(id)).snapshot.autoDepthCompleted, 2);
  assert.equal((await store.events(id)).filter(event => event.body === "Confirmed before restart.").length, 11);
  assert.equal(calls.filter(call => call.outputKind === "specialist_final").length, 2);
});
