# X-DD — Guía de Instalación

Esta guía cubre todos los programas necesarios para operar el ecosistema X-DD completo en un sistema Linux/macOS/Windows.

---

## Núcleo Obligatorio

### 1. Orquestador de Agentes / IDE compatible

X-DD funciona con **cualquier orquestador agéntico** que soporte MCP, slash commands markdown, o `AGENTS.md` / `CLAUDE.md`. Elige al menos uno:

#### Adapters dedicados (sin requerir MCP)

##### Opción A — Claude Code (oficial Anthropic)
```bash
npm install -g @anthropic-ai/claude-code
claude --version
# Activar X-DD:
bash scripts/xdd-adapt.sh claude-code
```

##### Opción B — OpenCode (open source, multi-proveedor — Claude/GPT/Gemini/Ollama)
```bash
npm install -g opencode-ai
opencode --version
bash scripts/xdd-adapt.sh opencode
```

#### Via MCP server propio (sin adapter dedicado)

Cualquiera de estos IDE/asistentes consume X-DD vía `xdd-mcp-server` (6 tools). Setup en [docs/MCP_INTEGRATION.md](./docs/MCP_INTEGRATION.md):

| Asistente | Distribución | Host IDE |
|---|---|---|
| **Cursor** | cursor.sh | standalone IDE |
| **Continue.dev** | extension | VSCode, JetBrains |
| **Cline / Roo Code** | extension | VSCode |
| **Zed AI** | zed.dev | standalone |
| **Windsurf** | codeium.com | standalone |
| **Google Antigravity** | google.com/antigravity | standalone |
| **Codex** (OpenAI) | extension | various |
| **Gemini** (Google) | various | various |
| **Qwen** (Alibaba) | various | various |
| **Kiro, Trae, otros MCP-compat** | propios | varios |

#### Casos especiales

- **GitHub Copilot:** parcial vía `.github/copilot-instructions.md` (limitado — adapter completo en roadmap v0.2.0).
- **Hermes Agent** (Nous Research): lee `prompts/agents/` directo + slash commands parciales.

> X-DD expone capacidades vía MCP server propio ([ADR-0005](docs/adr/0005-mcp-preferido-y-server-propio.md)) — reduce 9+ adapters a 1 server compartido.
> Los workflows en `.agent/workflows/` usan formato `description:` en frontmatter compatible con todos los orquestadores sin modificaciones.

---

### 2. Git
Control de versiones (GitFlow obligatorio por Constitución Art. 7).

```bash
# Ubuntu / Debian / Mint
sudo apt install git

# macOS
brew install git

# Configuración inicial
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

### 3. Node.js v20+ y npm
Runtime para tests, linters y herramientas de desarrollo.

```bash
# Via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | sh
nvm install 20
nvm use 20

node --version   # v20.x.x
npm --version
```

---

### 4. Docker y Docker Compose
Requerido para entornos de staging, DAST y servicios auxiliares.

```bash
# Ubuntu / Mint
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# macOS
brew install --cask docker

docker --version
docker compose version
```

---

### 5. MemPalace — Memoria Semántica del Proyecto

Sistema de memoria espacial local-first. Indexa el codebase, workflows y decisiones del proyecto para que los agentes tengan contexto persistente entre sesiones.

```bash
# Instalar uv (gestor de paquetes Rust, ultra-rápido)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Instalar MemPalace globalmente
uv tool install mempalace

mempalace --version
```

> X-DD degrada elegantemente si MemPalace no está instalado: el orquestador arranca igual, sin indexación semántica. Recomendado pero no bloqueante.

**Inicializar en cada proyecto nuevo:**
```bash
mempalace init "$PWD"
mempalace mine "$PWD"
```
Los datos se almacenan localmente en `~/.mempalace/` — sin dependencias en la nube.

---

### 5b. GitNexus — Code Intelligence (recomendado, opt-in)

Knowledge graph del codebase via Tree-sitter AST + LadybugDB. 14 lenguajes. 16 MCP tools (impact analysis, hybrid search BM25+semantic+RRF, Cypher queries, multi-file rename).

```bash
# Instalación global
npm install -g gitnexus

