import assert from "node:assert/strict";
import test from "node:test";
import { decryptBytes, decryptText, encryptBytes, encryptText } from "../src/server/crypto.mjs";
import { inspectImageAttachment } from "../src/server/attachments.mjs";
import { openRecoveryEnvelope, sealRecoverySnapshot } from "../src/server/recovery.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { hasProhibitedLanguage, parseConversationIds, parseMessage, parseSettings, safeExternalUrl } from "../src/server/validation.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";
import { jpeg, png, webp } from "./fixtures/images.mjs";

test("new consultations default to the current saved Codex settings", () => {
  assert.deepEqual(defaultSettings, {
    headModel: "gpt-6-astra",
    headReasoning: "xhigh",
    criticProvider: "codex",
    criticCodexModel: "gpt-6-astra",
    criticCodexReasoning: "xhigh",
    criticModel: "gpt-6-astra",
    criticReasoning: "xhigh",
    specialistCount: "2",
    discussionDepth: "1",
    notificationSound: "knock"
  });
});

const key = Buffer.alloc(32, 7);

test("encrypted message values authenticate before decryption", () => {
  const encrypted = encryptText("Private decision context", key);
  assert.equal(decryptText(encrypted, key), "Private decision context");
  const alteredCiphertext = `${encrypted.ciphertext[0] === "A" ? "B" : "A"}${encrypted.ciphertext.slice(1)}`;
  assert.throws(() => decryptText({ ...encrypted, ciphertext: alteredCiphertext }, key));
  const image = jpeg;
  const encryptedImage = encryptBytes(image, key);
  assert.deepEqual(decryptBytes(encryptedImage, key), image);
});

test("image containers accept encoder-produced raster formats without decoding them", () => {
  assert.equal(inspectImageAttachment(jpeg), "image/jpeg");
  assert.equal(inspectImageAttachment(png), "image/png");
  assert.equal(inspectImageAttachment(webp), "image/webp");
  assert.equal(inspectImageAttachment(Buffer.from("%PDF-1.7")), undefined);
  assert.equal(inspectImageAttachment(jpeg.subarray(0, -2)), undefined);
  assert.equal(inspectImageAttachment(png.subarray(0, -8)), undefined);
  assert.equal(inspectImageAttachment(webp.subarray(0, -4)), undefined);
});

test("encrypted recovery restores confirmed records but never resurrects a deletion", async () => {
  const source = createMemoryStore();
  const conversation = await source.createConversation();
  const image = jpeg;
  const attachment = await source.createAttachment(conversation.id, { content: image, contentType: "image/jpeg", byteLength: image.byteLength });
  const accepted = await source.acceptMessage(conversation.id, { body: "Should we test this offer first?", attachmentIds: [attachment.id], clientRequestId: "recovery-source-request-0001" }, defaultSettings);
  await source.appendAgentMessage(conversation.id, accepted.run.generation, { role: "Head Consultant", body: "Test the buyer before scaling.", sources: [{ url: "https://example.com/evidence", title: "Buyer evidence", claim: "Test the buyer.", retrievedAt: "2026-09-14T00:00:00.000Z" }] });
  await source.stop(conversation.id);
  const backupKey = Buffer.alloc(32, 8);
  const envelope = sealRecoverySnapshot(await source.recoverySnapshot(), backupKey);
  assert.equal(openRecoveryEnvelope({ ...envelope, payload: { ...envelope.payload, tag: `${envelope.payload.tag[0] === "A" ? "B" : "A"}${envelope.payload.tag.slice(1)}` } }, backupKey), undefined);
  const restored = createMemoryStore();
  assert.deepEqual(await restored.restoreRecovery(openRecoveryEnvelope(envelope, backupKey)), { restored: 1, tombstones: 0, preservedTombstones: 0 });
  assert.deepEqual((await restored.events(conversation.id)).map(item => item.body), ["Should we test this offer first?", "Test the buyer before scaling."]);
  assert.deepEqual((await restored.attachment(conversation.id, attachment.id)).content, image);
  assert.ok(await restored.deleteConversation(conversation.id));
  assert.deepEqual(await restored.restoreRecovery(openRecoveryEnvelope(envelope, backupKey)), { restored: 0, tombstones: 0, preservedTombstones: 1 });
  assert.equal(await restored.getConversation(conversation.id), undefined);
  assert.equal((await restored.recoverySnapshot()).conversations[0].messages.length, 0);
});

