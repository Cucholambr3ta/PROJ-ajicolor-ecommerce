import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/auth-guard";
import { getMetricasResumen } from "@/lib/actions/metrics";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(session.user.rol as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  const metricas = await getMetricasResumen();
  return NextResponse.json(metricas);
}
