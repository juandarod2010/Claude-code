import type { ObligationRule } from '../src/data/rules/schema';
import type { CountryCode, DiagnosticAnswers, WasteStream } from '../src/types/domain';

/**
 * Reglas de prueba. Deliberadamente NO usan la base de datos del proyecto:
 * los tests validan el motor, no el contenido regulatorio.
 */
export function rule(
  country: CountryCode,
  stream: WasteStream,
  overrides: Partial<ObligationRule> = {},
): ObligationRule {
  return {
    id: `${country.toLowerCase()}-${stream}`,
    country,
    stream,
    authorityName: `Autoridad de prueba ${country} ${stream}`,
    representativeRequiredForNonEstablished: false,
    reportingFrequency: 'periodicidad de prueba',
    requiredData: ['dato de prueba'],
    nonComplianceConsequence: 'consecuencia de prueba',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/fuente',
    sourceCheckedAt: '2026-01-01',
    verified: true,
    ...overrides,
  };
}

export function answers(overrides: Partial<DiagnosticAnswers> = {}): DiagnosticAnswers {
  return {
    countries: ['DE'],
    channels: ['web_propia'],
    categories: ['textil'],
    packagingMaterials: ['papel_carton'],
    establishedInEU: true,
    volume: '0-100',
    email: 'prueba@ejemplo.invalid',
    ...overrides,
  };
}
