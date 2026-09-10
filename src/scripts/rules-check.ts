/**
 * Guardarraíl de la base de reglas.
 *
 * Sale con código 1 si algún registro:
 *   - tiene verified: false
 *   - no tiene sourceUrl, o no es una URL http(s) válida
 *   - no tiene sourceCheckedAt en formato YYYY-MM-DD, o es una fecha futura
 *   - conserva la marca __EJEMPLO__ en cualquier campo de texto
 *   - repite un id ya usado
 *
 * Con los datos de ejemplo ESTE SCRIPT DEBE FALLAR. Es la prueba de que el
 * guardarraíl funciona. Solo pasa a verde cuando la base está verificada entera.
 *
 * DE DÓNDE LEE: de `src/data/rules/` siempre, y además de la tabla `reglas` de
 * Supabase si está configurada. Igual que la aplicación, la base de datos manda:
 * una obligación guardada desde /admin/fill-rules sustituye a la del código con
 * el mismo identificador. Si Supabase no responde o RLS no deja leer, el script
 * lo dice y comprueba solo el código, para no dar por buena una base que no ha
 * llegado a mirar.
 */
import { createClient } from '@supabase/supabase-js';
import { RULES } from '../data/rules/index';
import { EXAMPLE_MARKER, type ObligationRule } from '../data/rules/schema';
import { isMock, loadEnv, supabaseCredentials } from './lib/env';

interface Problem {
  id: string;
  message: string;
}

const problems: Problem[] = [];
const seen = new Set<string>();
const today = new Date().toISOString().slice(0, 10);

interface Source {
  rules: ObligationRule[];
  origin: string;
  /** Lo que no se ha podido comprobar. Se avisa al final, no se ignora. */
  warnings: string[];
}

/** Combina el código con la tabla `reglas`, con la misma precedencia que la app. */
async function collectRules(): Promise<Source> {
  const warnings: string[] = [];
  const byId = new Map<string, ObligationRule>();
  for (const rule of RULES) byId.set(rule.id, rule);

  const env = loadEnv();
  const credentials = supabaseCredentials(env);

  if (isMock(env)) {
    warnings.push(
      'Modo MOCK: las obligaciones que hayas guardado desde /admin/fill-rules viven en el ' +
        'navegador y este script no puede leerlas. Solo se ha comprobado el código.',
    );
    return { rules: [...byId.values()], origin: 'código', warnings };
  }

  if (!credentials) {
    warnings.push('VITE_MOCK=false pero faltan las claves de Supabase. Solo se ha comprobado el código.');
    return { rules: [...byId.values()], origin: 'código', warnings };
  }

  try {
    const db = createClient(credentials.url, credentials.key);
    const { data, error } = await db.from('reglas').select('*');
    if (error) {
      warnings.push(
        `No se ha podido leer la tabla reglas (${error.message}). Con RLS activado hace falta ` +
          'una sesión autenticada. Solo se ha comprobado el código.',
      );
      return { rules: [...byId.values()], origin: 'código', warnings };
    }
    let fromDb = 0;
    for (const row of (data ?? []) as { payload: ObligationRule }[]) {
      if (!row.payload?.id) continue;
      byId.set(row.payload.id, row.payload);
      fromDb += 1;
    }
    return {
      rules: [...byId.values()],
      origin: `código + Supabase (${fromDb} de la base de datos)`,
      warnings,
    };
  } catch (e) {
    warnings.push(`Supabase no respondió (${(e as Error).message}). Solo se ha comprobado el código.`);
    return { rules: [...byId.values()], origin: 'código', warnings };
  }
}

function textFields(rule: ObligationRule): string[] {
  return [
    rule.authorityName,
    rule.complianceSchemeName ?? '',
    rule.reportingFrequency,
    rule.nonComplianceConsequence,
    ...rule.requiredData,
  ];
}

const source = await collectRules();

for (const rule of source.rules) {
  const add = (message: string) => problems.push({ id: rule.id, message });

  if (seen.has(rule.id)) add('id duplicado');
  seen.add(rule.id);

  if (!rule.verified) add('verified: false — obligación sin verificar contra fuente oficial');

  if (!rule.sourceUrl || !/^https?:\/\/\S+$/.test(rule.sourceUrl)) {
    add('sourceUrl ausente o no es una URL http(s) válida');
  } else if (rule.sourceUrl.includes('ejemplo.invalid')) {
    add('sourceUrl sigue apuntando al dominio de ejemplo');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(rule.sourceCheckedAt)) {
    add('sourceCheckedAt ausente o no tiene formato YYYY-MM-DD');
  } else if (rule.sourceCheckedAt > today) {
    add('sourceCheckedAt está en el futuro');
  }

  if (textFields(rule).some((t) => t.includes(EXAMPLE_MARKER))) {
    add(`conserva la marca ${EXAMPLE_MARKER} en algún campo de texto`);
  }

  if (rule.requiredData.length === 0) add('requiredData está vacío');
}

const verified = source.rules.filter((r) => r.verified).length;

for (const warning of source.warnings) console.warn(`aviso: ${warning}\n`);

if (problems.length === 0) {
  console.log(
    `rules:check OK — ${source.rules.length} obligaciones (${source.origin}), todas verificadas.`,
  );
  process.exit(0);
}

console.error('rules:check FALLA\n');
for (const p of problems) console.error(`  [${p.id}] ${p.message}`);
console.error(
  `\n${problems.length} problema(s) en ${source.rules.length} obligaciones ` +
    `(${verified} verificadas). Origen: ${source.origin}.`,
);
console.error(
  'Mientras esto falle, el informe marca las obligaciones como PENDIENTE DE VERIFICACIÓN\n' +
    'y NO debe enseñarse a un cliente. Cómo arreglarlo: ver RULES-GUIDE.md.',
);
process.exit(1);
