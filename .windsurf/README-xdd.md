# X-DD / anmax en Windsurf

Windsurf (Codeium) consume X-DD vía 3 mecanismos:

## 1. Workflows nativos (slash commands)
`.windsurf/workflows/*.md` — Windsurf los descubre auto desde workspace.
Invoca con `/anmax` u otro nombre de workflow (`/fase-requisitos`, `/plan-fases`, etc).
Doc: https://docs.windsurf.com/plugins/cascade/workflows.md
Límite: 12000 chars por archivo (adapter WARN si excede).

## 2. Rule orquestador (@-mention)
`.windsurf/rules/anmax.md` — Cascade lo carga como contexto persistente.
Activa con `@anmax` en chat.

## 3. MCP server (6 tools)
Config GLOBAL en `~/.codeium/mcp_config.json` (mergeada por adapter).
Override: `XDD_WINDSURF_HOME` env var.
Doc: https://docs.windsurf.com/plugins/cascade/mcp.md

**Sprint 25 (recomendado):**
1. `bash scripts/xdd-mcp-install-global.sh` (wrapper en ~/.local/bin)
2. `bash scripts/xdd-adapt.sh windsurf --dest=<proyecto>`
3. Reinicia Windsurf. Tools auto-descubiertas.

## Re-sync tras editar SSoT
`bash scripts/xdd-adapt.sh windsurf --dest=<proyecto>`
Workflows + rule + MCP entry actualizados (no destructive merge).
