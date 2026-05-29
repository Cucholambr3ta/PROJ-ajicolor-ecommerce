# PRIVACY.md — Inventario PII y Bases Legales

> Producido por `/privacy-review`. Cumple GDPR Art. 30 (Records of Processing).

## 1. Datos personales tratados

| Categoría | Campo | Fuente | Sensible? | Base legal | Retención | Sub-procesador |
|-----------|-------|--------|-----------|------------|-----------|----------------|
| Identificación | email | signup form | No | Consentimiento | 24m | <CONFIGURAR: ESP> |
|                | nombre |             |    |                |     |                  |
| Comportamiento | sesión | analytics | No | Interés legítimo | 13m | <CONFIGURAR: CDP> |

## 2. Bases legales (GDPR Art. 6)
- [ ] Consentimiento (con UI de opt-in)
- [ ] Ejecución de contrato
- [ ] Obligación legal
- [ ] Interés vital
- [ ] Interés público
- [ ] Interés legítimo (con LIA documentada)

## 3. Derechos del titular (cómo se atienden)
- **Acceso (DSAR):** runbook `/runbooks/dsar-access.md`, SLA 30d
- **Rectificación:** UI en `/settings/profile`
- **Borrado:** endpoint `DELETE /users/me`, runbook `/runbooks/dsar-delete.md`
- **Portabilidad:** export JSON desde `/settings/data-export`
- **Oposición:** opt-out en `/settings/privacy`

## 4. Transferencias internacionales
- País destino | Mecanismo (SCC, adequacy, BCR) | Sub-procesador |

## 5. Brechas de seguridad
- Procedimiento de notificación (72h autoridad / sin demora a afectados)
- Plantilla de comunicación en `/runbooks/breach-notify.md`

## 6. Auditoría
- **Última revisión:** YYYY-MM-DD
- **Próxima revisión:** YYYY-MM-DD (cada 6 meses o tras cambio sustancial)
