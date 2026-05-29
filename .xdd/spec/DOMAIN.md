# DOMAIN.md — Ajicolor

> Modelo de dominio DDD táctico para Ajicolor, tienda de ropa musical con estética toon-pop.
> Propietario único: toda operación recae en una sola persona.

---

## 1. Lenguaje Ubicuo

| Término | Definición |
|---|---|
| **Pedido** | Solicitud de compra de uno o más ítems, gestionada vía WhatsApp (canal primario) o formulario web. |
| **Drop** | Lanzamiento limitado de un diseño. Cada drop tiene fecha, cantidad de unidades, precio y variantes habilitadas. |
| **Producto** | Diseño base (ej. "Bass Line Anthem Tee"). Es el esqueleto conceptual. |
| **Variante** | Combinación concreta de talle y color de un producto. Ej: "Bass Line Anthem / M / Negro". |
| **Lote de producción** | Orden de fabricación a un proveedor textil por N unidades de una o más variantes. |
| **Stock** | Cantidad disponible de una variante. Se decrementa al confirmar pedido, se incrementa al recibir lote. |
| **Envío** | Despacho físico de un pedido completado. Incluye tracking y costo. |
| **Cliente** | Comprador con historial de pedidos y perfil de contacto. |
| **Backstage Pass** | Membresía/suscripción recurrente que da acceso anticipado a drops y descuentos. |
| **Producción** | Proceso de fabricación desde la orden al proveedor hasta la recepción del lote. |
| **Catálogo** | Colección de productos activos (en drops actuales o próximos). |
| **KPI** | Métrica de negocio (ingresos, margen, tasa de conversión, rotación de stock). |
| **Drop Calendar** | Cronograma editorial de lanzamientos futuros. |

---

## 2. Entidades y Value Objects

### 2.1 Entidades (identidad única, mutables)

| Entidad | Atributos clave | Notas |
|---|---|---|
| `Cliente` | id, nombre, email, teléfono, dirección, backstagePass, fechaRegistro, totalGastado, pedidos[] | Crece con cada compra. |
| `Pedido` | id, clienteId, items[], total, estado (Pendiente/Confirmado/EnProduccion/Enviado/Entregado/Cancelado), canal (WhatsApp/Web), fechaCreacion, fechaEnvio, notas | Raíz del agregado Pedidos. |
| `Producto` | id, nombreSlug, descripción, diseñoUrl, artista, temporada, drops[] | Catálogo base. |
| `Drop` | id, productoId, nombreDrop, fechaLanzamiento, fechaCierre, precioBase, variantes[], estado (Borrador/Activo/Agotado/Cerrado) | Unidad de lanzamiento. |
| `LoteProduccion` | id, proveedorId, variantes[], unidadesPorVariante, costoTotal, fechaPedido, fechaEstimadaRecepcion, fechaRecepcionReal, estado (Solicitado/EnProceso/Recibido/RechazadoParcial) | Agregado Producción. |
| `Envio` | id, pedidoId, trackingNumber, transportista, costo, fechaDespacho, fechaEstimadaEntrega, fechaEntregaReal, estado (Preparando/Despachado/EnTransito/Entregado/Devuelto) | Agregado Envíos. |
| `Proveedor` | id, nombre, contacto, plazoLeadTime, costoBase, calificacion | Pocos, estables. |
| `Usuario` | id, email, passwordHash, rol (Propietario) | Un solo registro. |

### 2.2 Value Objects (inmutables, por atributos)

| Value Object | Atributos | Pertenece a |
|---|---|---|
| `Variante` | talle, color, sku | Producto, LoteProduccion |
| `Direccion` | calle, ciudad, region, codigoPostal, pais | Cliente, Envio |
| `Dinero` | monto, moneda (CLP) | Pedido, LoteProduccion |
| `TrackingInfo` | numero, url, transportista | Envio |
| `MetricaKPI` | nombre, valor, periodo, variacion | Tablero |
| `ItemPedido` | variante, cantidad, precioUnitario | Pedido |
| `FechaDrop` | fecha, hora, tipo (Lanzamiento/Cierre) | Drop |

---

## 3. Agregados

### 3.1 Agregado Pedido

