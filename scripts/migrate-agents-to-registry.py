#!/usr/bin/env python3
"""migrate-agents-to-registry.py — Sprint 5.

Parsea los 184 agentes en prompts/agents/<category>/*.md y produce
prompts/agents/registry.json inicial. Lee el frontmatter YAML (name,
description, color, emoji, vibe) y deriva category del directorio.

Ejecutar UNA SOLA VEZ al bootstrap del registry. Después, los agentes
nuevos se añaden manualmente al registry y se generan/actualizan los .md.

Uso:
  python3 scripts/migrate-agents-to-registry.py [--dry-run] [--output PATH]
  python3 scripts/migrate-agents-to-registry.py --help
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

__version__ = "0.1.0-dev"

ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = ROOT / "prompts" / "agents"
DEFAULT_OUTPUT = AGENTS_DIR / "registry.json"

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def parse_frontmatter(text: str) -> dict[str, str]:
    """Parser YAML mínimo (no asume PyYAML disponible)."""
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}
    fields: dict[str, str] = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip().strip('"').strip("'")
    return fields


def parse_agent(path: Path, category: str) -> dict | None:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return None
    fm = parse_frontmatter(text)
    if not fm:
        return None
    name = fm.get("name") or path.stem.replace("-", " ").title()
    return {
        "id": slugify(path.stem),
        "name": name,
        "category": category,
        "description": fm.get("description", "").strip(),
        "emoji": fm.get("emoji", "").strip(),
        "color": fm.get("color", "").strip(),
        "vibe": fm.get("vibe", "").strip(),
        "prompt_file": str(path.relative_to(ROOT).as_posix()),
        "ide_compat": ["claude-code", "opencode", "mcp"],
        "skills": [],
        "constraints": [],
        "triggers": [],
        "fallback_agent": None,
    }


COMPOSITION_PATTERNS = [
    {
        "name": "security_review",
        "lead": "engineering-code-reviewer",
        "specialists": [
            "engineering-security-engineer",
            "engineering-threat-detection-engineer",
        ],
        "orchestration": "sequential",
        "gate_between": "peer_review",
        "description": "Code review enfocado en seguridad antes de merge.",
    },
    {
        "name": "feature_squad",
        "lead": "product-manager",
        "specialists": [
            "engineering-backend-architect",
            "design-ui-designer",
            "testing-test-results-analyzer",
        ],
        "orchestration": "parallel_then_sync",
        "sync_point": "spec_approval",
        "description": "Construcción de feature E2E: producto + ingeniería + diseño + testing.",
    },
    {
        "name": "release_train",
        "lead": "project-management-studio-producer",
        "specialists": [
            "testing-contract-testing-engineer",
            "engineering-devops-automator",
            "support-end-user-docs-writer",
        ],
        "orchestration": "sequential",
        "gate_between": "qa_gate",
        "description": "Coordinación de release: contratos, deploy, docs user-facing.",
    },
]


def build_registry(dry_run: bool = False) -> dict:
    agents: list[dict] = []
    for cat_dir in sorted(AGENTS_DIR.iterdir()):
        if not cat_dir.is_dir() or cat_dir.name.startswith("."):
            continue
        category = cat_dir.name
        for md in sorted(cat_dir.glob("*.md")):
            if md.name.lower() in ("readme.md",):
                continue
            entry = parse_agent(md, category)
            if entry:
                agents.append(entry)
    registry = {
        "$schema": "./registry.schema.json",
        "version": "1.0.0",
        "generated_by": "scripts/migrate-agents-to-registry.py",
        "agents": agents,
        "composition_patterns": COMPOSITION_PATTERNS,
        "routing_rules": [
            {
                "condition": "phase == 'spec' AND artifact == 'THREATS.md'",
                "agent": "engineering-threat-detection-engineer",
                "priority": 1,
            },
            {
                "condition": "phase == 'spec' AND artifact == 'DOMAIN.md'",
                "agent": "engineering-backend-architect",
                "priority": 1,
            },
            {
                "condition": "phase == 'qa' AND artifact == 'QA_REPORT.md'",
                "agent": "testing-test-results-analyzer",
                "priority": 1,
            },
        ],
    }
    return registry


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="migrate-agents-to-registry",
        description="Genera prompts/agents/registry.json desde los .md existentes."
    )
    parser.add_argument("-v", "--version", action="version",
                        version=f"migrate-agents-to-registry v{__version__}")
    parser.add_argument("--dry-run", action="store_true",
                        help="No escribe; imprime el JSON a stdout.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT,
                        help=f"Path destino (default: {DEFAULT_OUTPUT.relative_to(ROOT)}).")
    args = parser.parse_args(argv)

    if not AGENTS_DIR.exists():
        print(f"[migrate] {AGENTS_DIR} no existe", file=sys.stderr)
        return 1

    registry = build_registry()
    n = len(registry["agents"])
    if n == 0:
        print(f"[migrate] no se encontraron agentes en {AGENTS_DIR}", file=sys.stderr)
        return 1

    payload = json.dumps(registry, indent=2, ensure_ascii=False) + "\n"

    if args.dry_run:
        sys.stdout.write(payload)
        print(f"[migrate] (dry-run) {n} agentes detectados en "
              f"{len(set(a['category'] for a in registry['agents']))} categorías",
              file=sys.stderr)
        return 0

    args.output.write_text(payload, encoding="utf-8")
    print(f"[migrate] ✓ {args.output.relative_to(ROOT)} generado con {n} agentes "
          f"({len(set(a['category'] for a in registry['agents']))} categorías).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
