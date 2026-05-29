#!/bin/bash
# X-DD Doctor v2 — diagnóstico del entorno con SemVer real y salida JSON opcional.
# No aborta al primer fallo: lista todo y reporta al final.
set -u

XDD_VERSION="0.1.0-dev"
SCRIPT_NAME="xdd-doctor"

# --- CLI flags ---
JSON_OUTPUT=0

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      cat <<'EOF'
xdd-doctor — diagnóstico del entorno X-DD (v2).

Uso:
  bash scripts/xdd-doctor.sh [--json]
  bash scripts/xdd-doctor.sh --help | --version

Opciones:
  --json     Salida JSON estructurada (machine-readable, para CI/dashboards).
  --help     Esta ayuda.
  --version  Versión del script.

Comprueba:
  - Núcleo obligatorio: git, bash, python3 (ver DEPENDENCIES.md).
  - Núcleo recomendado: node, npm, docker, mempalace, gitnexus.
  - Orquestadores: claude, opencode.
  - Testing: vitest, playwright, bats, pytest.
  - Seguridad: semgrep, gitleaks, trivy, nuclei.
  - Estructura del proyecto: archivos esperados de un proyecto X-DD.
  - Configuración: xdd.profile.yml y xdd.config.yml.

Comparación SemVer real: cada dep tiene versión mínima declarada en
DEPENDENCIES.md y se compara contra la versión instalada.

Salida:
  - exit 0 si no hay faltantes críticos.
  - exit 1 si falta alguna dep `required: yes` o versión por debajo del mínimo.
EOF
      exit 0
      ;;
    -v|--version)
      echo "$SCRIPT_NAME v${XDD_VERSION}"
      exit 0
      ;;
    --json)
      JSON_OUTPUT=1
      shift
      ;;
    *)
      echo "[xdd-doctor] argumento desconocido: $1" >&2
      exit 2
      ;;
  esac
done

# --- Estado ---
PASS=0
FAIL=0
WARN=0
declare -a CHECKS_JSON=()

# --- Helpers ---

# semver_ge(installed, minimum) → exit 0 si installed >= minimum.
semver_ge() {
  local installed="$1" minimum="$2"
  if [ -z "$installed" ] || [ -z "$minimum" ]; then
    return 1
  fi
  # printf both, sort -V, the lowest must be the minimum.
  [ "$(printf '%s\n%s\n' "$minimum" "$installed" | sort -V | head -n1)" = "$minimum" ]
}

# extract_semver "git version 2.43.0" → "2.43.0"
extract_semver() {
  echo "$1" | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1
}

# json_check name status version_installed version_required required
json_check() {
  local name="$1" status="$2" v_inst="$3" v_req="$4" req="$5"
  CHECKS_JSON+=("$(printf '{"name":"%s","status":"%s","installed":"%s","required":"%s","required_dep":"%s"}' \
    "$name" "$status" "$v_inst" "$v_req" "$req")")
}

