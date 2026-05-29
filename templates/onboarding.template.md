# ONBOARDING.md — De cero a productivo

> Producido por `/onboard-dev`. Objetivo: developer nuevo hace su primer PR meaningful en ≤ 5 días.

## Día 0 — Pre-llegada
- [ ] Acceso a repo, secrets vault, comunicación (Slack/Discord), tracker
- [ ] Cuenta del orquestador (Claude Code u OpenCode) activada
- [ ] MemPalace instalado localmente (opcional pero recomendado)

## Día 1 — Setup
- [ ] Clonar repo y correr `bash ./scripts/xdd-doctor.sh` → 0 críticos
- [ ] Arrancar el entorno local — comando único:
  ```bash
  bash ./scripts/xdd-start.sh
  ```
- [ ] Leer `CLAUDE.md`, `memoria.md`, `lecciones.md` (5-10 min)
- [ ] Tour del repo guiado por el agente: `/onboard-dev tour`
- [ ] Primer "Hello World": cambio trivial → PR de prueba

## Semana 1 — Contexto
- [ ] Leer `docs/X-DD_Integration_Guide.md` y entender las 6 fases
- [ ] Leer `DOMAIN.md` (ubiquitous language)
- [ ] Leer `THREATS.md` y `PRIVACY.md`
- [ ] Revisar 3 PRs recientes y los issues asociados
- [ ] Pareando con un dev senior, recorrer un workflow real (`/xdd-build`)

## Semana 2-4 — Productividad
- [ ] Liderar un bug fix de complejidad media (>20 líneas, pipeline TDD completo)
- [ ] Participar en una QA review (`/qa-review`)
- [ ] Aportar al menos 1 entrada a `lecciones.md`

## Mes 2-3 — Autonomía
- [ ] Liderar una feature de FDD completa, end-to-end
- [ ] Proponer una mejora al proceso X-DD documentada en ADR

## Recursos
- Mapa del repo: `prompts/ecosystem/01_ecosystem_structure.md`
- Catálogo de workflows: `prompts/workflows/03_workflows_catalog.md`
- Directorio de agentes: `docs/equipo.md`
- Constitución: `docs/constitucion.md`

## Buddy / Mentor
- **Asignado:** <nombre>
- **Reuniones 1:1:** martes y jueves 15 min, primeras 2 semanas
