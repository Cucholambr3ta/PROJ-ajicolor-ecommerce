# Runbook: <Servicio / Operación>

- **Sistema:**
- **Severidad típica:** SEV-1 | SEV-2 | SEV-3
- **Owner on-call:**
- **Última prueba:** YYYY-MM-DD

## Síntomas / Trigger
Cómo se manifiesta (alerta concreta, mensaje de error, métrica fuera de rango).

## Impacto
Quiénes lo notan, qué dejan de poder hacer, SLO afectado.

## Diagnóstico (primeros 5 minutos)
1. Comprobar dashboard X
2. Revisar log Y con query Z
3. Confirmar versión desplegada

## Mitigación inmediata
Pasos numerados, idempotentes, con comandos exactos:
```bash
# 1. ...
# 2. ...
```

## Verificación
Cómo confirmar que la mitigación funcionó (qué métrica volver a verde).

## Rollback
Si la mitigación falla, cómo revertir sin empeorar el estado.

## Escalamiento
- Nivel 1: <persona / rol>
- Nivel 2: <persona / rol>

## Post-mortem (después)
- Causa raíz:
- Por qué pasó:
- Cambios para prevenir:
- Lección a [[lecciones]]
