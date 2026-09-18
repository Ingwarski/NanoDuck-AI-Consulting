import { parseMarkdown } from "/client/markdown.js";
import { normalizeRefreshState, refreshStateKey, serializeRefreshState } from "/client/refresh-state.js";

const state = { session: null, csrf: null, page: "discussion", tab: "discussion", conversation: null, events: [], run: null, poll: null, recognition: null, voiceTimer: null, voiceMode: "ready", voiceTranscript: "", attachmentFiles: [], attachmentError: "", runtimeInstructionHistory: [], notificationSound: "knock", conversations: [], selectedConversationIds: new Set(), criticSettings: null, criticProviders: null };
const $ = selector => document.querySelector(selector);
const roleInitials = { owner: "I", "Head Consultant": "HC", "Strategy Consultant": "SC", "Finance Consultant": "FC", "Operations Consultant": "OC", "Sales Consultant": "SL", "Marketing Consultant": "MC", "Product Consultant": "PC", "Spiritual Consultant": "SP", Psychotherapist: "PT", "Risk Consultant": "RC", Critic: "CR", System: "•" };
const displayRole = role => role === "owner" ? "You" : role;

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  if (state.csrf && !["GET", "HEAD"].includes(options.method ?? "GET")) headers.set("x-csrf-token", state.csrf);
  if (options.body && typeof options.body !== "string" && !(options.body instanceof FormData) && !(options.body instanceof Blob)) { headers.set("content-type", "application/json"); options.body = JSON.stringify(options.body); }
  const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
  if (response.status === 204) return { response, data: undefined };
  const data = await response.json().catch(() => undefined);
  if (!response.ok) throw Object.assign(new Error(data?.error ?? "request_failed"), { response, data });
  return { response, data };
};

