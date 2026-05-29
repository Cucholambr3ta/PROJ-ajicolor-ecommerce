#!/bin/bash
# xdd-mcp-install-global — Sprint 25 + ADR-0035: instala wrapper global xdd-mcp-server
# en PATH del usuario. Single source install. Adapter MCP usa este wrapper sin cwd.
set -eu

XDD_VERSION="0.1.0-dev"

usage() {
  cat <<'EOF'
xdd-mcp-install-global — instala wrapper global xdd-mcp-server en PATH del usuario.

Uso:
  bash scripts/xdd-mcp-install-global.sh [--bin-dir=PATH] [--xdd-root=PATH] [--uninstall] [--check]
  bash scripts/xdd-mcp-install-global.sh --help | --version

Por defecto:
  --bin-dir   ~/.local/bin (debe estar en PATH)
  --xdd-root  detecta (dir del script)

Genera:
  $BIN_DIR/xdd-mcp-server  (wrapper bash que setea PYTHONPATH + ejecuta python3 -m xdd-mcp-server)

Beneficios (vs python3 -m xdd-mcp-server con cwd fijo):
  - Adapter MCP omite cwd → Antigravity/Cascade arranca server en workspace activo
  - tools.py resuelve workflows/registry local-first + global fallback
  - Una sola instalación X-DD sirve a N proyectos sin copiar componentes
EOF
}

BIN_DIR="$HOME/.local/bin"
XDD_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/.." && pwd )"
UNINSTALL=0
CHECK=0

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    -v|--version) echo "xdd-mcp-install-global v${XDD_VERSION}"; exit 0 ;;
    --bin-dir=*) BIN_DIR="${1#--bin-dir=}"; shift ;;
    --bin-dir) BIN_DIR="$2"; shift 2 ;;
    --xdd-root=*) XDD_ROOT="${1#--xdd-root=}"; shift ;;
    --xdd-root) XDD_ROOT="$2"; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    --check) CHECK=1; shift ;;
    *) echo "ERROR: arg desconocido: $1" >&2; usage; exit 2 ;;
  esac
done

WRAPPER="$BIN_DIR/xdd-mcp-server"

if [ "$CHECK" -eq 1 ]; then
  echo "=== Global install check ==="
  echo "  BIN_DIR:  $BIN_DIR"
  echo "  WRAPPER:  $WRAPPER"
  echo "  XDD_ROOT: $XDD_ROOT"
  if [ -x "$WRAPPER" ]; then
    echo "  status:   ✓ installed"
    echo "  version:  $($WRAPPER --version 2>&1 | head -1)"
  else
    echo "  status:   ✗ NOT installed"
  fi
  case ":$PATH:" in
    *":$BIN_DIR:"*) echo "  in PATH:  ✓" ;;
    *) echo "  in PATH:  ✗ — añade '$BIN_DIR' a tu PATH (ej. ~/.bashrc)" ;;
  esac
  exit 0
fi

if [ "$UNINSTALL" -eq 1 ]; then
  if [ -e "$WRAPPER" ]; then
    rm -f "$WRAPPER"
    echo "[xdd-mcp-install-global] ✓ desinstalado: $WRAPPER"
  else
    echo "[xdd-mcp-install-global] no instalado (nada que remover)"
  fi
  exit 0
fi

# Validar XDD_ROOT tiene módulo xdd-mcp-server
if [ ! -d "$XDD_ROOT/xdd-mcp-server" ]; then
  echo "ERROR: $XDD_ROOT no contiene xdd-mcp-server/ — pasa --xdd-root al X-DD repo correcto" >&2
  exit 1
fi

mkdir -p "$BIN_DIR"

cat > "$WRAPPER" <<EOF
#!/bin/bash
# Wrapper global X-DD MCP — Sprint 25 + ADR-0035
# Generado por scripts/xdd-mcp-install-global.sh
# CWD del proceso = workspace IDE (no fijo). tools.py resuelve paths local-first.
export PYTHONPATH="$XDD_ROOT:\${PYTHONPATH:-}"
exec python3 -m xdd-mcp-server "\$@"
EOF
chmod +x "$WRAPPER"

echo "[xdd-mcp-install-global] ✓ wrapper instalado: $WRAPPER"
echo "[xdd-mcp-install-global]   XDD_ROOT baked: $XDD_ROOT"
echo "[xdd-mcp-install-global]   version: $($WRAPPER --version 2>&1 | head -1)"

# Verificar PATH
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *)
    echo "[xdd-mcp-install-global] ⚠️  $BIN_DIR NO está en PATH actual."
    echo "    Añadir a ~/.bashrc o ~/.zshrc:"
    echo "      export PATH=\"\$HOME/.local/bin:\$PATH\""
    ;;
esac

echo ""
echo "Siguiente: xdd-adapt.sh antigravity (mergea wrapper en ~/.gemini config sin cwd)"
exit 0
