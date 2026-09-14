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
const paceInstruction = speed => ({
  fast: "Keep this message to about 80 words and focus on the decision-changing point.",
  balanced: "Keep this message to about 150 words and include only the reasoning needed for the next decision.",
  thorough: "Use up to about 260 words when needed to make assumptions, evidence limits and tradeoffs clear."
}[speed] ?? "Keep this message to about 150 words and include only the reasoning needed for the next decision.");
const specialistFor = text => {
  const subject = text.toLocaleLowerCase();
  const matches = pattern => pattern.test(subject);
  if (matches(/\b(risk|legal|compliance|threat)\b|ризик|юрид|відповідн|загроз/iu)) return "Risk Consultant";
  if (matches(/\b(cash|margin|profit|revenue|budget|cost|pricing)\b|грош|марж|прибут|дохід|бюджет|витрат|ціноутвор/iu)) return "Finance Consultant";
  if (matches(/\b(process|operations|delivery|capacity|workflow)\b|процес|операц|постач|потужн|навантаж/iu)) return "Operations Consultant";
  if (matches(/\b(sales|pipeline|prospect|conversion|b2b|b2c)\b|продаж|лійк|потенційн.{0,8}клієнт|конверс/iu)) return "Sales Consultant";
  if (matches(/\b(marketing|campaign|audience|traffic|brand|advertising)\b|маркетинг|кампан|аудитор|трафік|бренд|реклам/iu)) return "Marketing Consultant";
  if (matches(/\b(product|feature|roadmap|retention|user experience)\b|продукт|функц|роудмап|утриман|досвід користувач/iu)) return "Product Consultant";
  if (matches(/\b(leadership|manager|hiring|organization|culture)\b|лідер|керівник|найм|організа|культур/iu)) return "Leadership Consultant";
  return "Strategy Consultant";
};

export function createConsultationService({ store, provider }) {
  const controllers = new Map();
  const run = async (conversationId, runState) => {
    const controller = new AbortController(); controllers.set(conversationId, controller);
    const current = () => store.events(conversationId).then(events => ({ events, owner: [...events].reverse().find(event => event.role === "owner")?.body ?? "", discussion: discussion(events) }));
    const isCurrent = async () => {
      const stored = await store.run(conversationId);
      return stored?.status === "active" && stored.generation === runState.generation;
    };
    const commit = async (role, recipient, result) => {
      if (!result.ok) return undefined;
      return store.appendAgentMessage(conversationId, runState.generation, { role, recipient, body: result.body, sources: result.sources });
    };
    try {
      if (!await isCurrent()) return;
      const settings = roleSettings(runState.snapshot); const first = await current(); const specialist = specialistFor(first.owner); const research = !hasSensitiveResearchContext(first.owner); const pace = paceInstruction(runState.snapshot.speed);
      const turns = needsDiscussion(first.owner) ? [
        { role: "Head Consultant", recipient: specialist, model: settings.head.model, effort: settings.head.effort, assignment: `You are the Head Consultant. Frame the practical decision, name the decisive assumptions and give the ${specialist} a focused task. Speak to the owner plainly. ${pace}` },
        { role: specialist, recipient: "Critic", model: settings.consultant.model, effort: settings.consultant.effort, assignment: `You are the ${specialist}. Develop one concrete position that directly helps the owner decide. Address the Head's framing, use evidence where useful, and avoid ceremony. ${pace}` },
        { role: "Critic", recipient: specialist, model: settings.critic.model, effort: settings.critic.effort, assignment: `You are the Critic. Challenge only material gaps, unsupported claims, risks or false certainty in the actual discussion. If the position is sound, say why. Address the ${specialist} directly and remain constructive. ${pace}` },
        { role: specialist, recipient: "Head Consultant", model: settings.consultant.model, effort: settings.consultant.effort, assignment: `You are the ${specialist}. Respond directly to the Critic's actual concern. Revise your position where warranted; explain a grounded disagreement where not. Do not repeat your earlier message. ${pace}` },
        { role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, assignment: `You are the Head Consultant. Close the discussion with a self-contained recommendation or a clearly bounded uncertainty, no more than three next actions, the main risk and a revisit condition. State agreement only if the actual messages support it. ${pace}` }
      ] : [{ role: "Head Consultant", recipient: null, model: settings.head.model, effort: settings.head.effort, assignment: `You are the Head Consultant. Give a direct, self-contained answer to this simple question. Use a short example where it helps. Do not convene a consultant team or add process language. ${pace}` }];
      const ownerIndex = first.events.map(event => event.role).lastIndexOf("owner");
      const committed = first.events.slice(ownerIndex + 1);
      if (ownerIndex < 0 || committed.length > turns.length || committed.some((event, index) => event.role !== turns[index].role || (event.recipient ?? null) !== turns[index].recipient)) throw new Error("invalid_run_state");
      for (const turn of turns.slice(committed.length)) {
        if (!await isCurrent()) return;
        const result = await provider.invoke({ assignment: turn.assignment, model: turn.model, effort: turn.effort, evidence: await current(), research, signal: controller.signal });
        if (!await commit(turn.role, turn.recipient, result)) throw new Error(result.code ?? "provider_unavailable");
      }
      await store.finishRun(conversationId, runState.generation, "complete");
    } catch (error) {
      if (!controller.signal.aborted) {
        const code = error.message === "provider_unavailable" ? "The selected Codex subscription is unavailable. Your question remains saved." : "The consultation paused before a confirmed response. Your saved discussion remains available.";
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
