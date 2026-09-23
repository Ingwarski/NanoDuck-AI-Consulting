import { containsSecretLikeContent } from "./content-policy.mjs";
import { createRuntimePrompts, parseRuntimeInstructions, runtimeInstructionsFor } from "./prompt-contracts.mjs";
import { deriveConversationTitle } from "./conversation-title.mjs";
import { containsInternalToolTrace } from "./output-safety.mjs";
import { hasProhibitedLanguage, hasUnsafeExternalUrl, safeExternalUrl } from "./validation.mjs";
import { readFileSync } from "node:fs";

const publicInstructions = parseRuntimeInstructions(readFileSync(new URL("../../instructions/RUNTIME_PROMPTS.md", import.meta.url), "utf8"));

const roleSettings = snapshot => Object.freeze({
  head: { provider: "codex", model: snapshot.headModel, effort: snapshot.headReasoning },
  consultant: { provider: "codex", model: snapshot.headModel, effort: snapshot.headReasoning },
  critic: snapshot.criticProvider === "claude_code"
    ? { provider: "claude_code", model: snapshot.criticClaudeModel ?? snapshot.criticModel, effort: snapshot.criticClaudeReasoning ?? snapshot.criticReasoning }
    : { provider: "codex", model: snapshot.criticCodexModel ?? snapshot.criticModel, effort: snapshot.criticCodexReasoning ?? snapshot.criticReasoning }
});

const providerName = provider => provider === "claude_code" ? "Claude Code" : "Codex";
const providerFailureMessage = (code, provider) => ({
  auth_required: `The selected ${providerName(provider)} route needs its subscription sign-in renewed. Your question remains saved.`,
  quota_blocked: `The selected ${providerName(provider)} route has reached its current usage limit. Your question remains saved.`,
  incompatible: `The selected ${providerName(provider)} model and reasoning configuration is unavailable on this route. Your question remains saved.`,
  context_too_large: `The complete saved context exceeds the ${providerName(provider)} request capacity. Nothing was shortened or lost. Your question and discussion remain saved.`,
  subscription_unavailable: `The selected ${providerName(provider)} subscription is unavailable. Your question remains saved.`,
  method_unavailable: `The selected ${providerName(provider)} runtime cannot complete a required consultation step. Your question remains saved.`,
  provider_unavailable: `The selected ${providerName(provider)} route could not complete this request. Your question remains saved.`
}[code]);

