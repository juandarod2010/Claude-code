import type { ObligationRule } from '../../data/rules/schema';
import { buildReportReference } from '../reportReference';
import type {
  AppealDetails,
  Lead,
  LeadPatch,
  Prospect,
  Report,
  Storage,
  StoredRule,
} from './types';

/**
 * Almacenamiento en localStorage. Es el modo por defecto (VITE_MOCK=true).
 * Permite recorrer la aplicación entera sin ninguna cuenta ni clave.
 * Los datos viven solo en ESTE navegador: no sirve para producción.
 */

const KEYS = {
  leads: 'complyo.leads',
  reports: 'complyo.reports',
  prospects: 'complyo.prospects',
  rules: 'complyo.rules',
} as const;

function read<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cuota llena o almacenamiento bloqueado: se pierde el dato, no la sesión.
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function baseLead(email: string, companyName: string | null): Omit<Lead, 'type' | 'answers' | 'appeal'> {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: 'nuevo',
    email,
    companyName,
    variant: null,
    revenue: null,
    notes: [],
  };
}

function patchLead(id: string, mutate: (lead: Lead) => Lead): Lead | null {
  const leads = read<Lead>(KEYS.leads);
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  const updated = mutate(leads[index]);
  leads[index] = updated;
  write(KEYS.leads, leads);
  return updated;
}

export const mockStorage: Storage = {
  mode: 'mock',

  async createLead({ answers }) {
    const lead: Lead = {
      ...baseLead(answers.email, answers.companyName ?? null),
      type: 'complyo',
      answers,
      appeal: null,
    };
    write(KEYS.leads, [lead, ...read<Lead>(KEYS.leads)]);
    return lead;
  },

  async createAppealLead({ email, companyName, appeal }) {
    const lead: Lead = {
      ...baseLead(email, companyName ?? null),
      type: 'appeal',
      answers: null,
      appeal: appeal as AppealDetails,
    };
    write(KEYS.leads, [lead, ...read<Lead>(KEYS.leads)]);
    return lead;
  },

  async listLeads() {
    return read<Lead>(KEYS.leads).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getLead(id) {
    return read<Lead>(KEYS.leads).find((l) => l.id === id) ?? null;
  },

  async updateLead(id, patch: LeadPatch) {
    return patchLead(id, (lead) => ({ ...lead, ...patch, updatedAt: new Date().toISOString() }));
  },

  async addLeadNote(id, text) {
    return patchLead(id, (lead) => ({
      ...lead,
      updatedAt: new Date().toISOString(),
      notes: [{ id: newId(), createdAt: new Date().toISOString(), text }, ...lead.notes],
    }));
  },

  async createReport({ leadId, result }) {
    const id = newId();
    const createdAt = new Date().toISOString();
    const report: Report = {
      id,
      leadId,
      createdAt,
      result,
      rulesSnapshotSize: result.obligations.length,
      reference: buildReportReference(createdAt, id),
    };
    write(KEYS.reports, [report, ...read<Report>(KEYS.reports)]);
    return report;
  },

  async getReport(id) {
    return read<Report>(KEYS.reports).find((r) => r.id === id) ?? null;
  },

  async getReportByLead(leadId) {
    return read<Report>(KEYS.reports).find((r) => r.leadId === leadId) ?? null;
  },

  async listReports() {
    return read<Report>(KEYS.reports).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createProspect(input) {
    const prospect: Prospect = {
      id: newId(),
      createdAt: new Date().toISOString(),
      responded: false,
      ...input,
    };
    write(KEYS.prospects, [prospect, ...read<Prospect>(KEYS.prospects)]);
    return prospect;
  },

  async listProspects() {
    return read<Prospect>(KEYS.prospects).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async setProspectResponded(id, responded) {
    const list = read<Prospect>(KEYS.prospects);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], responded };
    write(KEYS.prospects, list);
    return list[index];
  },

  async listStoredRules() {
    return read<StoredRule>(KEYS.rules).sort((a, b) => a.id.localeCompare(b.id));
  },

  async saveStoredRule(rule: ObligationRule) {
    const stored: StoredRule = { ...rule, updatedAt: new Date().toISOString() };
    const list = read<StoredRule>(KEYS.rules).filter((r) => r.id !== rule.id);
    write(KEYS.rules, [stored, ...list]);
    return stored;
  },

  async deleteStoredRule(id) {
    write(
      KEYS.rules,
      read<StoredRule>(KEYS.rules).filter((r) => r.id !== id),
    );
  },
};
