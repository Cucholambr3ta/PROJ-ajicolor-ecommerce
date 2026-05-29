---
name: xdd-ai-review
description: AI-powered pre-commit code review. Provider-agnostic (claude/openai/local), invocado por hook pre-commit o manualmente.
origin: x-dd
inspired_by: gentleman-guardian-angel (provider-agnostic)
category: quality-gate
when_to_use:
  - Pre-commit hook automático (block commit si crit findings)
  - Manualmente antes de PR: `xdd-skill-invoke xdd-ai-review`
  - CI gate post-merge optional
triggers:
  - pre-commit
  - "/ai-review"
  - "review my diff with AI"
---

# xdd-ai-review — AI pre-commit review

## Propósito
Review automatizada de diffs antes del commit. Pasa por:
1. Lint estático (ya cubierto por pre-commit existente)
2. **Análisis AI** del diff (este skill)
3. Block si findings CRÍTICAS detectadas

## Configuración

`xdd.config.yml` sección `ai_review`:

```yaml
ai_review:
  enabled: true
  provider: "claude"      # claude | openai | local | none
  model: "claude-haiku-4-5"
  block_on_severity: "high"   # crit | high | medium | low | none
  prompt_template: ".xdd/ai-review-prompt.md"  # override opcional
  exclusions:
    - "*.md"
    - "*.lock"
    - "package-lock.json"
```

## Providers soportados

| Provider | Setup | Notas |
|---|---|---|
| `claude` | `ANTHROPIC_API_KEY` env var | Default. Haiku rápido + barato. |
| `openai` | `OPENAI_API_KEY` env var | gpt-4o-mini default. |
| `local` | Ollama corriendo localmente | Privacy-first, sin egress. |
| `none` | — | Skip AI review (skill no-op) |

## Flujo

1. Hook pre-commit invoca este skill con el diff staged como input.
2. Skill construye prompt usando `.xdd/ai-review-prompt.md` (o default embedded).
3. Provider client envía prompt al modelo. Parsea respuesta JSON estructurada:
   ```json
   {"findings": [
     {"severity": "high", "file": "src/auth.ts", "line": 42,
      "issue": "Race condition...", "suggestion": "Use mutex..."}
   ]}
   ```
4. Si alguna finding ≥ `block_on_severity` → exit 1 (bloquea commit con --no-verify excepción).
5. Reporte impreso al stderr + log `.xdd/ai-review-<timestamp>.json`.

## Default prompt template

```
You are reviewing this git diff for a {{language}} project.
Find:
- Security bugs (injection, auth bypass, secret leaks)
- Race conditions
- Resource leaks (unclosed handles, dangling promises)
- Performance regressions
- Wrong error handling
- Test coverage gaps

Output ONLY a JSON object: {"findings": [...]}. No prose.
Severity: crit | high | medium | low
Each finding: {severity, file, line, issue, suggestion}.
Empty array if clean.

DIFF:
{{diff}}
```

## Boundaries

- **No bloquea --no-verify explícito del developer** (override consciente).
- **No envía secrets:** pre-procesa diff removiendo strings que matchean patrones de `.gitleaks.toml`.
- **No envía archivos enteros:** solo el diff staged.
- **Costo:** ~$0.001 por review típico con Haiku (1k-3k tokens).

## Referencias
- [ADR-0015 AI pre-commit review](../../docs/adr/0015-ai-pre-commit-review.md)
- gentleman-guardian-angel (inspiración, repo público)
