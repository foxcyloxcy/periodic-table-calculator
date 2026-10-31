#!/usr/bin/env python3
"""Read-only source fingerprint check; an HTML revision is NOT scientific approval."""
import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SOURCES = {
    "IUPAC_ELEMENTS": "https://iupac.org/what-we-do/periodic-table-of-elements/",
    "CIAAW_STANDARD_2024": "https://www.ciaaw.org/atomic-weights.htm",
    "CIAAW_ABRIDGED_2024": "https://www.ciaaw.org/abridged-atomic-weights.htm",
}
out = {"checkedAt": datetime.now(timezone.utc).isoformat(), "purpose": "source-revision-monitor-only", "sources": {}}
for source, url in SOURCES.items():
    item = {"url": url, "status": "unavailable", "sha256": None}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ElementCalculatorScientificReferenceAudit/1.0"})
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = response.read(5_000_001)
            if len(raw) > 5_000_000:
                raise ValueError("Source exceeds bounded response size")
            item["sha256"] = hashlib.sha256(raw).hexdigest()
            item["status"] = "fetched_requires_scientific_review"
            item["bytes"] = len(raw)
            item["contentType"] = response.headers.get("Content-Type")
    except Exception as error:
        item["error"] = type(error).__name__
    out["sources"][source] = item

p = Path("artifacts")
p.mkdir(exist_ok=True)
(p / "official-element-sources.json").write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
print(json.dumps(out, indent=2))
# This is a monitoring artifact, not a source import or a certification.
