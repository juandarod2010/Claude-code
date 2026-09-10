/**
 * Plan of Action (POA): el documento que se envía a Amazon para pedir la
 * reactivación de una cuenta o un listing.
 *
 * Este módulo NO redacta el contenido por ti: estructura lo que tú escribes y
 * lo saca en un formato limpio. La causa raíz y las pruebas las pone quien
 * conoce el caso.
 */

export interface Correction {
  /** Qué se ha corregido, en pasado y concreto. */
  action: string;
  /** Prueba: URL a una captura, número de expediente, descripción del documento. */
  evidence: string;
  /** Fecha ISO (YYYY-MM-DD) en que quedó hecho. */
  completedDate: string;
}

export interface PreventiveMeasure {
  /** El control que evita que vuelva a pasar. */
  measure: string;
  /** Cómo se implementa y quién lo comprueba. */
  implementation: string;
}

export interface PlanOfAction {
  sellerName: string;
  /** Motivo tal y como lo llama Amazon: "Order Defect Rate", "Policy Violation"… */
  suspensionReason: string;
  daysSuspended: number;
  /** Una causa raíz por elemento. Puede haber varias. */
  rootCauses: string[];
  correctionsTaken: Correction[];
  preventiveMeasures: PreventiveMeasure[];
  /**
   * Estimación orientativa de éxito, 0–100.
   * La calcula `estimateSuccess()` a partir de lo completo que esté el plan y
   * del tipo de suspensión. NO es una predicción: es una lista de comprobación
   * puntuada. Amazon no publica tasas y nosotros no las inventamos.
   */
  estimatedSuccess: number;
}

export const DISCLAIMER_POA =
  'Documento orientativo. La puntuación estimada refleja lo completo que está ' +
  'este plan, no una probabilidad real de reactivación: Amazon no publica tasas ' +
  'de aceptación y nadie puede garantizar un resultado.';

/**
 * Tipos de suspensión que reconocemos, con un peso relativo de dificultad.
 * Los pesos son criterio comercial NUESTRO, salido de cómo de difícil es
 * documentar cada caso, no de ninguna estadística de Amazon.
 */
export const SUSPENSION_TYPES = {
  order_defect_rate: { label: 'Order Defect Rate', difficulty: 25 },
  late_shipment: { label: 'Late Shipment Rate', difficulty: 20 },
  policy_violation: { label: 'Policy Violation', difficulty: 45 },
  intellectual_property: { label: 'Intellectual Property (queja de marca o patente)', difficulty: 70 },
  inauthentic: { label: 'Inauthentic / producto no auténtico', difficulty: 65 },
  condition_complaints: { label: 'Item Not As Described / estado del producto', difficulty: 40 },
  restricted_product: { label: 'Restricted Product', difficulty: 60 },
  linked_account: { label: 'Cuenta vinculada a otra suspendida', difficulty: 75 },
  dropshipping: { label: 'Incumplimiento de la política de dropshipping', difficulty: 55 },
  review_manipulation: { label: 'Manipulación de reseñas', difficulty: 85 },
  unknown: { label: 'Sin clasificar', difficulty: 50 },
} as const;

export type SuspensionType = keyof typeof SUSPENSION_TYPES;

export function isSuspensionType(value: string): value is SuspensionType {
  return Object.prototype.hasOwnProperty.call(SUSPENSION_TYPES, value);
}

/**
 * Puntúa lo COMPLETO que está el plan (0–100), penalizado por la dificultad
 * del tipo de suspensión y por los días transcurridos.
 *
 * Función pura. Los tramos están aquí, juntos, para poder ajustarlos.
 */
export const SUCCESS_SCORING = {
  base: 100,
  /** Falta alguno de los tres bloques obligatorios. */
  missingRootCause: 35,
  missingCorrections: 30,
  missingPreventive: 20,
  /** Correcciones sin prueba documental. */
  correctionWithoutEvidence: 8,
  /** Una sola causa raíz para una suspensión difícil suele quedarse corta. */
  shallowRootCause: 10,
  /** Penalización por antigüedad: a más días, más difícil documentar. */
  perWeekSuspended: 3,
  maxAgePenalty: 21,
  /** Cuánto pesa la dificultad del tipo de suspensión. */
  difficultyFactor: 0.5,
  floor: 5,
  ceiling: 95,
} as const;

