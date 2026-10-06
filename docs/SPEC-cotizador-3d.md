# SPEC — Cotizador 3D (Polera, Polerón, Tote bag)

> Estado: **borrador para aprobación** · Evoluciona el cotizador 2D existente (`/cotizador`). No lo reemplaza: el 2D pasa a ser el fallback.
> Idioma/estilo: igual que `SPEC.md`. Prefijo de features: `CT-` (no choca con `F01–F43` de `FEATURES.md`).

---

## 1. Contexto

### 1.1 Qué existe hoy (verificado en código)

| Pieza | Ubicación | Comportamiento actual |
|---|---|---|
| Página pública | `src/app/(tienda)/cotizador/{page,CotizadorClient}.tsx` | Selector prenda → color → talla → cantidad → **1 diseño** → contacto → "Solicitar cotización". Preview 2D: mockup gris + `mix-blend-multiply` con el hex del color + `<img>` del diseño en rect **hardcodeado** (45%×45%, top 22%). Solo **frente**. |
| Server actions | `src/lib/actions/cotizador.ts` | `getPrendasActivas`, `uploadDisenoCotizador`, `crearCotizacion` (envía email al admin vía `sendEmail`), `actualizarCotizacion` (estado + `precioCotizado`), `convertirCotizacionAPedido` |
| Storage | `src/lib/storage.ts` → `uploadDisenoPersonalizado` | Supabase, bucket **público** `disenos-personalizados` |
| Modelos Prisma | `PrendaBase`, `PrendaColor`, `CotizacionPersonalizada`, enum `EstadoCotizacion` | `PrendaBase` ya tiene `mockupFrenteUrl`, `mockupEspaldaUrl` (sin usar en UI), `zonaAnchoCm`, `zonaAltoCm` (un solo valor), `tallasDisponibles` |
| Admin | `src/app/admin/cotizaciones/*` | Lista, cambio de estado, fijar precio, convertir a pedido |
| Pedido | `OrderItem.disenoUrlLibre` | Un solo diseño por ítem libre |

Flujo de negocio ya vigente y que **se conserva**: el cliente envía → queda `Pendiente` → el admin revisa, fija precio (`Cotizada`) → `Aceptada` → conversión manual a pedido. **El admin cierra el proceso.**

### 1.2 Qué cambia

1. Preview **3D** interactivo para polera, polerón y tote bag (hoy: imagen plana).
2. Diseño por **lado**: frente y/o espalda (hoy: solo uno, sin lado).
3. Zonas de impresión **fijas y configurables por prenda** (hoy: hardcodeadas).
4. Preview **2D** se mantiene (fallback + toggle), ahora con frente/espalda.
5. La cotización guarda un diseño por lado (+ escala) y el admin los ve por separado.

---

## 2. Decisiones tomadas

| # | Decisión | Fuente |
|---|---|---|
| D1 | El cliente sube su diseño y elige frente y/o espalda | Usuario |
| D2 | Zona de impresión **fija** por lado. El cliente no arrastra ni rota. Solo puede **escalar** dentro de la zona (50–100 %, default 100 % = auto-fit `contain`) | Usuario + ajuste de spec |
| D3 | Preview 2D también, en lo posible | Usuario |
| D4 | La cotización se **guarda** y se **envía al admin**; el admin cierra | Usuario |
| D5 | **No hay cálculo automático de precio** en v1: aún no existe tabla de precios. Se muestra "desde $X" (`precioBase`) y "precio final a confirmar por Ajicolor". El admin fija `precioCotizado` como hoy | Usuario (tabla pendiente) |
| D6 | **No hay modelos 3D** → se consiguen (ver §6) | Usuario |
| D7 | Proyección del diseño con `<Decal>` de drei: no requiere que el modelo tenga UV pensados para estampado | Técnica |

## 3. Fuera de alcance (v1)

- Colocación libre (arrastrar/rotar/escalar fuera de la zona).
- Más de 1 diseño por lado; texto/editor de diseño dentro del cotizador.
- Mangas, cuello u otras zonas (solo `Frente` y `Espalda`; el modelo de datos permite agregar más después).
- Cálculo automático de precio (queda un punto de extensión, ver §8).
- Editor admin de zonas 3D (v1: se calibran en seed + panel debug solo en dev; ver CT-12).
- Notificación automática al cliente cuando el admin fija precio (hoy tampoco existe; ver §12).