# o ad-hoc sin install
npx gitnexus

gitnexus --version
```

> ⚠️ **License PolyForm Noncommercial 1.0.0.** Uso personal/research/educational/non-profit = gratis. Uso **comercial** (SaaS, consultoría, internal corporate tools) requiere paid license → [akonlabs.com](https://akonlabs.com). X-DD nunca lo bundle. Tu proyecto X-DD MIT NO se contamina por consumir su MCP server client-side. Detalles en [ADR-0033](docs/adr/0033-gitnexus-tier1-companion.md) + [DEPENDENCIES.md](DEPENDENCIES.md).

**Inicializar en cada proyecto nuevo:**
```bash
gitnexus index "$PWD"
```

`xdd-start.sh` indexa GitNexus + MemPalace automáticamente si CLIs disponibles. Sin GitNexus instalado → X-DD usa `xdd-fs-context` (Sprint 19, zero-dep baseline) como fallback.

---

## Testing (Pipeline X-DD)

### 6. Vitest — Tests Unitarios (TDD) y Security Tests (STDD)
```bash
npm install -D vitest
```

### 7. Playwright — Tests E2E y BDD
```bash
npm install -D @playwright/test
npx playwright install
npm install -D playwright-bdd
```

### 8. Cucumber (opcional, alternativa BDD pura)
```bash
npm install -D @cucumber/cucumber
```

---

## Seguridad (Pipeline SecDD)

### 9. Semgrep — SAST (Análisis Estático)
```bash
pip install semgrep        # Python
brew install semgrep       # macOS
semgrep --version
```

### 10. Gitleaks — Detección de Secretos en Código
```bash
# Linux (binario)
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz
tar -xzf gitleaks_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# macOS
brew install gitleaks

gitleaks version
```

### 11. Trivy — SCA (Vulnerabilidades en Dependencias e Imágenes)
```bash
# Ubuntu / Mint
sudo apt install wget apt-transport-https gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt update && sudo apt install trivy

# macOS
brew install trivy

trivy --version
```

### 12. OWASP ZAP — DAST (Análisis Dinámico en Staging)
Se ejecuta mediante Docker (imagen oficial actual `zaproxy/zap-stable`):
```bash
# Baseline scan (Tier 2 QA)
docker run -t zaproxy/zap-stable zap-baseline.py -t http://tu-staging-url

# Full scan
docker run -t zaproxy/zap-stable zap-full-scan.py -t http://tu-staging-url
```

> Nota: la imagen `owasp/zap2docker-stable` está deprecada desde 2024. Usa `zaproxy/zap-stable`.

### 13. Nuclei — Templates de Vulnerabilidades Conocidas
```bash
# Via Go
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# macOS
brew install nuclei

