# prompts/agents/security/ — Agentes de Seguridad X-DD

Esta categoría agrupa los agentes dedicados a la postura de seguridad del proyecto, alineados con los pilares **SecDD**, **STDD** y **Threat-Driven** del pipeline X-DD.

## Agentes locales en este directorio
- [`shannon-secops-expert.md`](./shannon-secops-expert.md) — SecOps avanzado (Shannon framework). Red team agéntico, pentest, hardening.

## Agentes con foco en seguridad ubicados en otras categorías

Por razones históricas de catalogación, varios agentes con responsabilidades de seguridad viven bajo `engineering/`. El orquestador `/xdd` puede invocarlos directamente desde su ubicación actual:

| Agente | Ubicación | Rol |
|--------|-----------|-----|
| Security Engineer | [`../engineering/engineering-security-engineer.md`](../engineering/engineering-security-engineer.md) | SAST/DAST, hardening de infraestructura, secret scanning |
| Threat Detection Engineer | [`../engineering/engineering-threat-detection-engineer.md`](../engineering/engineering-threat-detection-engineer.md) | Modelado STRIDE, detección, SIEM |
| Incident Response Commander | [`../engineering/engineering-incident-response-commander.md`](../engineering/engineering-incident-response-commander.md) | Respuesta a incidentes, post-mortems |
| Code Reviewer | [`../engineering/engineering-code-reviewer.md`](../engineering/engineering-code-reviewer.md) | Revisión de código con foco en vulnerabilidades OWASP |

## Cuándo invocar cada uno

| Escenario | Agente |
|-----------|--------|
| Fase 2 — modelado de amenazas (STRIDE → `THREATS.md`) | Threat Detection Engineer |
| Fase 4 — security tests primero (STDD) | Security Engineer |
| Fase 5 — auditoría SAST + DAST + secrets | Security Engineer + Code Reviewer |
| Demanda — Red Team ofensivo, pentest | Shannon SecOps Expert |
| Incidente en producción | Incident Response Commander |

> **Roadmap:** consolidar todos los agentes con foco de seguridad bajo `security/` en una revisión futura, manteniendo retrocompatibilidad vía symlinks o re-exports.
