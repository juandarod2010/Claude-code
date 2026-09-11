import type { SupabaseClient } from '@supabase/supabase-js';
import type { ObligationRule } from '../../data/rules/schema';
import type { DiagnosticAnswers } from '../../types/domain';
import type { EngineResult } from '../engine/types';
import type { LeadFilters, LeadQuery } from '../leadFilters';
import { buildReportReference } from '../reportReference';
import { buildVersion, type RuleVersion } from '../rulesHistory';
import type {
  AppealDetails,
  Lead,
  LeadNote,
  LeadPatch,
  LeadStatus,
  LeadType,
  Prospect,
  ProspectVariant,
  Report,
  Storage,
  StoredRule,
} from './types';

/**
 * Adaptador Supabase. Solo se usa si VITE_MOCK=false y hay URL + clave anónima.
 * El esquema está en /supabase/migrations/. Row Level Security está activado:
 * la clave anónima solo puede INSERTAR leads e informes, nunca leerlos.
 */

interface LeadRow {
  id: string;
  created_at: string;
  updated_at: string;
  type: LeadType;
  status: LeadStatus;
  email: string;
  company_name: string | null;
  answers: DiagnosticAnswers | null;
  appeal: AppealDetails | null;
  variant: 'A' | 'B' | null;
  revenue: number | null;
  notes: LeadNote[] | null;
}

interface ReportRow {
  id: string;
  lead_id: string;
  created_at: string;
  result: EngineResult;
  rules_snapshot_size: number;
  reference: string | null;
}

interface ProspectRow {
  id: string;
  created_at: string;
  listing_ref: string;
  country: string;
  missing_items: string[];
  variant: ProspectVariant;
  notes: string | null;
  responded: boolean | null;
}

interface RuleVersionRow {
  id: string;
  rule_id: string;
  changed_at: string;
  change_type: RuleVersion['changeType'];
  payload: ObligationRule;
  changes: RuleVersion['changes'];
}

interface RuleRow {
  id: string;
  updated_at: string;
  payload: ObligationRule;
}

const toLead = (r: LeadRow): Lead => ({
  id: r.id,
  createdAt: r.created_at,
  updatedAt: r.updated_at ?? r.created_at,
  type: r.type ?? 'complyo',
  status: r.status ?? 'nuevo',
  email: r.email,
  companyName: r.company_name,
  answers: r.answers,
  appeal: r.appeal,
  variant: r.variant,
  revenue: r.revenue,
  notes: r.notes ?? [],
});

const toReport = (r: ReportRow): Report => ({
  id: r.id,
  leadId: r.lead_id,
  createdAt: r.created_at,
  result: r.result,
  rulesSnapshotSize: r.rules_snapshot_size,
  reference: r.reference ?? buildReportReference(r.created_at, r.id),
});

const toProspect = (r: ProspectRow): Prospect => ({
  id: r.id,
  createdAt: r.created_at,
  listingRef: r.listing_ref,
  country: r.country,
  missingItems: r.missing_items,
  variant: r.variant,
  notes: r.notes,
  responded: r.responded ?? false,
});

const toRule = (r: RuleRow): StoredRule => ({ ...r.payload, updatedAt: r.updated_at });

const toVersion = (r: RuleVersionRow): RuleVersion => ({
  id: r.id,
  ruleId: r.rule_id,
  changedAt: r.changed_at,
  changeType: r.change_type,
  payload: r.payload,
  changes: r.changes ?? [],
});

/**
 * Traduce los filtros del panel a la consulta.
 *
 * Tiene que filtrar igual que `matchesFilters` en src/lib/leadFilters.ts, que
 * es lo que usa el modo local. Si los dos caminos divergen, el panel enseña
 * cosas distintas según dónde estén los datos.
 *
 * Las fechas se comparan en UTC, que es como las guarda la base.
 */
interface Filterable {
  eq(column: string, value: unknown): Filterable;
  gte(column: string, value: unknown): Filterable;
  lte(column: string, value: unknown): Filterable;
  contains(column: string, value: unknown): Filterable;
  or(filter: string): Filterable;
}

/**
 * El tipo del constructor de consultas de Supabase es recursivo y enorme; usarlo
 * como restricción genérica hace que TypeScript se rinda. Dentro se trabaja con
 * la forma mínima que necesitamos y se devuelve el tipo original intacto.
 */
