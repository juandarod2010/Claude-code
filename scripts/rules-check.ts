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
 */
import { RULES } from '../src/data/rules/index';
import { EXAMPLE_MARKER, type ObligationRule } from '../src/data/rules/schema';

interface Problem {
  id: string;
  message: string;
}

const problems: Problem[] = [];
const seen = new Set<string>();
const today = new Date().toISOString().slice(0, 10);

function textFields(rule: ObligationRule): string[] {
  return [
    rule.authorityName,
    rule.complianceSchemeName ?? '',
    rule.reportingFrequency,
    rule.nonComplianceConsequence,
    ...rule.requiredData,
  ];
}

for (const rule of RULES) {
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

const verified = RULES.filter((r) => r.verified).length;

if (problems.length === 0) {
  console.log(`rules:check OK — ${RULES.length} obligaciones, todas verificadas.`);
  process.exit(0);
}

console.error('rules:check FALLA\n');
for (const p of problems) console.error(`  [${p.id}] ${p.message}`);
console.error(
  `\n${problems.length} problema(s) en ${RULES.length} obligaciones (${verified} verificadas).`,
);
console.error(
  'Mientras esto falle, el informe marca las obligaciones como PENDIENTE DE VERIFICACIÓN\n' +
    'y NO debe enseñarse a un cliente. Cómo arreglarlo: ver RULES-GUIDE.md.',
);
process.exit(1);
