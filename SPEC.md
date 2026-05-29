# SPEC.md — Ajicolor E-commerce

> Especificación técnica del sistema admin para Ajicolor.
> Propietario único: todas las operaciones son gestionadas por una sola persona.

---

## 1. Visión Técnica

| Componente | Tecnología | Justificación |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components, Server Actions, API Routes en un solo runtime. SEO-friendly para catálogo público futuro. |
| **UI** | Tailwind CSS + shadcn/ui | Componentes accesibles, customizables, sin dependencias pesadas. |
| **ORM** | Prisma | Type-safety, migraciones declarativas, excelente DX con Next.js. |
| **Base de datos** | SQLite (Producción: Vercel Postgres o Turso) | Single-tenant, low-traffic, operación offline. SQLite embebido para dev; Turso (SQLite distribuido) para Vercel. |
| **Auth** | NextAuth.js v5 | Integración nativa con App Router, soporte credentials + 2FA TOTP. |
| **Deploy** | Vercel | Deploy automático desde Git, edge functions, variables de entorno seguras. |
| **Almacenamiento** | Vercel Blob o S3 | Diseños de productos, imágenes de catálogo. |
| **Pagos** | Stripe / Culqi | Procesamiento externo. No se almacena PAN/CVV. |
| **WhatsApp** | Meta Cloud API (webhook) | Canal primario de pedidos. Validación HMAC en entradas. |

**Stack adicional:**
- **TypeScript** en todo el proyecto (frontend + backend).
- **Zod** para validación de schemas en API routes y Server Actions.
- **React Hook Form** + Zod para formularios admin.
- **date-fns** para manejo de fechas (CLT timezone).

---

## 2. Arquitectura

### 2.1 Patrón: App Router + Server Components + Server Actions

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                    │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Dashboard  │  │   Pedidos   │  │  Producción │     │
│  │  (SC + SA)  │  │  (SC + SA)  │  │  (SC + SA)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 NEXT.JS APP ROUTER                       │
│                                                         │
│  Server Components ←→ Server Actions ←→ Prisma Client   │
│         │                   │                │          │
│         ▼                   ▼                ▼          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   /admin    │  │    /api     │  │   Prisma    │     │
│  │   Routes    │  │   Routes    │  │   Schema    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (SQLite/Turso)                │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Productos  │  │   Pedidos   │  │   Stock     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Estructura de Directorios

