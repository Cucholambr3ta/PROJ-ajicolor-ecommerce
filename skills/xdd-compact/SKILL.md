---
name: xdd-compact
description: Provider-agnostic context compaction. Reduce tokens preservando semántica.
origin: x-dd
inspired_by: LLMLingua-2 + Claude Compaction API + ByteRover Active Compression
category: context-engineering
when_to_use:
  - Pre-LLM call si context exceede 80% del budget (warning del Sprint 19)
  - Pre-handoff entre agents en composition_patterns
  - Post-PR diff resumen para review AI
triggers:
  - "/compact"
  - "compact context"
  - "reduce tokens"
  - XDD_AUTO_COMPACT
---

# xdd-compact — Context compaction

## Propósito
Reducir tokens del context preservando semantic content. Provider-agnostic: usa LLMLingua-2 si instalado, Claude Compaction API si Claude provider, fallback truncation simple.

## Configuración

`xdd.config.yml` sección `compaction`:
```yaml
compaction:
  default_method: auto      # auto | llmlingua | claude_api | truncate | none
  target_reduction: 0.50    # 50% reducción target
  preserve_markers: ["```", "// IMPORTANT", "TODO", "FIXME"]
  llmlingua_model: "microsoft/llmlingua-2-xlm-roberta-large-meetingbank"
```

## Métodos

### `llmlingua`
LLMLingua-2 (MIT): compresión semantic-preserving ~20x con encoder distilado.
**Setup:** `pip install llmlingua` (instalación opcional).
**Costo:** 0 (modelo local, no LLM call).
**Reducción típica:** 50-90%.

### `claude_api`
Anthropic Prompt Compaction (API feature). Server-side summarization.
**Setup:** `ANTHROPIC_API_KEY` env var.
**Costo:** $ (1 LLM call adicional per compaction).
**Reducción típica:** 40-70%.

### `truncate`
Fallback simple: trunca middle-out (preserva primeras N + últimas M lines).
**Costo:** 0.
**Reducción típica:** configurable (default 50%).
**Limitación:** pierde context middle (acceptable para logs/traces).

### `auto`
Decide automáticamente: `llmlingua` si disponible → `claude_api` si Claude provider → `truncate` fallback.

## Boundaries

- **NO compactes:**
  - Code blocks (`````) — preserve_markers default
  - Strings con secrets (pre-process: gitleaks redaction antes de compact)
  - Schemas (JSON Schema, OpenAPI) — perder fields = perder semantic
  - Test outputs estructurados
- **SÍ compacta:**
  - Prose en docs
  - Logs verbose
  - Trace events repetitivos
  - LLM thinking-text (chain-of-thought verbose)

## Output expected

JSON con:
```json
{
  "method_used": "llmlingua",
  "original_tokens": 12000,
  "compacted_tokens": 4800,
  "reduction": 0.60,
  "preserved_markers": 23,
  "warnings": []
}
```

## Eval

Skill incluye eval suite en `evals/xdd-compact/`:
- Grader `token_count_reduction` (ya existe Sprint 10)
- Grader `semantic_preservation` (cosine similarity con baseline)
- Pass criteria: reduction ≥ 40% + semantic_score ≥ 0.85

## Referencias
- [ADR-0024 Compaction skill provider-agnostic](../../docs/adr/0024-compaction-skill.md)
- LLMLingua: https://github.com/microsoft/LLMLingua
- Claude Compaction: https://docs.anthropic.com (prompt caching docs)
- ByteRover: research paper (Active Context Compression)
