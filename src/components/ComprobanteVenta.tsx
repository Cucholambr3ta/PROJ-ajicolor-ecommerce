import { formatCLP, formatFechaCorta } from "@/lib/format";

interface ComprobanteItem {
  nombre: string;
  detalle: string;
  cantidad: number;
  precioUnit: number;
}

interface ComprobanteVentaProps {
  numero: number;
  fecha: Date;
  cliente: { nombre: string; email: string; rut?: string | null };
  items: ComprobanteItem[];
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  emisor: {
    razonSocial: string | null;
    rut: string | null;
    direccionLegal: string | null;
    emailContacto: string | null;
  };
}

/**
 * Comprobante de venta interno — NO es un documento tributario (boleta o
 * factura electrónica, que requieren certificado digital y folios CAF del
 * SII). Sirve como respaldo de la venta mientras se resuelve ese tema por
 * fuera del sistema. Pensado para imprimirse o guardarse como PDF desde el
 * propio navegador (Ctrl/Cmd+P → Guardar como PDF).
 */
export function ComprobanteVenta({
  numero,
  fecha,
  cliente,
  items,
  subtotal,
  costoEnvio,
  descuento,
  total,
  emisor,
}: ComprobanteVentaProps) {
  const numeroFmt = String(numero).padStart(4, "0");

  return (
    <div className="comprobante max-w-2xl mx-auto p-8 bg-white text-black">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">{emisor.razonSocial ?? "Ajicolor"}</h1>
          {emisor.rut && <p className="text-sm">RUT: {emisor.rut}</p>}
          {emisor.direccionLegal && <p className="text-sm">{emisor.direccionLegal}</p>}
          {emisor.emailContacto && <p className="text-sm">{emisor.emailContacto}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Comprobante de venta</p>
          <p className="text-xl font-black">N° {numeroFmt}</p>
          <p className="text-sm">{formatFechaCorta(fecha)}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Cliente</p>
        <p className="text-sm font-medium">{cliente.nombre}</p>
        <p className="text-sm">{cliente.email}</p>
        {cliente.rut && <p className="text-sm">RUT: {cliente.rut}</p>}
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Descripción</th>
            <th className="py-2 text-right">Cant.</th>
            <th className="py-2 text-right">Precio unit.</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="py-2">
                {item.nombre}
                <br />
                <span className="text-xs text-gray-500">{item.detalle}</span>
              </td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatCLP(item.precioUnit)}</td>
              <td className="py-2 text-right">{formatCLP(item.cantidad * item.precioUnit)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCLP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{formatCLP(costoEnvio)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>-{formatCLP(descuento)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg border-t-2 border-black pt-2 mt-2">
            <span>Total</span>
            <span>{formatCLP(total)}</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-10 text-center">
        Este documento es un comprobante de venta interno y no constituye boleta ni factura electrónica.
      </p>
    </div>
  );
}
