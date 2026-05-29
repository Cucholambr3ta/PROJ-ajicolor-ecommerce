---
name: agent-eval
description: Eval-harness para skills/agents/workflows X-DD. 4 grader types (structural, behavioral, output_match, pass_at_k). Suite por skill con cases.jsonl + grader.yaml.
origin: x-dd
when_to_use: Antes de promover skill via /evolve, antes de release, en CI tras cambios a skills/. Trigger: /eval, "run evals", "test skill X".
---

# agent-eval

Eval-harness propio de X-DD. Valida que skills/agents/workflows produzcan
output esperado bajo criterios objetivos.

## Estructura

```
evals/
  <skill-or-workflow-name>/
    cases.jsonl       # 1 línea por caso: {"input": "...", "expected": "..."}
    grader.yaml       # tipo de grader + threshold
    reports/          # auto-generado por xdd-eval run
```

## Grader types

| Tipo | Cuándo usar | Pasa si |
|------|-------------|---------|
| `structural` | output debe matchear regex / JSON Schema | regex/schema valida |
| `behavioral` | output debe contener X palabras/conceptos | sustring/keyword present |
| `output_match` | exact match (idempotencia) | output == expected |
| `pass_at_k` | k corridas, threshold de % pasa | ≥ threshold pasa |
| `token_count_reduction` | output comprimido vs baseline | reducción ≥ % |

## grader.yaml ejemplo

```yaml
type: token_count_reduction
baseline_input_field: input
baseline_output_field: baseline
test_output_field: compact
threshold_pct: 50            # reducción mínima esperada
ignore_code_blocks: true     # no contar tokens dentro de ```...```
```

## Uso

```bash
# Run eval para skill específica
python3 scripts/xdd-eval.py run --suite=xdd-talk-compact

# Run todas
python3 scripts/xdd-eval.py run --all

# CI gate (exit 1 si alguna eval falla)
python3 scripts/xdd-eval.py run --all --ci

# Report
cat evals/xdd-talk-compact/reports/latest.json
```

## Filosofía

Eval-harness aplica el principio TDD al desarrollo de skills/agents:
**eval primero, skill después**. Skill que no pasa eval, no se mergea.

Sprint 9 (`/evolve`) propone skills automáticamente; Sprint 10 (este eval-harness)
valida que las propuestas mantengan calidad. Combina con AgentShield (Sprint 12)
para audit estático + dinámico.

## Atribución
Concepto inspirado en ECC `agent-eval` skill (MIT). Implementación propia X-DD.