```
Raíz: Pedido
Boundary: Pedido, ItemsPedido (VO), HistorialEstado (VO)
Invariantes:
  - ItemsPedido no puede estar vacío.
  - Total debe coincidir con suma de items.
  - Estado sigue workflow: Pendiente → Confirmado → EnProducción → Enviado → Entregado.
  - No se puede modificar un pedido en estado Enviado o Entregado.
```

### 3.2 Agregado Producción

```
Raíz: LoteProduccion
Boundary: LoteProduccion, ItemsLote (VO), Proveedor (referencia)
Invariantes:
  - Unidades totales ≥ 10 (mínimo de producción).
  - Costo total debe estar aprobado por el propietario.
  - No se puede recibir un lote sin factura.
```

### 3.3 Agregado Catálogo

```
Raíz: Producto
Boundary: Producto, Drop, Variante[] (VO)
Invariantes:
  - Un producto puede tener múltiples drops, pero no dos activos simultáneamente.
  - Un drop activo debe tener al menos una variante con stock > 0.
```

### 3.4 Agregado Stock

```
Raíz: StockUnit (por variante)
Boundary: StockUnit, MovimientoStock (VO)
Invariantes:
  - Stock nunca puede ser negativo.
  - Cada decremento debe corresponder a un pedido confirmado.
  - Se debe alertar cuando stock ≤ stockMinimo (definido por variante).
```

### 3.5 Agregado Cliente

```
Raíz: Cliente
Boundary: Cliente, Direccion[] (VO), BackstagePass (VO)
Invariantes:
  - Email debe ser único.
  - BackstagePass requiere pago recurrente activo.
```

### 3.6 Agregado Envío

```
Raíz: Envio
Boundary: Envio, TrackingInfo (VO), HistorialEnvio (VO)
Invariantes:
  - Un pedido tiene exactamente un envío.
  - Envío no puede realizarse sin dirección confirmada.
```

---

## 4. Eventos de Dominio

| Evento | Origen | Descripción | Datos clave |
|---|---|---|---|
| `PedidoCreado` | Agregado Pedido | Se registró un nuevo pedido por WhatsApp o web | pedidoId, clienteId, total, items |
| `PedidoConfirmado` | Agregado Pedido | Propietario confirmó disponibilidad y precio | pedidoId, fechaConfirmacion |
| `PedidoCancelado` | Agregado Pedido | Cliente o propietario canceló | pedidoId, razon |
| `ProduccionIniciada` | Agregado Producción | Se emitió orden a proveedor | loteId, proveedor, variantes[], costo |
| `LoteRecibido` | Agregado Producción | Lote ingresó a inventario | loteId, variantes[], unidades, costoReal |
| `StockActualizado` | Agregado Stock | Movimiento de stock registrado | varianteSku, cantidad, tipoMovimiento |
| `StockAgotado` | Agregado Stock | Stock de variante llega a 0 | varianteSku, productoId, dropId |
| `StockMinimoAlertado` | Agregado Stock | Stock por debajo del umbral | varianteSku, stockActual, stockMinimo |
| `EnvioPreparado` | Agregado Envío | Pedido listo para despachar | pedidoId, envioId |
| `EnvioDespachado` | Agregado Envío | Paquete en poder del transportista | envioId, trackingNumber, transportista |
| `EnvioEntregado` | Agregado Envío | Cliente recibió | envioId, fechaEntrega |
| `DropLanzado` | Agregado Catálogo | Nuevo drop publicado | dropId, productoId, precio, fecha |
| `DropAgotado` | Agregado Catálogo | Todas las variantes de un drop sin stock | dropId |
| `BackstagePassActivado` | Agregado Cliente | Cliente adquirió membresía | clienteId, tipo, fechaExpiracion |

---

## 5. Comandos

| Comando | Origen | Descripción |
|---|---|---|
| `CrearPedido(clienteId, items, canal)` | UI Admin / Webhook WhatsApp | Registra nuevo pedido |
| `ConfirmarPedido(pedidoId)` | UI Admin | Confirma disponibilidad y precio |
| `CancelarPedido(pedidoId, razon)` | UI Admin | Cancela pedido |
| `IniciarProduccion(variantes[], unidades, proveedorId)` | UI Admin | Ordena lote al proveedor |
| `RecibirLote(loteId, costoReal)` | UI Admin | Recepciona lote en stock |
| `ActualizarStock(varianteSku, cantidad, tipo)` | Interno / UI Admin | Ajuste manual de stock |
| `DespacharEnvio(pedidoId, transportista, trackingNumber)` | UI Admin | Marca pedido como enviado |
| `ActualizarEnvio(envioId, estado)` | Interno / UI Admin | Actualiza tracking |
| `CrearProducto(nombre, descripcion, diseno)` | UI Admin | Nuevo producto en catálogo |
| `LanzarDrop(productoId, precioBase, fecha, variantes)` | UI Admin | Programa y activa drop |
| `RegistrarCliente(nombre, email, telefono)` | UI Admin / Web | Alta de cliente |
| `ActivarBackstagePass(clienteId, tipo)` | UI Admin | Activa membresía |
| `CalcularKPIs(periodo)` | Interno | Recálculo de métricas |

