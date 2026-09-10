import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DiagnosticAnswers } from '../../types/domain';
import type { EngineResult } from '../engine/types';
import type { Lead, Prospect, ProspectVariant, Report, Storage } from './types';

/**
 * Adaptador Supabase. Solo se usa si VITE_MOCK=false y hay URL + clave anónima.
 * El esquema está en /supabase/migrations/. Row Level Security está activado:
 * la clave anónima solo puede INSERTAR leads e informes, nunca leerlos.
 */

interface LeadRow {
  id: string;
  created_at: string;
  email: string;
  company_name: string | null;
  answers: DiagnosticAnswers;
}

interface ReportRow {
  id: string;
  lead_id: string;
  created_at: string;
  result: EngineResult;
  rules_snapshot_size: number;
}

interface ProspectRow {
  id: string;
  created_at: string;
  listing_ref: string;
  country: string;
  missing_items: string[];
  variant: ProspectVariant;
  notes: string | null;
}

const toLead = (r: LeadRow): Lead => ({
  id: r.id,
  createdAt: r.created_at,
  email: r.email,
  companyName: r.company_name,
  answers: r.answers,
});

const toReport = (r: ReportRow): Report => ({
  id: r.id,
  leadId: r.lead_id,
  createdAt: r.created_at,
  result: r.result,
  rulesSnapshotSize: r.rules_snapshot_size,
});

const toProspect = (r: ProspectRow): Prospect => ({
  id: r.id,
  createdAt: r.created_at,
  listingRef: r.listing_ref,
  country: r.country,
  missingItems: r.missing_items,
  variant: r.variant,
  notes: r.notes,
});

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase (${context}): ${error.message}`);
}

export function createSupabaseStorage(url: string, anonKey: string): Storage {
  const db: SupabaseClient = createClient(url, anonKey);

  return {
    mode: 'supabase',

    async createLead({ answers }) {
      const { data, error } = await db
        .from('leads')
        .insert({
          email: answers.email,
          company_name: answers.companyName ?? null,
          answers,
        })
        .select()
        .single();
      fail('createLead', error);
      return toLead(data as LeadRow);
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

    async createReport({ leadId, result }) {
      const { data, error } = await db
        .from('informes')
        .insert({
          lead_id: leadId,
          result,
          rules_snapshot_size: result.obligations.length,
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
  };
}
