# THREATS.md — Ajicolor

> Análisis STRIDE para el sistema admin de propietario único.
> Perfil de riesgo: **Bajo** (1 usuario, control total, sin datos de terceros sensibles).

---

## Contexto de Seguridad

- **Único usuario:** El propietario es la única persona con acceso al sistema.
- **Sin roles:** No hay operadores, empleados ni clientes con acceso admin.
- **Sin PII sensible:** Los datos de clientes se limitan a nombre, email, teléfono, dirección de envío.
- **Sin pagos almacenados:** Los pagos se procesan por proveedor externo (Stripe/Culqi). El sistema no almacena PAN ni CVV.
- **Canales:** Interfaz web admin (SPA) + webhook de WhatsApp.

---

## 1. Spoofing (Suplantación de Identidad)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Ataque de fuerza bruta al login del admin | Alto — el atacante obtiene control total | Baja | Rate limiting + 2FA (TOTP) + bloqueo tras 5 intentos |
| Suplantación del webhook de WhatsApp | Medio — pedidos falsos pueden crearse | Baja | Validación de firma HMAC en payload entrante |
| Reutilización de sesión (token JWT robado) | Alto — acceso admin completo | Media | Tokens de corta duración (15 min) + refresh token rotado + HTTP-only cookies |

**Riesgo global Spoofing: BAJO** con 2FA habilitado.

---

## 2. Tampering (Manipulación de Datos)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Manipulación de stock vía request malicioso | Alto — pérdida económica, ventas imposibles | Baja | Validación server-side de toda operación; invariantes de dominio (stock ≥ 0) |
| Modificación de precios en pedidos confirmados | Alto — márgenes alterados | Baja | Inmutabilidad de pedidos confirmados; precio congelado al crear pedido |
| Alteración de estado de envío | Medio — confusión operativa | Baja | Workflow de estado con máquina de estados; transiciones validas definidas en domain events |

**Riesgo global Tampering: BAJO** — single user limita vectores internos; el riesgo principal es externo.

---

## 3. Repudiation (No Repudio)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Propietario niega haber realizado una acción (ej. cancelar pedido) | Medio — sin auditoría es palabra contra palabra | Baja — no hay terceros | Event sourcing de dominio: cada comando genera un domain event firmado con timestamp y almacenado inmutablemente |
| Cliente niega haber realizado un pedido | Bajo — el pedido se confirma manualmente por WhatsApp | Media | Captura de conversación WhatsApp como evidencia; historial de eventos del pedido |

**Riesgo global Repudiation: BAJO** — event log suficiente para single-tenant.

---

## 4. Information Disclosure (Divulgación de Información)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Exposición de datos de clientes (email, teléfono, dirección) | Medio — datos personales de clientes | Baja | HTTPS obligatorio; acceso admin protegido por 2FA; no exponer datos en URLs |
| Exposición de API keys (Stripe, WhatsApp API) | Crítico — pérdida financiera + suplantación | Baja | Environment variables; .env nunca en repo; secret manager |
| Exposición de diseños de productos (propiedad intelectual) | Medio — diseños exclusivos filtrados | Baja | Autenticación para endpoints de assets; URLs prefirmadas S3 con expiración |

**Riesgo global Information Disclosure: BAJO** — sin multi-tenant, el principal vector es el propio dispositivo del propietario.

---

## 5. Denial of Service (Denegación de Servicio)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| Ataque DoS al endpoint de webhook WhatsApp | Alto — no se reciben pedidos | Baja | Rate limiting por IP; WAF en proxy reverso (Cloudflare) |
| Bloqueo de cuenta por múltiples intentos fallidos | Alto — propietario sin acceso | Baja | Mecanismo de recuperación por email; whitelist de IPs |
| Abuso de almacenamiento local offline | Bajo — datos corruptos en localStorage | Media | Cuota de almacenamiento; validación al sincronizar |

**Riesgo global DoS: BAJO** — sin exposición masiva, el riesgo es principalmente para la disponibilidad del webhook.

---

## 6. Elevation of Privilege (Elevación de Privilegios)

| Amenaza | Impacto | Probabilidad | Mitigación |
|---|---|---|---|
| No aplica — no hay niveles de privilegio | — | — | Sistema de un solo rol (propietario). No hay usuarios con permisos restringidos que escalar. |
| Si se introduce multi-tenant en el futuro | Crítico | Nula hoy | Arquitectura actual no lo contempla. ADR requerido si se agrega. |

**Riesgo global Elevation of Privilege: NULO** — single-role system.

---

## Resumen de Riesgo General

| Categoría | Riesgo | Observación |
|---|---|---|
| Spoofing | BAJO | Mitigado con 2FA + rate limiting |
| Tampering | BAJO | Invariantes de dominio protegen datos críticos |
| Repudiation | BAJO | Event sourcing cubre trazabilidad |
| Information Disclosure | BAJO | Sin multi-tenant ni datos financieros almacenados |
| Denial of Service | BAJO | Webhook es el único vector externo sensible |
| Elevation of Privilege | NULO | Single-role; sin privilegios que escalar |
| **General** | **BAJO** | **El mayor riesgo es físico: perder el dispositivo del propietario o sus credenciales.** |

---

## Recomendaciones Prioritarias

1. **2FA obligatorio** (TOTP vía Google Authenticator / Authy).
2. **Rate limiting** en login y endpoints de webhook.
3. **Secret management** — todas las claves API en variables de entorno, .env excluido de git.
4. **Backup cifrado** diario de la base de datos (incluyendo event store).
5. **Conexión HTTPS** estricta con HSTS.
6. **Política de sesión:** timeout de inactividad a 30 minutos.
