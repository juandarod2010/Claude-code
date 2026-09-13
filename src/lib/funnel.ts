import type { Lead, Prospect } from './storage/types';

/**
 * Metas del embudo: cuántos prospectos hay que tocar para llegar a 100 $/semana.
 *
 * QUÉ HACE. Dos cosas separadas a propósito:
 *
 *   1. `observeFunnel()` MIDE. Cuenta lo que ha pasado de verdad: prospectos,
 *      respuestas, leads, clientes, ingresos. No estima nada.
 *   2. `planFunnel()` PROYECTA. A partir de unas tasas dadas dice cuántos
 *      prospectos semanales hacen falta. Es aritmética, no una predicción.
 *
 * Están separadas porque la tentación es proyectar con las tasas que uno
 * quisiera tener. El sitio en el que se juntan es `requiredProspects()`, que
 * usa las tasas observadas SOLO cuando la muestra da para ello y, cuando no,
 * lo dice y usa las de arranque.
 *
 * SOBRE LAS TASAS DE ARRANQUE. No salen de ningún estudio: son un punto de
 * partida conservador para poder calcular algo el primer día. En cuanto haya
 * 40 prospectos contactados, las reales las sustituyen. Si al medir salen
 * peores, el número de prospectos sube y eso es información, no un fallo.
 */

/** Objetivo semanal en dólares. Es el encargo. */
export const WEEKLY_GOAL_USD = 100;

/**
 * Por debajo de esta muestra no se usan las tasas observadas para proyectar.
 * Con 10 mensajes y 1 respuesta, la tasa "observada" es del 10 % y no significa
 * nada: el intervalo real va del 0 % al 30 %.
 */
export const MIN_SAMPLE_FOR_RATES = 40;

/** Tasas de arranque. Conservadoras a propósito. Ver comentario de cabecera. */
export const SEED_RATES = {
  /** De los que reciben el primer mensaje, cuántos contestan algo. */
  responseRate: 0.1,
  /** De los que contestan, cuántos acaban pagando. */
  closeRate: 0.2,
} as const;

export interface FunnelPlan {
  /** Dólares que hay que facturar por semana. */
  goal: number;
  /** Precio del servicio que se está vendiendo. */
  ticket: number;
  responseRate: number;
  closeRate: number;
  /** Clientes por semana necesarios. Entero hacia arriba: medio cliente no paga. */
  clientsPerWeek: number;
  /** Respuestas necesarias para sacar esos clientes. */
  responsesPerWeek: number;
  /** Prospectos a contactar por semana. Este es el número que se trabaja. */
  prospectsPerWeek: number;
  /** Y por día laborable, que es como se ejecuta de verdad. */
  prospectsPerWorkday: number;
}

/** Días a la semana en los que se hace prospección. No se cuenta el fin de semana. */
const WORKDAYS = 5;

/**
 * Aritmética del embudo. Sin datos, sin magia: objetivo ÷ precio, y hacia atrás.
 *
 * @throws si el precio o alguna tasa no son utilizables. Un precio de 0 o una
 * tasa de 0 daría "infinitos prospectos", que se pintaría como un número roto
 * en pantalla en vez de como el error de configuración que es.
 */
export function planFunnel(input: {
  goal?: number;
  ticket: number;
  responseRate: number;
  closeRate: number;
}): FunnelPlan {
  const goal = input.goal ?? WEEKLY_GOAL_USD;
  const { ticket, responseRate, closeRate } = input;

  if (!(ticket > 0)) throw new Error('El precio tiene que ser mayor que 0.');
  if (!(goal > 0)) throw new Error('El objetivo tiene que ser mayor que 0.');
  if (!(responseRate > 0) || responseRate > 1) {
    throw new Error('La tasa de respuesta tiene que estar entre 0 (excluido) y 1.');
  }
  if (!(closeRate > 0) || closeRate > 1) {
    throw new Error('La tasa de cierre tiene que estar entre 0 (excluida) y 1.');
  }

  const clientsPerWeek = Math.ceil(goal / ticket);
  const responsesPerWeek = Math.ceil(clientsPerWeek / closeRate);
  const prospectsPerWeek = Math.ceil(responsesPerWeek / responseRate);

  return {
    goal,
    ticket,
    responseRate,
    closeRate,
    clientsPerWeek,
    responsesPerWeek,
    prospectsPerWeek,
    prospectsPerWorkday: Math.ceil(prospectsPerWeek / WORKDAYS),
  };
}

export interface FunnelObservation {
  prospectsContacted: number;
  responses: number;
  /** Leads entrados: formulario relleno, de cualquiera de los dos tracks. */
  leads: number;
  clients: number;
  revenue: number;
  /** null cuando no hay denominador: no se devuelve 0, que se leería como "malo". */
  responseRate: number | null;
  closeRate: number | null;
  /** Ingreso medio por cliente. null si todavía no hay clientes. */
  averageTicket: number | null;
  /** ¿Hay muestra suficiente para fiarse de las tasas de arriba? */
  ratesAreReliable: boolean;
  /** Cuántos prospectos faltan para llegar a la muestra mínima. */
  sampleMissing: number;
}

