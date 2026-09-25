import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Ajicolor <no-responder@ajicolor.cl>";

/**
 * Envía un correo transaccional vía Resend. Si no hay RESEND_API_KEY
 * configurada (ej. antes de tener dominio propio), no hace nada — el resto
 * del flujo (pedido, pago, etc.) sigue funcionando igual. Un fallo de envío
 * nunca debe revertir una transacción de negocio: se llama siempre fuera de
 * cualquier `$transaction` y se atrapa el error internamente.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY no configurada — se omite envío a ${params.to}: ${params.subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    console.error("[email] Error al enviar", err);
  }
}
