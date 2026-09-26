import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ColeccionFormClient from "./ColeccionFormClient";

export const dynamic = "force-dynamic";

export default async function NuevaColeccionPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  if (edit) {
    const collection = await prisma.collection.findUnique({ where: { id: edit } });
    if (!collection) notFound();
    return <ColeccionFormClient initialData={collection} />;
  }

  return <ColeccionFormClient />;
}
