import type { Lead, Prospect, Report } from '../../lib/storage/types';

/**
 * Cálculo del informe semanal. Función pura: recibe los datos y devuelve el
 * objeto. Así se puede probar sin base de datos y sin tocar el disco.
 */

export interface WeeklyReport {
  week: string;
  generatedAt: string;
  source: 'supabase' | 'archivo' | 'vacío';
  track_a: {
    messages_sent: number;
    responses: number;
    response_rate: number;
    variant_a_responses: number;
    variant_b_responses: number;
    revenue: number;
    cases_open: number;
  };
  track_b: {
    diagnoses_completed: number;
    reports_purchased: number;
    revenue: number;
    rules_verified: number;
  };
  notes: string[];
}

/** Semana ISO: 2026-W37. */
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Lunes 00:00 y domingo 23:59:59 de la semana que contiene `date`. */
export function weekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function inWeek(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

export interface WeeklyInput {
  leads: Lead[];
  reports: Report[];
  prospects: Prospect[];
  rulesVerified: number;
  reference?: Date;
  source?: WeeklyReport['source'];
}

export function buildWeeklyReport({
  leads,
  reports,
  prospects,
  rulesVerified,
  reference = new Date(),
  source = 'vacío',
}: WeeklyInput): WeeklyReport {
  const { start, end } = weekBounds(reference);
  const notes: string[] = [];

  const weekProspects = prospects.filter((p) => inWeek(p.createdAt, start, end));
  const responded = weekProspects.filter((p) => p.responded);

  const weekLeads = leads.filter((l) => inWeek(l.createdAt, start, end));
  const appealLeads = weekLeads.filter((l) => l.type === 'appeal');
  const complyoLeads = weekLeads.filter((l) => l.type === 'complyo');

  const revenueOf = (list: Lead[]) => list.reduce((sum, l) => sum + (l.revenue ?? 0), 0);

  const weekReports = reports.filter((r) => inWeek(r.createdAt, start, end));

  if (weekProspects.length === 0) {
    notes.push('No se registró ningún mensaje de prospección esta semana.');
  }
  if (revenueOf(weekLeads) === 0) {
    notes.push(
      'Ingresos a cero: recuerda anotar el importe cobrado en cada lead desde /admin/leads.',
    );
  }
  if (rulesVerified === 0) {
    notes.push('Ninguna obligación verificada todavía: sigue siendo el bloqueante del Track B.');
  }

  return {
    week: isoWeek(reference),
    generatedAt: new Date().toISOString(),
    source,
    track_a: {
      messages_sent: weekProspects.length,
      responses: responded.length,
      response_rate: weekProspects.length ? responded.length / weekProspects.length : 0,
      variant_a_responses: responded.filter((p) => p.variant === 'A').length,
      variant_b_responses: responded.filter((p) => p.variant === 'B').length,
      revenue: revenueOf(appealLeads),
      cases_open: appealLeads.filter((l) => l.status === 'nuevo' || l.status === 'contactado')
        .length,
    },
    track_b: {
      diagnoses_completed: complyoLeads.length,
      reports_purchased: complyoLeads.filter((l) => l.status === 'convertido').length,
      revenue: revenueOf(complyoLeads),
      rules_verified: rulesVerified,
    },
    notes: [
      ...notes,
      `Periodo: ${start.toISOString().slice(0, 10)} a ${new Date(end.getTime() - 1).toISOString().slice(0, 10)}.`,
      `Informes generados en el periodo: ${weekReports.length}.`,
    ],
  };
}
