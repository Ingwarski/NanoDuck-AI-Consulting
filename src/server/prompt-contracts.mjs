import { createHash } from "node:crypto";
const maximumBytes = 48 * 1024;
const requiredSections = Object.freeze({
  "Consultation Routing": ["language"],
  "Auto Team Selection": ["candidates", "language"],
  "Head Task": ["specialist", "case_anchor", "case_detail", "language"],
  "Specialist Position": ["specialist", "assigned_brief", "language"],
  "Critic Challenge": ["specialist", "exchange", "language"],
  "Specialist Reply": ["specialist", "language"],
  "Auto Discussion Marker": [],
  "Head Synthesis": ["language"],
  "Universal Response Standard": [],
  "Head Task Output Contract": [],
  "Natural Output Contract": ["output_kind", "maximum_characters"],
  "Global Output Policy": [],
  "Research Protocol": [],
  "No Research Protocol": [],
  "Spiritual Consultant": [],
  Psychotherapist: []
});

const legacyDirectHeadHeading = "Direct Head Answer";
const consultationRouting = language => `Every accepted owner question must use the specialist-and-Critic consultation. Before the final synthesis, Head Consultant may send only a concise task addressed to a selected specialist; it must not give the owner advice, a recommendation, analysis, or a preliminary conclusion. The final Head synthesis comes only after the selected specialists and Critic have completed the configured exchanges. Write this message in ${language}.`;

export class RuntimeInstructionError extends Error {
  constructor(message) { super(message); this.code = "invalid_runtime_instructions"; }
}

const normalize = value => typeof value === "string" ? value.replace(/\r\n?/gu, "\n").trim() : "";
const revisionFor = markdown => createHash("sha256").update(markdown).digest("hex");
export const upgradeRuntimeInstructionMarkdown = value => {
  const markdown = normalize(value);
  if (!markdown || !new RegExp(`^## ${legacyDirectHeadHeading}\\n`, "mu").test(markdown)) return `${markdown}\n`;
  const legacySection = new RegExp(`^## ${legacyDirectHeadHeading}\\n[\\s\\S]*?(?=^## |(?![\\s\\S]))`, "mu");
  return `${markdown.replace(legacySection, `## Consultation Routing\n${consultationRouting("{{language}}")}\n\n`).trim()}\n`;
};
const markdownSections = markdown => {
  const matches = [...markdown.matchAll(/^## ([^\n]+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gmu)];
  const sections = new Map();
  for (const match of matches) {
    const heading = match[1].trim(); const body = match[2].trim();
    if (sections.has(heading) || !body) throw new RuntimeInstructionError("Each runtime-instruction section must appear once and contain text.");
    sections.set(heading, body);
  }
  return sections;
};

export function parseRuntimeInstructions(value) {
  const markdown = normalize(value);
  if (!markdown || Buffer.byteLength(markdown, "utf8") > maximumBytes) throw new RuntimeInstructionError("Runtime instructions must be between 1 and 48 KiB.");
  const sections = markdownSections(markdown);
  if (sections.size !== Object.keys(requiredSections).length || [...sections.keys()].some(heading => !(heading in requiredSections))) {
    throw new RuntimeInstructionError("Runtime instructions must contain only the required runtime section headings.");
  }
  for (const [heading, placeholders] of Object.entries(requiredSections)) {
    const body = sections.get(heading);
    if (!body) throw new RuntimeInstructionError(`Missing runtime-instruction section: ${heading}.`);
    for (const placeholder of placeholders) if (!body.includes(`{{${placeholder}}}`)) throw new RuntimeInstructionError(`Section ${heading} must keep {{${placeholder}}}.`);
  }
  return Object.freeze({ markdown: `${markdown}\n`, revision: revisionFor(`${markdown}\n`), sections: Object.freeze(Object.fromEntries(sections)) });
}

const render = (contract, section, values = {}) => {
  const body = contract.sections[section];
  const rendered = body.replace(/\{\{([a-z_]+)\}\}/gu, (_, key) => String(values[key] ?? ""));
  if (/\{\{[a-z_]+\}\}/u.test(rendered)) throw new RuntimeInstructionError(`Unresolved runtime-instruction placeholder in ${section}.`);
  return rendered;
};
const withStandard = (contract, section, values) => `${render(contract, section, values)} ${render(contract, "Universal Response Standard")}`;
const roleGuidance = (contract, role) => contract.sections[role] ? ` ${render(contract, role)}` : "";

export function runtimeInstructionsFor(snapshot) {
  const markdown = snapshot?.runtimeInstructions?.markdown;
  if (typeof markdown !== "string") throw new RuntimeInstructionError("Accepted consultation is missing its runtime-instructions snapshot.");
  return parseRuntimeInstructions(upgradeRuntimeInstructionMarkdown(markdown));
}

export function createRuntimePrompts(contract) {
  return Object.freeze({
    autoTeam: ({ candidates, language }) => render(contract, "Auto Team Selection", { candidates: candidates.join(", "), language }),
    headTask: ({ specialist, caseAnchor, caseDetail, language }) => `${render(contract, "Head Task", { specialist, case_anchor: caseAnchor, case_detail: caseDetail, language })} ${render(contract, "Consultation Routing", { language })}`,
    specialistPosition: ({ specialist, assignedBrief, language }) => `${withStandard(contract, "Specialist Position", { specialist, assigned_brief: assignedBrief, language })}${roleGuidance(contract, specialist)}`,
    criticChallenge: ({ specialist, exchange, language }) => withStandard(contract, "Critic Challenge", { specialist, exchange, language }),
    specialistReply: ({ specialist, language, automaticDepth }) => `${withStandard(contract, "Specialist Reply", { specialist, language })}${roleGuidance(contract, specialist)}${automaticDepth ? ` ${render(contract, "Auto Discussion Marker")}` : ""}`,
    conclusion: language => `${withStandard(contract, "Head Synthesis", { language })} ${render(contract, "Consultation Routing", { language })}`,
    outputContract: ({ outputKind, maximumCharacters }) => outputKind === "head_task"
      ? render(contract, "Head Task Output Contract")
      : render(contract, "Natural Output Contract", { output_kind: outputKind.replaceAll("_", " "), maximum_characters: maximumCharacters ?? 2_000 }),
    providerPolicy: research => `${render(contract, "Global Output Policy")} ${render(contract, research ? "Research Protocol" : "No Research Protocol")}`
  });
}
