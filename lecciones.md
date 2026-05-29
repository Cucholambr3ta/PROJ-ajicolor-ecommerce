# lecciones.md — Aprendizajes Acumulados

> Lecciones aprendidas del proyecto. Indexado por MemPalace. Consultado por agentes antes de proponer soluciones para evitar repetir errores (Constitución Art. 9).
> Actualizado vía `/cierre-fase` al final de cada fase.

## Formato
Cada lección sigue la estructura:
```
### [CATEGORÍA] Título breve — YYYY-MM-DD
**Contexto:** Qué estábamos intentando hacer.
**Problema:** Qué falló o sorprendió.
**Causa raíz:** Por qué pasó.
**Lección:** Regla aplicable a futuras decisiones.
**Aplica a:** Ámbito (módulo X, todo el proyecto, stack Y…).
```

Categorías sugeridas: `ARQUITECTURA`, `SEGURIDAD`, `DOMINIO`, `TESTING`, `DEVOPS`, `PROCESO`, `HERRAMIENTAS`.

---

## Lecciones

### [PROCESO] GitNexus `detect_changes()` antes de cada commit — 2026-05-28
**Contexto:** Primer commit del proyecto PROJ-ajicolor-ecommerce con 550 archivos (bootstrap X-DD + DOMAIN + THREATS).
**Problema:** No se ejecutó `gitnexus_detect_changes()` ni `gitnexus analyze` antes del commit. El AGENTS.md exige "MUST run before committing" pero se omitió.
**Causa raíz:** El flujo X-DD no tenía GitNexus indexado en el proyecto aún; se indexó post-commit.
**Lección:** Al bootstrap, ejecutar `npx gitnexus analyze` inmediatamente después de `xdd-init.sh`, antes del primer commit. Para commits siguientes, ejecutar `gitnexus_detect_changes()` pre-commit.
**Aplica a:** Todo proyecto X-DD al iniciar.

### [PROCESO] Commits separados por fase, no mezclados — 2026-05-28
**Contexto:** Bootstrap + DOMAIN.md + THREATS.md en un solo commit.
**Problema:** Un commit de bootstrap + especificación viola trazabilidad. No se puede distinguir "estructura del proyecto" de "modelo de dominio". xdd-gate.py transition entre fases queda sin commit intermedio.
**Causa raíz:** No se respetó el corte por fase del pipeline X-DD.
**Lección:** Cada fase produce su propio commit: (1) bootstrap + estructura, (2) gate approve → DOMAIN + THREATS, (3) gate approve → SPEC, etc. El gate criptográfico valida entre fases.
**Aplica a:** Transiciones entre fases del pipeline X-DD.

### [PROCESO] No saltar Fase 1 (Briefing) — siempre DISCOVERY.md primero — 2026-05-28
**Contexto:** Bootstrap completó DOMAIN.md y THREATS.md antes de tener DISCOVERY.md. Se avanzó a Fase 2 sin Briefing formal.
**Problema:** Modelo de dominio sin validación de problema real. Artefactos Spec sin base de discovery documentada.
**Causa raíz:** El pipeline se ejecutó desordenadamente. xdd-init.sh no gatilla el flujo Briefing automáticamente.
**Lección:** El orden del pipeline es inviolable: Fase 1 (Briefing → DISCOVERY.md) → gate approve → Fase 2 (Spec). No importa si los mockups existen, el Briefing formal valida hipótesis antes de modelar.
**Aplica a:** Inicio de cualquier proyecto X-DD.

### [HERRAMIENTAS] `xdd-gate.py` briefing esperaba SPEC.md y FEATURES.md — bug de artefactos — 2026-05-28
**Contexto:** Al aprobar Briefing, el gate rechazaba porque esperaba `.xdd/briefing/SPEC.md` y `.xdd/briefing/FEATURES.md` (artefactos de Spec/Plan, no de Briefing).
**Problema:** El gate del framework tiene hardcodeado el checklist de briefing con los artefactos incorrectos.
**Causa raíz:** El modelo PHASES en xdd-gate.py no coincide con el pipeline real: Briefing produce DISCOVERY.md, no SPEC/FEATURES.
**Lección:** Al bootstrapar un proyecto, revisar `PHASES` en `scripts/xdd-gate.py` línea 45 y corregir artefactos según el pipeline real del proyecto. Briefing → `["DISCOVERY.md"]`.
**Aplica a:** Todo proyecto X-DD que use el gate. Reportar upstream al framework como bug.

### [PROCESO] Git Flow estricto: feature branch + PR → develop, sin commits directos — 2026-05-28
**Contexto:** Commit `6f11dca` (DISCOVERY.md + fix gate) se hizo directo a develop. No hubo rama feature ni PR.
**Problema:** Violación de Git Flow. Sin rama, no hay trazabilidad de la feature. Sin PR, no hay revisión ni historial de merge. La rama no existe para preservar el contexto de desarrollo.
**Causa raíz:** Se priorizó velocidad sobre proceso.
**Lección:** Toda feature/fix crea rama `feature/<nombre>` desde develop. Commit → `gh pr create --base develop` → merge (squash o merge commit). La rama NO se elimina post-merge. Jamás commit directo a develop.
**Aplica a:** Todo el flujo del proyecto.
