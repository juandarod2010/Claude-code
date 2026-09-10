import { RULES } from '../../data/rules';
import type { ObligationRule } from '../../data/rules/schema';
import {
  CATEGORY_STREAMS,
  COUNTRIES,
  COUNTRY_LABELS,
  WASTE_STREAMS,
  type CountryCode,
  type DiagnosticAnswers,
  type ProductCategory,
  type RiskLevel,
  type VolumeBand,
  type WasteStream,
} from '../../types/domain';
import type { AppliedObligation, CountryAssessment, EngineResult } from './types';

export type { AppliedObligation, CountryAssessment, EngineResult } from './types';

/**
 * CRITERIOS DE RIESGO — son criterios COMERCIALES NUESTROS, no normativos.
 * Sirven para ordenar el informe por urgencia. No afirman nada jurídico.
 * Están aquí, juntos y con nombre, para poder cambiarlos en un sitio.
 */
export const RISK_SCORING = {
  /** No estar establecido en la UE agrava cualquier obligación. */
  nonEstablished: 25,
  /** Además, si esa obligación exige representante autorizado, agrava más. */
  representativeGap: 25,
  /** Canales que verifican el registro de forma más agresiva. */
  enforcedChannel: 10,
  volume: {
    '0-100': 0,
    '101-1000': 5,
    '1001-10000': 12,
    '10000+': 20,
  } satisfies Record<VolumeBand, number>,
  thresholds: {
    critico: 110,
    alto: 85,
  },
} as const;

const ENFORCED_CHANNELS = new Set(['amazon_eu', 'tiktok_shop']);

const RISK_ORDER: Record<RiskLevel, number> = { critico: 0, alto: 1, medio: 2 };
const STREAM_ORDER = new Map<WasteStream, number>(WASTE_STREAMS.map((s, i) => [s, i]));
const COUNTRY_ORDER = new Map<CountryCode, number>(COUNTRIES.map((c, i) => [c, i]));

function riskFromScore(score: number): RiskLevel {
  if (score >= RISK_SCORING.thresholds.critico) return 'critico';
  if (score >= RISK_SCORING.thresholds.alto) return 'alto';
  return 'medio';
}

/** Qué flujos de residuo activan las categorías declaradas, y por qué categorías. */
export function streamsForCategories(
  categories: readonly ProductCategory[],
): Map<WasteStream, ProductCategory[]> {
  const map = new Map<WasteStream, ProductCategory[]>();
  for (const category of categories) {
    for (const stream of CATEGORY_STREAMS[category] ?? []) {
      const list = map.get(stream) ?? [];
      list.push(category);
      map.set(stream, list);
    }
  }
  return map;
}

function ruleAppliesToCategories(
  rule: ObligationRule,
  categories: readonly ProductCategory[],
): ProductCategory[] {
  if (rule.appliesToCategories === 'all') return [...categories];
  const allowed = new Set(rule.appliesToCategories);
  return categories.filter((c) => allowed.has(c));
}

/**
 * MOTOR DE REGLAS.
 *
 * Función pura: mismas respuestas -> mismo resultado, siempre.
 * No lee la hora, no toca red, no escribe en disco, no muta la entrada.
 *
 * @param answers respuestas del formulario de diagnóstico
 * @param rules base de reglas a usar. Por defecto la del proyecto; los tests
 *              inyectan la suya para no depender de los datos de ejemplo.
 */
