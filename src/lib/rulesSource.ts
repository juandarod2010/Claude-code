import { RULES } from '../data/rules';
import type { ObligationRule } from '../data/rules/schema';
import { storage, type StoredRule } from './storage';

/**
 * De dónde salen las obligaciones que usa la aplicación.
 *
 * Hay dos orígenes y este módulo los combina:
 *   1. `src/data/rules/index.ts` — lo que está en el código (hoy, los ejemplos).
 *   2. La tabla `reglas` — lo que has rellenado desde /admin/fill-rules.
 *
 * La base de datos MANDA: si una obligación existe en los dos sitios con el
 * mismo identificador, gana la de la base de datos. Así puedes ir sustituyendo
 * los ejemplos uno a uno sin tocar TypeScript ni desplegar.
 */
export async function loadEffectiveRules(): Promise<ObligationRule[]> {
  let stored: StoredRule[] = [];
  try {
    stored = await storage.listStoredRules();
  } catch {
    // Sin acceso a la tabla (RLS, sin sesión) se sigue con lo que hay en código.
    stored = [];
  }

  const byId = new Map<string, ObligationRule>();
  for (const rule of RULES) byId.set(rule.id, rule);
  for (const rule of stored) {
    const { updatedAt: _updatedAt, ...clean } = rule;
    void _updatedAt;
    byId.set(clean.id, clean);
  }
  return [...byId.values()];
}

/** Cuántas obligaciones vienen de la base de datos, para enseñarlo en el panel. */
export function countOverrides(stored: StoredRule[]): number {
  const codeIds = new Set(RULES.map((r) => r.id));
  return stored.filter((r) => codeIds.has(r.id)).length;
}
