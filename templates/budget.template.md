# BUDGET.md — Presupuesto Cloud y Gobierno FinOps

> Producido por `/finops-baseline`. Revisado mensualmente.

## 1. Presupuesto mensual
| Categoría | Cap mensual (USD) | Real mes actual | Tendencia | Owner |
|-----------|-------------------|------------------|-----------|-------|
| Compute (VMs / serverless) | | | | |
| Storage (objetos, BD) | | | | |
| Egress / CDN | | | | |
| Observabilidad (logs, métricas, APM) | | | | |
| IA / LLMs (tokens, embeddings) | | | | |
| Terceros (auth, email, payments) | | | | |
| **Total** | | | | |

## 2. Alertas configuradas
- 50% del cap → notificación informativa
- 80% del cap → warning + revisión
- 100% del cap → escalamiento + freeze de gasto no esencial

<!-- CONFIGURAR: Stack cloud. Opciones de alertas:                        -->
<!--  - AWS: Budgets + Cost Anomaly Detection                              -->
<!--  - GCP: Billing alerts + Recommender                                  -->
<!--  - Azure: Cost Management + Advisor                                   -->
<!--  - Multi-cloud: Vantage, CloudHealth, Infracost                       -->

## 3. Tagging obligatorio
Todo recurso cloud debe tener:
- `env` (prod | staging | dev)
- `service` (nombre del servicio dueño)
- `owner` (equipo o persona)
- `cost-center` (centro contable)

CI rechaza Terraform sin estos tags.

## 4. Rightsizing checklist (revisión mensual)
- [ ] VMs sobreaprovisionadas (uso CPU < 20% sostenido 30d)
- [ ] Storage no accedido > 90 días → mover a tier frío
- [ ] Snapshots / backups vencidos sin retención justificada
- [ ] Recursos sin tags (huérfanos)
- [ ] Reservas / savings plans expiradas o sub-utilizadas
- [ ] Egress entre regiones evitable

## 5. Cuotas de IA
| Modelo / endpoint | Cap diario tokens | Cap mensual USD | Owner |
|-------------------|--------------------|------------------|-------|
| Claude Opus | | | |
| Embeddings | | | |

## 6. Log de optimizaciones
| Fecha | Acción | Ahorro estimado (USD/mes) |
|-------|--------|---------------------------|
