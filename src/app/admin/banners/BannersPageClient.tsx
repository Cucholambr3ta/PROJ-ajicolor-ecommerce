"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BannerData {
  id: string;
  imageUrl: string;
  tipo: "Imagen" | "Video";
  linkUrl: string;
  orden: number;
  activo: boolean;
}

export default function BannersPageClient({ banners }: { banners: BannerData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Seleccioná una imagen o video");
      return;
    }
    setUploading(true);
    try {
      const { createBanner } = await import("@/lib/actions/banners");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("linkUrl", linkUrl.trim());
      await createBanner(formData);
      setLinkUrl("");
      setFile(null);
      setFileInputKey((k) => k + 1);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir el banner");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleActivo(id: string, activo: boolean) {
    setBusyId(id);
    try {
      const { updateBanner } = await import("@/lib/actions/banners");
      await updateBanner(id, { activo: !activo });
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar el banner");
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    try {
      const { swapBannerOrder } = await import("@/lib/actions/banners");
      await swapBannerOrder(id, direction);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al reordenar");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este banner? Esto también borra la imagen subida.")) return;
    setBusyId(id);
    try {
      const { deleteBanner } = await import("@/lib/actions/banners");
      await deleteBanner(id);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el banner");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Banners del home</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
          Carrusel en movimiento que reemplaza las tarjetas del hero. Cada imagen o video enlaza a la
          página que elijas. Se muestran en el orden de la lista; apagá uno para sacarlo sin borrarlo.
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Agregar banner nuevo</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">
              Imagen o video *
            </label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
              required
            />
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
              Imagen: JPG, PNG, WEBP o GIF. Video: MP4 o WEBM, sin sonido (se reproduce muteado en loop).
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">
              Enlaza a *
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/categorias o https://..."
              required
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 rounded-md btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "+ Agregar banner"}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 dark:text-red-400">{error}</p>}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-200">Banners</h2>
          <Badge variant="outline">{banners.length}</Badge>
        </div>
        {banners.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400">Todavía no hay banners cargados.</p>
        ) : (
          <div className="space-y-3">
            {banners.map((b, i) => (
              <div
                key={b.id}
                className="flex items-center gap-4 border border-gray-200 dark:border-neutral-700 rounded-md p-3"
              >
                <div className="relative w-40 h-16 shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-neutral-800">
                  {b.tipo === "Video" ? (
                    <video src={b.imageUrl} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <Image src={b.imageUrl} alt="" fill className="object-cover" sizes="160px" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate dark:text-neutral-100">{b.linkUrl}</p>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                    {b.tipo === "Video" ? "Video" : "Imagen"} · {b.activo ? "Visible en el carrusel" : "Oculto"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMove(b.id, "up")}
                    disabled={busyId === b.id || i === 0}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-neutral-700 rounded-md disabled:opacity-30"
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(b.id, "down")}
                    disabled={busyId === b.id || i === banners.length - 1}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-neutral-700 rounded-md disabled:opacity-30"
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleToggleActivo(b.id, b.activo)}
                    disabled={busyId === b.id}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-neutral-700 rounded-md disabled:opacity-50"
                  >
                    {b.activo ? "Ocultar" : "Mostrar"}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={busyId === b.id}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-2 py-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
