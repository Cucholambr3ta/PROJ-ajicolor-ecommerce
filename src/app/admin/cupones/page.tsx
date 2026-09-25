import { getCouponsAdmin } from "@/lib/actions/coupons-admin";
import CuponesPageClient from "./CuponesPageClient";

export const dynamic = "force-dynamic";

export default async function CuponesPage() {
  const cupones = await getCouponsAdmin();
  const serializables = cupones.map((c) => ({
    ...c,
    valor: Number(c.valor),
    montoMinimo: c.montoMinimo != null ? Number(c.montoMinimo) : null,
  }));
  return <CuponesPageClient cupones={serializables} />;
}