test("multiple selected conversations are tombstoned together", async () => {
  const store = createMemoryStore();
  const first = await store.createConversation(); const second = await store.createConversation(); const third = await store.createConversation();
  assert.deepEqual(await store.deleteConversations([first.id, second.id]), [first.id, second.id]);
  assert.deepEqual((await store.listConversations()).map(item => item.id), [third.id]);
  assert.deepEqual(await store.deleteConversations([first.id, third.id]), [third.id]);
  assert.deepEqual(await store.listConversations(), []);
});

test("accepted owner messages are idempotent and a stopped run fences later agent output", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const input = { body: "Should we enter this market?", clientRequestId: "request-identifier-0001" };
  const first = await store.acceptMessage(conversation.id, input, defaultSettings);
  const replay = await store.acceptMessage(conversation.id, input, defaultSettings);
  assert.equal(replay.replayed, true);
  assert.equal(replay.message.id, first.message.id);
  await store.saveSettings({ ...defaultSettings, specialistCount: "3", discussionDepth: "3" });
  assert.deepEqual((await store.run(conversation.id)).snapshot, defaultSettings);
  assert.ok(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Head Consultant", body: "First view." }));
  const stopped = await store.stop(conversation.id);
  assert.equal(stopped.status, "stopped");
  assert.equal(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Critic", body: "Late output." }), undefined);
  assert.equal((await store.events(conversation.id)).length, 2);
});

test("only one consultation can be active across the owner's conversations", async () => {
  const store = createMemoryStore();
  const first = await store.createConversation();
  const second = await store.createConversation();
  const firstRun = await store.acceptMessage(first.id, { body: "First active consultation", clientRequestId: "single-active-request-0001" }, defaultSettings);
  assert.ok(firstRun);
  assert.equal(await store.acceptMessage(second.id, { body: "Second active consultation", clientRequestId: "single-active-request-0002" }, defaultSettings), undefined);
  assert.ok(await store.stop(first.id));
  const secondRun = await store.acceptMessage(second.id, { body: "Second active consultation", clientRequestId: "single-active-request-0002" }, defaultSettings);
  assert.ok(secondRun);
  assert.equal(await store.continueRun(first.id), undefined);
  assert.ok(await store.stop(second.id));
  assert.equal((await store.continueRun(first.id))?.status, "active");
});

test("adding Opus 5.5 preserves independent saved Critic choices and existing defaults", () => {
  const catalog = {
    codex: { models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }] },
    claude_code: { models: ["claude-opus-5", "claude-opus-5-5"].map(id => ({ id, efforts: ["low", "medium", "high", "extra", "max"] })) }
  };
  assert.deepEqual(parseSettings(defaultSettings, catalog), defaultSettings);
  const oldClaude = { ...defaultSettings, criticProvider: "claude_code", criticClaudeModel: "claude-opus-5", criticClaudeReasoning: "high", criticModel: "claude-opus-5", criticReasoning: "high" };
  assert.deepEqual(parseSettings(oldClaude, catalog), oldClaude);
  const selected = { ...oldClaude, criticClaudeModel: "claude-opus-5-5", criticClaudeReasoning: "medium", criticModel: "claude-opus-5-5", criticReasoning: "medium" };
  assert.deepEqual(parseSettings(selected, catalog), selected);
  const switchedBack = { ...selected, criticProvider: "codex", criticModel: defaultSettings.criticCodexModel, criticReasoning: defaultSettings.criticCodexReasoning };
  assert.deepEqual(parseSettings(switchedBack, catalog), switchedBack);
});

