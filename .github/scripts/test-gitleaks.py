"""Exercise the reviewed exceptions with the same binary used for history scanning.

All credential controls are generated synthetic strings. Scanner reports and
matched values stay in a temporary directory and are never printed.
"""

import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[2]
BASELINE = "2d12abb74cfac595cf05b96b4f6ce2c05307d944"
REVIEWED_LINES = {
    "docs/review-fixes-port.md": [92],
    "forge/runs/local-network-entry-20261014/verification.json": [59],
    "forge/runs/sdd-reconciliation-20261017/qa-source-observation.json": [54, 78, 109],
    "forge/sdd-manifest.json": [53074, 53098, 53129],
}
MIGRATION_LINES = {
    "forge/unit-history/legacy/22684ce9b2114af3bba4f1ca3bd839e2/manifest.json": [53074, 53098, 53129],
    "forge/unit-history/candidates/767b74e5913c4d5087ea48cd5a03bab7/record.json": [
        48037, 48061, 48092, 54900, 54924, 54950, 54959, 55021, 55045, 55071, 55080,
    ],
    "forge/unit-history/activations/4a4ce399cb54496a999290e214d7cb38/before.json": [53074, 53098, 53129],
    "forge/unit-history/activations/4a4ce399cb54496a999290e214d7cb38/after.json": [48033, 48057, 48088],
    "forge/unit-history/legacy/22684ce9b2114af3bba4f1ca3bd839e2/files/docs/review-fixes-port.md": [92],
    "forge/unit-history/blobs/8067cd3d1cdabdd363562b979024d7a94fefbab4507ea058683a26c9c0727e69": [92],
}


def historical_bytes(path):
    return subprocess.run(
        ["git", "show", f"{BASELINE}:{path}"], cwd=ROOT,
        check=True, capture_output=True,
    ).stdout


def reviewed_fixtures():
    fixtures = {}
    for path, numbers in {**REVIEWED_LINES, **MIGRATION_LINES}.items():
        data = (ROOT / path).read_bytes() if path in MIGRATION_LINES else historical_bytes(path)
        if path in MIGRATION_LINES and not path.endswith(".json"):
            if data != historical_bytes("docs/review-fixes-port.md"):
                raise ValueError("Reviewed prose copy differs from its historical source")
        lines = data.decode("utf-8").splitlines()
        selected = [lines[number - 1].strip().rstrip(",") for number in numbers]
        if path.endswith(".json"):
            for line in selected:
                entry = json.loads("{" + line + "}")
                source, digest = next(iter(entry.items()))
                original = source.removeprefix(
                    "forge/unit-history/legacy/22684ce9b2114af3bba4f1ca3bd839e2/files/"
                )
                actual = hashlib.sha256(historical_bytes(original)).hexdigest()
                if digest != actual:
                    raise ValueError(f"Reviewed digest is not its source hash: {source}")
        fixtures[path] = "\n".join(selected) + "\n"
    return fixtures


def scan(binary, config, directory, report):
    result = subprocess.run(
        [str(binary), "dir", ".", f"--config={config}", "--redact=100",
         "--no-banner", "--exit-code=2", "--report-format=json",
         f"--report-path={report}"],
        cwd=directory, capture_output=True, timeout=60,
    )
    if result.returncode not in (0, 2):
        raise ValueError("Scanner did not finish the regression control")
    findings = json.loads(report.read_text(encoding="utf-8"))
    if not isinstance(findings, list) or bool(findings) != (result.returncode == 2):
        raise ValueError("Scanner report and status disagree")
    return findings


def main():
    binary = Path(sys.argv[1]).resolve(strict=True)
    config = ROOT / ".gitleaks.toml"
    fixtures = reviewed_fixtures()
    # Different from the reviewed source digests; no usable credential exists.
    control = hashlib.sha256(b"NanoDuck synthetic scanner negative control").hexdigest()
    token = "gh" + "p_" + "A1b2C3d4E5f6G7h8J9k0L1m2N3p4Q5r6S7t8"
    with tempfile.TemporaryDirectory(prefix="nanoduck-gitleaks-regression-") as temporary:
        temporary = Path(temporary)
        default_config = temporary / "defaults.toml"
        default_config.write_text("[extend]\nuseDefault = true\n", encoding="utf-8")

        def check(name, contents, expected_count, rule="generic-api-key", selected_config=config):
            directory = temporary / name
            directory.mkdir()
            for path, content in contents.items():
                target = directory / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(content, encoding="utf-8")
            findings = scan(binary, selected_config, directory, temporary / f"{name}.json")
            if len(findings) != expected_count or any(row["RuleID"] != rule for row in findings):
                locations = [(row["File"], row["RuleID"]) for row in findings]
                raise ValueError(f"{name}: expected {expected_count} {rule} findings; got {locations}")
            print(f"Gitleaks regression {name}: passed ({expected_count} findings)")

        check("default-rule-control", fixtures, 30, selected_config=default_config)
        check("reviewed-false-positives", fixtures, 0)
        check("unreviewed-paths", {"outside/" + path: value for path, value in fixtures.items()}, 30)
        check("adjacent-credentials", {
            path: value + f'api_key = "{control}"\n' for path, value in fixtures.items()
        }, 10)
        check("same-line-credentials", {
            path: "\n".join(line + f'; api_key = "{control}"' for line in value.splitlines()) + "\n"
            for path, value in fixtures.items()
        }, 30)
        check("changed-digests", {
            path: "\n".join(
                json.dumps(source) + ": " + json.dumps(control)
                for line in value.splitlines()
                for source in json.loads("{" + line + "}")
            ) + "\n"
            for path, value in fixtures.items() if path.endswith(".json")
        }, 27)
        digest = hashlib.sha256(historical_bytes("src/server/auth.mjs")).hexdigest()
        check("reviewed-digest-as-credential", {
            path: f'api_key = "{digest}"\n' for path in fixtures
        }, 10)
        check("provider-specific-rule", {
            path: value + f'\n{token}\n' for path, value in fixtures.items()
        }, 10, rule="github-pat")
    print("Gitleaks regression: all 8 controls passed; temporary fixtures removed.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        # Do not expose scanner output or accidental matched values on failure.
        print("::error::Gitleaks regression failed; history scan must not be accepted.")
        sys.exit(1)