---

## 4. Requisitos funcionales

### 4.1 Cliente (`/cotizador`)

| ID | Requisito | Prioridad |
|---|---|---|
| CT-01 | Elegir prenda (Polera / Polerón / Tote bag) — datos desde `PrendaBase` activa | P0 |
| CT-02 | Elegir color: el modelo 3D y el mockup 2D se tiñen con `PrendaColor.hex` | P0 |
| CT-03 | Elegir talla (si `tallasDisponibles` no vacío) y cantidad (1–500, igual que `crearCotizacionSchema`) | P0 |
| CT-04 | Elegir lados a estampar: Frente, Espalda o ambos (solo los lados con zona definida para esa prenda) | P0 |
| CT-05 | Subir un diseño por lado. El preview es **local** (`URL.createObjectURL`); nada se sube al servidor hasta enviar | P0 |
| CT-06 | Auto-fit del diseño dentro de la zona fija + slider de escala 50–100 % por lado | P0 |
| CT-07 | Preview 3D (orbit limitado, botones **Frente / Espalda** que giran la cámara al lado) | P0 |
| CT-08 | Toggle preview 2D ↔ 3D. Si no hay WebGL, o dispositivo débil/móvil, **arranca en 2D** | P0 |
| CT-09 | Avisos de calidad por lado (no bloquean): resolución baja, fondo no transparente, imagen oscura sobre prenda oscura | P1 |
| CT-10 | Mostrar área máxima real de la zona (`anchoCm × altoCm`) y "desde $precioBase" | P0 |
| CT-11 | Enviar: sube diseños, crea cotización, muestra confirmación (igual que hoy) | P0 |

### 4.2 Admin

| ID | Requisito | Prioridad |
|---|---|---|
| CT-20 | En `/admin/cotizaciones` ver los diseños **por lado** con escala, descargar original, y snapshot de preview si existe | P0 |
| CT-21 | Email al admin lista ambos lados con links | P0 |
| CT-22 | `convertirCotizacionAPedido` conserva ambos diseños en el ítem libre | P0 |
| CT-23 | CRUD de prenda/zonas desde admin | P2 (fuera de v1) |

### 4.3 Plataforma

| ID | Requisito | Prioridad |
|---|---|---|
| CT-12 | Zonas 3D calibrables: seed con valores iniciales + panel debug (solo `NODE_ENV=development`) con sliders position/rotation/size que imprime el JSON a pegar | P1 |
| CT-13 | Snapshot del preview (PNG de frente/espalda) guardado con la cotización para que el admin vea la composición exacta | P1 |
| CT-14 | Limpieza de archivos huérfanos en bucket (>24 h sin cotización asociada) | P1 |

---

## 5. Modelo de datos (migración Prisma)

Principio: **no romper lo existente**. Todo lo nuevo es aditivo; `CotizacionPersonalizada.disenoUrl` se mantiene.

```prisma
enum LadoPrenda {
  Frente
  Espalda
}

/// Zona de impresión fija por prenda y lado. Una fila = un lado imprimible.
model PrendaZona {
  id            String     @id @default(cuid())
  prendaBaseId  String
  prendaBase    PrendaBase @relation(fields: [prendaBaseId], references: [id], onDelete: Cascade)
  lado          LadoPrenda

  // Tamaño real imprimible (cm). Define calidad requerida y, a futuro, precio.
  anchoCm       Decimal
  altoCm        Decimal

  // Preview 2D: rectángulo en % del mockup (0–100)
  x2d           Decimal
  y2d           Decimal
  w2d           Decimal
  h2d           Decimal

  // Preview 3D (Decal): posición/rotación en unidades del modelo (Euler, radianes)
  pos3d         Json       // [x, y, z]
  rot3d         Json       // [x, y, z]
  size3d        Json       // [ancho, alto, profundidad de proyección]

  @@unique([prendaBaseId, lado])
}

/// Un diseño por lado dentro de una cotización.
model CotizacionDiseno {
  id            String                  @id @default(cuid())
  cotizacionId  String
  cotizacion    CotizacionPersonalizada @relation(fields: [cotizacionId], references: [id], onDelete: Cascade)
  lado          LadoPrenda
  disenoUrl     String
  escalaPct     Int                     @default(100) // 50–100
  anchoPx       Int
  altoPx        Int
  previewUrl    String?                 // snapshot de la composición (CT-13)

  @@unique([cotizacionId, lado])
}
```

