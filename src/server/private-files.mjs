import { constants, chmodSync, closeSync, fchmodSync, fstatSync, lstatSync, mkdirSync, openSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { isAbsolute, join, parse, resolve } from "node:path";

const owns = metadata => typeof process.getuid !== "function" || metadata.uid === process.getuid();
const windowsAclProgram = `
$ErrorActionPreference = 'Stop'
$target = $env:NANODUCK_PRIVATE_PATH
$item = Get-Item -LiteralPath $target -Force
if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Unsafe private path' }
$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User
if ($env:NANODUCK_PRIVATE_KIND -eq 'directory') {
  if (-not $item.PSIsContainer) { throw 'Expected directory' }
  $acl = New-Object System.Security.AccessControl.DirectorySecurity
  $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
} else {
  if ($item.PSIsContainer) { throw 'Expected file' }
  $acl = New-Object System.Security.AccessControl.FileSecurity
  $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid, 'FullControl', 'Allow')
}
$acl.SetOwner($sid)
$acl.SetAccessRuleProtection($true, $false)
$acl.AddAccessRule($rule)
Set-Acl -LiteralPath $target -AclObject $acl
$actual = Get-Acl -LiteralPath $target
if ($actual.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -ne $sid.Value -or -not $actual.AreAccessRulesProtected) { throw 'Private ACL not applied' }
$rules = @($actual.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
if ($rules.Count -ne 1 -or $rules[0].IdentityReference.Value -ne $sid.Value -or $rules[0].AccessControlType -ne 'Allow' -or $rules[0].FileSystemRights -ne 'FullControl') { throw 'Unexpected private ACL' }
`;

function applyWindowsPrivacy(path, kind) {
  const systemDirectory = process.env.SystemRoot ?? process.env.WINDIR;
  if (!systemDirectory || !isAbsolute(systemDirectory)) throw new Error("private_permissions_unavailable");
  const executable = join(systemDirectory, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  try {
    if (!lstatSync(executable).isFile()) throw new Error("powershell_unavailable");
    execFileSync(executable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(windowsAclProgram, "utf16le").toString("base64")], {
      env: { ...process.env, NANODUCK_PRIVATE_PATH: path, NANODUCK_PRIVATE_KIND: kind },
      windowsHide: true, timeout: 15_000, stdio: ["ignore", "pipe", "pipe"]
    });
  } catch { throw new Error("private_permissions_unavailable"); }
}

function normalizedDirectory(path) {
  let absolute = resolve(path);
  // macOS exposes these OS-owned aliases. User-created symlinks remain invalid.
  if (process.platform === "darwin") {
    for (const alias of ["/tmp", "/var"]) {
      if (absolute === alias || absolute.startsWith(`${alias}/`)) {
        const canonical = realpathSync(alias);
        if (canonical !== `/private${alias}`) throw new Error("unsafe_local_data_directory");
        absolute = `${canonical}${absolute.slice(alias.length)}`;
      }
    }
  }
  return absolute;
}

export function ensurePrivateDirectory(path) {
  if (typeof path !== "string" || !path.trim()) throw new Error("unsafe_local_data_directory");
  const absolute = normalizedDirectory(path); const root = parse(absolute).root;
  let cursor = root;
  for (const component of absolute.slice(root.length).split(/[\\/]/u).filter(Boolean)) {
    cursor = join(cursor, component);
    try { if (!lstatSync(cursor).isDirectory()) throw new Error("unsafe_local_data_directory"); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      try { mkdirSync(cursor, { mode: 0o700 }); }
      catch (creationError) { if (creationError.code !== "EEXIST" || !lstatSync(cursor).isDirectory()) throw creationError; }
    }
  }
  const metadata = lstatSync(absolute);
  if (!owns(metadata)) throw new Error("unsafe_local_data_directory");
  if (process.platform === "win32") applyWindowsPrivacy(absolute, "directory");
  else chmodSync(absolute, 0o700);
  return absolute;
}

export function ensurePrivateFile(path) {
  const absolute = resolve(path);
  const metadata = lstatSync(absolute);
  if (!metadata.isFile() || metadata.nlink !== 1 || !owns(metadata)) throw new Error("unsafe_local_data_file");
  const descriptor = openSync(absolute, constants.O_RDWR | constants.O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    if (!opened.isFile() || opened.nlink !== 1 || !owns(opened) || opened.dev !== metadata.dev || opened.ino !== metadata.ino) throw new Error("unsafe_local_data_file");
    if (process.platform !== "win32") fchmodSync(descriptor, 0o600);
  } finally { closeSync(descriptor); }
  if (process.platform === "win32") applyWindowsPrivacy(absolute, "file");
  return absolute;
}
