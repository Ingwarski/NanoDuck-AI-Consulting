import assert from "node:assert/strict";
import test from "node:test";
import { createConsultationService } from "../src/server/consultation.mjs";
import { createMemoryStore, defaultSettings as baseSettings } from "../src/server/store.mjs";
import { initialRuntimeInstructions } from "../src/server/prompt-contracts.mjs";

const defaultSettings = Object.freeze({ ...baseSettings, runtimeInstructions: { markdown: initialRuntimeInstructions.markdown, revision: initialRuntimeInstructions.revision } });

const waitFor = async (predicate, milliseconds = 1_000) => {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    const value = await predicate();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error("timed_out");
};

const validHeadTask = assignment => {
  const anchor = /exact case anchor: “([^”]+)”/u.exec(assignment)?.[1] ?? "decision";
  const detail = /exact decision detail: “([^”]+)”/u.exec(assignment)?.[1];
  return `<nanoduck-task>Analyze ${anchor}${detail ? ` and ${detail}` : ""} from the assigned perspective and identify the decisive evidence.</nanoduck-task>`;
};
const successfulBody = (input, body = "A qualified answer.") => input.outputKind === "head_task" ? validHeadTask(input.assignment) : body;

test("sensitive current-topic questions do not enable public web research", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "What is the current market price? Contact me at owner@example.com.", clientRequestId: "sensitive-research-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
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
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 7);
  assert.equal(calls.slice(0, 2).every(call => call.research === false), true);
  assert.equal(calls.slice(2).every(call => call.research === true), true);
});

test("a simple Ukrainian explanation receives one direct Head Consultant answer", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Що таке валова маржа?", clientRequestId: "direct-answer-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 1);
  assert.match(calls[0].assignment, /direct, self-contained answer/u);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [["owner", null], ["Head Consultant", null]]);
});

test("a fixed specialist count selects the requested team without changing the model tuple", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const snapshot = { ...defaultSettings, specialistCount: "3", discussionDepth: "1" };
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "specialist-count-0001" }, snapshot);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 9);
  assert.match(calls[0].assignment, /handoff to the Strategy Consultant/u);
  assert.equal(calls[0].outputKind, "head_task");
  assert.match(calls[5].assignment, /^You are the Operations Consultant/u);
  const events = await store.events(conversation.id);
  assert.equal(calls[3].assignment.includes(`Your assigned Head brief is exactly:\nBegin assigned brief\n${events[1].body}\nEnd assigned brief`), true);
  assert.equal(calls[4].assignment.includes(`Your assigned Head brief is exactly:\nBegin assigned brief\n${events[2].body}\nEnd assigned brief`), true);
  assert.equal(calls[5].assignment.includes(`Your assigned Head brief is exactly:\nBegin assigned brief\n${events[3].body}\nEnd assigned brief`), true);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [
    ["owner", null],
    ["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"], ["Head Consultant", "Operations Consultant"],
    ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"], ["Operations Consultant", "Critic"],
    ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"], ["Head Consultant", null]
  ]);
  assert.equal(calls.every(call => call.model === "gpt-6-astra" && call.effort === "xhigh"), true);
});

test("five specialists remain distinct from Head Consultant and Critic", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "five-specialists-000001" }, { ...defaultSettings, specialistCount: "5", discussionDepth: "1" });
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 13);
  const events = await store.events(conversation.id);
  assert.deepEqual(events.slice(1, 6).map(event => [event.role, event.recipient]), [
    ["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"], ["Head Consultant", "Operations Consultant"], ["Head Consultant", "Product Consultant"], ["Head Consultant", "Risk Consultant"]
  ]);
  assert.deepEqual(events.slice(6, 11).map(event => [event.role, event.recipient]), [
    ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"], ["Operations Consultant", "Critic"], ["Product Consultant", "Critic"], ["Risk Consultant", "Critic"]
  ]);
});

test("invalid Head tasks are retried and fall back to a case-bound specialist brief", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "head-task-guard-0001" }, { ...defaultSettings, specialistCount: "2", discussionDepth: "1" });
  const calls = [];
  const provider = {
    async invoke(input) {
      calls.push(input);
      if (input.outputKind === "head_task") return { ok: true, body: "I recommend that the owner scales the offer immediately.", sources: [] };
      return { ok: true, body: successfulBody(input), sources: [] };
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  const events = await store.events(conversation.id);
  const headTasks = events.filter(event => event.role === "Head Consultant" && event.recipient);
  assert.equal(headTasks.length, 2);
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 4);
  assert.equal(calls.filter(call => call.outputKind === "head_task").every(call => call.assignment.includes("<nanoduck-task>")), true);
  assert.equal(headTasks.every(event => event.body.includes("Should we revise the offer for next quarter")), true);
  assert.match(headTasks[0].body, /Strategy Consultant/u);
  assert.match(headTasks[1].body, /Finance Consultant/u);
  assert.equal(headTasks.every(event => event.body.startsWith("Analyze this decision as the")), true);
  assert.equal(events.at(-1).role, "Head Consultant");
  assert.equal(events.at(-1).recipient, null);
});