Cambios en modelos existentes:

| Modelo | Cambio | Motivo |
|---|---|---|
| `PrendaBase` | + `modelo3dUrl String?`, + relación `zonas PrendaZona[]`. `mockupFrenteUrl` / `mockupEspaldaUrl` ya existen. `zonaAnchoCm/AltoCm` quedan **deprecados** (se copian a `PrendaZona.Frente` en la migración y luego se dejan de leer) | Fuente de verdad por lado |
| `CotizacionPersonalizada` | + `disenos CotizacionDiseno[]`. `disenoUrl` se mantiene = diseño del **Frente** (o Espalda si solo hay espalda) para no romper admin, email ni conversión | Compatibilidad |
| `OrderItem` | + `disenoEspaldaUrlLibre String?` (`disenoUrlLibre` = frente) | Conservar ambos lados en el pedido (CT-22) |

Migración de datos: por cada `CotizacionPersonalizada` existente crear un `CotizacionDiseno(lado=Frente, escalaPct=100)` desde `disenoUrl`. `anchoPx/altoPx` desconocidos → `0` (marca "sin dato"; la UI no los muestra si es 0).

**Zod** (`src/lib/schemas.ts`): extender `crearCotizacionSchema`:

```ts
disenos: z.array(z.object({
  lado: z.enum(["Frente", "Espalda"]),
  disenoUrl: z.string().trim().min(1).max(500),
  escalaPct: z.number().int().min(50).max(100),
  anchoPx: z.number().int().positive().max(20000),
  altoPx: z.number().int().positive().max(20000),
  previewUrl: z.string().max(500).optional(),
})).min(1).max(2)
```

Validaciones de servidor en `crearCotizacion` (no confiar en el cliente): lados únicos; cada `lado` debe tener `PrendaZona` para esa prenda; `disenoUrl` debe pertenecer al bucket de diseños (prefijo esperado), no una URL arbitraria.

---

## 6. Modelos 3D

### 6.1 Sourcing (no hay modelos)

Orden de preferencia:

1. **CC0 / licencia comercial verificada** (Poly Pizza, Sketchfab filtrando CC0 o "CC-BY" + atribución, Kenney, etc.). **Registrar licencia y fuente** de cada GLB en `public/models/LICENSES.md`. Sin licencia clara = no entra.
2. **Compra** de modelo con licencia comercial (~US$10–50 c/u).
3. **Encargo a modelador / Blender propio**.

Esfuerzo realista: la polera y el polerón son lo más difícil de conseguir bien (arrugas + capucha); el tote bag es casi una caja plana, lo más fácil. **Hito 0 usa un modelo provisional** (un plano-prenda simple) para destrabar todo el pipeline mientras se consiguen los reales; cambiar de modelo = cambiar `modelo3dUrl` + recalibrar zonas.

### 6.2 Requisitos técnicos del GLB (criterios de aceptación del asset)

| Requisito | Detalle |
|---|---|
| Formato | `.glb` binario, sin texturas embebidas (el color lo da el material) |
| Material base | Un solo material **neutro gris claro/blanco** → el color real es `material.color = hex` (mismo principio que el mockup gris + multiply actual). Probar que negro y blanco se vean bien |
| Orientación | Frente mira a **+Z**, arriba **+Y**, centrado en el origen, altura normalizada ≈ 1 |
| Peso | ≤ 1 MB c/u con compresión Draco/meshopt; ≤ 30k triángulos |
| Malla | Una malla principal nombrada (`body`) para aplicar color y decals |
| Licencia | Documentada (ver arriba) |

