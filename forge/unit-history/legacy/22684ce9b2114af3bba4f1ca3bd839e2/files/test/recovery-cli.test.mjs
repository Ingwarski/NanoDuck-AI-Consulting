import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, realpath, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import { readWorkspaceConfiguration } from "../src/server/config.mjs";
import { setupWorkspace } from "../src/server/local-setup.mjs";
import { createLocalStore } from "../src/server/local-store.mjs";
import { openRecoveryEnvelope } from "../src/server/recovery.mjs";
import { defaultSettings } from "../src/server/store.mjs";
import { processEnvironment, testPassword } from "./fixtures/local-runtime.mjs";
import { jpeg as image } from "./fixtures/images.mjs";

const execute = promisify(execFile);
const repository = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(new URL("../src/server/recovery-cli.mjs", import.meta.url));

async function fixture(t) {
  const directory = await mkdtemp(join(await realpath(tmpdir()), "nanoduck-recovery-cli-"));
  const stores = [];
  t.after(async () => {
    for (const store of stores) await store.close();
    await rm(directory, { recursive: true, force: true });
  });
  const environment = {
    ...processEnvironment(directory), NODE_ENV: "test", NANODUCK_DATA_DIR: join(directory, "data"),
    NANODUCK_ALLOWED_HOSTS: "127.0.0.1,localhost",
    CODEX_HOME: join(directory, "no-provider-credentials")
  };
  const { dataDirectory } = await setupWorkspace({ environment, password: testPassword });
  const saved = readWorkspaceConfiguration(dataDirectory);
  const storeOptions = { dataDirectory, dataKey: Buffer.from(saved.dataKey, "base64url") };
  const openStore = async () => {
    const store = await createLocalStore(storeOptions);
    stores.push(store);
    return store;
  };
  const run = async (...arguments_) => {
    try {
      const result = await execute(process.execPath, [cli, ...arguments_], {
        cwd: repository, env: environment, timeout: 60_000, maxBuffer: 128 * 1024, windowsHide: true
      });
      return { ...result, code: 0 };
    } catch (error) {
      if (!Number.isInteger(error.code)) throw error;
      return { stdout: error.stdout, stderr: error.stderr, code: error.code };
    }
  };
  return { directory, dataDirectory, saved, openStore, environment, run };
}

async function privateOutput(filename, environment) {
  const metadata = await stat(filename);
  assert.equal(metadata.isFile(), true);
  assert.equal(metadata.nlink, 1);
  if (process.platform !== "win32") {
    assert.equal(metadata.mode & 0o777, 0o600);
    assert.equal(metadata.uid, process.getuid());
    return;
  }
  const program = `
$ErrorActionPreference = 'Stop'
$acl = [System.IO.FileInfo]::new($env:NANODUCK_TEST_BACKUP_PATH).GetAccessControl()
$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$rules = @($acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
[Console]::WriteLine($sid)
[Console]::WriteLine($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value)
[Console]::WriteLine($acl.AreAccessRulesProtected)
[Console]::WriteLine($rules.Count)
foreach ($rule in $rules) {
  [Console]::WriteLine($rule.IdentityReference.Value + '|' + $rule.AccessControlType + '|' + $rule.FileSystemRights + '|' + $rule.IsInherited)
}
`;
  const executable = join(environment.SystemRoot ?? environment.WINDIR, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  const { stdout } = await execute(executable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(program, "utf16le").toString("base64")], {
    env: { ...environment, NANODUCK_TEST_BACKUP_PATH: filename }, windowsHide: true, timeout: 15_000
  });
  const permissions = stdout.replace(/^\uFEFF/u, "").trim().split(/\r?\n/u);
  const currentSid = permissions[0];
  assert.match(currentSid, /^S-1-5-/u);
  assert.deepEqual(permissions, [currentSid, currentSid, "True", "1", `${currentSid}|Allow|FullControl|False`]);
}

