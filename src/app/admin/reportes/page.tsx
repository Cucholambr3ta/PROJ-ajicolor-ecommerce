import { Card } from "@/components/ui/card";
import { getReporteEnvios, getRotacionStock, getReporteMargen } from "@/lib/actions/metrics";
import { formatCLP } from "@/lib/format";
import ExportButtons from "./ExportButtons";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const [envios, rotacion, margen] = await Promise.all([
    getReporteEnvios(),
    getRotacionStock(),
    getReporteMargen(),
  ]);

  const topRotacion = rotacion.slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-neutral-400">Tiempo promedio de entrega</p>
          <p className="text-2xl font-bold">{envios.tiempoPromedioDias} días</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-neutral-400">Costo promedio de envío</p>
          <p className="text-2xl font-bold">${envios.costoPromedio.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500 dark:text-neutral-400">Envíos entregados</p>
          <p className="text-2xl font-bold">{envios.totalEnviosEntregados}</p>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Rotación de stock (últimos 30 días)</h2>
        {topRotacion.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Sin movimientos de salida registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="pb-2">SKU</th>
                <th className="pb-2">Producto</th>
                <th className="pb-2">Talle/Color</th>
                <th className="pb-2 text-right">Stock actual</th>
                <th className="pb-2 text-right">Vendido 30d</th>
                <th className="pb-2 text-right">Rotación</th>
              </tr>
            </thead>
            <tbody>
              {topRotacion.map((r) => (
                <tr key={r.sku} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="py-2 font-mono text-xs">{r.sku}</td>
                  <td className="py-2">{r.producto}</td>
                  <td className="py-2">{r.talle} / {r.color}</td>
                  <td className="py-2 text-right">{r.stockActual}</td>
                  <td className="py-2 text-right">{r.unidadesVendidas30d}</td>
                  <td className="py-2 text-right font-medium">{r.rotacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Margen por producto (últimos 90 días)</h2>
        {margen.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Sin ventas pagadas en el período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="pb-2">Producto</th>
                <th className="pb-2 text-right">Unidades</th>
                <th className="pb-2 text-right">Ingresos</th>
                <th className="pb-2 text-right">Costos</th>
                <th className="pb-2 text-right">Margen</th>
                <th className="pb-2 text-right">Margen %</th>
              </tr>
            </thead>
            <tbody>
              {margen.map((m) => (
                <tr key={m.nombre} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="py-2">{m.nombre}</td>
                  <td className="py-2 text-right">{m.unidades}</td>
                  <td className="py-2 text-right">{formatCLP(m.ingresos)}</td>
                  <td className="py-2 text-right">{formatCLP(m.costos)}</td>
                  <td className="py-2 text-right font-medium">{formatCLP(m.margen)}</td>
                  <td className="py-2 text-right">{m.margenPorcentaje.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Exportar datos</h2>
        <ExportButtons />
      </Card>
    </div>
  );
}
