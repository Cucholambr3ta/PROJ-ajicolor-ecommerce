"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function VentasChart({ data }: { data: { fecha: string; total: number }[] }) {
  const chartData = data.map((d) => ({
    fecha: d.fecha.slice(5),
    total: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} interval={4} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Ventas"]}
          labelFormatter={(label) => `Fecha: ${label}`}
        />
        <Line type="monotone" dataKey="total" stroke="#e91e63" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
