import type { ObligationRule } from './schema';

/**
 * BASE DE REGLAS — DATOS DE EJEMPLO, NO SON DATOS REALES.
 *
 * Todo lo que hay aquí está marcado con __EJEMPLO__ y con verified: false.
 * Sirve únicamente para que la aplicación funcione de extremo a extremo.
 *
 * CÓMO SE RELLENA ESTO DE VERDAD: ver RULES-GUIDE.md en la raíz del proyecto.
 * Regla de oro: si no lo has leído hoy en la web oficial que pones en sourceUrl,
 * no lo escribas aquí y no toques verified.
 *
 * `npm run rules:check` falla mientras quede un solo registro con verified: false.
 * Eso es intencionado: es el guardarraíl que impide enseñar esto a un cliente.
 */
export const RULES: ObligationRule[] = [
  {
    id: 'de-envases-registro',
    country: 'DE',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de Alemania',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Alemania (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/de/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'de-aee-registro',
    country: 'DE',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de Alemania',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Alemania (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/de/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'de-pilas-registro',
    country: 'DE',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de Alemania',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Alemania (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/de/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'fr-envases-registro',
    country: 'FR',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de Francia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Francia (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/fr/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'fr-aee-registro',
    country: 'FR',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de Francia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Francia (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/fr/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'fr-pilas-registro',
    country: 'FR',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de Francia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Francia (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/fr/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'es-envases-registro',
    country: 'ES',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de España',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de España (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/es/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'es-aee-registro',
    country: 'ES',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de España',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de España (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/es/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'es-pilas-registro',
    country: 'ES',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de España',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de España (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/es/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'it-envases-registro',
    country: 'IT',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de Italia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Italia (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/it/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'it-aee-registro',
    country: 'IT',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de Italia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Italia (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/it/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'it-pilas-registro',
    country: 'IT',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de Italia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Italia (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/it/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'nl-envases-registro',
    country: 'NL',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de Países Bajos',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Países Bajos (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/nl/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'nl-aee-registro',
    country: 'NL',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de Países Bajos',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Países Bajos (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/nl/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'nl-pilas-registro',
    country: 'NL',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de Países Bajos',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Países Bajos (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/nl/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'pl-envases-registro',
    country: 'PL',
    stream: 'envases',
    authorityName: '__EJEMPLO__ Registro nacional de envases de Polonia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Polonia (envases)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://ejemplo.invalid/pl/envases',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'pl-aee-registro',
    country: 'PL',
    stream: 'aparatos_electricos',
    authorityName: '__EJEMPLO__ Registro nacional de aparatos eléctricos de Polonia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Polonia (aparatos eléctricos)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 80,
    sourceUrl: 'https://ejemplo.invalid/pl/aee',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
  {
    id: 'pl-pilas-registro',
    country: 'PL',
    stream: 'pilas',
    authorityName: '__EJEMPLO__ Registro nacional de pilas y baterías de Polonia',
    complianceSchemeName: '__EJEMPLO__ Organismo de responsabilidad ampliada de Polonia (pilas y baterías)',
    representativeRequiredForNonEstablished: false, // __EJEMPLO__ valor de relleno, NO es una afirmación jurídica
    reportingFrequency: '__EJEMPLO__ periodicidad pendiente de verificar en fuente oficial',
    requiredData: [
      '__EJEMPLO__ dato exigido 1 — pendiente de verificar',
      '__EJEMPLO__ dato exigido 2 — pendiente de verificar',
    ],
    nonComplianceConsequence:
      '__EJEMPLO__ consecuencia del incumplimiento pendiente de verificar en fuente oficial',
    appliesToCategories: 'all',
    severityWeight: 70,
    sourceUrl: 'https://ejemplo.invalid/pl/pilas',
    sourceCheckedAt: '1970-01-01',
    verified: false,
    notes: 'Registro de ejemplo generado con el andamiaje. Sustituir por completo.',
  },
];

export * from './schema';
