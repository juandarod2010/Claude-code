/**
 * Lectura de variables de entorno en los scripts de Node.
 *
 * Los scripts no pasan por Vite, así que `import.meta.env` no existe: leen el
 * fichero .env a mano. Deliberadamente sin dependencias: es un parser de
 * `CLAVE=valor` y nada más.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnv(file = '.env'): Record<string, string> {
  const path = resolve(process.cwd(), file);
  const fromProcess = { ...process.env } as Record<string, string>;
  if (!existsSync(path)) return fromProcess;

  const parsed: Record<string, string> = {};
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
    parsed[key] = value;
  }
  // Lo que ya está en el entorno manda sobre el fichero.
  return { ...parsed, ...fromProcess };
}

export function isMock(env: Record<string, string>): boolean {
  return (env.VITE_MOCK ?? 'true') !== 'false';
}

export function supabaseCredentials(
  env: Record<string, string>,
): { url: string; key: string } | null {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}
