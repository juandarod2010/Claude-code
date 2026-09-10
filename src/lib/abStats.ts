import type { Lead, Prospect, ProspectVariant } from './storage/types';

/**
 * Comparación de las variantes A y B.
 *
 * Cuenta lo que hay. NO hace inferencia estadística: con las muestras que vas a
 * manejar al principio (decenas de mensajes), cualquier cálculo de significación
 * daría una falsa sensación de certeza. Lo que sí hace es decirte, en claro,
 * cuándo la muestra todavía no da para concluir nada.
 */

/**
 * Por debajo de esto no se dice cuál gana. Es un umbral práctico nuestro, no un
 * resultado estadístico: con menos de 30 envíos por variante, una diferencia de
 * dos respuestas parece enorme y no significa nada.
 */
export const MIN_SAMPLE_PER_VARIANT = 30;

export interface VariantStats {
  variant: ProspectVariant;
  /** Mensajes de prospección registrados con esta variante. */
  sent: number;
  responded: number;
  responseRate: number;
  /** Leads de apelación a los que se les asignó esta variante. */
  leads: number;
  converted: number;
  conversionRate: number;
  revenue: number;
}

export type Verdict =
  | { kind: 'sin_datos'; message: string }
  | { kind: 'muestra_corta'; message: string; missing: number }
  | { kind: 'empate'; message: string }
  | { kind: 'ventaja'; winner: ProspectVariant; message: string; gapPoints: number };

export interface AbReport {
  A: VariantStats;
  B: VariantStats;
  totalSent: number;
  totalResponded: number;
  verdict: Verdict;
}

function statsFor(
  variant: ProspectVariant,
  prospects: readonly Prospect[],
  leads: readonly Lead[],
): VariantStats {
  const mine = prospects.filter((p) => p.variant === variant);
  const responded = mine.filter((p) => p.responded);
  const myLeads = leads.filter((l) => l.variant === variant);
  const converted = myLeads.filter((l) => l.status === 'convertido');

  return {
    variant,
    sent: mine.length,
    responded: responded.length,
    responseRate: mine.length ? responded.length / mine.length : 0,
    leads: myLeads.length,
    converted: converted.length,
    conversionRate: myLeads.length ? converted.length / myLeads.length : 0,
    revenue: myLeads.reduce((sum, l) => sum + (l.revenue ?? 0), 0),
  };
}

function verdictFor(a: VariantStats, b: VariantStats): Verdict {
  if (a.sent === 0 && b.sent === 0) {
    return {
      kind: 'sin_datos',
      message:
        'Todavía no has registrado ningún mensaje. La comparación empieza a tener sentido cuando lleves unas decenas de cada variante.',
    };
  }

  const smallest = Math.min(a.sent, b.sent);
  if (smallest < MIN_SAMPLE_PER_VARIANT) {
    const missing = MIN_SAMPLE_PER_VARIANT - smallest;
    return {
      kind: 'muestra_corta',
      missing,
      message: `Muestra corta: faltan ${missing} envío(s) en la variante con menos datos para llegar a ${MIN_SAMPLE_PER_VARIANT}. Hasta entonces, una diferencia de dos respuestas parece enorme y no significa nada.`,
    };
  }

  const gapPoints = Math.round((a.responseRate - b.responseRate) * 1000) / 10;
  if (Math.abs(gapPoints) < 1) {
    return {
      kind: 'empate',
      message:
        'Las dos responden prácticamente igual. Si tienes que elegir, quédate con la que te resulte más cómoda de sostener en la conversación posterior.',
    };
  }

  const winner: ProspectVariant = gapPoints > 0 ? 'A' : 'B';
  return {
    kind: 'ventaja',
    winner,
    gapPoints: Math.abs(gapPoints),
    message: `La variante ${winner} va por delante en ${Math.abs(gapPoints)} puntos de tasa de respuesta. Es una diferencia observada, no un resultado estadístico: sigue midiendo.`,
  };
}

/** Función pura: mismos datos, mismo informe. */
export function buildAbReport(prospects: readonly Prospect[], leads: readonly Lead[]): AbReport {
  const A = statsFor('A', prospects, leads);
  const B = statsFor('B', prospects, leads);
  return {
    A,
    B,
    totalSent: A.sent + B.sent,
    totalResponded: A.responded + B.responded,
    verdict: verdictFor(A, B),
  };
}
