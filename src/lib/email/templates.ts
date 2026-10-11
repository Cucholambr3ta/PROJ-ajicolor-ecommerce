import { formatCLP, formatFecha } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Colores reales de marca (tailwind.config.ts: ajicolor.*) — los clientes
// de email no leen CSS externo, así que se repiten como hex inline.
const COLOR_MAGENTA = "#e84266";
const COLOR_PURPLE = "#4f266a";
const COLOR_YELLOW = "#ffd141";
const COLOR_INK = "#1a1a1a";

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid ${COLOR_INK};">
            <tr>
              <td style="background-color:#ffffff;padding:24px 20px;text-align:center;border-bottom:2px solid ${COLOR_INK};">
                <img src="${SITE_URL}/logo/logo.png" alt="Ajicolor" width="180" style="display:block;margin:0 auto;height:auto;max-width:180px;" />
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;color:${COLOR_INK};font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background-color:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
                <span style="color:#999;font-size:11px;">${title} · Ajicolor</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:${COLOR_YELLOW};color:${COLOR_INK};font-weight:bold;text-decoration:none;padding:12px 24px;margin:16px 0;border:2px solid ${COLOR_INK};">${label}</a>`;
}

function numeroPedido(numero: number): string {
  return `<strong style="color:${COLOR_MAGENTA};">#${String(numero).padStart(4, "0")}</strong>`;
}

export function verifyEmailTemplate(params: { nombre: string; token: string }) {
  const url = `${SITE_URL}/verificar?token=${params.token}`;
  return {
    subject: "Verifica tu email en Ajicolor",
    html: layout(
      "Verificación de email",
      `<p>Hola ${params.nombre},</p>
       <p>Gracias por crear tu cuenta en Ajicolor. Confirma tu email para activarla:</p>
       ${button(url, "Verificar mi email")}
       <p style="color:#999;font-size:12px;">Si no creaste esta cuenta, ignora este correo.</p>`
    ),
  };
}

export function resetPasswordTemplate(params: { nombre: string; token: string }) {
  const url = `${SITE_URL}/restablecer?token=${params.token}`;
  return {
    subject: "Recupera tu contraseña en Ajicolor",
    html: layout(
      "Recuperación de contraseña",
      `<p>Hola ${params.nombre},</p>
       <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace vence en 1 hora:</p>
       ${button(url, "Restablecer contraseña")}
       <p style="color:#999;font-size:12px;">Si no solicitaste esto, ignora este correo — tu contraseña no cambiará.</p>`
    ),
  };
}

interface OrderItemSummary {
  nombre: string;
  talle: string | null;
  color: string;
  cantidad: number;
  precioUnit: number;
}

function itemsTable(items: OrderItemSummary[]): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee;">${item.nombre}${item.talle ? ` (${item.talle}/${item.color})` : ` (${item.color})`} ×${item.cantidad}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">${formatCLP(item.cantidad * item.precioUnit)}</td>
      </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:13px;">${rows}</table>`;
}

export function pedidoRecibidoTemplate(params: {
  nombre: string;
  numero: number;
  items: OrderItemSummary[];
  total: number;
  datosBancarios: {
    titular: string | null;
    rut: string | null;
    banco: string | null;
    tipoCuenta: string | null;
    numeroCuenta: string | null;
    email: string | null;
  };
}) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `Pedido #${numeroFmt} recibido — pendiente de pago`,
    html: layout(
      "Pedido recibido",
      `<p>Hola ${params.nombre},</p>
       <p>Recibimos tu pedido ${numeroPedido(params.numero)} por ${formatCLP(params.total)}.</p>
       ${itemsTable(params.items)}
       <p><strong>Transfiere a:</strong></p>
       <p style="font-size:13px;">
         ${params.datosBancarios.titular ?? "—"}<br/>
         RUT: ${params.datosBancarios.rut ?? "—"}<br/>
         ${params.datosBancarios.banco ?? "—"} · ${params.datosBancarios.tipoCuenta ?? "—"}<br/>
         Cuenta: ${params.datosBancarios.numeroCuenta ?? "—"}<br/>
         Correo: ${params.datosBancarios.email ?? "—"}
       </p>
       <p>Indica tu número de pedido en el comentario de la transferencia y luego sube tu comprobante en el sitio.</p>
       ${button(`${SITE_URL}/pedido/${params.numero}`, "Ver mi pedido")}`
    ),
  };
}

