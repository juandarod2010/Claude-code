import type { CountryCode, ProductCategory, WasteStream } from '../../types/domain';

/**
 * Un registro de la base de reglas = UNA obligación concreta,
 * en UN país, para UN flujo de residuo.
 *
 * REGLA INNEGOCIABLE: ningún campo de este objeto puede rellenarse "de memoria".
 * Todo dato jurídico debe salir de `sourceUrl` y anotarse la fecha de consulta
 * en `sourceCheckedAt`. Mientras eso no ocurra, `verified` es false y el informe
 * lo marca como PENDIENTE DE VERIFICACIÓN.
 */
export interface ObligationRule {
  /** Identificador estable. Convención: `<pais>-<flujo>-<sufijo>`. */
  id: string;
  country: CountryCode;
  stream: WasteStream;

  /** Nombre del registro público o de la autoridad competente. */
  authorityName: string;
  /** Nombre del organismo de responsabilidad ampliada, si el país lo separa del registro. */
  complianceSchemeName?: string;

  /** ¿Es obligatorio designar representante autorizado si el vendedor NO está establecido en la UE? */
  representativeRequiredForNonEstablished: boolean;

  /** Periodicidad de la declaración de cantidades. Texto libre en español. */
  reportingFrequency: string;

  /** Qué datos exige la declaración o el alta. Una entrada por dato. */
  requiredData: string[];

  /** Consecuencia documentada del incumplimiento. */
  nonComplianceConsequence: string;

  /**
   * A qué categorías de producto aplica esta obligación.
   * 'all' = a todas las categorías que activen este flujo de residuo.
   */
  appliesToCategories: ProductCategory[] | 'all';

  /** Peso relativo para ordenar el informe. Mayor = antes. Criterio comercial, no jurídico. */
  severityWeight: number;

  // --- Trazabilidad obligatoria ---
  /** URL de la fuente OFICIAL de la que sale este registro. Obligatoria. */
  sourceUrl: string;
  /** Fecha ISO (YYYY-MM-DD) en que se consultó esa fuente. Obligatoria. */
  sourceCheckedAt: string;
  /** Arranca SIEMPRE en false. Solo lo pone a true una persona tras leer la fuente. */
  verified: boolean;
  /** Notas del verificador. Opcional. */
  notes?: string;
}

/** Marca que identifica los datos de ejemplo. No debe quedar ninguna en producción. */
export const EXAMPLE_MARKER = '__EJEMPLO__';

export function isExampleRule(rule: ObligationRule): boolean {
  return (
    rule.authorityName.includes(EXAMPLE_MARKER) ||
    (rule.complianceSchemeName?.includes(EXAMPLE_MARKER) ?? false)
  );
}