test("Sol settings preserve defaults, validate each role and retain inactive Critic choices", () => {
  const efforts = ["low", "medium", "high", "xhigh", "max", "ultra"];
  const catalog = { codex: { models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }, { id: "gpt-6-sol", efforts }] }, claude_code: { models: [{ id: "claude-opus-5", efforts: ["high"] }] } };
  assert.deepEqual(parseSettings(defaultSettings, catalog), defaultSettings);
  for (const effort of efforts) {
    const selected = { ...defaultSettings, headModel: "gpt-6-sol", headReasoning: effort, criticCodexModel: "gpt-6-sol", criticCodexReasoning: effort, criticModel: "gpt-6-sol", criticReasoning: effort };
    assert.deepEqual(parseSettings(selected, catalog), selected);
    assert.equal(parseSettings(selected), undefined, "No catalog must not enable Sol");
    assert.equal(parseSettings(selected, { codex: { models: catalog.codex.models.slice(0, 1) } }), undefined);
  }
  const claude = { ...defaultSettings, criticProvider: "claude_code", criticCodexModel: "gpt-6-sol", criticCodexReasoning: "medium", criticClaudeModel: "claude-opus-5", criticClaudeReasoning: "high", criticModel: "claude-opus-5", criticReasoning: "high" };
  assert.deepEqual(parseSettings(claude, catalog), claude);
  assert.equal(parseSettings({ ...defaultSettings, headModel: "gpt-6-sol", headReasoning: "none" }, catalog), undefined);
  const limited = { codex: { models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }, { id: "gpt-6-sol", efforts: ["medium"] }] } };
  assert.equal(parseSettings({ ...defaultSettings, headModel: "gpt-6-sol", headReasoning: "ultra" }, limited), undefined);
  assert.equal(parseSettings({ ...defaultSettings, criticCodexModel: "gpt-6-sol", criticCodexReasoning: "ultra" }, limited), undefined);
  assert.equal(parseSettings({ ...defaultSettings, headModel: "gpt-5.6-sol" }, catalog), undefined);
  assert.equal(parseSettings({ ...defaultSettings, headReasoning: "low" }), undefined);
});

