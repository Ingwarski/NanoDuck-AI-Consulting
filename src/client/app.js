import { createNotificationAudio } from "/client/notification-audio.js";
import { parseMarkdown } from "/client/markdown.js";
import { normalizeRefreshState, refreshStateKey, serializeRefreshState } from "/client/refresh-state.js";

const state = { session: null, csrf: null, page: "discussion", tab: "discussion", conversation: null, events: [], run: null, poll: null, recognition: null, voiceTimer: null, voiceMode: "ready", voiceTranscript: "", attachmentFiles: [], attachmentError: "", pendingSubmissions: new Map(), sending: false, stopping: false, runtimeInstructionHistory: [], documents: [], notificationSound: "off", conversations: [], selectedConversationIds: new Set(), criticSettings: null, criticProviders: null };
const logoutPendingKey = "nanoduck-logout-pending-v1";
const activeRequests = new Set();
let privacyLocked = false; let clientGeneration = 0; let initializing = true;
const $ = selector => document.querySelector(selector);
const roleInitials = { owner: "I", "Head Consultant": "HC", "Strategy Consultant": "SC", "Finance Consultant": "FC", "Operations Consultant": "OC", "Sales Consultant": "SL", "Marketing Consultant": "MC", "Product Consultant": "PC", "Spiritual Consultant": "SP", Psychotherapist: "PT", "Risk Consultant": "RC", Critic: "CR", System: "•" };
const displayRole = role => role === "owner" ? "You" : role;
const initialsFor = role => roleInitials[role] ?? role.split(/\s+/u).filter(Boolean).slice(0, 2).map(word => word[0].toLocaleUpperCase()).join("").slice(0, 2);

const request = async (path, options = {}) => {
  if (privacyLocked && !["/api/session", "/api/logout"].includes(path)) throw new Error("client_locked");
  const generation = clientGeneration; const controller = new AbortController();
  activeRequests.add(controller);
  const headers = new Headers(options.headers);
  if (state.csrf && !["GET", "HEAD"].includes(options.method ?? "GET")) headers.set("x-csrf-token", state.csrf);
  if (options.body && typeof options.body !== "string" && !(options.body instanceof FormData) && !(options.body instanceof Blob)) { headers.set("content-type", "application/json"); options.body = JSON.stringify(options.body); }
  const deadline = path === "/api/logout" || (privacyLocked && path === "/api/session") ? setTimeout(() => controller.abort(), 10_000) : undefined;
  try {
    const response = await fetch(path, { ...options, headers, signal: controller.signal, credentials: "same-origin" });
    const data = response.status === 204 ? undefined : await response.json().catch(() => undefined);
    if (generation !== clientGeneration || controller.signal.aborted) throw new Error("client_locked");
    if (response.status === 401 && path !== "/api/auth/local" && !privacyLocked) {
      clearPrivateClientContent(); clearRefreshState();
      state.session = { authenticated: false }; state.csrf = null;
      showSignIn(); updateSessionActions();
    }
    if (!response.ok) throw Object.assign(new Error(data?.error ?? "request_failed"), { response, data });
    return { response, data };
  } finally { clearTimeout(deadline); activeRequests.delete(controller); }
};

const toast = message => { if (privacyLocked) return; const item = $("#toast"); item.textContent = message; item.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { item.hidden = true; }, 4_000); };
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
let soundPreferenceLoaded = false;
let notificationAudio = createNotificationAudio({ onStatusChange: renderSoundStatus });
function renderSoundStatus() {
  const status = notificationAudio.status;
  const notice = $("#sound-notice");
  notice.hidden = privacyLocked || !state.session?.authenticated || !state.session.consented || (soundPreferenceLoaded && ["off", "ready"].includes(status));
  notice.dataset.status = soundPreferenceLoaded ? status : "loading";
  $("#sound-status").textContent = !soundPreferenceLoaded ? "Message sound settings are unavailable." : status === "blocked" ? "Your browser blocked message sounds." : status === "unavailable" ? "Message sound could not play. Check your device sound and try again." : "Enable message sounds for this browser tab.";
  $("#enable-notification-sound").textContent = soundPreferenceLoaded ? "Enable sound" : "Retry sound settings";
}
function setNotificationPreference(name) {
  soundPreferenceLoaded = true;
  state.notificationSound = name ?? "knock";
  notificationAudio.setPreference(state.notificationSound);
  renderSoundStatus();
}
async function loadNotificationPreference() {
  try { const { data } = await request("/api/settings"); setNotificationPreference(data.settings.notificationSound); }
  catch { renderSoundStatus(); }
}
const primeNotificationAudio = () => {
  if (!privacyLocked && state.session?.authenticated && state.session.consented && soundPreferenceLoaded) void notificationAudio.prime();
};
const announceIncomingMessages = (before, after) => {
  const previous = new Set(before.map(event => event.id));
  const incoming = after.filter(event => !["owner", "System"].includes(event.role) && !previous.has(event.id));
  if (!incoming.length) return;
  if (!privacyLocked && soundPreferenceLoaded) void notificationAudio.play();
  $("#message-announcement").textContent = incoming.length === 1 ? `${displayRole(incoming[0].role)} sent a message.` : `${incoming.length} new consultation messages are available.`;
};

const saveRefreshState = () => {
  if (privacyLocked || !state.session?.authenticated || !state.session.consented) return;
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
  if (privacyLocked || !state.session?.authenticated || !state.session.consented) return;
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
    button.textContent = privacyLocked ? "Retry Logoff" : state.session?.authenticated ? "Logoff" : "Login";
    button.disabled = (!privacyLocked && !state.session) || busy;
  });
  $("#sign-out").disabled = busy;
  $("#local-sign-in").disabled = privacyLocked || busy;
  if ($("#retry-logoff")) $("#retry-logoff").disabled = busy;
}