const toast = message => { const item = $("#toast"); item.textContent = message; item.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { item.hidden = true; }, 4_000); };
const formatTime = value => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
const formatDate = value => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
const clear = element => { element.replaceChildren(); return element; };
const node = (tag, attributes = {}, text) => { const item = document.createElement(tag); for (const [key, value] of Object.entries(attributes)) { if (key === "class") item.className = value; else if (key.startsWith("data-")) item.setAttribute(key, value); else item[key] = value; } if (text !== undefined) item.textContent = text; return item; };
const appendMarkdownTokens = (target, tokens) => { for (const token of tokens) { if (token.type === "break") target.append(document.createElement("br")); else if (token.type === "strong") target.append(node("strong", {}, token.value)); else if (token.type === "emphasis") target.append(node("em", {}, token.value)); else if (token.type === "code") target.append(node("code", {}, token.value)); else if (token.type === "link") target.append(node("a", { href: token.href, target: "_blank", rel: "noopener noreferrer" }, token.value)); else target.append(document.createTextNode(token.value)); } };
const renderMarkdown = (target, value) => {
  clear(target);
  for (const block of parseMarkdown(value)) {
    if (block.type === "list") { const list = node(block.ordered ? "ol" : "ul"); for (const item of block.items) { const entry = node("li"); appendMarkdownTokens(entry, item); list.append(entry); } target.append(list); continue; }
    const element = node(block.type === "heading" ? `h${block.level}` : block.type === "quote" ? "blockquote" : "p");
    appendMarkdownTokens(element, block.content); target.append(element);
  }
  if (!target.childNodes.length) target.append(node("p", {}, ""));
  return target;
};
const id = () => crypto.randomUUID().replaceAll("-", "");
const attachmentLimit = 8 * 1024 * 1024;
const attachmentCountLimit = 4;
const attachmentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const formatBytes = value => value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MiB`;
const notificationPatterns = Object.freeze({
  chime: Object.freeze([[659, 0, .32], [880, .13, .44]]),
  ripple: Object.freeze([[523, 0, .16], [659, .10, .18], [784, .21, .24]])
});
const notificationSoundUrls = new Map();
const notificationPlayers = new Set();
const soundUrl = name => {
  if (name === "knock") return "/sounds/nokia-three-knocks-quick.wav";
  if (notificationSoundUrls.has(name)) return notificationSoundUrls.get(name);
  const pattern = notificationPatterns[name]; if (!pattern || typeof Blob !== "function" || !URL.createObjectURL) return undefined;
  const rate = 44_100; const seconds = Math.max(...pattern.map(([, offset, duration]) => offset + duration)) + .08; const samples = Math.ceil(seconds * rate);
  const wav = new ArrayBuffer(44 + samples * 2); const view = new DataView(wav);
  const tag = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  tag(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true); tag(8, "WAVE"); tag(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); tag(36, "data"); view.setUint32(40, samples * 2, true);
  for (let index = 0; index < samples; index += 1) {
    const time = index / rate; let value = 0;
    for (const [frequency, offset, duration] of pattern) {
      const progress = (time - offset) / duration; if (progress < 0 || progress > 1) continue;
      const envelope = Math.min(1, progress / .025) * Math.pow(1 - progress, 1.35) * .58;
      const phase = 2 * Math.PI * frequency * (time - offset); const wave = Math.sin(phase);
      value += wave * envelope;
    }
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, value)) * 0x7fff), true);
  }
  const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" })); notificationSoundUrls.set(name, url); return url;
};
const playNotificationSound = async () => {
  const url = soundUrl(state.notificationSound); if (!url || typeof Audio !== "function") return false;
  const player = new Audio(url); player.preload = "auto"; player.volume = .85; notificationPlayers.add(player);
  const clearPlayer = () => notificationPlayers.delete(player); player.addEventListener("ended", clearPlayer, { once: true }); player.addEventListener("error", clearPlayer, { once: true });
  try { await player.play(); return true; } catch { clearPlayer(); return false; }
};
const announceIncomingMessages = (before, after) => {
  const previous = new Set(before.map(event => event.id));
  const incoming = after.filter(event => event.role !== "owner" && !previous.has(event.id));
  if (!incoming.length) return;
  void playNotificationSound();
  $("#message-announcement").textContent = incoming.length === 1 ? `${displayRole(incoming[0].role)} sent a message.` : `${incoming.length} new consultation messages are available.`;
};

const saveRefreshState = () => {
  if (!state.session?.authenticated || !state.session.consented) return;
  try {
    sessionStorage.setItem(refreshStateKey, serializeRefreshState({
      page: state.page,
      tab: state.tab,
      conversationId: state.conversation?.id,
      scrollY: window.scrollY
    }));
  } catch { /* Browser storage can be unavailable without affecting the consultation. */ }
};
const takeRefreshState = () => {
  try {
    const raw = sessionStorage.getItem(refreshStateKey);
    sessionStorage.removeItem(refreshStateKey);
    return raw ? normalizeRefreshState(JSON.parse(raw)) : undefined;
  } catch { return undefined; }
};
const clearRefreshState = () => {
  try { sessionStorage.removeItem(refreshStateKey); } catch { /* Browser storage can be unavailable. */ }
};
const restoreScroll = scrollY => requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, scrollY)));

function nav(page) {
  closeMenu();
  if (!state.session?.authenticated || !state.session.consented) return;
  state.page = page;
  $("#discussion-page").hidden = page !== "discussion";
  $("#conversations-page").hidden = page !== "conversations";
  $("#settings-page").hidden = page !== "settings";
  document.querySelectorAll("[data-nav]").forEach(button => button.setAttribute("aria-current", String(button.dataset.nav === page ? "page" : false)));
  if (page === "conversations") return loadConversations();
  if (page === "settings") return loadSettings();
  return Promise.resolve();
}

function closeMenu() { $("#mobile-nav").hidden = true; $("#menu").setAttribute("aria-expanded", "false"); }

function updateSessionActions(busy = false) {
  document.querySelectorAll("[data-session-action]").forEach(button => {
    button.textContent = state.session?.authenticated ? "Logoff" : "Login";
    button.disabled = !state.session || busy;
  });
  $("#sign-out").disabled = busy;
  $("#google-sign-in").disabled = busy;
  $("#development-sign-in").disabled = busy;
}

async function signIn() {
  closeMenu(); updateSessionActions(true);
  try {
    if (state.session?.development) {
      await request("/api/auth/development", { method: "POST" });
      await loadSession();
    } else {
      const { response } = await request("/auth/google/start", { method: "POST" });
      location.assign(response.headers.get("location"));
    }
  } catch { toast("Sign-in could not start. Please try again."); }
  finally { updateSessionActions(); }
}

async function signOut() {
  closeMenu(); updateSessionActions(true);
  try {
    await request("/api/logout", { method: "POST" });
    stopPolling(); releaseVoice();
    state.session = null; clearRefreshState();
    // Reload clears private in-memory content and retrieves the signed-out session.
    location.reload();
  } catch {
    toast("Logoff failed. You are still signed in. Please try again.");
    updateSessionActions();
  }
}

function showAuthenticated() { $("#sign-in").hidden = true; $("#consent").hidden = true; $("#app").hidden = false; nav("discussion"); }
function showSignIn() {
  stopPolling(); $("#app").hidden = true; $("#consent").hidden = true; $("#sign-in").hidden = false;
  const development = Boolean(state.session?.development);
  const developmentButton = $("#development-sign-in");
  developmentButton.hidden = !development;
  developmentButton.classList.toggle("primary", development);
  developmentButton.classList.toggle("secondary", !development);
  $("#google-sign-in").hidden = development;
}
function showConsent() { $("#sign-in").hidden = true; $("#app").hidden = true; $("#consent").hidden = false; }

async function loadSession() {
  const { data } = await request("/api/session"); state.session = data;
  updateSessionActions();
  if (!data.authenticated) return showSignIn(); state.csrf = data.csrfToken;
  if (!data.consented) return showConsent(); showAuthenticated();
}

function renderEvents() {
  const thread = clear($("#thread"));
  if (state.events.length === 0) {
    const empty = node("div", { class: "empty" }); empty.append(node("h2", {}, "Bring in the decision."), node("p", {}, "The specialists and Critic review your question before the Head presents consolidated advice.")); thread.append(empty);
  }
  for (const event of state.events) {
    const message = node("article", { class: "message", "data-role": event.role });
    message.append(node("div", { class: "avatar", "aria-hidden": true }, roleInitials[event.role] ?? "AI"));
    const content = node("div", { class: "message-content" }); const meta = node("div", { class: "message-meta" });
    meta.append(node("strong", {}, displayRole(event.role))); if (event.recipient) meta.append(node("small", {}, `→ ${displayRole(event.recipient)}`)); meta.append(node("time", { dateTime: event.createdAt }, formatTime(event.createdAt)));
    const body = node("div", { class: "message-body" }); renderMarkdown(body, event.body); content.append(meta, body);
    if (event.attachments?.length) {
      const links = node("div", { class: "attachment-links", "aria-label": "Image attachments" });
      for (const attachment of event.attachments) {
        const link = node("a", { href: `/api/conversations/${state.conversation.id}/attachments/${attachment.id}`, download: "" }, `Image · ${attachment.contentType.replace("image/", "").toUpperCase()} · ${formatBytes(attachment.byteLength)}`);
        links.append(link);
      }
      content.append(links);
    }
    if (event.sources?.length) { const links = node("div", { class: "source-links" }); for (const source of event.sources) { const link = node("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title); links.append(link); } content.append(links); }
    message.append(content); thread.append(message);
  }
  const active = state.run?.status === "active"; $("#stop").hidden = !active; $("#continue").hidden = state.run?.status !== "stopped";
  if (active) {
    const indicator = node("div", { class: "thinking-indicator", role: "img", ariaLabel: "The consultation is thinking. The next message will appear here." });
    const cloud = node("span", { class: "thought-cloud", ariaHidden: true }); cloud.append(node("i"), node("i"), node("i"));
    indicator.append(cloud, node("span", {}, "The team is thinking…")); thread.append(indicator);
  }
  const labels = { active: "The team is preparing the next message.", stopped: "Consultation stopped. Confirmed discussion is preserved.", complete: "Discussion complete.", failed: "Consultation needs attention. Confirmed discussion is preserved." };
  $("#run-status").textContent = labels[state.run?.status] ?? "Describe the decision you want to make.";
  renderOutcome(); renderSources();
}

function renderOutcome() { const target = clear($("#outcome")); const ownerIndex = state.events.map(event => event.role).lastIndexOf("owner"); const outcome = state.events.slice(ownerIndex + 1).find(event => event.role === "Head Consultant" && !event.recipient); if (outcome) { const body = node("div", { class: "message-body outcome-body" }); renderMarkdown(body, outcome.body); target.append(body); } else target.append(node("div", { class: "empty" }, "Consolidated advice appears after every specialist's final position and the Critic's closing review.")); }
function renderSources() { const target = clear($("#sources")); const sources = [...new Map(state.events.flatMap(event => event.sources ?? []).map(source => [source.url, source])).values()]; if (!sources.length) { target.append(node("div", { class: "empty" }, "Sources appear here when live research materially informs the discussion.")); return; } for (const source of sources) { const dates = [`Retrieved ${formatDate(source.retrievedAt)}`]; if (source.publishedAt) dates.push(`Published ${formatDate(source.publishedAt)}`); const card = node("article", { class: "source-card" }); card.append(node("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title), node("p", {}, source.claim), node("p", { class: "hint" }, dates.join(" · "))); target.append(card); } }

async function loadConversation(conversationId, { preserveAttachmentDraft = false } = {}) {
  const { data } = await request(`/api/conversations/${encodeURIComponent(conversationId)}`); state.conversation = data.conversation; state.events = data.events; state.run = data.run; renderEvents(); await nav("discussion"); setTab("discussion"); startPolling();
  if (!preserveAttachmentDraft) clearAttachmentDraft();
}

async function newConversation() { try { const { data } = await request("/api/conversations", { method: "POST" }); await loadConversation(data.conversation.id, { preserveAttachmentDraft: true }); $("#message").focus(); } catch { toast("Could not create a conversation."); } }
function prepareConversationsPage() {
  const page = $("#conversations-page"); const intro = page.querySelector(".page-intro");
  if (!intro.dataset.prepared) { clear(intro).append(node("p", { class: "eyebrow" }, "Conversations")); intro.dataset.prepared = "true"; }
  if ($("#conversation-toolbar")) return;
  const toolbar = node("div", { id: "conversation-toolbar", class: "conversation-toolbar" });
  page.insertBefore(toolbar, $("#conversation-list"));
}
function clearDeletedConversation(ids) {
  if (!state.conversation || !ids.includes(state.conversation.id)) return;
  stopPolling(); state.conversation = null; state.events = []; state.run = null; renderEvents();
}
async function deleteSelectedConversations() {
  const ids = [...state.selectedConversationIds];
  if (!ids.length || !confirm(`Delete ${ids.length} selected conversation${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
  try {
    const { data } = await request("/api/conversations", { method: "DELETE", body: { conversationIds: ids } });
    clearDeletedConversation(data.deletedConversationIds); state.selectedConversationIds.clear();
    toast(`${data.deletedConversationIds.length} conversation${data.deletedConversationIds.length === 1 ? "" : "s"} deleted.`); await loadConversations();
  } catch { toast("Selected conversations could not be deleted. Please try again."); }
}
function renderConversationToolbar() {
  const toolbar = clear($("#conversation-toolbar")); const conversations = state.conversations;
  toolbar.hidden = !conversations.length;
  if (!conversations.length) return;
  const selectedCount = state.selectedConversationIds.size;
  const selectAll = node("input", { type: "checkbox", id: "select-all-conversations" });
  selectAll.checked = selectedCount === conversations.length; selectAll.indeterminate = selectedCount > 0 && selectedCount < conversations.length;
  selectAll.addEventListener("change", () => { state.selectedConversationIds = new Set(selectAll.checked ? conversations.map(item => item.id) : []); renderConversations(); });
  const selectLabel = node("label", { class: "conversation-select-all", htmlFor: "select-all-conversations" }); selectLabel.append(selectAll, node("span", {}, "Select all"));
  const deleteButton = node("button", { type: "button", class: "secondary" }, selectedCount ? `Delete selected (${selectedCount})` : "Delete selected");
  deleteButton.disabled = selectedCount === 0; deleteButton.addEventListener("click", () => void deleteSelectedConversations());
  toolbar.append(selectLabel, deleteButton);
}
function renderConversations() {
  prepareConversationsPage(); renderConversationToolbar(); const list = clear($("#conversation-list"));
  if (!state.conversations.length) { list.append(node("div", { class: "empty" }, "No saved conversations yet.")); return; }
  for (const conversation of state.conversations) {
    const row = node("article", { class: "conversation-row" });
    const select = node("input", { type: "checkbox", checked: state.selectedConversationIds.has(conversation.id), "aria-label": `Select ${conversation.title}` });
    select.addEventListener("change", () => { if (select.checked) state.selectedConversationIds.add(conversation.id); else state.selectedConversationIds.delete(conversation.id); renderConversations(); });
    const selectLabel = node("label", { class: "conversation-select" }); selectLabel.append(select, node("span", {}, "Select"));
    const openConversation = async () => { try { await loadConversation(conversation.id); } catch { toast("That conversation could not be opened. Please try again."); } };
    const summary = node("div", { class: "conversation-summary", tabIndex: 0 }); summary.setAttribute("role", "button"); summary.setAttribute("aria-label", `Open ${conversation.title}`); summary.append(node("h2", {}, conversation.title), node("small", {}, new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(conversation.updatedAt)))); summary.addEventListener("click", () => void openConversation()); summary.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void openConversation(); } });
    const tools = node("div", { class: "conversation-actions" });
    const exportButton = node("button", { type: "button", class: "secondary" }, "Export"); exportButton.title = "Download formatted rich text (.rtf)"; exportButton.addEventListener("click", () => { const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; window.location.assign(`/api/conversations/${conversation.id}/export?timeZone=${encodeURIComponent(timeZone)}`); });
    const deleteButton = node("button", { type: "button", class: "secondary" }, "Delete"); deleteButton.addEventListener("click", async () => {
      if (!confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return;
      try { await request(`/api/conversations/${conversation.id}`, { method: "DELETE" }); clearDeletedConversation([conversation.id]); state.selectedConversationIds.delete(conversation.id); toast("Conversation deleted."); await loadConversations(); } catch { toast("Conversation could not be deleted. Please try again."); }
    });
    tools.append(exportButton, deleteButton); row.append(selectLabel, summary, tools); list.append(row);
  }
}
async function loadConversations() {
  const { data } = await request("/api/conversations"); state.conversations = data.conversations;
  const available = new Set(state.conversations.map(item => item.id)); state.selectedConversationIds = new Set([...state.selectedConversationIds].filter(id => available.has(id)));
  renderConversations();
}