/** Mide el embudo real. Solo cuenta; no proyecta ni rellena huecos. */
export function observeFunnel(
  prospects: readonly Prospect[],
  leads: readonly Lead[],
): FunnelObservation {
  const prospectsContacted = prospects.length;
  const responses = prospects.filter((p) => p.responded).length;
  const clientLeads = leads.filter((l) => l.status === 'convertido');
  const revenue = leads.reduce((sum, l) => sum + (l.revenue ?? 0), 0);

  return {
    prospectsContacted,
    responses,
    leads: leads.length,
    clients: clientLeads.length,
    revenue,
    responseRate: prospectsContacted ? responses / prospectsContacted : null,
    closeRate: responses ? clientLeads.length / responses : null,
    averageTicket: clientLeads.length ? revenue / clientLeads.length : null,
    ratesAreReliable: prospectsContacted >= MIN_SAMPLE_FOR_RATES,
    sampleMissing: Math.max(0, MIN_SAMPLE_FOR_RATES - prospectsContacted),
  };
}

export type RateSource = 'observadas' | 'arranque' | 'mixtas';

export interface FunnelTarget {
  plan: FunnelPlan;
  source: RateSource;
  /** Explicación en una línea de de dónde salen las tasas usadas. */
  rationale: string;
}

/**
 * El número de prospectos semanales que hay que trabajar, con las mejores tasas
 * disponibles.
 *
 * La regla: se usa lo observado cuando la muestra llega al mínimo Y la tasa no
 * es cero. Una tasa observada de 0 % no se puede usar para dividir, y además
 * significa otra cosa —el canal o el mensaje no funcionan—, así que ahí se cae
 * a la tasa de arranque y el motivo se dice en `rationale`.
 */
export function requiredProspects(
  observation: FunnelObservation,
  ticket: number,
  goal: number = WEEKLY_GOAL_USD,
): FunnelTarget {
  const canUseResponse =
    observation.ratesAreReliable && observation.responseRate !== null && observation.responseRate > 0;
  // El cierre necesita su propio denominador: puede haber muestra de prospectos
  // de sobra y aun así ninguna respuesta sobre la que medir cierres.
  const canUseClose =
    observation.ratesAreReliable && observation.closeRate !== null && observation.closeRate > 0;

  const responseRate = canUseResponse ? observation.responseRate! : SEED_RATES.responseRate;
  const closeRate = canUseClose ? observation.closeRate! : SEED_RATES.closeRate;

  let source: RateSource;
  let rationale: string;
  if (canUseResponse && canUseClose) {
    source = 'observadas';
    rationale = `Tasas medidas sobre ${observation.prospectsContacted} prospectos y ${observation.responses} respuestas.`;
  } else if (!canUseResponse && !canUseClose) {
    source = 'arranque';
    rationale = observation.ratesAreReliable
      ? 'Hay muestra, pero ninguna respuesta o ningún cierre todavía: no se puede dividir por cero, así que se usan las tasas de arranque. Si esto sigue así tras 80 prospectos, el problema es el canal o el mensaje, no el volumen.'
      : `Muestra corta: faltan ${observation.sampleMissing} prospectos para fiarse de las tasas reales. Mientras tanto, tasas de arranque.`;
  } else {
    source = 'mixtas';
    rationale = canUseResponse
      ? 'Respuesta medida; cierre todavía sin datos, se usa el de arranque.'
      : 'Cierre medido; respuesta todavía sin datos, se usa la de arranque.';
  }

  return { plan: planFunnel({ goal, ticket, responseRate, closeRate }), source, rationale };
}

/** Cuánto falta para el objetivo de la semana. */
export interface GoalProgress {
  revenue: number;
  goal: number;
  missing: number;
  /** 0–1, tope 1: pasado el objetivo no se sigue llenando la barra. */
  ratio: number;
  reached: boolean;
}

export function goalProgress(revenue: number, goal: number = WEEKLY_GOAL_USD): GoalProgress {
  const missing = Math.max(0, goal - revenue);
  return {
    revenue,
    goal,
    missing,
    ratio: goal > 0 ? Math.min(1, revenue / goal) : 0,
    reached: revenue >= goal,
  };
}

/**
 * Ingresos de los últimos 7 días, contados sobre `updatedAt`.
 *
 * POR QUÉ `updatedAt` Y NO `createdAt`: el ingreso se anota cuando se cobra, y
 * eso es una edición del lead. Un lead que entró hace un mes y paga hoy cuenta
 * en la semana de hoy, que es cuando ha entrado el dinero. Es una aproximación
 * —cualquier otra edición mueve la fecha— y se prefiere a la alternativa, que
 * sería añadir un campo `paidAt` que alguien tiene que acordarse de rellenar.
 */
export function revenueLast7Days(leads: readonly Lead[], now: Date = new Date()): number {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  return leads
    .filter((l) => (l.revenue ?? 0) > 0 && Date.parse(l.updatedAt) >= cutoff)
    .reduce((sum, l) => sum + (l.revenue ?? 0), 0);
}
