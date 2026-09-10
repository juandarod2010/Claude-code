import type { ObligationRule } from '../data/rules/schema';

/**
 * Historial de la base de reglas.
 *
 * Por qué existe: la suscripción de vigilancia que vendes consiste en avisar al
 * cliente cuando cambia algo que le afecta. Sin un registro de qué cambió y
 * cuándo, esa suscripción es una promesa vacía. Esto es su sustancia.
 *
 * Todo lo de este módulo son funciones puras: reciben obligaciones y devuelven
 * la comparación. No tocan red ni almacenamiento.
 */

export type ChangeType = 'alta' | 'modificacion' | 'baja';

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  alta: 'Alta',
  modificacion: 'Modificación',
  baja: 'Baja',
};

/** Un campo que cambió, con su valor antes y después. */
export interface FieldChange {
  field: keyof ObligationRule;
  label: string;
  before: string;
  after: string;
  /**
   * true si es un cambio que el cliente tiene que saber: cambia lo que debe
   * hacer. Un ajuste de notas internas o del peso de severidad, no.
   */
  material: boolean;
}

export interface RuleVersion {
  id: string;
  ruleId: string;
  changedAt: string;
  changeType: ChangeType;
  /** Estado completo de la obligación tras el cambio. En una baja, el último. */
  payload: ObligationRule;
  changes: FieldChange[];
}

/**
 * Qué campos se comparan, cómo se llaman en pantalla y si su cambio es
 * material para el cliente.
 *
 * `material` es criterio nuestro, no jurídico: distingue lo que cambia las
 * obligaciones del cliente de lo que es mantenimiento interno nuestro.
 */
const TRACKED: { field: keyof ObligationRule; label: string; material: boolean }[] = [
  { field: 'authorityName', label: 'Registro o autoridad', material: true },
  { field: 'complianceSchemeName', label: 'Organismo de responsabilidad', material: true },
  {
    field: 'representativeRequiredForNonEstablished',
    label: 'Representante obligatorio para no establecidos',
    material: true,
  },
  { field: 'reportingFrequency', label: 'Periodicidad de declaración', material: true },
  { field: 'requiredData', label: 'Datos que exige', material: true },
  { field: 'nonComplianceConsequence', label: 'Consecuencia del incumplimiento', material: true },
  { field: 'appliesToCategories', label: 'Categorías a las que aplica', material: true },
  { field: 'verified', label: 'Verificada', material: true },
  { field: 'sourceUrl', label: 'Fuente', material: false },
  { field: 'sourceCheckedAt', label: 'Fecha de comprobación', material: false },
  { field: 'severityWeight', label: 'Peso de severidad', material: false },
  { field: 'notes', label: 'Notas internas', material: false },
];

function render(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join('; ');
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  return String(value);
}

/** Compara dos versiones de una obligación. Devuelve solo lo que cambió. */
export function diffRules(
  before: ObligationRule | null,
  after: ObligationRule | null,
): FieldChange[] {
  if (!before && !after) return [];

  return TRACKED.flatMap(({ field, label, material }) => {
    const previous = render(before?.[field]);
    const next = render(after?.[field]);
    if (previous === next) return [];
    return [{ field, label, before: previous, after: next, material }];
  });
}

/** Crea la entrada de historial que corresponde a un guardado o a un borrado. */
export function buildVersion(
  id: string,
  changedAt: string,
  before: ObligationRule | null,
  after: ObligationRule | null,
): RuleVersion | null {
  const changeType: ChangeType = !before ? 'alta' : !after ? 'baja' : 'modificacion';
  const changes = diffRules(before, after);

  // Guardar sin cambiar nada no genera entrada: el historial se llenaría de ruido.
  if (changeType === 'modificacion' && changes.length === 0) return null;

  const payload = after ?? before;
  if (!payload) return null;

  return { id, ruleId: payload.id, changedAt, changeType, payload, changes };
}

/** true si la entrada afecta a lo que el cliente tiene que hacer. */
export function isMaterial(version: RuleVersion): boolean {
  if (version.changeType !== 'modificacion') return true;
  return version.changes.some((c) => c.material);
}

export interface ChangesSince {
  /** Entradas posteriores a la fecha, de más reciente a más antigua. */
  versions: RuleVersion[];
  /** Solo las que afectan al cliente. */
  material: RuleVersion[];
  /** Identificadores de obligación tocados. */
  ruleIds: string[];
}

/**
 * Qué ha cambiado desde una fecha, opcionalmente acotado a las obligaciones que
 * salían en el informe de un cliente. Es lo que se le cuenta al suscriptor.
 */
export function changesSince(
  versions: readonly RuleVersion[],
  since: string,
  ruleIds?: readonly string[],
): ChangesSince {
  const scope = ruleIds ? new Set(ruleIds) : null;
  const filtered = versions
    .filter((v) => v.changedAt > since)
    .filter((v) => !scope || scope.has(v.ruleId))
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt));

  return {
    versions: filtered,
    material: filtered.filter(isMaterial),
    ruleIds: [...new Set(filtered.map((v) => v.ruleId))],
  };
}

/** Una línea legible por cambio, para el correo de vigilancia. */
export function describeVersion(version: RuleVersion): string {
  const { payload, changeType } = version;
  const head = `${CHANGE_TYPE_LABELS[changeType]} · ${payload.authorityName}`;
  if (changeType !== 'modificacion') return head;
  return `${head} — ${version.changes.map((c) => c.label.toLowerCase()).join(', ')}`;
}
