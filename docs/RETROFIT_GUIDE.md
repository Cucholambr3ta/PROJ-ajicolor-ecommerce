# Retrofit Guide — Capacidades Extendidas X-DD

Esta guía documenta el **retrofit completo** que extiende X-DD desde un "pipeline de construcción" a un **ciclo de vida completo de producto** — de discovery a operación.

## ¿Qué añade el retrofit?

| Capa | Aporta |
|------|--------|
| **A — 13 workflows nuevos** | Cierran brechas (i18n, flags, analytics, FinOps, privacy, DR, release mgmt, contract testing, onboarding, mobile release, UX discovery, API contract, DB migrate) |
| **B — 10 agentes nuevos** | Especialistas para cada brecha |
| **C — 11 plantillas** | Artefactos versionables (DISCOVERY.md, ADR, runbook, PRIVACY.md, DR_PLAN.md, FLAGS.md, events.schema.json, BUDGET.md, ONBOARDING.md, release notes, xdd.profile.yml) |
| **D — 6 workflows de refuerzo** | Hacen ejecutables capacidades que solo existían como agentes (observability, perf budget, a11y, ADR, data pipeline, ML eval) |
| **E — Perfilado** | `xdd.profile.yml` permite activar capacidades según tipo de producto |

## Filosofía

1. **No añade fases al pipeline.** Todas las capacidades se embeben en las 6 fases existentes (Briefing → Spec → Plan → Build → QA → Retro) o son workflows on-demand.
2. **Portabilidad absoluta.** Cero rutas absolutas, todo relativo.
3. **Stacks agnósticos.** Cada workflow que depende de un stack (flags, analytics, observabilidad, CI, cloud) usa placeholders `<!-- CONFIGURAR: ... -->` con 2-3 opciones documentadas. La decisión la toma el usuario al adoptar el workflow en su proyecto.
4. **Activación por perfil.** `xdd.profile.yml` declara qué capacidades aplican (SaaS web → i18n + analytics; mobile → mobile-release + signing; lib → API contract + end-user docs).

## Cómo usar el retrofit

### En el repo X-DD raíz
Los archivos del retrofit ya están en este repo. Verifica:

```bash
bash ./scripts/lint-workflows.sh   # 0 errores
bash ./scripts/xdd-doctor.sh       # estado actual del entorno
ls .agent/workflows/ | wc -l       # ≥ 48 workflows
ls templates/ | wc -l              # ≥ 13 plantillas
```

### En un proyecto nuevo
```bash
bash ./scripts/xdd-init.sh /ruta/a/mi-proyecto
cd /ruta/a/mi-proyecto
# Editar xdd.profile.yml: declara tu tipo de producto y stacks
bash ./scripts/xdd-start.sh
```

### Invocación de los workflows nuevos

| Comando | Cuándo |
|---------|--------|
| `/ux-discovery` | Antes de Fase 1 — validar problema |
| `/api-contract` | Fase 2 — formalizar API |
| `/db-migrate` | Fase 4 — toda migración |
| `/feature-flag` | Fase 3-4 — gobernar flags |
| `/i18n-setup` | Fase 4 — bootstrap i18n |
| `/analytics-instrument` | Fase 4 — plan de tracking |
| `/privacy-review` | Fase 2-5 — PII y GDPR |
| `/finops-baseline` | Fase 5-6 — control de costos |
| `/dr-drill` | Fase 5-6 — drill DR |
| `/release-cut` | Fase 5-6 — corte de release |
| `/contract-test` | Fase 5 — verificar contratos |
| `/onboard-dev` | On-demand — dev nuevo |
| `/mobile-release` | On-demand — release a stores |
| `/observability-init` | Fase 2-4 — SLI/SLO |
| `/perf-budget` | Fase 3-5 — performance |
| `/a11y-audit` | Fase 5 — accesibilidad |
| `/adr-new` | Cualquier fase — decisión arquitectónica |
| `/data-pipeline` | Fase 3-4 — diseño de pipeline |
| `/ml-eval` | Fase 4-5 — evaluación de modelo |

## Perfiles típicos

### SaaS web multi-tenant
Activar: ux_discovery, feature_flags, product_analytics, release_mgmt, observability, finops, privacy, api_contract, perf_budget, a11y, adrs, i18n, end_user_docs, db_migrations, contract_testing.

### App móvil
Activar: ux_discovery, feature_flags, product_analytics, release_mgmt, observability, privacy, perf_budget, a11y, adrs, mobile_release, finops, onboarding.

### Librería / SDK open source
Activar: api_contract, release_mgmt, contract_testing, end_user_docs, adrs, a11y (si tiene UI), perf_budget, onboarding.

### Tool interna / scripts
Activar: onboarding, adrs, observability (si corre persistente), db_migrations (si tiene BD). Resto opcional.

## Roadmap

- [ ] CI workflow (GitHub Actions) que ejecute `lint-workflows.sh` en cada PR al repo X-DD.
- [ ] `xdd-init.sh --profile=<saas|mobile|lib|internal>` que filtre copias según perfil.
- [ ] Comando `xdd-profile validate` que verifique coherencia entre perfil declarado y stacks elegidos.
- [ ] Catálogo agregado de stacks recomendados por perfil en `docs/`.

## Ver también
- [README.md](../README.md) — visión general X-DD
- [INSTALL.md](../INSTALL.md) — instalación de herramientas
- [X-DD_Integration_Guide.md](./X-DD_Integration_Guide.md) — pipeline completo
- [constitucion.md](./constitucion.md) — gobernanza
- [equipo.md](./equipo.md) — directorio de agentes
