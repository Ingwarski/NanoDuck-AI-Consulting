const state = { session: null, csrf: null, page: "discussion", tab: "discussion", conversation: null, events: [], run: null, poll: null, recognition: null, voiceTimer: null, voiceMode: "ready", voiceTranscript: "", attachmentFiles: [], attachmentError: "" };
const $ = selector => document.querySelector(selector);
const roleInitials = { owner: "YOU", "Head Consultant": "HC", "Strategy Consultant": "SC", "Finance Consultant": "FC", "Operations Consultant": "OC", "Sales Consultant": "SL", "Marketing Consultant": "MC", "Product Consultant": "PC", "Spiritual Consultant": "SP", Psychotherapist: "PT", "Risk Consultant": "RC", Critic: "CR", System: "•" };

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
const id = () => crypto.randomUUID().replaceAll("-", "");
const attachmentLimit = 8 * 1024 * 1024;
const attachmentCountLimit = 4;
const attachmentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const formatBytes = value => value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MiB`;

function nav(page) {
  state.page = page;
  $("#discussion-page").hidden = page !== "discussion";
  $("#conversations-page").hidden = page !== "conversations";
  $("#settings-page").hidden = page !== "settings";
  document.querySelectorAll("[data-nav]").forEach(button => button.setAttribute("aria-current", String(button.dataset.nav === page ? "page" : false)));
  $("#mobile-nav").hidden = true; $("#menu").setAttribute("aria-expanded", "false");
  if (page === "conversations") void loadConversations();
  if (page === "settings") void loadSettings();
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
  if (!data.authenticated) return showSignIn(); state.csrf = data.csrfToken;
  if (!data.consented) return showConsent(); showAuthenticated();
}

function renderEvents() {
  const thread = clear($("#thread"));
  if (state.events.length === 0) {
    const empty = node("div", { class: "empty" }); empty.append(node("h2", {}, "Bring in the decision."), node("p", {}, "Ask for a direct answer or a team discussion. The Critic challenges real weaknesses; it does not perform a ritual.")); thread.append(empty);
  }
  for (const event of state.events) {
    const message = node("article", { class: "message", "data-role": event.role });
    message.append(node("div", { class: "avatar", "aria-hidden": true }, roleInitials[event.role] ?? "AI"));
    const content = node("div", { class: "message-content" }); const meta = node("div", { class: "message-meta" });
    meta.append(node("strong", {}, event.role)); if (event.recipient) meta.append(node("small", {}, `→ ${event.recipient}`)); meta.append(node("time", { dateTime: event.createdAt }, formatTime(event.createdAt)));
    content.append(meta, node("div", { class: "message-body" }, event.body));
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
  const labels = { active: "Consultants are working on the accepted question.", stopped: "Consultation stopped. Confirmed discussion is preserved.", complete: "Discussion complete.", failed: "Consultation needs attention. Confirmed discussion is preserved." };
  $("#run-status").textContent = labels[state.run?.status] ?? "Describe the decision you want to make.";
  $("#conversation-title").textContent = state.conversation?.title ?? "New consultation";
  renderOutcome(); renderSources();
}

function renderOutcome() { const target = clear($("#outcome")); const outcome = [...state.events].reverse().find(event => event.role === "Head Consultant"); if (outcome) target.append(node("h2", {}, "Current outcome"), node("p", {}, outcome.body)); else target.append(node("div", { class: "empty" }, "A conclusion appears after the discussion has earned one.")); }
function renderSources() { const target = clear($("#sources")); const sources = [...new Map(state.events.flatMap(event => event.sources ?? []).map(source => [source.url, source])).values()]; if (!sources.length) { target.append(node("div", { class: "empty" }, "Sources appear here when live research materially informs the discussion.")); return; } for (const source of sources) { const dates = [`Retrieved ${formatDate(source.retrievedAt)}`]; if (source.publishedAt) dates.push(`Published ${formatDate(source.publishedAt)}`); const card = node("article", { class: "source-card" }); card.append(node("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title), node("p", {}, source.claim), node("p", { class: "hint" }, dates.join(" · "))); target.append(card); } }

async function loadConversation(conversationId, { preserveAttachmentDraft = false } = {}) {
  const { data } = await request(`/api/conversations/${conversationId}`); state.conversation = data.conversation; state.events = data.events; state.run = data.run; renderEvents(); nav("discussion"); startPolling();
  if (!preserveAttachmentDraft) clearAttachmentDraft();
}

async function newConversation() { try { const { data } = await request("/api/conversations", { method: "POST" }); await loadConversation(data.conversation.id, { preserveAttachmentDraft: true }); $("#message").focus(); } catch { toast("Could not create a conversation."); } }
async function loadConversations() {
  const { data } = await request("/api/conversations"); const list = clear($("#conversation-list"));
  if (!data.conversations.length) { list.append(node("div", { class: "empty" }, "No saved conversations yet.")); return; }
  for (const conversation of data.conversations) {
    const row = node("article", { class: "conversation-row" }); const open = node("button", {}, ""); open.append(node("h2", {}, conversation.title), node("small", {}, new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(conversation.updatedAt)))); open.addEventListener("click", () => void loadConversation(conversation.id));
    const tools = node("span"); const exportButton = node("button", { class: "secondary" }, "Export"); exportButton.addEventListener("click", () => window.location.assign(`/api/conversations/${conversation.id}/export`)); const deleteButton = node("button", { class: "secondary" }, "Delete"); deleteButton.addEventListener("click", async () => { if (!confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return; await request(`/api/conversations/${conversation.id}`, { method: "DELETE" }); if (state.conversation?.id === conversation.id) state.conversation = null; toast("Conversation deleted."); void loadConversations(); }); tools.append(exportButton, deleteButton); row.append(open, tools); list.append(row);
  }
}

async function loadSettings() { const { data } = await request("/api/settings"); const settings = data.settings; $("#head-model").value = settings.headModel; $("#head-reasoning").value = settings.headReasoning; $("#critic-model").value = settings.criticModel; $("#critic-reasoning").value = settings.criticReasoning; $("#specialist-count").value = settings.specialistCount; $("#discussion-depth").value = settings.discussionDepth; const providerMessage = { ready: "Selected Codex route is ready for this runtime.", quota_blocked: "Selected Codex route has reached its current limit; saved preferences are preserved.", auth_required: "Selected Codex route needs its managed sign-in renewed.", incompatible: "The selected Codex route does not expose the preserved model and reasoning settings.", unavailable: "Selected Codex route is unavailable on this runtime; saved preferences are preserved." }; $("#settings-status").textContent = providerMessage[data.provider] ?? providerMessage.unavailable; $("#session-expiry").textContent = `This session expires ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(state.session.expiresAt))}. Activity does not extend the 24-hour boundary.`; }

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
    $("#message").value = ""; clearAttachmentDraft(); if (state.conversation.title === "New consultation") state.conversation.title = body.slice(0, 72); state.events.push(data.message); state.run = data.run; renderEvents(); startPolling();
  } catch (error) {
    if (attachmentIds.length) await removePendingAttachments(state.conversation.id, attachmentIds);
    state.attachmentError = error.data?.error === "attachment_too_large" ? "This image is larger than the 8 MiB limit. Your draft is unchanged." : error.data?.error === "invalid_image_attachment" ? "This file is not a complete JPEG, PNG or WebP image. Your draft is unchanged." : "Image upload was not accepted. Your draft is unchanged.";
    renderAttachmentDraft(); toast(error.data?.error === "active_or_missing_conversation" ? "Wait for the current consultation or stop it first." : error.data?.error === "language_not_supported" ? "Messages must be in English or Ukrainian." : state.attachmentError);
  }
}

async function stop() { if (!state.conversation) return; const { data } = await request(`/api/conversations/${state.conversation.id}/stop`, { method: "POST" }); state.run = data.run; renderEvents(); }
async function continueRun() { if (!state.conversation) return; const { data } = await request(`/api/conversations/${state.conversation.id}/continue`, { method: "POST" }); state.run = data.run; renderEvents(); startPolling(); }
function startPolling() { stopPolling(); if (state.run?.status !== "active") return; state.poll = setInterval(async () => { try { const { data } = await request(`/api/conversations/${state.conversation.id}`); state.events = data.events; state.run = data.run; renderEvents(); if (state.run?.status !== "active") stopPolling(); } catch { stopPolling(); } }, 2_000); }
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
document.addEventListener("click", event => { const button = event.target.closest("[data-nav]"); if (button) nav(button.dataset.nav); const tab = event.target.closest("[data-tab]"); if (tab) setTab(tab.dataset.tab); });
$("#new-conversation").addEventListener("click", () => { clearAttachmentDraft(); void newConversation(); }); $("#composer").addEventListener("submit", event => void acceptMessage(event)); $("#stop").addEventListener("click", () => void stop()); $("#continue").addEventListener("click", () => void continueRun());
$("#google-sign-in").addEventListener("click", async () => {
  try { const { response } = await request("/auth/google/start", { method: "POST" }); location.assign(response.headers.get("location")); }
  catch { toast("Google sign-in is not available in this local workspace."); }
});
$("#development-sign-in").addEventListener("click", async () => {
  try { await request("/api/auth/development", { method: "POST" }); await loadSession(); }
  catch { toast("The local workspace could not open. Refresh and try again."); }
});
$("#consent-check").addEventListener("change", event => { $("#consent-button").disabled = !event.target.checked; }); $("#consent-button").addEventListener("click", async () => { await request("/api/consent", { method: "POST" }); await loadSession(); });
$("#settings-form").addEventListener("submit", async event => { event.preventDefault(); const settings = { headModel: $("#head-model").value, headReasoning: $("#head-reasoning").value, criticModel: $("#critic-model").value, criticReasoning: $("#critic-reasoning").value, specialistCount: $("#specialist-count").value, discussionDepth: $("#discussion-depth").value }; await request("/api/settings", { method: "PUT", body: settings }); toast("Settings saved for future consultations."); });
$("#sign-out").addEventListener("click", async () => { await request("/api/logout", { method: "POST" }); state.session = null; state.csrf = null; state.conversation = null; showSignIn(); });
$("#attach").addEventListener("click", () => $("#attachment").click()); $("#attachment").addEventListener("change", event => chooseAttachments(event.target.files));
$("#voice").addEventListener("click", openVoice); $("#voice-action").addEventListener("click", event => { event.preventDefault(); voiceAction(); }); $("#voice-cancel").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-close").addEventListener("click", () => { releaseVoice(); $("#voice-dialog").close(); }); $("#voice-dialog").addEventListener("close", releaseVoice); window.addEventListener("pagehide", () => { stopPolling(); releaseVoice(); }); document.addEventListener("visibilitychange", () => { if (document.hidden && state.voiceMode === "listening") { releaseVoice(); voiceFailure("Voice interrupted", "Voice input stopped when the app moved to the background. Your typed draft is unchanged."); } });

void loadSession().catch(() => toast("The app could not initialize."));