export function estimateSuccess(
  plan: Omit<PlanOfAction, 'estimatedSuccess'>,
  type: SuspensionType = 'unknown',
): number {
  const s = SUCCESS_SCORING;
  let score = s.base;

  if (plan.rootCauses.length === 0) score -= s.missingRootCause;
  if (plan.correctionsTaken.length === 0) score -= s.missingCorrections;
  if (plan.preventiveMeasures.length === 0) score -= s.missingPreventive;

  const withoutEvidence = plan.correctionsTaken.filter((c) => !c.evidence.trim()).length;
  score -= withoutEvidence * s.correctionWithoutEvidence;

  const difficulty = SUSPENSION_TYPES[type].difficulty;
  if (difficulty >= 60 && plan.rootCauses.length === 1) score -= s.shallowRootCause;

  const agePenalty = Math.min(
    s.maxAgePenalty,
    Math.floor(Math.max(0, plan.daysSuspended) / 7) * s.perWeekSuspended,
  );
  score -= agePenalty;
  score -= difficulty * s.difficultyFactor;

  return Math.max(s.floor, Math.min(s.ceiling, Math.round(score)));
}

/** Plan vacío para arrancar un caso. */
export function emptyPlan(sellerName = '', suspensionReason = ''): PlanOfAction {
  return {
    sellerName,
    suspensionReason,
    daysSuspended: 0,
    rootCauses: [],
    correctionsTaken: [],
    preventiveMeasures: [],
    estimatedSuccess: 0,
  };
}

function section(title: string, lines: string[]): string {
  return `## ${title}\n\n${lines.length ? lines.join('\n') : '_(pendiente de completar)_'}\n`;
}

/** Documento en Markdown, listo para revisar y pegar. */
export function renderPlanAsMarkdown(plan: PlanOfAction, type: SuspensionType = 'unknown'): string {
  const header = [
    `# Plan of Action — ${plan.sellerName || '(vendedor)'}`,
    '',
    `**Motivo de la suspensión:** ${plan.suspensionReason || SUSPENSION_TYPES[type].label}`,
    `**Días suspendido:** ${plan.daysSuspended}`,
    `**Puntuación del plan:** ${plan.estimatedSuccess}/100 (orientativa)`,
    '',
  ].join('\n');

  const rootCauses = section(
    '1. Causa raíz',
    plan.rootCauses.map((cause, i) => `${i + 1}. ${cause}`),
  );

  const corrections = section(
    '2. Correcciones ya realizadas',
    plan.correctionsTaken.map(
      (c) =>
        `- **${c.action}**\n  - Prueba: ${c.evidence || '_falta la prueba documental_'}\n  - Completado: ${c.completedDate || '_sin fecha_'}`,
    ),
  );

  const preventive = section(
    '3. Medidas preventivas',
    plan.preventiveMeasures.map((m) => `- **${m.measure}**\n  - Implementación: ${m.implementation}`),
  );

  return `${header}${rootCauses}\n${corrections}\n${preventive}\n---\n\n_${DISCLAIMER_POA}_\n`;
}

/** Mismo contenido en texto plano, para pegar en el formulario de Amazon. */
export function renderPlanAsText(plan: PlanOfAction, type: SuspensionType = 'unknown'): string {
  return renderPlanAsMarkdown(plan, type)
    .replace(/^#+ /gm, '')
    .replace(/\*\*/g, '')
    .replace(/^_|_$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Estructura completa en JSON, para archivar el caso. */
export function renderPlanAsJson(plan: PlanOfAction, type: SuspensionType = 'unknown'): string {
  return JSON.stringify(
    { suspensionType: type, plan, disclaimer: DISCLAIMER_POA },
    null,
    2,
  );
}

/** Qué le falta al plan para estar completo. */
export function missingPlanParts(plan: PlanOfAction): string[] {
  const missing: string[] = [];
  if (!plan.sellerName.trim()) missing.push('Nombre del vendedor');
  if (!plan.suspensionReason.trim()) missing.push('Motivo de la suspensión');
  if (plan.rootCauses.length === 0) missing.push('Al menos una causa raíz');
  if (plan.correctionsTaken.length === 0) missing.push('Al menos una corrección realizada');
  if (plan.preventiveMeasures.length === 0) missing.push('Al menos una medida preventiva');
  const noEvidence = plan.correctionsTaken.filter((c) => !c.evidence.trim());
  if (noEvidence.length > 0) {
    missing.push(`Prueba documental en ${noEvidence.length} corrección(es)`);
  }
  return missing;
}
