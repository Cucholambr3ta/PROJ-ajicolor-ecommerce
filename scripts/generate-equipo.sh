#!/bin/bash
# generate-equipo.sh — Sprint 5.
# Regenera docs/equipo.md desde prompts/agents/registry.json.
# El registry es la SSoT (Single Source of Truth); equipo.md se deriva.
set -eu

XDD_VERSION="0.1.0-dev"

case "${1:-}" in
  -h|--help)
    cat <<'EOF'
generate-equipo — regenera docs/equipo.md desde el registry.

Uso:
  bash scripts/generate-equipo.sh
  bash scripts/generate-equipo.sh --help | --version

Hace:
  1. Lee prompts/agents/registry.json.
  2. Genera docs/equipo.md agrupado por categoría.
  3. Imprime resumen al final.

NO edites docs/equipo.md a mano — cambia el .md del agente o el registry
y volvé a correr este script.
EOF
    exit 0
    ;;
  -v|--version)
    echo "generate-equipo v${XDD_VERSION}"
    exit 0
    ;;
esac

ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." && pwd )"
REGISTRY="$ROOT/prompts/agents/registry.json"
OUTPUT="$ROOT/docs/equipo.md"

[ -f "$REGISTRY" ] || { echo "[generate-equipo] ✗ $REGISTRY no existe."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "[generate-equipo] ✗ python3 requerido."; exit 1; }

python3 - "$REGISTRY" "$OUTPUT" <<'PY'
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

registry_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
data = json.loads(registry_path.read_text(encoding="utf-8"))

agents = data["agents"]
patterns = data.get("composition_patterns", [])
routes = data.get("routing_rules", [])

by_cat = defaultdict(list)
for a in agents:
    by_cat[a["category"]].append(a)
for cat in by_cat:
    by_cat[cat].sort(key=lambda a: a["name"].lower())

ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
lines = []
lines.append("# Equipo X-DD — Directorio de Agentes")
lines.append("")
lines.append("> **Generado automáticamente** desde `prompts/agents/registry.json` por")
lines.append("> `scripts/generate-equipo.sh`. **NO editar a mano** — modificá el `.md`")
lines.append("> del agente o el registry y re-ejecutá el script.")
lines.append("")
lines.append(f"- **Generado:** `{ts}`")
lines.append(f"- **Total agentes:** {len(agents)}")
lines.append(f"- **Categorías:** {len(by_cat)}")
lines.append(f"- **Composition patterns:** {len(patterns)}")
lines.append(f"- **Routing rules:** {len(routes)}")
lines.append("")
lines.append("## Índice por categoría")
lines.append("")
for cat in sorted(by_cat):
    n = len(by_cat[cat])
    lines.append(f"- [{cat}](#{cat.replace('-', '-')}) — {n} agentes")
lines.append("")
lines.append("---")
lines.append("")

for cat in sorted(by_cat):
    lines.append(f"## {cat}")
    lines.append("")
    lines.append("| Agente | Descripción | Prompt file |")
    lines.append("|--------|-------------|-------------|")
    for a in by_cat[cat]:
        emoji = (a.get("emoji") or "").strip()
        name = f"{emoji} {a['name']}" if emoji else a["name"]
        desc = (a.get("description") or "").replace("|", "/").replace("\n", " ").strip()
        if len(desc) > 140:
            desc = desc[:137] + "…"
        pf = a["prompt_file"]
        lines.append(f"| **{name}** | {desc} | [`{pf}`]({pf.replace(' ', '%20')}) |")
    lines.append("")

if patterns:
    lines.append("---")
    lines.append("")
    lines.append("## Composition patterns (lead + specialists)")
    lines.append("")
    lines.append("| Patrón | Lead | Specialists | Orquestación |")
    lines.append("|--------|------|-------------|--------------|")
    for p in patterns:
        sp = ", ".join(f"`{s}`" for s in p["specialists"])
        lines.append(f"| `{p['name']}` | `{p['lead']}` | {sp} | {p['orchestration']} |")
    lines.append("")

if routes:
    lines.append("---")
    lines.append("")
    lines.append("## Routing rules")
    lines.append("")
    lines.append("| Condición | Agente | Prioridad |")
    lines.append("|-----------|--------|-----------|")
    for r in routes:
        lines.append(f"| `{r['condition']}` | `{r['agent']}` | {r.get('priority', '-')} |")
    lines.append("")

lines.append("---")
lines.append("")
lines.append("*X-DD System — Directorio de agentes auto-generado.*")
lines.append("")

output_path.write_text("\n".join(lines), encoding="utf-8")
print(f"[generate-equipo] ✓ {output_path.relative_to(Path.cwd())} actualizado "
      f"({len(agents)} agentes, {len(by_cat)} categorías).")
PY
