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
const responseLength = "Make one decision-relevant point, the evidence or uncertainty behind it, and a concrete next test where useful. Do not give a textbook explanation, generic motivational advice, fictional numeric scenarios, invented market facts, customer behavior or sources. If essential information is absent, name the missing condition instead of making it up.";
const responseLanguage = text => {
  if (/\b(?:answer|respond|reply|write)\s+in\s+english\b|англійськ/iu.test(text)) return "English";
  if (/\b(?:answer|respond|reply|write)\s+in\s+ukrainian\b|українськ/iu.test(text)) return "Ukrainian";
  return /[А-Яа-яІіЇїЄєҐґ]/u.test(text) ? "Ukrainian" : "English";
};
const taskExcerpt = (question, maximumLength = 180) => {
  const plain = String(question ?? "").replace(/[<>]/gu, "").replace(/\s+/gu, " ").trim();
  const clipped = plain.length > maximumLength ? `${plain.slice(0, maximumLength - 1).trimEnd()}…` : plain;
  return clipped.replace(/[.!?]+$/u, "").trim() || "the stated decision";
};
const ignoredTaskTerms = new Set(["about", "after", "against", "also", "are", "been", "could", "does", "from", "have", "how", "into", "more", "next", "should", "that", "their", "there", "these", "this", "what", "when", "which", "with", "would", "your", "які", "для", "про", "так", "цей", "цією", "що", "як"]);
const decisionTerms = question => [...new Set((String(question ?? "").match(/[\p{L}\p{N}]{3,}/gu) ?? []).filter(token => !ignoredTaskTerms.has(token.toLocaleLowerCase())))];
const taskAnchor = question => {
  const tokens = decisionTerms(question);
  const uppercase = tokens.find(token => /^(?:[A-Z]{3,}|[А-ЯІЇЄҐ]{3,})$/u.test(token));
  return uppercase ?? tokens[0] ?? "decision";
};
const taskDetail = (question, anchor) => decisionTerms(question).find(token => token.toLocaleLowerCase() !== anchor.toLocaleLowerCase());
const taskFallbackFocus = Object.freeze({
  English: Object.freeze({
    "Strategy Consultant": "Separate the actual options and name the condition that should choose among them.",
    "Finance Consultant": "Identify the exposure, affordability or loss-limit condition that rules an option in or out.",
    "Operations Consultant": "Identify the delivery or capacity constraint that changes the viable option.",
    "Sales Consultant": "Identify the buyer evidence or objection that changes the viable option.",
    "Marketing Consultant": "Identify the audience or demand evidence that changes the viable option.",
    "Product Consultant": "Identify the user-value evidence or product constraint that changes the viable option.",
    "Spiritual Consultant": "Apply the stated doctrine to the concrete decision and identify the material spiritual consideration.",
    Psychotherapist: "Use an appropriate non-clinical lens to identify the material pattern and grounded next step.",
    "Risk Consultant": "Identify the downside that changes the viable option and the evidence needed to bound it."
  }),
  Ukrainian: Object.freeze({
    "Strategy Consultant": "Розмежуй реальні варіанти й назви умову, що має визначити вибір між ними.",
    "Finance Consultant": "Визнач умову щодо експозиції, спроможності або ліміту втрати, яка виключає чи допускає варіант.",
    "Operations Consultant": "Визнач обмеження виконання або потужності, яке змінює життєздатний варіант.",
    "Sales Consultant": "Визнач доказ від покупця або заперечення, яке змінює життєздатний варіант.",
    "Marketing Consultant": "Визнач доказ щодо аудиторії чи попиту, який змінює життєздатний варіант.",
    "Product Consultant": "Визнач доказ цінності для користувача або продуктове обмеження, яке змінює життєздатний варіант.",
    "Spiritual Consultant": "Застосуй вказане вчення до конкретного рішення й визнач суттєвий духовний аспект.",
    Psychotherapist: "Застосуй доречний неклінічний підхід, щоб визначити суттєвий патерн і обґрунтований наступний крок.",
    "Risk Consultant": "Визнач ризик зниження, який змінює життєздатний варіант, і докази для його обмеження."
  })
});
const headTaskFallback = (specialist, question, language) => {
  const excerpt = taskExcerpt(question);
  const focus = taskFallbackFocus[language]?.[specialist] ?? taskFallbackFocus.English["Strategy Consultant"];
  return language === "Ukrainian"
    ? `Проаналізуй це рішення з позиції ${specialist}: «${excerpt}». ${focus}`
    : `Analyze this decision as the ${specialist}: “${excerpt}”. ${focus}`;
};
const headTaskOutput = (body, anchor, detail) => {
  const match = /^\s*<nanoduck-task>\s*([\s\S]*?)\s*<\/nanoduck-task>\s*$/iu.exec(body);
  if (!match) return undefined;
  const task = match[1].replace(/\s+/gu, " ").trim();
  const imperative = /^(?:Assess|Analyze|Analyse|Evaluate|Define|Map|Quantify|Test|Identify|Compare|Review|Examine|Clarify|Estimate|Check|Determine|Проаналізуй|Оціни|Визнач|Перевір|Зістав|Уточни|Порахуй|Вияви|Сформулюй|Досліди|Окресли|З’ясуй|З'ясуй)(?![\p{L}])/iu;
  const ownerFacing = /(?:\b(?:i|we|owner|user|recommend(?:ation)?|conclusion)\b|власник|користувач|рекоменд\p{L}*|виснов\p{L}*)/iu;
  const sentences = task.split(/[.!?]+/u).filter(Boolean);
  const caseSpecific = typeof anchor === "string" && anchor.length > 0 && task.toLocaleLowerCase().includes(anchor.toLocaleLowerCase());
  const detailSpecific = !detail || task.toLocaleLowerCase().includes(detail.toLocaleLowerCase());
  return task.length <= 420 && sentences.length <= 2 && imperative.test(task) && !ownerFacing.test(task) && caseSpecific && detailSpecific ? Object.freeze({ body: task }) : undefined;
};
const compactMessage = (body, maximumCharacters = 2_000) => {
  const text = typeof body === "string" ? body.trim() : "";
  if (text.length <= maximumCharacters) return text;
  const excerpt = text.slice(0, maximumCharacters + 1);
  const endings = [...excerpt.matchAll(/[.!?](?:\s|$)/gu)];
  const ending = endings.at(-1);
  return text.slice(0, ending ? (ending.index ?? 0) + 1 : maximumCharacters).trim();
};
const compactOutput = maximumCharacters => body => Object.freeze({ body: compactMessage(body, maximumCharacters) });
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
    const invoke = async (step, transform = undefined, fallback = undefined) => {
      if (!await isCurrent()) return undefined;
      const result = await provider.invoke({ assignment: step.assignment, model: step.model, effort: step.effort, evidence: await current(), research: step.research, outputKind: step.outputKind, maximumCharacters: step.maximumCharacters, signal: controller.signal });
      if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
      const output = (transform ?? compactOutput(step.maximumCharacters))(result.body) ?? (fallback ? { body: fallback() } : undefined);
      if (!output?.body) throw new Error("provider_contract");
      const committed = await store.appendAgentMessage(conversationId, runState.generation, { role: step.role, recipient: step.recipient, body: output.body, sources: output.sources ?? result.sources });
      if (!committed) throw new Error("invalid_run_state");
      return output;
    };
    const invokeHeadTask = async (step, { question, language }) => {
      const request = async assignment => {
        if (!await isCurrent()) return undefined;
        const result = await provider.invoke({ assignment, model: step.model, effort: step.effort, evidence: await current(), research: step.research, outputKind: step.outputKind, maximumCharacters: step.maximumCharacters, signal: controller.signal });
        if (!result.ok) throw new Error(result.code ?? "provider_unavailable");
        return result;
      };
      let result = await request(step.assignment);
      if (!result) return undefined;
      let output = headTaskOutput(result.body, step.caseAnchor, step.caseDetail);
      if (!output) {
        const detailInstruction = step.caseDetail ? ` and the exact decision detail “${step.caseDetail}”` : "";
        result = await request(`${step.assignment}\n\nYour prior output could not be committed. Return a replacement that follows the wrapper exactly and includes the exact case anchor “${step.caseAnchor}”${detailInstruction}. Do not write any other text.`);
        if (!result) return undefined;
        output = headTaskOutput(result.body, step.caseAnchor, step.caseDetail);
      }
      const committedOutput = output ?? Object.freeze({ body: headTaskFallback(step.recipient, question, language) });
      const committed = await store.appendAgentMessage(conversationId, runState.generation, { role: step.role, recipient: step.recipient, body: committedOutput.body, sources: output?.sources ?? result.sources });
      if (!committed) throw new Error("invalid_run_state");
      return committedOutput;
    };
    try {
      if (!await isCurrent()) return;
      const first = await current();
      const settings = roleSettings(snapshot); const research = !hasSensitiveResearchContext(first.owner); const language = `Write this message in ${first.sessionLanguage}.`;
      const ownerIndex = first.events.map(event => event.role).lastIndexOf("owner");
      if (ownerIndex < 0) throw new Error("invalid_run_state");
      let confirmed = first.events.slice(ownerIndex + 1);
      if (!needsDiscussion(first.owner)) {
        const direct = { role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, research, outputKind: "head_direct", maximumCharacters: 1_200, assignment: `You are the Head Consultant. Give a direct, self-contained answer to this simple question. Use a short example where it helps. Do not convene a consultant team or add process language. Respect any requested answer format or sentence count. ${responseLength} ${language}` };
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
      const caseAnchor = taskAnchor(first.owner);
      const caseDetail = taskDetail(first.owner, caseAnchor);
      const headTasks = team.map(specialist => ({
          role: "Head Consultant",
          recipient: specialist,
          model: settings.head.model,
          effort: settings.head.effort,
          research: false,
          outputKind: "head_task",
          maximumCharacters: 420,
          caseAnchor,
          caseDetail,
          assignment: `You are the Head Consultant. This is a handoff to the ${specialist}, never an answer to the owner. Return exactly one XML wrapper and nothing else: <nanoduck-task>ONE OR TWO IMPERATIVE SENTENCES</nanoduck-task>. Begin the task with a direct action verb. Inside the wrapper, give the ${specialist} a concrete role-specific investigation for this decision. Include this exact case anchor: “${caseAnchor}”.${caseDetail ? ` Also include this exact decision detail: “${caseDetail}”.` : ""} Do not answer the owner, state a position, recommend an action, list assumptions, explain the team, use first person, or use words such as recommendation or conclusion. ${language}`
        }));
      for (let index = 0; index < headTasks.length; index += 1) {
        const existing = confirmed[index];
        if (existing) { if (!matches(existing, headTasks[index])) throw new Error("invalid_run_state"); }
        else await invokeHeadTask(headTasks[index], { question: first.owner, language: first.sessionLanguage });
      }
      confirmed = (await current()).events.slice(ownerIndex + 1);
      const positions = team.map((specialist, index) => {
        const assignedTask = confirmed[index]?.body;
        if (!assignedTask) throw new Error("invalid_run_state");
        return {
          role: specialist,
          recipient: "Critic",
          model: settings.consultant.model,
          effort: settings.consultant.effort,
          research,
          outputKind: "specialist_position",
          maximumCharacters: 1_400,
          assignment: `You are the ${specialist}. Your assigned Head brief is exactly:\nBegin assigned brief\n${assignedTask}\nEnd assigned brief\n\nAnswer only that brief with an independent position for the Critic in no more than 180 words. Other Head handoffs in the prior discussion belong to other specialists and must be ignored. State the decision-relevant conclusion, its evidence or test, and the material uncertainty. Address the Critic directly. Do not restate the question, ask another specialist to act, speak for the Head or add ceremony.${guidanceFor(specialist)} ${responseLength} ${language}`
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
      const automaticDepth = snapshot.discussionDepth === "auto";
      const maximumDepth = automaticDepth ? 10 : Number(snapshot.discussionDepth);
      let completedDepth = automaticDepth ? Number(snapshot.autoDepthCompleted ?? 0) : 0;
      let consensusReached = automaticDepth && snapshot.consiliumReached === true;
      for (let exchange = 1; exchange <= maximumDepth; exchange += 1) {
        const specialist = team[(exchange - 1) % team.length];
        const challenge = { role: "Critic", recipient: specialist, model: settings.critic.model, effort: settings.critic.effort, research, outputKind: "critic_challenge", maximumCharacters: 1_000, assignment: `You are the Critic. In no more than 130 words, challenge one material gap, unsupported claim, risk or false certainty in the actual discussion. Ask for the decision-critical evidence or condition that would resolve it. Address the ${specialist} directly and remain constructive. Do not restate the discussion. This is exchange ${exchange}. ${responseLength} ${language}` };
        const reply = { role: specialist, recipient: "Critic", model: settings.consultant.model, effort: settings.consultant.effort, research, outputKind: "specialist_reply", maximumCharacters: 1_200, assignment: `You are the ${specialist}. In no more than 160 words, respond directly to the Critic's actual concern and account for the whole discussion. Revise your position where warranted; explain a grounded disagreement where not, and state the next evidence threshold or action. Do not repeat your earlier message.${guidanceFor(specialist)} ${automaticDepth ? " End with exactly [CONSILIUM: REACHED] only if the whole team and Critic now share a supported recommendation or bounded uncertainty; otherwise end with exactly [CONSILIUM: CONTINUE]." : ""} ${responseLength} ${language}` };
        const existingChallenge = confirmed[cursor];
        if (existingChallenge) { if (!matches(existingChallenge, challenge)) throw new Error("invalid_run_state"); }
        else await invoke(challenge);
        cursor += 1;
        let replyOutcome;
        const existingReply = confirmed[cursor];
        if (existingReply) { if (!matches(existingReply, reply)) throw new Error("invalid_run_state"); }
        else replyOutcome = await invoke(reply, automaticDepth ? body => {
          const marked = consensusMarker(body);
          return Object.freeze({ ...marked, body: compactMessage(marked.body, reply.maximumCharacters) });
        } : compactOutput(reply.maximumCharacters));
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
      const conclusion = { role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, research, outputKind: "head_final", maximumCharacters: 2_000, assignment: `You are the Head Consultant. Write the only owner-facing synthesis after the actual specialist and Critic discussion in no more than 260 words. Do not introduce a fresh position or reopen task assignment. Give a self-contained recommendation or clearly bounded uncertainty, no more than three next actions, the main risk and a revisit condition. State agreement only if the actual messages support it. ${responseLength} ${language}` };
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
