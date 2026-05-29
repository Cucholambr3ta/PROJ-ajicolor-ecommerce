---
name: xdd-fs-context
description: Filesystem-paradigm context curation. Treat large data as files mounted by agents.
origin: x-dd
inspired_by: Mirage MCP, OpenViking (ByteDance), Azure SRE Agent Case Study, Token Savior
category: context-engineering
when_to_use:
  - Cuando data fuente exceede 50k tokens (logs, datasets, codebases)
  - Tasks que necesitan referencias por path en vez de contenido inline
  - Workflows que iteran sobre N items independientes
triggers:
  - "/fs-context"
  - "mount as filesystem"
  - "treat as files"
---

# xdd-fs-context — Filesystem-paradigm context curation

## Propósito
En vez de cargar 50k tokens en context, exponer la data como **filesystem mountado**. Agent navega con `ls/cat/grep` lazy-loading solo lo necesario.

## Pattern

### Sin xdd-fs-context (anti-pattern)
```
Context window: 50k tokens
- 30k = logs verbose
- 15k = datos auxiliares
- 5k = system prompt
→ poco room para reasoning
```

### Con xdd-fs-context
```
Context window: 5k tokens
- system prompt + tools/list
+ filesystem mounted: /data/logs/ /data/cases/
→ agent invoca ls /data/logs y solo lee files relevantes
→ 90%+ reducción
```

## Implementación

3 modos:

### Modo 1: `local-fs` (default, zero-deps)
Data como tree de archivos en `.xdd/context/<workflow-name>/`. Agent usa tools standard (Read, Glob, Grep).

```bash
# Setup
mkdir -p .xdd/context/checkout-feature/
cp logs/*.log .xdd/context/checkout-feature/logs/
echo "## Cases\n..." > .xdd/context/checkout-feature/cases.md
```

Workflow markdown referencia el dir, no el contenido:
```yaml
inputs:
  - context_dir: .xdd/context/checkout-feature/
```

### Modo 2: `mcp-fs` (vía Mirage o similar)
MCP server que expone external systems (S3, Gmail, GitHub) como filesystem. X-DD no bundle, declara intent en `xdd.config.yml`:

```yaml
fs_context:
  mcp_provider: mirage   # mirage | custom | none
  mounts:
    - source: s3://bucket/logs
      mount: /logs
    - source: gmail://label/orders
      mount: /orders
```

### Modo 3: `code-as-tool` (~98% reduction)
En vez de N tool calls separadas, agent ejecuta UN Python/Bash que orquesta N calls + retorna summary. Pattern documentado en `.agent/workflows/code-as-tool.md`.

## Boundaries

- **NO usar para:**
  - Data que requiere todo el contexto inline para reasoning (e.g., short prompts)
  - Operaciones single-shot sobre archivo único
  - Secrets (filesystem puede ser leak vector — preferir env vars)
- **SÍ usar para:**
  - Codebases grandes (>10 archivos)
  - Logs / traces / metrics dumps
  - Datasets de N casos iterables
  - Repos N microservices

## Eval

Mide reducción de tokens del workflow input via `xdd-context estimate` antes/después.

## Referencias
- [ADR-0023 Context budget policy](../../docs/adr/0023-context-budget-policy.md)
- [ADR-0024 Compaction skill provider-agnostic](../../docs/adr/0024-compaction-skill.md)
- Mirage MCP: https://mirage.dev (referencia, no dep)
- Azure SRE Agent Case Study: filesystem-based context outperformed specialized tools
- Token Savior MCP: 77% token reduction symbol-indexed nav
