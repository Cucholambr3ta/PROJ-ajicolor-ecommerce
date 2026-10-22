# Ajicolor — Estado del proyecto

Documento de traspaso para continuar el trabajo desde otro sistema operativo. Generado 2026-10-21.

## Qué es esto

E-commerce de poleras/merch de bandas (Ajicolor), Next.js 14 App Router + Prisma + Supabase (Postgres + Storage) + NextAuth v5. Repo: `Cucholambr3ta/PROJ-ajicolor-ecommerce`.

## Cómo levantar el proyecto en la máquina nueva

```bash
git clone https://github.com/Cucholambr3ta/PROJ-ajicolor-ecommerce.git
cd PROJ-ajicolor-ecommerce
git checkout develop   # o la rama en la que se vaya a seguir trabajando
npm install
cp .env.example .env   # completar con los valores reales (ver abajo)
npx prisma generate
npm run dev            # http://localhost:3000
```

### Variables de entorno (`.env`)

`.env.example` ya documenta cada una con comentarios. Las que la máquina actual tenía cargadas:

- `DATABASE_URL`, `DIRECT_URL` — Supabase Postgres (pooler + directa)
- `AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

**Faltan y nunca se cargaron en esta máquina** (features ya programadas pero sin probar en vivo):
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — login con Google (Fase 4, pendiente credenciales del dueño)
- `RESEND_API_KEY` / `EMAIL_FROM` — emails transaccionales (Fase 5)

Pedir los valores reales al dueño del proyecto (Alejandro) o revisar si quedaron guardados en un gestor de contraseñas — no están en este repo ni en ningún commit.

### Comandos útiles

```bash
npx tsc --noEmit        # typecheck
npm run lint             # eslint (next lint)
npx vitest run           # tests (48 tests, 4 archivos)
npx prisma migrate deploy  # aplicar migraciones pendientes contra Supabase
npx prisma studio         # explorador visual de la DB
```

`prisma migrate dev` **no funciona en shell no interactivo** (falla con "non-interactive environment"). El flujo usado toda esta sesión para migraciones nuevas: escribir el SQL a mano en `prisma/migrations/<timestamp>_nombre/migration.sql` (mirando el patrón de columnas Decimal/FK de migraciones anteriores), después `npx prisma migrate deploy` + `npx prisma generate`.

## Estado de git

- Rama de trabajo activa: `feature/erp-modulos-y-cotizador-3d` (se viene reusando para múltiples PRs seguidas contra `develop` — no es una rama de una sola feature, es la rama "de trabajo en curso" del dueño).
- **PR #63 abierto** (`feature/erp-modulos-y-cotizador-3d` → `develop`): selector Adulto/Niño, precios por talla, guía de tallas en modal — pusheado, no mergeado todavía. Revisar y mergear desde la máquina nueva si corresponde.
- `develop` está 1 PR adelante de `main` (el #63, una vez mergeado, va a necesitar su propio PR `develop → main` para llegar a producción — ese es el patrón que se viene siguiendo, ver PRs #50/#52/#54/#56/#58/#60/#62, todos "Develop → main").
- Producción (Vercel) sirve desde `main`.
- Quedaron sin commitear a propósito (no tocados esta sesión, son trabajo en curso de otra persona/sesión, no asumir qué hacer con ellos sin preguntar): `public/fondo/*.png` modificados + sus `.jpeg` sin trackear (alguien estaba probando un cambio de PNG a JPEG en los fondos estampados), y `wipe-catalog.mjs.save` (script suelto sin extensión `.mjs`, parece un backup).

## Qué se construyó en esta sesión (todo en PR #63)

1. **Banner animado "Productos del Ají"** (ya mergeado en PR #61, previo a esta tanda): carrusel con 5 cuadros diagonales mostrando fotos de producto rotando, efecto de recorte 3D (producto sobresale libre arriba/izquierda, recortado abajo/derecha en el borde real del panel). El bug largo de esa sesión (el recorte se desalineaba al bajar los productos para no tapar el título) se resolvió desacoplando la caja de recorte (fija en el borde real) del desplazamiento visual (vía `transform: translateY` en una capa interna).

2. **Selector Adulto/Niño en la ficha de producto**: `Product.kidsVersionId` (self-relation opcional) vincula un producto Adulto con su versión Kids del mismo diseño — son dos filas de `Product` separadas (cada una con sus propios colores/tallas/fotos), ahora enlazadas. La ficha pública muestra un toggle que cambia TODO el bloque (colores, tallas, fotos, precio) entre ambas versiones. Se vincula desde `/admin/catalogo/nuevo?edit=<id>` → sección "Versión Kids" (solo visible en productos categoría Adulto).

3. **Precios por tipo de prenda + rango de talla** (`PriceRule`): reemplaza el precio único fijo de `Product.precio` (que queda como fallback legado, nunca se borra). Lista real ya cargada en la DB:
   - Polera S–XL: $15.000 — Polera 2XL: $17.000
   - Polera Kids 2-4 a 10-12: $8.500 — Polera Kids 14-16: $10.000
   - Polerón S–2XL: $25.000
   - **Pendiente**: Reloj, Papelería y Totebag sin precio cargado todavía — el dueño dijo que los carga él después desde `/admin/precios` cuando tenga los montos definidos. Mientras tanto esos productos usan el `Product.precio` que ya tenían (fallback).
   - Un producto puntual (drop) puede tener un override de precio propio por talla, independiente de la tabla general — se carga desde la ficha de edición del producto, sección "Precio especial (drop)".
   - Resolución: override del producto > regla global del tipo > `Product.precio` (fallback). Lógica central en `src/lib/pricing.ts` (server actions, requieren auth para mutar) y `src/lib/pricing-resolve.ts` (funciones puras sin `"use server"`, para poder llamarlas también desde client components).
   - Admin nuevo: `/admin/precios`.
   - Las grillas (home, kids, relacionados, favoritos) muestran "Desde $X" (el precio más bajo entre las reglas aplicables), porque ahora un mismo producto puede tener precios distintos por talla.
   - El orden "precio ascendente/descendente" del catálogo dejó de ser un `ORDER BY` de SQL — ahora se trae la página completa y se ordena en memoria con el precio resuelto (aceptable con el tamaño actual del catálogo, ~44 productos; si crece mucho se puede desnormalizar `Product.precio` = precio-mínimo-vigente y volver a ordenar en DB).

4. **Guía de tallas en modal**: antes era una tabla que se desplegaba inline bajo el botón "Guía de tallas". Ahora el botón abre una ventana modal (overlay oscuro, animación fade+scale) con una imagen vector de la prenda (administrable por tipo+categoría desde `/admin/precios`, sección "Guía de tallas" — se sube una sola vez por tipo y se reutiliza en todos los productos de ese tipo) al lado de la tabla de medidas existente. **Pendiente**: el dueño tiene que subir las imágenes vector reales — hoy no hay ninguna cargada, el modal muestra el aviso "Todavía no hay imagen guía cargada" hasta que se suban.

5. **Pulido de la ficha de producto**:
   - Frente/Espalda dejó de ser un botón manual — ahora cicla solo cada 2.5s con una transición de crossfade + blur + escala (más prolija que el flip 3D que se probó primero y se sintió "amateur"). Se pausa mientras el mouse está sobre la foto.
   - Tilt 3D pseudo-parallax: la foto del producto se inclina levemente siguiendo el mouse (sin modelo 3D real, solo con las fotos planas que ya existen) + un brillo que sigue al cursor.

6. **Fix de overflow horizontal en mobile**: `AuthDrawer` (el panel de login) tenía `max-w-sm` (384px) más ancho que el viewport en mobile (375px) — cerrado, `translate-x-full` lo corría por su propio ancho, generando scroll horizontal fantasma en toda la tienda. Fix: `width: 100vw` con el mismo `max-w-sm` como tope, para que nunca sea más ancho que el viewport real.

7. **Investigación: img2threejs** — se evaluó esa librería (`github.com/img2threejs/img2threejs`) para convertir las 2 fotos planas de un producto en una vista 3D real. Conclusión: no sirve para eso — es una skill de agente de IA que genera código Three.js aproximado desde UNA imagen de referencia (reconstrucción por código, no fotogrametría ni mapeo de textura). Se optó por el tilt pseudo-3D del punto anterior en su lugar.

## Deuda técnica / bugs conocidos, no resueltos

- **Banner de admin no sube imágenes en producción (Vercel)**: error genérico "An error occurred in the Server Components render". Diagnosticado hasta el fondo: el bucket `banners` en Supabase Storage existe y es público (confirmado por capturas del dueño), las variables `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` SÍ están cargadas en Vercel (confirmado, nombres correctos) — pero el log de función de Vercel sigue mostrando `Error: Supabase Storage no está configurado (falta SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)`, lo que significa que en RUNTIME esas variables llegan vacías o inválidas aunque el dashboard las muestre cargadas. Se probó un redeploy limpio después de confirmar que estaban cargadas — **el redeploy NO arregló el problema**. Hipótesis no probadas: el valor tiene espacios en blanco al inicio/fin, la key fue rotada en Supabase sin actualizar Vercel, o hay un problema con el entorno (Production vs Preview) en el que se cargó la variable. **Próximo paso sugerido**: desde el dashboard de Vercel, borrar y volver a cargar ambas variables desde cero (copiar/pegar con cuidado de no arrastrar espacios), confirmar que el entorno marcado sea "Production", y redeployar.

- **Auth redirige a `localhost:3000` aunque el dev server corre en otro puerto**: visto repetidas veces esta sesión — pedir `/admin/...` sin sesión redirige a `http://localhost:3000/login?callbackUrl=...` sin importar en qué puerto esté corriendo realmente el server (se usó 3001 toda la sesión por conflicto de puerto). Es casi seguro `AUTH_URL` en `.env` apuntando fijo a `localhost:3000`. No bloqueante (el login funciona si se accede por el puerto correcto), pero rompe cualquier intento de probar rutas `/admin/*` con Puppeteer/automatizado desde otro puerto. Revisar `AUTH_URL` en `.env` si se sigue usando un puerto no estándar.

- **`public/fondo/*.png` vs `*.jpeg`**: hay un cambio a medio hacer (PNG actuales de 500KB–3MB cada uno, posible intento de reemplazarlos por JPEG más livianos) sin commitear, no tocado esta sesión — a resolver con el dueño antes de commitear nada ahí.

## Roadmap pendiente (del plan de auditoría anterior, no de esta sesión)

Hay un plan más amplio ya discutido con el dueño (ver historial de conversación si hace falta el detalle completo) con fases pendientes:

- **Seguridad**: `requireAdmin`/middleware aceptan cualquier `rol` no vacío distinto de "Cliente" (debería ser lista blanca estricta), 2FA de admin con huecos, emails sin normalizar a minúsculas, datos bancarios hardcodeados en código en vez de en `/admin/configuracion`.
- **ERP**: confirmación de pago nunca cambia `Order.estadoPago` automáticamente, sin modelo de insumos/materiales, sin login social funcional (Google) — credenciales pendientes del dueño.
- **Tienda**: sin búsqueda/filtros avanzados más allá de lo básico, carrito anónimo ya resuelto (token por cookie), falta guía de tallas real (en progreso, ver arriba), nav duplicada en varias páginas (parcialmente resuelto).
- Ver mensajes anteriores de esta conversación para el detalle completo fase por fase si se retoma ese plan.

## Dev server — cómo se corrió esta sesión

Puerto 3001 (por conflicto con otro proceso en 3000):

```bash
fuser -k 3001/tcp 2>/dev/null
set -a && source .env && set +a
nohup npm run dev -- -p 3001 > /tmp/ajicolor-dev.log 2>&1 &
```

En la máquina nueva, probablemente no haga falta el puerto alternativo — usar `npm run dev` normal (puerto 3000) salvo que haya conflicto.

## Verificación recomendada antes de seguir trabajando

1. `npm install` + `npx prisma generate` + confirmar que `npx tsc --noEmit` / `npm run lint` / `npx vitest run` siguen en verde (deberían, quedaron así al cerrar esta sesión).
2. Revisar si el PR #63 ya se mergeó o sigue abierto: `gh pr view 63`.
3. Si se va a seguir trabajando, decidir si continuar sobre `feature/erp-modulos-y-cotizador-3d` (el patrón que se viene usando) o cortar una rama nueva desde `develop`.
4. Confirmar en `/admin/precios` que las 5 reglas de precio reales siguen cargadas (se insertaron directo en la DB de Supabase, no deberían perderse, pero vale la pena confirmar).
