# Plan de Mejoras — X-DD (Cross-Driven Development System)

> **Repo destino:** [github.com/Cucholambr3ta/x-dd](https://github.com/Cucholambr3ta/x-dd)
> **Ejecutor:** Claude Code (u otro IDE de IA compatible)
> **Contexto:** X-DD es un framework de metodologías de desarrollo open source, distribuido públicamente en GitHub.
> **Versión del plan:** 1.1 (integra feedback técnico + datos reales de MemPalace v3.3.x + soporte multi-IDE)

---

## 0. Principios rectores (leer antes de cualquier tarea)

### 0.1 Compatibilidad multi-IDE — NO atar X-DD a Claude Code

X-DD debe funcionar con cualquier asistente de IA del ecosistema actual. **Ninguna lógica de negocio puede vivir en archivos específicos de un IDE.** Toda regla, prompt o workflow vive en `/prompts/` y `/.agent/workflows/` como markdown plano; los archivos específicos de cada IDE solo *invocan* esos recursos vía adaptador.

| IDE / CLI                | Convención de configuración                | Mecanismo preferido |
| ------------------------ | ------------------------------------------ | ------------------- |
| **Claude Code** (CLI)    | `.claude/commands/*.md`, `CLAUDE.md`       | Nativo + MCP        |
| **OpenCode**             | `AGENTS.md`, `.agent/workflows/`           | Nativo + MCP        |
| **Cursor**               | `.cursor/rules/*.mdc`                      | Rules + MCP         |
| **Windsurf** (Codeium)   | `.windsurf/rules/*.md`                     | Rules + MCP         |
| **GitHub Copilot**       | `.github/copilot-instructions.md`          | Instructions        |
| **Cline / Roo Code**     | `.clinerules`, `.roo/`                     | Rules + MCP         |
| **Aider**                | `CONVENTIONS.md`, `.aider.conf.yml`        | Conventions         |
| **Continue.dev**         | `.continue/config.json`                    | Config + MCP        |
| **Zed AI**               | `.zed/settings.json`                       | Settings + MCP      |

**Regla dura:** **MCP (Model Context Protocol) es la vía preferida** de integración porque es estándar abierto soportado por Claude Code, Cursor, Windsurf, Cline, Continue, Zed y otros. MemPalace ya expone 29 tools vía MCP — eso resuelve compatibilidad multi-IDE sin esfuerzo extra.

### 0.2 MemPalace es dependencia externa, no parte de X-DD

**Hechos verificados sobre MemPalace** (de [github.com/MemPalace/mempalace](https://github.com/MemPalace/mempalace)):

- Versión actual: **v3.3.2** (no v0.4.x ni nada similar — está maduro).
- Licencia: **MIT**.
- Distribución: **PyPI** (`pip install mempalace`).
- Backend default: **ChromaDB** (vector store) + **SQLite** (knowledge graph temporal).
- API: **CLI** (`mempalace init`, `mempalace mine`, `mempalace search`, `mempalace wake-up`) + **MCP server con 29 tools**.
- Hooks oficiales para Claude Code ya existen — no hay que reinventarlos.
- Modelo conceptual: **wings (proyectos/personas) → rooms (temas) → drawers (contenido)**.
- Sitio oficial: **mempalaceofficial.com** (cuidado con dominios impostores como `mempalace.tech`, hay advertencia oficial).

**Consecuencia:** las tareas de "construir MemPalace" se eliminan. Las tareas de "integrar con MemPalace correctamente" se priorizan.

### 0.3 Open source público desde el día uno

Como X-DD se distribuirá públicamente en GitHub, suben de prioridad:

- Claridad de propósito en el README (qué es, qué no es, para quién).
- Gobernanza completa (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates).
- License compliance (X-DD MIT, MemPalace MIT — declarar dependencias en `DEPENDENCIES.md`).
- CI verde en cada PR desde el primer commit público.
- Sin secretos ni rutas absolutas en el repo (Gitleaks en pre-commit y CI).
- Documentación reproducible: cualquiera debe poder clonar y arrancar en < 10 minutos.

### 0.4 Verificación obligatoria antes de implementar

**No asumas sintaxis de configuración de IDEs.** Antes de escribir un `.claude/commands/`, `.cursor/rules/`, `xdd.config.yml`, etc., verificá la spec oficial actual. Las herramientas de IA cambian rápido. Marcá explícitamente como TODO toda tarea cuya implementación dependa de specs que no verificaste.

---

## 1. P0 — Infraestructura de integración

### Tarea 1.1 — Declarar MemPalace como dependencia externa

**Problema:** El README actual presenta a MemPalace como "pieza del ecosistema X-DD", creando confusión de ownership.

**Implementar:**

- [ ] Crear `DEPENDENCIES.md` con la matriz real:

```markdown
| Dependencia    | Versión mínima | Repo / Paquete                                | Licencia    | Rol en X-DD                          |
| -------------- | -------------- | --------------------------------------------- | ----------- | ------------------------------------ |
| MemPalace      | `>=3.3.0`      | `pip install mempalace`                       | MIT         | Memoria semántica local + MCP server |
| Python         | `>=3.9`        | python.org                                    | PSF         | Runtime de MemPalace y scripts X-DD  |
| Git            | `>=2.30`       | git-scm.com                                   | GPLv2       | Hooks y versionado                   |
| Node.js        | `>=20`         | nodejs.org                                    | MIT         | Tooling opcional (Vitest, Playwright)|
| Claude Code    | latest         | claude.com/claude-code                        | Propietaria | Orquestador (opcional)               |
| OpenCode       | latest         | opencode.ai                                   | Apache-2.0  | Orquestador alternativo (opcional)   |
```

- [ ] Actualizar `README.md`: reemplazar "MemPalace es pieza del ecosistema X-DD" por "X-DD integra MemPalace (proyecto externo, MIT) como motor de memoria. Ver DEPENDENCIES.md".
- [ ] Linkear al repo oficial y a mempalaceofficial.com.
- [ ] Añadir advertencia sobre dominios impostores (replicar la del README de MemPalace).
- [ ] Corregir imprecisión técnica: el README dice "base de grafos local" — el correcto es "vector store (ChromaDB) + knowledge graph temporal (SQLite)".

**Definition of Done:** un usuario que clone el repo entiende en 30 segundos qué es de X-DD y qué es externo.

---

### Tarea 1.2 — Configuración centralizada `xdd.config.yml`

**Problema:** los hooks (`PostToolUse`, `post-commit`, `xdd-start.sh`) invocan `mempalace mine` sin configuración visible.

**Implementar:**

- [ ] Crear `xdd.config.yml` en raíz del proyecto consumidor (no del repo X-DD), con esquema versionado:

```yaml
# xdd.config.yml — Configuración por proyecto
xdd_version: "1.0.0"

mempalace:
  enabled: true
  version_constraint: ">=3.3.0"
  # Wing por defecto (concepto nativo de MemPalace: agrupación por proyecto/persona)
  default_wing: "${project_name}"
  index:
    paths:
      - "./src"
      - "./docs"
      - "./.xdd"          # ver tarea 2.1
    exclude:
      - "node_modules/**"
      - ".git/**"
      - "dist/**"
      - "coverage/**"
      - "*.log"
  triggers:
    - event: "session_start"
      action: "mempalace wake-up --wing ${default_wing}"
    - event: "file_write"
      action: "mempalace mine --incremental --wing ${default_wing}"
      debounce_ms: 5000
    - event: "git_commit"
      action: "mempalace mine --incremental --wing ${default_wing}"
      delay_ms: 1000
  fallback:
    on_failure: "warn"    # warn | block | silent
    log_path: "./logs/mempalace-errors.log"
  mcp:
    enabled: true         # exponer 29 tools de MemPalace a cualquier cliente MCP
    transport: "stdio"    # stdio | sse

pipeline:
  gates:
    enforce_artifacts: true
    require_approval: true
    block_on_missing_spec: true
  phases:
    - id: "briefing"
      artifacts: ["SPEC.md", "FEATURES.md"]
    - id: "spec"
      artifacts: ["DOMAIN.md", "THREATS.md"]
    - id: "plan"
      artifacts: ["PLAN.md"]
    - id: "build"
      artifacts: ["src/", "tests/"]
    - id: "qa"
      artifacts: ["QA_REPORT.md"]
    - id: "retro"
      artifacts: ["lecciones.md"]

agents:
  registry: "./prompts/agents/registry.json"
  max_concurrent: 5
  fallback_strategy: "escalate_to_senior"
  orchestration_pattern: "lead_plus_specialists"  # ver tarea 3.2

ide_adapters:
  generate_for:
    - claude-code
    - opencode
    - cursor
    - windsurf
    - copilot
    - cline
    - aider
    - continue
    - zed
```

- [ ] Crear `schemas/xdd.config.schema.json` (JSON Schema borrador) para validación.
- [ ] Primera línea del `xdd.config.yml` debe ser: `# yaml-language-server: $schema=./schemas/xdd.config.schema.json` (autocompletado en IDEs modernos).
- [ ] Documentar cada campo en `docs/CONFIG.md`.

**Definition of Done:** validación contra schema corre en CI; usuarios obtienen autocompletado en VSCode/IntelliJ/Zed sin esfuerzo.

---

### Tarea 1.3 — `xdd-doctor.sh` con verificación real de versiones

**Implementar:**

- [ ] Reescribir `scripts/xdd-doctor.sh` para verificar versiones reales:

```bash
#!/usr/bin/env bash
# xdd-doctor.sh — Validación de entorno X-DD
set -euo pipefail

ERRORS=0; WARNINGS=0

check_mempalace() {
  if ! command -v mempalace >/dev/null 2>&1; then
    echo "[ERROR] MemPalace no instalado. Run: pip install mempalace"
    ((ERRORS++)); return
  fi
  VERSION=$(mempalace --version 2>/dev/null | awk '{print $NF}' || echo "0.0.0")
  REQUIRED="3.3.0"
  if [ "$(printf '%s\n' "$REQUIRED" "$VERSION" | sort -V | head -n1)" != "$REQUIRED" ]; then
    echo "[ERROR] MemPalace $VERSION < $REQUIRED requerido"
    ((ERRORS++))
  else
    echo "[OK] MemPalace $VERSION"
  fi
}

check_orchestrator() {
  local found=0
  for cmd in claude opencode cursor; do
    if command -v "$cmd" >/dev/null 2>&1; then
      echo "[OK] $cmd disponible: $($cmd --version 2>/dev/null || echo unknown)"
      found=1
    fi
  done
  [ "$found" -eq 0 ] && { echo "[WARN] Ningún orquestador detectado en PATH"; ((WARNINGS++)); }
}

check_python() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo "[ERROR] Python 3 no instalado"; ((ERRORS++)); return
  fi
  PYVER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
  if [ "$(printf '%s\n' "3.9" "$PYVER" | sort -V | head -n1)" != "3.9" ]; then
    echo "[ERROR] Python $PYVER < 3.9"; ((ERRORS++))
  else
    echo "[OK] Python $PYVER"
  fi
}

check_project_config() {
  [ -f "xdd.config.yml" ] || { echo "[WARN] xdd.config.yml no encontrado"; ((WARNINGS++)); return; }
  python3 -c "import yaml; yaml.safe_load(open('xdd.config.yml'))" 2>/dev/null \
    && echo "[OK] xdd.config.yml válido YAML" \
    || { echo "[ERROR] xdd.config.yml inválido"; ((ERRORS++)); }
}

check_phase_gates() {
  [ -d ".xdd" ] || { echo "[INFO] .xdd/ no existe (proyecto no inicializado)"; return; }
  for phase in briefing spec plan build qa retro; do
    [ -d ".xdd/$phase" ] && echo "[INFO] Fase '$phase': $(cat ".xdd/$phase/.status" 2>/dev/null || echo MISSING)"
  done
}

echo "=== X-DD Doctor ==="
check_python
check_mempalace
check_orchestrator
check_project_config
check_phase_gates
echo
echo "Resultado: $ERRORS errores, $WARNINGS advertencias"
exit $ERRORS
```

- [ ] Compatibilidad bash 3.2 (macOS) y bash 5+ (Linux). Validar con ShellCheck en CI.

**Definition of Done:** `xdd-doctor.sh` corre limpio en macOS y Ubuntu, detecta correctamente MemPalace v3.3.x.

---

### Tarea 1.4 — Adaptador multi-IDE `xdd-adapt.sh`

**Implementar:**

- [ ] Crear `scripts/xdd-adapt.sh <ide>` que genere configuración por IDE desde SSoT:
  - `xdd-adapt.sh claude-code` → `.claude/commands/*.md` + `CLAUDE.md`
  - `xdd-adapt.sh opencode` → `AGENTS.md` + `.agent/workflows/`
  - `xdd-adapt.sh cursor` → `.cursor/rules/*.mdc`
  - `xdd-adapt.sh windsurf` → `.windsurf/rules/*.md`
  - `xdd-adapt.sh copilot` → `.github/copilot-instructions.md`
  - `xdd-adapt.sh cline` → `.clinerules`
  - `xdd-adapt.sh aider` → `CONVENTIONS.md` + `.aider.conf.yml`
  - `xdd-adapt.sh continue` → `.continue/config.json` (incluir MCP server de MemPalace)
  - `xdd-adapt.sh zed` → `.zed/settings.json` (incluir MCP server de MemPalace)
  - `xdd-adapt.sh all` → todos
- [ ] Templates por IDE en `prompts/_adapters/`.
- [ ] **TODO de verificación previa:** antes de implementar cada adaptador, verificar spec oficial del IDE. No asumir sintaxis.
- [ ] `docs/IDE_SUPPORT.md` con matriz de qué se sincroniza por IDE.
- [ ] Tests bats: `tests/adapt.bats` con un caso por IDE.

**Definition of Done:** un usuario de Cursor ejecuta `bash scripts/xdd-adapt.sh cursor` y obtiene reglas funcionales sin tocar `.claude/`.

---

## 2. P0 — State machine de fases (gates programáticos)

### Tarea 2.1 — Directorio `.xdd/` con estados

**Problema:** el README dice "Gated Pipeline — se requiere APROBADO antes de pasar de fase", pero no hay enforcement.

**Implementar:**

- [ ] Estructura en proyecto consumidor:

```
proyecto/
└── .xdd/
    ├── briefing/
    │   ├── .status         # PENDIENTE | EN_REVIEW | APROBADO | RECHAZADO
    │   ├── .checksums      # SHA-256 de cada artefacto
    │   ├── .approvers      # quien aprobó, timestamp
    │   ├── SPEC.md
    │   └── FEATURES.md
    ├── spec/
    │   ├── .status
    │   ├── DOMAIN.md
    │   └── THREATS.md
    ├── plan/
    ├── build/
    ├── qa/
    └── retro/
```

- [ ] `scripts/xdd-init.sh` debe crear este árbol al bootstrap.

---

### Tarea 2.2 — `xdd-gate.py` como guardián programático

**Implementar:**

```python
#!/usr/bin/env python3
"""xdd-gate.py — Gate keeper del pipeline X-DD."""
import argparse, hashlib, json, sys
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path

class Status(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_REVIEW = "EN_REVIEW"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"

PHASES = [
    ("briefing", ["SPEC.md", "FEATURES.md"]),
    ("spec",     ["DOMAIN.md", "THREATS.md"]),
    ("plan",     ["PLAN.md"]),
    ("build",    ["src/", "tests/"]),
    ("qa",       ["QA_REPORT.md"]),
    ("retro",    ["lecciones.md"]),
]

def checksum(path: Path) -> str:
    if path.is_file():
        return hashlib.sha256(path.read_bytes()).hexdigest()[:16]
    h = hashlib.sha256()
    for f in sorted(path.rglob("*")):
        if f.is_file():
            h.update(f.read_bytes())
    return h.hexdigest()[:16]

def validate(phase: str, root: Path):
    pdir = root / ".xdd" / phase
    errors = []
    if not pdir.exists():
        return False, [f".xdd/{phase} no existe — run xdd-init"]
    status_file = pdir / ".status"
    if not status_file.exists():
        return False, [f".xdd/{phase}/.status no existe"]
    if status_file.read_text().strip() != Status.APROBADO.value:
        errors.append(f"Fase {phase!r} no APROBADO")
    artifacts = dict(PHASES)[phase]
    for art in artifacts:
        if not (pdir / art).exists():
            errors.append(f"Artefacto faltante: {art}")
    ck = pdir / ".checksums"
    if ck.exists():
        stored = json.loads(ck.read_text())
        for art, old in stored.items():
            if (pdir / art).exists():
                cur = checksum(pdir / art)
                if cur != old:
                    errors.append(f"Checksum mismatch en {art}")
    return len(errors) == 0, errors

def can_transition(src: str, dst: str, root: Path):
    ids = [p[0] for p in PHASES]
    if src not in ids or dst not in ids:
        return False, "Fase desconocida"
    if ids.index(dst) != ids.index(src) + 1:
        return False, f"Transición no secuencial: {src} → {dst}"
    ok, errs = validate(src, root)
    return ok, "OK" if ok else "; ".join(errs)

def approve(phase: str, approver: str, root: Path):
    pdir = root / ".xdd" / phase
    artifacts = dict(PHASES)[phase]
    cks = {a: checksum(pdir / a) for a in artifacts if (pdir / a).exists()}
    (pdir / ".checksums").write_text(json.dumps(cks, indent=2))
    (pdir / ".status").write_text(Status.APROBADO.value)
    with (pdir / ".approvers").open("a") as f:
        f.write(f"{approver} | {datetime.now(timezone.utc).isoformat()}\n")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("command", choices=["validate", "transition", "approve"])
    p.add_argument("--phase", required=True)
    p.add_argument("--to")
    p.add_argument("--approver", default="system")
    p.add_argument("--project-root", default=".")
    args = p.parse_args()
    root = Path(args.project_root).resolve()
    if args.command == "validate":
        ok, errs = validate(args.phase, root)
        for e in errs: print(f"[ERROR] {e}", file=sys.stderr)
        sys.exit(0 if ok else 1)
    elif args.command == "transition":
        ok, msg = can_transition(args.phase, args.to, root)
        print(f"{'[OK]' if ok else '[BLOCKED]'} {msg}")
        sys.exit(0 if ok else 1)
    elif args.command == "approve":
        approve(args.phase, args.approver, root)
        print(f"[OK] {args.phase} aprobada por {args.approver}")
```

- [ ] Tests en `tests/test_gate.py` (pytest): casos de validación, transición permitida/bloqueada, checksum mismatch, fase APROBADA con artefacto faltante.

---

### Tarea 2.3 — Integración de gates en workflows

**Implementar:**

- [ ] Cada workflow en `.agent/workflows/*.md` debe incluir pre-condición y post-condición:

```markdown
<!-- .agent/workflows/xdd-build.md -->
## Pre-condición (gate)

Antes de ejecutar, valida que `plan` esté APROBADO y `build` listo para empezar:

```bash
python3 scripts/xdd-gate.py transition --phase plan --to build --project-root .
```

Si exit code != 0, **detener ejecución** y reportar al usuario.

## Ejecución
... [TDD cycle Rojo→Verde→Refactor] ...

## Post-condición
```bash
python3 scripts/xdd-gate.py validate --phase build --project-root .
```
```

**Definition of Done:** ningún workflow puede saltar fases; intentar `xdd-build` sin `plan` aprobado falla con mensaje claro.

---

## 3. P1 — Sistema tipado de agentes

### Tarea 3.1 — Registry machine-readable (`registry.json`)

**Problema:** 77+ agentes en `prompts/agents/*.md` son prosa, no consultables programáticamente.

**Implementar:**

- [ ] Crear `prompts/agents/registry.json`:

```json
{
  "version": "1.0.0",
  "agents": [
    {
      "id": "sec-threat-modeler",
      "name": "Threat Modeling Specialist",
      "category": "security",
      "skills": ["stride", "attack-trees", "cvss"],
      "constraints": ["never_suggest_crypto_without_peer_review"],
      "input_format": "DOMAIN.md + tech_stack.json",
      "output_format": "THREATS.md",
      "fallback_agent": "sec-security-engineer",
      "triggers": ["phase:spec"],
      "prompt_file": "prompts/agents/security/threat-modeler.md",
      "ide_compat": ["claude-code", "opencode", "cursor", "windsurf", "copilot", "cline", "aider", "continue", "zed"]
    }
  ],
  "routing_rules": [
    {
      "condition": "phase == 'spec' AND artifact == 'THREATS.md'",
      "agent": "sec-threat-modeler",
      "priority": 1
    }
  ]
}
```

- [ ] `prompts/agents/registry.schema.json` (JSON Schema completo).
- [ ] `scripts/validate-registry.py` que valida schema + existencia de cada `prompt_file`.
- [ ] `scripts/generate-equipo.sh` que regenera `docs/equipo.md` automáticamente desde el registry (SSoT).

---

### Tarea 3.2 — Composición jerárquica (lead + specialists)

**Problema:** invocar 77 agentes en cada tarea es inviable.

**Implementar patrón "lead + specialists":**

- [ ] Agregar `composition_patterns` al registry:

```json
{
  "composition_patterns": [
    {
      "name": "security_review",
      "lead": "sec-security-engineer",
      "specialists": ["sec-threat-modeler", "sec-pentester"],
      "orchestration": "sequential",
      "gate_between": "peer_review"
    },
    {
      "name": "feature_squad",
      "lead": "product-manager",
      "specialists": ["senior-backend-dev", "ux-designer", "qa-engineer"],
      "orchestration": "parallel_then_sync",
      "sync_point": "spec_approval"
    }
  ]
}
```

- [ ] El orquestador `/xdd` invoca **un lead**, que delega a 2-5 specialists según contexto. Nunca invocar los 77 directamente.

---

## 4. P1 — Testing del propio framework

### Tarea 4.1 — Tests de scripts shell (bats-core)

- [ ] `tests/xdd-doctor.bats` — entorno limpio, sin Node, sin MemPalace, sin git.
- [ ] `tests/xdd-init.bats` — proyecto vacío vs con contenido previo; idempotencia.
- [ ] `tests/xdd-start.bats` — con/sin MemPalace; con/sin Claude Code u OpenCode.
- [ ] `tests/xdd-adapt.bats` — un caso por IDE soportado.
- [ ] `tests/post-commit.bats` — fallback silencioso si MemPalace no está.

### Tarea 4.2 — Tests del gate keeper (pytest)

- [ ] `tests/test_gate.py` — ver Tarea 2.2.

### Tarea 4.3 — Tests de prompts/workflows

- [ ] `tests/workflows/test_workflow_structure.py` — valida que cada workflow tenga secciones obligatorias (`Pre-condición`, `Ejecución`, `Post-condición`) y frontmatter válido.
- [ ] `tests/agents/test_registry.py` — valida `registry.json` contra schema y existencia de cada `prompt_file`.

### Tarea 4.4 — Test E2E del Quickstart

- [ ] `tests/e2e/test_quickstart.bats` — en container limpio Ubuntu + macOS, copy-paste del Quickstart funciona end-to-end.

**Definition of Done:** `bats tests/ && pytest tests/` pasa en local y CI.

---

## 5. P1 — CI/CD

### Tarea 5.1 — `.github/workflows/`

- [ ] `lint-shell.yml` — ShellCheck sobre todos los `.sh`.
- [ ] `lint-markdown.yml` — markdownlint sobre `**/*.md`.
- [ ] `lint-python.yml` — ruff + mypy sobre scripts Python.
- [ ] `validate-prompts.yml` — parsea frontmatter de workflows/agentes, detecta referencias rotas.
- [ ] `validate-schemas.yml` — valida `xdd.config.yml`, `registry.json`, etc. contra sus schemas.
- [ ] `test.yml` — corre bats + pytest. Matrix: `ubuntu-latest`, `macos-latest`.
- [ ] `gitleaks.yml` — escaneo de secretos.
- [ ] `e2e.yml` — Quickstart end-to-end en container limpio.
- [ ] Branch protection: ningún PR mergea sin estos workflows en verde.

---

## 6. P1 — Dogfooding visible

### Tarea 6.1 — Aplicar X-DD al propio X-DD

- [ ] `.xdd/briefing/SPEC.md` — especificación del propio X-DD.
- [ ] `.xdd/spec/DOMAIN.md` — modelo: Pipeline, Phase, Gate, Workflow, Agent, Profile, Adapter, Capability.
- [ ] `.xdd/spec/THREATS.md` — STRIDE: prompt injection vía workflow externo, hook ejecutando script malicioso post-commit, agentes que filtran secretos al MCP server, etc.
- [ ] `docs/ADR/` con al menos:
  - ADR-001: SSoT en markdown + adaptadores por IDE.
  - ADR-002: MCP como vía preferida de integración.
  - ADR-003: MemPalace como dependencia externa, no fork.
  - ADR-004: State machine en `.xdd/` con checksums SHA-256.
- [ ] `memoria.md` y `lecciones.md` poblados con decisiones reales del diseño.

---

## 7. P1 — Quickstart funcional

### Tarea 7.1 — Verificar que todos los comandos del README existan

**Problema:** el README menciona `xdd-doctor.sh` y `xdd-init.sh` pero solo `xdd-start.sh` está en el repo.

**Implementar:**

- [ ] Auditar `scripts/` vs README. Crear lo que falte o corregir el README.
- [ ] Cada script con `--help`, `--version`, `set -euo pipefail`.
- [ ] Test E2E del Quickstart en CI (ver Tarea 4.4).

---

## 8. P2 — Gobernanza open source

### Tarea 8.1 — Archivos de gobernanza

- [ ] `CONTRIBUTING.md` — cómo contribuir, cómo correr tests, cómo añadir un IDE adapter, cómo añadir un agente al registry.
- [ ] `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1.
- [ ] `SECURITY.md` — política de divulgación (irónico no tenerla en un repo SecDD).
- [ ] `.github/ISSUE_TEMPLATE/`: bug, feature, nuevo IDE adapter, nuevo agente.
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` con checklist alineado a la Constitución X-DD.
- [ ] `LICENSE` — confirmar MIT (ya existe).
- [ ] `NOTICE` si se incluyen prompts derivados de terceros.

---

## 9. P2 — Versionado y releases

### Tarea 9.1 — SemVer + CHANGELOG

- [ ] Adoptar [SemVer](https://semver.org).
- [ ] `CHANGELOG.md` siguiendo [Keep a Changelog](https://keepachangelog.com).
- [ ] Release inicial `v0.1.0` con tag firmado.
- [ ] `.github/workflows/release.yml` — release notes automáticas al taggear.
- [ ] Documentar política de breaking changes (afectan `xdd.config.yml`, `registry.json`, formato de workflows).

---

## 10. P2 — Observabilidad local

### Tarea 10.1 — Métricas del pipeline

- [ ] `~/.xdd/metrics.jsonl` — log estructurado: fase ejecutada, gate aprobado/rechazado, duración, agente invocado.
- [ ] `scripts/xdd-metrics.sh` — resume métricas: "Fase 4 falló 3 veces esta semana", "Agente X tarda promedio Y".
- [ ] Las métricas alimentan automáticamente el Learning Loop de Fase 6.
- [ ] **Privacidad:** todo local, jamás enviado a la nube. Documentarlo en `SECURITY.md`.

---

## 11. P3 — Adopción

### Tarea 11.1 — Internacionalización

- [ ] `README.en.md` (puerta de entrada en inglés).
- [ ] `INSTALL.en.md`.
- [ ] Los prompts internos pueden quedar en español (decisión documentada en ADR).
- [ ] Badge de idioma en cada README.

### Tarea 11.2 — Ejemplos end-to-end

- [ ] `examples/todo-app/` — proyecto de juguete con todos los artefactos X-DD generados; commits separados por fase 1→6.
- [ ] `examples/lib-sdk/` — ejemplo de librería (perfil distinto).
- [ ] Cada ejemplo con su README explicando qué muestra.

### Tarea 11.3 — Plantillas por industria

- [ ] `templates/industries/fintech/` — SPEC.md y THREATS.md específicos.
- [ ] `templates/industries/ecommerce/`.
- [ ] `templates/industries/saas-b2b/`.
- [ ] `templates/industries/internal-tool/`.

### Tarea 11.4 — Diagramas Mermaid

- [ ] Reemplazar árbol ASCII del pipeline por diagrama Mermaid en `README.md`.
- [ ] Diagrama de secuencia: `xdd-start.sh → MemPalace → orquestador`.
- [ ] Diagrama de arquitectura: SSoT → adaptadores → IDEs.

### Tarea 11.5 — Sección "Qué NO es X-DD"

```markdown
## Qué NO es X-DD

- No es un framework de código (no reemplaza React/Express/Django).
- No reemplaza tu test runner; orquesta Vitest/Playwright/pytest.
- No es MemPalace; lo consume (ver DEPENDENCIES.md).
- No requiere Claude Code: soporta 9+ IDEs vía MCP y adaptadores.
- No envía datos a la nube; todo es local-first.
- No es compatible con monorepos sin adaptación (en roadmap).
```

---

## 12. Quick wins (1-2 horas cada uno)

- [ ] **12.1** Badges en README: license, CI, last commit, contributors, MemPalace version.
- [ ] **12.2** `.editorconfig` + `.gitattributes` (line endings consistentes).
- [ ] **12.3** Pre-commit con shellcheck + markdownlint + gitleaks + ruff.
- [ ] **12.4** `Makefile` o `justfile`: `make doctor`, `make start`, `make test`, `make adapt IDE=cursor`, `make lint`.
- [ ] **12.5** Topics en GitHub: `claude-code`, `opencode`, `cursor`, `windsurf`, `mcp`, `mempalace`, `tdd`, `bdd`, `ddd`, `secdd`, `ai-development`, `spec-driven`.
- [ ] **12.6** `.tool-versions` (asdf) y `mise.toml` con versiones pineadas.

---

## 13. Orden de implementación recomendado

1. **Tarea 1.1** (declarar MemPalace externo) — bloqueante para todo lo demás.
2. **Tarea 7.1** (Quickstart funcional) — sin esto nadie puede ni probar.
3. **Tarea 1.3** (`xdd-doctor.sh` real) — primera línea de defensa.
4. **Tarea 5.1** (CI) — gratis, da credibilidad instantánea.
5. **Tarea 1.2** (`xdd.config.yml`) — base para todo lo demás.
6. **Tarea 2.1 + 2.2** (state machine + `xdd-gate.py`) — el diferenciador real de X-DD.
7. **Tarea 3.1** (registry de agentes) — habilita orquestación programática.
8. **Tarea 4** (tests del framework) — coherencia con TDD First.
9. **Tarea 1.4** (adaptador multi-IDE) — abre la puerta a los 9 IDEs.
10. **Tarea 6** (dogfooding) — prueba viva del sistema.
11. **Tarea 8** (gobernanza) — antes de anunciar públicamente el repo.
12. **Tarea 9** (release v0.1.0) — primer hito público.
13. **Tareas 10-12** según prioridad.

---

## 14. Definition of Done global

Una tarea está terminada cuando:

1. **Implementada** según criterios de aceptación.
2. **Testeada** (bats / pytest / validadores de schema).
3. **Documentada** en el archivo correspondiente.
4. **CI verde** en todos los workflows.
5. **Compatibilidad multi-IDE verificada** si aplica (adaptador genera output correcto para los 9 IDEs).
6. **Entrada en `CHANGELOG.md`** bajo `[Unreleased]`.
7. **Entrada en `lecciones.md`** si hubo aprendizajes.
8. **ADR creado** si introdujo decisión arquitectónica.

---

## 15. Instrucciones para Claude Code (u otro IDE)

> Antes de empezar, leé este documento completo y la **Constitución X-DD**.
>
> Para cada tarea:
>
> 1. **Aplicá X-DD al propio trabajo:** SPEC → tests → código → QA → retro. No implementes a ciegas.
> 2. **Verificá specs oficiales antes de asumir sintaxis** de cualquier IDE o herramienta. Si la spec cambió, abrí issue antes de implementar.
> 3. **Cualquier archivo en `.claude/` debe tener equivalente en `.cursor/`, `.windsurf/`, `AGENTS.md` y `.github/copilot-instructions.md`** — o estar generado por el adaptador de Tarea 1.4.
> 4. **MCP es la vía preferida.** Antes de inventar integración custom, verificá si el caso ya está cubierto por MemPalace MCP server o si conviene exponerlo como tool MCP propio.
> 5. **No dupliques lógica:** SSoT en `/prompts/` y `/.agent/workflows/`. Los archivos específicos de IDE solo invocan.
> 6. **No introduzcas dependencias pesadas** sin justificarlas en un ADR.
> 7. **Cada commit corresponde a una tarea**: `feat(N.N): ...` o `fix(N.N): ...` con número de tarea de este plan.
> 8. **Antes de cerrar una tarea:** correr `xdd-doctor.sh`, bats, pytest, lints. Si algo falla, no cerrar.
> 9. **Si encontrás contradicción** entre este plan y la Constitución X-DD: prevalece la Constitución; abrí issue.
> 10. **Si el plan está desactualizado** respecto a docs oficiales de MemPalace, Claude Code, etc.: corregilo en un PR aparte, no en el mismo de la tarea.

---

## Anexo v1.2 — Decisiones meta-arquitectónicas (Sprint 0 Reconciliación)

> Añadido el 2026-05-26 al cerrar Sprint 0. Reconcilia las preguntas abiertas del
> plan v1.1 con decisiones formales documentadas como ADRs Nygard en
> [docs/adr/](docs/adr/). El plan original sigue siendo la fuente de tareas;
> este anexo establece cómo se ejecutan.

### Estrategia de ejecución consolidada

Una pasada por las 6 fases X-DD para todo MEJORAS, ejecutada en 8 sprints
(~17.5 días), con dogfooding visible en el repo. Ver
[.xdd/briefing/SPEC.md](.xdd/briefing/SPEC.md),
[.xdd/briefing/FEATURES.md](.xdd/briefing/FEATURES.md) y
[PROJ-MASTER-PLAN.md](PROJ-MASTER-PLAN.md).

### ADRs que cierran las preguntas abiertas del plan v1.1

| ADR | Tema | Resuelve |
|---|---|---|
| [0000](docs/adr/0000-mapeo-mejoras-pipeline-xdd.md) | Mapeo MEJORAS ↔ pipeline X-DD | Cómo organizar 70 tareas en 6 fases sin burocracia |
| [0001](docs/adr/0001-dogfooding-visible-commiteable.md) | Dogfooding visible y commiteable | Visibilidad del `.xdd/` y artefactos en el repo público |
| [0002](docs/adr/0002-profile-vs-config-coexisten.md) | `profile.yml` vs `config.yml` | Cómo evitar overlap con el archivo existente del retrofit |
| [0003](docs/adr/0003-python-runtime-gate-keeper.md) | Python como runtime del gate | Lenguaje del gate keeper (Tarea 2.2) |
| [0004](docs/adr/0004-mempalace-dep-externa-no-fork.md) | MemPalace dep externa | Formaliza Tarea 1.1 |
| [0005](docs/adr/0005-mcp-preferido-y-server-propio.md) | MCP server propio de X-DD | Sobre-mejora estratégica no contemplada en v1.1 |
| [0006](docs/adr/0006-gate-keeper-firma-hmac.md) | Firma HMAC-SHA256 en gate | Sobre-mejora: hace el gate genuinamente auditable |
| [0007](docs/adr/0007-adapters-iniciales-claude-opencode-mcp.md) | Alcance inicial de adapters | Reduce Tarea 1.4 de 9 IDEs a 2 + MCP |
| [0008](docs/adr/0008-consolidacion-xdd-cli-diferida.md) | `xdd` CLI Python diferido | Cómo manejar la dispersión de scripts post-v0.1.0 |
| [0009](docs/adr/0009-politica-versionado-xdd-directorio.md) | Qué se commitea de `.xdd/` | Política granular de gitignore |

### Sobre-mejoras incorporadas vs plan v1.1

| Sobre-mejora | Sprint | Diferencia con v1.1 |
|---|---|---|
| MCP server propio (ADR-0005) | 6 | v1.1 solo consumía MCP de MemPalace |
| Gate keeper firmado HMAC (ADR-0006) | 4 | v1.1 dejaba `.status` como string editable |
| Migración automática de agentes (Sprint 5) | 5 | v1.1 implicaba escribir 77 entradas a mano |
| `devcontainer.json` + Template Repository | 8 | v1.1 no lo mencionaba |
| Renovate config | 2 | v1.1 mencionaba Dependabot |
| `xdd-doctor.sh --json` | 3 | v1.1 solo salida humana |
| Pre/post-condition con `xdd-gate.py` en todos los workflows existentes | 4 | v1.1 solo lo planteaba para workflows nuevos |

### Mapeo Sprint ↔ Fase X-DD

| Sprint | Fase X-DD activa | Cierra con |
|---|---|---|
| 0 Reconciliación | F1 Briefing | `/cierre-fase` + `/xdd-trace` |
| 1 MemPalace externo + Quickstart | F2 Spec | `/cierre-fase` + `/xdd-trace` |
| 2 CI + plan formal | F3 Plan | `/cierre-fase` + `/xdd-trace` |
| 3 doctor + config | F4 Build (1/5) | `/cierre-fase` + `/xdd-trace` |
| 4 Gate keeper firmado | F4 Build (2/5) | `/cierre-fase` + `/xdd-trace` |
| 5 Registry agentes | F4 Build (3/5) | `/cierre-fase` + `/xdd-trace` |
| 6 MCP server propio | F4 Build (4/5) | `/cierre-fase` + `/xdd-trace` |
| 7 Adapters + tests E2E | F4 Build (5/5) + F5 QA | `/qa-review` + `/cierre-fase` |
| 8 Gobernanza + release | F6 Retro | `/release-cut` + `/cierre-fase` |

### Reglas duras durante implementación (vigentes desde Sprint 0)

1. **Branch por sprint:** `feat/sprint-N-<slug>`.
2. **Commits convencionales con tarea MEJORAS:** `feat(2.2): xdd-gate.py base`.
3. **ADR antes de implementar** decisiones arquitectónicas (no después).
4. **`lecciones.md` durante el sprint**, no al final.
5. **`/cierre-fase` + `/xdd-trace`** obligatorios antes del merge.
6. **Sin skip de tests/lints** — investigar root cause.

---

*Plan de mejoras X-DD — versión 1.1 + anexo v1.2 — preparado para distribución open source pública en GitHub.*
