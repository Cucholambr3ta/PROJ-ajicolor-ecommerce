# DR_PLAN.md — Plan de Recuperación ante Desastres

> Producido por `/dr-drill`. Probado al menos cada 6 meses.

## 1. Objetivos
- **RTO** (Recovery Time Objective): _____ horas
- **RPO** (Recovery Point Objective): _____ minutos de datos máximos perdidos
- **Servicios críticos en alcance:**

## 2. Escenarios cubiertos
- [ ] Caída de región cloud completa
- [ ] Corrupción de datos en BD primaria
- [ ] Ransomware / borrado malicioso
- [ ] Pérdida de cuenta del proveedor cloud
- [ ] Fallo de despliegue con regresión crítica

## 3. Backups
| Recurso | Frecuencia | Retención | Ubicación | Encriptación | Restauración probada |
|---------|------------|-----------|-----------|--------------|----------------------|
| BD prod | <CONFIGURAR> | 30d | <CONFIGURAR: bucket cross-region> | AES-256 | YYYY-MM-DD |
| Object storage | | | | | |
| Secrets | | | | | |

## 4. Procedimiento de restauración
Paso a paso, con comandos exactos, ejecutable bajo presión.

```bash
# 1. Confirmar alcance del incidente
# 2. ...
```

## 5. Comunicación durante DR
- **Status page:** <CONFIGURAR: URL>
- **Plantilla de comunicación interna:**
- **Plantilla externa (clientes):**

## 6. Roles durante DR
- Incident Commander:
- Comms Lead:
- Ops Lead:
- Scribe:

## 7. Drill log
| Fecha | Escenario | RTO real | RPO real | Resultado | Hallazgos |
|-------|-----------|----------|----------|-----------|-----------|

## 8. Mejoras pendientes
- [ ] ...
