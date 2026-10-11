import { formatFechaCorta } from "@/lib/format";

interface EtiquetaItem {
  nombre: string;
  talle: string;
  color: string;
  cantidad: number;
  imagenUrl: string | null;
}

interface EtiquetaEnvioProps {
  numero: number;
  fecha: Date;
  cliente: { nombre: string; email: string } | null;
  items: EtiquetaItem[];
  envio: {
    nombre: string | null;
    telefono: string | null;
    calle: string | null;
    numero: string | null;
    comuna: string | null;
    region: string | null;
  };
  metodoEnvioLabel: string | null;
  shipmentExtra: { sucursal: string | null; estacionMetro: string | null; porPagar: boolean } | null;
}

/**
 * Etiqueta de despacho para pegar en el paquete — se imprime por separado
 * del comprobante de venta (que es el respaldo de la transacción, no un
 * identificador físico del bulto). La hoja se divide exactamente a la
 * mitad (50/50, con línea de doblez) para doblarla físicamente y dejarla
 * en el packaging: arriba el resumen de qué se compró (chico, para control
 * interno), abajo los datos de envío en letra grande (lo único que importa
 * al mirar el paquete desde lejos para separar un pedido de otro).
 */
export function EtiquetaEnvio({ numero, fecha, cliente, items, envio, metodoEnvioLabel, shipmentExtra }: EtiquetaEnvioProps) {
  const direccionCompleta = [envio.calle && envio.numero ? `${envio.calle} ${envio.numero}` : envio.calle, envio.comuna, envio.region]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="etiqueta-envio max-w-2xl mx-auto bg-white text-black flex flex-col h-screen">
      {/* Mitad 1: resumen del pedido — chico, arriba de la línea de doblez */}
      <section className="etiqueta-mitad flex-1 border-2 border-black p-4 flex flex-col justify-center overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="font-black text-lg">Pedido #{String(numero).padStart(4, "0")}</p>
          <p className="text-xs">{formatFechaCorta(fecha)}</p>
        </div>
        {cliente && (
          <p className="text-xs mb-2">
            Cliente: {cliente.nombre} — {cliente.email}
          </p>
        )}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-1"></th>
              <th className="py-1">Producto</th>
              <th className="py-1">Talla / Color</th>
              <th className="py-1 text-right">Cant.</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-300 last:border-0">
                <td className="py-1 pr-2">
                  {item.imagenUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagenUrl} alt={item.nombre} className="w-10 h-10 object-cover border border-black" />
                  )}
                </td>
                <td className="py-1">{item.nombre}</td>
                <td className="py-1">
                  {item.talle} / {item.color}
                </td>
                <td className="py-1 text-right font-medium">{item.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Línea de doblez */}
      <div className="etiqueta-doblez py-1">
        <span className="block border-t border-dashed border-gray-400" />
      </div>

      {/* Mitad 2: datos de envío — grande, para identificar el bulto */}
      <section className="etiqueta-mitad flex-1 border-4 border-black p-8 flex flex-col justify-center overflow-hidden">
        <p className="text-xs font-bold uppercase tracking-widest mb-4 border-b-2 border-black pb-2">
          Datos de envío
        </p>
        <p className="text-4xl font-black leading-tight mb-4">{envio.nombre ?? "—"}</p>
        <p className="text-2xl font-bold leading-snug mb-2">{direccionCompleta || "Sin dirección registrada"}</p>
        {envio.telefono && <p className="text-xl font-semibold mb-4">Tel: {envio.telefono}</p>}

        {(metodoEnvioLabel || shipmentExtra) && (
          <div className="mt-6 pt-4 border-t-2 border-black text-lg font-semibold space-y-1">
            {metodoEnvioLabel && <p>Método: {metodoEnvioLabel}</p>}
            {shipmentExtra?.sucursal && <p>Sucursal: {shipmentExtra.sucursal}</p>}
            {shipmentExtra?.estacionMetro && <p>Estación: {shipmentExtra.estacionMetro}</p>}
            {shipmentExtra?.porPagar && <p className="uppercase">Por pagar</p>}
          </div>
        )}
      </section>
    </div>
  );
}