const criticProviderName = provider => provider === "claude_code" ? "Claude Code" : "GPT (Codex)";
const criticProviderStatus = provider => {
  const status = state.criticProviders?.[provider]?.status;
  if (status === "ready") return `${criticProviderName(provider)} is ready for this runtime.`;
  if (status === "auth_required") return `${criticProviderName(provider)} needs its managed sign-in renewed.`;
  if (status === "quota_blocked") return `${criticProviderName(provider)} has reached its current limit.`;
  return `${criticProviderName(provider)} is unavailable on this runtime.`;
};
const replaceOptions = (select, options, selected) => {
  clear(select);
  for (const option of options) select.append(node("option", { value: option.id }, option.label ?? option.id));
  if (options.some(option => option.id === selected)) select.value = selected;
};
function ensureCriticProviderControl() {
  if ($("#critic-provider")) return;
  const fieldset = $("#critic-model").closest("fieldset"); const first = fieldset.querySelector("label");
  const label = node("label", {}, "Provider"); const select = node("select", { id: "critic-provider" });
  label.append(select); fieldset.insertBefore(label, first);
  select.addEventListener("change", () => {
    const next = select.value;
    if (next === "claude_code" && state.criticProviders?.claude_code?.status !== "ready") {
      select.value = state.criticSettings.criticProvider; toast("Claude Code needs its managed sign-in before it can be selected."); return;
    }
    saveVisibleCriticSettings(); state.criticSettings.criticProvider = next; renderCriticControls();
  });
}
function saveVisibleCriticSettings() {
  if (!state.criticSettings) return;
  if ($("#critic-provider").value === "claude_code") {
    state.criticSettings.criticClaudeModel = $("#critic-model").value; state.criticSettings.criticClaudeReasoning = $("#critic-reasoning").value;
  } else {
    state.criticSettings.criticCodexModel = $("#critic-model").value; state.criticSettings.criticCodexReasoning = $("#critic-reasoning").value;
  }
}
function renderCriticControls() {
  const provider = state.criticSettings.criticProvider; const capability = state.criticProviders?.[provider] ?? { status: "unavailable", models: [] };
  $("#critic-provider").value = provider;
  const models = capability.models?.length ? capability.models : provider === "codex"
    ? [{ id: "gpt-6-astra", label: "gpt-6-astra", efforts: ["xhigh", "ultra"] }]
    : [{ id: "claude-opus-5", label: "Opus 5", efforts: ["low", "medium", "high", "extra", "max"] }];
  const selectedModel = provider === "claude_code" ? state.criticSettings.criticClaudeModel : state.criticSettings.criticCodexModel;
  const selectedEffort = provider === "claude_code" ? state.criticSettings.criticClaudeReasoning ?? "high" : state.criticSettings.criticCodexReasoning;
  replaceOptions($("#critic-model"), models, selectedModel);
  const current = models.find(model => model.id === $("#critic-model").value) ?? models[0];
  const effortLabel = id => provider === "claude_code" ? ({ low: "Low", medium: "Medium", high: "High (Default)", extra: "Extra", max: "Max" }[id] ?? id) : id;
  replaceOptions($("#critic-reasoning"), current.efforts.map(id => ({ id, label: effortLabel(id) })), selectedEffort);
  const unavailable = provider === "claude_code" && capability.status !== "ready";
  $("#critic-model").disabled = unavailable; $("#critic-reasoning").disabled = unavailable;
  $("#settings-status").textContent = `${criticProviderStatus("codex")} ${criticProviderStatus("claude_code")}`;
}
async function loadSettings() {
  const [{ data: settingsData }, { data: instructionsData }] = await Promise.all([request("/api/settings"), request("/api/runtime-instructions")]); const settings = settingsData.settings; const instructions = instructionsData.runtimeInstructions;
  $("#head-model").value = settings.headModel; $("#head-reasoning").value = settings.headReasoning;
  state.criticProviders = settingsData.criticProviders ?? { codex: { status: settingsData.provider, models: settingsData.catalog ?? [] }, claude_code: { status: "unavailable", models: [] } };
  state.criticSettings = {
    criticProvider: settings.criticProvider ?? "codex",
    criticCodexModel: settings.criticCodexModel ?? settings.criticModel,
    criticCodexReasoning: settings.criticCodexReasoning ?? settings.criticReasoning,
    criticClaudeModel: settings.criticClaudeModel === "claude-code-default" ? undefined : settings.criticClaudeModel,
    criticClaudeReasoning: ["default", "xhigh"].includes(settings.criticClaudeReasoning) ? undefined : settings.criticClaudeReasoning
  };
  ensureCriticProviderControl(); replaceOptions($("#critic-provider"), [{ id: "codex", label: "GPT (Codex)" }, { id: "claude_code", label: "Claude Code" }], state.criticSettings.criticProvider); renderCriticControls();
  $("#specialist-count").value = settings.specialistCount; $("#discussion-depth").value = settings.discussionDepth; $("#notification-sound").value = settings.notificationSound ?? "knock"; state.notificationSound = $("#notification-sound").value;
  $("#runtime-instructions").value = instructions.markdown;
  $("#runtime-instructions").dataset.revision = instructions.revision;
  $("#runtime-instructions-status").textContent = `Current encrypted database revision ${instructions.revision.slice(0, 12)}. Required headings and placeholders are validated before save.`;
  state.runtimeInstructionHistory = instructionsData.history; renderRuntimeInstructionHistory();
  $("#session-expiry").textContent = `This session expires ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.session.expiresAt))}. Activity does not extend the 24-hour boundary.`;
}

