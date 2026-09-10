import { getSupabaseClient, supabaseMisconfigured } from '../supabaseClient';
import { mockStorage } from './mock';
import { createSupabaseStorage } from './supabase';
import type { Storage } from './types';

export * from './types';
export { newId } from './mock';

/**
 * Se usa Supabase solo si se pide explícitamente Y hay credenciales.
 * En cualquier otro caso se cae a localStorage: la aplicación nunca se rompe
 * por falta de claves.
 */
function pick(): Storage {
  const client = getSupabaseClient();
  if (!client) {
    if (supabaseMisconfigured()) {
      console.warn(
        '[complyo] VITE_MOCK=false pero faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
          'Se usa localStorage.',
      );
    }
    return mockStorage;
  }
  return createSupabaseStorage(client);
}

export const storage: Storage = pick();
