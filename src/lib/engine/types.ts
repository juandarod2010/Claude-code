import type { ObligationRule } from '../../data/rules/schema';
import type { CountryCode, ProductCategory, RiskLevel, WasteStream } from '../../types/domain';

export interface AppliedObligation {
  rule: ObligationRule;
  risk: RiskLevel;
  /** Puntuación interna que produjo el nivel de riesgo. Útil para depurar y ordenar. */
  score: number;
  /** Por qué sale este nivel de riesgo. Texto para el informe. */
  riskReasons: string[];
  /** Categorías declaradas por el vendedor que activan esta obligación. */
  triggeringCategories: ProductCategory[];
  /** El vendedor no está establecido en la UE y esta obligación exige representante. */
  representativeGap: boolean;
  /** Copia de rule.verified, para que la interfaz no tenga que bajar al registro. */
  verified: boolean;
}

export interface CountryAssessment {
  country: CountryCode;
  obligations: AppliedObligation[];
  streams: WasteStream[];
  highestRisk: RiskLevel;
  /** Cuántas de las obligaciones de este país están sin verificar. */
  unverifiedCount: number;
}

export interface EngineResult {
  /** Todas las obligaciones aplicables, ya ordenadas de más a menos urgente. */
  obligations: AppliedObligation[];
  /** Las mismas obligaciones agrupadas por país, para la sección 1 del informe. */
  countries: CountryAssessment[];
  summary: {
    totalObligations: number;
    unverifiedCount: number;
    criticalCount: number;
    countriesCovered: number;
    representativeGapCountries: CountryCode[];
    /** true si TODA la base usada está sin verificar. El informe no es publicable. */
    allUnverified: boolean;
  };
  /** Avisos para el operador (no para el cliente), p. ej. país sin reglas cargadas. */
  warnings: string[];
}
