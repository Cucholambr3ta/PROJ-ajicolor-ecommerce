# Ajicolor E-Commerce

Tienda online de ropa musical con estética toon-pop. Panel de administración para gestión completa: pedidos, producción de poleras, stock, envíos, clientes y métricas.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · SQLite · NextAuth.js v5

---

## Características

- **Dashboard** — KPIs en tiempo real: ventas, pedidos pendientes, stock bajo, producción activa
- **Pedidos** — Gestión con filtros por estado (pendiente → producción → enviado → entregado)
- **Producción** — Cola de lotes, asignación, seguimiento de estados
- **Stock** — Inventario por variante, alertas de mínimo, historial de movimientos
- **Envíos** — Registro de tracking, cambio de estado, historial
- **Clientes** — Lista con historial de compras y membresía Backstage Pass
- **Catálogo** — CRUD de productos, variantes (talla/color), precios, drops

---

## Instalación

```bash
# Clonar
git clone https://github.com/Cucholambr3ta/PROJ-ajicolor-ecommerce.git
cd PROJ-ajicolor-ecommerce

# Instalar dependencias
npm install

# Crear base de datos
npx prisma db push

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local:
#   DATABASE_URL="file:./dev.db"
#   NEXTAUTH_URL="http://localhost:3000"
#   NEXTAUTH_SECRET="tu-secret-aqui"

# Arrancar
npm run dev
```

App disponible en `http://localhost:3000/admin`

---

## Estructura del proyecto

```
├── prisma/
│   └── schema.prisma          # 8 modelos: User, Product, Variant, Order, etc.
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── page.tsx       # Dashboard con KPIs
│   │   │   ├── pedidos/       # Gestión de pedidos
│   │   │   ├── produccion/    # Cola de producción
│   │   │   ├── stock/         # Inventario
│   │   │   ├── envios/        # Gestión de envíos
│   │   │   ├── clientes/      # Clientes
│   │   │   └── catalogo/      # CRUD productos
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/         # Sidebar, Card, Table, Badge
│   └── lib/
│       ├── prisma.ts          # Singleton Prisma
│       ├── auth.ts            # NextAuth config
│       └── utils.ts
├── tests/                     # 6 archivos test
├── mockup/                    # Mockups HTML/CSS originales
├── DISCOVERY.md               # Briefing
├── DOMAIN.md                  # Modelo de dominio DDD
├── SPEC.md                    # Especificación técnica
├── FEATURES.md                # 43 features priorizadas
├── PLAN.md                    # 5 sprints
├── THREATS.md                 # Análisis STRIDE
├── QA_REPORT.md               # Reporte QA
├── CHANGELOG.md               # Historial de cambios
└── RELEASES/v1.0.0.md         # Release notes
```

---

## Desarrollo

### Git Flow

El proyecto sigue Git Flow estricto:

- `main` — Producción, solo vía PR desde develop
- `develop` — Integración, recibe PRs desde feature/*
- `feature/*` — Cada feature/fix en rama dedicada

```bash
# Crear feature
git checkout develop
git checkout -b feature/nueva-feature

# Trabajar, commit, push
git add -A && git commit -m "feat: nueva feature"
git push -u origin feature/nueva-feature

# Crear PR
gh pr create --base develop

# Merge (solo dev)
gh pr merge <PR> --squash --admin
```

### Pipeline X-DD

El proyecto usa el pipeline X-DD con 6 fases gated:

| Fase | Artefacto | Gate |
|------|-----------|------|
| 1-Briefing | `DISCOVERY.md` | HMAC-SHA256 |
| 2-Spec | `SPEC.md` + `DOMAIN.md` + `THREATS.md` | HMAC-SHA256 |
| 3-Plan | `FEATURES.md` + `PLAN.md` | HMAC-SHA256 |
| 4-Build | Código | HMAC-SHA256 |
| 5-QA | Tests + `QA_REPORT.md` | HMAC-SHA256 |
| 6-Release | `CHANGELOG.md` + `RELEASES/` | HMAC-SHA256 |

---

## Deploy en Vercel

1. **Importar el proyecto**: en Vercel, "Add New Project" → conectar este repo de GitHub.
   Vercel detecta Next.js automáticamente (ver `vercel.json`).

2. **Base de datos**: crear (o usar) un proyecto de [Supabase](https://supabase.com) y
   obtener las dos connection strings desde Settings → Database:
   - **Connection pooling** (puerto 6543, con `?pgbouncer=true`) → `DATABASE_URL`
   - **Direct connection** (puerto 5432) → `DIRECT_URL`

3. **Variables de entorno**: en Settings → Environment Variables del proyecto en Vercel,
   cargar todas las de [`.env.example`](./.env.example). Ese archivo indica junto a cada
   una si el tipo en Vercel debe ser **Secret** o **Plain/Config**.

   ⚠️ **Toda variable `NEXT_PUBLIC_*` debe ser Plain/Config, nunca Secret** — Vercel la
   rechaza como Secret porque su valor se embebe en el JavaScript que llega al navegador.

   Mínimas para que el build no falle: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
   `AUTH_TRUST_HOST`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL` (esta última y `AUTH_URL` deben
   apuntar a la URL real del deploy, no a `localhost`). El resto (Google OAuth, Resend,
   Supabase Storage) puede quedar vacío — el código las trata como opcionales y no
   rompen el build; simplemente esas funciones quedan inactivas hasta configurarlas.

4. **Migrar y sembrar la base de datos** (una sola vez, apuntando a la base de Supabase
   real vía `DATABASE_URL`/`DIRECT_URL` en el entorno local):
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts   # opcional — carga catálogo de ejemplo
   ```

5. **Deploy**: cada push a la rama conectada dispara un deploy automático. Para
   redeployar manualmente tras cambiar variables de entorno: Deployments → menú "···"
   del último deploy → **Redeploy**.

---

## Roadmap

### v1.0.0 (Actual)
- Pipeline X-DD completo
- Scaffolding Next.js 14
- Schema Prisma con 8 modelos
- Tests unitarios
- Admin panel con 7 secciones

### v1.1.0 (Próximo)
- Conectar API routes con Prisma
- CRUD completo de pedidos
- Gestión de producción por lotes
- Upload de imágenes (Vercel Blob)

### v1.2.0
- Stock con grid de colores
- Tracking de envíos
- Webhook WhatsApp (Meta Cloud API)

### v2.0.0
- Pagos (Stripe/Culqi)
- 2FA TOTP
- Métricas avanzadas
- Deploy Vercel + Turso

---

## Equipo

Proyecto personal de **Cucholambr3ta** — diseñador, productor y operador único.

Desarrollado con [X-DD Framework](https://github.com/Cucholambr3ta/PROJ-ajicolor-ecommerce) (pipeline de 6 fases gated).

---

## Licencia

MIT