nuclei -update-templates
nuclei -version
```

---

## IDE Recomendado

### VS Code + Extensión Claude Code
```bash
sudo snap install code --classic
# O descargar desde https://code.visualstudio.com
```

### Extensiones VS Code recomendadas
- **Claude Code** — Integración nativa con el orquestador
- **ESLint** — Linting JavaScript/TypeScript
- **Prettier** — Formateo de código
- **GitLens** — Visualización avanzada de git
- **Cucumber (Gherkin)** — Soporte para archivos `.feature`

---

## Verificación del entorno

Usa el doctor incluido en el repo X-DD:

```bash
bash ./scripts/xdd-doctor.sh
```

Reporta qué herramientas están instaladas y cuáles faltan, sin abortar al primer fallo.

---

## Bootstrap de un proyecto nuevo

X-DD incluye un script de inicialización portable. **No copies directorios manualmente** — usa:

```bash
# Desde el clon del repo x-dd
bash ./scripts/xdd-init.sh /ruta/a/mi-proyecto-nuevo
cd /ruta/a/mi-proyecto-nuevo
bash ./scripts/xdd-start.sh
```

El script `xdd-init.sh`:
- Copia `.agent/`, `.claude/`, `prompts/`, `scripts/`, `CLAUDE.md` al destino
- Crea `memoria.md` y `lecciones.md` a partir de plantillas
- Inicializa git si no existe
- Imprime los siguientes pasos

---

## Automatización de MemPalace

El ecosistema X-DD re-indexa MemPalace automáticamente en tres momentos:

| Momento | Mecanismo | Archivo |
|---------|-----------|---------|
| Arranque de sesión | `xdd-start.sh` ejecuta `mempalace mine` antes del orquestador | [scripts/xdd-start.sh](./scripts/xdd-start.sh) |
| Cada Write/Edit del agente | Hook `PostToolUse` dispara `mempalace mine` en background | [.claude/settings.json](./.claude/settings.json) |
| Cada `git commit` | Hook `post-commit` re-indexa en background | [scripts/hooks/post-commit](./scripts/hooks/post-commit) |

Los tres mecanismos:
- **Detectan automáticamente si MemPalace está instalado.** Si no, son no-op (no bloquean ni rompen nada).
- **Loguean a `~/.mempalace/mine.log`** (no a `/dev/null`), para que puedas diagnosticar fallos silenciosos.

---

## Comandos X-DD disponibles (Workflows)

| Comando | Fase | Propósito |
|---------|------|-----------|
| `/xdd` | Todas | Orquestador principal — arranca el flujo del día |
| `/fase-requisitos` | Fase 1 | Briefing → REQUIREMENTS.md + FEATURES.md + .feature stubs |
| `/project-architecture-gsd` | Fase 2 | Spec → SPEC.md + DOMAIN.md + THREATS.md |
| `/plan-fases` | Fase 3 | Plan → PLAN.md organizado por features (FDD) |
| `/xdd-build` | Fase 4 | Build con TDD + STDD integrados |
| `/qa-review` | Fase 5 | QA completo: Tier 1 (SAST) + Tier 2 (BDD/ATDD/DAST) + Tier 3 (LLM-Judge) |
| `/cierre-fase` | Fase 6 | Retro → lecciones.md + memoria.md actualizado |
| `/security-audit` | Fase 5 | Auditoría de seguridad completa |
| `/advanced-agentic-pentesting` | Demanda | Red Team ofensivo con SecOps |

### Workflows del retrofit (capacidades extendidas)
| Comando | Cuándo | Propósito |
|---------|--------|-----------|
| `/ux-discovery` | Pre-Fase 1 | Validar problema antes de spec |
| `/api-contract` | Fase 2 | OpenAPI/GraphQL/gRPC formal |
| `/db-migrate` | Fase 4 | Migración con rollback verificado |
| `/feature-flag` | Fase 3-4 | Gobierno de flags |
| `/i18n-setup` | Fase 4 | Internacionalización |
| `/analytics-instrument` | Fase 4 | Product analytics + schema |
| `/privacy-review` | Fase 2-5 | GDPR/CCPA + PII |
| `/finops-baseline` | Fase 5-6 | Presupuesto cloud |
| `/dr-drill` | Fase 5-6 | Plan y drills de DR |
| `/release-cut` | Fase 5-6 | Release con semver + notes |
| `/contract-test` | Fase 5 | Consumer-driven contracts |
| `/onboard-dev` | On-demand | Onboarding de devs |
| `/mobile-release` | On-demand | Release a stores |
| `/observability-init` | Fase 2-4 | SLI/SLO + tracing |
| `/perf-budget` | Fase 3-5 | Presupuesto performance |
| `/a11y-audit` | Fase 5 | WCAG 2.1 AA |
| `/adr-new` | Cualquier fase | ADR numerado |
| `/data-pipeline` | Fase 3-4 | Pipeline de datos |
| `/ml-eval` | Fase 4-5 | Eval de modelos ML/LLM |

Ver [docs/RETROFIT_GUIDE.md](./docs/RETROFIT_GUIDE.md) para el detalle.

### Workflows Sprints 9-13 (capacidades v0.1.0)

| Comando | Sprint | Propósito |
|---------|--------|-----------|
| `/evolve` | 9 | Cluster instincts SQLite → propone skills/agents/commands (aprobación humana T6.1) |
| `/orchestrate` | 11 | Ejecuta composition_patterns del registry (sequential/parallel/sync) |

## Scripts Python/Bash X-DD v0.1.0 (post-S13)

| Script | Función | Sprint |
|--------|---------|--------|
| `scripts/xdd-doctor.sh` | Diagnóstico entorno (SemVer real, `--json`) | 3 |
| `scripts/xdd-init.sh` | Bootstrap proyecto (`--profile`, `--list-profiles`) | 7 |
| `scripts/xdd-start.sh` | MemPalace + orquestador | 0 |
| `scripts/xdd-adapt.sh` | Generar config IDE (claude-code/opencode DRY) | 7 |
| `scripts/xdd-gate.py` | Gate keeper HMAC (init/validate/transition/approve/status) | 4 |
| `scripts/xdd-state.py` | SQLite state-store para instincts | 9 |
| `scripts/xdd-eval.py` | Eval-harness con 5 grader types | 10 |
| `scripts/xdd-orchestrate.py` | Runtime multi-agent | 11 |
| `scripts/xdd-shield.py` | AgentShield audit del framework (13 reglas) | 12 |
| `scripts/xdd-pentest.sh` | Wrapper Shannon híbrido | 12 |
| `scripts/xdd-brand.sh` | Aplica white-labeling | 13 |
| `scripts/lint-workflows.sh` | Lint frontmatter + catálogo | 1 |
| `scripts/migrate-agents-to-registry.py` | Re-genera registry.json | 5 |
| `scripts/validate-registry.py` | Valida registry + id-refs (`--strict`) | 5 |
| `scripts/generate-equipo.sh` | Regenera docs/equipo.md | 5 |
| `install.ps1` | Bootstrap Windows | 7 |

## Dependencias opcionales adicionales (Sprint 12+)

### Shannon CLI (pentest dinámico, AGPL-3.0)

```bash
npx @keygraph/shannon setup
```

> ⚠️ **AGPL-3.0**. Sin Shannon X-DD funciona en modo híbrido degradado (STRIDE + source review estático). Con Shannon: dynamic fuzzing + verify + sandbox. Ver `docs/PENTEST.md` y ADR-0010. **X-DD NO bundle Shannon** — tu proyecto X-DD no se contamina con AGPL.

## Docs Sprints 9-13

| Doc | Sprint |
|-----|--------|
| [docs/GATE.md](./docs/GATE.md) | 4 (Gate keeper HMAC) |
| [docs/CONFIG.md](./docs/CONFIG.md) | 3 (xdd.config.yml) |
| [docs/INSTALL_PROFILES.md](./docs/INSTALL_PROFILES.md) | 7 (manifest-driven install) |
| [docs/HOOKS.md](./docs/HOOKS.md) | 7 (8 hooks event-driven) |
| [docs/MCP_INTEGRATION.md](./docs/MCP_INTEGRATION.md) | 6 (MCP server propio) |
| [docs/PENTEST.md](./docs/PENTEST.md) | 12 (Shannon híbrido + AgentShield) |
| [docs/BRANDING.md](./docs/BRANDING.md) | 13 (white-labeling) |
| [the-shortform-guide.md](./the-shortform-guide.md) | 8 (~15min quickstart) |
| [the-longform-guide.md](./the-longform-guide.md) | 8 (referencia exhaustiva) |
| [the-security-guide.md](./the-security-guide.md) | 8 (threat model + SecDD) |

---
*X-DD System — Instalación y configuración*