export function evaluate(
  answers: DiagnosticAnswers,
  rules: readonly ObligationRule[] = RULES,
): EngineResult {
  const warnings: string[] = [];

  const countries = [...new Set(answers.countries)].sort(
    (a, b) => (COUNTRY_ORDER.get(a) ?? 99) - (COUNTRY_ORDER.get(b) ?? 99),
  );
  const categories = [...new Set(answers.categories)];
  const streamMap = streamsForCategories(categories);

  if (countries.length === 0) warnings.push('No se ha seleccionado ningún país de destino.');
  if (categories.length === 0) {
    warnings.push('No se ha seleccionado ninguna categoría de producto.');
  }
  if (answers.packagingMaterials.length === 0) {
    warnings.push(
      'No se ha declarado ningún material de envase. Toda expedición va envasada: revisar con el vendedor.',
    );
  }

  const channelBonus = answers.channels.some((c) => ENFORCED_CHANNELS.has(c))
    ? RISK_SCORING.enforcedChannel
    : 0;
  const volumeBonus = RISK_SCORING.volume[answers.volume] ?? 0;
  const nonEstablished = !answers.establishedInEU;

  const applied: AppliedObligation[] = [];
  const countriesNotLoaded: CountryCode[] = [];
  const countriesWithoutMatches: CountryCode[] = [];

  for (const country of countries) {
    const countryRules = rules.filter((r) => r.country === country);

    // Distinguir estos dos casos importa: uno es un hueco NUESTRO y el otro es
    // una respuesta. Confundirlos le diría al vendedor que no tiene nada que
    // hacer en un país que ni siquiera hemos mirado.
    if (countryRules.length === 0) {
      countriesNotLoaded.push(country);
      warnings.push(
        `${COUNTRY_LABELS[country] ?? country}: no hay ninguna obligación cargada en la base. ` +
          'No es que no tenga obligaciones: es que todavía no las hemos verificado.',
      );
      continue;
    }

    const before = applied.length;

    for (const rule of countryRules) {
      const triggeringCategories = streamMap.get(rule.stream);
      if (!triggeringCategories || triggeringCategories.length === 0) continue;

      const matched = ruleAppliesToCategories(rule, triggeringCategories);
      if (matched.length === 0) continue;

      const representativeGap = nonEstablished && rule.representativeRequiredForNonEstablished;

      let score = rule.severityWeight;
      const riskReasons: string[] = [];

      if (nonEstablished) {
        score += RISK_SCORING.nonEstablished;
        riskReasons.push('El vendedor no está establecido en la Unión Europea.');
      }
      if (representativeGap) {
        score += RISK_SCORING.representativeGap;
        riskReasons.push(
          'Esta obligación exige designar representante autorizado para vendedores no establecidos.',
        );
      }
      if (channelBonus > 0) {
        score += channelBonus;
        riskReasons.push('Vende por canales que comprueban el registro antes de publicar.');
      }
      if (volumeBonus > 0) {
        score += volumeBonus;
        riskReasons.push('El volumen declarado aumenta la exposición.');
      }

      applied.push({
        rule,
        score,
        risk: riskFromScore(score),
        riskReasons,
        triggeringCategories: [...new Set(matched)],
        representativeGap,
        verified: rule.verified,
      });
    }

    if (applied.length === before) {
      countriesWithoutMatches.push(country);
      warnings.push(
        `${COUNTRY_LABELS[country] ?? country}: hay obligaciones cargadas, pero ninguna aplica a ` +
          'las categorías declaradas.',
      );
    }
  }

  applied.sort((a, b) => {
    const byRisk = RISK_ORDER[a.risk] - RISK_ORDER[b.risk];
    if (byRisk !== 0) return byRisk;
    if (b.score !== a.score) return b.score - a.score;
    const byCountry =
      (COUNTRY_ORDER.get(a.rule.country) ?? 99) - (COUNTRY_ORDER.get(b.rule.country) ?? 99);
    if (byCountry !== 0) return byCountry;
    const byStream =
      (STREAM_ORDER.get(a.rule.stream) ?? 99) - (STREAM_ORDER.get(b.rule.stream) ?? 99);
    if (byStream !== 0) return byStream;
    return a.rule.id.localeCompare(b.rule.id);
  });

  const byCountry: CountryAssessment[] = countries
    .map((country) => {
      const obligations = applied.filter((o) => o.rule.country === country);
      const streams = [...new Set(obligations.map((o) => o.rule.stream))].sort(
        (a, b) => (STREAM_ORDER.get(a) ?? 99) - (STREAM_ORDER.get(b) ?? 99),
      );
      const highestRisk = obligations.reduce<RiskLevel>(
        (worst, o) => (RISK_ORDER[o.risk] < RISK_ORDER[worst] ? o.risk : worst),
        'medio',
      );
      return {
        country,
        obligations,
        streams,
        highestRisk,
        unverifiedCount: obligations.filter((o) => !o.verified).length,
      };
    })
    .filter((c) => c.obligations.length > 0);

  const unverifiedCount = applied.filter((o) => !o.verified).length;

  return {
    obligations: applied,
    countries: byCountry,
    summary: {
      totalObligations: applied.length,
      unverifiedCount,
      criticalCount: applied.filter((o) => o.risk === 'critico').length,
      countriesCovered: byCountry.length,
      representativeGapCountries: [
        ...new Set(applied.filter((o) => o.representativeGap).map((o) => o.rule.country)),
      ],
      allUnverified: applied.length > 0 && unverifiedCount === applied.length,
      countriesNotLoaded,
      countriesWithoutMatches,
    },
    warnings,
  };
}
