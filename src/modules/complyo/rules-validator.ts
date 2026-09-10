import { EXAMPLE_MARKER, type ObligationRule } from '../../data/rules/schema';
import { COUNTRIES, WASTE_STREAMS } from '../../types/domain';

/**
 * Validación de una obligación ANTES de guardarla.
 *
 * `errors` bloquea el guardado. `warnings` avisa pero deja pasar.
 *
 * Criterio de reparto: bloquea lo que es estructuralmente incorrecto o lo que
 * rompe la regla de trazabilidad (sin fuente, sin fecha, marca de ejemplo).
 * Avisa —sin bloquear— lo que es una heurística nuestra, como si el dominio
 * parece oficial: equivocarnos ahí no puede impedirte registrar una obligación
 * legítima.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Dominios que damos por oficiales.
 *
 * REVISA ESTA LISTA. Es una heurística de ayuda, no una verdad jurídica: sirve
 * para que un enlace a un blog te salte a la vista. Si tu fuente oficial está
 * en un dominio que no aparece aquí, solo verás un aviso y podrás guardar
 * igualmente. Añade lo que te falte según vayas verificando países.
 */
export const OFFICIAL_DOMAIN_HINTS = [
  'europa.eu',
  'eur-lex.europa.eu',
  '.gov',
  '.gob.es',
  '.gouv.fr',
  '.bund.de',
  '.gv.at',
  '.gov.pl',
  '.gov.it',
  '.overheid.nl',
  '.rijksoverheid.nl',
  '.boe.es',
];

/** Dominios que casi nunca son una fuente oficial. Estos sí bloquean. */
export const NON_OFFICIAL_DOMAINS = [
  'blogspot.',
  'medium.com',
  'wordpress.com',
  'linkedin.com',
  'facebook.com',
  'youtube.com',
  'chatgpt.com',
  'claude.ai',
  'wikipedia.org',
  'ejemplo.invalid',
];

/** Periodicidades sugeridas en el formulario. Texto libre también vale. */
export const REPORTING_FREQUENCIES = [
  'mensual',
  'trimestral',
  'semestral',
  'anual',
  'anual con anticipos',
  'única en el alta',
  'otra',
] as const;