# check name cmd required min_version version_cmd version_flag
check() {
  local name="$1" cmd="$2" required="$3" min_version="${4:-}" version_flag="${5:---version}"
  local status="ok" v_inst=""

  if command -v "$cmd" >/dev/null 2>&1; then
    local raw_ver
    raw_ver="$("$cmd" $version_flag 2>&1 | head -1 || true)"
    v_inst="$(extract_semver "$raw_ver")"
    if [ -n "$min_version" ] && [ -n "$v_inst" ]; then
      if semver_ge "$v_inst" "$min_version"; then
        [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %-12s %s (≥ %s)\n" "$name" "$v_inst" "$min_version"
        PASS=$((PASS+1)); status="ok"
      else
        [ $JSON_OUTPUT -eq 0 ] && printf "  ✗ %-12s %s < %s requerido\n" "$name" "$v_inst" "$min_version"
        if [ "$required" = "yes" ]; then
          FAIL=$((FAIL+1)); status="fail"
        else
          WARN=$((WARN+1)); status="warn"
        fi
      fi
    else
      [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %-12s %s\n" "$name" "${v_inst:-$raw_ver}"
      PASS=$((PASS+1)); status="ok"
    fi
  else
    if [ "$required" = "yes" ]; then
      [ $JSON_OUTPUT -eq 0 ] && printf "  ✗ %-12s FALTA (requerido)\n" "$name"
      FAIL=$((FAIL+1)); status="fail"
    else
      [ $JSON_OUTPUT -eq 0 ] && printf "  ⚠ %-12s ausente (opcional)\n" "$name"
      WARN=$((WARN+1)); status="warn"
    fi
  fi

  json_check "$name" "$status" "$v_inst" "$min_version" "$required"
}

check_python() {
  local min="3.9"
  if command -v python3 >/dev/null 2>&1; then
    local v
    v="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")' 2>/dev/null)"
    if semver_ge "$v" "$min"; then
      [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %-12s %s (≥ %s)\n" "python3" "$v" "$min"
      PASS=$((PASS+1))
      json_check "python3" "ok" "$v" "$min" "yes"
    else
      [ $JSON_OUTPUT -eq 0 ] && printf "  ✗ %-12s %s < %s\n" "python3" "$v" "$min"
      FAIL=$((FAIL+1))
      json_check "python3" "fail" "$v" "$min" "yes"
    fi
  else
    [ $JSON_OUTPUT -eq 0 ] && printf "  ✗ %-12s FALTA (requerido)\n" "python3"
    FAIL=$((FAIL+1))
    json_check "python3" "fail" "" "$min" "yes"
  fi
}

check_orchestrator() {
  local found=0
  if command -v claude >/dev/null 2>&1; then
    local v; v="$(claude --version 2>&1 | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
    [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %-12s %s\n" "claude" "${v:-instalado}"
    PASS=$((PASS+1)); found=1
    json_check "claude" "ok" "${v:-}" "" "no"
  fi
  if command -v opencode >/dev/null 2>&1; then
    local v; v="$(opencode --version 2>&1 | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
    [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %-12s %s\n" "opencode" "${v:-instalado}"
    PASS=$((PASS+1)); found=1
    json_check "opencode" "ok" "${v:-}" "" "no"
  fi
  if [ $found -eq 0 ]; then
    [ $JSON_OUTPUT -eq 0 ] && printf "  ⚠ %-12s NINGÚN orquestador en PATH (instala claude o opencode)\n" "orquestador"
    WARN=$((WARN+1))
    json_check "orchestrator" "warn" "" "" "no"
  fi
}

check_file() {
  local f="$1"
  if [ -e "$f" ]; then
    [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %s\n" "$f"
    PASS=$((PASS+1))
    json_check "$f" "ok" "" "" "no"
  else
    [ $JSON_OUTPUT -eq 0 ] && printf "  ⚠ %s ausente\n" "$f"
    WARN=$((WARN+1))
    json_check "$f" "warn" "" "" "no"
  fi
}

check_xdd_config() {
  if [ -f "xdd.config.yml" ]; then
    if command -v python3 >/dev/null 2>&1; then
      if python3 -c "import yaml,sys;yaml.safe_load(open('xdd.config.yml'))" 2>/dev/null; then
        [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %s\n" "xdd.config.yml (YAML válido)"
        PASS=$((PASS+1))
        json_check "xdd.config.yml" "ok" "" "" "no"
        return
      else
        [ $JSON_OUTPUT -eq 0 ] && printf "  ✗ %s (YAML inválido)\n" "xdd.config.yml"
        FAIL=$((FAIL+1))
        json_check "xdd.config.yml" "fail" "" "" "no"
        return
      fi
    fi
    [ $JSON_OUTPUT -eq 0 ] && printf "  ✓ %s (sin validar — falta python3/yaml)\n" "xdd.config.yml"
    PASS=$((PASS+1))
    json_check "xdd.config.yml" "ok" "" "" "no"
  else
    [ $JSON_OUTPUT -eq 0 ] && printf "  ⚠ %s ausente\n" "xdd.config.yml"
    WARN=$((WARN+1))
    json_check "xdd.config.yml" "warn" "" "" "no"
  fi
}

# --- Main ---

if [ $JSON_OUTPUT -eq 0 ]; then
  echo "=== X-DD Doctor v${XDD_VERSION} ==="
  echo
  echo "[Núcleo obligatorio]"
fi
check "git"        git        yes  "2.30.0"
check "bash"       bash       yes  "4.0"   --version
check_python
if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Núcleo recomendado]"; fi
check "node"       node       no   "20.0.0"
check "npm"        npm        no   ""
check "docker"     docker     no   ""
check "mempalace"  mempalace  no   "3.3.0"
check "gitnexus"   gitnexus   no   ""

if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Orquestadores (≥1 esperado)]"; fi
check_orchestrator

if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Testing (opcional)]"; fi
check "vitest"     vitest     no   ""
check "playwright" playwright no   ""
check "bats"       bats       no   "1.10.0"
check "pytest"     pytest     no   ""

if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Seguridad (opcional)]"; fi
check "semgrep"    semgrep    no   ""
check "gitleaks"   gitleaks   no   "8.18.0"
check "trivy"      trivy      no   ""
check "nuclei"     nuclei     no   ""

if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Estructura del proyecto]"; fi
for f in CLAUDE.md memoria.md lecciones.md xdd.profile.yml .agent/workflows .claude/settings.json prompts templates; do
  check_file "$f"
done

if [ $JSON_OUTPUT -eq 0 ]; then echo; echo "[Configuración X-DD]"; fi
check_xdd_config

# Detección de perfil (declarado)
PROFILE=""
if [ -f "xdd.profile.yml" ]; then
  PROFILE=$(grep -E '^profile:' xdd.profile.yml | awk '{print $2}' | tr -d '"' || true)
  if [ $JSON_OUTPUT -eq 0 ]; then
    printf "\n[Perfil declarado] %s\n" "${PROFILE:-no declarado}"
  fi
fi

# --- Salida ---
if [ $JSON_OUTPUT -eq 1 ]; then
  printf '{\n'
  printf '  "tool": "%s",\n' "$SCRIPT_NAME"
  printf '  "version": "%s",\n' "$XDD_VERSION"
  printf '  "timestamp": "%s",\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '  "profile": "%s",\n' "${PROFILE:-unknown}"
  printf '  "summary": {"pass": %d, "warn": %d, "fail": %d},\n' "$PASS" "$WARN" "$FAIL"
  printf '  "checks": [\n'
  local_n=${#CHECKS_JSON[@]}
  for i in "${!CHECKS_JSON[@]}"; do
    printf '    %s' "${CHECKS_JSON[$i]}"
    if [ "$i" -lt "$((local_n - 1))" ]; then
      printf ','
    fi
    printf '\n'
  done
  printf '  ]\n'
  printf '}\n'
else
  echo
  echo "Resumen: $PASS OK, $WARN warnings, $FAIL faltantes críticos."
fi

[ $FAIL -eq 0 ] || exit 1
