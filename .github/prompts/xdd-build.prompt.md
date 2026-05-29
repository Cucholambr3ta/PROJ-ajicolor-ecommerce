---
description: Fase de Construcción e Implementación del Ecosistema X-DD.
---
# /xdd-build
**ID:** FLUJO-BUILD | **Versión:** 1.0 | **Agente:** Builder
**Misión:** Transformar planes y especificaciones en código de producción de alta fidelidad.

## 1. SINCRONIZACIÓN DE BASE
- Verifica la existencia de `SPEC.md` en `/docs/specs` y `PLAN.md` en `/docs/plans`.
- Si el proyecto es nuevo y no tiene estructura, ejecuta el scaffolding:
  - Crea carpetas: `/idea`, `/docs`, `/src`, `/tests`, `/interop`.
  - Genera `claude.md` con la metadata inicial del proyecto.

## 2. EJECUCIÓN DEL PLAN (ATOMIC BUILDING)
- Lee el primer bloque de tareas del `PLAN.md`.
- Implementa el código siguiendo los **Estándares de Diseño X-DD**:
  - Estética Premium (HSL/OKLCH).
  - Clean Code (SOLID/DRY).
  - Logging proactivo.

## 3. VERIFICACIÓN CONTINUA
- Por cada componente construido, realiza una prueba de humo básica.
- Asegura que no haya "Code Drift" respecto a la Spec.

## 4. ACTUALIZACIÓN DE MANIFIESTOS
- Al completar un bloque de construcción, actualiza el estado en `claude.md`.
- Registra cualquier decisión técnica menor en `memoria.md`.

## 5. PASO A VALIDACIÓN
- Una vez finalizada la construcción, invoca a `QA-Reviewer` para iniciar la fase de validación técnica.

---
*X-DD Builder - Construyendo el futuro bit a bit.*
