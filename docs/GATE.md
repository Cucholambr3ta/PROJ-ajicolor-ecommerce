# Gate Keeper — `xdd-gate.py`

> Guardián programático del pipeline X-DD con firma **HMAC-SHA256**.
> Implementa [ADR-0006](adr/0006-gate-keeper-firma-hmac.md). Disponible desde Sprint 4 (v0.1.0).

## Por qué existe

Sin firma criptográfica, `"APROBADO"` escrito en un archivo es trivialmente editable
por cualquier humano o agente con acceso al repo. Eso convierte el gate en convención,
no en control.

Con firma HMAC-SHA256 sobre `(phase, sorted_checksums, approver, timestamp_utc)` usando
una clave secreta local en `.xdd/.gate-key` (gitignored), cualquier alteración manual de
artefactos, status, checksums o aprobadores **invalida la firma** y `xdd-gate.py validate`
lo detecta.

## Setup inicial

```bash
# Una sola vez por proyecto. Genera .xdd/.gate-key (256 bits, gitignored).
python3 scripts/xdd-gate.py init
```

Hace falta tener `.xdd/` creado (lo hace `xdd-init.sh` o se crea al ejecutar el primer
workflow de Briefing).

## Comandos

| Comando | Qué hace | Exit code |
|---------|----------|-----------|
| `init` | Genera `.gate-key` si no existe (idempotente) | 0 |
| `validate --phase X` | Valida estado + checksums + firma de una fase | 0 OK / 1 fail |
| `transition --phase X --to Y` | Comprueba que `X→Y` es secuencial y `X` está APROBADO | 0 OK / 1 bloqueado |
| `approve --phase X --approver NAME` | Marca `X` como APROBADO, captura checksums, firma | 0 OK / 1 falta artefacto / 2 falta key/approver |
| `status` | Resumen de las 6 fases (humano o `--json`) | 0 |

Todos los comandos aceptan `--json` para salida machine-readable y `--project-root PATH`
para apuntar a otro proyecto.

## Flujo típico de uso

```bash
export XDD_APPROVER="aplacencia"

# 1. Producir artefactos de la fase con workflows X-DD
/fase-requisitos    # genera SPEC.md, FEATURES.md

# 2. Aprobar la fase
python3 scripts/xdd-gate.py approve --phase briefing
# → ✓ APROBADO por aplacencia (timestamp), firma HMAC-SHA256 ...

# 3. Antes de empezar la siguiente fase, valida transición
python3 scripts/xdd-gate.py transition --phase briefing --to spec
# → ✓ transición permitida.

# 4. Si alguien edita SPEC.md tras la aprobación, validate lo detecta
echo "tampered" >> .xdd/briefing/SPEC.md
python3 scripts/xdd-gate.py validate --phase briefing
# → ✗ briefing: FALLA
#    - Checksum mismatch en .xdd/briefing/SPEC.md: stored=abc… current=def…
```

## Artefactos en `.xdd/<fase>/`

| Archivo | Propósito | Commiteable | Origen |
|---------|-----------|-------------|--------|
| `<documentos>.md` | Artefactos de la fase | ✅ | Workflows X-DD |
| `.status` | `PENDIENTE` / `EN_REVIEW` / `APROBADO` / `RECHAZADO` | ✅ | `approve` lo escribe |
| `.checksums` | SHA-256 (16 hex) por artefacto, snapshot al aprobar | ✅ | `approve` |
| `.approvers` | `name / timestamp_iso` por línea, append-only | ✅ | `approve` |
| `.signature` | HMAC-SHA256 hex del payload canónico | ✅ | `approve` |
| `.gate-key` (raíz `.xdd/`) | Clave HMAC 256-bit | ❌ gitignored | `init` (`secrets.token_bytes(32)`) |

Política completa en [ADR-0009](adr/0009-politica-versionado-xdd-directorio.md).

## Integración en workflows

Todos los workflows en `.agent/workflows/` siguen este patrón:

```markdown
## Pre-condición (gate)
\`\`\`bash
python3 scripts/xdd-gate.py transition --phase <fase_actual> --to <fase_destino>
\`\`\`
Si exit != 0, **detener ejecución** y reportar al usuario.

## Ejecución
... [pasos del workflow] ...

## Post-condición
\`\`\`bash
python3 scripts/xdd-gate.py validate --phase <fase_destino>
\`\`\`
```

Esto se introduce gradualmente — Sprint 4 lo aplica al gate keeper en sí; sprints
posteriores propagan a workflows críticos (Sprint 7 cierra cobertura).

## Rotación de la clave

Si `.gate-key` se compromete (filtración accidental), hay que rotar:

```bash
# 1. Backup defensivo
cp .xdd/.gate-key ~/safe/xdd-gate-key.bak.$(date +%s)

# 2. Eliminar la actual
rm .xdd/.gate-key

# 3. Re-generar
python3 scripts/xdd-gate.py init

# 4. Re-aprobar TODAS las fases ya aprobadas (sus firmas viejas son inválidas)
export XDD_APPROVER="aplacencia"
for phase in briefing spec plan build qa retro; do
  test -d .xdd/$phase && python3 scripts/xdd-gate.py approve --phase $phase
done

# 5. Documentar la rotación en docs/CHANGELOG.md (sección Security)
```

## Modelo de amenazas

Las amenazas que el gate keeper mitiga están detalladas en
[.xdd/spec/THREATS.md](../.xdd/spec/THREATS.md) sección T1-T3 (Spoofing, Tampering,
Repudiation) y vector V4 (gate sin firma criptográfica).

## Limitaciones conocidas

- **Clave única por proyecto.** No hay rotación gradual ni multi-key. Aceptable para
  v0.1.0; revisitar si se pide colaboración multi-máquina automatizada (V2.0).
- **No es firma GPG.** Ofrece integridad, no autenticación de identidad pública (un
  atacante con la clave puede firmar como cualquier approver). GPG en commits es
  complemento recomendado en Sprint 8.
- **Sin auditoría externa de rotaciones.** Si `.gate-key` cambia, las firmas previas
  fallan pero no hay registro automático del evento — documentar manualmente en
  CHANGELOG.

## Tests

Suite completa en [tests/test_gate.py](../tests/test_gate.py) — 17 casos cubriendo
init idempotente, approve con/sin key/approver, validate detecta tampering en
artefactos/firmas/keys, transition secuencial vs no-secuencial.

```bash
python3 -m pytest tests/test_gate.py -v
```