function renderRuntimeInstructionHistory() {
  const target = clear($("#runtime-instruction-history"));
  if (!state.runtimeInstructionHistory.length) { target.append(node("p", { class: "empty" }, "No saved versions are available.")); return; }
  const currentRevision = $("#runtime-instructions").dataset.revision;
  for (const version of state.runtimeInstructionHistory) {
    const row = node("article", { class: "runtime-instruction-version" }); const copy = node("div");
    const current = version.id === currentRevision;
    copy.append(node("strong", {}, current ? "Current version" : "Saved version"), node("p", {}, `${formatDate(version.createdAt)} · ${formatTime(version.createdAt)} · ${version.action}`));
    const review = node("button", { type: "button", class: "secondary" }, "Review"); review.addEventListener("click", () => void openRuntimeInstructionVersion(version.id)); row.append(copy, review); target.append(row);
  }
}

async function openRuntimeInstructionVersion(historyId) {
  try {
    const { data } = await request(`/api/runtime-instructions/history/${historyId}`); const version = data.version; const dialog = $("#runtime-instructions-version-dialog");
    dialog.dataset.historyId = version.id; dialog.dataset.current = String(version.id === $("#runtime-instructions").dataset.revision);
    $("#runtime-instructions-version-meta").textContent = `${formatDate(version.createdAt)} · ${formatTime(version.createdAt)} · ${version.action}`;
    $("#runtime-instructions-version-markdown").value = version.markdown;
    $("#runtime-instructions-version-restore").disabled = dialog.dataset.current === "true";
    $("#runtime-instructions-version-restore").textContent = dialog.dataset.current === "true" ? "Current version" : "Restore this version";
    dialog.showModal();
  } catch { toast("That saved version could not be opened."); }
}