const discussion = events => events.map(event => {
  const sources = (event.sources ?? []).map(source => `Source: ${source.title} — ${source.url}\nSupported claim: ${source.claim}`).join("\n");
  const attachments = (event.attachments ?? []).map(item => `Attached image: ${item.contentType}; the text-only provider route cannot examine its pixels.`).join("\n");
  return `${event.role}${event.recipient ? ` → ${event.recipient}` : ""}: ${event.body}${sources ? `\n${sources}` : ""}${attachments ? `\n${attachments}` : ""}`;
}).join("\n\n");
const responseLanguage = text => {
  if (/\b(?:answer|respond|reply|write)\s+in\s+english\b|англійськ/iu.test(text)) return "English";
  if (/\b(?:answer|respond|reply|write)\s+in\s+ukrainian\b|українськ/iu.test(text)) return "Ukrainian";
  return /[А-Яа-яІіЇїЄєҐґ]/u.test(text) ? "Ukrainian" : "English";
};
const consolidatedOutput = body => {
  const heading = "## Consolidated advice\n\n";
  const text = body.replace(/^\s*(?:#{1,6}\s*|\*\*)?Consolidated advice(?:\*\*)?\s*:?\s*\n+/iu, "");
  if (!text.trim()) throw new Error("provider_contract");
  return Object.freeze({ body: heading + text.trim() });
};
const policyCorrection = assignment => `${assignment}\n\nA prior draft was withheld before it reached the consultation because it did not meet the language-and-source policy. Return a complete replacement now. Use only English or Ukrainian. Do not use Russian or Belarusian language, terms, sources, or URLs, including .ru, .by, .su or their Cyrillic equivalents. Remove any disallowed citation rather than mentioning it. Do not explain this correction.`;
const specialistRoles = Object.freeze(["Strategy Consultant", "Finance Consultant", "Operations Consultant", "Entrepreneurship Consultant", "Sales Consultant", "Marketing Consultant", "Product Consultant", "Data Consultant", "Risk Consultant", "Spiritual Consultant", "Psychotherapist"]);
const legacySpecialistCount = speed => ({ fast: "1", balanced: "2", thorough: "3", ultra: "5" })[speed] ?? "2";
const normalizedSnapshot = snapshot => Object.freeze({
  ...snapshot,
  criticProvider: snapshot.criticProvider ?? "codex",
  criticCodexModel: snapshot.criticCodexModel ?? snapshot.criticModel,
  criticCodexReasoning: snapshot.criticCodexReasoning ?? snapshot.criticReasoning,
  criticClaudeModel: snapshot.criticClaudeModel,
  criticClaudeReasoning: snapshot.criticClaudeReasoning,
  specialistCount: snapshot.specialistCount ?? legacySpecialistCount(snapshot.speed),
  discussionDepth: snapshot.discussionDepth ?? "1"
});
const teamFrom = (body, count) => {
  const match = /^\s*\[TEAM:\s*([^\]\n]+)\]\s*$/iu.exec(body);
  const roles = match?.[1].split(",").map(role => role.trim());
  if (!roles || roles.length < 1 || roles.length > 5 || (count && roles.length !== count) || new Set(roles).size !== roles.length || roles.some(role => !specialistRoles.includes(role))) throw new Error("provider_contract");
  return roles;
};
const reviewDecision = body => {
  const match = /^\s*\[REVIEW:\s*(CONTINUE|CLOSE)\]\s*$/iu.exec(body);
  if (!match) throw new Error("provider_contract");
  return match[1].toUpperCase();
};
const publicQuery = body => {
  if (typeof body !== "string" || !body.trim() || hasProhibitedLanguage(body) || hasUnsafeExternalUrl(body) || containsSecretLikeContent(body)) return undefined;
  let unsafeUrl = false;
  const withoutPublicUrls = body.replace(/https:\/\/[^\s)]+/gu, value => {
    const url = safeExternalUrl(value);
    if (!url || new URL(url).search || new URL(url).hash) unsafeUrl = true;
    return "[public page]";
  });
  if (unsafeUrl || /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu.test(withoutPublicUrls) || /(?:\+?\d[\d\s().-]{7,}\d)/u.test(withoutPublicUrls)) return undefined;
  return body.trim();
};
const consensusMarker = body => {
  const match = /\s*\[CONSILIUM:\s*(REACHED|CONTINUE)\]\s*$/iu.exec(body);
  return Object.freeze({ reached: match?.[1].toUpperCase() === "REACHED", body: body.replace(/\s*\[CONSILIUM:\s*(?:REACHED|CONTINUE)\]\s*$/iu, "").trim() });
};
const matches = (event, step) => event?.role === step.role && (event.recipient ?? null) === (step.recipient ?? null);

