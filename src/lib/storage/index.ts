import { mockStorage } from './mock';
import { createSupabaseStorage } from './supabase';
import type { Storage } from './types';

export * from './types';
export { newId } from './mock';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const mockFlag = (import.meta.env.VITE_MOCK as string | undefined) ?? 'true';

/**
 * Se usa Supabase solo si se pide explícitamente Y hay credenciales.
 * En cualquier otro caso se cae a localStorage: la aplicación nunca se rompe
 * por falta de claves.
 */
function pick(): Storage {
  if (mockFlag !== 'false') return mockStorage;
  if (!url || !anonKey) {
    console.warn(
      '[complyo] VITE_MOCK=false pero faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
        'Se usa localStorage.',
    );
    return mockStorage;
  }
  return createSupabaseStorage(url, anonKey);
}

export const storage: Storage = pick();
