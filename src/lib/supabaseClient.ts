import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente único de Supabase.
 *
 * Tiene que ser único: la sesión que abre el panel interno al iniciar sesión
 * vive dentro del cliente, y es esa sesión la que hace que Row Level Security
 * deje leer los leads. Si el almacenamiento creara su propio cliente por su
 * cuenta, iniciarías sesión en uno y leerías con el otro, que sigue siendo
 * anónimo, y no verías nada.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const mockFlag = (import.meta.env.VITE_MOCK as string | undefined) ?? 'true';

/** true si se ha pedido Supabase explícitamente Y hay credenciales. */
export const supabaseConfigured = mockFlag === 'false' && Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: {
        // La sesión del operador sobrevive a recargar la página y a cerrar la
        // pestaña. Es un panel de trabajo, no un cajero automático.
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

/** Para los avisos de configuración de la interfaz. */
export function supabaseMisconfigured(): boolean {
  return mockFlag === 'false' && !(url && anonKey);
}
