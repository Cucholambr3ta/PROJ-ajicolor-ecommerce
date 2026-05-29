---
name: xdd-talk-compact
description: Compresión de output del orquestador X-DD. Inspirado en caveman (juliusbrussee/caveman, MIT). 3 niveles. Ahorro de tokens ~50-75% manteniendo precisión técnica.
origin: x-dd
inspired_by: juliusbrussee/caveman (MIT, atribución en NOTICE)
when_to_use: Usar cuando el usuario pide brevedad explícita ("compact mode", "short", "be brief"), cuando el contexto se acerca al límite, o cuando XDD_OUTPUT_COMPACT env var está set. Auto-trigger si XDD_OUTPUT_COMPACT=ultra|standard|lite.
---

# xdd-talk-compact

Skill X-DD propia inspirada en caveman para reducir tokens de output del orquestador
sin sacrificar precisión técnica.

## Activación

```bash
# Sesión
export XDD_OUTPUT_COMPACT=standard   # lite | standard | ultra
# Por petición
"talk compact" / "be brief" / "compact mode"
# Stop
"normal mode" / unset XDD_OUTPUT_COMPACT
```

## Niveles

### `lite` (~30% reducción)
- Drop filler ("just", "really", "basically", "actually")
- Drop pleasantries ("sure", "happy to", "of course")
- Drop hedging ("might be", "perhaps", "I think")
- Mantiene artículos + estructura gramatical completa
- Tono profesional pero tight

**Ejemplo:**
- Normal: "Sure! The issue is basically that you're really just creating a new object on each render, which is probably causing the re-render."
- lite: "The issue: you create a new object each render, causing the re-render."

### `standard` (~60% reducción) — default
- Drop artículos (a, an, the) cuando posible
- Fragmentos OK
- Sinónimos cortos (big > extensive, fix > implement solution for)
- Mantiene términos técnicos exactos + code blocks intactos

**Ejemplo:**
- Normal: "The reason your React component is re-rendering is because you're creating a new object reference each render cycle. Wrap it in useMemo."
- standard: "New object ref each render = re-render. Wrap in `useMemo`."

### `ultra` (~75% reducción)
- Abrevia palabras prosa (DB, auth, config, req, res, fn, impl)
- Strip conjunciones
- Flechas para causalidad (X → Y)
- Una palabra cuando una palabra basta
- **NUNCA abrevia**: nombres de funciones, APIs, error strings, code symbols

**Ejemplo:**
- Normal: "The reason your React component is re-rendering is because you're creating a new object reference each render cycle."
- ultra: "Inline obj prop → new ref → re-render. `useMemo`."

## Auto-Clarity (cuándo NO comprimir)

Aunque modo compact esté activo, expandir cuando:
1. **Security warnings** — riesgo de malinterpretación
2. **Confirmaciones de acción irreversible** (rm -rf, force push, drop table)
3. **Multi-step sequences** donde el orden importa y sin conjunciones es ambiguo
4. **Errores quoted** — preservar exact
5. **User pide clarificar** o repite la pregunta

Reanudar compact después.

## Boundaries

- **Code blocks, commit messages, PRs:** escribir normal (no comprimir)
- **Tests assertions:** normal (claridad sobre lo testeado)
- **ADRs, NOTICE, LICENSE:** normal (documentos legales/arquitectónicos)
- **Output al usuario:** comprimir según nivel

## Combinación con persona del orquestador (Sprint 13)

| persona × compact | technical | friendly | casual | formal |
|---|---|---|---|---|
| **standard** | default | accesible | informal | corporativo |
| **lite** | sin filler | + emojis ok | menos formal | profesional concentrado |
| **ultra** | telegraphic | shortcuts | caveman | conciso ejecutivo |

## Benchmark (Sprint 10 eval-harness)

| Nivel | Reducción tokens | Accuracy técnica |
|---|---|---|
| lite | ~30% | 100% |
| standard | ~60% | 100% |
| ultra | ~75% | 100% (con auto-clarity activo) |

Validado por `xdd-eval` con grader `token_count_reduction >= threshold`.

## Atribución

Conceptos inspirados en caveman (juliusbrussee/caveman, MIT, 65k stars).
NO se copió código verbatim — implementación propia. Ver `NOTICE`.

Diferencias clave:
- caveman = skill global para Claude Code/Cursor/etc; X-DD = integrado al orquestador
- caveman: 4 niveles (lite/full/ultra/wenyan); X-DD: 3 (lite/standard/ultra) — wenyan diferido
- caveman: instalación npm/curl; X-DD: bundleado en skills/