async function restoreRuntimeInstructionVersion() {
  const dialog = $("#runtime-instructions-version-dialog"); if (dialog.dataset.current === "true") return;
  try {
    const { data } = await request("/api/runtime-instructions/restore", { method: "PUT", body: { historyId: dialog.dataset.historyId, revision: $("#runtime-instructions").dataset.revision } });
    $("#runtime-instructions").value = data.runtimeInstructions.markdown; $("#runtime-instructions").dataset.revision = data.runtimeInstructions.revision;
    dialog.close(); await loadSettings(); toast("Saved version restored for future consultations.");
  } catch (error) { toast(error.data?.message ?? "That version could not be restored. Reload Settings and try again."); }
}

function renderAttachmentDraft() {
  const list = clear($("#attachment-list"));
  for (const [index, file] of state.attachmentFiles.entries()) {
    const item = node("span", { class: "attachment-draft" });
    item.append(node("span", {}, `${file.name} · ${formatBytes(file.size)}`));
    const remove = node("button", { type: "button", "aria-label": `Remove ${file.name}` }, "×");
    remove.addEventListener("click", () => { state.attachmentFiles.splice(index, 1); state.attachmentError = ""; renderAttachmentDraft(); });
    item.append(remove); list.append(item);
  }
  $("#voice-status").textContent = state.attachmentError || (state.attachmentFiles.length ? `${state.attachmentFiles.length} image${state.attachmentFiles.length === 1 ? "" : "s"} ready to send. JPEG, PNG or WebP only.` : "Images: JPEG, PNG or WebP, up to 8 MiB each.");
}
function clearAttachmentDraft() { state.attachmentFiles = []; state.attachmentError = ""; $("#attachment").value = ""; renderAttachmentDraft(); }
function chooseAttachments(files) {
  const accepted = [...files].filter(file => attachmentTypes.has(file.type) && file.size > 0 && file.size <= attachmentLimit);
  if (accepted.length !== files.length || state.attachmentFiles.length + accepted.length > attachmentCountLimit) state.attachmentError = `Choose up to ${attachmentCountLimit} JPEG, PNG or WebP images, each no larger than 8 MiB.`;
  state.attachmentFiles = [...state.attachmentFiles, ...accepted].slice(0, attachmentCountLimit); $("#attachment").value = ""; renderAttachmentDraft();
}
async function uploadAttachments(conversationId) {
  const attachmentIds = [];
  try {
    for (const file of state.attachmentFiles) {
      const { data } = await request(`/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { "content-type": file.type || "application/octet-stream" }, body: file });
      attachmentIds.push(data.attachment.id);
    }
    return attachmentIds;
  } catch (error) {
    await Promise.all(attachmentIds.map(attachmentId => request(`/api/conversations/${conversationId}/attachments/${attachmentId}`, { method: "DELETE" }).catch(() => undefined)));
    throw error;
  }
}
async function removePendingAttachments(conversationId, attachmentIds) { await Promise.all(attachmentIds.map(attachmentId => request(`/api/conversations/${conversationId}/attachments/${attachmentId}`, { method: "DELETE" }).catch(() => undefined))); }
async function acceptMessage(event) {
  event.preventDefault(); const body = $("#message").value.trim(); if (!body) return; if (!state.conversation) await newConversation(); if (!state.conversation) return;
  let attachmentIds = [];
  try {
    attachmentIds = await uploadAttachments(state.conversation.id);
    const { data } = await request(`/api/conversations/${state.conversation.id}/messages`, { method: "POST", body: { body, attachmentIds, clientRequestId: id() } });
    $("#message").value = ""; clearAttachmentDraft(); state.events.push(data.message); state.run = data.run; renderEvents(); startPolling();
  } catch (error) {
    if (attachmentIds.length) await removePendingAttachments(state.conversation.id, attachmentIds);
    state.attachmentError = error.data?.error === "attachment_too_large" ? "This image is larger than the 8 MiB limit. Your draft is unchanged." : error.data?.error === "invalid_image_attachment" ? "This file is not a complete JPEG, PNG or WebP image. Your draft is unchanged." : "Image upload was not accepted. Your draft is unchanged.";
    renderAttachmentDraft(); toast(error.data?.error === "active_or_missing_conversation" ? "Wait for the current consultation or stop it first." : error.data?.error === "language_not_supported" ? "Messages must be in English or Ukrainian." : state.attachmentError);
  }
}

async function stop() { if (!state.conversation) return; const { data } = await request(`/api/conversations/${state.conversation.id}/stop`, { method: "POST" }); state.run = data.run; renderEvents(); }
async function continueRun() { if (!state.conversation) return; const { data } = await request(`/api/conversations/${state.conversation.id}/continue`, { method: "POST" }); state.run = data.run; renderEvents(); startPolling(); }
function startPolling() { stopPolling(); if (state.run?.status !== "active") return; state.poll = setInterval(async () => { try { const { data } = await request(`/api/conversations/${state.conversation.id}`); const previous = state.events; state.conversation = data.conversation; state.events = data.events; state.run = data.run; announceIncomingMessages(previous, state.events); renderEvents(); if (state.run?.status !== "active") stopPolling(); } catch { stopPolling(); } }, 2_000); }
function stopPolling() { if (state.poll) clearInterval(state.poll); state.poll = null; }

function setTab(tab) { state.tab = tab; document.querySelectorAll("[data-tab]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.tab === tab))); $("#thread").hidden = tab !== "discussion"; $("#composer").hidden = tab !== "discussion"; $("#outcome").hidden = tab !== "outcome"; $("#sources").hidden = tab !== "sources"; }

const recognitionConstructor = () => window.SpeechRecognition ?? window.webkitSpeechRecognition;
const browserLanguage = () => {
  const languages = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  return languages.find(language => /^uk(?:-|$)/iu.test(language)) ?? languages.find(language => /^en(?:-|$)/iu.test(language)) ?? "uk-UA";
};
const clearVoiceTimer = () => { if (state.voiceTimer) clearInterval(state.voiceTimer); state.voiceTimer = null; };
function releaseVoice() {
  clearVoiceTimer();
  const recognition = state.recognition;
  state.recognition = null;
  if (recognition) { recognition.onend = null; recognition.onerror = null; try { recognition.abort(); } catch {} }
}
function setVoiceReady() {
  state.voiceMode = "ready"; state.voiceTranscript = "";
  $("#voice-heading").textContent = "Say what is on your mind.";
  $("#voice-copy").textContent = "Your browser may send speech to its recognition service. NanoDuck receives only text you choose to use.";
  $("#voice-action").textContent = "Start voice input"; $("#voice-action").hidden = false;
  $("#voice-transcript").hidden = true; $("#voice-transcript").value = ""; $("#voice-timer").textContent = "";
}
function voiceFailure(heading, copy) {
  clearVoiceTimer(); state.recognition = null; state.voiceMode = "error";
  $("#voice-heading").textContent = heading; $("#voice-copy").textContent = copy;
  $("#voice-action").textContent = "Retry"; $("#voice-action").hidden = false; $("#voice-timer").textContent = "";
}
function openVoice() {
  releaseVoice(); setVoiceReady();
  if (!recognitionConstructor()) {
    state.voiceMode = "unavailable"; $("#voice-heading").textContent = "Voice input unavailable";
    $("#voice-copy").textContent = "Safari or Chrome voice recognition is unavailable here. Your typed draft is unchanged.";
    $("#voice-action").hidden = true;
  }
  $("#voice-dialog").showModal();
}
function startVoiceRecognition() {
  const Recognition = recognitionConstructor();
  if (!Recognition) return voiceFailure("Voice input unavailable", "Safari or Chrome voice recognition is unavailable here. Your typed draft is unchanged.");
  const recognition = new Recognition();
  recognition.lang = browserLanguage(); recognition.continuous = true; recognition.interimResults = true; recognition.maxAlternatives = 1;
  state.recognition = recognition; state.voiceTranscript = ""; state.voiceMode = "listening";
  $("#voice-heading").textContent = "Listening";
  $("#voice-copy").textContent = `Listening in ${recognition.lang}. Stop when you are ready; sending remains a separate action.`;
  $("#voice-action").textContent = "Stop"; $("#voice-transcript").hidden = true;
  const started = Date.now();
  state.voiceTimer = setInterval(() => { $("#voice-timer").textContent = `Listening · ${Math.floor((Date.now() - started) / 60_000).toString().padStart(2, "0")}:${Math.floor(((Date.now() - started) / 1_000) % 60).toString().padStart(2, "0")}`; }, 250);
  recognition.onresult = event => {
    state.voiceTranscript = Array.from(event.results).map(result => result[0]?.transcript ?? "").join("").trim();
  };
  recognition.onerror = event => {
    if (event.error === "aborted") return;
    const messages = {
      "not-allowed": ["Microphone permission needed", "Allow microphone access in your browser, then retry. Your typed draft is unchanged."],
      "service-not-allowed": ["Voice service unavailable", "Browser speech recognition is unavailable. Your typed draft is unchanged; type instead or retry later."],
      "language-not-supported": ["Language unavailable", "This browser does not support the selected recognition language. Your typed draft is unchanged."],
      network: ["Voice service unavailable", "Check your connection, then retry. Your typed draft is unchanged."],
      "audio-capture": ["Microphone unavailable", "No usable microphone was found. Your typed draft is unchanged."],
      "no-speech": ["No speech detected", "Try again or type instead. Your typed draft is unchanged."]
    };
    const [heading, copy] = messages[event.error] ?? ["Voice input unavailable", "Your typed draft is unchanged. Retry or type instead."];
    voiceFailure(heading, copy);
  };
  recognition.onend = () => {
    clearVoiceTimer();
    if (state.recognition !== recognition || state.voiceMode !== "listening") return;
    state.recognition = null;
    const transcript = state.voiceTranscript.trim();
    if (!transcript) return voiceFailure("No speech detected", "Try again or type instead. Your typed draft is unchanged.");
    state.voiceMode = "transcript"; $("#voice-heading").textContent = "Review your words";
    $("#voice-copy").textContent = "Edit the text if needed. It remains a draft until you send it.";
    $("#voice-transcript").value = transcript; $("#voice-transcript").hidden = false; $("#voice-action").textContent = "Use transcript"; $("#voice-timer").textContent = "";
  };
  try { recognition.start(); } catch { voiceFailure("Voice input unavailable", "Your browser could not start recognition. Your typed draft is unchanged."); }
}
function voiceAction() {
  if (state.voiceMode === "transcript") {
    const transcript = $("#voice-transcript").value.trim();
    if (transcript) $("#message").value = [$("#message").value.trimEnd(), transcript].filter(Boolean).join("\n\n");
    $("#voice-dialog").close(); return;
  }
  if (state.voiceMode === "listening") { try { state.recognition?.stop(); } catch { voiceFailure("Voice input unavailable", "Your typed draft is unchanged. Retry or type instead."); } return; }
  startVoiceRecognition();
}

$("#menu").addEventListener("click", () => { const menu = $("#mobile-nav"); menu.hidden = !menu.hidden; $("#menu").setAttribute("aria-expanded", String(!menu.hidden)); });
document.addEventListener("click", event => { const button = event.target.closest("[data-nav]"); if (button) void nav(button.dataset.nav).catch(() => toast("That page could not be loaded. Please try again.")); const tab = event.target.closest("[data-tab]"); if (tab) setTab(tab.dataset.tab); });
$("#new-conversation").addEventListener("click", () => { clearAttachmentDraft(); void newConversation(); }); $("#composer").addEventListener("submit", event => void acceptMessage(event)); $("#message").addEventListener("keydown", event => { if (event.key !== "Enter" || event.shiftKey || event.isComposing) return; event.preventDefault(); $("#composer").requestSubmit(); }); $("#stop").addEventListener("click", () => void stop()); $("#continue").addEventListener("click", () => void continueRun());
$("#google-sign-in").addEventListener("click", signIn);
$("#development-sign-in").addEventListener("click", signIn);
document.querySelectorAll("[data-session-action]").forEach(button => button.addEventListener("click", () => {
  if (state.session?.authenticated) void signOut(); else void signIn();
}));
$("#consent-check").addEventListener("change", event => { $("#consent-button").disabled = !event.target.checked; }); $("#consent-button").addEventListener("click", async () => { await request("/api/consent", { method: "POST" }); await loadSession(); });
$("#settings-form").addEventListener("submit", async event => {
  event.preventDefault(); saveVisibleCriticSettings();
  const activeCritic = state.criticSettings.criticProvider === "claude_code"
    ? { model: state.criticSettings.criticClaudeModel, reasoning: state.criticSettings.criticClaudeReasoning }
    : { model: state.criticSettings.criticCodexModel, reasoning: state.criticSettings.criticCodexReasoning };
  const settings = { headModel: $("#head-model").value, headReasoning: $("#head-reasoning").value, ...state.criticSettings, criticModel: activeCritic.model, criticReasoning: activeCritic.reasoning, specialistCount: $("#specialist-count").value, discussionDepth: $("#discussion-depth").value, notificationSound: $("#notification-sound").value };
  try {
    const { data } = await request("/api/settings", { method: "PUT", body: settings });
    state.criticSettings = { ...state.criticSettings, ...data.settings }; state.notificationSound = data.settings.notificationSound; toast("Settings saved for future consultations.");
  } catch { toast("Settings were not saved. Check the selected provider and try again."); }
});
$("#preview-notification-sound").addEventListener("click", async () => {
  state.notificationSound = $("#notification-sound").value;
  if (state.notificationSound === "off") return toast("Message sound is off.");
  if (!await playNotificationSound()) return toast("Your browser blocked the sound preview. Check the tab and device sound, then try again.");
  toast(`Playing the ${state.notificationSound} preview.`);
});
$("#runtime-instructions-form").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const revision = $("#runtime-instructions").dataset.revision;
    const { data } = await request("/api/runtime-instructions", { method: "PUT", body: { markdown: $("#runtime-instructions").value, revision } });
    $("#runtime-instructions").value = data.runtimeInstructions.markdown;
    $("#runtime-instructions").dataset.revision = data.runtimeInstructions.revision;
    $("#runtime-instructions-status").textContent = `Saved database document revision ${data.runtimeInstructions.revision.slice(0, 12)}. It applies to future consultations.`;
    const history = await request("/api/runtime-instructions"); state.runtimeInstructionHistory = history.data.history; renderRuntimeInstructionHistory();
    toast("Runtime instructions saved for future consultations.");
  } catch (error) {
    const message = error.data?.message ?? "Runtime instructions were not saved.";
    $("#runtime-instructions-status").textContent = message;
    toast(message);
  }
});
$("#sign-out").addEventListener("click", signOut);
$("#runtime-instructions-version-restore").addEventListener("click", () => void restoreRuntimeInstructionVersion()); $("#runtime-instructions-version-cancel").addEventListener("click", () => $("#runtime-instructions-version-dialog").close()); $("#runtime-instructions-version-close").addEventListener("click", () => $("#runtime-instructions-version-dialog").close());
$("#attach").addEventListener("click", () => $("#attachment").click()); $("#attachment").addEventListener("change", event => chooseAttachments(event.target.files));
$("#voice").addEventListener("click", openVoice); $("#voice-action").addEventListener("click", event => { event.preventDefault(); voiceAction(); }); $("#voice-cancel").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-close").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-dialog").addEventListener("close", releaseVoice); window.addEventListener("pagehide", () => { saveRefreshState(); stopPolling(); releaseVoice(); }); document.addEventListener("visibilitychange", () => { if (document.hidden && state.voiceMode === "listening") { releaseVoice(); voiceFailure("Voice interrupted", "Voice input stopped when the app moved to the background. Your typed draft is unchanged."); } });

async function initialize() {
  const saved = takeRefreshState();
  await loadSession();
  if (!saved || !state.session?.authenticated || !state.session.consented) return;
  try {
    if (saved.page === "discussion" && saved.conversationId) await loadConversation(saved.conversationId);
    else await nav(saved.page);
    if (saved.page === "discussion") setTab(saved.tab);
  } catch {
    // A deleted or unavailable record falls back to the normal authenticated discussion.
    await nav("discussion");
  }
  restoreScroll(saved.scrollY);
}

void initialize().catch(() => toast("The app could not initialize."));
