#!/bin/bash
# X-DD Adapter — genera configuración específica por IDE desde SSoT.
# v0.1.0 (Sprint 24): claude-code, opencode, cursor, windsurf, vscode-copilot, antigravity.
# Copia REAL (no symlinks — Claude Code/Copilot los rechazan). MCP auto-config por IDE.
set -eu

XDD_VERSION="0.1.0-dev"
ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." && pwd )"

usage() {
  cat <<'EOF'
xdd-adapt — genera config IDE-específica desde el SSoT de X-DD.

Uso:
  bash scripts/xdd-adapt.sh <target> [--dest=PATH] [--trigger=NAME] [--dry-run]
  bash scripts/xdd-adapt.sh --help | --version | --list

Targets soportados (Sprint 24 + codex):
  claude-code     .claude/commands/*.md (copia real) + .mcp.json + CLAUDE.md
  opencode        AGENTS.md + .opencode/command/ + .agent/workflows/
  cursor          .cursor/rules/<trigger>.mdc + .cursor/mcp.json
  windsurf        .windsurf/rules/<trigger>.md + MCP note
  vscode-copilot  .github/prompts/*.prompt.md (slash en Copilot) + .vscode/mcp.json + tasks.json + settings.json
  antigravity     ~/.gemini/config/mcp_config.json (MERGE) + .agents/skills/ + .antigravity/README
  codex           ~/.codex/skills/<trigger>-orchestrator/ (SKILL.md + agents-index.json + workflows-index)
  all             genera todos los soportados (auto-detect aplica si --dest tiene markers)

Opciones:
  --dest=PATH      destino (default: $PWD)
  --trigger=NAME   trigger custom (default: lee branding de xdd.profile.yml, fallback "xdd")
  --dry-run        no escribe; solo lista
  --list           lista targets + sale
EOF
}

list_targets() {
  cat <<EOF
Targets (todos copia real + MCP/global auto-config):
  claude-code     — slash commands .md reales + .mcp.json
  opencode        — AGENTS.md + .opencode/command/ + .agent/workflows/
  cursor          — .cursor/rules/*.mdc + .cursor/mcp.json
  windsurf        — .windsurf/rules/*.md + MCP
  vscode-copilot  — .github/prompts/*.prompt.md (slash /<trigger>) + .vscode/{mcp,tasks,settings}.json
  antigravity     — ~/.gemini/config/mcp_config.json (MERGE) + .agents/skills/
  codex           — ~/.codex/skills/<trigger>-orchestrator/ (SKILL.md + agents-index.json)
  all             — los 7
EOF
}

TARGET=""
DEST=""
DRY_RUN=0
TRIGGER=""

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -v|--version) echo "xdd-adapt v${XDD_VERSION}"; exit 0 ;;
    --list) list_targets; exit 0 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --dest=*) DEST="${1#--dest=}"; shift ;;
    --dest) DEST="$2"; shift 2 ;;
    --trigger=*) TRIGGER="${1#--trigger=}"; shift ;;
    --trigger) TRIGGER="$2"; shift 2 ;;
    claude-code|opencode|cursor|windsurf|vscode-copilot|antigravity|codex|all)
      TARGET="$1"; shift ;;
    *) echo "[xdd-adapt] ERROR: argumento desconocido: $1" >&2; usage; exit 2 ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo "[xdd-adapt] ERROR: falta <target>." >&2
  usage
  exit 2
fi

DEST="${DEST:-$PWD}"
if [ ! -d "$DEST" ]; then
  echo "[xdd-adapt] ERROR: destino no existe: $DEST" >&2
  exit 2
fi

WF_DIR="$ROOT/.agent/workflows"
if [ ! -d "$WF_DIR" ]; then
  echo "[xdd-adapt] ERROR: no se encuentra $WF_DIR (SSoT de workflows)." >&2
  exit 2
fi

# Resolver trigger: --trigger > branding xdd.profile.yml > "xdd"
resolve_trigger() {
  if [ -n "$TRIGGER" ]; then echo "$TRIGGER"; return; fi
  local profile="$DEST/xdd.profile.yml"
  if [ -f "$profile" ] && command -v python3 >/dev/null 2>&1; then
    local t
    t=$(python3 -c "
import sys
try:
    import yaml
    d = yaml.safe_load(open('$profile')) or {}
    print((d.get('branding') or {}).get('orchestrator_trigger', 'xdd'))
except Exception:
    print('xdd')
" 2>/dev/null)
    echo "${t:-xdd}"
  else
    echo "xdd"
  fi
}
TRIGGER="$(resolve_trigger)"

emit() {
  if [ $DRY_RUN -eq 1 ]; then echo "  [dry-run] write: $1"; else echo "  ✓ write: $1"; fi
}

write_file() {
  local target="$1" content="$2"
  if [ $DRY_RUN -eq 1 ]; then emit "$target"; return; fi
  mkdir -p "$(dirname "$target")"
  printf '%s\n' "$content" > "$target"
  emit "$target"
}

copy_real() {
  # copy_real <src> <dst>  — copia archivo REAL (no symlink)
  local src="$1" dst="$2"
  if [ $DRY_RUN -eq 1 ]; then emit "$dst (copia real ← $src)"; return; fi
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  emit "$dst"
}

# === MCP config generator (formato por IDE) ===
# mcpServers (Claude Code/Cursor/Antigravity) vs servers (VSCode)
gen_mcp_json() {
  # gen_mcp_json <path> <key>   key = mcpServers | servers
  local path="$1" key="$2"
  local content
  content=$(cat <<EOF
{
  "$key": {
    "$TRIGGER": {
      "command": "python3",
      "args": ["-m", "xdd-mcp-server"],
      "cwd": "$DEST"
    }
  }
}
EOF
)
  write_file "$path" "$content"
}

# === Commands reales desde workflows SSoT ===
# Copia los workflows como commands reales. El trigger principal (xdd.md) se
# copia con nombre <trigger>.md.
copy_commands() {
  # copy_commands <dst_dir> <ext>   ext = "md" | "prompt.md"
  local dst_dir="$1" ext="$2"
  local count=0
  for wf in "$WF_DIR"/*.md; do
    local base; base=$(basename "$wf" .md)
    case "$base" in readme|README) continue ;; esac
    local outname
    if [ "$base" = "xdd" ] && [ "$TRIGGER" != "xdd" ]; then
      outname="$TRIGGER"
    else
      outname="$base"
    fi
    copy_real "$wf" "$dst_dir/${outname}.${ext}"
    if [ "$base" = "xdd" ] && [ "$TRIGGER" != "xdd" ] && [ $DRY_RUN -eq 0 ] && command -v python3 >/dev/null 2>&1; then
      python3 - "$dst_dir/${outname}.${ext}" "$TRIGGER" <<'PY'
import sys, re
path, trig = sys.argv[1], sys.argv[2]
t = open(path, encoding="utf-8").read()
t = re.sub(r"description:.*", f"description: Orquestador Principal X-DD (trigger /{trig}).", t, count=1)
t = t.replace("# /xdd", f"# /{trig}", 1)
open(path, "w", encoding="utf-8").write(t)
PY
    fi
    count=$((count+1))
  done
  echo "[xdd-adapt] ✓ ${count} commands (copia real, trigger=/$TRIGGER)."
}

adapt_claude_code() {
  echo "[xdd-adapt] target: claude-code → $DEST/.claude/commands/ (copia real)"
  copy_commands "$DEST/.claude/commands" "md"
  gen_mcp_json "$DEST/.mcp.json" "mcpServers"
  if [ ! -e "$DEST/CLAUDE.md" ]; then
    write_file "$DEST/CLAUDE.md" "# Proyecto integrado con X-DD\n\nWorkflows: \`.claude/commands/\` (copia real desde \`.agent/workflows/\`).\nMCP: \`.mcp.json\` apunta a xdd-mcp-server.\nMemoria: \`memoria.md\` · Lecciones: \`lecciones.md\` · Config: \`xdd.profile.yml\`.\n\nDocs: https://github.com/Cucholambr3ta/x-dd"
  else
    echo "[xdd-adapt] SKIP CLAUDE.md (ya existe)"
  fi
}

adapt_opencode() {
  echo "[xdd-adapt] target: opencode → $DEST/.opencode/command/ + AGENTS.md (governance) + docs/equipo.md (registry)"
  copy_commands "$DEST/.opencode/command" "md"
  # .agent/workflows symlink al SSoT (OpenCode lo lee directo; symlink OK aquí, no es slash command file)
  if [ ! -e "$DEST/.agent/workflows" ]; then
    if [ $DRY_RUN -eq 0 ]; then mkdir -p "$DEST/.agent"; ln -sf "$WF_DIR" "$DEST/.agent/workflows"; fi
    emit ".agent/workflows (symlink → $WF_DIR)"
  fi

  # AGENTS.md = GOVERNANCE manifest (no overwrite si existe). Copia desde X-DD source root.
  if [ ! -f "$DEST/AGENTS.md" ] && [ -f "$ROOT/AGENTS.md" ] && [ $DRY_RUN -eq 0 ]; then
    cp "$ROOT/AGENTS.md" "$DEST/AGENTS.md"
    echo "[xdd-adapt] ✓ AGENTS.md (governance) copiado"
  elif [ -f "$DEST/AGENTS.md" ]; then
    echo "[xdd-adapt] SKIP AGENTS.md (ya existe — preserva governance custom del proyecto)"
  fi

  # Registry de 180 agentes → docs/equipo.md (NO AGENTS.md, separar ley vs directory)
  local registry="$ROOT/prompts/agents/registry.json"
  if [ -f "$registry" ] && command -v python3 >/dev/null 2>&1 && [ $DRY_RUN -eq 0 ]; then
    mkdir -p "$DEST/docs"
    python3 - "$registry" "$DEST/docs/equipo.md" <<'PY'
import json, sys
from collections import defaultdict
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
by_cat = defaultdict(list)
for a in data["agents"]:
    by_cat[a["category"]].append(a)
lines = ["# Directorio de Agentes — X-DD", "", f"> Auto-generado desde `prompts/agents/registry.json` por `xdd-adapt opencode`. {len(data['agents'])} agentes en {len(by_cat)} categorías.", ""]
for cat in sorted(by_cat):
    lines.append(f"## {cat} ({len(by_cat[cat])})")
    lines.append("")
    for a in sorted(by_cat[cat], key=lambda a: a["name"].lower()):
        desc = (a.get("description") or "").split("\n")[0][:120]
        lines.append(f"- **{a['name']}** — {desc}")
    lines.append("")
Path(sys.argv[2]).write_text("\n".join(lines), encoding="utf-8")
print("[xdd-adapt] ✓ docs/equipo.md regenerado (registry → directorio)")
PY
  fi
}

adapt_cursor() {
  echo "[xdd-adapt] target: cursor → $DEST/.cursor/"
  # Cursor: rules .mdc (no slash exec, pero @-mention) + MCP config
  write_file "$DEST/.cursor/rules/${TRIGGER}.mdc" "$(cat <<EOF
---
description: Orquestador X-DD/$TRIGGER. Pipeline gated 6 fases.
globs:
alwaysApply: false
---
# /$TRIGGER — Orquestador X-DD

Para activar el orquestador, menciona @$TRIGGER o invoca la tool MCP \`xdd_invoke_workflow\` con name="xdd".

Workflows disponibles en \`.agent/workflows/\`. Lee \`memoria.md\` + \`lecciones.md\` + \`CLAUDE.md\` al iniciar (Constitución Art. 3 y 9).

MCP server: ver \`.cursor/mcp.json\`.
EOF
)"
  gen_mcp_json "$DEST/.cursor/mcp.json" "mcpServers"
}

adapt_windsurf() {
  # Sprint 26 + ADR-0037: paridad con claude-code/opencode (workflows nativos) +
  # paridad con antigravity (MCP merge global, no project-local).
  # Windsurf usa ~/.codeium/mcp_config.json (GLOBAL) según docs.windsurf.com.
  # Override: XDD_WINDSURF_HOME (default $HOME/.codeium).
  local windsurf_cfg="${XDD_WINDSURF_HOME:-$HOME/.codeium}/mcp_config.json"
  echo "[xdd-adapt] target: windsurf"
  echo "  · Workflows: $DEST/.windsurf/workflows/ (slash nativos /$TRIGGER)"
  echo "  · Rules:     $DEST/.windsurf/rules/${TRIGGER}.md"
  echo "  · MCP cfg:   $windsurf_cfg (MERGE global)"

  local wrapper="$HOME/.local/bin/xdd-mcp-server"
  local use_global=0
  if [ -x "$wrapper" ]; then
    use_global=1
    echo "[xdd-adapt] usando wrapper global (sin cwd, dinámico al workspace IDE)"
  else
    echo "[xdd-adapt] wrapper global no instalado — modo legacy con cwd fijo=$DEST"
    echo "[xdd-adapt]   recomendado: bash scripts/xdd-mcp-install-global.sh"
  fi

  # 1. Workflows nativos — Windsurf descubre .windsurf/workflows/*.md como slash commands.
  #    Doc oficial: https://docs.windsurf.com/plugins/cascade/workflows.md
  copy_commands "$DEST/.windsurf/workflows" "md"

  # 1.b WARN si algún workflow excede 12000 chars (límite Windsurf documentado).
  if [ $DRY_RUN -eq 0 ] && [ -d "$DEST/.windsurf/workflows" ]; then
    local oversize=0
    for wf in "$DEST/.windsurf/workflows"/*.md; do
      [ -f "$wf" ] || continue
      local size
      size=$(wc -c < "$wf")
      if [ "$size" -gt 12000 ]; then
        echo "[xdd-adapt] WARN: $(basename "$wf") = ${size} chars > 12000 (límite Windsurf). Considera split." >&2
        oversize=$((oversize+1))
      fi
    done
    [ $oversize -eq 0 ] || echo "[xdd-adapt] WARN: ${oversize} workflow(s) exceden límite Windsurf — pueden fallar discovery." >&2
  fi

  # 2. Rule orquestador (@-mention trigger).
  write_file "$DEST/.windsurf/rules/${TRIGGER}.md" "$(cat <<EOF
# /$TRIGGER — Orquestador X-DD (Windsurf)

Activa orquestador con \`/$TRIGGER\` (slash nativo, workflows en \`.windsurf/workflows/\`) o mención @$TRIGGER.
Pipeline gated 6 fases. Lee memoria/lecciones/CLAUDE al iniciar.

MCP server registrado en config global Windsurf (\`~/.codeium/mcp_config.json\`). 6 tools disponibles.
EOF
)"

  # 3. MCP config merge en ~/.codeium/mcp_config.json (GLOBAL Windsurf).
  if [ $DRY_RUN -eq 1 ]; then
    emit "$windsurf_cfg (merge '$TRIGGER', use_global=$use_global)"
  elif command -v python3 >/dev/null 2>&1; then
    python3 - "$windsurf_cfg" "$TRIGGER" "$DEST" "$wrapper" "$use_global" <<'PY'
import json, os, sys
cfg_path, trigger, dest, wrapper, use_global = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] == "1"
os.makedirs(os.path.dirname(cfg_path), exist_ok=True)
cfg = {}
if os.path.exists(cfg_path):
    try:
        cfg = json.load(open(cfg_path, encoding="utf-8"))
    except Exception:
        print(f"[xdd-adapt] ERROR: {cfg_path} contiene JSON corrupto — ABORT (no destruir)", file=sys.stderr)
        sys.exit(1)
cfg.setdefault("mcpServers", {})
entry = {}
if use_global:
    entry["command"] = wrapper
    entry["args"] = []
else:
    entry["command"] = "python3"
    entry["args"] = ["-m", "xdd-mcp-server"]
    entry["cwd"] = dest
cfg["mcpServers"][trigger] = entry
json.dump(cfg, open(cfg_path, "w", encoding="utf-8"), indent=2)
print(f"[xdd-adapt] ✓ '{trigger}' merged en {cfg_path} (use_global={use_global})")
PY
  else
    echo "[xdd-adapt] ERROR: python3 no disponible — no se puede mergear $windsurf_cfg" >&2
    return 1
  fi

  # 4. Stub project-local .windsurf/mcp.json (informativo, no funcional).
  write_file "$DEST/.windsurf/mcp.json" "$(cat <<'EOF'
{
  "_comment": "Config MCP real vive en ~/.codeium/mcp_config.json (Windsurf lee solo de ahí, no project-local). Este archivo es stub informativo. Re-ejecuta xdd-adapt windsurf para regenerar.",
  "mcpServers": {}
}
EOF
)"

  # 5. README local explicando arquitectura.
  write_file "$DEST/.windsurf/README-xdd.md" "$(cat <<EOF
# X-DD / $TRIGGER en Windsurf

Windsurf (Codeium) consume X-DD vía 3 mecanismos:

## 1. Workflows nativos (slash commands)
\`.windsurf/workflows/*.md\` — Windsurf los descubre auto desde workspace.
Invoca con \`/$TRIGGER\` u otro nombre de workflow (\`/fase-requisitos\`, \`/plan-fases\`, etc).
Doc: https://docs.windsurf.com/plugins/cascade/workflows.md
Límite: 12000 chars por archivo (adapter WARN si excede).

## 2. Rule orquestador (@-mention)
\`.windsurf/rules/${TRIGGER}.md\` — Cascade lo carga como contexto persistente.
Activa con \`@$TRIGGER\` en chat.

## 3. MCP server (6 tools)
Config GLOBAL en \`~/.codeium/mcp_config.json\` (mergeada por adapter).
Override: \`XDD_WINDSURF_HOME\` env var.
Doc: https://docs.windsurf.com/plugins/cascade/mcp.md

**Sprint 25 (recomendado):**
1. \`bash scripts/xdd-mcp-install-global.sh\` (wrapper en ~/.local/bin)
2. \`bash scripts/xdd-adapt.sh windsurf --dest=<proyecto>\`
3. Reinicia Windsurf. Tools auto-descubiertas.

## Re-sync tras editar SSoT
\`bash scripts/xdd-adapt.sh windsurf --dest=<proyecto>\`
Workflows + rule + MCP entry actualizados (no destructive merge).
EOF
)"
}

adapt_vscode_copilot() {
  echo "[xdd-adapt] target: vscode-copilot → .github/prompts/ + .vscode/{mcp,tasks,settings}.json"
  # 1. Prompt files (slash /<trigger> en Copilot Chat) — copia real
  copy_commands "$DEST/.github/prompts" "prompt.md"
  # 2. MCP server (key "servers" — convención VSCode, no "mcpServers")
  gen_mcp_json "$DEST/.vscode/mcp.json" "servers"
  # 3. tasks.json — 4 tasks comunes accesibles desde Paleta (Run Task) o atajo
  if [ ! -e "$DEST/.vscode/tasks.json" ]; then
    write_file "$DEST/.vscode/tasks.json" "$(cat <<EOF
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "X-DD: doctor",
      "type": "shell",
      "command": "bash scripts/xdd-doctor.sh",
      "problemMatcher": [],
      "presentation": {"reveal": "always", "panel": "dedicated"}
    },
    {
      "label": "X-DD: start orchestrator",
      "type": "shell",
      "command": "bash scripts/xdd-start.sh",
      "problemMatcher": [],
      "presentation": {"reveal": "always", "panel": "dedicated"}
    },
    {
      "label": "X-DD: list workflows",
      "type": "shell",
      "command": "bash scripts/lint-workflows.sh && ls -1 .agent/workflows/*.md | head -20",
      "problemMatcher": []
    },
    {
      "label": "X-DD: gate validate (current phase)",
      "type": "shell",
      "command": "python3 scripts/xdd-gate.py status",
      "problemMatcher": []
    }
  ]
}
EOF
)"
  else
    echo "[xdd-adapt] SKIP .vscode/tasks.json (ya existe; merge manual si querés añadir tasks X-DD)"
  fi
  # 4. settings.json env vars terminal — solo si no existe (no overwrite proyecto)
  if [ ! -e "$DEST/.vscode/settings.json" ]; then
    write_file "$DEST/.vscode/settings.json" "$(cat <<'EOF'
{
  "terminal.integrated.env.linux": {
    "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}",
    "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
  },
  "terminal.integrated.env.osx": {
    "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}",
    "OPENAI_API_KEY": "${env:OPENAI_API_KEY}"
  }
}
EOF
)"
  else
    echo "[xdd-adapt] SKIP .vscode/settings.json (ya existe; añadí manual terminal.integrated.env.* si necesitás)"
  fi
}

adapt_antigravity() {
  # Sprint 25 + ADR-0035: usa wrapper global xdd-mcp-server (si instalado) SIN cwd
  # → Antigravity arranca server en workspace activo dinámicamente.
  # Fallback: si wrapper global no existe, usa python3 -m con cwd=DEST (modo legacy).
  # También popula `.agents/skills/` (convención Antigravity plural, no .agent singular).
  local gemini_cfg="${XDD_ANTIGRAVITY_HOME:-$HOME/.gemini/config}/mcp_config.json"
  echo "[xdd-adapt] target: antigravity"
  echo "  · MCP config: $gemini_cfg (MERGE)"
  echo "  · Skills:     $DEST/.agents/skills/ (convención Antigravity plural)"

  local wrapper="$HOME/.local/bin/xdd-mcp-server"
  local use_global=0
  if [ -x "$wrapper" ]; then
    use_global=1
    echo "[xdd-adapt] usando wrapper global (sin cwd, dinámico al workspace IDE)"
  else
    echo "[xdd-adapt] wrapper global no instalado — modo legacy con cwd fijo=$DEST"
    echo "[xdd-adapt]   recomendado: bash scripts/xdd-mcp-install-global.sh"
  fi

  # 1. MCP config merge en ~/.gemini/config/mcp_config.json
  if [ $DRY_RUN -eq 1 ]; then
    emit "$gemini_cfg (merge '$TRIGGER', use_global=$use_global)"
  elif command -v python3 >/dev/null 2>&1; then
    python3 - "$gemini_cfg" "$TRIGGER" "$DEST" "$wrapper" "$use_global" <<'PY'
import json, os, sys
cfg_path, trigger, dest, wrapper, use_global = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5] == "1"
os.makedirs(os.path.dirname(cfg_path), exist_ok=True)
cfg = {}
if os.path.exists(cfg_path):
    try: cfg = json.load(open(cfg_path, encoding="utf-8"))
    except Exception: cfg = {}
cfg.setdefault("mcpServers", {})
entry = {"$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate", "env": {}}
if use_global:
    entry["command"] = wrapper
    entry["args"] = []
else:
    entry["command"] = "python3"
    entry["args"] = ["-m", "xdd-mcp-server"]
    entry["cwd"] = dest
cfg["mcpServers"][trigger] = entry
json.dump(cfg, open(cfg_path, "w", encoding="utf-8"), indent=2)
print(f"[xdd-adapt] ✓ '{trigger}' merged en {cfg_path} (use_global={use_global})")
PY
  fi

  # 2. .agents/skills/ — convención Antigravity plural (NO .agent singular)
  # Copia skills SSoT de X-DD a estructura Antigravity. Cada skill = dir con SKILL.md.
  local skills_src="$ROOT/skills"
  local skills_dst="$DEST/.agents/skills"
  if [ -d "$skills_src" ]; then
    if [ $DRY_RUN -eq 1 ]; then
      emit ".agents/skills/ (copia $(ls -1 "$skills_src" 2>/dev/null | wc -l) skills X-DD)"
    else
      mkdir -p "$skills_dst"
      local count=0
      for skill_dir in "$skills_src"/*/; do
        [ -d "$skill_dir" ] || continue
        local sname; sname=$(basename "$skill_dir")
        cp -r "$skill_dir" "$skills_dst/"
        count=$((count+1))
      done
      echo "[xdd-adapt] ✓ ${count} skills copiadas a $skills_dst/ (convención Antigravity)"
    fi
  fi

  # 3. README local explicando arquitectura
  write_file "$DEST/.antigravity/README-xdd.md" "$(cat <<EOF
# X-DD/$TRIGGER en Antigravity

Antigravity (Gemini IDE) consume X-DD vía 2 mecanismos:

## 1. MCP server (orquestador)
Config global: \`~/.gemini/config/mcp_config.json\` (mergeado automático). Server "$TRIGGER" con 6 tools.

**Sprint 25 (recomendado):**
1. \`bash scripts/xdd-mcp-install-global.sh\` (wrapper en ~/.local/bin)
2. \`bash scripts/xdd-adapt.sh antigravity --dest=<proyecto>\`
3. Refresh panel MCP. Server arranca en workspace activo dinámicamente.

## 2. Skills (\`.agents/skills/\` plural — convención Antigravity)
6 X-DD skills copiadas a \`.agents/skills/\`. Antigravity las detecta automático.
NOTA: Antigravity usa \`.agents/\` (plural), OpenCode usa \`.agent/\` (singular).

## Uso
Invoca \`xdd_invoke_workflow\` name="xdd" desde Cascade. NO escribas /$TRIGGER (no es slash).
EOF
)"
}

adapt_codex() {
  # Codex (OpenAI CLI). Skills GLOBAL en ~/.codex/skills/. Convención:
  # - <trigger>-orchestrator/ con SKILL.md + references/agents-index.json + references/workflows-index.md
  # - X-DD propias skills (skills/*) copiadas como <name>/ cada una
  # Frontmatter MINIMAL (solo name + description). NO genera local en proyecto.
  local codex_home="${XDD_CODEX_HOME:-$HOME/.codex/skills}"
  echo "[xdd-adapt] target: codex → $codex_home/${TRIGGER}-orchestrator/ + skills X-DD"

  if [ $DRY_RUN -eq 1 ]; then
    emit "$codex_home/${TRIGGER}-orchestrator/SKILL.md (orchestrator)"
    emit "$codex_home/${TRIGGER}-orchestrator/references/agents-index.json (180 agentes)"
    emit "$codex_home/${TRIGGER}-orchestrator/references/workflows-index.md (54 workflows)"
    emit "$codex_home/{xdd-talk-compact,agent-eval,xdd-ai-review,xdd-compact,xdd-fs-context,xdd-sandbox}/ (6 X-DD skills)"
    return
  fi

  local orch_dir="$codex_home/${TRIGGER}-orchestrator"
  mkdir -p "$orch_dir/references" "$orch_dir/scripts"

  # 1. SKILL.md orchestrator (frontmatter minimal — Codex requirement)
  cat > "$orch_dir/SKILL.md" <<EOF
---
name: ${TRIGGER}-orchestrator
description: Use when the user starts with /${TRIGGER}, asks to coordinate X-DD pipeline (6 gated phases briefing/spec/plan/build/qa/retro), select specialist agents (180 in registry), execute *-Driven Development workflows (FDD/DDD/BDD/ATDD/TDD/SDD/STDD/SecDD), or invoke the X-DD orchestrator with HMAC gate validation.
---

# X-DD Orchestrator (${TRIGGER})

Coordinate the X-DD pipeline: gated 6-phase development with cryptographic signatures.

## Workflow

1. Clarify the user's objective (read constitution Art. 7: zero ambiguity).
2. Identify current phase (briefing/spec/plan/build/qa/retro).
3. Read \`references/workflows-index.md\` to find the relevant workflow.
4. Load only the specialist agents needed (consult \`references/agents-index.json\`).
5. Execute or guide the requested phase.
6. Validate via gate keeper (HMAC-SHA256 signature) before phase transition.
7. Report outcome with audit trail.

## References

- \`references/agents-index.json\` — 180 specialists in 15 categories
- \`references/workflows-index.md\` — 54 workflows + when to invoke each
- \`references/x-dd-constitution.md\` — local law (10 articles)

## Scripts

- \`scripts/invoke_workflow.sh\` — helper to read workflow content from project root

## Trigger conventions

- \`/${TRIGGER} <objective>\` — invoke pipeline
- \`/${TRIGGER} validate <phase>\` — gate validation
- \`/${TRIGGER} list agents [category]\` — list specialists
EOF

  # 2. agents-index.json desde registry X-DD
  local registry="$ROOT/prompts/agents/registry.json"
  if [ -f "$registry" ] && command -v python3 >/dev/null 2>&1; then
    python3 - "$registry" "$orch_dir/references/agents-index.json" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], encoding="utf-8"))
index = []
for a in data.get("agents", []):
    name = a["name"].lower().replace(" ", "-").replace("_", "-").replace(".", "-")
    name = "".join(c if c.isalnum() or c == "-" else "" for c in name)
    desc = (a.get("description") or "").split("\n")[0][:200]
    index.append({
        "id": a["id"],
        "name": name,
        "category": a["category"],
        "description": desc,
        "source_file": a.get("prompt_file", ""),
    })
json.dump(index, open(sys.argv[2], "w", encoding="utf-8"), indent=2)
PY
  fi

  # 3. workflows-index.md
  {
    echo "# X-DD Workflows Index"
    echo
    echo "> Auto-generated by xdd-adapt codex. Read individual workflow files in the project at \`.agent/workflows/<name>.md\`."
    echo
    for wf in "$WF_DIR"/*.md; do
      local base; base=$(basename "$wf" .md)
      [ "$base" = "readme" ] || [ "$base" = "README" ] && continue
      local desc
      desc=$(grep -m1 "^description:" "$wf" 2>/dev/null | sed 's/description:[[:space:]]*//' | tr -d '"' | tr -d "'")
      echo "- **${base}** — ${desc:-(sin descripción)}"
    done
  } > "$orch_dir/references/workflows-index.md"

  # 4. constitution copia (opcional, si existe)
  [ -f "$ROOT/docs/constitucion.md" ] && cp "$ROOT/docs/constitucion.md" "$orch_dir/references/x-dd-constitution.md"

  # 5. Helper script
  cat > "$orch_dir/scripts/invoke_workflow.sh" <<'EOF'
#!/bin/bash
# Helper: lee workflow desde project root (.agent/workflows/<name>.md).
# Uso: invoke_workflow.sh <project_root> <workflow_name>
set -eu
PROJECT="${1:-$PWD}"
NAME="${2:?workflow name required}"
WF="$PROJECT/.agent/workflows/${NAME}.md"
[ -f "$WF" ] || { echo "Workflow no encontrado: $WF" >&2; exit 1; }
cat "$WF"
EOF
  chmod +x "$orch_dir/scripts/invoke_workflow.sh"

  # 6. Copia 6 skills X-DD propias a Codex global (compat directo)
  if [ -d "$ROOT/skills" ]; then
    local count=0
    for sd in "$ROOT/skills"/*/; do
      [ -d "$sd" ] || continue
      local sname; sname=$(basename "$sd")
      [ -d "$codex_home/$sname" ] && continue   # SKIP si existe
      cp -r "$sd" "$codex_home/"
      count=$((count+1))
    done
    [ $count -gt 0 ] && echo "[xdd-adapt] ✓ ${count} skills X-DD copiadas a $codex_home/"
  fi

  echo "[xdd-adapt] ✓ orchestrator skill creada: $orch_dir"
  echo "[xdd-adapt]   uso: en Codex escribe '/${TRIGGER} <tu objetivo>'"

  # Project-level note
  write_file "$DEST/.codex/README-xdd.md" "$(cat <<EOF
# X-DD / ${TRIGGER} en Codex

Codex consume skills desde \`~/.codex/skills/\` (GLOBAL, no project-local).

Skill orchestrator instalada: \`~/.codex/skills/${TRIGGER}-orchestrator/\`

## Uso
\`\`\`
/${TRIGGER} <tu objetivo>          # invoca orchestrator
/${TRIGGER} list agents engineering # lista specialists
/${TRIGGER} validate spec          # gate validation
\`\`\`

Codex carga la skill leyendo \`name\` + \`description\` del frontmatter — no necesita slash command registry.
EOF
)"
}

run_target() {
  case "$1" in
    claude-code)    adapt_claude_code ;;
    opencode)       adapt_opencode ;;
    cursor)         adapt_cursor ;;
    windsurf)       adapt_windsurf ;;
    vscode-copilot) adapt_vscode_copilot ;;
    antigravity)    adapt_antigravity ;;
    codex)          adapt_codex ;;
  esac
}

if [ "$TARGET" = "all" ]; then
  for t in claude-code opencode cursor windsurf vscode-copilot antigravity codex; do
    run_target "$t"; echo
  done
else
  run_target "$TARGET"
fi

echo
echo "[xdd-adapt] Listo. Target: $TARGET · trigger: /$TRIGGER · dest: $DEST"
[ $DRY_RUN -eq 1 ] && echo "[xdd-adapt] (dry-run — no se escribió nada)"
exit 0
