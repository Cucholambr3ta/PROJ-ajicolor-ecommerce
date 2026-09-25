import { formatCLP, formatFecha } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:2px solid #1a1a1a;">
            <tr>
              <td style="background-color:#c026d3;padding:20px;text-align:center;">
                <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:1px;">AJICOLOR</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;color:#1a1a1a;font-size:14px;line-height:1.6;">
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
  return `<a href="${href}" style="display:inline-block;background-color:#ffd141;color:#1a1a1a;font-weight:bold;text-decoration:none;padding:12px 24px;margin:16px 0;border:2px solid #1a1a1a;">${label}</a>`;
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
  talle: string;
  color: string;
  cantidad: number;
  precioUnit: number;
}

function itemsTable(items: OrderItemSummary[]): string {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee;">${item.nombre} (${item.talle}/${item.color}) ×${item.cantidad}</td>
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
       <p>Recibimos tu pedido <strong>#${numeroFmt}</strong> por ${formatCLP(params.total)}.</p>
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
       <p>Recibimos el comprobante de tu pedido <strong>#${numeroFmt}</strong> y lo estamos revisando. Te avisaremos apenas confirmemos el pago.</p>`
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
       <p>Confirmamos el pago de tu pedido <strong>#${numeroFmt}</strong>. Ya está en producción.</p>
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
       <p>Tu pedido <strong>#${numeroFmt}</strong> ya está en camino.</p>
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
       <p>Tu pedido <strong>#${numeroFmt}</strong> fue entregado. Esperamos que te encante tu polera.</p>
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
      `<p>Nuevo pedido de ${params.nombreCliente} por ${formatCLP(params.total)}.</p>
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
      `<p>${params.nombreCliente} subió el comprobante de pago del pedido <strong>#${numeroFmt}</strong>.</p>
       ${button(`${SITE_URL}/admin/pedidos`, "Revisar en el panel")}`
    ),
  };
}
