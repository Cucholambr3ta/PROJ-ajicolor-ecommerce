# Pendientes de Ajicolor (dueño de la marca)

Información y decisiones que solo el dueño de la marca puede entregar. El desarrollo sigue
avanzando sin esto, pero estos puntos bloquean poder publicar el sitio en producción.

---

## 1. Datos legales del proveedor (bloqueante para publicar)

Exigido por la **Ley N° 19.496** (Protección al Consumidor, Art. 28 y 32) para todo comercio
a distancia en Chile. Sin esto, `/contacto` y `/terminos` quedan con placeholders `[COMPLETAR]`
visibles al público — no se puede publicar así.

- [ ] **Razón social** (nombre legal de la empresa o persona natural con giro)
- [ ] **RUT**
- [ ] **Domicilio legal / dirección comercial** (para efectos de reclamos y notificaciones)
- [ ] **Email de contacto** para consultas y reclamos
- [ ] **Teléfono / WhatsApp** de atención al cliente
- [ ] **Redes sociales** (Instagram, TikTok, etc. — para el footer y `/contacto`)
- [ ] **Horario de atención**

Archivos que usan esta información: [src/app/contacto/page.tsx](src/app/contacto/page.tsx),
[src/app/terminos/page.tsx](src/app/terminos/page.tsx).

---

## 2. Base de datos de producción

- [ ] **Credenciales de Supabase** (`DATABASE_URL`) para validar el esquema Postgres contra la
      instancia real. Hoy el desarrollo corre contra un Postgres local en Docker (temporal, se
      descarta). *(Mencionaste que las tendrías disponibles próximamente.)*

---

## 3. Medio de pago

Hoy el checkout queda armado para **transferencia manual** (`estadoPago: PendienteTransferencia`),
sin pasarela real conectada. Cuando se quiera cobrar con tarjeta en línea, se necesita decidir y
gestionar:

- [ ] **Proveedor de pago**: Webpay Plus, Flow, MercadoPago u otro
- [ ] Cuenta comercial habilitada con ese proveedor (credenciales API, contrato comercial)
- [ ] Datos bancarios para mostrar en la confirmación de pedido si se mantiene transferencia
      manual como opción (nombre titular, banco, tipo de cuenta, número, RUT)

---

## 4. Envíos

- [ ] **Transportista(s) a usar** (Chilexpress, Starken, Correos de Chile, etc.) y si hay tarifas
      pactadas o se cobra según cotización manual
- [ ] **Costo de envío**: tabla fija por comuna/región, tarifa plana, o gratis sobre cierto monto
- [ ] Si se integrará tracking automático del transportista o el seguimiento seguirá siendo manual
      (ingresado por el admin)

---

## 5. Catálogo y contenido

- [x] **Confirmado**: los 44 productos actuales son solo un set de prueba. Cuando esté la idea de
      producto completa, se hará una carga masiva a la base de datos. El panel admin ya tiene
      `/admin/catalogo/nuevo` (crear producto individual) — la carga masiva (CSV/Excel → BD) no
      está desarrollada aún y se puede agregar cuando definan el formato de esa carga.
- [ ] **Precio de venta real** por producto (hoy todos están en $16.990 CLP como placeholder,
      hasta que llegue el catálogo definitivo)
- [ ] Política de **stock mínimo** por variante (hoy default arbitrario de 5 unidades)

---

## 6. Páginas y contenido de marca

- [x] **"Conoce al Ají"** (la página "nosotros") ya existe en `/conoce-al-aji` con copy de marca
      real, no placeholder — no requiere nada de tu parte por ahora, salvo que quieras revisarla
      o ampliarla.
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

## 7. Opcional / futuro

- [ ] Número de **WhatsApp Business** si se quiere integrar el botón de contacto directo (F42 del
      plan original, no desarrollado aún)
- [ ] Definir si se lanzan **"drops" limitados** (colecciones con fecha de caída) — está en la
      documentación de dominio pero no implementado
- [ ] **Formato de carga masiva de productos** (CSV, Excel, u otro) cuando esté listo el catálogo
      definitivo — define la estructura del importador que se construya
