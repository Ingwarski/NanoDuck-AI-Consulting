"""Publish finding locations without publishing matched credentials or source."""

import html
import json
import os
from pathlib import Path
import sys


def main():
    report_path, status_text = sys.argv[1:]
    status = int(status_text)
    if status not in (0, 2):
        print("::error::Gitleaks did not complete; this is a scanner failure.")
        return 1
    try:
        findings = json.loads(Path(report_path).read_text(encoding="utf-8"))
        if not isinstance(findings, list):
            raise ValueError("Invalid report")
        # Deliberately exclude Match, Secret, Description, author data and source.
        locations = [
            {key: finding[key] for key in ("RuleID", "File", "StartLine", "Commit")}
            for finding in findings
        ]
        if bool(findings) != (status == 2):
            raise ValueError("Report and exit status disagree")
    except (OSError, ValueError, KeyError, TypeError):
        print("::error::Gitleaks report could not be validated; scan is incomplete.")
        return 1

    message = f"Gitleaks full-history scan: {len(findings)} potential secret findings."
    print(message)
    for location in locations:
        print(json.dumps(location, ensure_ascii=True))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with Path(summary).open("a", encoding="utf-8") as output:
            output.write(message + "\n\n")
            if locations:
                output.write("Locations only; matched values and source are withheld.\n\n")
                output.write("<pre>" + html.escape(json.dumps(locations, indent=2)) + "</pre>\n")
    if findings:
        print("::error::Potential secrets require review; no automatic dismissal or fix was applied.")
    return status


if __name__ == "__main__":
    sys.exit(main())
