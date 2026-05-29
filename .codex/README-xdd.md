# X-DD / anmax en Codex

Codex consume skills desde `~/.codex/skills/` (GLOBAL, no project-local).

Skill orchestrator instalada: `~/.codex/skills/anmax-orchestrator/`

## Uso
```
/anmax <tu objetivo>          # invoca orchestrator
/anmax list agents engineering # lista specialists
/anmax validate spec          # gate validation
```

Codex carga la skill leyendo `name` + `description` del frontmatter — no necesita slash command registry.
