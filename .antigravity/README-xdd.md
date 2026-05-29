# X-DD/anmax en Antigravity

Antigravity (Gemini IDE) consume X-DD vía 2 mecanismos:

## 1. MCP server (orquestador)
Config global: `~/.gemini/config/mcp_config.json` (mergeado automático). Server "anmax" con 6 tools.

**Sprint 25 (recomendado):**
1. `bash scripts/xdd-mcp-install-global.sh` (wrapper en ~/.local/bin)
2. `bash scripts/xdd-adapt.sh antigravity --dest=<proyecto>`
3. Refresh panel MCP. Server arranca en workspace activo dinámicamente.

## 2. Skills (`.agents/skills/` plural — convención Antigravity)
6 X-DD skills copiadas a `.agents/skills/`. Antigravity las detecta automático.
NOTA: Antigravity usa `.agents/` (plural), OpenCode usa `.agent/` (singular).

## Uso
Invoca `xdd_invoke_workflow` name="xdd" desde Cascade. NO escribas /anmax (no es slash).