Almacenamiento: `public/models/*.glb` (estáticos, cacheables) y `PrendaBase.modelo3dUrl` apunta ahí.

---

## 7. Arquitectura frontend

### 7.1 Dependencias (versión importa)

El proyecto está en **Next 14 + React 18**. `@react-three/fiber` v9 **exige React 19** → usar **fiber `^8`** y **drei `^9`**, con `three` y `@types/three` alineados. Verificar con `npm ls three react` tras instalar.

```bash
npm i three @react-three/fiber@^8 @react-three/drei@^9
npm i -D @types/three
```

### 7.2 Estructura

```
src/components/cotizador/
  CotizadorClient.tsx          # (mover desde app/(tienda)/cotizador) orquestador de estado
  config.ts                    # tipos Prenda/Zona + helpers (escala, fit, calidad)
  PreviewSwitcher.tsx          # decide 2D/3D, toggle, detección WebGL/dispositivo
  Preview2D.tsx                # mockup + tinte + diseño en rect2d (frente/espalda)
  Preview3D.tsx                # next/dynamic(ssr:false) → Scene3D
  Scene3D.tsx                  # <Canvas>, luces, Environment, OrbitControls, cámara por lado
  GarmentModel.tsx             # useGLTF + color + <Decal> por lado
  DesignControls.tsx           # upload por lado, slider escala, avisos de calidad
  SideToggle.tsx               # Frente / Espalda
  DebugZonePanel.tsx           # solo dev (CT-12)
src/lib/cotizador/
  image-meta.ts                # lee ancho/alto/tipo de un File en cliente
  fit.ts                       # cálculo contain + escala dentro de la zona
public/models/                 # GLB + LICENSES.md
```

### 7.3 Estado (en `CotizadorClient`)

```ts
type DisenoLocal = { file: File; objectUrl: string; anchoPx: number; altoPx: number; escalaPct: number };
state: {
  prendaId, colorNombre, talla, cantidad,
  lados: { Frente?: DisenoLocal; Espalda?: DisenoLocal },
  ladoActivo: "Frente" | "Espalda",
  modo: "2d" | "3d",
  contacto: {...}, notas
}
```

`Preview2D` y `Preview3D` reciben exactamente las mismas props (`prenda`, `color`, `lados`, `ladoActivo`) → **una sola fuente de verdad**, los dos previews no se desincronizan.

### 7.4 Preview 3D

- `Canvas` con `dpr={[1, 2]}`, sin sombras, sin postproceso. `Environment preset="studio"` + una luz direccional.
- `GarmentModel`: `useGLTF(modelo3dUrl)`; clonar el material y aplicar `color = hex` (`roughness ≈ 0.9` para look tela). Por cada lado con diseño: `<Decal position rotation scale map={texture} />` con `pos3d/rot3d/size3d` de `PrendaZona`. Espalda = rotación Y π y z negativo.
- Textura del diseño: `colorSpace = SRGBColorSpace`, `anisotropy = renderer max`, **`dispose()`** al reemplazar/desmontar.
- Tamaño del decal: `size3d` × (`escalaPct/100`) manteniendo aspect ratio del diseño dentro de la zona (`fit.ts`).
- Cámara: `OrbitControls` con `enableZoom` limitado (min/max distance), `enablePan={false}`, polar limitado. Al cambiar `ladoActivo`, interpolar azimut a 0 / π. `prefers-reduced-motion` → salto directo, sin animación.
- Carga: `next/dynamic(..., { ssr: false, loading: skeleton })`. `Suspense` + `useGLTF.preload` del modelo de la prenda elegida.
- Robustez: manejar `webglcontextlost` (volver a 2D con aviso); `ErrorBoundary` alrededor del Canvas → fallback 2D.

### 7.5 Preview 2D

Reutiliza la técnica actual (mockup + `mix-blend-multiply` con hex) pero:
- Mockup según `ladoActivo` (`mockupFrenteUrl` / `mockupEspaldaUrl`).
- Rect del diseño desde `PrendaZona.{x2d,y2d,w2d,h2d}` en vez de 45%/22% fijos; `object-contain` + `escalaPct`.
- Sigue siendo `<div>` + `<img>`: cero JS extra, funciona sin WebGL.