test("offline recovery CLI restores encrypted records without TLS, preserves deletion and requires configuration confirmation", { timeout: 240_000 }, async t => {
  const { directory, dataDirectory, saved, openStore, environment, run } = await fixture(t);
  let store = await openStore();
  const originalSettings = { ...defaultSettings, specialistCount: "3", notificationSound: "off" };
  await store.saveSettings(originalSettings);
  const deleted = await store.createConversation();
  const kept = await store.createConversation();
  const attachment = await store.createAttachment(kept.id, { content: image, contentType: "image/jpeg", byteLength: image.length });
  const input = { body: "Synthetic recovery question with an image.", clientRequestId: "recovery-cli-synthetic-request", attachmentIds: [attachment.id] };
  const accepted = await store.acceptMessage(kept.id, input, originalSettings);
  await store.appendAgentMessage(kept.id, accepted.run.generation, { role: "head", body: "Synthetic confirmed answer.", sources: [] });
  await store.stop(kept.id);
  await store.close(); store = undefined;

  // Recovery must depend on workspace keys, not a valid HTTPS identity or provider setup.
  const certificate = join(dataDirectory, "tls", saved.certificateVersion, "server.crt");
  await rename(certificate, `${certificate}.unavailable`);
  const backup = join(directory, "encrypted-backup.json");
  const backedUp = await run("backup", backup);
  assert.equal(backedUp.code, 0, backedUp.stderr);
  assert.equal(JSON.parse(backedUp.stdout).result, "backup_created");
  assert.equal(JSON.parse(backedUp.stdout).conversations, 2);
  await privateOutput(backup, environment);
  const encoded = await readFile(backup, "utf8");
  assert.equal(encoded.includes(input.body), false);
  assert.equal(encoded.includes(saved.dataKey), false);
  assert.equal(encoded.includes(saved.recoveryKey), false);
  assert.equal(openRecoveryEnvelope(JSON.parse(encoded), Buffer.from(saved.recoveryKey, "base64url")).conversations.length, 2);
  const repeated = await run("backup", backup);
  assert.notEqual(repeated.code, 0);
  assert.match(repeated.stderr, /EEXIST/u);
  assert.equal(await readFile(backup, "utf8"), encoded);

  store = await openStore();
  await store.deleteConversation(deleted.id);
  const deletionSnapshot = await store.recoverySnapshot();
  await store.close(); store = undefined;
  await rename(join(dataDirectory, "state.sqlite"), join(dataDirectory, "retired-state.sqlite"));
  store = await openStore();
  await store.restoreRecovery({ ...deletionSnapshot, conversations: deletionSnapshot.conversations.filter(item => item.conversation.id === deleted.id) });
  const currentSettings = { ...defaultSettings, discussionDepth: "3", notificationSound: "ripple" };
  await store.saveSettings(currentSettings);
  await store.close(); store = undefined;

  for (const arguments_ of [["restore", backup], ["restore", backup, "--confirm-restore", "--unknown-option"]]) {
    const refused = await run(...arguments_);
    assert.notEqual(refused.code, 0);
    assert.match(refused.stderr, /Usage:/u);
  }
  store = await openStore();
  assert.deepEqual(await store.listConversations(), []);
  assert.deepEqual(await store.settings(), currentSettings);
  await store.close(); store = undefined;

  const restored = await run("restore", backup, "--confirm-restore");
  assert.equal(restored.code, 0, restored.stderr);
  assert.deepEqual(JSON.parse(restored.stdout), { result: "restore_completed", configurationRestored: false, restored: 1, tombstones: 0, preservedTombstones: 1 });
  store = await openStore();
  assert.equal(await store.getConversation(deleted.id), undefined);
  assert.deepEqual((await store.listConversations()).map(item => item.id), [kept.id]);
  assert.deepEqual((await store.events(kept.id)).map(item => item.body), [input.body, "Synthetic confirmed answer."]);
  assert.deepEqual(Buffer.from((await store.attachment(kept.id, attachment.id)).content), image);
  assert.deepEqual(await store.settings(), currentSettings);
  await store.close(); store = undefined;

  const replaced = await run("restore", backup, "--confirm-restore", "--replace-configuration");
  assert.equal(replaced.code, 0, replaced.stderr);
  assert.equal(JSON.parse(replaced.stdout).configurationRestored, true);
  store = await openStore();
  assert.deepEqual(await store.settings(), originalSettings);
  assert.equal(await store.getConversation(deleted.id), undefined);
});

test("recovery CLI refuses an active workspace owner and creates no partial backup", { timeout: 180_000 }, async t => {
  const { directory, openStore, run } = await fixture(t);
  const backup = join(directory, "blocked-backup.json");
  const store = await openStore();
  const conversation = await store.createConversation();
  for (const arguments_ of [["backup", backup], ["restore", backup, "--confirm-restore"]]) {
    const blocked = await run(...arguments_);
    assert.notEqual(blocked.code, 0);
    assert.match(blocked.stderr, /local_store_in_use/u);
    assert.equal(blocked.stdout, "");
  }
  await assert.rejects(stat(backup), { code: "ENOENT" });
  assert.equal((await store.getConversation(conversation.id)).id, conversation.id);
});