test("a generic BTC-only Head task retains the decision detail and recipient-specific focus", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const body = "I have $100 and its equivalent in BTC. The market is bearish and unpredictable. Should I buy more BTC, sell, or hold?";
  const accepted = await store.acceptMessage(conversation.id, { body, clientRequestId: "btc-handoff-000001" }, { ...defaultSettings, specialistCount: "2", discussionDepth: "1" });
  const calls = [];
  const provider = {
    async invoke(input) {
      calls.push(input);
      return { ok: true, body: input.outputKind === "head_task" ? "<nanoduck-task>Analyze BTC from the assigned perspective and identify the decisive evidence.</nanoduck-task>" : successfulBody(input), sources: [] };
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  const events = await store.events(conversation.id);
  const tasks = events.filter(event => event.role === "Head Consultant" && event.recipient);
  assert.equal(calls.filter(call => call.outputKind === "head_task").length, 4);
  assert.equal(tasks.every(task => task.body.includes("BTC")), true);
  assert.equal(tasks.every(task => /market|bearish|unpredictable|buy|sell|hold/u.test(task.body)), true);
  assert.match(tasks[0].body, /actual options/u);
  assert.match(tasks[1].body, /exposure, affordability or loss-limit/u);
  assert.equal(calls[4].assignment.includes(`Your assigned Head brief is exactly:\nBegin assigned brief\n${tasks[0].body}\nEnd assigned brief`), true);
  assert.equal(calls[5].assignment.includes(`Your assigned Head brief is exactly:\nBegin assigned brief\n${tasks[1].body}\nEnd assigned brief`), true);
});

test("role contributions are trimmed at complete sentences within their stated bounds", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "concise-role-bounds-0001" }, { ...defaultSettings, specialistCount: "1", discussionDepth: "1" });
  const longMessage = "This is a decision-relevant sentence. ".repeat(200);
  const provider = {
    async invoke(input) {
      if (input.outputKind === "head_task") return { ok: true, body: "<nanoduck-task>Assess the decision-critical evidence and material risk.</nanoduck-task>", sources: [] };
      return { ok: true, body: longMessage, sources: [] };
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  const events = await store.events(conversation.id);
  const bounded = events.filter(event => event.role !== "owner" && event.role !== "System");
  assert.deepEqual(bounded.map(event => [event.role, event.recipient]), [
    ["Head Consultant", "Strategy Consultant"],
    ["Strategy Consultant", "Critic"],
    ["Critic", "Strategy Consultant"],
    ["Strategy Consultant", "Critic"],
    ["Head Consultant", null]
  ]);
  assert.equal(bounded[1].body.length <= 1_400, true);
  assert.equal(bounded[2].body.length <= 1_000, true);
  assert.equal(bounded[3].body.length <= 1_200, true);
  assert.equal(bounded[4].body.length <= 2_000, true);
  assert.equal(bounded.slice(1).every(event => /[.!?]$/u.test(event.body)), true);
});

test("discussion depth performs the requested number of Critic-specialist exchanges", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "three-exchanges-000001" }, { ...defaultSettings, specialistCount: "1", discussionDepth: "3" });
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 9);
  assert.deepEqual((await store.events(conversation.id)).slice(3, -1).map(event => [event.role, event.recipient]), [
    ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"],
    ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"],
    ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"]
  ]);
});

test("Auto lets Head choose the specialist count and stops at an agreed consilium", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "automatic-consilium-0001" }, { ...defaultSettings, specialistCount: "auto", discussionDepth: "auto" });
  const calls = [];
  const provider = {
    async invoke(input) {
      calls.push(input);
      if (input.assignment.includes("Return exactly [TEAM: N]")) return { ok: true, body: "[TEAM: 4]", sources: [] };
      if (input.assignment.includes("[CONSILIUM:")) return { ok: true, body: "The constraint is resolved by testing the offer before scaling it. [CONSILIUM: REACHED]", sources: [] };
      return { ok: true, body: successfulBody(input), sources: [] };
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 12);
  assert.match(calls[0].assignment, /Return exactly \[TEAM: N\]/u);
  const run = await store.run(conversation.id);
  assert.equal(run.snapshot.resolvedSpecialistCount, 4);
  assert.equal(run.snapshot.autoDepthCompleted, 1);
  assert.equal(run.snapshot.consiliumReached, true);
  assert.equal((await store.events(conversation.id)).some(event => /\[(?:TEAM|CONSILIUM):/u.test(event.body)), false);
});

