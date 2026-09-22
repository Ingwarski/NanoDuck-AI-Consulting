import assert from "node:assert/strict";
import fs from "node:fs";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ensurePrivateDirectory, ensurePrivateFile } from "../src/server/private-files.mjs";
import { processEnvironment } from "./fixtures/local-runtime.mjs";

const fixture = t => {
  const directory = fs.mkdtempSync(join(fs.realpathSync(tmpdir()), "nanoduck-permissions-"));
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports(); fs.rmSync(directory, { recursive: true, force: true }); });
  return directory;
};
const intercept = (t, name, replacement) => { t.mock.method(fs, name, replacement); syncBuiltinESMExports(); };

test("private permissions preserve regular contents and reject hard links before mutation", t => {
  const directory = fixture(t);
  assert.equal(ensurePrivateDirectory(directory), directory);
  const filename = join(directory, "private");
  fs.writeFileSync(filename, "synthetic private contents", { mode: 0o600 });
  if (process.platform !== "win32") fs.chmodSync(filename, 0o400);
  assert.equal(ensurePrivateFile(filename), filename);
  assert.equal(fs.readFileSync(filename, "utf8"), "synthetic private contents");
  if (process.platform !== "win32") {
    assert.equal(fs.statSync(directory).mode & 0o777, 0o700);
    assert.equal(fs.statSync(filename).mode & 0o777, 0o600);
  }
  const linked = join(directory, "hard-link"); fs.linkSync(filename, linked);
  assert.throws(() => ensurePrivateFile(linked), /unsafe_local_data_file|private_permissions_unavailable/u);
  assert.equal(fs.readFileSync(filename, "utf8"), "synthetic private contents");
  assert.throws(() => ensurePrivateFile(join(directory, "missing")), { code: "ENOENT" });
});

test("private paths reject directory links and file links without altering targets", async t => {
  const directory = fixture(t); const target = join(directory, "target"); fs.mkdirSync(target);
  const directoryLink = join(directory, "directory-link"); fs.symlinkSync(target, directoryLink, process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => ensurePrivateDirectory(directoryLink), /unsafe_local_data_directory/u);
  await t.test("file symlinks when supported by the OS", context => {
    const filename = join(target, "private"); fs.writeFileSync(filename, "unchanged");
    const link = join(directory, "file-link");
    try { fs.symlinkSync(filename, link); }
    catch (error) { if (process.platform === "win32" && error.code === "EPERM") return context.skip("File symlinks require Windows developer mode or privilege."); throw error; }
    const descriptor = fs.openSync(filename, "r");
    try {
      const mode = fs.fstatSync(descriptor).mode;
      assert.throws(() => ensurePrivateFile(link));
      assert.equal(fs.fstatSync(descriptor).mode, mode);
      assert.equal(fs.readFileSync(descriptor, "utf8"), "unchanged");
    } finally { fs.closeSync(descriptor); }
  });
});

test("POSIX permission changes stay bound to the opened file after pathname replacement", { skip: process.platform === "win32" }, async t => {
  for (const symbolic of [false, true]) await t.test(symbolic ? "symbolic replacement" : "regular replacement", context => {
    const directory = fixture(context); const filename = join(directory, "private"); const held = join(directory, "opened"); const other = join(directory, "other");
    fs.writeFileSync(filename, "opened", { mode: 0o644 }); fs.writeFileSync(other, "replacement", { mode: 0o644 });
    const originalFstat = fs.fstatSync; let descriptor;
    intercept(context, "fstatSync", (...arguments_) => {
      const metadata = originalFstat(...arguments_); descriptor = arguments_[0];
      fs.renameSync(filename, held);
      if (symbolic) fs.symlinkSync(other, filename); else fs.renameSync(other, filename);
      return metadata;
    });
    ensurePrivateFile(filename);
    assert.equal(fs.readFileSync(filename, "utf8"), "replacement");
    assert.equal(fs.statSync(held).mode & 0o777, 0o600);
    assert.equal(fs.statSync(filename).mode & 0o777, 0o644);
    assert.throws(() => originalFstat(descriptor), { code: "EBADF" });
  });
});

test("POSIX directory permissions use the validated descriptor after replacement", { skip: process.platform === "win32" }, t => {
  const root = fixture(t); const directory = join(root, "private"); const held = join(root, "opened"); fs.mkdirSync(directory, { mode: 0o755 });
  const originalFstat = fs.fstatSync;
  intercept(t, "fstatSync", (...arguments_) => {
    const metadata = originalFstat(...arguments_);
    fs.renameSync(directory, held); fs.mkdirSync(directory, { mode: 0o755 });
    return metadata;
  });
  ensurePrivateDirectory(directory);
  assert.equal(fs.statSync(held).mode & 0o777, 0o700);
  assert.equal(fs.statSync(directory).mode & 0o777, 0o755);
});

