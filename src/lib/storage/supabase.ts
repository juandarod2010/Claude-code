import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ObligationRule } from '../../data/rules/schema';
import type { DiagnosticAnswers } from '../../types/domain';
import type { EngineResult } from '../engine/types';
import { buildReportReference } from '../reportReference';
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

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase (${context}): ${error.message}`);
}

export function createSupabaseStorage(url: string, anonKey: string): Storage {
  const db: SupabaseClient = createClient(url, anonKey);

  async function insertLead(row: Record<string, unknown>): Promise<Lead> {
    const { data, error } = await db.from('leads').insert(row).select().single();
    fail('createLead', error);
    return toLead(data as LeadRow);
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
      const { data, error } = await db
        .from('reglas')
        .upsert({ id: rule.id, payload: rule, updated_at: new Date().toISOString() })
        .select()
        .single();
      fail('saveStoredRule', error);
      return toRule(data as RuleRow);
    },

    async deleteStoredRule(id) {
      const { error } = await db.from('reglas').delete().eq('id', id);
      fail('deleteStoredRule', error);
    },
  };
}