function clearPrivateClientContent() {
  clientGeneration++;
  for (const controller of activeRequests) controller.abort();
  activeRequests.clear(); stopPolling(); releaseVoice();
  state.conversation = null; state.events = []; state.run = null; usageRequest++; panelUsageSignature = undefined;
  state.attachmentFiles = []; state.attachmentError = ""; state.pendingSubmissions.clear();
  state.runtimeInstructionHistory = []; state.documents = []; state.conversations = [];
  state.selectedConversationIds.clear(); state.criticSettings = null; state.criticProviders = null;
  resetCriticConnectionCheck();
  state.voiceTranscript = ""; state.voiceMode = "ready"; state.notificationSound = "off";
  soundPreferenceLoaded = false; notificationAudio.dispose();
  notificationAudio = createNotificationAudio({ onStatusChange: renderSoundStatus });
  $("#sound-notice").hidden = true;
  for (const dialog of document.querySelectorAll("dialog[open]")) dialog.close();
  for (const field of document.querySelectorAll("textarea, input")) { field.value = ""; if (field.type === "checkbox") field.checked = false; }
  for (const select of document.querySelectorAll("select")) select.selectedIndex = Math.max(0, [...select.options].findIndex(option => option.defaultSelected));
  for (const element of document.querySelectorAll("[data-revision], [data-name], [data-history-id], [data-current]")) for (const key of ["revision", "name", "historyId", "current"]) delete element.dataset[key];
  for (const selector of ["#thread", "#outcome", "#sources", "#usage-content", "#usage-status", "#conversation-list", "#conversation-toolbar", "#attachment-list", "#runtime-instruction-history", "#managed-document-history", "#settings-status", "#runtime-instructions-status", "#managed-document-status", "#session-expiry", "#runtime-instructions-version-meta", "#message-announcement", "#voice-timer", "#toast"]) $(selector)?.replaceChildren();
  clearTimeout(toast.timer); $("#toast").hidden = true; $("#app").hidden = true; $("#consent").hidden = true; $("#sign-in").hidden = true;
}

function lockForLogoff() {
  privacyLocked = true;
  try { sessionStorage.setItem(logoutPendingKey, "1"); } catch { /* The current page still locks if browser storage is disabled. */ }
  clearRefreshState(); clearPrivateClientContent(); closeMenu();
  $("#new-conversation").disabled = true;
  if (!$("#logout-pending")) {
    const panel = node("section", { id: "logout-pending", class: "consent-card" });
    panel.append(node("h1", {}, "Private content cleared."), node("p", { id: "logout-status", role: "status" }));
    const retry = node("button", { id: "retry-logoff", type: "button", class: "primary" }, "Retry Logoff");
    retry.addEventListener("click", () => void signOut()); panel.append(retry); $("#main").append(panel);
  }
  $("#logout-status").textContent = "Server sign-out is unconfirmed. Reconnect and choose Retry Logoff. This page stays locked until sign-out is confirmed.";
  updateSessionActions();
}

function completeLogoff() {
  try { sessionStorage.removeItem(logoutPendingKey); } catch {}
  state.session = null; state.csrf = null;
  location.reload();
}

async function signIn() {
  closeMenu(); updateSessionActions(true);
  try {
    await request("/api/auth/local", { method: "POST", body: { password: $("#local-password").value } });
    await loadSession();
  } catch { toast("Login failed. Check your password, or wait a minute after repeated attempts."); }
  finally { $("#local-password").value = ""; updateSessionActions(); }
}

async function signOut() {
  lockForLogoff(); updateSessionActions(true);
  $("#logout-status").textContent = "Private content is cleared. Confirming server sign-out…";
  try {
    if (!state.csrf) {
      const { data } = await request("/api/session");
      if (data?.authenticated === false) return completeLogoff();
      if (data?.authenticated !== true || typeof data.csrfToken !== "string" || !data.csrfToken) throw new Error("session_status_unconfirmed");
      state.csrf = data.csrfToken;
    }
    const { response } = await request("/api/logout", { method: "POST" });
    if (response.status !== 204) throw new Error("logoff_unconfirmed");
    completeLogoff();
  } catch {
    // A lost response may already have revoked the session; only a fresh server
    // answer can confirm that. Never unlock merely because connectivity returns.
    try {
      const { data } = await request("/api/session");
      if (data?.authenticated === false) return completeLogoff();
      if (data?.csrfToken) state.csrf = data.csrfToken;
    } catch {}
    $("#logout-status").textContent = "Server sign-out is unconfirmed. Reconnect and choose Retry Logoff. This page stays locked until sign-out is confirmed.";
    updateSessionActions();
  }
}

function showAuthenticated() { $("#sign-in").hidden = true; $("#consent").hidden = true; $("#app").hidden = initializing; nav("discussion"); }
function showSignIn() {
  stopPolling(); $("#app").hidden = true; $("#consent").hidden = true; $("#sign-in").hidden = false;

}
function showConsent() { $("#sign-in").hidden = true; $("#app").hidden = true; $("#consent").hidden = false; }

async function loadSession() {
  const { data } = await request("/api/session"); state.session = data;
  updateSessionActions();
  if (!data.authenticated) { clearPrivateClientContent(); clearRefreshState(); state.csrf = null; return showSignIn(); } state.csrf = data.csrfToken;
  if (!data.consented) return showConsent();
  await loadNotificationPreference();
  if (!privacyLocked && state.session?.authenticated && state.session.consented) showAuthenticated();
}