test("POSIX descriptors close after metadata or permission failure", { skip: process.platform === "win32" }, async t => {
  for (const operation of ["fstatSync", "fchmodSync"]) await t.test(operation, context => {
    const directory = fixture(context); const filename = join(directory, "private"); fs.writeFileSync(filename, "unchanged");
    const originalFstat = fs.fstatSync; let descriptor;
    intercept(context, operation, (...arguments_) => { descriptor = arguments_[0]; throw new Error("synthetic_permission_failure"); });
    assert.throws(() => ensurePrivateFile(filename), /synthetic_permission_failure/u);
    assert.throws(() => originalFstat(descriptor), { code: "EBADF" });
  });
});

test("POSIX FIFOs fail promptly without a writer", { skip: process.platform === "win32", timeout: 2_000 }, t => {
  const directory = fixture(t); const pipe = join(directory, "pipe");
  childProcess.execFileSync("mkfifo", [pipe]);
  assert.throws(() => ensurePrivateFile(pipe), /unsafe_local_data_file/u);
});

test("Windows ACL updates hold a handle that denies pathname replacement", { skip: process.platform !== "win32", timeout: 60_000 }, t => {
  const directory = fixture(t); ensurePrivateDirectory(directory);
  const filename = join(directory, "private"); fs.writeFileSync(filename, "unchanged");
  const execute = childProcess.execFileSync;
  t.mock.method(childProcess, "execFileSync", (executable, arguments_, options) => {
    if (options?.env?.NANODUCK_PRIVATE_PATH !== filename) return execute(executable, arguments_, options);
    const adjusted = [...arguments_]; const encoded = adjusted.indexOf("-EncodedCommand") + 1;
    const program = Buffer.from(adjusted[encoded], "base64").toString("utf16le");
    assert.equal(program.includes("$sid = "), true);
    const probe = `
$moved = $false
try { [System.IO.File]::Move($env:NANODUCK_PRIVATE_PATH, $env:NANODUCK_PRIVATE_PATH + '.moved'); $moved = $true } catch [System.IO.IOException] {}
if ($moved) { throw 'Verified pathname was replaceable while applying its ACL' }
`;
    adjusted[encoded] = Buffer.from(program.replace("$sid = ", `${probe}\n$sid = `), "utf16le").toString("base64");
    return execute(executable, adjusted, options);
  });
  syncBuiltinESMExports();
  assert.equal(ensurePrivateFile(filename), filename);
  assert.equal(fs.readFileSync(filename, "utf8"), "unchanged");
  assert.equal(fs.existsSync(`${filename}.moved`), false);
});

test("Windows helper isolates profile data while retaining required OS services", { skip: process.platform !== "win32", timeout: 100_000 }, t => {
  const directory = fixture(t);
  const common = processEnvironment(directory);
  const standard = Object.fromEntries(["ComSpec", "PATHEXT", "OS", "ProgramFiles", "ProgramFiles(x86)", "ProgramW6432", "ProgramData", "ALLUSERSPROFILE"].filter(name => process.env[name]).map(name => [name, process.env[name]]));
  const profile = { APPDATA: join(directory, "roaming"), LOCALAPPDATA: join(directory, "local") };
  for (const path of Object.values(profile)) fs.mkdirSync(path);
  const script = fileURLToPath(new URL("./fixtures/private-permissions-child.mjs", import.meta.url));
  const outcomes = [];
  for (const [name, additions] of [["minimal", {}], ["standard-os", standard], ["synthetic-appdata", profile], ["standard-with-appdata", { ...standard, ...profile }]]) {
    const result = childProcess.spawnSync(process.execPath, [script], {
      env: { ...common, ...additions, NANODUCK_TEST_PRIVATE_DIRECTORY: join(directory, name) },
      encoding: "utf8", windowsHide: true, timeout: 20_000
    });
    const reason = result.status === 0 ? "ok" : result.stderr.match(/private_permissions_unavailable \([a-zA-Z_0-9:-]+\)/u)?.[0] ?? "process_failed";
    t.diagnostic(`${name}: ${reason}`);
    outcomes.push({ name, status: result.status });
  }
  assert.equal(outcomes.at(-1).status, 0, "The helper must run with isolated profile data and standard Windows services.");
});