export function createConsultationService({ store, provider }) {
  const controllers = new Map();
  const executions = new Map();
  let closing = false;
  const run = async (conversationId, runState) => {
    const controller = new AbortController(); controllers.set(conversationId, controller);
    const current = () => store.events(conversationId).then(events => {
      // Recovery notices stay in the saved transcript, but never count as a
      // completed consultant step or become evidence on a resumed attempt.
      const confirmed = events.filter(event => event.role !== "System");
      const ownerMessages = confirmed.filter(event => event.role === "owner");
      const researchEntries = [...new Map([snapshot?.publicResearch, ...(snapshot?.followupResearch ?? [])].filter(item => item?.query).map(item => [item.query, item])).values()];
      const researchContext = researchEntries.map(item => `Public research query: ${item.query}\n${item.body}\n${item.sources.map(source => `${source.title}: ${source.url}\nSupported claim: ${source.claim}`).join("\n\n")}`).join("\n\n");
      return { events: confirmed, owner: ownerMessages.map(event => event.body).join("\n\n"), sessionLanguage: responseLanguage(ownerMessages[0]?.body ?? ""), discussion: `${discussion(confirmed)}${snapshot?.ownerDeliverables ? `\n\nHead's requested-output ledger:\n${snapshot.ownerDeliverables}` : ""}${researchContext ? `\n\n${researchContext}` : ""}${snapshot?.researchUnavailable ? "\n\nPublic research was unavailable because no safe public query could be formed; do not claim it was performed." : ""}` };
    });
    const isCurrent = async () => {
      const stored = await store.run(conversationId);
      return stored?.status === "active" && stored.generation === runState.generation;
    };
    let snapshot = normalizedSnapshot(runState.snapshot);
    let failedProvider = "codex";
    const persistSnapshot = async patch => {
      snapshot = Object.freeze({ ...snapshot, ...patch });
      if (!await store.updateRunSnapshot(conversationId, runState.generation, snapshot)) throw new Error("invalid_run_state");
    };
    const invokeProvider = async step => {
      const evidence = await current();
      const input = { provider: step.provider, role: step.role, recipient: step.recipient, assignment: step.assignment, model: step.model, effort: step.effort, evidence, research: step.provider !== "claude_code" && step.research, outputKind: step.outputKind, runtimeInstructions: step.runtimeInstructions, signal: controller.signal };
      failedProvider = input.provider ?? "codex";
      let result = await provider.invoke(input);
      if (!result.ok && (result.code === "language_policy" || result.code === "output_policy") && await isCurrent()) result = await provider.invoke({ ...input, assignment: policyCorrection(step.assignment), evidence: await current() });
      return result;
    };
    const invoke = async (step, transform = undefined) => {
      if (!await isCurrent()) return undefined;
      const result = await invokeProvider(step);
      if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
      if (containsInternalToolTrace(result.body)) throw new Error("provider_contract");
      const output = (transform ?? (body => ({ body })))(result.body);
      if (!output?.body) throw new Error("provider_contract");
      const committed = await store.appendAgentMessage(conversationId, runState.generation, { role: step.role, recipient: step.recipient, body: output.body, sources: output.sources ?? result.sources });
      if (!committed) throw new Error("invalid_run_state");
      return output;
    };
    try {
      if (!await isCurrent()) return;
      const first = await current();
      const settings = roleSettings(snapshot); const instructions = Object.freeze({ ...runtimeInstructionsFor(snapshot), documents: snapshot.instructionDocuments ?? [] }); const prompts = createRuntimePrompts(instructions); const language = first.sessionLanguage;
      const ownerIndex = first.events.map(event => event.role).lastIndexOf("owner");
      if (ownerIndex < 0) throw new Error("invalid_run_state");
      let confirmed = first.events.slice(ownerIndex + 1);
      if (!snapshot.ownerDeliverables) {
        const ledger = await invokeProvider({ provider: settings.head.provider, model: settings.head.model, effort: settings.head.effort, research: false, outputKind: "owner_deliverables", runtimeInstructions: instructions, assignment: "You are Head Consultant. Read every owner message and correction in order. List each distinct requested deliverable and its acceptance condition as a numbered checklist, retaining the owner's concrete details. Include requested source links or factual verification. Do not answer the request yet. Do not invent requirements." });
        if (!ledger.ok) throw new Error(ledger.code ?? "provider_unavailable");
        if (containsInternalToolTrace(ledger.body)) throw new Error("provider_contract");
        await persistSnapshot({ ownerDeliverables: ledger.body });
      }
      const committedTaskRoles = [];
      for (const event of confirmed) {
        if (event.role !== "Head Consultant" || !specialistRoles.includes(event.recipient)) break;
        committedTaskRoles.push(event.recipient);
      }
      const savedCount = snapshot.specialistCount === "auto" ? snapshot.resolvedSpecialistCount : Number(snapshot.specialistCount);
      if (new Set(committedTaskRoles).size !== committedTaskRoles.length || committedTaskRoles.length > 5 || (savedCount && committedTaskRoles.length > savedCount)) throw new Error("invalid_run_state");
      const selectTeam = async prefix => {
        if (!await isCurrent()) return undefined;
        const result = await provider.invoke({
          provider: settings.head.provider,
          assignment: `${prompts.autoTeam({ candidates: specialistRoles, language, count: snapshot.specialistCount })}${prefix.length ? `\nResume the already confirmed roster prefix exactly in this order: ${prefix.join(", ")}. Select only the remaining roles; do not repeat or replace a committed task.` : ""}`,
          model: settings.head.model,
          effort: settings.head.effort,
          evidence: await current(),
          research: false,
          outputKind: "auto_team",
          runtimeInstructions: instructions,
          signal: controller.signal
        });
        failedProvider = settings.head.provider;
        if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
        const roles = teamFrom(result.body, savedCount);
        if (prefix.some((role, index) => roles[index] !== role)) throw new Error("invalid_run_state");
        return roles;
      };
      let team = snapshot.resolvedTeam;
      if (!team) {
        team = savedCount && committedTaskRoles.length === savedCount ? committedTaskRoles : await selectTeam(committedTaskRoles);
        if (!team) return;
        await persistSnapshot({ resolvedTeam: team, resolvedSpecialistCount: team.length });
      }
      const researchStep = async (followupRound = undefined) => {
        const queryResult = await invokeProvider({ provider: settings.head.provider, model: settings.head.model, effort: settings.head.effort, research: false, outputKind: "research_query", runtimeInstructions: instructions, assignment: `You are Head Consultant. ${followupRound === undefined ? "Decide whether the owner's requested outputs require current public facts or direct external sources." : "Review the Critic's specific evidence gap after this team round and decide whether a new public source is needed for the next review."} If not, return [RESEARCH: NONE]. Otherwise return only a minimal English or Ukrainian public web query that can find the needed source. Do not include private contacts, personal identifiers, credentials, private business details or the full owner request. Public article URLs without query parameters may be included.` });
        if (!queryResult.ok) throw new Error(queryResult.code ?? "provider_unavailable");
        if (containsInternalToolTrace(queryResult.body)) throw new Error("provider_contract");
        const query = queryResult.body.trim() === "[RESEARCH: NONE]" ? undefined : publicQuery(queryResult.body);
        let item = { status: queryResult.body.trim() === "[RESEARCH: NONE]" ? "none" : "unsafe" };
        if (query) {
          const prior = [snapshot.publicResearch, ...(snapshot.followupResearch ?? [])].find(entry => entry?.query === query);
          if (prior) item = prior;
          else {
            const publicResult = await provider.invoke({ provider: settings.head.provider, model: settings.head.model, effort: settings.head.effort, research: true, outputKind: "public_research", runtimeInstructions: publicInstructions, assignment: "Research this public topic using live web search. Report concrete findings with direct source URLs and dates when available. If you cannot verify a claim, say so. Do not infer private owner context.", evidence: { owner: query, discussion: "" }, signal: controller.signal });
            if (!publicResult.ok) throw new Error(publicResult.code ?? "provider_unavailable");
            if (containsInternalToolTrace(publicResult.body)) throw new Error("provider_contract");
            item = { query, body: publicResult.body, sources: publicResult.sources ?? [] };
          }
        }
        if (followupRound === undefined) await persistSnapshot({ researchAttempted: true, ...(item.query ? { publicResearch: item } : { researchUnavailable: item.status === "unsafe" }) });
        else {
          const followupResearch = [...(snapshot.followupResearch ?? [])];
          followupResearch[followupRound - 1] = item;
          await persistSnapshot({ followupResearch, researchUnavailable: snapshot.researchUnavailable || item.status === "unsafe" });
        }
      };
      if (!snapshot.researchAttempted) await researchStep();
      const headTasks = team.map(specialist => ({
          role: "Head Consultant",
          recipient: specialist,
          provider: settings.head.provider,
          model: settings.head.model,
          effort: settings.head.effort,
          research: false,
          outputKind: "head_task",
          runtimeInstructions: instructions,
          assignment: prompts.headTask({ specialist, caseAnchor: "the complete owner request above", caseDetail: "every requested output and correction", language })
        }));
      for (let index = 0; index < headTasks.length; index += 1) {
        const existing = confirmed[index];
        if (existing) { if (!matches(existing, headTasks[index])) throw new Error("invalid_run_state"); }
        else await invoke(headTasks[index], body => ({ body, ...(index === 0 && snapshot.publicResearch?.sources?.length ? { sources: snapshot.publicResearch.sources } : {}) }));
      }
      confirmed = (await current()).events.slice(ownerIndex + 1);
      const positions = team.map((specialist, index) => {
        const assignedTask = confirmed[index]?.body;
        if (!assignedTask) throw new Error("invalid_run_state");
        return {
          role: specialist,
          recipient: "Critic",
          provider: settings.consultant.provider,
          model: settings.consultant.model,
          effort: settings.consultant.effort,
          research: false,
          outputKind: "specialist_position",
          runtimeInstructions: instructions,
          assignment: prompts.specialistPosition({ specialist, assignedBrief: assignedTask, language })
        };
      });
      const initial = [...headTasks, ...positions];
      for (let index = 0; index < positions.length; index += 1) {
        const positionIndex = headTasks.length + index;
        const existing = confirmed[positionIndex];
        if (existing) { if (!matches(existing, positions[index])) throw new Error("invalid_run_state"); }
        else await invoke(positions[index]);
      }
      confirmed = (await current()).events.slice(ownerIndex + 1);
      let cursor = initial.length;
      const maximumDepth = snapshot.discussionDepth === "auto" ? 10 : Number(snapshot.discussionDepth);
      let reviewStatus = "unconfirmed";
      for (let exchange = 1; exchange <= maximumDepth; exchange += 1) {
        for (const [specialistIndex, specialist] of team.entries()) {
          if (!await isCurrent()) return;
          const challenge = { role: "Critic", recipient: specialist, provider: settings.critic.provider, model: settings.critic.model, effort: settings.critic.effort, research: false, outputKind: "critic_challenge", runtimeInstructions: instructions, assignment: prompts.criticChallenge({ specialist, exchange, language }) };
          const reply = { role: specialist, recipient: "Critic", provider: settings.consultant.provider, model: settings.consultant.model, effort: settings.consultant.effort, research: false, outputKind: "specialist_reply", runtimeInstructions: instructions, assignment: prompts.specialistReply({ specialist, language }) };
          const existingChallenge = confirmed[cursor];
          if (existingChallenge) { if (!matches(existingChallenge, challenge)) throw new Error("invalid_run_state"); }
          else await invoke(challenge, body => ({ body, ...(specialistIndex === 0 && exchange > 1 && snapshot.followupResearch?.[exchange - 2]?.sources?.length ? { sources: snapshot.followupResearch[exchange - 2].sources } : {}) }));
          cursor += 1;
          const existingReply = confirmed[cursor];
          if (existingReply) { if (!matches(existingReply, reply)) throw new Error("invalid_run_state"); }
          else await invoke(reply);
          cursor += 1;
        }
        confirmed = (await current()).events.slice(ownerIndex + 1);
        const closingStarted = confirmed[cursor]?.recipient === "Head Consultant";
        let decision = snapshot.headReviewDecisions?.[exchange - 1];
        const nextRoundStarted = confirmed[cursor]?.role === "Critic" && team.includes(confirmed[cursor]?.recipient);
        if (!decision && nextRoundStarted) decision = "CONTINUE";
        if (!decision && !closingStarted) {
          if (!await isCurrent()) return;
          const result = await invokeProvider({ provider: settings.head.provider, model: settings.head.model, effort: settings.head.effort, research: false, outputKind: "head_review", runtimeInstructions: instructions, assignment: prompts.headReview({ exchange, maximumDepth, language }) });
          if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
          if (containsInternalToolTrace(result.body)) throw new Error("provider_contract");
          decision = reviewDecision(result.body);
          const decisions = [...(snapshot.headReviewDecisions ?? [])];
          decisions[exchange - 1] = decision;
          await persistSnapshot({ headReviewDecisions: decisions, autoDepthCompleted: exchange });
        }
        if (decision === "CONTINUE" && exchange < maximumDepth && !closingStarted) {
          if (!nextRoundStarted && !snapshot.followupResearch?.[exchange - 1]) await researchStep(exchange);
          continue;
        }
        {
          const closingSteps = [
            ...team.map(specialist => ({ role: specialist, recipient: "Head Consultant", provider: settings.consultant.provider, model: settings.consultant.model, effort: settings.consultant.effort, research: false, outputKind: "specialist_final", runtimeInstructions: instructions, assignment: prompts.specialistFinal({ specialist, language }) })),
            { role: "Critic", recipient: "Head Consultant", provider: settings.critic.provider, model: settings.critic.model, effort: settings.critic.effort, research: false, outputKind: "critic_final", runtimeInstructions: instructions, assignment: prompts.criticFinal(language) }
          ];
          for (const step of closingSteps) {
            if (!await isCurrent()) return;
            const existing = confirmed[cursor];
            if (existing) { if (!matches(existing, step)) throw new Error("invalid_run_state"); }
            else {
              const output = await invoke(step, step.outputKind === "critic_final" ? body => {
                const marked = consensusMarker(body);
                return Object.freeze({ ...marked, body: marked.body });
              } : undefined);
              if (step.outputKind === "critic_final") {
                await persistSnapshot({ closingReviewReached: output.reached });
              }
            }
            cursor += 1;
          }
          const reached = snapshot.closingReviewReached === true;
          reviewStatus = reached ? "supported by the specialists and Critic" : "unresolved or unconfirmed";
          await persistSnapshot({ consiliumReached: reached });
          break;
        }
      }
      if (!await isCurrent()) return;
      confirmed = (await current()).events.slice(ownerIndex + 1);
      if (confirmed.length < cursor) throw new Error("invalid_run_state");
      const conclusion = { role: "Head Consultant", recipient: null, provider: settings.head.provider, model: settings.head.model, effort: settings.head.effort, research: false, outputKind: "head_final", runtimeInstructions: instructions, assignment: prompts.conclusion(language, reviewStatus) };
      if (confirmed[cursor]) {
        if (!matches(confirmed[cursor], conclusion) || confirmed.length !== cursor + 1) throw new Error("invalid_run_state");
      } else await invoke(conclusion, consolidatedOutput);
      await store.finishRun(conversationId, runState.generation, "complete", deriveConversationTitle(first.owner));
    } catch (error) {
      if (!controller.signal.aborted) {
        const body = providerFailureMessage(error.message, failedProvider) ?? (["language_policy", "output_policy"].includes(error.message) ? "This agent returned no usable answer after disallowed content was withheld and one correction attempt. Your question is saved; Retry resumes this step." : "The consultation paused before a confirmed response. Your saved discussion remains available.");
        await store.appendAgentMessage(conversationId, runState.generation, { role: "System", body, sources: [] });
        await store.finishRun(conversationId, runState.generation, "failed");
      }
    } finally { if (controllers.get(conversationId) === controller) controllers.delete(conversationId); }
  };
  return Object.freeze({
    async start(conversationId, runState) {
      if (closing || executions.has(conversationId)) return;
      const completion = run(conversationId, runState).catch(() => {}).finally(() => executions.delete(conversationId));
      executions.set(conversationId, completion);
    },
    async stop(conversationId) {
      const stopped = await store.stop(conversationId);
      controllers.get(conversationId)?.abort();
      await executions.get(conversationId);
      return stopped;
    },
    async continue(conversationId) {
      if (closing || executions.has(conversationId)) return undefined;
      const runState = await store.continueRun(conversationId);
      if (runState) await this.start(conversationId, runState);
      return runState;
    },
    async resume() {
      // A lost process cannot prove whether a provider call completed. Fence it
      // and require the owner's Continue action instead of spending again.
      for (const runState of await store.activeRuns()) {
        await store.stop(runState.conversationId);
      }
    },
    async close() {
      closing = true;
      for (const controller of controllers.values()) controller.abort();
      await Promise.allSettled([...executions.keys()].map(id => store.stop(id)));
      await Promise.allSettled([...executions.values()]);
    }
  });
}