test("settings and message validation reject unsupported model values and malformed ids", () => {
  assert.deepEqual(parseSettings({ ...defaultSettings, specialistCount: "1", discussionDepth: "1" }), { ...defaultSettings, specialistCount: "1", discussionDepth: "1" });
  assert.deepEqual(parseSettings({ ...defaultSettings, specialistCount: "auto", discussionDepth: "auto" }), { ...defaultSettings, specialistCount: "auto", discussionDepth: "auto" });
  assert.equal(parseSettings({ ...defaultSettings, specialistCount: "4" }), undefined);
  assert.equal(parseSettings({ ...defaultSettings, discussionDepth: "2" }), undefined);
  assert.equal(parseSettings({ ...defaultSettings, criticCodexModel: "another-model" }), undefined);
  const claudeCatalog = { codex: { models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }] }, claude_code: { models: [{ id: "claude-opus-5", efforts: ["low", "medium", "high", "extra", "max"] }] } };
  assert.deepEqual(parseSettings({ ...defaultSettings, criticProvider: "claude_code", criticModel: "claude-opus-5", criticReasoning: "high", criticClaudeReasoning: "high" }, claudeCatalog), { ...defaultSettings, criticProvider: "claude_code", criticModel: "claude-opus-5", criticReasoning: "high", criticClaudeReasoning: "high" });
  assert.equal(parseSettings({ ...defaultSettings, criticProvider: "claude_code", criticModel: "claude-opus-5", criticReasoning: "extreme", criticClaudeReasoning: "extreme" }, claudeCatalog), undefined);
  assert.deepEqual(parseSettings({ ...defaultSettings, criticProvider: "claude_code", criticModel: "claude-code-default", criticReasoning: "default", criticClaudeModel: "claude-code-default", criticClaudeReasoning: "default" }, claudeCatalog), { ...defaultSettings, criticProvider: "claude_code", criticModel: "claude-opus-5", criticReasoning: "high" });
  assert.equal(parseSettings({ ...defaultSettings, criticProvider: "claude_code" }, { codex: { models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }] }, claude_code: { models: [] } }), undefined);
  assert.deepEqual(parseSettings({ ...defaultSettings, notificationSound: "ripple" }), { ...defaultSettings, notificationSound: "ripple" });
  assert.equal(parseSettings({ ...defaultSettings, notificationSound: "loud" }), undefined);
  assert.equal(parseMessage({ body: "Question", clientRequestId: "short" }), undefined);
  assert.deepEqual(parseMessage({ body: " Question ", clientRequestId: "request-identifier-0002" }), { body: "Question", clientRequestId: "request-identifier-0002", attachmentIds: [] });
  assert.equal(parseMessage({ body: "Question", clientRequestId: "request-identifier-0002", attachmentIds: ["short"] }), undefined);
  assert.equal(parseMessage({ body: "Question", clientRequestId: "request-identifier-0002", attachmentIds: Array(5).fill("attachment-identifier-0001") }), undefined);
  assert.equal(parseMessage({ body: "Как это работает?", clientRequestId: "language-policy-request-0001" }), undefined);
  assert.equal(parseMessage({ body: "Як гэта працуе?", clientRequestId: "language-policy-request-0002" }), undefined);
  assert.equal(parseMessage({ body: "Read https://example.su/report", clientRequestId: "url-policy-request-0003" }), undefined);
  assert.deepEqual(parseConversationIds({ conversationIds: ["conversation-identifier-0001", "conversation-identifier-0002"] }), ["conversation-identifier-0001", "conversation-identifier-0002"]);
  assert.equal(parseConversationIds({ conversationIds: ["conversation-identifier-0001", "conversation-identifier-0001"] }), undefined);
});

test("Ukrainian shared words are allowed without permitting distinctive prohibited language", () => {
  for (const body of ["Які умови вступу?", "Перевірте курси, які викладають англійською.", "Уточніть, які саме дані потрібно надати."]) {
    assert.equal(hasProhibitedLanguage(body), false, body);
    assert.equal(parseMessage({ body, clientRequestId: "ukrainian-word-check-0001" })?.body, body);
  }
  for (const body of ["Как это работает?", "Які гэта мае вынікі?", "Якія сёння ўмовы?", "Якая крыніца?"]) assert.equal(hasProhibitedLanguage(body), true);
  for (const suffix of ["ru", "by", "su"]) assert.equal(safeExternalUrl(`https://example.${suffix}/report`), undefined);
});

test("source links accept only public HTTPS destinations", () => {
  assert.equal(safeExternalUrl("https://example.com/report"), "https://example.com/report");
  assert.equal(safeExternalUrl("http://example.com/report"), undefined);
  assert.equal(safeExternalUrl("https://127.0.0.1/private"), undefined);
  assert.equal(safeExternalUrl("https://169.254.169.254/latest"), undefined);
  assert.equal(safeExternalUrl("https://localhost/private"), undefined);
  assert.equal(safeExternalUrl("https://[::1]/private"), undefined);
  assert.equal(safeExternalUrl("https://[fd00::1]/private"), undefined);
  assert.equal(safeExternalUrl("https://example.ru/report"), undefined);
  assert.equal(safeExternalUrl("https://example.by/report"), undefined);
  assert.equal(safeExternalUrl("https://example.su/report"), undefined);
  assert.equal(safeExternalUrl("https://example.рф/report"), undefined);
  assert.equal(safeExternalUrl("https://example.бел/report"), undefined);
});
