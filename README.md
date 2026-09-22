# NanoDuck Consulting Group

A private consulting workspace that runs on your own macOS, Linux or Windows
computer. Open it in Safari, Chrome, Edge or Firefox, including browsers on
other devices connected to the same private Wi-Fi network.

Conversations, images, settings and instruction history are saved locally.
Consultations use your selected AI subscription and require internet access;
local storage does not imply offline AI inference. Missing provider access is
shown as unavailable, and your question remains saved.

## Start

Install Node.js 22.13 or later in the 22 series, or Node.js 24, and Git. Then:

```sh
git clone https://github.com/Ingwarski/NanoDuck-AI-Consulting.git
cd NanoDuck-AI-Consulting
npm ci
npm run setup
npm start
```

The same commands work in macOS/Linux terminals and Windows PowerShell.
Setup asks for a local password of at least 12 characters twice, without echoing
it. It creates separate random encryption/session keys and a local HTTPS
certificate. It never changes your computer's certificate trust settings.

Open the HTTPS address printed by the app. For another device, use the printed
private LAN address on port 3000. The computer running NanoDuck must remain
awake. If its firewall asks, permit access on private networks only. Router port
forwarding is unnecessary.

### Trust the local certificate

Setup prints the location of `trust/nanoduck-local-ca.crt`. Copy **only this
certificate** to devices that will open NanoDuck; verify its SHA-256 fingerprint
against the setup output. Import it as a trusted certificate authority using
your device/browser certificate settings. The password, `config.json` and all
private files under `tls/` stay on the computer running NanoDuck.

- macOS: import the certificate into your login keychain in Keychain Access,
  open its Trust settings and trust it for SSL. Safari and Chrome use the system
  certificate settings.
- Windows: import it into the current user's **Trusted Root Certification
  Authorities** store. Chrome and Edge use Windows certificate settings.
- Linux: use your browser's certificate manager or your distribution's local CA
  trust mechanism. Firefox may require importing it under **Authorities** in
  its certificate settings.
- iPhone/iPad: install the transferred certificate profile, then enable full
  trust for it under Settings → General → About → Certificate Trust Settings.
  Other mobile systems provide certificate installation in their security
  settings.

Reload the exact address printed by NanoDuck after importing the certificate.
Do not share the certificate's private key. If your computer's LAN address
changes or the certificate expires, stop NanoDuck and run:

```sh
npm run setup -- --renew-certificate
npm start
```

The local CA and saved data remain the same. To change a forgotten password,
stop the app and run `npm run setup -- --reset-password`; this also invalidates
existing browser sessions.

### AI subscription

Sign into the bundled Codex CLI on the computer running NanoDuck:

```sh
npx codex login
npm run preflight
```

The application uses the current user's `CODEX_HOME/auth.json`, or the standard
`.codex/auth.json` in their home directory. It makes isolated provider requests;
credentials never go to LAN browsers. The optional Claude Code Critic requires
a subscription token supplied as `CLAUDE_CODE_OAUTH_TOKEN` in the server process
and an available saved model. API-key billing routes and silent model fallback
are disabled. See [exact model settings](docs/model-settings.md).

The bundled Claude Code 2.1.280 supports the optional Opus 5.5 choice
(`claude-opus-5-5`). Existing selections stay unchanged. A Claude subscription
token can be obtained with `npx claude setup-token`; keep it outside the source
tree and supply it only to the local server. Signing into the NanoDuck browser
does not authorize Claude Code.

Preflight inspects subscription/catalog availability without starting a model
turn. It does not guarantee future quota. Private instruction copies begin with
the public files in `instructions/` and can be edited with version history in
Settings. Accepted consultations keep their own settings and instruction
snapshots.

## Local data and options

The default data directory is derived from your operating system:

| System | Location relative to your user profile |
| --- | --- |
| macOS | `Library/Application Support/NanoDuck Consulting` |
| Windows | `%LOCALAPPDATA%\NanoDuck Consulting` |
| Linux | `$XDG_DATA_HOME/nanoduck-consulting`, or `.local/share/nanoduck-consulting` |

`NANODUCK_DATA_DIR` chooses another private directory outside the repository.
Keep that setting consistent for setup, start, preflight and recovery. Keys
remain on this computer; encryption does not protect against an attacker who
can read both the data and its keys. Protect the user account and use disk
encryption. Only one NanoDuck process may open a data directory.

| Environment variable | Purpose |
| --- | --- |
| `PORT` | HTTPS port, default `3000` |
| `NANODUCK_HOST` | Listen address, default `0.0.0.0`; use `127.0.0.1` for this computer only |
| `NANODUCK_ALLOWED_HOSTS` | Comma-separated local names/IPs to include during certificate setup |
| `CODEX_HOME` | Directory containing your local Codex subscription sign-in |
| `CLAUDE_CODE_OAUTH_TOKEN` | Optional Claude Code subscription credential |

Set environment variables through your shell or operating system; `.env` files
are not loaded automatically. Never commit credentials or private data.

State is encrypted in SQLite and committed before a successful save is returned.
The initial local store supports up to 128 MiB of serialized state, including
encoded images and instruction history. It rejects writes beyond this limit;
it does not silently discard records. Image uploads are limited to 8 MiB each.

To back up or restore, stop the app first. Use a new destination outside the
repository for each backup:

```sh
npm run recovery -- backup <new-encrypted-file>
npm run recovery -- restore <encrypted-file> --confirm-restore
```

Keep a protected copy of the data directory and its keys separately from the
source checkout. An encrypted recovery file cannot be opened without its
original recovery key. Restore honors deletion records and preserves current
settings/instructions by default. Add `--replace-configuration` only to restore
those too. Recovery files have a 32 MiB limit.

## Browser behavior

Typing, saved conversations, settings, attachments, export and consultation
controls use standard browser APIs. Voice input is an optional enhancement:
browser support, microphone permission and the recognition service determine
availability. Typing always remains available. A browser may send speech to its
recognition service; NanoDuck receives only the transcript you choose to use.
Speech recognition is not guaranteed offline. A voice transcript is never sent
as a consultation automatically.

The interface retains the Electric A v8 visual foundation. Sign-in uses the
local password. Sessions expire 24 hours after sign-in; signing out revokes the
session immediately.

## Development and specification

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:browsers
npm run design
```

`npm run design` opens the three retained design references at
`http://127.0.0.1:4328/comparison/`. These pages simulate interactions; use the
HTTPS application for real saved work.

- [Product intent](docs/product-idea.md), [requirements](docs/prd.md) and
  [architecture](docs/architecture.md)
- [Design brief](docs/design-brief.md) and [development plan](docs/development-plan.md)
- [SDD manifest](forge/sdd-manifest.json) and [verification evidence](docs/verification.md)
- [Security automation](.github/SECURITY-AUTOMATION.md)

Tests use disposable local data and synthetic provider responses. Browser engine
checks are distinct from native Safari/Edge, physical mobile devices and real
subscription acceptance; the verification document records the actual scope.

Licensed under the [MIT License](LICENSE). Third-party dependencies retain their
own licenses.
