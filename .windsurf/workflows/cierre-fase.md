---
description: Ejecución del cierre formal de una fase de desarrollo y actualización de la Memoria Viva de X-DD.
---
# /cierre-fase
**ID:** FLUJO-CIERRE | **Versión:** 1.2 | **Agente:** Architect & QA-Reviewer
**Misión:** Certificar el éxito de la fase y asegurar la persistencia del conocimiento (Learning Loop).

## 0. CHECKS BLOQUEANTES (Sprint 28 / ADR-0038)

> **Lección retroactiva:** en proyecto piloto multi-IDE, cierre se ejecutó "APROBADO" verbal sin gate criptográfico ni update de `lecciones.md`. Ahora son **gates bloqueantes**.

Ejecuta ANTES de pasar a Sección 1:

1. **Gate keeper criptográfico:**
   ```
   python3 scripts/xdd-gate.py validate --phase=<fase-actual>
   ```
   Si exit code != 0 → **ABORT cierre**. Reporta motivo al usuario (artefacto faltante / checksum mismatch / firma inválida). NO continúes sin resolver.

2. **lecciones.md modificado en esta sesión:**
   ```
   git diff --name-only HEAD | grep -q "^lecciones\.md$" || git status --short | grep -q "lecciones\.md"
   ```
   Si NO → **bloquea cierre**. Mensaje: "Cierre rechazado: lecciones.md no actualizado. Registra al menos 1 entry de aprendizaje (ver Sección 2) antes de continuar."

3. **memoria.md modificado en esta sesión:** misma verificación. Bloquea cierre si NO.

## 1. DESTILACIÓN DE LOGROS
- Resume los hitos alcanzados en la fase actual.
- Verifica contra el **Plan de Implementación** que todo esté marcado como `[x]`.

## 2. BUCLE DE APRENDIZAJE (POST-MORTEM)
- Identifica cualquier error, bloqueo o "gotcha" técnico que ocurrió durante el desarrollo.
- **Registro obligatorio**: Añade al menos 1 entry a `lecciones.md` con formato canónico (CATEGORÍA / Contexto / Problema / Causa raíz / Lección / Aplica a).
- **Evolución**: Si la solución es reutilizable, propón al usuario crear una nueva skill en `.agent/skills/` o `skills/<name>/SKILL.md` (SSoT).

## 3. ACTUALIZACIÓN DE MANIFIESTOS
- Actualiza `memoria.md` con el log de la sesión (Sección "Bitácora de Sesiones" con timestamp + hitos + bloqueos + próxima sesión).
- Actualiza `CLAUDE.md` con el nuevo "Estado Actual" y "Próximo Hito".

## 4. CERTIFICACIÓN DE CALIDAD
- Genera un reporte rápido de QA:
  - ¿Drift detectado? (Sí/No)
  - ¿Tests pasando? (Sí/No)
  - ¿Estética premium validada? (Sí/No)

## 5. SELLO DE CIERRE — GATE APPROVE OBLIGATORIO (Sprint 28)
- Ejecuta `python3 scripts/xdd-gate.py approve --phase=<fase>` con firma HMAC-SHA256.
  - Genera `.xdd/<fase>/.signature` (firma criptográfica del cierre).
  - Marca `.xdd/<fase>/.status` = APROBADO.
- Si gate approve falla → ABORT cierre, NO sello verbal.
- Archiva planes completados de `/docs/plans` a `/docs/plans/archive/` (opcional).
- Termina con timestamp + estatus final del proyecto + commit message sugerido al usuario.

---
*Driven by X-DD Learning Loop — Enforcement Sprint 28 / ADR-0038*