---

## 6. Bounded Contexts

| Bounded Context | Responsabilidad | Agregados | Eventos que publica | Eventos que consume | Relación con otros BC |
|---|---|---|---|---|---|
| **Catálogo** | Gestión de productos, drops y variantes. | Producto | DropLanzado, DropAgotado | — | Catálogo → Pedidos (drop activo), Catálogo → Stock (variantes) |
| **Pedidos** | Ciclo de vida del pedido: creación, confirmación, cancelación. | Pedido | PedidoCreado, PedidoConfirmado, PedidoCancelado | DropLanzado (precios), StockActualizado (confirmación) | Pedidos → Stock (decremento), Pedidos → Envíos (despacho), Pedidos → Producción (si sin stock) |
| **Producción** | Ordenes a proveedores textiles, recepción de lotes. | LoteProduccion | ProduccionIniciada, LoteRecibido | PedidoConfirmado (trigger), StockMinimoAlertado (trigger) | Producción → Stock (incremento al recibir), Producción → Finanzas (costos) |
| **Stock** | Inventario por variante, movimientos, alertas de mínimo. | StockUnit | StockActualizado, StockAgotado, StockMinimoAlertado | LoteRecibido (incremento), PedidoConfirmado (decremento) | Stock → Catálogo (disponibilidad de drop), Stock → Dashboard (alertas) |
| **Envíos** | Despacho, tracking, confirmación de entrega. | Envio | EnvioPreparado, EnvioDespachado, EnvioEntregado | PedidoConfirmado (trigger) | Envíos → Pedidos (actualiza estado), Envíos → Dashboard (KPI logístico) |
| **Clientes** | Perfil, historial, membresías. | Cliente | BackstagePassActivado | PedidoCreado (historial) | Clientes → Pedidos (referencia), Clientes → Dashboard (métricas) |
| **Métricas** | Cálculo de KPIs, reporting, dashboard. | — (Sistema de reportes) | — | Todos los eventos | Consume todos los BC para proyecciones |

---

## 7. Reglas de Negocio

### 7.1 Catálogo
- **RN-CAT-01:** Un producto no puede tener dos drops activos simultáneamente.
- **RN-CAT-02:** Un drop debe tener al menos una variante habilitada.
- **RN-CAT-03:** El precio de un drop no puede modificarse una vez lanzado (solo en drops nuevos).

### 7.2 Pedidos
- **RN-PED-01:** Un pedido solo puede confirmarse si todas sus variantes tienen stock ≥ cantidad solicitada.
- **RN-PED-02:** El estado de un pedido no puede retroceder (ej. de Enviado a Confirmado).
- **RN-PED-03:** Un pedido cancelado libera el stock reservado.
- **RN-PED-04:** Todo pedido requiere dirección de envío válida antes de pasar a EnProducción.

### 7.3 Producción
- **RN-PROD-01:** El lote mínimo de producción es 10 unidades por variante.
- **RN-PROD-02:** Lead time estándar: 15 días hábiles desde orden hasta recepción.
- **RN-PROD-03:** No se puede iniciar producción si el costo supera el presupuesto mensual definido por propietario.
- **RN-PROD-04:** Cada lote debe asociarse a un proveedor registrado.

### 7.4 Stock
- **RN-STK-01:** El stock de una variante nunca puede ser negativo.
- **RN-STK-02:** Cada variante tiene un stock mínimo configurable (default: 5 unidades). Al alcanzarlo se dispara alerta.
- **RN-STK-03:** Los movimientos de stock deben tener trazabilidad: origen (pedido, lote, ajuste).

