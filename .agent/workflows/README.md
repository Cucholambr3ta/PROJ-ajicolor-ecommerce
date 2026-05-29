# .agent/workflows/ — Workflows Ejecutables

Este directorio contiene los **workflows slash command** que Claude Code y OpenCode reconocen como comandos `/<nombre>` durante una sesión.

| Aspecto | `.agent/workflows/` | `prompts/workflows/` |
|---------|---------------------|----------------------|
| Tipo | Archivos **ejecutables** por el orquestador | **Catálogo descriptivo** legible para humanos |
| Formato | Markdown con frontmatter `description:` | Markdown narrativo |
| Invocación | `/<nombre>` en sesión | No invocable |
| Propósito | Definir el comportamiento del comando | Documentar el ecosistema y dar contexto |

## Convenciones

- **Nombre del archivo = nombre del comando.** `xdd-build.md` → `/xdd-build`.
- **Frontmatter obligatorio:**
  ```yaml
  ---
  description: Resumen corto de qué hace el workflow.
  ---
  ```
- **Sin rutas absolutas del host** (Constitución, "Portabilidad Absoluta"). Usar siempre `./` o `../`.
- **Validar antes de commit:** `bash ./scripts/lint-workflows.sh`

## Workflows principales

Ver listado completo y descripción en [`prompts/workflows/03_workflows_catalog.md`](../../prompts/workflows/03_workflows_catalog.md).

Los más usados:

| Comando | Fase | Propósito |
|---------|------|-----------|
| `/xdd` | Todas | Orquestador principal |
| `/fase-requisitos` | 1 | Briefing |
| `/project-architecture-gsd` | 2 | Spec + DOMAIN + THREATS |
| `/plan-fases` | 3 | Plan por features |
| `/xdd-build` | 4 | Build con TDD/STDD |
| `/qa-review` | 5 | QA 3-Tier |
| `/cierre-fase` | 6 | Retro + lecciones |
