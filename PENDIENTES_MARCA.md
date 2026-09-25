# Pendientes de Ajicolor (dueño de la marca)

Información y decisiones que solo el dueño de la marca puede entregar. El desarrollo sigue
avanzando sin esto, pero estos puntos bloquean poder publicar el sitio en producción.

---

## 1. Datos legales del proveedor (bloqueante para publicar)

Exigido por la **Ley N° 19.496** (Protección al Consumidor, Art. 28 y 32) para todo comercio
a distancia en Chile. Sin lo que falta acá, `/contacto` y `/terminos` quedan con placeholders
`[COMPLETAR]` visibles al público — no se puede publicar así.

- [ ] **Razón social** (nombre legal de la empresa o persona natural con giro)
- [ ] **RUT** (de la razón social/proveedor — no confundir con el RUT de la cuenta bancaria, ya
      recibido en la sección 3)
- [ ] **Domicilio legal / dirección comercial** (para efectos de reclamos y notificaciones)
- [x] **Email de contacto**: ajicolorserigrafia28@gmail.com
- [x] **Teléfono / WhatsApp**: +56 9 7828 3064
- [x] **Redes sociales**: Instagram @el_aji_color_estampados · Facebook "El Ají Color Diseño y
      Estampados" · TikTok @el.aji.color.esta
- [x] **Horario de atención**: Lunes a viernes 09:00–19:00 hrs, sábado 09:00–14:00 hrs

Ya cargados en [src/app/contacto/page.tsx](src/app/contacto/page.tsx) y el footer. Falta razón
social/RUT/domicilio para completar también [src/app/terminos/page.tsx](src/app/terminos/page.tsx).

---

## 2. Base de datos de producción

- [x] **Resuelto**: credenciales de Supabase recibidas y configuradas. El schema está sincronizado
      (`prisma db push`) y la base sembrada con datos de prueba contra la instancia real
      (44 productos, 3 clientes, 6 pedidos). El desarrollo ya no depende del Postgres local en Docker.

---

## 3. Medio de pago

El checkout queda armado para **transferencia manual** (`estadoPago: PendienteTransferencia`).

- [x] **Datos bancarios recibidos y cargados** en la confirmación de pedido
      (`/pedido/[numero]`): Camilo Alexander Morales Opazo, RUT 17.070.384-7, Banco Tenpo,
      Cuenta Vista N° 111117070384.
- [ ] **Proveedor de pago online** (Webpay Plus, Flow, MercadoPago u otro): sigue sin definir.
      Mientras no se decida, el flujo queda 100% en transferencia manual. Cuando se quiera cobrar
      con tarjeta, se necesita la cuenta comercial habilitada con ese proveedor.

---

## 4. Envíos

- [x] **Transportistas confirmados**:
  - **Correos de Chile**: tarifa fija $3.000 CLP a sucursal — ya cargada como costo de envío en
    el checkout.
  - **Starken** (u otros): envío por pagar (tarifa variable, no fija) — hoy el checkout no lo
    ofrece como opción porque no hay un monto fijo que calcular. Si querés ofrecerlo, hay que
    definir cómo se cotiza (¿el cliente paga al recibir? ¿se cotiza manual antes de confirmar?).
  - **Entrega en persona por metro** (línea 1, Manquehue–Los Héroes, desde las 18:00 hrs): no está
    implementada como opción de envío — es una modalidad adicional a definir si se agrega al
    checkout o se coordina manualmente por WhatsApp.
- [x] **Seguimiento**: confirmado que sigue siendo manual (el admin ingresa tracking en el panel).

---

## 5. Catálogo y contenido

- [x] **Confirmado**: los 44 productos actuales son solo un set de prueba. Cuando esté la idea de
      producto completa, se hará una carga masiva a la base de datos. El panel admin ya tiene
      `/admin/catalogo/nuevo` (crear producto individual) — la carga masiva (CSV/Excel → BD) no
      está desarrollada aún y se puede agregar cuando definan el formato de esa carga.
- [ ] **Precio de venta real** por producto (hoy todos están en $16.990 CLP como placeholder,
      hasta que llegue el catálogo definitivo)
- [x] **Aclarado**: no hay política de stock mínimo por variante — la política real es de
      **producción**: el plazo de fabricación es de 5 a 7 días hábiles desde que se confirma el
      pago (depósito/transferencia). Ya reflejado en `/devoluciones` y en la confirmación de pedido.

---

## 6. Páginas y contenido de marca

- [x] **"Conoce al Ají"**: actualizada con la historia real de la marca (origen 2020, el
      fundador, el significado del nombre) que enviaste — reemplaza el copy genérico anterior.
- [ ] **Imagen para compartir en redes** (Open Graph / social preview): hoy el sitio no tiene
      imagen de vista previa al compartir un link en WhatsApp, Instagram o Facebook. Se necesita
      una imagen horizontal (1200×630 px aprox.) con el logo/mascota — puede ser una pieza gráfica
      nueva o una versión del material ya entregado.
- [ ] **Favicon final**: existe `favicon-source.png` en el proyecto pero no está confirmado como
      definitivo — confirmar o reemplazar.
- [ ] **Copy legal de "Términos y condiciones" y "Devoluciones"**: ya redactados con la Ley 19.496
      como base, pero conviene que los revise el dueño de la marca (o un abogado) antes de publicar,
      sobre todo la política de cambios/devoluciones (plazos, estado del producto, quién paga el
      envío de vuelta).
- [ ] **Link de Facebook exacto**: diste el nombre de la página ("El Ají Color Diseño y
      Estampados") pero no la URL directa — el footer hoy enlaza a una búsqueda de Facebook en vez
      del perfil exacto. Pasame el link y lo actualizo.

---

## 7. Opcional / futuro

- [ ] Número de **WhatsApp Business** si se quiere integrar el botón de contacto directo (F42 del
      plan original, no desarrollado aún) — podría ser el mismo +56 9 7828 3064 ya recibido, a
      confirmar.
- [x] **Confirmado**: sí habrá drops/colecciones limitadas — duran 1 mes, van rotando, cada una es
      de poleras de mayor calidad 100% serigrafía, con 4 a 6 modelos por colección. Sigue sin
      implementarse en el modelo de datos (no hay tabla `Drop` ni fecha de vigencia por colección)
      — es una feature nueva a planificar cuando se quiera lanzar el primer drop real.
- [ ] **Formato de carga masiva de productos** (CSV, Excel, u otro) cuando esté listo el catálogo
      definitivo — define la estructura del importador que se construya
