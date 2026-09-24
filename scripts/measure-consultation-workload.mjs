import { Buffer } from "node:buffer";
import { createConsultationService } from "../src/server/consultation.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { documentNames, readDocumentDefault } from "../src/server/instruction-documents.mjs";
import { readPromptDefault } from "../src/server/instruction-bootstrap.mjs";
import { createRuntimePrompts } from "../src/server/prompt-contracts.mjs";

const baseBody = "Should a fictional bakery test preorders? Compare buyer demand and capacity, give a reversible recommendation and explain what evidence would change it.";
const runtimeInstructions = await readPromptDefault();
const instructionDocuments = await Promise.all(documentNames.map(async name => ({ name, revision: 1, markdown: await readDocumentDefault(name) })));
const complete = async store => {
  for (let index = 0; index < 1000; index += 1) {
    const run = (await store.activeRuns())[0];
    if (!run) return;
    await new Promise(resolve => setTimeout(resolve, 2));
  }
  throw new Error("synthetic_measurement_timeout");
};
const syntheticReply = (input, scenario) => {
  switch (input.outputKind) {
    case "owner_deliverables": return "1. Compare demand and capacity. 2. Recommend a reversible test and evidence threshold.";
    case "auto_team": return "[TEAM: Sales Consultant, Operations Consultant]";
    case "head_task": return `Evaluate the ${input.recipient} evidence needed for the preorder pilot.`;
    case "research_query": return "[RESEARCH: NONE]";
    case "head_review": return "[REVIEW: CLOSE]";
    case "critic_final": return "The bounded pilot is adequately grounded. [CONSILIUM: REACHED]";
    case "head_plan": return JSON.stringify({ assignments: [
      { role: "Sales Consultant", guidance: "Evaluate buyer demand.", task: "Specify the buyer-demand test and decision threshold.", dependsOn: [] },
      { role: "Operations Consultant", guidance: "Evaluate delivery capacity.", task: "Specify the delivery-capacity limit and fallback.", dependsOn: [] }
    ], researchQuery: null });
    case "team_review": return JSON.stringify(scenario === "targeted_rework"
      ? { summary: "The demand threshold lacks a source.", findings: [{ assignment: 1, issue: "The buyer threshold is unsupported.", correction: "State a measurable acceptance threshold without inventing a market count." }] }
      : { summary: "Both answers support a bounded pilot.", findings: [] });
    case "specialist_reply": return "Use the measured acceptance rate of a small prospect sample; do not assume a market count.";
    case "critic_order_assessment": return JSON.stringify({ assessments: [{ orderId: input.evidence.discussion.match(/order ([A-Za-z0-9_-]{32})/u)?.[1], state: "resolved_corrected", reason: "The revised answer now uses a measured sample threshold." }] });
    case "head_final": return "Test a small preorder pilot with a buyer acceptance and delivery-capacity threshold.";
    default: return "A small pilot is reversible; record evidence, uncertainty and the decision threshold.";
  }
};
const measure = async (parallel, scenario) => {
  const store = createMemoryStore(); const conversation = await store.createConversation(); const calls = [];
  const body = scenario === "long_request" ? `${baseBody}\n${"Additional confirmed capacity constraint and requested verification. ".repeat(160)}` : baseBody;
  const snapshot = { ...defaultSettings, specialistCount: "2", discussionDepth: "1", runtimeInstructions, instructionDocuments, ...(parallel ? { contractVersion: "parallel-v1" } : {}) };
  const accepted = await store.acceptMessage(conversation.id, { body, clientRequestId: parallel ? "synthetic-parallel-case" : "synthetic-legacy-case" }, snapshot);
  const provider = { async invoke(input) { calls.push(input); return { ok: true, body: syntheticReply(input, scenario), sources: [] }; } };
  const service = createConsultationService({ store, provider });
  await service.start(conversation.id, accepted.run); await complete(store);
  const run = await store.run(conversation.id);
  if (run.status !== "complete") throw new Error(`synthetic_measurement_${parallel ? "parallel" : "legacy"}_${run.status}`);
  const promptBytes = calls.reduce((sum, input) => {
    const prompts = createRuntimePrompts(input.runtimeInstructions);
    return sum + Buffer.byteLength(`${input.assignment}\n\nOwner question:\n${input.evidence?.owner ?? ""}\n\nPrior confirmed discussion:\n${input.evidence?.discussion ?? ""}\n\n${prompts.outputContract({ outputKind: input.outputKind })} ${prompts.providerPolicy(input.research)}`, "utf8");
  }, 0);
  return { calls: calls.length, promptBytes, outputKinds: calls.map(item => item.outputKind), tokenUsage: "unavailable_in_synthetic_provider" };
};
const cases = [];
for (const scenario of ["clean", "targeted_rework", "long_request"]) {
  const legacy = await measure(false, scenario); const parallel = await measure(true, scenario);
  cases.push({ scenario, legacy, parallel, callReduction: legacy.calls - parallel.calls, promptByteReduction: legacy.promptBytes - parallel.promptBytes });
}
process.stdout.write(`${JSON.stringify({ method: "synthetic_two_consultants_fixed_one_round_same_guidance_and_settings", cases }, null, 2)}\n`);
