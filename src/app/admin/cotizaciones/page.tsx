import { getCotizacionesAdmin, getCotizacionesMetrics } from "@/lib/actions/cotizador";
import CotizacionesPageClient from "./CotizacionesPageClient";

export const dynamic = "force-dynamic";

export default async function CotizacionesPage() {
  const [cotizaciones, metrics] = await Promise.all([getCotizacionesAdmin(), getCotizacionesMetrics()]);

  return (
    <CotizacionesPageClient
      cotizaciones={cotizaciones.map((c) => ({
        id: c.id,
        nombreContacto: c.nombreContacto,
        emailContacto: c.emailContacto,
        telefonoContacto: c.telefonoContacto,
        prenda: c.prendaBase.nombre,
        colorNombre: c.colorNombre,
        talla: c.talla,
        cantidad: c.cantidad,
        disenoUrl: c.disenoUrl,
        notas: c.notas,
        precioCotizado: c.precioCotizado != null ? Number(c.precioCotizado) : null,
        estado: c.estado,
        createdAt: c.createdAt,
        tieneCliente: c.customerId != null,
        orderNumero: c.order?.numero ?? null,
      }))}
      metrics={metrics}
    />
  );
}
