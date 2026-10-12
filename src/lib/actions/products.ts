"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { createProductSchema, parseOrThrow } from "@/lib/schemas";
import type { CategoriaProducto, Prisma } from "@prisma/client";

export interface ProductFilters {
  q?: string;
  collectionSlug?: string;
  categoria?: CategoriaProducto;
  color?: string;
  talle?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: "recientes" | "precio-asc" | "precio-desc";
  page?: number;
  perPage?: number;
}

const PER_PAGE_DEFAULT = 12;

/** Catálogo público: solo productos activos, con búsqueda/filtros/paginación. */
export async function getProducts(filtros: ProductFilters = {}) {
  const perPage = filtros.perPage ?? PER_PAGE_DEFAULT;
  const page = Math.max(1, filtros.page ?? 1);

  const where: Prisma.ProductWhereInput = {
    activo: true,
    ...(filtros.q
      ? {
          OR: [
            { nombre: { contains: filtros.q, mode: "insensitive" } },
            { artista: { contains: filtros.q, mode: "insensitive" } },
            { descripcion: { contains: filtros.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filtros.collectionSlug ? { collection: { slug: filtros.collectionSlug } } : {}),
    ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
    ...(filtros.precioMin != null || filtros.precioMax != null
      ? {
          precio: {
            ...(filtros.precioMin != null ? { gte: filtros.precioMin } : {}),
            ...(filtros.precioMax != null ? { lte: filtros.precioMax } : {}),
          },
        }
      : {}),
    ...(filtros.color || filtros.talle
      ? {
          variants: {
            some: {
              ...(filtros.color ? { color: filtros.color } : {}),
              ...(filtros.talle ? { talle: filtros.talle } : {}),
            },
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filtros.orden === "precio-asc"
      ? { precio: "asc" }
      : filtros.orden === "precio-desc"
        ? { precio: "desc" }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, images: { orderBy: { orden: "asc" } }, collection: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/** Valores distintos de color/talle entre productos activos, para poblar los filtros. */
export async function getFilterOptions(categoria?: CategoriaProducto) {
  const variants = await prisma.productVariant.findMany({
    where: { product: { activo: true, ...(categoria ? { categoria } : {}) } },
    select: { color: true, talle: true },
    distinct: ["color", "talle"],
  });
  const colores = Array.from(new Set(variants.map((v) => v.color))).sort();
  const talles = Array.from(new Set(variants.map((v) => v.talle)));
  return { colores, talles };
}

export async function getActiveCollections() {
  return prisma.collection.findMany({
    where: { activa: true },
    orderBy: { fechaLanzamiento: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true, images: { orderBy: { orden: "asc" } }, colorImages: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, images: { orderBy: { orden: "asc" } }, colorImages: true },
  });
}

/** Productos de la misma colección o mismo artista, para "También te puede gustar". */
export async function getRelatedProducts(product: { id: string; artista: string; collectionId: string | null }) {
  return prisma.product.findMany({
    where: {
      activo: true,
      id: { not: product.id },
      OR: [
        ...(product.collectionId ? [{ collectionId: product.collectionId }] : []),
        { artista: product.artista },
      ],
    },
    include: { variants: true },
    take: 4,
  });
}

/** Catálogo completo para el admin, incluyendo archivados. */
export async function getAllProductsAdmin() {
  await requireAdmin();
  return prisma.product.findMany({
    include: { variants: true, collection: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(data: {
  nombre: string;
  slug: string;
  descripcion: string;
  disenoUrl: string;
  artista: string;
  temporada: string;
  categoria?: CategoriaProducto;
  precio: number;
  costoUnitario?: number;
  collectionId?: string;
  variants?: { talle: string; color: string; sku: string; stock?: number; stockMin?: number }[];
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createProductSchema, data);
  const product = await prisma.product.create({
    data: {
      nombre: parsed.nombre,
      slug: parsed.slug,
      nombreSlug: parsed.slug,
      descripcion: parsed.descripcion,
      disenoUrl: parsed.disenoUrl,
      artista: parsed.artista,
      temporada: parsed.temporada,
      categoria: parsed.categoria,
      precio: parsed.precio,
      costoUnitario: parsed.costoUnitario,
      collectionId: parsed.collectionId,
      variants: parsed.variants ? { create: parsed.variants } : undefined,
    },
    include: { variants: true },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return product;
}

/**
 * Crea el producto, sus variantes y las fotos por color en un solo paso —
 * reemplaza el flujo viejo de "crear vacío → editar → subir fotos" por un
 * único formulario. Recibe FormData porque mezcla datos tipados con
 * archivos: "data" es el JSON de { nombre, slug, ..., variants }, y cada
 * archivo de foto va como "foto__<color>__<Frente|Espalda>".
 */
export async function createProductWithPhotos(formData: FormData) {
  await requireAdmin();

  const rawData = formData.get("data");
  if (typeof rawData !== "string") throw new Error("Datos del producto faltantes");
  const data = JSON.parse(rawData) as {
    nombre: string;
    slug: string;
    descripcion: string;
    artista: string;
    temporada: string;
    categoria?: CategoriaProducto;
    precio: number;
    variants?: { talle: string; color: string; sku: string; stock?: number; stockMin?: number }[];
  };

  const parsed = parseOrThrow(createProductSchema, { ...data, disenoUrl: "" });

  const product = await prisma.product.create({
    data: {
      nombre: parsed.nombre,
      slug: parsed.slug,
      nombreSlug: parsed.slug,
      descripcion: parsed.descripcion,
      disenoUrl: "",
      artista: parsed.artista,
      temporada: parsed.temporada,
      categoria: parsed.categoria,
      precio: parsed.precio,
      variants: parsed.variants ? { create: parsed.variants } : undefined,
    },
    include: { variants: true },
  });

  const { uploadProductImage } = await import("@/lib/storage");
  let disenoUrl = "";

  for (const [key, value] of Array.from(formData.entries())) {
    if (!key.startsWith("foto__") || !(value instanceof File) || value.size === 0) continue;
    const [, color, lado] = key.split("__");
    if (lado !== "Frente" && lado !== "Espalda") continue;

    const url = await uploadProductImage(value, product.id);
    await prisma.productColorImage.create({
      data: { productId: product.id, color, lado, url },
    });
    if (lado === "Frente" && !disenoUrl) disenoUrl = url;
  }

  if (disenoUrl) {
    await prisma.product.update({ where: { id: product.id }, data: { disenoUrl } });
  }

  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    nombre?: string;
    slug?: string;
    descripcion?: string;
    disenoUrl?: string;
    artista?: string;
    temporada?: string;
    categoria?: CategoriaProducto;
    precio?: number;
    costoUnitario?: number;
    activo?: boolean;
    collectionId?: string | null;
    variants?: {
      id?: string;
      talle: string;
      color: string;
      sku: string;
      stock: number;
      stockMin: number;
    }[];
  }
) {
  await requireAdmin();
  const { variants, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    if (variants) {
      const existing = await tx.productVariant.findMany({ where: { productId: id }, select: { id: true } });
      const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
      const toDelete = existing.filter((v) => !keepIds.includes(v.id)).map((v) => v.id);
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
      }
      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { talle: v.talle, color: v.color, sku: v.sku, stock: v.stock, stockMin: v.stockMin },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, talle: v.talle, color: v.color, sku: v.sku, stock: v.stock, stockMin: v.stockMin },
          });
        }
      }
    }

    return tx.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });
  }).then((product) => {
    revalidatePath("/admin/catalogo");
    revalidatePath(`/admin/catalogo/${id}`);
    revalidatePath(`/producto/${id}`);
    revalidatePath("/");
    return product;
  });
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const deleted = await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return deleted;
}

export async function addProductImages(productId: string, formData: FormData) {
  await requireAdmin();
  const { uploadProductImage } = await import("@/lib/storage");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) throw new Error("No se seleccionaron archivos");

  const existingCount = await prisma.productImage.count({ where: { productId } });

  const created = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadProductImage(files[i], productId);
    created.push(
      await prisma.productImage.create({
        data: { productId, url, orden: existingCount + i },
      })
    );
  }

  revalidatePath(`/admin/catalogo/${productId}`);
  revalidatePath(`/admin/catalogo/nuevo`);
  revalidatePath("/");
  return created;
}

export async function removeProductImage(imageId: string) {
  await requireAdmin();
  const { deleteProductImage } = await import("@/lib/storage");
  const image = await prisma.productImage.delete({ where: { id: imageId } });
  await deleteProductImage(image.url);
  revalidatePath(`/admin/catalogo/${image.productId}`);
  revalidatePath("/");
  return image;
}

/** Foto real por color (y lado) para el selector de color de la ficha
 * pública — reemplaza una foto existente del mismo color+lado si ya había
 * una subida (upsert), para que resubir no deje huérfanos en Storage. */
export async function setProductColorImage(
  productId: string,
  color: string,
  lado: "Frente" | "Espalda",
  formData: FormData
) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("No se seleccionó un archivo");

  const { uploadProductImage, deleteProductImage } = await import("@/lib/storage");

  const existing = await prisma.productColorImage.findUnique({
    where: { productId_color_lado: { productId, color, lado } },
  });

  const url = await uploadProductImage(file, productId);

  const saved = await prisma.productColorImage.upsert({
    where: { productId_color_lado: { productId, color, lado } },
    update: { url },
    create: { productId, color, lado, url },
  });

  if (existing && existing.url !== url) {
    await deleteProductImage(existing.url);
  }

  // Si el producto todavía no tiene disenoUrl (campo legado, pero usado
  // como miniatura en catálogo/carrito/OG), la primera foto de frente
  // subida lo completa sola — ya no hace falta que el admin tipee una URL
  // a mano al crear el producto.
  if (lado === "Frente") {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { disenoUrl: true } });
    if (product && !product.disenoUrl) {
      await prisma.product.update({ where: { id: productId }, data: { disenoUrl: url } });
    }
  }

  revalidatePath(`/admin/catalogo/${productId}`);
  revalidatePath(`/admin/catalogo/nuevo`);
  revalidatePath("/");
  return saved;
}

export async function removeProductColorImage(id: string) {
  await requireAdmin();
  const { deleteProductImage } = await import("@/lib/storage");
  const image = await prisma.productColorImage.delete({ where: { id } });
  await deleteProductImage(image.url);
  revalidatePath(`/admin/catalogo/${image.productId}`);
  revalidatePath("/");
  return image;
}
