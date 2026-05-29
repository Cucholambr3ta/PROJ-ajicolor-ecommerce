# X-DD Root Manifest

Este manifiesto define el contexto operativo y gobernanza para **Claude Code** y otros agentes cuando trabajan en un proyecto X-DD.

## ⚖️ Gobernanza
- La ley suprema local reside en la [Constitución X-DD](./docs/constitucion.md).
- **Lectura Obligatoria (Art. 3):** Antes de cualquier iteración, lee el archivo `memoria.md` del proyecto activo.
- **Directorio de Agentes:** Para delegar en subagentes especializados, consulta el [Directorio de Agentes](./docs/equipo.md).

## 🚀 Misión
Desarrollar software de alta calidad mediante el pipeline X-DD: la integración de múltiples metodologías *-Driven Development* (SDD, FDD, BDD, ATDD, DDD, TDD, STDD, SecDD, Threat-Driven) como capas sobre un Gated Pipeline de 6 fases.

## 🛠️ Guías de Desarrollo
- **Pipeline X-DD completo:** [docs/X-DD_Integration_Guide.md](./docs/X-DD_Integration_Guide.md)
- **Instalación de herramientas:** [INSTALL.md](./INSTALL.md)
- **Capacidades extendidas (retrofit):** [docs/RETROFIT_GUIDE.md](./docs/RETROFIT_GUIDE.md)

## 📦 Artefactos del proyecto (cuando aplican)

Los workflows producen artefactos versionables en la raíz del proyecto. Consulta el workflow correspondiente antes de modificarlos:

| Artefacto | Producido por | Propósito |
|-----------|---------------|-----------|
| `memoria.md` | `/xdd`, `/cierre-fase` | Flight recorder (Art. 3) |
| `lecciones.md` | `/cierre-fase` | Aprendizajes acumulados |
| `DISCOVERY.md` | `/ux-discovery` | Validación de problema |
| `SPEC.md` | `/project-architecture-gsd` | Especificación técnica |
| `DOMAIN.md` | `/project-architecture-gsd` | Modelo de dominio (DDD) |
| `THREATS.md` | `/project-architecture-gsd` | Modelo de amenazas (STRIDE) |
| `PRIVACY.md` | `/privacy-review` | PII y bases legales (GDPR) |
| `FEATURES.md` | `/fase-requisitos` | Catálogo FDD |
| `PLAN.md` | `/plan-fases` | Plan por features |
| `openapi.yaml` | `/api-contract` | Contrato API |
| `FLAGS.md` | `/feature-flag` | Inventario de feature flags |
| `events.schema.json` | `/analytics-instrument` | Schema de eventos |
| `BUDGET.md` | `/finops-baseline` | Presupuesto cloud |
| `DR_PLAN.md` | `/dr-drill` | Plan de DR |
| `ONBOARDING.md` | `/onboard-dev` | Guía de onboarding |
| `CHANGELOG.md` + `RELEASES/v*.md` | `/release-cut` | Trazabilidad de releases |
| `docs/adr/NNNN-*.md` | `/adr-new` | Decisiones arquitectónicas |
| `xdd.profile.yml` | `xdd-init.sh` | Perfil del proyecto |
| `~/.xdd/state.db` | `scripts/xdd-state.py` | Continuous Learning instincts (Sprint 9) |
| `skills/<name>/SKILL.md` | manual o `/evolve` | Sistema de skills (Sprint 10) |
| `evals/<suite>/cases.jsonl + grader.yaml` | `scripts/xdd-eval.py` | Eval-harness (Sprint 10) |
| `.xdd/qa/QA_REPORT.md` + AgentShield reports | `scripts/xdd-shield.py audit` | Audit estático del framework (Sprint 12) |
| `.claude/branding.json` + `.claude/orchestrator-persona.md` | `scripts/xdd-brand.sh` | White-labeling aplicado (Sprint 13) |

## 🛠️ Scripts disponibles (post-S13)

| Script | Función |
|---|---|
| `xdd-doctor.sh` | Diagnóstico entorno + `--json` |
| `xdd-init.sh` | Bootstrap proyecto + `--profile` + `--list-profiles` |
| `xdd-start.sh` | Arranca MemPalace + orquestador |
| `xdd-adapt.sh` | Generar config IDE (claude-code/opencode + DRY symlinks) |
| `xdd-gate.py` | Gate keeper HMAC-SHA256 (init/validate/transition/approve/status) |
| `xdd-state.py` | SQLite state-store para instincts (Sprint 9) |
| `xdd-eval.py` | Eval-harness con 5 grader types (Sprint 10) |
| `xdd-orchestrate.py` | Runtime multi-agent (sequential/parallel/parallel_then_sync) (Sprint 11) |
| `xdd-shield.py` | AgentShield audit del framework (Sprint 12) |
| `xdd-pentest.sh` | Wrapper híbrido Shannon (Sprint 12) |
| `xdd-brand.sh` | Aplica white-labeling al proyecto (Sprint 13) |
| `lint-workflows.sh` | Lint frontmatter + catálogo |
| `migrate-agents-to-registry.py` | Re-genera `registry.json` desde `.md` |
| `validate-registry.py --strict` | Valida registry + id-refs |
| `generate-equipo.sh` | Regenera `docs/equipo.md` desde registry |
| `install.ps1` | Bootstrap Windows (PowerShell) |

## 💎 Directrices de Calidad
1. **Portabilidad Absoluta:** Prohibido generar rutas absolutas del host. Toda ruta debe ser estrictamente relativa (`./` o `../`).
2. **Cero Duplicados:** No clonar directorios de agencias externas. Se utiliza únicamente la biblioteca consolidada en `./prompts/agents/`.
3. **Flujo Gated Pipeline (Art. 2):** Solicita el comando `"APROBADO"` antes de realizar grandes refactorizaciones o pasar de fases en el plan.

---
*X-DD System — Excelencia Operativa*

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **x-dd** (8822 symbols, 9445 relationships, 39 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/x-dd/context` | Codebase overview, check index freshness |
| `gitnexus://repo/x-dd/clusters` | All functional areas |
| `gitnexus://repo/x-dd/processes` | All execution flows |
| `gitnexus://repo/x-dd/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