test("Auto discussion depth never performs more than ten exchanges", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "automatic-depth-cap-0001" }, { ...defaultSettings, specialistCount: "1", discussionDepth: "auto" });
  const calls = [];
  const provider = {
    async invoke(input) {
      calls.push(input);
      return { ok: true, body: input.assignment.includes("[CONSILIUM:") ? "One more material question remains. [CONSILIUM: CONTINUE]" : successfulBody(input), sources: [] };
    }
  };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 23);
  assert.equal((await store.run(conversation.id)).snapshot.autoDepthCompleted, 10);
  assert.equal((await store.run(conversation.id)).snapshot.consiliumReached, false);
});

test("a Ukrainian finance question assigns the Finance Consultant and directs the Critic reply", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Які грошові та маржинальні цілі зроблять цю пропозицію життєздатною?", clientRequestId: "finance-routing-0001" }, defaultSettings);
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.match(calls[0].assignment, /to the Finance Consultant/u);
  assert.match(calls[1].assignment, /to the Strategy Consultant/u);
  assert.match(calls[2].assignment, /^You are the Finance Consultant/u);
  assert.match(calls[3].assignment, /^You are the Strategy Consultant/u);
  assert.match(calls[4].assignment, /Finance Consultant directly/u);
  assert.equal(calls.every(call => call.assignment.includes("Write this message in Ukrainian.")), true);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [
    ["owner", null],
    ["Head Consultant", "Finance Consultant"], ["Head Consultant", "Strategy Consultant"],
    ["Finance Consultant", "Critic"], ["Strategy Consultant", "Critic"],
    ["Critic", "Finance Consultant"], ["Finance Consultant", "Critic"],
    ["Head Consultant", null]
  ]);
});

test("spiritual and psychotherapy questions use their bounded specialist roles", async () => {
  const cases = [
    ["How should I think about salvation through faith in Christ?", "Spiritual Consultant", /evangelical Protestant doctrine/u],
    ["Could IFS help me understand this recurring anxiety?", "Psychotherapist", /Internal Family Systems/u]
  ];
  for (const [body, role, guidance] of cases) {
    const store = createMemoryStore();
    const conversation = await store.createConversation();
    const accepted = await store.acceptMessage(conversation.id, { body, clientRequestId: `role-routing-${role.replaceAll(" ", "-").toLowerCase()}-0001` }, { ...defaultSettings, specialistCount: "1", discussionDepth: "1" });
    const calls = [];
    const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
    const service = createConsultationService({ store, provider });
    await service.start(conversation.id, accepted.run);
    await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
    assert.match(calls[0].assignment, new RegExp(role, "u"));
    assert.match(calls[1].assignment, guidance);
    assert.equal(calls.some(call => call.assignment.includes("Leadership Consultant")), false);
  }
});

test("the first accepted owner message keeps the consultation language for later work", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  const first = await store.acceptMessage(conversation.id, { body: "Що таке валова маржа?", clientRequestId: "language-first-0001" }, defaultSettings);
  await service.start(conversation.id, first.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  const second = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "language-next-0001" }, defaultSettings);
  await service.start(conversation.id, second.run);
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.slice(1).every(call => call.assignment.includes("Write this message in Ukrainian.")), true);
});

test("a resumed consultation continues after its last confirmed message", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, { body: "Should we revise the offer for next quarter?", clientRequestId: "resume-routing-0001" }, defaultSettings);
  await store.appendAgentMessage(conversation.id, accepted.run.generation, { role: "Head Consultant", recipient: "Strategy Consultant", body: "Test the commercial premise.", sources: [] });
  const calls = [];
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.resume();
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 6);
  assert.match(calls[0].assignment, /to the Finance Consultant/u);
  assert.deepEqual((await store.events(conversation.id)).map(event => [event.role, event.recipient]), [
    ["owner", null],
    ["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"],
    ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"],
    ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"],
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
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: successfulBody(input), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  assert.ok(await service.continue(conversation.id));
  await waitFor(async () => (await store.run(conversation.id))?.status === "complete");
  assert.equal(calls.length, 6);
  assert.match(calls[0].assignment, /to the Finance Consultant/u);
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
