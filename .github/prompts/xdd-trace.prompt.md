---
description: Inicializa y sincroniza el sistema de trazabilidad (Gantt + Changelog) en el proyecto actual.
---
# /xdd-trace
**ID:** FLUJO-TRACE | **Versión:** 1.0 | **Agente:** X-DD-PM
**Misión**: Garantizar que el proyecto tenga una infraestructura de gestión completa y herede la historia existente.

## 0. AUDITORÍA DE GESTIÓN
- Verifica la existencia de:
  - `memoria.md`
  - `PROJ-MASTER-PLAN.md`
  - `docs/CHANGELOG.md`
- Si faltan, procede a la **Fase 1**. Si existen, procede a la **Fase 2 (Sync)**.

## 1. INICIALIZACIÓN (BOOTSTRAP)
- **Crea `PROJ-MASTER-PLAN.md`**: Genera una Carta Gantt inicial usando Mermaid. Si hay Git, extrae fechas de los primeros commits. Si hay `memoria.md`, usa sus fases.
- **Crea `docs/CHANGELOG.md`**: Reconstruye las últimas 10 intervenciones técnicas leyendo los mensajes de commit o la `memoria.md`.
- **Crea `docs/TECHNICAL.md`** (Si no existe): Estructura base de arquitectura.

## 2. SINCRONIZACIÓN (SYNC)
- Lee la `memoria.md` para encontrar la fase "Active".
- Actualiza el estado en `PROJ-MASTER-PLAN.md` (marcar tareas pasadas como `done`).
- Registra las intervenciones de la sesión actual en `docs/CHANGELOG.md`.

## 3. CERTIFICACIÓN
- Valida que los diagramas Mermaid rendericen sin errores.
- Asegura que todos los archivos de gestión estén vinculados entre sí mediante enlaces Markdown relativos.
