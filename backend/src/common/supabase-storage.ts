import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';

let client: SupabaseClient | null = null;

// Crea el cliente de Supabase una sola vez (cuando el .env ya está cargado)
function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error('Faltan SUPABASE_URL o SUPABASE_KEY en el .env');
    }
    client = createClient(url, key);
  }
  return client;
}

// Sube una imagen a Supabase Storage y devuelve su URL pública.
// `carpeta` organiza los archivos dentro del bucket (ej: 'perfiles' | 'publicaciones')
export async function subirImagen(
  file: Express.Multer.File,
  carpeta: string,
): Promise<string> {
  const bucket = process.env.SUPABASE_BUCKET || 'imagenes';
  const ext = extname(file.originalname) || '.jpg';
  const nombre = `${carpeta}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const { error } = await getClient()
    .storage.from(bucket)
    .upload(nombre, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  if (error) {
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }

  const { data } = getClient().storage.from(bucket).getPublicUrl(nombre);
  return data.publicUrl;
}
