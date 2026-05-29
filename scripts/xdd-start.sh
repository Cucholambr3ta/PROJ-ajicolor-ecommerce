#!/bin/bash
# X-DD Start — inicializa MemPalace + GitNexus (si disponibles) y lanza el orquestador
set -eu

XDD_VERSION="0.1.0-dev"

case "${1:-}" in
  -h|--help)
    cat <<'EOF'
xdd-start — arranca X-DD en el proyecto actual.

Uso:
  bash scripts/xdd-start.sh [PROJECT_DIR]
  bash scripts/xdd-start.sh --help | --version

Hace:
  1. Re-indexa MemPalace (si está instalado; log en ~/.mempalace/mine.log).
  2. Indexa GitNexus code intelligence (si está instalado; log en ~/.gitnexus/index.log).
  3. Activa el git hook post-commit (idempotente).
  4. Lanza el orquestador (claude > opencode, primero disponible).

Args:
  PROJECT_DIR  Ruta del proyecto a iniciar (default: $PWD).

Salida:
  - exit 0 si el orquestador inicia.
  - exit 1 si no encuentra ni claude ni opencode.
EOF
    exit 0
    ;;
  -v|--version)
    echo "xdd-start v${XDD_VERSION}"
    exit 0
    ;;
esac

PROJECT_DIR="${1:-$PWD}"
cd "$PROJECT_DIR"

LOG_DIR="${HOME}/.mempalace"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/mine.log"

echo "[X-DD] Proyecto: $PROJECT_DIR"

# MemPalace: opcional, no debe abortar el arranque si falta
if command -v mempalace >/dev/null 2>&1; then
  echo "[X-DD] Inicializando MemPalace..."
  mempalace init "$PROJECT_DIR" >>"$LOG_FILE" 2>&1 || true
  if mempalace mine "$PROJECT_DIR" >>"$LOG_FILE" 2>&1; then
    echo "[X-DD] MemPalace indexado. Log: $LOG_FILE"
  else
    echo "[X-DD] WARN: mempalace mine falló (ver $LOG_FILE). Continuando sin indexar."
  fi
else
  echo "[X-DD] WARN: 'mempalace' no encontrado. Omitiendo indexación semántica."
  echo "[X-DD]       Instalación: ver INSTALL.md sección MemPalace."
fi

# GitNexus: opcional, code intelligence (knowledge graph del codebase)
GN_LOG_DIR="${HOME}/.gitnexus"
mkdir -p "$GN_LOG_DIR"
GN_LOG_FILE="$GN_LOG_DIR/index.log"
if command -v gitnexus >/dev/null 2>&1; then
  echo "[X-DD] Inicializando GitNexus..."
  if gitnexus index "$PROJECT_DIR" >>"$GN_LOG_FILE" 2>&1; then
    echo "[X-DD] GitNexus indexado. Log: $GN_LOG_FILE"
  else
    echo "[X-DD] WARN: gitnexus index falló (ver $GN_LOG_FILE). Continuando sin code intel."
  fi
else
  echo "[X-DD] WARN: 'gitnexus' no encontrado. Omitiendo code intelligence."
  echo "[X-DD]       Instalación: ver INSTALL.md sección GitNexus (license PolyForm Noncomm)."
fi

# Git hook post-commit (idempotente)
if [ -d ".git" ] && [ -f "./scripts/hooks/post-commit" ]; then
  git config core.hooksPath ./scripts/hooks
  chmod +x ./scripts/hooks/post-commit
  echo "[X-DD] Git hook post-commit activado."
fi

echo "[X-DD] Iniciando orquestador..."

if command -v claude >/dev/null 2>&1; then
  exec claude
elif command -v opencode >/dev/null 2>&1; then
  exec opencode
else
  echo "[X-DD] ERROR: No se encontró 'claude' ni 'opencode'. Instala uno (ver INSTALL.md)."
  exit 1
fi
