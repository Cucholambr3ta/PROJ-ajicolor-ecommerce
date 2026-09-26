import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const client = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

export const STORAGE_CONFIGURED = !!client;

const PRODUCTOS_BUCKET = "productos";

/**
 * Sube una imagen de producto al bucket público `productos`. Requiere
 * SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY — sin esas credenciales, lanza un
 * error claro en vez de fallar silenciosamente (a diferencia de emails/OAuth,
 * subir una imagen es una acción explícita del admin que debe saber por qué
 * falló).
 */
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  if (!client) {
    throw new Error("Supabase Storage no está configurado (falta SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await client.storage.from(PRODUCTOS_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Error al subir imagen: ${error.message}`);

  const { data } = client.storage.from(PRODUCTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  if (!client) return;
  const marker = `/${PRODUCTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await client.storage.from(PRODUCTOS_BUCKET).remove([path]);
}
