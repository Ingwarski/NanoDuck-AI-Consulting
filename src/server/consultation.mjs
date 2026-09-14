const roleSettings = snapshot => Object.freeze({
  head: { model: snapshot.headModel, effort: snapshot.headReasoning },
  consultant: { model: snapshot.headModel, effort: snapshot.headReasoning },
  critic: { model: snapshot.criticModel, effort: snapshot.criticReasoning }
});

const hasSensitiveResearchContext = text => /(?:\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:password|passcode|api[ _-]?key|secret|access[ _-]?token|iban|credit[ _-]?card|passport|medical)\b|(?:\+?\d[\d\s().-]{7,}\d)|\b(?:парол\p{L}*|ключ\p{L}*\s*api|секрет\p{L}*|токен\p{L}*|iban|картк\p{L}*|паспорт\p{L}*|медич\p{L}*)\b)/iu.test(text);
const discussion = events => events.map(event => `${event.role}${event.recipient ? ` → ${event.recipient}` : ""}: ${event.body}`).join("\n\n").slice(-80_000);
const needsDiscussion = text => {
  const question = text.trim();
  const directQuestion = /^(?:what is|define|explain|поясни|що таке|визнач)/iu.test(question);
  const explicitDiscussion = /\b(?:critic|consultant team|consulting team|positioning|this offer|decision|strategy|proposal)\b|критик|консиліум|команд.{0,8}консульт|позиціонув|пропозиці|рішенн|стратег/iu.test(question);
  return !directQuestion || explicitDiscussion;
};
const responseLength = "Keep this message focused on the point that can change the decision. Use only the reasoning, evidence limits and tradeoffs needed to make that point clear.";
const responseLanguage = text => {
  if (/\b(?:answer|respond|reply|write)\s+in\s+english\b|англійськ/iu.test(text)) return "English";
  if (/\b(?:answer|respond|reply|write)\s+in\s+ukrainian\b|українськ/iu.test(text)) return "Ukrainian";
  return /[А-Яа-яІіЇїЄєҐґ]/u.test(text) ? "Ukrainian" : "English";
};
const headTaskFallbacks = Object.freeze({
  English: Object.freeze({
    "Strategy Consultant": "Define the decision options, decisive evidence, and the next test that can change the direction.",
    "Finance Consultant": "Quantify the financial threshold, primary cost or margin risk, and the next calculation that can change this decision.",
    "Operations Consultant": "Map the operational constraint, delivery risk, and the next practical test for this decision.",
    "Sales Consultant": "Assess buyer evidence, the material sales risk, and the next customer test that can change this decision.",
    "Marketing Consultant": "Assess audience evidence, the material demand risk, and the next market test that can change this decision.",
    "Product Consultant": "Assess user value, the material product risk, and the next validation test that can change this decision.",
    "Spiritual Consultant": "Assess the question through the stated doctrine and identify the material spiritual consideration and needed evidence.",
    Psychotherapist: "Assess the question through an appropriate non-clinical approach and identify the material pattern and next grounded step.",
    "Risk Consultant": "Identify the decision-critical risk, the evidence needed to assess it, and the next mitigating test."
  }),
  Ukrainian: Object.freeze({
    "Strategy Consultant": "Визнач варіанти рішення, вирішальні докази та наступну перевірку, що може змінити напрям.",
    "Finance Consultant": "Визнач фінансовий поріг, ключовий ризик витрат або маржі та наступний розрахунок, що може змінити рішення.",
    "Operations Consultant": "Визнач операційне обмеження, ризик виконання та наступну практичну перевірку для цього рішення.",
    "Sales Consultant": "Оціни докази попиту покупців, суттєвий ризик продажу та наступну перевірку з клієнтами.",
    "Marketing Consultant": "Оціни докази щодо аудиторії, суттєвий ризик попиту та наступну перевірку ринку.",
    "Product Consultant": "Оціни цінність для користувача, суттєвий продуктовий ризик та наступну перевірку гіпотези.",
    "Spiritual Consultant": "Оціни питання крізь призму вказаного вчення та назви суттєвий духовний аспект і потрібні докази.",
    Psychotherapist: "Оціни питання через доречний неклінічний підхід та назви суттєвий патерн і наступний обґрунтований крок.",
    "Risk Consultant": "Визнач критичний ризик рішення, докази для його оцінки та наступну перевірку пом’якшення."
  })
});
const headTaskFallback = (specialist, language) => headTaskFallbacks[language]?.[specialist] ?? headTaskFallbacks.English["Strategy Consultant"];
const headTaskOutput = body => {
  const match = /^\s*<nanoduck-task>\s*([\s\S]*?)\s*<\/nanoduck-task>\s*$/iu.exec(body);
  if (!match) return undefined;
  const task = match[1].replace(/\s+/gu, " ").trim();
  const imperative = /^(?:Assess|Analyze|Analyse|Evaluate|Define|Map|Quantify|Test|Identify|Compare|Review|Examine|Clarify|Estimate|Check|Determine|Проаналізуй|Оціни|Визнач|Перевір|Зістав|Уточни|Порахуй|Вияви|Сформулюй|Досліди|Окресли|З’ясуй|З'ясуй)(?![\p{L}])/iu;
  const ownerFacing = /(?:\b(?:i|we|owner|user|recommend(?:ation)?|conclusion)\b|власник|користувач|рекоменд\p{L}*|виснов\p{L}*)/iu;
  const sentences = task.split(/[.!?]+/u).filter(Boolean);
  return task.length <= 420 && sentences.length <= 2 && imperative.test(task) && !ownerFacing.test(task) ? Object.freeze({ body: task }) : undefined;
};
const roleGuidance = Object.freeze({
  "Spiritual Consultant": "Work from evangelical Protestant doctrine: Jesus Christ is Lord and Saviour; His finished work is sufficient; salvation is by faith alone and cannot be lost. Do not introduce esoteric, occult, syncretic, manifestation or therapeutic claims.",
  Psychotherapist: "Use methods from the major classical psychotherapy schools and Internal Family Systems when appropriate. Do not claim human credentials, diagnose, replace clinical care, or handle an emergency without directing the owner to immediate local help."
});
const guidanceFor = role => roleGuidance[role] ? ` ${roleGuidance[role]}` : "";
const specialistFor = text => {
  const subject = text.toLocaleLowerCase();
  const matches = pattern => pattern.test(subject);
  if (matches(/\b(risk|legal|compliance|threat)\b|ризик|юрид|відповідн|загроз/iu)) return "Risk Consultant";
  if (matches(/\b(cash|margin|profit|revenue|budget|cost|pricing)\b|грош|марж|прибут|дохід|бюджет|витрат|ціноутвор/iu)) return "Finance Consultant";
  if (matches(/\b(process|operations|delivery|capacity|workflow)\b|процес|операц|постач|потужн|навантаж/iu)) return "Operations Consultant";
  if (matches(/\b(sales|pipeline|prospect|conversion|b2b|b2c)\b|продаж|лійк|потенційн.{0,8}клієнт|конверс/iu)) return "Sales Consultant";
  if (matches(/\b(marketing|campaign|audience|traffic|brand|advertising)\b|маркетинг|кампан|аудитор|трафік|бренд|реклам/iu)) return "Marketing Consultant";
  if (matches(/\b(product|feature|roadmap|retention|user experience)\b|продукт|функц|роудмап|утриман|досвід користувач/iu)) return "Product Consultant";
  if (matches(/\b(spiritual|faith|christ|christian|gospel|church|salvation|prayer|scripture|bible)\b|духов|віра|христ|євангел|спасін|молит|біблі/iu)) return "Spiritual Consultant";
  if (matches(/\b(psychotherapy|psychotherapist|therapy|therapist|mental health|trauma|ifs|internal family systems|anxiety|depression|relationship)\b|психотерап|психолог|терапі|менталь|травм|тривог|депрес|внутрішн.{0,8}сімейн|стосунк/iu)) return "Psychotherapist";
  return "Strategy Consultant";
};
const specialistCandidates = text => {
  const primary = specialistFor(text);
  const complements = {
    "Strategy Consultant": ["Finance Consultant", "Operations Consultant", "Product Consultant", "Risk Consultant"],
    "Finance Consultant": ["Strategy Consultant", "Risk Consultant", "Sales Consultant", "Operations Consultant"],
    "Operations Consultant": ["Strategy Consultant", "Product Consultant", "Finance Consultant", "Risk Consultant"],
    "Sales Consultant": ["Marketing Consultant", "Finance Consultant", "Strategy Consultant", "Product Consultant"],
    "Marketing Consultant": ["Product Consultant", "Sales Consultant", "Strategy Consultant", "Finance Consultant"],
    "Product Consultant": ["Marketing Consultant", "Operations Consultant", "Strategy Consultant", "Finance Consultant"],
    "Spiritual Consultant": ["Psychotherapist", "Strategy Consultant", "Risk Consultant", "Product Consultant"],
    Psychotherapist: ["Spiritual Consultant", "Strategy Consultant", "Product Consultant", "Risk Consultant"],
    "Risk Consultant": ["Strategy Consultant", "Finance Consultant", "Operations Consultant", "Product Consultant"]
  };
  return [...new Set([primary, ...(complements[primary] ?? [])])];
};
const legacySpecialistCount = speed => ({ fast: "1", balanced: "2", thorough: "3", ultra: "5" })[speed] ?? "2";
const normalizedSnapshot = snapshot => Object.freeze({
  ...snapshot,
  specialistCount: snapshot.specialistCount ?? legacySpecialistCount(snapshot.speed),
  discussionDepth: snapshot.discussionDepth ?? "1"
});
const chosenCount = snapshot => snapshot.specialistCount === "auto" ? snapshot.resolvedSpecialistCount : Number(snapshot.specialistCount);
const teamMarker = body => {
  const match = /^\s*\[TEAM:\s*([1-5])\]\s*/iu.exec(body);
  return Object.freeze({ count: match ? Number(match[1]) : 3, body: body.replace(/^\s*\[TEAM:\s*[1-5]\]\s*/iu, "").trim() });
};
const consensusMarker = body => {
  const match = /\s*\[CONSILIUM:\s*(REACHED|CONTINUE)\]\s*$/iu.exec(body);
  return Object.freeze({ reached: match?.[1].toUpperCase() === "REACHED", body: body.replace(/\s*\[CONSILIUM:\s*(?:REACHED|CONTINUE)\]\s*$/iu, "").trim() });
};
const matches = (event, step) => event?.role === step.role && (event.recipient ?? null) === (step.recipient ?? null);

export function createConsultationService({ store, provider }) {
  const controllers = new Map();
  const run = async (conversationId, runState) => {
    const controller = new AbortController(); controllers.set(conversationId, controller);
    const current = () => store.events(conversationId).then(events => {
      const ownerMessages = events.filter(event => event.role === "owner");
      return { events, owner: ownerMessages.at(-1)?.body ?? "", sessionLanguage: responseLanguage(ownerMessages[0]?.body ?? ""), discussion: discussion(events) };
    });
    const isCurrent = async () => {
      const stored = await store.run(conversationId);
      return stored?.status === "active" && stored.generation === runState.generation;
    };
    let snapshot = normalizedSnapshot(runState.snapshot);
    const persistSnapshot = async patch => {
      snapshot = Object.freeze({ ...snapshot, ...patch });
      if (!await store.updateRunSnapshot(conversationId, runState.generation, snapshot)) throw new Error("invalid_run_state");
    };
    const invoke = async (step, transform = body => ({ body }), fallback = undefined) => {
      if (!await isCurrent()) return undefined;
      const result = await provider.invoke({ assignment: step.assignment, model: step.model, effort: step.effort, evidence: await current(), research: step.research, outputKind: step.outputKind, signal: controller.signal });
      if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
      const output = transform(result.body) ?? (fallback ? { body: fallback() } : undefined);
      if (!output?.body) throw new Error("provider_contract");
      const committed = await store.appendAgentMessage(conversationId, runState.generation, { role: step.role, recipient: step.recipient, body: output.body, sources: output.sources ?? result.sources });
      if (!committed) throw new Error("invalid_run_state");
      return output;
    };
    try {
      if (!await isCurrent()) return;
      const first = await current();
      const settings = roleSettings(snapshot); const research = !hasSensitiveResearchContext(first.owner); const language = `Write this message in ${first.sessionLanguage}.`;
      const ownerIndex = first.events.map(event => event.role).lastIndexOf("owner");
      if (ownerIndex < 0) throw new Error("invalid_run_state");
      let confirmed = first.events.slice(ownerIndex + 1);
      if (!needsDiscussion(first.owner)) {
        const direct = { role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, research, assignment: `You are the Head Consultant. Give a direct, self-contained answer to this simple question. Use a short example where it helps. Do not convene a consultant team or add process language. ${responseLength} ${language}` };
        if (confirmed.length > 1 || confirmed[0] && !matches(confirmed[0], direct)) throw new Error("invalid_run_state");
        if (!confirmed.length) await invoke(direct);
        await store.finishRun(conversationId, runState.generation, "complete");
        return;
      }

      const candidates = specialistCandidates(first.owner);
      const selectAutomaticTeam = async () => {
        if (!await isCurrent()) return undefined;
        const result = await provider.invoke({
          assignment: `You are the Head Consultant. Choose the smallest useful team size from one to five for this decision from these candidate specialists, in activation order: ${candidates.join(", ")}. Return exactly [TEAM: N] and nothing else. This is an internal routing decision; do not answer the owner, give advice or explain the choice. ${language}`,
          model: settings.head.model,
          effort: settings.head.effort,
          evidence: await current(),
          research: false,
          signal: controller.signal
        });
        if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
        return teamMarker(result.body).count;
      };
      let selected = chosenCount(snapshot);
      if (!selected) {
        const selectedByHead = await selectAutomaticTeam();
        if (!selectedByHead) return;
        selected = selectedByHead;
        await persistSnapshot({ resolvedSpecialistCount: selected });
        confirmed = (await current()).events.slice(ownerIndex + 1);
      }
      const team = candidates.slice(0, selected);
      const initial = [
        ...team.map(specialist => ({
          role: "Head Consultant",
          recipient: specialist,
          model: settings.head.model,
          effort: settings.head.effort,
          research: false,
          outputKind: "head_task",
          assignment: `You are the Head Consultant. This is a private handoff to the ${specialist}, never an answer to the owner. Return exactly one XML wrapper and nothing else: <nanoduck-task>ONE OR TWO IMPERATIVE SENTENCES</nanoduck-task>. Begin the task with a direct action verb. Inside the wrapper, give the ${specialist} a concrete role-specific investigation for this decision. Do not answer the owner, state a position, recommend an action, list assumptions, explain the team, use first person, or use words such as recommendation or conclusion. ${language}`
        })),
        ...team.map(specialist => ({
          role: specialist,
          recipient: "Critic",
          model: settings.consultant.model,
          effort: settings.consultant.effort,
          research,
          assignment: `You are the ${specialist}. Answer the Head's task with your independent position for the Critic. State only the conclusion, evidence or test that matters from your discipline, and the material uncertainty. Address the Critic directly. Do not ask another specialist to act, speak for the Head or add ceremony.${guidanceFor(specialist)} ${responseLength} ${language}`
        }))
      ];
      for (let index = 0; index < initial.length; index += 1) {
        const existing = confirmed[index];
        if (existing) { if (!matches(existing, initial[index])) throw new Error("invalid_run_state"); }
        else if (initial[index].outputKind === "head_task") await invoke(initial[index], headTaskOutput, () => headTaskFallback(initial[index].recipient, first.sessionLanguage));
        else await invoke(initial[index]);
      }
      confirmed = (await current()).events.slice(ownerIndex + 1);
      let cursor = initial.length;
      const automaticDepth = snapshot.discussionDepth === "auto";
      const maximumDepth = automaticDepth ? 10 : Number(snapshot.discussionDepth);
      let completedDepth = automaticDepth ? Number(snapshot.autoDepthCompleted ?? 0) : 0;
      let consensusReached = automaticDepth && snapshot.consiliumReached === true;
      for (let exchange = 1; exchange <= maximumDepth; exchange += 1) {
        const specialist = team[(exchange - 1) % team.length];
        const challenge = { role: "Critic", recipient: specialist, model: settings.critic.model, effort: settings.critic.effort, research, assignment: `You are the Critic. Challenge only material gaps, unsupported claims, risks or false certainty in the actual discussion. Address the ${specialist} directly and remain constructive. This is exchange ${exchange}. ${responseLength} ${language}` };
        const reply = { role: specialist, recipient: "Critic", model: settings.consultant.model, effort: settings.consultant.effort, research, assignment: `You are the ${specialist}. Respond directly to the Critic's actual concern and account for the whole discussion. Revise your position where warranted; explain a grounded disagreement where not. Do not repeat your earlier message.${guidanceFor(specialist)} ${automaticDepth ? " End with exactly [CONSILIUM: REACHED] only if the whole team and Critic now share a supported recommendation or bounded uncertainty; otherwise end with exactly [CONSILIUM: CONTINUE]." : ""} ${responseLength} ${language}` };
        const existingChallenge = confirmed[cursor];
        if (existingChallenge) { if (!matches(existingChallenge, challenge)) throw new Error("invalid_run_state"); }
        else await invoke(challenge);
        cursor += 1;
        let replyOutcome;
        const existingReply = confirmed[cursor];
        if (existingReply) { if (!matches(existingReply, reply)) throw new Error("invalid_run_state"); }
        else replyOutcome = await invoke(reply, automaticDepth ? consensusMarker : body => ({ body }));
        cursor += 1;
        if (automaticDepth) {
          if (completedDepth < exchange) {
            completedDepth = exchange;
            consensusReached = replyOutcome?.reached ?? false;
            await persistSnapshot({ autoDepthCompleted: completedDepth, consiliumReached: consensusReached });
          }
          if (consensusReached) break;
        }
      }
      confirmed = (await current()).events.slice(ownerIndex + 1);
      const conclusion = { role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, research, assignment: `You are the Head Consultant. Write the only owner-facing synthesis after the actual specialist and Critic discussion. Do not introduce a fresh position or reopen task assignment. Give a self-contained recommendation or clearly bounded uncertainty, no more than three next actions, the main risk and a revisit condition. State agreement only if the actual messages support it. ${responseLength} ${language}` };
      if (confirmed[cursor]) {
        if (!matches(confirmed[cursor], conclusion) || confirmed.length !== cursor + 1) throw new Error("invalid_run_state");
      } else await invoke(conclusion);
      await store.finishRun(conversationId, runState.generation, "complete");
    } catch (error) {
      if (!controller.signal.aborted) {
        const code = error.message === "provider_unavailable" ? "The selected Codex subscription is unavailable. Your question remains saved." : error.message === "language_policy" ? "A response did not meet the English/Ukrainian language policy. Your question remains saved." : "The consultation paused before a confirmed response. Your saved discussion remains available.";
        await store.appendAgentMessage(conversationId, runState.generation, { role: "System", body: code, sources: [] });
        await store.finishRun(conversationId, runState.generation, "failed");
      }
    } finally { if (controllers.get(conversationId) === controller) controllers.delete(conversationId); }
  };
  return Object.freeze({
    async start(conversationId, runState) { void run(conversationId, runState); },
    async stop(conversationId) { controllers.get(conversationId)?.abort(); return store.stop(conversationId); },
    async continue(conversationId) { const runState = await store.continueRun(conversationId); if (runState) await this.start(conversationId, runState); return runState; },
    async resume() { for (const runState of await store.activeRuns()) await this.start(runState.conversationId, runState); }
  });
}