const ID_RE = /^[a-z]{2}-[a-z_]+-[a-z0-9_-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function looksOfficial(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  return OFFICIAL_DOMAIN_HINTS.some((hint) =>
    hint.startsWith('.') ? host.endsWith(hint) || host.includes(`${hint}.`) : host.endsWith(hint),
  );
}

export function isEurLex(url: string): boolean {
  const host = hostOf(url);
  return host === 'eur-lex.europa.eu';
}

/**
 * Valida una obligación. Función pura.
 * @param rule obligación a validar
 * @param today fecha de referencia (inyectable para los tests)
 */
export function validateRule(
  rule: Partial<ObligationRule>,
  today: string = new Date().toISOString().slice(0, 10),
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Identidad -----------------------------------------------------------
  if (!rule.id?.trim()) {
    errors.push('Falta el identificador.');
  } else if (!ID_RE.test(rule.id)) {
    warnings.push('El identificador no sigue la convención pais-flujo-sufijo, todo en minúsculas.');
  }

  if (!rule.country) {
    errors.push('Falta el país.');
  } else if (!COUNTRIES.includes(rule.country)) {
    errors.push(`País no reconocido: ${rule.country}.`);
  }

  if (!rule.stream) {
    errors.push('Falta el flujo de residuo.');
  } else if (!WASTE_STREAMS.includes(rule.stream)) {
    errors.push(`Flujo no reconocido: ${rule.stream}.`);
  }

  // --- Contenido -----------------------------------------------------------
  if (!rule.authorityName?.trim()) {
    errors.push('Falta el nombre del registro o autoridad.');
  }

  if (!rule.reportingFrequency?.trim()) {
    errors.push('Falta la periodicidad de declaración.');
  }

  if (!rule.requiredData || rule.requiredData.length === 0) {
    errors.push('Falta al menos un dato exigido.');
  } else if (rule.requiredData.some((d) => !d.trim())) {
    errors.push('Hay datos exigidos vacíos.');
  }

  if (!rule.nonComplianceConsequence?.trim()) {
    errors.push('Falta la consecuencia del incumplimiento.');
  }

  if (rule.representativeRequiredForNonEstablished === undefined) {
    errors.push('Falta indicar si el representante autorizado es obligatorio.');
  }

  // --- Marca de ejemplo ----------------------------------------------------
  const texts = [
    rule.authorityName,
    rule.complianceSchemeName,
    rule.reportingFrequency,
    rule.nonComplianceConsequence,
    ...(rule.requiredData ?? []),
  ].filter(Boolean) as string[];

  if (texts.some((t) => t.includes(EXAMPLE_MARKER))) {
    errors.push(`Conserva la marca ${EXAMPLE_MARKER}: es un dato de ejemplo, no se puede guardar.`);
  }

  // --- Trazabilidad --------------------------------------------------------
  if (!rule.sourceUrl?.trim()) {
    errors.push('Falta la URL de la fuente.');
  } else if (!/^https:\/\/\S+$/.test(rule.sourceUrl)) {
    errors.push('La URL de la fuente debe empezar por https://.');
  } else {
    const host = hostOf(rule.sourceUrl) ?? '';
    if (NON_OFFICIAL_DOMAINS.some((d) => host.includes(d.replace(/\.$/, '')))) {
      errors.push(
        'La URL no es una fuente oficial: tiene que ser EUR-Lex o el sitio de la administración competente.',
      );
    } else if (!looksOfficial(rule.sourceUrl)) {
      warnings.push(
        'El dominio no parece de una institución de la UE ni de una administración nacional. Compruébalo antes de marcar como verificada.',
      );
    } else if (!isEurLex(rule.sourceUrl)) {
      warnings.push(
        'La fuente no es EUR-Lex. Es correcto si apunta al registro nacional, pero conviene anotar también la norma europea en las notas.',
      );
    }
    if (hostOf(rule.sourceUrl) && new URL(rule.sourceUrl).pathname.replace(/\/$/, '') === '') {
      warnings.push('La URL apunta a la portada del sitio. Usa el enlace profundo a la página concreta.');
    }
  }

  if (!rule.sourceCheckedAt?.trim()) {
    errors.push('Falta la fecha de verificación.');
  } else if (!DATE_RE.test(rule.sourceCheckedAt)) {
    errors.push('La fecha de verificación debe tener formato YYYY-MM-DD.');
  } else if (rule.sourceCheckedAt > today) {
    errors.push('La fecha de verificación está en el futuro.');
  } else if (rule.sourceCheckedAt === '1970-01-01') {
    errors.push('La fecha de verificación es la de relleno de los datos de ejemplo.');
  } else if (monthsBetween(rule.sourceCheckedAt, today) >= 12) {
    warnings.push('La fuente se consultó hace más de un año. Conviene volver a comprobarla.');
  }

  if (!rule.verified) {
    warnings.push(
      'Esta obligación no está marcada como verificada: el informe la mostrará como PENDIENTE DE VERIFICACIÓN.',
    );
  }

  if (rule.verified && errors.length > 0) {
    errors.push('No se puede marcar como verificada una obligación con errores pendientes.');
  }

  // --- Coherencia ----------------------------------------------------------
  if (rule.severityWeight !== undefined && (rule.severityWeight < 0 || rule.severityWeight > 200)) {
    warnings.push('El peso de severidad está fuera del rango habitual (0–200).');
  }

  if (
    rule.id &&
    rule.country &&
    !rule.id.startsWith(`${rule.country.toLowerCase()}-`)
  ) {
    warnings.push('El identificador no empieza por el código del país.');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

function monthsBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** Valida una lista entera. Útil para el panel de estado y para los scripts. */
export function validateRules(
  rules: Partial<ObligationRule>[],
  today?: string,
): { rule: Partial<ObligationRule>; result: ValidationResult }[] {
  const seen = new Set<string>();
  return rules.map((rule) => {
    const result = validateRule(rule, today);
    if (rule.id) {
      if (seen.has(rule.id)) result.errors.push('Identificador duplicado.');
      seen.add(rule.id);
    }
    return { rule, result: { ...result, isValid: result.errors.length === 0 } };
  });
}
