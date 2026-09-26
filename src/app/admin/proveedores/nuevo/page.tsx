import { notFound } from "next/navigation";
import { getSupplierById } from "@/lib/actions/suppliers";
import ProveedorFormClient from "./ProveedorFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoProveedorPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  if (edit) {
    const supplier = await getSupplierById(edit);
    if (!supplier) notFound();
    return (
      <ProveedorFormClient
        initialData={{
          id: supplier.id,
          nombre: supplier.nombre,
          contacto: supplier.contacto,
          leadTimeDias: supplier.leadTimeDias,
          costoBase: Number(supplier.costoBase),
          calificacion: supplier.calificacion,
        }}
      />
    );
  }

  return <ProveedorFormClient />;
}