### 7.6 Selección de modo y rendimiento

- Por defecto 3D solo si: WebGL disponible **y** no es móvil/dispositivo débil (`matchMedia('(pointer: coarse)')`, `navigator.hardwareConcurrency > 4`). Si no → 2D (el usuario puede forzar 3D).
- El chunk de three/R3F **solo** se carga en `/cotizador` y solo si se activa 3D (import dinámico). No debe aparecer en el bundle de ninguna otra ruta.
- Presupuesto: LCP de `/cotizador` no debe empeorar vs. hoy (el 3D carga después del primer paint); GLB ≤ 1 MB.

### 7.7 Snapshot (CT-13, P1)

Al enviar, si el modo 3D está activo: rotar a cada lado, `gl.render` + `canvas.toBlob('image/png')` (reducido a ≤ 800 px), subir junto al diseño como `previewUrl`. Si estamos en 2D: componer en un `<canvas>` offscreen con mockup + tinte + diseño. Si falla, **no bloquea** el envío.

---

## 8. Cotización y precio

- v1: la UI muestra `desde $precioBase` y la leyenda *"El precio final lo confirma Ajicolor según tu diseño y cantidad"*. No se calcula ni se guarda estimado.
- Punto de extensión: `src/lib/cotizador/pricing.ts` exportando `estimarPrecio(input): { unitario: number; total: number } | null`, que **hoy retorna `null`**. Cuando llegue la tabla de precios:
  1. Definir variables (base por prenda, +lado, tamaño de impresión, tramos por cantidad, tintas/colores) — **pendiente del negocio**.
  2. Guardarlas en BD (p.ej. `PrecioRegla`) o en `StoreSettings`, no hardcodeadas.
  3. Mostrar estimado en UI y guardarlo como `precioEstimado` (distinto de `precioCotizado`, que sigue siendo la decisión final del admin).
- El **servidor** siempre recalcula; nunca confiar en un precio enviado por el cliente.

---

## 9. Seguridad y validación de uploads

Hallazgos del código actual que esta feature **debe corregir** porque la carga se duplica (2 archivos) y es pública/anónima:

| Riesgo actual | Corrección |
|---|---|
| `uploadDisenoCotizador` acepta cualquier `file.type.startsWith("image/")` → pasa `image/svg+xml` al bucket **público** → SVG con `<script>` servido desde el dominio de storage | **v1 solo `image/png`, `image/jpeg`, `image/webp`.** SVG fuera de v1 (si se quiere después: sanitizar server-side y servir con `Content-Disposition`/`Content-Type` seguros) |
| `file.type` lo controla el cliente | Validar **magic bytes** en servidor (PNG `89 50 4E 47`, JPEG `FF D8 FF`, WebP `RIFF…WEBP`) |
| Extensión tomada de `file.name` | Derivarla del MIME validado, nunca del nombre |
| Sin límite de dimensiones | Rechazar > 8000×8000 px (decompression bomb) y leer dimensiones en servidor |
| Subida anónima sin rate limit | Rate limit por IP en la acción de upload (p.ej. 10/10 min) y máx. 2 archivos por envío |
| Archivos huérfanos si el envío falla | Subir **solo al enviar**, hacer cleanup si `crearCotizacion` falla, y job CT-14 para >24 h |
| `disenoUrl` libre en `crearCotizacion` | Validar que la URL empiece por el prefijo del bucket de diseños |
| EXIF con GPS en fotos de celular | Quitar metadatos al procesar (sharp) o, mínimo, no exponerlos en el panel |
| Contenido del email al admin interpola `nombreContacto`/`notas` sin escapar en HTML | Escapar HTML en el template (preexistente, se corrige al tocar el email) |

Privacidad: el diseño puede contener datos personales (fotos). Bucket público con nombres UUID no enumerables es aceptable para v1 (decisión ya tomada para que el admin vea sin URL firmada); revisar con `/privacy-review` si se guardan fotos de personas.

---

## 10. Accesibilidad

