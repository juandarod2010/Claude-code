import type { CountryCode } from '../types/domain';
import type { Lead, LeadStatus, LeadType } from './storage/types';

/**
 * Filtros del panel de leads.
 *
 * El predicado vive aquí, aparte y puro, por dos razones: es lo que aplica el
 * almacenamiento local, y es lo que hay que replicar en la consulta a Supabase.
 * Teniéndolo en un sitio se puede comprobar que los dos caminos filtran igual.
 */

export interface LeadFilters {
  type?: LeadType | '';
  status?: LeadStatus | '';
  /** País de destino. Solo aplica a los leads de cumplimiento. */
  country?: CountryCode | '';
  /** Fechas inclusivas, formato YYYY-MM-DD. */
  from?: string;
  to?: string;
  /** Texto libre contra el correo y el nombre de empresa. */
  search?: string;
}

export interface LeadQuery extends LeadFilters {
  limit: number;
  offset: number;
}

/** Una página de resultados más el total que hay detrás del filtro. */
export interface LeadPage {
  rows: Lead[];
  total: number;
}

/** Cifras del conjunto filtrado ENTERO, no solo de la página visible. */
export interface LeadAggregates {
  total: number;
  converted: number;
  revenue: number;
}

export const PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export function matchesFilters(lead: Lead, filters: LeadFilters): boolean {
  if (filters.type && lead.type !== filters.type) return false;
  if (filters.status && lead.status !== filters.status) return false;

  if (filters.country && !(lead.answers?.countries ?? []).includes(filters.country)) return false;

  const day = lead.createdAt.slice(0, 10);
  if (filters.from && day < filters.from) return false;
  if (filters.to && day > filters.to) return false;

  const needle = filters.search?.trim().toLowerCase();
  if (needle) {
    const haystack = `${lead.email} ${lead.companyName ?? ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

/** Agrega sobre la lista ya filtrada. */
export function aggregate(leads: readonly Lead[]): LeadAggregates {
  const converted = leads.filter((l) => l.status === 'convertido');
  return {
    total: leads.length,
    converted: converted.length,
    revenue: leads.reduce((sum, l) => sum + (l.revenue ?? 0), 0),
  };
}

/** Cuántas páginas hay. Siempre al menos una, aunque esté vacía. */
export function pageCount(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}

/** Corrige la página cuando el filtro deja menos resultados de los que había. */
export function clampPage(page: number, total: number, limit: number): number {
  return Math.min(Math.max(0, page), pageCount(total, limit) - 1);
}

/** «26–50 de 312». Para que se vea dónde estás sin contar filas. */
export function rangeLabel(offset: number, shown: number, total: number): string {
  if (total === 0) return '0 de 0';
  return `${offset + 1}–${offset + shown} de ${total}`;
}
