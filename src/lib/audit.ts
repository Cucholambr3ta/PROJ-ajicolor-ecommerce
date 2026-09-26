import { prisma } from "@/lib/prisma";

/**
 * Registra una acción administrativa en AuditLog. No lanza si falla — la
 * auditoría nunca debe tumbar la operación real que está registrando.
 */
export async function logAudit(params: {
  userId: string;
  entidad: string;
  entidadId: string;
  accion: string;
  payload?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        entidad: params.entidad,
        entidadId: params.entidadId,
        accion: params.accion,
        payload: params.payload ? JSON.stringify(params.payload) : null,
      },
    });
  } catch (err) {
    console.error("Error al registrar auditoría:", err);
  }
}