- Controles de lado, modo y escala operables por teclado; foco visible; `aria-pressed` en toggles.
- El `<canvas>` lleva `role="img"` + `aria-label` dinámico ("Polera negra, vista frontal, con diseño"); toda la información crítica (lado, color, escala) también está en controles HTML.
- `prefers-reduced-motion`: sin auto-rotación ni animación de cámara.
- Contraste de avisos de calidad AA.

---

## 11. Plan de entrega

| Hito | Contenido | Features | Criterio de salida |
|---|---|---|---|
| **H0** Pipeline | Deps, migración Prisma, `PrendaZona`/`CotizacionDiseno`, seed de zonas, modelo **provisional**, `Preview3D` + `Preview2D` frente/espalda con **polera**, upload local, escala | CT-01..08, CT-10 | Cliente ve su diseño en polera 3D/2D frente y espalda; sin envío aún |
| **H1** Envío end-to-end | Upload validado (§9), `crearCotizacion` con `disenos[]`, email, admin ve ambos lados, conversión a pedido con ambos | CT-11, CT-20..22 | Cotización de punta a punta incluida conversión |
| **H2** Tote bag + Polerón | Modelos reales, zonas calibradas (polerón: bolsillo canguro reduce zona frontal) | CT-12 | 3 prendas operativas |
| **H3** Calidad | Avisos de calidad, snapshot, cleanup huérfanos, a11y, rendimiento móvil | CT-09, CT-13, CT-14 | Checklist §13 completo |
| **H4** Precio | Cuando llegue la tabla de precios | §8 | Aprobación del negocio |

Orden recomendado: H0 con polera → H1 → tote bag (más fácil, valida que la config sirve para otro producto) → polerón.

---

## 12. Preguntas abiertas — resueltas (2026-10-06)

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Tabla de precios | Sigue bloqueando solo H4 (§8). Sin resolver — no bloquea H0–H3. |
| 2 | Origen de los modelos 3D | **H0 arranca con modelo provisional** (plano-prenda simple, ver §6.1) para destrabar el pipeline. Los modelos reales (CC0/compra/encargo) se resuelven en paralelo, antes de H2. |
| 3 | Medidas reales por lado (cm) | **Se estiman al inicio**: `PrendaZona.Frente` y `PrendaZona.Espalda` copian el mismo valor que hoy tiene `PrendaBase.zonaAnchoCm/AltoCm`. Se corrigen después vía el panel debug (CT-12, solo dev) cuando el dueño tenga las medidas reales del taller. |
| 4 | Mockups 2D de espalda | **No existen todavía.** El preview 2D arranca solo con el mockup de Frente; el botón "Espalda" en modo 2D muestra un placeholder simple (igual criterio que el color sólido sin mockup, ya usado en el cotizador actual) hasta que se suban las fotos reales. El preview 3D no depende de esto (usa el modelo GLB, no fotos). |
| 5 | Cliente sin cuenta | **Cambia el comportamiento actual**: `convertirCotizacionAPedido` deja de exigir `customerId` preexistente — si la cotización es de un contacto sin cuenta, crea el `Customer` automáticamente a partir de `emailContacto`/`telefonoContacto`/`nombreContacto` en el momento de convertir. Ya no hace falta que el admin cree el cliente a mano primero. |
| 6 | Aviso al cliente cuando se fija precio | **Entra en el alcance.** Nueva plantilla de email (mismo patrón que `pagoConfirmadoTemplate`, etc.) disparada cuando `actualizarCotizacion` pasa el estado a `Cotizada` con un `precioCotizado` fijado. |
| 7 | Formatos de diseño | **Se amplía más allá de PNG/JPG/WebP**: SVG y PDF también se aceptan, pero el servidor los **convierte a PNG antes de guardar** — nunca se sirve el archivo original (elimina el riesgo de script embebido en SVG servido desde el bucket público, ver §9). Implica sumar una dependencia de rasterizado server-side (`sharp` para SVG; una librería compatible con el runtime de Vercel/Node para PDF — se evalúa al implementar CT-05/H1, documentando la elección aquí). |

### Impacto de estas decisiones en el resto del spec

