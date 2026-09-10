/**
 * Copia de seguridad de la base de reglas a JSON.
 *
 * Junta lo que hay en el código (`src/data/rules/`) con lo que hayas guardado
 * en la tabla `reglas` desde /admin/fill-rules, aplicando la misma precedencia
 * que la aplicación: la base de datos manda.
 *
 * Uso: npm run backup:rules [-- ruta/de/salida.json]
 *
 * En modo MOCK las reglas viven en el localStorage del navegador y Node no
 * puede leerlas: el script lo dice y exporta solo las del código.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { RULES } from '../data/rules';
import type { ObligationRule } from '../data/rules/schema';
import { isMock, loadEnv, supabaseCredentials } from './lib/env';

async function main(): Promise<void> {
  const env = loadEnv();
  const credentials = supabaseCredentials(env);
  const target =
    process.argv[2] ??
    `backups/rules-${new Date().toISOString().slice(0, 10)}.json`;

  const byId = new Map<string, ObligationRule>();
  for (const rule of RULES) byId.set(rule.id, rule);

  let fromDb = 0;
  if (!isMock(env) && credentials) {
    const db = createClient(credentials.url, credentials.key);
    const { data, error } = await db.from('reglas').select('*');
    if (error) {
      console.warn(`No se han podido leer las reglas de Supabase: ${error.message}`);
      console.warn('Con RLS activado hace falta una sesión autenticada para leer.');
    } else {
      for (const row of data as { payload: ObligationRule }[]) {
        byId.set(row.payload.id, row.payload);
        fromDb += 1;
      }
    }
  } else {
    console.warn(
      'Modo MOCK: las reglas guardadas desde /admin/fill-rules viven en el navegador.\n' +
        'Este backup incluye solo las del código.',
    );
  }

  const rules = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  const payload = {
    exportedAt: new Date().toISOString(),
    total: rules.length,
    fromDatabase: fromDb,
    fromCode: rules.length - fromDb,
    verified: rules.filter((r) => r.verified).length,
    rules,
  };

  const path = resolve(process.cwd(), target);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Copia escrita en ${path}`);
  console.log(
    `${payload.total} obligaciones (${payload.fromDatabase} de la base de datos, ` +
      `${payload.fromCode} del código). Verificadas: ${payload.verified}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