function applyFilters<T>(builder: T, filters: LeadFilters): T {
  let query = builder as Filterable;

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.status) query = query.eq('status', filters.status);

  // `answers` es jsonb con un array de países; la contención usa el índice GIN.
  if (filters.country) {
    query = query.contains('answers', { countries: [filters.country] });
  }

  if (filters.from) query = query.gte('created_at', `${filters.from}T00:00:00.000Z`);
  if (filters.to) query = query.lte('created_at', `${filters.to}T23:59:59.999Z`);

  const needle = filters.search?.trim();
  if (needle) {
    // La coma separa condiciones dentro de `or()` y el porcentaje es comodín:
    // si llegan en el texto del usuario, la consulta se rompe o busca de más.
    const safe = needle.replace(/[,%()]/g, ' ').trim();
    if (safe) {
      query = query.or(`email.ilike.%${safe}%,company_name.ilike.%${safe}%`);
    }
  }

  return query as T;
}

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase (${context}): ${error.message}`);
}

export function createSupabaseStorage(db: SupabaseClient): Storage {

  async function insertLead(row: Record<string, unknown>): Promise<Lead> {
    const { data, error } = await db.from('leads').insert(row).select().single();
    fail('createLead', error);
    return toLead(data as LeadRow);
  }

  /** Anota una entrada en el historial de la base de reglas. */
  async function recordVersion(
    before: ObligationRule | null,
    after: ObligationRule | null,
    changedAt: string,
  ): Promise<void> {
    const version = buildVersion(crypto.randomUUID(), changedAt, before, after);
    if (!version) return;
    const { error } = await db.from('reglas_historial').insert({
      id: version.id,
      rule_id: version.ruleId,
      changed_at: version.changedAt,
      change_type: version.changeType,
      payload: version.payload,
      changes: version.changes,
    });
    // Que falle el historial no puede impedir guardar la obligación.
    if (error) console.warn(`[complyo] No se pudo anotar el historial: ${error.message}`);
  }

  async function updateLeadRow(id: string, row: Record<string, unknown>): Promise<Lead | null> {
    const { data, error } = await db
      .from('leads')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    fail('updateLead', error);
    return data ? toLead(data as LeadRow) : null;
  }

  return {
    mode: 'supabase',

    async createLead({ answers }) {
      return insertLead({
        type: 'complyo',
        email: answers.email,
        company_name: answers.companyName ?? null,
        answers,
      });
    },

    async createAppealLead({ email, companyName, appeal }) {
      return insertLead({
        type: 'appeal',
        email,
        company_name: companyName ?? null,
        appeal,
      });
    },

    async listLeads() {
      const { data, error } = await db
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      fail('listLeads', error);
      return (data as LeadRow[]).map(toLead);
    },

    async getLead(id) {
      const { data, error } = await db.from('leads').select('*').eq('id', id).maybeSingle();
      fail('getLead', error);
      return data ? toLead(data as LeadRow) : null;
    },

    async queryLeads(query: LeadQuery) {
      // `count: 'exact'` devuelve el total que hay detrás del filtro sin
      // traerse las filas: es lo que permite pintar «26–50 de 312».
      const builder = applyFilters(
        db.from('leads').select('*', { count: 'exact' }),
        query,
      ).order('created_at', { ascending: false });

      const { data, error, count } = await builder.range(
        query.offset,
        query.offset + query.limit - 1,
      );
      fail('queryLeads', error);
      return { rows: (data as LeadRow[]).map(toLead), total: count ?? 0 };
    },

    async aggregateLeads(filters: LeadFilters) {
      // Las cuentas van con `head: true`: el servidor cuenta y no manda filas.
      // Para el importe no hay suma sin una función en la base, así que se
      // piden SOLO los leads que tienen importe y SOLO esa columna.
      const [total, converted, revenue] = await Promise.all([
        applyFilters(db.from('leads').select('id', { count: 'exact', head: true }), filters),
        applyFilters(
          db.from('leads').select('id', { count: 'exact', head: true }),
          filters,
        ).eq('status', 'convertido'),
        applyFilters(db.from('leads').select('revenue'), filters).not('revenue', 'is', null),
      ]);

      fail('aggregateLeads', total.error ?? converted.error ?? revenue.error);

      return {
        total: total.count ?? 0,
        converted: converted.count ?? 0,
        revenue: ((revenue.data ?? []) as { revenue: number | null }[]).reduce(
          (sum, row) => sum + (row.revenue ?? 0),
          0,
        ),
      };
    },

    async countNewLeads() {
      const { count, error } = await db
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'nuevo');
      fail('countNewLeads', error);
      return count ?? 0;
    },

    async updateLead(id, patch: LeadPatch) {
      const row: Record<string, unknown> = {};
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.revenue !== undefined) row.revenue = patch.revenue;
      if (patch.variant !== undefined) row.variant = patch.variant;
      if (patch.companyName !== undefined) row.company_name = patch.companyName;
      return updateLeadRow(id, row);
    },

    async addLeadNote(id, text) {
      // Lectura previa para no perder notas concurrentes de otra pestaña.
      const { data, error } = await db.from('leads').select('notes').eq('id', id).maybeSingle();
      fail('addLeadNote', error);
      if (!data) return null;
      const current = ((data as { notes: LeadNote[] | null }).notes ?? []) as LeadNote[];
      const note: LeadNote = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        text,
      };
      return updateLeadRow(id, { notes: [note, ...current] });
    },

    async createReport({ leadId, result }) {
      // El identificador y la referencia se generan en el cliente: el visitante
      // anónimo puede INSERTAR pero no ACTUALIZAR, así que la referencia tiene
      // que ir ya dentro del insert.
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const { data, error } = await db
        .from('informes')
        .insert({
          id,
          lead_id: leadId,
          created_at: createdAt,
          result,
          rules_snapshot_size: result.obligations.length,
          reference: buildReportReference(createdAt, id),
        })
        .select()
        .single();
      fail('createReport', error);
      return toReport(data as ReportRow);
    },

    async getReport(id) {
      const { data, error } = await db.from('informes').select('*').eq('id', id).maybeSingle();
      fail('getReport', error);
      return data ? toReport(data as ReportRow) : null;
    },

    async getReportByLead(leadId) {
      const { data, error } = await db
        .from('informes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      fail('getReportByLead', error);
      return data ? toReport(data as ReportRow) : null;
    },

    async getReportsForLeads(leadIds) {
      if (leadIds.length === 0) return {};
      const { data, error } = await db
        .from('informes')
        .select('*')
        .in('lead_id', [...leadIds])
        .order('created_at', { ascending: false });
      fail('getReportsForLeads', error);

      const byLead: Record<string, Report> = {};
      for (const row of data as ReportRow[]) {
        // Vienen ordenados de más reciente a más antiguo: gana el primero.
        if (!byLead[row.lead_id]) byLead[row.lead_id] = toReport(row);
      }
      return byLead;
    },

    async listReports() {
      const { data, error } = await db
        .from('informes')
        .select('*')
        .order('created_at', { ascending: false });
      fail('listReports', error);
      return (data as ReportRow[]).map(toReport);
    },

    async createProspect(input) {
      const { data, error } = await db
        .from('prospectos')
        .insert({
          listing_ref: input.listingRef,
          country: input.country,
          missing_items: input.missingItems,
          variant: input.variant,
          notes: input.notes,
        })
        .select()
        .single();
      fail('createProspect', error);
      return toProspect(data as ProspectRow);
    },

    async listProspects() {
      const { data, error } = await db
        .from('prospectos')
        .select('*')
        .order('created_at', { ascending: false });
      fail('listProspects', error);
      return (data as ProspectRow[]).map(toProspect);
    },

    async setProspectResponded(id, responded) {
      const { data, error } = await db
        .from('prospectos')
        .update({ responded })
        .eq('id', id)
        .select()
        .maybeSingle();
      fail('setProspectResponded', error);
      return data ? toProspect(data as ProspectRow) : null;
    },

    async listStoredRules() {
      const { data, error } = await db.from('reglas').select('*').order('id');
      fail('listStoredRules', error);
      return (data as RuleRow[]).map(toRule);
    },

    async saveStoredRule(rule: ObligationRule) {
      // Se lee el estado anterior para poder anotar QUÉ cambió, no solo que
      // hubo un cambio: es lo que se le cuenta después al suscriptor.
      const previous = await db.from('reglas').select('payload').eq('id', rule.id).maybeSingle();
      const before = (previous.data as { payload: ObligationRule } | null)?.payload ?? null;

      const now = new Date().toISOString();
      const { data, error } = await db
        .from('reglas')
        .upsert({ id: rule.id, payload: rule, updated_at: now })
        .select()
        .single();
      fail('saveStoredRule', error);

      await recordVersion(before, rule, now);
      return toRule(data as RuleRow);
    },

    async deleteStoredRule(id) {
      const previous = await db.from('reglas').select('payload').eq('id', id).maybeSingle();
      const before = (previous.data as { payload: ObligationRule } | null)?.payload ?? null;

      const { error } = await db.from('reglas').delete().eq('id', id);
      fail('deleteStoredRule', error);

      if (before) await recordVersion(before, null, new Date().toISOString());
    },

    async listRuleVersions() {
      const { data, error } = await db
        .from('reglas_historial')
        .select('*')
        .order('changed_at', { ascending: false });
      fail('listRuleVersions', error);
      return (data as RuleVersionRow[]).map(toVersion);
    },
  };
}