- **§5 (modelo de datos)**: sin cambios adicionales — `PrendaZona` ya modela frente/espalda por separado (punto 3), y `CotizacionPersonalizada`/`Customer` ya soportan `customerId` opcional (punto 5 es un cambio de lógica en la Server Action, no de schema).
- **§9 (seguridad de uploads)**: la tabla de "Hallazgos" se actualiza — en vez de "v1 solo PNG/JPEG/WebP", ahora es "v1 acepta PNG/JPEG/WebP/SVG/PDF en el cliente, pero el servidor **siempre** persiste PNG/JPEG/WebP tras rasterizar SVG/PDF; el archivo subido original nunca se escribe al bucket tal cual si es SVG o PDF". Esto refuerza, no relaja, la regla de magic bytes: se valida el tipo real del archivo entrante y luego se normaliza la salida.
- **§4.2 Admin (CT-21)**: el email al admin con los diseños por lado sigue igual; ahora además hay un email **al cliente** cuando se fija el precio (nuevo requisito, agregar como CT-24 en la tabla de admin — ver abajo).
- **Nuevo requisito CT-24** (tabla §4.2): "Al pasar una cotización a `Cotizada` con `precioCotizado` fijado, enviar email automático al cliente avisando el precio y que puede confirmar o hacer consultas" — P0 (entra en H1, junto con CT-11/20-22, ya que es parte del mismo flujo de envío end-to-end).

---

## 13. Pruebas y criterios de aceptación

**Unitarias (vitest, ya configurado):**
- `fit.ts`: contain dentro de zona para aspect ratios extremos (panorámico, vertical, cuadrado); `escalaPct` 50/100; clamp fuera de rango.
- Aviso de resolución: px/cm por debajo de umbral → warning; por encima → ok.
- `crearCotizacionSchema`: 0 diseños, 3 diseños, lado duplicado, escala 49/101, URL fuera del bucket → error.
- Validación de magic bytes: PNG/JPEG/WebP válidos pasan; `.png` con contenido SVG/HTML rechazado; SVG rechazado.
- `crearCotizacion`: lado sin `PrendaZona` rechazado; talla obligatoria si la prenda tiene tallas (comportamiento actual preservado).

**Manual / E2E (checklist):**
- [ ] Polera, polerón y tote: cambiar color (claro y oscuro) → modelo y mockup se tiñen igual.
- [ ] Solo frente, solo espalda, ambos: se guardan 1 o 2 `CotizacionDiseno`.
- [ ] Botón Frente/Espalda gira la cámara; el decal de espalda no se ve desde el frente.
- [ ] Diseño panorámico y vertical quedan dentro de la zona; slider 50–100 % funciona.
- [ ] Sin WebGL (forzado) y en móvil → arranca en 2D, todo el flujo funciona.
- [ ] Contexto WebGL perdido → vuelve a 2D con aviso, sin perder los archivos elegidos.
- [ ] Subir `.png` falso (SVG renombrado) y archivo > 10 MB → error claro.
- [ ] Admin ve ambos diseños, fija precio, acepta y convierte a pedido: el pedido conserva frente y espalda.
- [ ] El bundle de otras rutas no incluye three (revisar `next build` output).
- [ ] Teclado completo + lector de pantalla en controles.

**Definición de hecho de cada hito:** tests unitarios verdes, `next build` sin errores de tipos, checklist del hito marcado, sin regresión del cotizador 2D actual (cotizaciones existentes siguen visibles en admin).

---

## 14. Gobierno X-DD

- Cambio de schema y de contrato de `crearCotizacion` = refactor mayor → requiere **`APROBADO`** (Art. 2) antes de implementar.
- Antes de editar símbolos existentes (`crearCotizacion`, `crearCotizacionSchema`, `uploadDisenoCotizador`, `convertirCotizacionAPedido`, `CotizadorClient`): ejecutar `gitnexus_impact` y reportar blast radius.
- Registrar migración con `/db-migrate`, ADR para la decisión Decal + fiber v8 con `/adr-new`, y agregar `CT-*` a `FEATURES.md` al aprobarse.