function renderEvents() {
  const thread = clear($("#thread"));
  if (state.events.length === 0) {
    const empty = node("div", { class: "empty" }); empty.append(node("h2", {}, "Bring in the decision."), node("p", {}, "The specialists and Critic review your question before the Head presents consolidated advice.")); thread.append(empty);
  }
  for (const event of state.events) {
    const message = node("article", { class: "message", "data-role": event.role });
    message.append(node("div", { class: "avatar", "aria-hidden": true }, initialsFor(event.role)));
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
  const active = state.run?.status === "active"; renderRunControls(); $("#continue").hidden = !["stopped", "failed"].includes(state.run?.status);
  $("#continue").textContent = state.run?.status === "failed" ? "Retry" : "Continue";
  if (active) {
    const indicator = node("div", { class: "thinking-indicator", role: "img", ariaLabel: "The consultation is thinking. The next message will appear here." });
    const cloud = node("span", { class: "thought-cloud", ariaHidden: true }); cloud.append(node("i"), node("i"), node("i"));
    indicator.append(cloud, node("span", {}, "The team is thinking…")); thread.append(indicator);
  }
  const labels = { active: "The team is preparing the next message.", stopped: "Consultation stopped. Confirmed discussion is preserved.", complete: "Discussion complete.", failed: "Paused before the next reply. Retry to continue here." };
  const work = state.run?.progress;
  const completed = work?.completed ?? 0;
  const total = work?.total ?? 0;
  const progress = active && total ? completed < total ? `${completed} of ${total} consultant answers received.` : `Consultants answered. Critic review ${work.round || 1} is in progress.` : null;
  $("#run-status").textContent = state.stopping ? "Stopping the consultation…" : (progress ?? labels[state.run?.status] ?? "Describe the decision you want to make.");
  renderOutcome(); renderSources();
}

function renderOutcome() { const target = clear($("#outcome")); const ownerIndex = state.events.map(event => event.role).lastIndexOf("owner"); const outcome = state.events.slice(ownerIndex + 1).find(event => event.role === "Head Consultant" && !event.recipient); if (outcome) { const body = node("div", { class: "message-body outcome-body" }); renderMarkdown(body, outcome.body); target.append(body); } else target.append(node("div", { class: "empty" }, "Consolidated advice appears after every specialist's final position and the Critic's closing review.")); }
function renderSources() { const target = clear($("#sources")); const sources = [...new Map(state.events.flatMap(event => event.sources ?? []).map(source => [source.url, source])).values()]; if (!sources.length) { target.append(node("div", { class: "empty" }, "Sources appear here when live research materially informs the discussion.")); return; } for (const source of sources) { const dates = [`Retrieved ${formatDate(source.retrievedAt)}`]; if (source.publishedAt) dates.push(`Published ${formatDate(source.publishedAt)}`); const card = node("article", { class: "source-card" }); card.append(node("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title), node("p", {}, source.claim), node("p", { class: "hint" }, dates.join(" · "))); target.append(card); } }

async function loadConversation(conversationId, { preserveAttachmentDraft = false } = {}) {
  const { data } = await request(`/api/conversations/${encodeURIComponent(conversationId)}`); state.conversation = data.conversation; state.events = data.events; state.run = data.run; renderEvents(); await nav("discussion"); setTab("discussion"); startPolling();
  if (!preserveAttachmentDraft) clearAttachmentDraft();
}

async function newConversation() { if (privacyLocked || initializing) return; try { const { data } = await request("/api/conversations", { method: "POST" }); await loadConversation(data.conversation.id, { preserveAttachmentDraft: true }); $("#message").focus(); } catch { toast("Could not create a conversation."); } }
function prepareConversationsPage() {
  const page = $("#conversations-page"); const intro = page.querySelector(".page-intro");
  if (!intro.dataset.prepared) { clear(intro).append(node("p", { class: "eyebrow" }, "Conversations")); intro.dataset.prepared = "true"; }
  if ($("#conversation-toolbar")) return;
  const toolbar = node("div", { id: "conversation-toolbar", class: "conversation-toolbar" });
  page.insertBefore(toolbar, $("#conversation-list"));
}
function clearDeletedConversation(ids) {
  for (const id of ids) state.pendingSubmissions.delete(id);
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
  if (status === "auth_required") return `${criticProviderName(provider)} needs subscription sign-in.`;
  if (status === "quota_blocked") return `${criticProviderName(provider)} has reached its current limit.`;
  if (status === "incompatible") return `${criticProviderName(provider)} does not support the selected configuration.`;
  if (status === "provider_unavailable") return `${criticProviderName(provider)} could not be reached. Try checking the connection again.`;
  return `${criticProviderName(provider)} is unavailable on the computer running NanoDuck.`;
};
let criticConnectionGeneration = 0;
const showCriticConnectionStatus = message => {
  const status = $("#critic-connection-status");
  if (status) { status.textContent = message; status.hidden = !message; }
};
const claudeConnectionMessage = () => {
  const status = state.criticProviders?.claude_code?.status;
  if (status === "ready") return "Claude Code is connected. You can select it for the Critic.";
  if (status === "auth_required") return "Claude Code needs subscription sign-in. On the computer running NanoDuck, run npm run claude:login, then check the connection again.";
  if (status === "quota_blocked") return "Claude Code has reached its current usage limit. Check the connection again after the limit resets.";
  if (status === "incompatible") return "Claude Code does not support the current configuration. Check its version and model settings, then check the connection again.";
  if (status === "provider_unavailable") return "Claude Code could not be reached. Try Check connection again.";
  return "Claude Code is unavailable on the computer running NanoDuck. Check the connection again.";
};
function resetCriticConnectionCheck() {
  criticConnectionGeneration++;
  const button = $("#check-critic-connection");
  if (button) { button.disabled = false; button.textContent = "Check connection"; }
  showCriticConnectionStatus("");
}
const settingsCapabilities = data => data.criticProviders ?? { codex: { status: data.provider, models: data.catalog ?? [] }, claude_code: { status: "unavailable", models: [] } };
async function checkCriticConnection() {
  const button = $("#check-critic-connection");
  if (button.disabled || !state.criticSettings || privacyLocked) return;
  const generation = ++criticConnectionGeneration;
  button.disabled = true; button.textContent = "Checking…"; showCriticConnectionStatus("Checking the Claude Code connection…");
  try {
    const { data } = await request("/api/settings");
    if (generation !== criticConnectionGeneration || privacyLocked || !state.criticSettings) return;
    // Read the controls after the request: edits made while checking are drafts
    // too. Refresh only capabilities, never the server's saved settings.
    const headModel = $("#head-model").value; const headReasoning = $("#head-reasoning").value;
    saveVisibleCriticSettings(); state.criticProviders = settingsCapabilities(data);
    renderHeadControls(headModel, headReasoning, true); renderCriticControls();
    showCriticConnectionStatus(claudeConnectionMessage());
  } catch {
    if (generation !== criticConnectionGeneration || privacyLocked || !state.criticSettings) return;
    saveVisibleCriticSettings();
    state.criticProviders = { ...state.criticProviders, claude_code: { status: "provider_unavailable", models: [] } };
    renderCriticControls();
    showCriticConnectionStatus("The connection check could not finish. Your choices are unchanged. Try Check connection again.");
  } finally {
    if (generation === criticConnectionGeneration) { button.disabled = false; button.textContent = "Check connection"; }
  }
}
const replaceOptions = (select, options, selected) => {
  clear(select);
  for (const option of options) select.append(node("option", { value: option.id, disabled: Boolean(option.disabled) }, option.label ?? option.id));
  if (options.some(option => option.id === selected)) select.value = selected;
};
const codexModelOptions = (selectedModel, selectedEffort) => {
  const available = state.criticProviders?.codex?.models ?? [];
  const choices = new Map([["gpt-6-astra", "gpt-6-astra"], ["gpt-6-sol", "GPT-6 Sol"]]);
  if (selectedModel && !choices.has(selectedModel)) choices.set(selectedModel, selectedModel);
  return [...choices].map(([id, label]) => {
    const model = available.find(candidate => candidate.id === id && candidate.efforts?.length);
    return model ? { ...model, label } : { id, label: `${label} — unavailable`, disabled: true, efforts: id === selectedModel && selectedEffort ? [selectedEffort] : [] };
  });
};
const modelEffortOptions = (model, selectedEffort, preserveEffort, label = id => id) => {
  const options = model.efforts.map(id => ({ id, label: label(id) }));
  if (preserveEffort && selectedEffort && !model.efforts.includes(selectedEffort)) options.push({ id: selectedEffort, label: `${label(selectedEffort)} — unavailable`, disabled: true });
  return options;
};
function renderHeadControls(selectedModel = $("#head-model").value, selectedEffort = $("#head-reasoning").value, preserveEffort = false) {
  const models = codexModelOptions(selectedModel, selectedEffort);
  replaceOptions($("#head-model"), models, selectedModel);
  const current = models.find(model => model.id === $("#head-model").value) ?? models[0];
  replaceOptions($("#head-reasoning"), modelEffortOptions(current, selectedEffort, preserveEffort), selectedEffort);
  $("#head-reasoning").disabled = Boolean(current.disabled);
}
function ensureCriticProviderControl() {
  if ($("#critic-provider")) return;
  const fieldset = $("#critic-model").closest("fieldset"); const first = fieldset.querySelector("label");
  const label = node("label", {}, "Provider"); const select = node("select", { id: "critic-provider" });
  label.append(select); fieldset.insertBefore(label, first);
  const connection = node("div", { class: "sound-preview" });
  const check = node("button", { id: "check-critic-connection", type: "button", class: "secondary" }, "Check connection");
  check.setAttribute("aria-describedby", "critic-connection-status");
  const status = node("p", { id: "critic-connection-status", class: "hint", role: "status", hidden: true });
  check.addEventListener("click", () => void checkCriticConnection()); connection.append(check, status); fieldset.append(connection);
  select.addEventListener("change", () => {
    const next = select.value;
    if (next === "claude_code" && state.criticProviders?.claude_code?.status !== "ready") {
      select.value = state.criticSettings.criticProvider; showCriticConnectionStatus(claudeConnectionMessage()); return;
    }
    showCriticConnectionStatus("");
    saveVisibleCriticSettings(); state.criticSettings.criticProvider = next; renderCriticControls();
  });
}
function saveVisibleCriticSettings() {
  if (!state.criticSettings) return;
  // A provider change has already changed the select; these controls still
  // belong to the previously rendered provider until renderCriticControls.
  if (state.criticSettings.criticProvider === "claude_code") {
    state.criticSettings.criticClaudeModel = $("#critic-model").value; state.criticSettings.criticClaudeReasoning = $("#critic-reasoning").value;
  } else {
    state.criticSettings.criticCodexModel = $("#critic-model").value; state.criticSettings.criticCodexReasoning = $("#critic-reasoning").value;
  }
}
function renderCriticControls(preserveEffort = true) {
  const provider = state.criticSettings.criticProvider; const capability = state.criticProviders?.[provider] ?? { status: "unavailable", models: [] };
  $("#critic-provider").value = provider;
  const selectedModel = provider === "claude_code" ? state.criticSettings.criticClaudeModel : state.criticSettings.criticCodexModel;
  const selectedEffort = provider === "claude_code" ? state.criticSettings.criticClaudeReasoning ?? "high" : state.criticSettings.criticCodexReasoning;
  const models = provider === "codex" ? codexModelOptions(selectedModel, selectedEffort) : capability.models?.length ? [...capability.models]
    : ["claude-opus-5", "claude-opus-5-5"].map(id => ({ id, label: id === "claude-opus-5" ? "Opus 5" : "Opus 5.5", efforts: ["low", "medium", "high", "extra", "max"] }));
  if (selectedModel && !models.some(model => model.id === selectedModel)) models.push({ id: selectedModel, label: `${selectedModel} — unavailable`, disabled: true, efforts: selectedEffort ? [selectedEffort] : [] });
  replaceOptions($("#critic-model"), models, selectedModel);
  const current = models.find(model => model.id === $("#critic-model").value) ?? models[0];
  const effortLabel = id => provider === "claude_code" ? ({ low: "Low", medium: "Medium", high: "High", extra: "Extra", max: "Max" }[id] ?? id) : id;
  replaceOptions($("#critic-reasoning"), modelEffortOptions(current, selectedEffort, preserveEffort, effortLabel), selectedEffort);
  const unavailable = provider === "claude_code" && capability.status !== "ready";
  $("#critic-model").disabled = unavailable; $("#critic-reasoning").disabled = unavailable || Boolean(current.disabled);
  $("#settings-status").textContent = [criticProviderStatus("codex"), ...(provider === "claude_code" ? [criticProviderStatus("claude_code")] : []), "Account-wide subscription usage and reset time are unavailable. Conversation token counts are in Discussion → Usage."].join(" ");
  if (unavailable) showCriticConnectionStatus(claudeConnectionMessage());
}
async function loadSettings() {
  resetCriticConnectionCheck();
  const [{ data: settingsData }, { data: instructionsData }, { data: documentData }] = await Promise.all([request("/api/settings"), request("/api/runtime-instructions"), request("/api/instruction-documents")]); const settings = settingsData.settings; const instructions = instructionsData.runtimeInstructions;
  state.criticProviders = settingsCapabilities(settingsData);
  renderHeadControls(settings.headModel, settings.headReasoning, true);
  state.criticSettings = {
    criticProvider: settings.criticProvider ?? "codex",
    criticCodexModel: settings.criticCodexModel ?? settings.criticModel,
    criticCodexReasoning: settings.criticCodexReasoning ?? settings.criticReasoning,
    criticClaudeModel: settings.criticClaudeModel === "claude-code-default" ? undefined : settings.criticClaudeModel,
    criticClaudeReasoning: ["default", "xhigh"].includes(settings.criticClaudeReasoning) ? undefined : settings.criticClaudeReasoning
  };
  ensureCriticProviderControl(); replaceOptions($("#critic-provider"), [{ id: "codex", label: "GPT (Codex)" }, { id: "claude_code", label: "Claude Code" }], state.criticSettings.criticProvider); renderCriticControls();
  $("#specialist-count").value = settings.specialistCount; $("#discussion-depth").value = settings.discussionDepth; $("#notification-sound").value = settings.notificationSound ?? "knock"; setNotificationPreference($("#notification-sound").value);
  $("#runtime-instructions").value = instructions.markdown;
  $("#runtime-instructions").dataset.revision = instructions.revision;
  $("#runtime-instructions-status").textContent = `Current encrypted local revision ${instructions.revision.slice(0, 12)}. Required headings and placeholders are validated before save.`;
  state.runtimeInstructionHistory = instructionsData.history; renderRuntimeInstructionHistory();
  state.documents = documentData.documents; await loadManagedDocument();
  $("#session-expiry").textContent = `This session expires ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.session.expiresAt))}. Activity does not extend the 24-hour boundary.`;
}

async function loadManagedDocument() {
  const name = $("#managed-document-name").value;
  const document = state.documents.find(item => item.name === name);
  if (!document) return;
  const editor = $("#managed-document-markdown"); editor.value = document.markdown; editor.dataset.revision = String(document.revision); editor.dataset.name = name;
  $("#managed-document-status").textContent = `Revision ${document.revision}. Saved privately; changes apply to future consultations.`;
  const { data } = await request(`/api/instruction-documents/${name}/history`);
  if ($("#managed-document-name").value !== name) return;
  replaceOptions($("#managed-document-history"), data.result.map(item => ({ id: String(item.revision), label: `Revision ${item.revision} · ${formatDate(item.createdAt)} · ${item.action}` })), String(document.revision));
}
async function saveManagedDocument(restoreDefault = false) {
  const editor = $("#managed-document-markdown"); const name = editor.dataset.name;
  if (restoreDefault && !confirm(`Restore the packaged default for ${name}? Your current version remains in history.`)) return;
  const controls = ["#managed-document-name", "#managed-document-save", "#managed-document-default", "#managed-document-review"].map($);
  controls.forEach(control => { control.disabled = true; });
  try {
    const { data } = await request(`/api/instruction-documents/${name}${restoreDefault ? "/restore-default" : ""}`, { method: "PUT", body: { revision: Number(editor.dataset.revision), ...(restoreDefault ? { confirmed: true } : { markdown: editor.value }) } });
    state.documents = state.documents.map(item => item.name === name ? data.document : item);
    await loadManagedDocument(); toast("Document saved for future consultations.");
  } catch (error) {
    const message = error.response?.status === 409 ? "This document changed in another session. Your draft is still here; copy it before reloading Settings." : "Document was not saved. Use non-empty Markdown up to 64 KiB.";
    $("#managed-document-status").textContent = message; toast(message);
  } finally { controls.forEach(control => { control.disabled = false; }); }
}
$("#managed-document-form").addEventListener("submit", event => { event.preventDefault(); void saveManagedDocument(); });
$("#managed-document-default").addEventListener("click", () => void saveManagedDocument(true));
$("#managed-document-name").addEventListener("change", () => {
  const editor = $("#managed-document-markdown"); const saved = state.documents.find(item => item.name === editor.dataset.name);
  if (saved && saved.markdown !== editor.value && !confirm("Discard the unsaved document draft?")) { $("#managed-document-name").value = saved.name; return; }
  void loadManagedDocument().catch(() => toast("Document history could not be loaded."));
});
$("#managed-document-review").addEventListener("click", async () => {
  const name = $("#managed-document-name").value; const revision = $("#managed-document-history").value;
  if (!revision) return;
  try {
    const editor = $("#managed-document-markdown"); const saved = state.documents.find(item => item.name === name);
    if (saved && saved.markdown !== editor.value && !confirm("Replace the unsaved draft with the selected version?")) return;
    const { data } = await request(`/api/instruction-documents/${name}/history/${revision}`);
    if ($("#managed-document-name").value !== name) return;
    editor.value = data.result.markdown;
    $("#managed-document-status").textContent = `Reviewing revision ${revision}. Save to make this text the new current version.`;
  } catch { toast("That saved version could not be opened."); }
});

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
async function uploadAttachments(conversationId, files) {
  const attachmentIds = [];
  try {
    for (const file of files) {
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
const matchesSubmissionDraft = submission => $("#message").value.trim() === submission.input.body && state.attachmentFiles.length === submission.files.length && state.attachmentFiles.every((file, index) => file === submission.files[index]);
async function acceptMessage(event) {
  event.preventDefault();
  if (privacyLocked || state.sending || state.run?.status === "active") return;
  primeNotificationAudio();
  const body = $("#message").value.trim();
  if (!body && !state.pendingSubmissions.has(state.conversation?.id)) return;
  const files = [...state.attachmentFiles];
  state.sending = true; $("#send").disabled = true;
  let submission; let conversationId;
  try {
    if (!state.conversation) await newConversation();
    if (!state.conversation) return;
    conversationId = state.conversation.id;
    submission = state.pendingSubmissions.get(conversationId);
    if (!submission) {
      const attachmentIds = await uploadAttachments(conversationId, files);
      submission = { input: { body, attachmentIds, clientRequestId: id() }, files, uncertain: false };
      state.pendingSubmissions.set(conversationId, submission);
    }
    // An ambiguous response is retried with exactly the original accepted tuple.
    // This state lives only in the page; later draft edits are never sent under its key.
    const { data } = await request(`/api/conversations/${conversationId}/messages`, { method: "POST", body: submission.input });
    if (!data?.message?.id || !data?.run?.id) throw new Error("acceptance_response_incomplete");
    state.pendingSubmissions.delete(conversationId);
    if (state.conversation?.id === conversationId) {
      const unchanged = matchesSubmissionDraft(submission);
      if (unchanged) { $("#message").value = ""; clearAttachmentDraft(); }
      else { state.attachmentError = ""; renderAttachmentDraft(); toast("Your earlier message is saved. Your edited draft has not been sent."); }
      if (!state.events.some(message => message.id === data.message.id)) state.events.push(data.message);
      state.run = data.run; renderEvents(); startPolling();
      if (data.replayed) await loadConversation(conversationId, { preserveAttachmentDraft: true }).catch(() => toast("Your message is saved. Reopen this conversation to load its latest replies."));
    } else toast("Your earlier message is saved in its conversation.");
  } catch (error) {
    if (privacyLocked || !state.session?.authenticated) return;
    const rejected = error.response?.status >= 400 && error.response.status < 500;
    if (submission && (submission.uncertain || !rejected)) {
      submission.uncertain = true;
      state.attachmentError = "Delivery is unconfirmed. Press Send to check the earlier message safely; any edited draft stays unsent.";
    } else {
      if (submission) { state.pendingSubmissions.delete(conversationId); await removePendingAttachments(conversationId, submission.input.attachmentIds); }
      state.attachmentError = error.data?.error === "attachment_too_large" ? "This image is larger than the 8 MiB limit. Your draft is unchanged." : error.data?.error === "invalid_image_attachment" ? "This file is not a complete JPEG, PNG or WebP image. Your draft is unchanged." : error.data?.error === "active_or_missing_conversation" ? "Wait for the current consultation or stop it first. Your draft is unchanged." : error.data?.error === "language_not_supported" ? "Messages must be in English or Ukrainian. Your draft is unchanged." : error.data?.error === "authentication_required" ? "Sign in again before sending. Your draft is unchanged." : "The message could not be sent. Your draft is unchanged.";
    }
    renderAttachmentDraft(); toast(state.attachmentError);
  } finally { state.sending = false; $("#send").disabled = false; }
}

function renderRunControls() {
  const active = state.run?.status === "active";
  const composer = $("#composer");
  const moveFocus = active && !composer.hidden && (composer.contains(document.activeElement) || document.activeElement === document.body);
  composer.hidden = active || state.tab !== "discussion";
  $(".topic").dataset.active = String(active);
  $("#stop").hidden = !active; $("#stop").disabled = state.stopping;
  if (moveFocus) $("#run-status").focus({ preventScroll: true });
}
async function stop() {
  if (!state.conversation || state.run?.status !== "active" || state.stopping) return;
  const conversationId = state.conversation.id;
  state.stopping = true; stopPolling(); renderEvents();
  try {
    const { data } = await request(`/api/conversations/${conversationId}/stop`, { method: "POST" });
    if (state.conversation?.id !== conversationId) return;
    state.run = data.run; renderEvents();
    if (state.tab === "discussion") $("#message").focus({ preventScroll: true });
  } catch { toast("Stop could not be confirmed. Please try again."); }
  finally { state.stopping = false; renderRunControls(); if (state.conversation?.id === conversationId) { renderEvents(); startPolling(); } }
}
async function continueRun() {
  if (!state.conversation || $("#continue").disabled) return;
  primeNotificationAudio();
  const conversationId = state.conversation.id;
  $("#continue").disabled = true;
  try {
    const { data } = await request(`/api/conversations/${conversationId}/continue`, { method: "POST" });
    if (state.conversation?.id !== conversationId) return;
    state.run = data.run; renderEvents(); startPolling();
  }
  catch (error) { toast(error.response?.status === 409 ? "Another consultation is running or this one is no longer paused. Reopen it and try again." : "Could not resume. Your saved discussion is unchanged. Try again."); }
  finally { $("#continue").disabled = false; }
}
let pollGeneration = 0;
function startPolling() {
  stopPolling(); if (state.run?.status !== "active") return;
  const generation = pollGeneration; const conversationId = state.conversation.id; let pending = false;
  state.poll = setInterval(async () => {
    if (pending) return; pending = true;
    try {
      const { data } = await request(`/api/conversations/${conversationId}`);
      if (generation !== pollGeneration || state.conversation?.id !== conversationId) return;
      const previous = state.events; state.conversation = data.conversation; state.events = data.events; state.run = data.run;
      announceIncomingMessages(previous, state.events); renderEvents(); if (state.tab === "usage" && state.page === "discussion") void loadUsage({ quiet: true }); if (state.run?.status !== "active") stopPolling();
    } catch { if (generation === pollGeneration) stopPolling(); }
    finally { pending = false; }
  }, 2_000);
}
function stopPolling() { pollGeneration++; if (state.poll) clearInterval(state.poll); state.poll = null; }

let usageRequest = 0;
const tokenNumber = value => value === null ? "Unavailable" : new Intl.NumberFormat().format(value);
function renderUsage(usage) {
  const panel = clear($("#usage-content"));
  panel.append(node("p", { class: "usage-total" }, tokenNumber(usage.total)), node("p", { class: "hint" }, "Reported tokens · input + output"));
  const note = usage.attempts ? `${usage.attempts} call attempts · ${usage.incomplete} running or interrupted · ${usage.unavailable} without complete usage. First recorded call: ${formatDate(usage.startedAt)}.` : "No model calls have been recorded in this view yet.";
  panel.append(node("p", { class: "usage-coverage" }, note), node("p", { class: "hint" }, "Calls made before tracking was added are not included. Missing counts are unavailable, never estimated. These are NanoDuck conversation totals, not your account’s subscription allowance."));
  for (const model of usage.models) {
    const row = node("article", { class: "usage-model" });
    row.append(node("h3", {}, model.model), node("p", { class: "hint" }, `${model.provider === "claude_code" ? "Claude Code" : "Codex"} · ${model.calls} call attempts`));
    const metric = (label, field) => {
      const value = model.tokens[field]; const group = node("div");
      group.append(node("dt", {}, label), node("dd", {}, tokenNumber(value.value)));
      if (value.unavailable && value.value !== null) group.append(node("small", { class: "hint" }, `${value.unavailable} call(s) unreported`));
      return group;
    };
    const main = node("dl", { class: "usage-metrics" });
    main.append(metric("Input", "input"), metric("Output", "output"), metric("Total", "total")); row.append(main);
    const details = node("details"); details.append(node("summary", {}, "Cache and reasoning breakdown"));
    const breakdown = node("dl", { class: "usage-metrics" });
    breakdown.append(metric("Cache read", "cachedInput"), metric("Cache write", "cacheWriteInput"), metric("Reasoning output", "reasoningOutput"));
    details.append(breakdown, node("p", { class: "hint" }, "These are included in input or output totals. They are not added again.")); row.append(details); panel.append(row);
  }
}
async function loadUsage({ quiet = false } = {}) {
  const requestId = ++usageRequest; const conversationId = state.conversation?.id;
  const select = $("#usage-scope"); select.options[0].disabled = !conversationId;
  if (!conversationId) select.value = "all";
  const scope = select.value;
  if (!quiet) { clear($("#usage-content")); $("#usage-status").textContent = "Loading usage…"; }
  try {
    const { data } = await request(`/api/usage${scope === "conversation" ? `?conversationId=${encodeURIComponent(conversationId)}` : ""}`);
    if (requestId !== usageRequest || state.tab !== "usage" || conversationId !== state.conversation?.id || scope !== select.value) return;
    const signature = JSON.stringify(data.usage);
    if (panelUsageSignature !== signature || !$("#usage-content").childNodes.length) { renderUsage(data.usage); panelUsageSignature = signature; }
    $("#usage-status").textContent = "Usage updates as provider calls finish.";
  } catch {
    if (requestId === usageRequest && !privacyLocked && state.session?.authenticated) $("#usage-status").textContent = "Usage could not refresh. Any shown counts may be out of date. Choose Refresh usage to try again.";
  }
}
document.querySelector(".tabs").addEventListener("keydown", event => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = [...document.querySelectorAll("[data-tab]")]; const index = tabs.indexOf(event.target);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  setTab(tabs[next].dataset.tab); tabs[next].focus();
});
let panelUsageSignature;
$("#usage-scope").addEventListener("change", () => void loadUsage());
$("#usage-refresh").addEventListener("click", () => void loadUsage());

function setTab(tab) { state.tab = tab; document.querySelectorAll("[data-tab]").forEach(button => { button.setAttribute("aria-selected", String(button.dataset.tab === tab)); button.tabIndex = button.dataset.tab === tab ? 0 : -1; }); $("#thread").hidden = tab !== "discussion"; renderRunControls(); $("#outcome").hidden = tab !== "outcome"; $("#sources").hidden = tab !== "sources"; $("#usage").hidden = tab !== "usage"; if (tab === "usage") void loadUsage(); }

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
  if (recognition) { recognition.onresult = null; recognition.onend = null; recognition.onerror = null; try { recognition.abort(); } catch {} }
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
  if (privacyLocked) return;
  releaseVoice(); setVoiceReady();
  if (!recognitionConstructor()) {
    state.voiceMode = "unavailable"; $("#voice-heading").textContent = "Voice input unavailable";
    $("#voice-copy").textContent = "Voice recognition is unavailable in this browser. Your typed draft is unchanged.";
    $("#voice-action").hidden = true;
  }
  $("#voice-dialog").showModal();
}
function startVoiceRecognition() {
  if (privacyLocked) return;
  const Recognition = recognitionConstructor();
  if (!Recognition) return voiceFailure("Voice input unavailable", "Voice recognition is unavailable in this browser. Your typed draft is unchanged.");
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
document.addEventListener("click", event => { if (initializing) return; const button = event.target.closest("[data-nav]"); if (button) void nav(button.dataset.nav).catch(() => toast("That page could not be loaded. Please try again.")); const tab = event.target.closest("[data-tab]"); if (tab) setTab(tab.dataset.tab); });
$("#new-conversation").addEventListener("click", () => { clearAttachmentDraft(); void newConversation(); }); $("#composer").addEventListener("submit", event => void acceptMessage(event)); $("#message").addEventListener("keydown", event => { if (event.key !== "Enter" || event.shiftKey || event.isComposing) return; event.preventDefault(); $("#composer").requestSubmit(); }); $("#stop").addEventListener("click", () => void stop()); $("#continue").addEventListener("click", () => void continueRun());
$("#local-login-form").addEventListener("submit", event => { event.preventDefault(); void signIn(); });
document.querySelectorAll("[data-session-action]").forEach(button => button.addEventListener("click", () => {
  if (privacyLocked || state.session?.authenticated) void signOut(); else { showSignIn(); $("#local-password").focus(); }
}));
$("#consent-check").addEventListener("change", event => { $("#consent-button").disabled = !event.target.checked; }); $("#consent-button").addEventListener("click", async () => { try { await request("/api/consent", { method: "POST" }); await loadSession(); } catch { toast("Consent could not be saved. Please try again."); } });
$("#settings-form").addEventListener("submit", async event => {
  event.preventDefault(); saveVisibleCriticSettings();
  const activeCritic = state.criticSettings.criticProvider === "claude_code"
    ? { model: state.criticSettings.criticClaudeModel, reasoning: state.criticSettings.criticClaudeReasoning }
    : { model: state.criticSettings.criticCodexModel, reasoning: state.criticSettings.criticCodexReasoning };
  const settings = { ...state.criticSettings, headModel: $("#head-model").value, headReasoning: $("#head-reasoning").value, criticModel: activeCritic.model, criticReasoning: activeCritic.reasoning, specialistCount: $("#specialist-count").value, discussionDepth: $("#discussion-depth").value, notificationSound: $("#notification-sound").value };
  try {
    const { data } = await request("/api/settings", { method: "PUT", body: settings });
    state.criticSettings = { ...state.criticSettings, ...data.settings }; setNotificationPreference(data.settings.notificationSound); toast("Settings saved for future consultations.");
  } catch { toast("Settings were not saved. Check the selected provider and try again."); }
});
$("#head-model").addEventListener("change", () => renderHeadControls());
$("#critic-model").addEventListener("change", () => { saveVisibleCriticSettings(); renderCriticControls(false); });
// Resume the shared audio output in a trusted gesture, before any network awaits.
for (const type of ["click", "keydown"]) document.addEventListener(type, event => {
  if (!event.isTrusted || event.target.closest?.("#preview-notification-sound, #enable-notification-sound")) return;
  primeNotificationAudio();
}, { capture: true });
$("#enable-notification-sound").addEventListener("click", async () => {
  if (!soundPreferenceLoaded) { await loadNotificationPreference(); return; }
  const result = await notificationAudio.preview();
  if (result === "played") toast("Message sound enabled for this tab.");
  else if (result !== "cancelled") toast("Sound could not play. Check your browser and device sound, then try again.");
});
$("#preview-notification-sound").addEventListener("click", async () => {
  const selected = $("#notification-sound").value;
  const result = await notificationAudio.preview(selected);
  if (result === "off") return toast("Message sound is off.");
  if (result === "cancelled") return;
  if (result !== "played") return toast("Sound could not play. Check your browser and device sound, then try again.");
  toast(`Playing the ${selected} preview.`);
});
$("#runtime-instructions-form").addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const revision = $("#runtime-instructions").dataset.revision;
    const { data } = await request("/api/runtime-instructions", { method: "PUT", body: { markdown: $("#runtime-instructions").value, revision } });
    $("#runtime-instructions").value = data.runtimeInstructions.markdown;
    $("#runtime-instructions").dataset.revision = data.runtimeInstructions.revision;
    $("#runtime-instructions-status").textContent = `Saved local document revision ${data.runtimeInstructions.revision.slice(0, 12)}. It applies to future consultations.`;
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
$("#voice").addEventListener("click", openVoice); $("#voice-action").addEventListener("click", event => { event.preventDefault(); voiceAction(); }); $("#voice-cancel").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-close").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-dialog").addEventListener("close", releaseVoice); window.addEventListener("pagehide", () => { saveRefreshState(); clearPrivateClientContent(); }); window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); }); document.addEventListener("visibilitychange", () => { if (document.hidden && state.voiceMode === "listening") { releaseVoice(); voiceFailure("Voice interrupted", "Voice input stopped when the app moved to the background. Your typed draft is unchanged."); } });

async function initialize() {
  try { if (sessionStorage.getItem(logoutPendingKey) === "1") { lockForLogoff(); return; } } catch {}
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

void initialize().catch(() => toast("The app could not initialize.")).finally(() => {
  initializing = false;
  if (!privacyLocked && state.session?.authenticated && state.session.consented) $("#app").hidden = false;
});