### 7.5 Envíos
- **RN-ENV-01:** Un pedido no puede despacharse sin estado Confirmado y producción completada.
- **RN-ENV-02:** El costo de envío se calcula según destino (RM / Regiones) y peso del paquete.

### 7.6 Clientes
- **RN-CL-01:** Email de cliente debe ser único en el sistema.
- **RN-CL-02:** Backstage Pass expira a los 30 días si no se renueva.

### 7.7 Generales
- **RN-GEN-01:** Solo el propietario (rol único) puede ejecutar cualquier comando. No hay roles diferenciados.
- **RN-GEN-02:** Toda operación de escritura debe ser posible sin conexión a internet (vía PWA y localStorage como buffer).

---

## 8. Diagrama de Contexto (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTAL ADMIN (SPA)                       │
│              Propietario → Dashboard Único                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│  │ KPI  │ │Pedidos│ │ Prod │ │Stock │ │Envíos│ │Client│ │Catál ││
│  │Cards │ │Table │ │Orders│ │Grid  │ │Track │ │List  │ │Mgr   ││
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘│
└─────┼────────┼────────┼────────┼────────┼────────┼────────┼──────┘
      │        │        │        │        │        │        │
      ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CORE DOMAIN (Backend/API)                     │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  CATÁLOGO   │  │   PEDIDOS    │  │     PRODUCCIÓN       │   │
│  │  BC         │──│   BC         │──│     BC               │   │
│  │ Producto    │  │ Pedido       │  │ LoteProduccion       │   │
│  │ Drop        │  │ ItemPedido   │  │ Proveedor            │   │
│  │ Variante    │  │              │  │                      │   │
│  └─────────────┘  └──────┬───────┘  └──────────┬───────────┘   │
│                          │                     │               │
│  ┌─────────────┐  ┌──────▼───────┐  ┌──────────▼───────────┐   │
│  │   STOCK     │◄─│   CLIENTES   │  │      ENVÍOS          │   │
│  │   BC        │  │   BC         │  │      BC              │   │
│  │ StockUnit   │  │ Cliente      │  │ Envio               │   │
│  │ Movimiento  │  │ BackPass     │  │ TrackingInfo        │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │                    MÉTRICAS BC                           │   │
│  │  Proyecciones: ventas diarias, drops activos, stock     │   │
│  │  bajo, rotación, ingresos vs meta.                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EVENT BUS (eventos de dominio)              │   │
│  │  PedidoCreado │ LoteRecibido │ StockAgotado │ Envio...  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA EXTERNA                       │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ WhatsApp    │  │ Proveedores  │  │ Transportistas       │   │
│  │ API (canal  │  │ Textiles     │  │ Chilexpress / Starken│   │
│  │ de pedidos) │  │ (3-4 fijos)  │  │                      │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐                              │
│  │ Stripe/Culqi│  │ Storage S3   │                              │
│  │ Pagos       │  │ Diseños      │                              │
│  └─────────────┘  └──────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Flujo Transversal (Pedido típico)

```
WhatsApp ──→ CrearPedido ──→ PedidoCreado ──→ [UI Admin] ──→ ConfirmarPedido
                                                                    │
                                                                    ▼
                                                            Stock ≥ cantidad?
                                                             ├── Sí: decremento stock
                                                             │     PedidoConfirmado
                                                             │         │
                                                             ├── No: IniciarProduccion
                                                             │     ProduccionIniciada
                                                             │     LoteRecibido (días después)
                                                             │     StockActualizado (+)
                                                             │     → ConfirmarPedido
                                                             │
                                                             ▼
                                                    EnvioPreparado ──→ DespacharEnvio
                                                                         │
                                                                         ▼
                                                                 EnvioDespachado
                                                                         │
                                                                         ▼
                                                                 EnvioEntregado
                                                                         │
                                                                         ▼
                                                                Pedido → Entregado
```

---

## 10. Consideraciones Técnicas

- **Single-tenant:** Toda la data pertenece a un solo propietario. No hay multi-cliente.
- **Offline-first:** El propietario opera desde ferias, conciertos, eventos con conectividad intermitente. El frontend admin debe soportar operaciones offline con sincronización diferida.
- **Auditoría simple:** Como no hay múltiples operadores, la auditoría se reduce a log de eventos de dominio con timestamp. No se requiere trailing de usuario.
- **Notificaciones:** Solo salientes y solo al propietario (sonido/local push al recibir pedido, alerta de stock bajo).
