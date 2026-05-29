# Constitución del Proyecto — `<NOMBRE_PROYECTO>`

> Plantilla X-DD Sprint 16 + ADR-0014. Inspirada en Spec-Kit constitution.md (MIT).
> Adoptar editando placeholders `<...>` y eliminando guías inline.

**Versión:** 1.0
**Fecha:** <YYYY-MM-DD>
**Approvers:** <nombres + firma>

## Preámbulo

Este documento es ley local del proyecto. **Prevalece sobre cualquier README, ADR previo o guía**. Cambios requieren PR firmado por approvers + bump de versión.

## Artículo 1 — Misión del proyecto

<Una frase: qué problema resuelve este proyecto y para quién.>

## Artículo 2 — Principios no negociables

Listar 3-7 principios duros que el proyecto NUNCA viola. Ejemplos:

- **Privacy by design:** ningún PII sale del cliente sin consentimiento explícito documentado en `PRIVACY.md`.
- **Test-first:** ninguna función de negocio en `src/` sin test prévio en `tests/`.
- **Spec-first:** ninguna feature en producción sin SPEC.md aprobado por gate.
- **<otro principio>:** <explicación de qué prohíbe>

## Artículo 3 — Pipeline gated

Este proyecto adopta X-DD pipeline de 6 fases con gates firmados HMAC-SHA256:
1. Briefing → 2. Spec → 3. Plan → 4. Build → 5. QA → 6. Retro

**Política de aprobación:**
- Approvers mínimos por fase: <N>
- Approvers requeridos para Spec/Plan: <quiénes>
- Approvers requeridos para Build/QA: <quiénes>
- Veto: cualquier approver puede vetar con justificación escrita.

## Artículo 4 — Stack tecnológico permitido

| Capa | Tecnología | Versión mínima | Razón |
|---|---|---|---|
| Lenguaje | <ej. TypeScript> | <ej. 5.x> | <razón> |
| Framework | <ej. Next.js> | <ej. 14.x> | <razón> |
| DB | <ej. Postgres> | <ej. 15> | <razón> |

**Cambios al stack:** requieren ADR formal + voto unánime de approvers.

## Artículo 5 — Calidad mínima

- **Coverage:** ≥ <N>% en `src/` (medido por `<tool>`).
- **Performance budget:** ver `BUDGET.md` (TBP, INP, bundle size).
- **A11Y:** WCAG <2.1 AA> mínimo (ver `/a11y-audit`).
- **Security:** SAST + secrets scan en cada PR (ver `.github/workflows/`).

## Artículo 6 — Trazabilidad

- Toda decisión arquitectónica → ADR Nygard en `docs/adr/`
- Todo bug en prod → entry en `lecciones.md`
- Todo release → tag firmado + `RELEASES/v*.md` user-facing
- Toda ambigüedad detectada → entry en `CLARIFICATIONS.md` (workflow `/clarify`)

## Artículo 7 — Ambigüedad cero

Cualquier "TBD", "ver luego", "asumiendo X", "etc." en un artefacto de fase es DEUDA BLOQUEANTE. Workflow `/clarify` se invoca antes de cada gate y bloquea si quedan ambigüedades CRÍTICAS.

## Artículo 8 — Adaptabilidad

No toda tarea necesita el pipeline completo. Niveles permitidos:
- **DIRECTO:** bugfix < 10 líneas → commit + push
- **MÍNIMO:** bugfix > 20 líneas → SDD + TDD
- **ÁGIL:** tool interna → FDD + SDD + TDD
- **ESTÁNDAR:** feature cliente → FDD + SDD + ATDD + BDD + TDD + SecDD
- **COMPLETO:** módulo complejo → FDD + DDD + SDD + BDD + ATDD + TDD + Threat + STDD + SecDD

## Artículo 9 — Portabilidad absoluta

No hay rutas absolutas del host en archivos commiteados. Todo relativo a `./` (raíz del proyecto).

## Artículo 10 — Gobernanza de cambios a esta constitución

Modificar este documento requiere:
1. Branch dedicada `chore/constitution-vX.Y`
2. PR con diff y justificación en cuerpo
3. Voto unánime de approvers
4. Bump de versión (semver: MAJOR si cambia art. no negociable; MINOR si añade artículo; PATCH si clarifica)

---

**Firma constitucional:**
- <Approver 1>: <firma o commit hash>
- <Approver 2>: <firma o commit hash>
