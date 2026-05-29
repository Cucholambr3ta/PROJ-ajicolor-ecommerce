# PLAN.md — Ajicolor E-commerce

> Plan de sprints con features agrupadas. 5 sprints, 10 semanas.

---

## Sprint 1: Fundamentos (Semanas 1-2)

> Scaffolding, autenticación y dashboard básico.

| ID | Feature | Bounded Context | Dependencias |
|----|---------|-----------------|--------------|
| F01 | Setup proyecto (Next.js, TS, Tailwind, shadcn/ui) | Infraestructura | — |
| F02 | Prisma + SQLite (schema, migraciones, seed) | Infraestructura | F01 |
| F03 | Layout admin (sidebar + header) | Infraestructura | F01 |
| F04 | Validación Zod (schemas para todas las operaciones) | Infraestructura | F01 |
| F05 | Login con credenciales (NextAuth.js v5) | Auth | F01, F02 |
| F07 | Middleware de protección de rutas `/admin/*` | Auth | F05 |
| F08 | KPI Cards (ventas día, pedidos pendientes, stock bajo, drops activos) | Métricas | F03 |
| F10 | Panel de alertas (stock bajo, pedidos sin confirmar, envíos atrasados) | Métricas | F08 |
| F11 | Acciones rápidas (crear pedido, registrar cliente) | Métricas | F03 |

**Entregable:** Admin autenticado con dashboard funcional mostrando KPIs estáticos.

---

## Sprint 2: Pedidos y Producción (Semanas 3-4)

> Ciclo de vida completo de pedidos y lotes de producción.

| ID | Feature | Bounded Context | Dependencias |
|----|---------|-----------------|--------------|
| F12 | Lista de pedidos (tabla + filtros) | Pedidos | F03, F04 |
| F13 | Detalle de pedido (info cliente, items, historial) | Pedidos | F12 |
| F14 | Confirmar pedido (validar stock, decrementar) | Pedidos | F13, F30 |
| F15 | Cancelar pedido (liberar stock) | Pedidos | F13 |
| F16 | Workflow de estados (Pendiente → Confirmado → EnProducción → Enviado → Entregado) | Pedidos | F14, F15 |
| F17 | Lista de lotes de producción (tabla + filtros) | Producción | F03, F04 |
| F18 | Detalle de lote (proveedor, variantes, costo, timeline) | Producción | F17 |
| F19 | Iniciar producción (crear lote, mínimo 10 unidades) | Producción | F18 |
| F20 | Recibir lote (actualizar stock, cambiar estado) | Producción | F18, F30 |
| F21 | Gestión de proveedores (CRUD) | Producción | F03 |

**Entregable:** Pedidos se crean, confirman, cancelan. Lotes de producción se gestionan de inicio a fin.

---

## Sprint 3: Stock y Envíos (Semanas 5-6)

> Control de inventario y logística de despacho.

| ID | Feature | Bounded Context | Dependencias |
|----|---------|-----------------|--------------|
| F22 | Grid de stock (tabla agrupada, colores por estado) | Stock | F03, F04 |
| F23 | Ajuste manual de stock (incremento/decremento) | Stock | F22 |
| F24 | Historial de movimientos por variante | Stock | F22 |
| F25 | Lista de envíos (tabla + filtros) | Envíos | F03, F04 |
| F26 | Detalle de envío (tracking, timeline) | Envíos | F25 |
| F27 | Despachar envío (crear envío con tracking) | Envíos | F26, F16 |
| F28 | Actualizar estado de envío | Envíos | F26 |

**Entregable:** Stock visible y ajustable. Envíos se despachan y trackean.

---

## Sprint 4: Catálogo y Clientes (Semanas 7-8)

> Gestión de productos, drops y perfiles de clientes.

| ID | Feature | Bounded Context | Dependencias |
|----|---------|-----------------|--------------|
| F33 | Lista de productos (tabla + filtros) | Catálogo | F03, F04 |
| F34 | Detalle de producto (info, diseño, drops asociados) | Catálogo | F33 |
| F35 | Crear producto (nombre, descripción, diseño, artista, temporada) | Catálogo | F34 |
| F36 | Lista de drops (tabla + filtros) | Catálogo | F03, F04 |
| F37 | Detalle de drop (variantes, stock, botones activar/cerrar) | Catálogo | F36 |
| F38 | Lanzar drop (validar un drop activo por producto) | Catálogo | F37, F22 |
| F29 | Lista de clientes (tabla + búsqueda) | Clientes | F03, F04 |
| F30 | Detalle de cliente (perfil, historial, total gastado) | Clientes | F29 |
| F32 | Registrar cliente (validación email único) | Clientes | F04 |
| F42 | Webhook WhatsApp (recibir pedidos, validación HMAC) | Pedidos | F04, F16 |
| F43 | Upload de imágenes (Vercel Blob / S3) | Catálogo | F01 |

**Entregable:** Catálogo completo con productos y drops. Clientes registrados. Pedidos entrantes vía WhatsApp.

---

## Sprint 5: Métricas y Polish (Semanas 9-10)

> Reporting, optimización y preparación para producción.

| ID | Feature | Bounded Context | Dependencias |
|----|---------|-----------------|--------------|
| F06 | 2FA TOTP (Google Authenticator / Authy) | Auth | F05 |
| F09 | Gráfico de ventas últimos 30 días | Métricas | F08 |
| F21 | Gestión de proveedores (CRUD completo) | Producción | F03 |
| F31 | Gestión BackstagePass (activar/desactivar, expiración 30 días) | Clientes | F30 |
| F39 | API de métricas (`/api/metrics`) | Métricas | F08 |
| F40 | Reportes avanzados (envíos, rotación stock) | Métricas | F39 |
| F41 | Exportar datos (CSV/Excel) | Métricas | F39 |

**Entregable:** Dashboard con gráficos. 2FA activo. Reportes exportables. BackstagePass funcional. Listo para deploy.

---

## Resumen

| Sprint | Semanas | Features | Focus |
|--------|---------|----------|-------|
| 1 | 1-2 | 9 | Scaffolding + Auth + Dashboard |
| 2 | 3-4 | 10 | Pedidos + Producción |
| 3 | 5-6 | 7 | Stock + Envíos |
| 4 | 7-8 | 11 | Catálogo + Clientes + WhatsApp |
| 5 | 9-10 | 7 | Métricas + Polish + Deploy |
| **Total** | **10** | **44** | — |

> Nota: F05 (Login) aparece en Sprint 1 y F06 (2FA) en Sprint 5 como polish. F21 (Proveedores) aparece en Sprint 2 como referencia y se completa en Sprint 5.

---

*PLAN.md — v1.0 — Ajicolor E-commerce*
