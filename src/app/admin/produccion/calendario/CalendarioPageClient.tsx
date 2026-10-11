"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface LoteDia {
  id: string;
  dia: number;
  supplier: string;
  unidades: number;
  estado: string;
}

interface PedidoDia {
  id: string;
  numero: number;
  dia: number;
  cliente: string;
  estado: string;
}

export default function CalendarioPageClient({
  anio,
  mes,
  lotes,
  pedidos,
}: {
  anio: number;
  mes: number;
  lotes: LoteDia[];
  pedidos: PedidoDia[];
}) {
  const router = useRouter();

  const primerDiaMes = new Date(anio, mes, 1);
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  // getDay(): 0=domingo..6=sábado → reordenamos para que la semana empiece en lunes
  const offsetInicio = (primerDiaMes.getDay() + 6) % 7;

  const celdas: (number | null)[] = [
    ...Array(offsetInicio).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  function irAMes(delta: number) {
    const nuevaFecha = new Date(anio, mes + delta, 1);
    router.push(`/admin/produccion/calendario?mes=${nuevaFecha.getFullYear()}-${nuevaFecha.getMonth() + 1}`);
  }

  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => irAMes(-1)}
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
        >
          ← Anterior
        </button>
        <h2 className="font-black text-lg dark:text-neutral-100">
          {MESES[mes]} {anio}
        </h2>
        <button
          onClick={() => irAMes(1)}
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
        >
          Siguiente →
        </button>
      </div>

      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-ajicolor-purple inline-block rounded-sm" /> Lote de producción
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-ajicolor-magenta inline-block rounded-sm" /> Compromiso de entrega
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-neutral-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`empty-${i}`} className="min-h-[90px]" />;
          const lotesDia = lotes.filter((l) => l.dia === dia);
          const pedidosDia = pedidos.filter((p) => p.dia === dia);
          const esHoy = esMesActual && hoy.getDate() === dia;
          return (
            <div
              key={dia}
              className={`min-h-[90px] border thick-border p-1.5 text-xs ${
                esHoy ? "bg-ajicolor-yellow/30" : "bg-white dark:bg-neutral-900"
              }`}
            >
              <p className="font-bold mb-1 dark:text-neutral-100">{dia}</p>
              <div className="space-y-1">
                {lotesDia.map((l) => (
                  <Link
                    key={l.id}
                    href={`/admin/produccion/${l.id}`}
                    className="block bg-ajicolor-purple text-white px-1.5 py-0.5 rounded truncate hover:opacity-90"
                    title={`${l.supplier} — ${l.unidades}u — ${l.estado}`}
                  >
                    {l.supplier} ({l.unidades}u)
                  </Link>
                ))}
                {pedidosDia.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/pedidos/${p.id}`}
                    className="block bg-ajicolor-magenta text-white px-1.5 py-0.5 rounded truncate hover:opacity-90"
                    title={`Pedido #${String(p.numero).padStart(4, "0")} — ${p.cliente}`}
                  >
                    #{String(p.numero).padStart(4, "0")}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {lotes.length === 0 && pedidos.length === 0 && (
        <p className="text-center text-gray-400 dark:text-neutral-500 text-sm mt-6">
          Sin lotes ni compromisos de entrega para este mes.
        </p>
      )}
    </div>
  );
}