export function comprobanteRecibidoTemplate(params: { nombre: string; numero: number }) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `Comprobante recibido — pedido #${numeroFmt}`,
    html: layout(
      "Comprobante en revisión",
      `<p>Hola ${params.nombre},</p>
       <p>Recibimos el comprobante de tu pedido ${numeroPedido(params.numero)} y lo estamos revisando. Te avisaremos apenas confirmemos el pago.</p>`
    ),
  };
}

export function pagoConfirmadoTemplate(params: { nombre: string; numero: number; fechaCompromiso: Date | null }) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `Pago confirmado — pedido #${numeroFmt} en producción`,
    html: layout(
      "Pago confirmado",
      `<p>Hola ${params.nombre},</p>
       <p>Confirmamos el pago de tu pedido ${numeroPedido(params.numero)}. Ya está en producción.</p>
       ${params.fechaCompromiso ? `<p>Fecha estimada de despacho: <strong>${formatFecha(params.fechaCompromiso)}</strong>.</p>` : ""}
       ${button(`${SITE_URL}/pedido/${params.numero}`, "Ver mi pedido")}`
    ),
  };
}

export function pedidoEnviadoTemplate(params: {
  nombre: string;
  numero: number;
  transportista: string | null;
  trackingNumber: string | null;
}) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  const tracking =
    params.transportista && params.trackingNumber
      ? `<p>Transportista: <strong>${params.transportista}</strong><br/>Número de seguimiento: <strong>${params.trackingNumber}</strong></p>`
      : "";
  return {
    subject: `Tu pedido #${numeroFmt} fue enviado`,
    html: layout(
      "Pedido enviado",
      `<p>Hola ${params.nombre},</p>
       <p>Tu pedido ${numeroPedido(params.numero)} ya está en camino.</p>
       ${tracking}
       ${button(`${SITE_URL}/pedido/${params.numero}`, "Ver mi pedido")}`
    ),
  };
}

export function pedidoEntregadoTemplate(params: { nombre: string; numero: number }) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `¡Tu pedido #${numeroFmt} llegó!`,
    html: layout(
      "Pedido entregado",
      `<p>Hola ${params.nombre},</p>
       <p>Tu pedido ${numeroPedido(params.numero)} fue entregado. Esperamos que te encante tu polera.</p>
       <p>Si tienes un minuto, nos encantaría leer tu opinión.</p>
       ${button(`${SITE_URL}/pedido/${params.numero}`, "Ver mi pedido")}`
    ),
  };
}

export function avisoNuevoPedidoDuenoTemplate(params: { numero: number; nombreCliente: string; total: number }) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `Nuevo pedido #${numeroFmt} — ${formatCLP(params.total)}`,
    html: layout(
      "Nuevo pedido",
      `<p>Nuevo pedido ${numeroPedido(params.numero)} de ${params.nombreCliente} por ${formatCLP(params.total)}.</p>
       ${button(`${SITE_URL}/admin/pedidos`, "Ver en el panel")}`
    ),
  };
}

export function avisoComprobanteSubidoDuenoTemplate(params: { numero: number; nombreCliente: string }) {
  const numeroFmt = String(params.numero).padStart(4, "0");
  return {
    subject: `Comprobante subido — pedido #${numeroFmt}`,
    html: layout(
      "Comprobante subido",
      `<p>${params.nombreCliente} subió el comprobante de pago del pedido ${numeroPedido(params.numero)}.</p>
       ${button(`${SITE_URL}/admin/pedidos`, "Revisar en el panel")}`
    ),
  };
}

export function stockBajoTemplate(params: {
  producto: string;
  talle: string;
  color: string;
  sku: string;
  stock: number;
  stockMin: number;
}) {
  return {
    subject: `Stock bajo — ${params.producto} (${params.talle}/${params.color})`,
    html: layout(
      "Stock bajo",
      `<p>El stock de <strong>${params.producto}</strong> (${params.talle}/${params.color}, SKU <span style="font-family:monospace;">${params.sku}</span>) llegó a <strong style="color:${COLOR_MAGENTA};">${params.stock} unidad${params.stock === 1 ? "" : "es"}</strong>, igual o por debajo del mínimo configurado (${params.stockMin}).</p>
       ${button(`${SITE_URL}/admin/stock`, "Ver stock en el panel")}`
    ),
  };
}
