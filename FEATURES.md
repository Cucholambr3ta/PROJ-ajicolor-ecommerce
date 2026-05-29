# FEATURES.md — Ajicolor E-commerce

> Catálogo FDD del admin panel. Cada feature con ID, nombre, descripción, prioridad, bounded context y dependencias.

---

## Infraestructura

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F01 | Setup proyecto | Inicializar Next.js 14+ con App Router, TypeScript, Tailwind CSS, shadcn/ui | P0 | Infraestructura | — |
| F02 | Prisma + SQLite | Configurar schema Prisma con todas las entidades, migraciones, seed data | P0 | Infraestructura | F01 |
| F03 | Layout admin | Sidebar con navegación + header con usuario y búsqueda global | P0 | Infraestructura | F01 |
| F04 | Validación Zod | Schemas Zod para todas las API routes y Server Actions | P0 | Infraestructura | F01 |

## Autenticación

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F05 | Login con credenciales | NextAuth.js v5 Credentials Provider, email + password, JWT 30 min | P0 | Auth | F01, F02 |
| F06 | 2FA TOTP | Autenticación de dos factores con Google Authenticator / Authy | P1 | Auth | F05 |
| F07 | Middleware de protección | Redirigir rutas `/admin/*` no autenticadas a `/login` | P0 | Auth | F05 |

## Dashboard

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F08 | KPI Cards | Tarjetas con ventas del día, pedidos pendientes, stock bajo, drops activos | P0 | Métricas | F03 |
| F09 | Gráfico de ventas | Chart de ventas de los últimos 30 días | P1 | Métricas | F08 |
| F10 | Panel de alertas | Alertas de stock ≤ mínimo, pedidos sin confirmar, envíos atrasados | P0 | Métricas | F08 |
| F11 | Acciones rápidas | Botones para crear pedido y registrar cliente desde dashboard | P0 | Métricas | F03 |

## Pedidos

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F12 | Lista de pedidos | Tabla con filtros (estado, canal, fechas), columnas ID/cliente/total/estado/fecha | P0 | Pedidos | F03, F04 |
| F13 | Detalle de pedido | Vista completa: info cliente, items, historial de estados, botones de acción | P0 | Pedidos | F12 |
| F14 | Confirmar pedido | Server Action: validar stock, decrementar, cambiar estado a Confirmado | P0 | Pedidos | F13, F30 |
| F15 | Cancelar pedido | Server Action: liberar stock reservado, cambiar estado a Cancelado | P0 | Pedidos | F13 |
| F16 | Workflow de estados | Transiciones: Pendiente → Confirmado → EnProducción → Enviado → Entregado | P0 | Pedidos | F14, F15 |

## Producción

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F17 | Lista de lotes | Tabla con filtros (estado, proveedor, fechas), columnas ID/proveedor/unidades/costo/estado | P1 | Producción | F03, F04 |
| F18 | Detalle de lote | Info proveedor, variantes, costo, timeline, botones recibir/rechazar | P1 | Producción | F17 |
| F19 | Iniciar producción | Server Action: crear lote con estado Solicitado, validar mínimo 10 unidades | P1 | Producción | F18 |
| F20 | Recibir lote | Server Action: actualizar stock, cambiar estado a Recibido | P1 | Producción | F18, F30 |
| F21 | Gestión de proveedores | CRUD de proveedores (nombre, contacto, lead time, costo base, calificación) | P1 | Producción | F03 |

## Stock

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F22 | Grid de stock | Vista de tabla agrupada por producto/drop, colores por estado (verde/amarillo/rojo) | P0 | Stock | F03, F04 |
| F23 | Ajuste manual | Incremento/decremento de stock con validación stock ≥ 0 | P0 | Stock | F22 |
| F24 | Historial de movimientos | Log de movimientos por variante (origen, cantidad, tipo, fecha) | P1 | Stock | F22 |

## Envíos

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F25 | Lista de envíos | Tabla con filtros (estado, transportista, fechas), columnas ID/pedido/tracking/estado | P1 | Envíos | F03, F04 |
| F26 | Detalle de envío | Info pedido, tracking (número, URL, transportista), timeline de estados | P1 | Envíos | F25 |
| F27 | Despachar envío | Server Action: crear envío con tracking, cambiar estado del pedido a Enviado | P1 | Envíos | F26, F16 |
| F28 | Actualizar envío | Server Action: actualizar estado del envío (Preparando → EnTransito → Entregado) | P1 | Envíos | F26 |

## Clientes

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F29 | Lista de clientes | Tabla con búsqueda (nombre/email), columnas ID/nombre/email/pedidos/total/backstage | P1 | Clientes | F03, F04 |
| F30 | Detalle de cliente | Info personal, historial de pedidos, total gastado, ticket promedio | P1 | Clientes | F29 |
| F31 | Gestión BackstagePass | Activar/desactivar membresía con expiración a 30 días | P2 | Clientes | F30 |
| F32 | Registrar cliente | Server Action: crear cliente con validación email único | P1 | Clientes | F04 |

## Catálogo

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F33 | Lista de productos | Tabla con filtros (temporada, artista), columnas ID/nombre/artista/temporada/drops | P1 | Catálogo | F03, F04 |
| F34 | Detalle de producto | Info producto, imagen del diseño, lista de drops asociados | P1 | Catálogo | F33 |
| F35 | Crear producto | Server Action: nombre, descripción, diseño URL, artista, temporada | P1 | Catálogo | F34 |
| F36 | Lista de drops | Tabla con filtros (estado, producto, fechas), columnas ID/producto/precio/estado/fecha | P1 | Catálogo | F03, F04 |
| F37 | Detalle de drop | Info drop, variantes habilitadas, stock actual, botones activar/cerrar | P1 | Catálogo | F36 |
| F38 | Lanzar drop | Server Action: crear drop, validar no tener otro activo simultáneamente | P1 | Catálogo | F37, F22 |

## Métricas

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F39 | API de métricas | Endpoint `/api/metrics` con KPIs por período | P2 | Métricas | F08 |
| F40 | Reportes avanzados | Métricas de envíos (tiempo entrega, costo promedio), rotación de stock | P2 | Métricas | F39 |
| F41 | Exportar datos | Exportar pedidos, stock, clientes a CSV/Excel | P2 | Métricas | F39 |

## Integraciones

| ID | Feature | Descripción | Prioridad | Bounded Context | Dependencias |
|----|---------|-------------|-----------|-----------------|--------------|
| F42 | Webhook WhatsApp | Recibir pedidos desde Meta Cloud API con validación HMAC-SHA256 | P1 | Pedidos | F04, F16 |
| F43 | Upload de imágenes | Vercel Blob o S3 para diseños de productos | P1 | Catálogo | F01 |

---

**Total: 43 features**

| Prioridad | Cantidad |
|-----------|----------|
| P0 | 16 |
| P1 | 22 |
| P2 | 5 |

---

*FEATURES.md — v1.0 — Ajicolor E-commerce*
