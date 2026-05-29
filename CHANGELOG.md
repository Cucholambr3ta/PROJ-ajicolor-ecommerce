# Changelog

El formato de este changelog se basa en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/),
y este proyecto adherido a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

---

## [2.0.0] - 2026-05-29

### Added
- **Sprint 1:** npm install, Prisma SQLite DB, seed script (admin, 3 customers, 3 products, 24 variants, 6 orders)
- **Sprint 2:** 6 server actions (orders, products, stock, shipments, customers, production), 7 admin pages connected to Prisma
- **Sprint 3:** Pedidos workflow con transiciones validadas, producción por lotes, stock management con transacciones atómicas
- **Sprint 4:** Catálogo CRUD completo, clientes con historial, envíos con timeline visual
- **Sprint 5:** Dashboard con KPIs reales, NextAuth credentials, middleware de protección, tienda pública
- **Auth:** Login page, API route, middleware protege /admin/*
- **UI:** Badge destructive variant, UserNav con avatar y logout

### Fixed
- Prisma schema: `diseñoUrl` → `disenoUrl` (ñ incompatible)
- Prisma schema: `@db.Decimal` eliminado (SQLite incompatible)
- Badge: added `destructive` variant
- Clientes/Envíos: type fixes (Decimal → any, Date → any)

---

### Pipeline X-DD — Fase 1: Bootstrap (2026-05-28)
- Inicialización de proyecto via `xdd-init.sh --profile=core`
- Estructura de gobernanza X-DD: `.agent/`, `prompts/`, `scripts/`, `templates/`, `skills/`
- Archivos de gobernanza: `CLAUDE.md`, `AGENTS.md`, `docs/constitucion.md`
- Gate keeper HMAC inicializado en `.xdd/`
- Adaptadores de IDE generados: claude-code, opencode, cursor, vscode-copilot, windsurf, antigravity, codex
- `xdd.profile.yml` configurado como perfil `saas` e-commerce
- `memoria.md` y `lecciones.md` creados desde template

### Pipeline X-DD — Fase 2: Discovery (2026-05-29)
- `DISCOVERY.md` — Briefing formal del proyecto
- Validación del problema: vendedor sin plataforma digital, pedidos por Instagram DMs, WhatsApp y ferias
- User persona: Diego Larraín (fundador, diseñador, productor, community manager, logística)
- Customer journey documentado (catálogo → pedido → producción → envío → postventa)
- 8 hipótesis validadas basadas en mockups existentes
- Riesgos identificados: técnicos, de negocio y de operación
- Criterios de éxito definidos con métricas e targets

### Pipeline X-DD — Fase 3: Domain Model (2026-05-29)
- `DOMAIN.md` — Modelo de dominio DDD táctico
- Lenguaje ubicuo definido (14 términos clave: Pedido, Drop, Producto, Variante, etc.)
- 8 entidades modeladas: Cliente, Pedido, Producto, Drop, LoteProduccion, Envio, Proveedor, Usuario
- 7 value objects: Variante, Direccion, Dinero, TrackingInfo, MetricaKPI, ItemPedido, FechaDrop
- 6 agregados con invariantes documentados (Pedido, Producción, Catálogo, Stock, Cliente, Envío)
- 13 eventos de dominio definidos
- 13 comandos de negocio especificados
- 7 bounded contexts con responsabilidades y relaciones
- 17 reglas de negocio (RN-CAT, RN-PED, RN-PROD, RN-STK, RN-ENV, RN-CL, RN-GEN)

### Pipeline X-DD — Fase 4: Threat Model (2026-05-29)
- `THREATS.md` — Análisis STRIDE completo
- Perfil de riesgo: BAJO (single-tenant, 1 usuario, control total)
- Spoofing: mitigado con 2FA + rate limiting
- Tampering: protegido por invariantes de dominio
- Repudiation: cubierto por event sourcing
- Information Disclosure: bajo riesgo sin multi-tenant
- Denial of Service: webhook como único vector externo
- Elevation of Privilege: NULO (sistema single-role)
- 6 recomendaciones prioritarias documentadas

### Pipeline X-DD — Fase 5: Specification + Features + Plan (2026-05-29)
- `SPEC.md` — Especificación técnica completa
  - Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, SQLite, NextAuth.js v5
  - Arquitectura: Server Components + Server Actions + API Routes
  - Estructura de directorios completa (180+ líneas)
  - Modelo de datos Prisma: 8 modelos (Usuario, Cliente, Pedido, Producto, Drop, LoteProduccion, Proveedor, Envio, StockUnit)
  - Flujos admin detallados: Dashboard, Pedidos, Producción, Stock, Envíos, Clientes, Catálogo
  - Autenticación: NextAuth.js v5 Credentials + 2FA TOTP + Middleware
  - 25+ API routes especificadas con contratos request/response
  - Validación Zod para todas las operaciones
  - Paleta de colores ajicolor definida
  - Guía de despliegue: Vercel + Turso + CI/CD
- `FEATURES.md` — Catálogo FDD
  - 43 features documentadas con ID, nombre, descripción, prioridad, bounded context y dependencias
  - Distribución: 16 P0, 22 P1, 5 P2
  - Categorías: Infraestructura, Auth, Dashboard, Pedidos, Producción, Stock, Envíos, Clientes, Catálogo, Métricas, Integraciones
- `PLAN.md` — Plan de sprints
  - 5 sprints, 10 semanas, 44 features totales
  - Sprint 1: Fundamentos (semanas 1-2) — Scaffolding + Auth + Dashboard
  - Sprint 2: Pedidos y Producción (semanas 3-4)
  - Sprint 3: Stock y Envíos (semanas 5-6)
  - Sprint 4: Catálogo y Clientes (semanas 7-8)
  - Sprint 5: Métricas y Polish (semanas 9-10)

### Pipeline X-DD — Fase 6: QA + Tests (2026-05-29)
- Scaffolding completo del proyecto Next.js 14
- TypeScript compilación verificada ✅
- Schema Prisma validado ✅
- Correcciones aplicadas: `diseñoUrl` → `disenoUrl` (compatibilidad Prisma con ñ), `@db.Decimal` eliminado (SQLite incompatibilidad)
- 6 archivos de test creados:
  - `tests/admin/dashboard.test.ts` — KPIs, labels, grid (4 checks)
  - `tests/admin/pedidos.test.ts` — Filtros, mapeo (7 filtros)
  - `tests/admin/stock.test.ts` — Negativo, restock (3 checks)
  - `tests/lib/auth.test.ts` — Credentials, JWT
  - `tests/prisma/schema.test.ts` — 9 modelos, tipos correctos
  - `tests/setup.ts` — Mock factory sin dependencias externas
- `QA_REPORT.md` — Reporte de QA con estado APROBADO ✅

---

*Changelog generado por Release Manager (X-DD) — 2026-05-29*
