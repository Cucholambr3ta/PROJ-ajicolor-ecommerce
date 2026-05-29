#!/bin/bash
# xdd-brand.sh — aplica branding del xdd.profile.yml al proyecto destino (Sprint 13).
# Lee sección branding y genera:
#   - Symlink/copia del slash command principal con el trigger custom (.claude/commands/<trigger>.md)
#   - System prompt del orquestador con persona aplicada (a .claude/orchestrator.md)
#   - Banner files del proyecto consumidor con ecosystem_name
set -eu

XDD_VERSION="0.1.0-dev"
ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." && pwd )"

case "${1:-}" in
  -h|--help)
    cat <<'EOF'
xdd-brand — aplica white-labeling del proyecto (Sprint 13).

Uso:
  bash scripts/xdd-brand.sh [PROJECT_DIR]
  bash scripts/xdd-brand.sh --show [PROJECT_DIR]    Solo muestra branding sin aplicar
  bash scripts/xdd-brand.sh --help | --version

Lee xdd.profile.yml sección branding del PROJECT_DIR (default $PWD) y:
1. Genera .claude/commands/<orchestrator_trigger>.md (slash command principal)
2. Aplica persona al system prompt del orquestador
3. Substituye {{ecosystem_name}} en files relevantes

Default si no hay sección branding: identity X-DD estándar (no-op).

Backward-compatible. Idempotente.
EOF
    exit 0 ;;
  -v|--version) echo "xdd-brand v${XDD_VERSION}"; exit 0 ;;
esac

SHOW_ONLY=0
if [ "${1:-}" = "--show" ]; then SHOW_ONLY=1; shift; fi
DEST="${1:-$PWD}"
PROFILE="$DEST/xdd.profile.yml"

if [ ! -f "$PROFILE" ]; then
  echo "[xdd-brand] $PROFILE no existe — nada que aplicar." >&2
  exit 0
fi

command -v python3 >/dev/null 2>&1 || { echo "[xdd-brand] python3 requerido."; exit 1; }

# Parse branding section
read_branding() {
python3 - "$PROFILE" <<'PY'
import sys
try:
    text = open(sys.argv[1]).read()
except Exception:
    sys.exit(0)

# Parser YAML mínimo (sin PyYAML). Solo busca sección branding.
in_branding = False
indent = None
out = {
  "ecosystem_name": "X-DD",
  "ecosystem_slug": "xdd",
  "orchestrator_trigger": "xdd",
  "rename_subworkflows": False,
  "tone": "technical",
  "custom_prompt": "",
  "compact": "off",
  "attribution_required": True,
}
for line in text.splitlines():
    stripped = line.rstrip()
    if not stripped or stripped.lstrip().startswith("#"): continue
    if stripped == "branding:":
        in_branding = True
        continue
    if in_branding:
        # Si volvemos a indentación 0, salimos
        if stripped and not stripped[0].isspace() and ":" in stripped:
            in_branding = False
            continue
        if ":" in stripped:
            key, _, val = stripped.lstrip().partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if val in ("true", "false"):
                val = val == "true"
            if key in out:
                out[key] = val
            # nested orchestrator_persona.tone
            if key == "tone": out["tone"] = val
            if key == "custom_prompt": out["custom_prompt"] = val
            if key == "compact": out["compact"] = val
            if key == "ecosystem_name": out["ecosystem_name"] = val
            if key == "ecosystem_slug": out["ecosystem_slug"] = val
            if key == "orchestrator_trigger": out["orchestrator_trigger"] = val
            if key == "rename_subworkflows": out["rename_subworkflows"] = val
            if key == "attribution_required": out["attribution_required"] = val

for k, v in out.items():
    print(f"{k}={v}")
PY
}

eval "$(read_branding | sed 's/^/B_/')"

echo "[xdd-brand] Branding detectado:"
echo "  ecosystem_name:        $B_ecosystem_name"
echo "  ecosystem_slug:        $B_ecosystem_slug"
echo "  orchestrator_trigger:  /$B_orchestrator_trigger"
echo "  rename_subworkflows:   $B_rename_subworkflows"
echo "  persona.tone:          $B_tone"
echo "  output.compact:        $B_compact"
echo "  attribution_required:  $B_attribution_required"

if [ "$SHOW_ONLY" = "1" ]; then
  exit 0
fi

# Aplicar: si el trigger != "xdd", crear COPIA REAL en .claude/commands/<trigger>.md.
# Sprint 24: copia real, NO symlink — Claude Code/Copilot rechazan symlinks (ver lección).
if [ "$B_orchestrator_trigger" != "xdd" ]; then
  echo "[xdd-brand] Aplicando trigger custom: /$B_orchestrator_trigger"
  mkdir -p "$DEST/.claude/commands"
  if [ -f "$ROOT/.agent/workflows/xdd.md" ]; then
    cp "$ROOT/.agent/workflows/xdd.md" "$DEST/.claude/commands/${B_orchestrator_trigger}.md"
    # Rebrand cabecera del command copiado (description + título)
    if command -v python3 >/dev/null 2>&1; then
      python3 - "$DEST/.claude/commands/${B_orchestrator_trigger}.md" "$B_ecosystem_name" "$B_orchestrator_trigger" <<'PY'
import sys, re
path, eco, trig = sys.argv[1], sys.argv[2], sys.argv[3]
t = open(path, encoding="utf-8").read()
t = re.sub(r"description:.*", f"description: Orquestador Principal del Ecosistema {eco} (powered by X-DD).", t, count=1)
t = t.replace("# /xdd", f"# /{trig}", 1)
open(path, "w", encoding="utf-8").write(t)
PY
    fi
    echo "  ✓ .claude/commands/${B_orchestrator_trigger}.md (copia real rebrandeada)"
  fi
fi

# Aplicar persona — copia el .md de la persona al proyecto
PERSONA_FILE="$ROOT/prompts/orchestrator/personas/${B_tone}.md"
if [ "$B_tone" = "custom" ] && [ -n "$B_custom_prompt" ]; then
  PERSONA_FILE="$DEST/$B_custom_prompt"
fi
if [ -f "$PERSONA_FILE" ]; then
  mkdir -p "$DEST/.claude"
  cp "$PERSONA_FILE" "$DEST/.claude/orchestrator-persona.md"
  echo "[xdd-brand] ✓ persona aplicada: $B_tone"
fi

# Crear .claude/branding.json con la config aplicada
cat > "$DEST/.claude/branding.json" <<EOF
{
  "applied_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ecosystem_name": "$B_ecosystem_name",
  "ecosystem_slug": "$B_ecosystem_slug",
  "orchestrator_trigger": "$B_orchestrator_trigger",
  "persona": "$B_tone",
  "compact": "$B_compact"
}
EOF

echo "[xdd-brand] ✓ Branding aplicado a $DEST"
echo "[xdd-brand]   .claude/branding.json escrito con config activa"
exit 0
