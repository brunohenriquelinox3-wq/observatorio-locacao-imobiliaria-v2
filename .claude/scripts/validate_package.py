#!/usr/bin/env python3
"""Validate the repository-local Claude package without external credentials."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
SKILLS = ROOT / ".claude" / "skills"
errors: list[str] = []

for skill_dir in sorted(p for p in SKILLS.iterdir() if p.is_dir()):
    skill_file = skill_dir / "SKILL.md"
    if not skill_file.is_file():
        errors.append(f"missing SKILL.md: {skill_dir.relative_to(ROOT)}")
        continue
    text = skill_file.read_text(encoding="utf-8")
    if not text.startswith("---\n") or "\nname:" not in text or "\ndescription:" not in text:
        errors.append(f"invalid frontmatter: {skill_file.relative_to(ROOT)}")
    if len(text.splitlines()) > 500:
        errors.append(f"SKILL.md exceeds 500 lines: {skill_file.relative_to(ROOT)}")

for path in list((ROOT / ".claude").rglob("*")) + [ROOT / "CLAUDE.md"]:
    if not path.is_file() or path.suffix not in {".md", ".json", ".py"}:
        continue
    if path == Path(__file__):
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    for pattern in (r"/home/ubuntu/", r"-----BEGIN .* PRIVATE KEY-----", r"Bearer\s+[A-Za-z0-9._-]{20,}"):
        if re.search(pattern, text):
            errors.append(f"non-portable or sensitive marker {pattern}: {path.relative_to(ROOT)}")

if errors:
    print("CLAUDE_PACKAGE_INVALID")
    print("\n".join(f"- {error}" for error in errors))
    sys.exit(1)

print(f"CLAUDE_PACKAGE_OK skills={len([p for p in SKILLS.iterdir() if p.is_dir()])}")
