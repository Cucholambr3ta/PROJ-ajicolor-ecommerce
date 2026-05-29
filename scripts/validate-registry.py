#!/usr/bin/env python3
"""validate-registry.py — Sprint 5.

Valida prompts/agents/registry.json contra registry.schema.json y verifica
que cada agent.prompt_file exista físicamente en el repo.

Uso:
  python3 scripts/validate-registry.py [--strict]
  python3 scripts/validate-registry.py --help

Strict mode: falla además si:
  - hay agent.id duplicado.
  - composition_pattern referencia agent.id inexistente.
  - routing_rule referencia agent.id inexistente.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

__version__ = "0.1.0-dev"

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "prompts" / "agents" / "registry.json"
SCHEMA = ROOT / "prompts" / "agents" / "registry.schema.json"


def load_json(p: Path) -> dict:
    if not p.exists():
        print(f"[validate-registry] ✗ {p.relative_to(ROOT)} no existe.", file=sys.stderr)
        sys.exit(2)
    return json.loads(p.read_text(encoding="utf-8"))


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="validate-registry")
    parser.add_argument("-v", "--version", action="version",
                        version=f"validate-registry v{__version__}")
    parser.add_argument("--strict", action="store_true",
                        help="Falla también en duplicados e id-refs rotas.")
    args = parser.parse_args(argv)

    errors: list[str] = []
    warnings: list[str] = []

    registry = load_json(REGISTRY)
    schema = load_json(SCHEMA)

    # JSON Schema validation (opcional, si jsonschema está instalado)
    try:
        import jsonschema
        try:
            jsonschema.validate(registry, schema)
            print(f"[validate-registry] ✓ schema OK ({len(registry['agents'])} agents).")
        except jsonschema.ValidationError as e:
            errors.append(f"schema: {e.message} (path: {'/'.join(str(p) for p in e.absolute_path)})")
    except ImportError:
        warnings.append(
            "python3-jsonschema no instalado; validación de schema omitida. "
            "Instalar: pip install jsonschema (o apt install python3-jsonschema)"
        )

    # prompt_file existe
    ids = set()
    for agent in registry["agents"]:
        ids.add(agent["id"])
        pf = ROOT / agent["prompt_file"]
        if not pf.exists():
            errors.append(f"agent {agent['id']!r}: prompt_file no existe: {agent['prompt_file']}")

    if args.strict:
        # duplicados
        seen: dict[str, int] = {}
        for agent in registry["agents"]:
            seen[agent["id"]] = seen.get(agent["id"], 0) + 1
        for aid, count in seen.items():
            if count > 1:
                errors.append(f"agent.id duplicado: {aid!r} aparece {count} veces")

        # composition_patterns id-refs
        for cp in registry.get("composition_patterns", []):
            if cp["lead"] not in ids:
                errors.append(f"composition {cp['name']!r}: lead {cp['lead']!r} no existe en agents")
            for sp in cp["specialists"]:
                if sp not in ids:
                    errors.append(f"composition {cp['name']!r}: specialist {sp!r} no existe en agents")

        # routing_rules id-refs
        for rule in registry.get("routing_rules", []):
            if rule["agent"] not in ids:
                errors.append(f"routing_rule: agent {rule['agent']!r} no existe")

    # Salida
    for w in warnings:
        print(f"[validate-registry] ⚠ {w}", file=sys.stderr)
    for e in errors:
        print(f"[validate-registry] ✗ {e}", file=sys.stderr)

    if errors:
        print(f"[validate-registry] FAIL: {len(errors)} errores.", file=sys.stderr)
        return 1

    cats = sorted({a["category"] for a in registry["agents"]})
    print(f"[validate-registry] ✓ {len(registry['agents'])} agents OK en "
          f"{len(cats)} categorías.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