```
ajicolor-ecommerce/
├── app/
│   ├── (auth)/                    # Rutas públicas (login)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (admin)/                   # Rutas protegidas (admin)
│   │   ├── layout.tsx             # Layout con sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── pedidos/
│   │   │   ├── page.tsx           # Lista de pedidos
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Detalle de pedido
│   │   ├── produccion/
│   │   │   ├── page.tsx           # Lotes de producción
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Detalle de lote
│   │   ├── stock/
│   │   │   └── page.tsx           # Grid de stock
│   │   ├── envios/
│   │   │   ├── page.tsx           # Lista de envíos
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Tracking
│   │   ├── clientes/
│   │   │   ├── page.tsx           # Lista de clientes
│   │   │   └── [id]/
│   │   │       └── page.tsx       # Perfil de cliente
│   │   └── catalogo/
│   │       ├── page.tsx           # Lista de productos
│   │       ├── [id]/
│   │       │   └── page.tsx       # Detalle de producto
│   │       └── drops/
│   │           ├── page.tsx       # Lista de drops
│   │           └── [id]/
│   │               └── page.tsx   # Detalle de drop
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   └── whatsapp/
│   │   │       └── route.ts
│   │   ├── pedidos/
│   │   │   ├── route.ts           # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts       # GET, PUT, DELETE
│   │   ├── produccion/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── stock/
│   │   │   └── route.ts
│   │   ├── envios/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── clientes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── catalogo/
│   │   │   ├── productos/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── drops/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── metrics/
│   │       └── route.ts
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page (futuro)
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── admin/                     # Admin-specific components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── dashboard/
│   │   ├── pedidos/
│   │   ├── produccion/
│   │   ├── stock/
│   │   ├── envios/
│   │   ├── clientes/
│   │   └── catalogo/
│   └── shared/                    # Shared components
├── lib/
│   ├── prisma.ts                  # Prisma client singleton
│   ├── auth.ts                    # NextAuth config
│   ├── validations/               # Zod schemas
│   │   ├── pedido.ts
│   │   ├── produccion.ts
│   │   ├── stock.ts
│   │   ├── envio.ts
│   │   ├── cliente.ts
│   │   └── catalogo.ts
│   └── utils.ts                   # Utility functions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Seed data
├── types/
│   └── index.ts                   # Shared types
├── public/
│   └── assets/                    # Static assets
├── .env.local                     # Environment variables
├── .env.example                   # Example env
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 3. Bounded Contexts → Rutas Next.js

| Bounded Context | Rutas Admin | API Routes | Server Actions |
|---|---|---|---|
| **Catálogo** | `/admin/catalogo/*` | `/api/catalogo/productos/*`, `/api/catalogo/drops/*` | `crearProducto`, `lanzarDrop`, `actualizarDrop` |
| **Pedidos** | `/admin/pedidos/*` | `/api/pedidos/*` | `crearPedido`, `confirmarPedido`, `cancelarPedido` |
| **Producción** | `/admin/produccion/*` | `/api/produccion/*` | `iniciarProduccion`, `recibirLote` |
| **Stock** | `/admin/stock` | `/api/stock` | `actualizarStock` |
| **Envíos** | `/admin/envios/*` | `/api/envios/*` | `despacharEnvio`, `actualizarEnvio` |
| **Clientes** | `/admin/clientes/*` | `/api/clientes/*` | `registrarCliente`, `activarBackstagePass` |
| **Métricas** | `/admin/dashboard` | `/api/metrics` | `calcularKPIs` |

### Mapeo de Eventos de Dominio a Server Actions

| Evento | Server Action | Bounded Context |
|---|---|---|
| `PedidoCreado` | `crearPedido()` | Pedidos |
| `PedidoConfirmado` | `confirmarPedido()` | Pedidos |
| `PedidoCancelado` | `cancelarPedido()` | Pedidos |
| `ProduccionIniciada` | `iniciarProduccion()` | Producción |
| `LoteRecibido` | `recibirLote()` | Producción |
| `StockActualizado` | `actualizarStock()` | Stock |
| `EnvioPreparado` | `despacharEnvio()` | Envíos |
| `EnvioDespachado` | `actualizarEnvio()` | Envíos |
| `DropLanzado` | `lanzarDrop()` | Catálogo |

---

## 4. Modelo de Datos (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Usuario {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  rol           String   @default("Propietario")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Cliente {
  id            String   @id @default(cuid())
  nombre        String
  email         String   @unique
  telefono      String
  direccion     String   // JSON serializado (calle, ciudad, region, codigoPostal, pais)
  backstagePass Boolean  @default(false)
  fechaRegistro DateTime @default(now())
  totalGastado  Decimal  @default(0) @db.Decimal(10, 2)
  pedidos       Pedido[]
}

model Pedido {
  id            String   @id @default(cuid())
  clienteId     String
  cliente       Cliente  @relation(fields: [clienteId], references: [id])
  items         String   // JSON serializado: ItemPedido[]
  total         Decimal  @db.Decimal(10, 2)
  estado        String   @default("Pendiente") // Pendiente/Confirmado/EnProduccion/Enviado/Entregado/Cancelado
  canal         String   // WhatsApp/Web
  fechaCreacion DateTime @default(now())
  fechaEnvio    DateTime?
  notas         String?
  envio         Envio?
}

model Producto {
  id          String   @id @default(cuid())
  nombreSlug  String   @unique
  descripcion String
  diseñoUrl   String
  artista     String
  temporada   String
  drops       Drop[]
}

model Drop {
  id                String   @id @default(cuid())
  productoId        String
  producto          Producto @relation(fields: [productoId], references: [id])
  nombreDrop        String
  fechaLanzamiento  DateTime
  fechaCierre       DateTime
  precioBase        Decimal  @db.Decimal(10, 2)
  variantes         String   // JSON serializado: Variante[]
  estado            String   @default("Borrador") // Borrador/Activo/Agotado/Cerrado
  createdAt         DateTime @default(now())
}

model LoteProduccion {
  id                     String   @id @default(cuid())
  proveedorId            String
  proveedor              Proveedor @relation(fields: [proveedorId], references: [id])
  variantes              String   // JSON serializado: Variante[]
  unidadesPorVariante    String   // JSON serializado
  costoTotal             Decimal  @db.Decimal(10, 2)
  fechaPedido            DateTime @default(now())
  fechaEstimadaRecepcion DateTime
  fechaRecepcionReal     DateTime?
  estado                 String   @default("Solicitado") // Solicitado/EnProceso/Recibido/RechazadoParcial
}

model Proveedor {
  id            String   @id @default(cuid())
  nombre        String
  contacto      String
  plazoLeadTime Int      // días hábiles
  costoBase     Decimal  @db.Decimal(10, 2)
  calificacion  Int      // 1-5
  lotes         LoteProduccion[]
}

model Envio {
  id                    String   @id @default(cuid())
  pedidoId              String   @unique
  pedido                Pedido   @relation(fields: [pedidoId], references: [id])
  trackingNumber        String?
  transportista         String?
  costo                 Decimal? @db.Decimal(10, 2)
  fechaDespacho         DateTime?
  fechaEstimadaEntrega  DateTime?
  fechaEntregaReal      DateTime?
  estado                String   @default("Preparando") // Preparando/Despachado/EnTransito/Entregado/Devuelto
}

model StockUnit {
  id            String   @id @default(cuid())
  varianteSku   String   @unique
  productoId    String
  dropId        String
  cantidad      Int      @default(0)
  stockMinimo   Int      @default(5)
  movimientos   String   @default("[]") // JSON serializado: MovimientoStock[]
  updatedAt     DateTime @updatedAt
}
```

### Value Objects Serializados (JSON en campos String)

| Value Object | Estructura JSON | Modelo |
|---|---|---|
| `Variante` | `{ talle: string, color: string, sku: string }` | Drop, LoteProduccion |
| `Direccion` | `{ calle: string, ciudad: string, region: string, codigoPostal: string, pais: string }` | Cliente |
| `Dinero` | `{ monto: number, moneda: "CLP" }` | Pedido, LoteProduccion |
| `ItemPedido` | `{ variante: Variante, cantidad: number, precioUnitario: number }` | Pedido |
| `MovimientoStock` | `{ cantidad: number, tipo: string, origen: string, fecha: string }` | StockUnit |

---

## 5. Flujos Admin

### 5.1 Dashboard (`/admin/dashboard`)

**Server Component:** `DashboardPage`
- **KPI Cards:** Ventas del día, pedidos pendientes, stock bajo, drops activos.
- **Gráfico:** Ventas de los últimos 30 días.
- **Alertas:** Stock ≤ mínimo, pedidos sin confirmar, envíos atrasados.
- **Acciones rápidas:** Crear pedido, registrar cliente.

### 5.2 Pedidos (`/admin/pedidos`)

**Lista de Pedidos:**
- Filtros: estado, canal (WhatsApp/Web), rango de fechas.
- Columnas: ID, cliente, total, estado, fecha, canal.
- Acciones: Ver detalle, confirmar, cancelar.

**Detalle de Pedido (`/admin/pedidos/[id]`):**
- Info del cliente (nombre, email, teléfono).
- Items del pedido (variante, cantidad, precio).
- Historial de estados con timestamps.
- Botones de acción según estado actual:
  - Pendiente → Confirmar / Cancelar
  - Confirmado → Despachar
  - Enviado → Marcar entregado

**Server Actions:**
- `confirmarPedido(pedidoId)` → Valida stock, decrementa, cambia estado a Confirmado.
- `cancelarPedido(pedidoId, razon)` → Libera stock reservado, cambia estado a Cancelado.

### 5.3 Producción (`/admin/produccion`)

**Lista de Lotes:**
- Filtros: estado, proveedor, rango de fechas.
- Columnas: ID, proveedor, unidades, costo total, estado, fecha estimada.
- Acciones: Ver detalle, marcar recibido.

**Detalle de Lote (`/admin/produccion/[id]`):**
- Info del proveedor.
- Variantes del lote (SKU, cantidad).
- Costo total y desglose.
- Timeline: fecha pedido → fecha estimada → fecha real.
- Botones: Recibir lote, Rechazar parcial.

**Server Actions:**
- `iniciarProduccion(variantes, unidades, proveedorId)` → Crea lote con estado Solicitado.
- `recibirLote(loteId, costoReal)` → Actualiza stock, cambia estado a Recibido.

### 5.4 Stock (`/admin/stock`)

**Grid de Stock:**
- Vista de tabla agrupada por producto/drop.
- Columnas: SKU, producto, drop, talle, color, cantidad, stock mínimo, estado.
- Colores: Verde (> mínimo), Amarillo (≤ mínimo), Rojo (0).
- Filtros: producto, drop, estado de stock.
- Búsqueda por SKU.

**Acciones:**
- Ajuste manual de stock (incremento/decremento).
- Ver historial de movimientos de una variante.

**Server Action:**
- `actualizarStock(varianteSku, cantidad, tipo, origen)` → Valida stock ≥ 0, registra movimiento.

### 5.5 Envíos (`/admin/envios`)

**Lista de Envíos:**
- Filtros: estado, transportista, rango de fechas.
- Columnas: ID, pedido, transportista, tracking, estado, fecha despacho.
- Acciones: Ver tracking, actualizar estado.

**Detalle de Envío (`/admin/envios/[id]`):**
- Info del pedido asociado.
- Tracking info (número, URL, transportista).
- Timeline de estados.
- Botones según estado:
  - Preparando → Despachar (requiere número de tracking)
  - Despachado/EnTransito → Marcar entregado

**Server Actions:**
- `despacharEnvio(pedidoId, transportista, trackingNumber)` → Crea envío, cambia estado del pedido a Enviado.
- `actualizarEnvio(envioId, estado)` → Actualiza estado del envío.

### 5.6 Clientes (`/admin/clientes`)

**Lista de Clientes:**
- Filtros: nombre, email, backstagePass.
- Columnas: ID, nombre, email, teléfono, pedidos totales, total gastado, backstagePass.
- Búsqueda por nombre o email.
- Acciones: Ver perfil, activar/desactivar backstagePass.

**Detalle de Cliente (`/admin/clientes/[id]`):**
- Info personal (nombre, email, teléfono, dirección).
- Historial de pedidos (lista).
- Total gastado y ticket promedio.
- Estado de BackstagePass (activo/inactivo, fecha expiración).
- Botones: Editar perfil, Activar backstagePass, Crear pedido para este cliente.

**Server Actions:**
- `registrarCliente(nombre, email, telefono)` → Crea cliente, valida email único.
- `activarBackstagePass(clienteId, tipo)` → Activa membresía con expiración a 30 días.

### 5.7 Catálogo (`/admin/catalogo`)

**Lista de Productos:**
- Filtros: temporada, artista.
- Columnas: ID, nombre, artista, temporada, drops activos, diseño.
- Acciones: Ver detalle, editar, crear nuevo producto.

**Detalle de Producto (`/admin/catalogo/[id]`):**
- Info del producto (nombre, descripción, artista, temporada).
- Imagen del diseño.
- Lista de drops asociados (con estado y precio).
- Botones: Crear drop, Editar producto.

**Lista de Drops (`/admin/catalogo/drops`):**
- Filtros: estado, producto, rango de fechas.
- Columnas: ID, producto, nombre drop, precio, estado, fecha lanzamiento.
- Acciones: Ver detalle, editar (solo si Borrador), activar.

**Detalle de Drop (`/admin/catalogo/drops/[id]`):**
- Info del drop (nombre, precio, fechas, estado).
- Variantes habilitadas (talle, color, SKU).
- Stock actual por variante.
- Botones según estado:
  - Borrador → Activar
  - Activo → Cerrar manualmente

**Server Actions:**
- `crearProducto(nombre, descripcion, diseñoUrl, artista, temporada)` → Crea producto en catálogo.
- `lanzarDrop(productoId, precioBase, fecha, variantes)` → Crea drop, valida no tener otro activo simultáneamente.

---

## 6. Autenticación

### 6.1 NextAuth.js v5 (Credentials Provider)

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validar credenciales contra base de datos
        // Retornar usuario si son válidas
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutos
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol
      }
      return token
    },
    async session({ session, token }) {
      session.user.rol = token.rol
      return session
    },
  },
})
```

### 6.2 Middleware de Protección

```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/admin")) {
    return Response.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/admin/:path*"],
}
```

### 6.3 Seguridad (según THREATS.md)

| Medida | Implementación |
|---|---|
| **Rate limiting** | Middleware de rate limiting en `/api/auth/*` y `/api/webhooks/*` (5 intentos / 15 min) |
| **2FA TOTP** | NextAuth + plugin `next-auth-totp` (Google Authenticator / Authy) |
| **Sesiones** | JWT con expiración 30 min, refresh token rotado |
| **Cookies** | HTTP-only, Secure, SameSite=Strict |
| **CSRF** | NextAuth genera tokens CSRF automáticamente |
| **Webhook WhatsApp** | Validación HMAC-SHA256 en `X-Hub-Signature-256` |

---

## 7. API Routes

### 7.1 Contratos por Bounded Context

| Ruta | Método | Descripción | Request Body | Response |
|---|---|---|---|---|
| `/api/pedidos` | `GET` | Lista pedidos (con filtros) | Query: `?estado=&canal=&fechaDesde=&fechaHasta=` | `{ pedidos: Pedido[], total: number }` |
| `/api/pedidos` | `POST` | Crear pedido | `{ clienteId, items: ItemPedido[], canal }` | `{ pedido: Pedido }` |
| `/api/pedidos/[id]` | `GET` | Detalle de pedido | — | `{ pedido: Pedido }` |
| `/api/pedidos/[id]` | `PUT` | Actualizar pedido | `{ estado, notas? }` | `{ pedido: Pedido }` |
| `/api/produccion` | `GET` | Lista lotes | Query: `?estado=&proveedorId=` | `{ lotes: Lote[], total: number }` |
| `/api/produccion` | `POST` | Crear lote | `{ proveedorId, variantes, unidadesPorVariante, costoTotal }` | `{ lote: Lote }` |
| `/api/produccion/[id]` | `GET` | Detalle de lote | — | `{ lote: Lote }` |
| `/api/produccion/[id]` | `PUT` | Actualizar lote | `{ estado, costoReal? }` | `{ lote: Lote }` |
| `/api/stock` | `GET` | Stock por variante | Query: `?productoId=&dropId=&busqueda=` | `{ stock: StockUnit[] }` |
| `/api/stock` | `PUT` | Actualizar stock | `{ varianteSku, cantidad, tipo, origen }` | `{ stock: StockUnit }` |
| `/api/envios` | `GET` | Lista envíos | Query: `?estado=&transportista=` | `{ envios: Envio[], total: number }` |
| `/api/envios` | `POST` | Crear envío | `{ pedidoId, transportista, trackingNumber }` | `{ envio: Envio }` |
| `/api/envios/[id]` | `GET` | Detalle de envío | — | `{ envio: Envio }` |
| `/api/envios/[id]` | `PUT` | Actualizar envío | `{ estado }` | `{ envio: Envio }` |
| `/api/clientes` | `GET` | Lista clientes | Query: `?busqueda=&backstagePass=` | `{ clientes: Cliente[], total: number }` |
| `/api/clientes` | `POST` | Crear cliente | `{ nombre, email, telefono, direccion }` | `{ cliente: Cliente }` |
| `/api/clientes/[id]` | `GET` | Detalle de cliente | — | `{ cliente: Cliente }` |
| `/api/clientes/[id]` | `PUT` | Actualizar cliente | `{ nombre?, telefono?, direccion? }` | `{ cliente: Cliente }` |
| `/api/catalogo/productos` | `GET` | Lista productos | Query: `?temporada=&artista=` | `{ productos: Producto[], total: number }` |
| `/api/catalogo/productos` | `POST` | Crear producto | `{ nombreSlug, descripcion, diseñoUrl, artista, temporada }` | `{ producto: Producto }` |
| `/api/catalogo/productos/[id]` | `GET` | Detalle de producto | — | `{ producto: Producto }` |
| `/api/catalogo/drops` | `GET` | Lista drops | Query: `?productoId=&estado=` | `{ drops: Drop[], total: number }` |
| `/api/catalogo/drops` | `POST` | Crear drop | `{ productoId, nombreDrop, fechaLanzamiento, precioBase, variantes }` | `{ drop: Drop }` |
| `/api/catalogo/drops/[id]` | `GET` | Detalle de drop | — | `{ drop: Drop }` |
| `/api/catalogo/drops/[id]` | `PUT` | Actualizar drop | `{ estado?, variantes? }` | `{ drop: Drop }` |
| `/api/metrics` | `GET` | KPIs y métricas | Query: `?periodo=` | `{ kpis: MetricaKPI[] }` |
| `/api/webhooks/whatsapp` | `POST` | Webhook de WhatsApp | Payload de Meta Cloud API | `{ status: "ok" }` |

### 7.2 Validación con Zod

```typescript
// lib/validations/pedido.ts
import { z } from "zod"

export const crearPedidoSchema = z.object({
  clienteId: z.string().cuid(),
  items: z.array(z.object({
    variante: z.object({
      talle: z.string(),
      color: z.string(),
      sku: z.string(),
    }),
    cantidad: z.number().int().positive(),
    precioUnitario: z.number().positive(),
  })).min(1),
  canal: z.enum(["WhatsApp", "Web"]),
})

export const confirmarPedidoSchema = z.object({
  pedidoId: z.string().cuid(),
})
```

---

## 8. Componentes (shadcn/ui + Tailwind)

### 8.1 Componentes Base (shadcn/ui)

| Componente | Uso en Admin |
|---|---|
| `Button` | Acciones (confirmar, cancelar, despachar, etc.) |
| `Card` | KPI cards en dashboard, detalle de pedidos |
| `Table` | Listas de pedidos, envíos, clientes, stock |
| `Dialog` | Modales de confirmación (cancelar pedido, etc.) |
| `Form` | Formularios de creación/edición |
| `Input` | Búsquedas, campos de formulario |
| `Select` | Filtros (estado, canal, transportista) |
| `Badge` | Estados de pedido/envío (coloreados) |
| `Calendar` | Selección de fechas (filtros, drops) |
| `Tabs` | Navegación secundaria (pedidos por estado) |
| `Toast` | Notificaciones de éxito/error |
| `DropdownMenu` | Menús de acción por fila |
| `Avatar` | Representación de cliente |

### 8.2 Componentes Admin Específicos

| Componente | Archivo | Descripción |
|---|---|---|
| `Sidebar` | `components/admin/sidebar.tsx` | Navegación lateral con iconos |
| `Header` | `components/admin/header.tsx` | Barra superior con usuario y búsqueda global |
| `KPICard` | `components/admin/dashboard/kpi-card.tsx` | Tarjeta de métrica con icono y tendencia |
| `PedidoTable` | `components/admin/pedidos/pedido-table.tsx` | Tabla de pedidos con filtros |
| `PedidoDetail` | `components/admin/pedidos/pedido-detail.tsx` | Vista detallada de un pedido |
| `LoteTable` | `components/admin/produccion/lote-table.tsx` | Tabla de lotes de producción |
| `StockGrid` | `components/admin/stock/stock-grid.tsx` | Grid de stock por variante |
| `EnvioTracker` | `components/admin/envios/envio-tracker.tsx` | Timeline de estados de envío |
| `ClienteList` | `components/admin/clientes/cliente-list.tsx` | Lista de clientes con búsqueda |
| `ProductoCard` | `components/admin/catalogo/producto-card.tsx` | Tarjeta de producto con imagen |
| `DropForm` | `components/admin/catalogo/drop-form.tsx` | Formulario de creación de drop |

### 8.3 Paleta de Colores (Tailwind)

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        ajicolor: {
          primary: "#FF6B35",    // Naranja vibrante (toon-pop)
          secondary: "#004E89",  // Azul oscuro
          accent: "#FFE156",     // Amarillo pop
          background: "#FAFAFA",
          foreground: "#1A1A1A",
          muted: "#F4F4F5",
          border: "#E4E4E7",
        },
      },
    },
  },
}
```

---

## 9. Despliegue

### 9.1 Vercel

| Configuración | Valor |
|---|---|
| **Framework** | Next.js 14+ |
| **Node.js** | 20.x |
| **Build Command** | `next build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Root Directory** | `/` |

### 9.2 Variables de Entorno

```env
# .env.example

# Database
DATABASE_URL="file:./dev.db"
# Para producción (Turso):
# DATABASE_URL="libsql://your-db.turso.io"
# DATABASE_AUTH_TOKEN="your-token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# 2FA
TOTP_SECRET="your-totp-secret"

# WhatsApp Meta Cloud API
WHATSAPP_API_TOKEN="your-token"
WHATSAPP_VERIFY_TOKEN="your-verify-token"
WHATSAPP_APP_SECRET="your-app-secret"

# Storage (Vercel Blob o S3)
BLOB_READ_WRITE_TOKEN="your-token"
# o
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET="your-bucket"

# Pagos (Stripe/Culqi)
STRIPE_SECRET_KEY="your-key"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"

# Email (opcional, para recuperación de contraseña)
RESEND_API_KEY="your-key"
```

### 9.3 Base de Datos

| Entorno | Proveedor | Configuración |
|---|---|---|
| **Desarrollo** | SQLite local | `DATABASE_URL="file:./dev.db"` |
| **Producción** | Turso (SQLite distribuido) | `DATABASE_URL="libsql://ajicolor.turso.io"` |

**Migraciones:**
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

**Seed:**
```bash
npx prisma db seed
```

### 9.4 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 10. Roadmap

### Fase 1: Fundamentos (Semanas 1-2)
- [ ] Setup proyecto Next.js 14 + TypeScript + Tailwind + shadcn/ui
- [ ] Configurar Prisma con SQLite
- [ ] Implementar schema de base de datos (todas las entidades)
- [ ] NextAuth.js con credenciales + 2FA TOTP
- [ ] Middleware de protección de rutas
- [ ] Layout admin con sidebar y header

### Fase 2: Catálogo y Stock (Semanas 3-4)
- [ ] CRUD de Productos (`/admin/catalogo`)
- [ ] CRUD de Drops (`/admin/catalogo/drops`)
- [ ] Gestión de Stock (`/admin/stock`)
- [ ] Server Actions para crear producto, lanzar drop, actualizar stock
- [ ] Validación Zod para todas las operaciones

### Fase 3: Pedidos y Envíos (Semanas 5-6)
- [ ] CRUD de Pedidos (`/admin/pedidos`)
- [ ] Workflow de estados de pedido (Pendiente → Confirmado → Enviado → Entregado)
- [ ] Integración con WhatsApp webhook (crear pedido desde WhatsApp)
- [ ] CRUD de Envíos (`/admin/envios`)
- [ ] Tracking de envíos con transportistas

### Fase 4: Producción y Clientes (Semanas 7-8)
- [ ] CRUD de Lotes de Producción (`/admin/produccion`)
- [ ] Gestión de Proveedores
- [ ] Workflow de producción (Solicitado → EnProceso → Recibido)
- [ ] CRUD de Clientes (`/admin/clientes`)
- [ ] Gestión de BackstagePass

### Fase 5: Dashboard y Métricas (Semana 9)
- [ ] Dashboard principal con KPIs
- [ ] Gráficos de ventas (últimos 30 días)
- [ ] Alertas de stock bajo
- [ ] Métricas de envíos (tiempo de entrega, costo promedio)
- [ ] API de métricas (`/api/metrics`)

### Fase 6: Deploy y Optimización (Semana 10)
- [ ] Deploy a Vercel
- [ ] Configurar Turso para producción
- [ ] Variables de entorno y secretos
- [ ] CI/CD con GitHub Actions
- [ ] PWA para operaciones offline
- [ ] Optimización de performance (Lighthouse score > 90)

---

*SPEC.md — v1.0 — Ajicolor E-commerce*