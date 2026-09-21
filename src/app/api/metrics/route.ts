import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMetricasResumen } from "@/lib/actions/metrics";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const metricas = await getMetricasResumen();
  return NextResponse.json(metricas);
}
