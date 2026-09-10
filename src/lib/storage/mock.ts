import type { ObligationRule } from '../../data/rules/schema';
import { buildReportReference } from '../reportReference';
import { buildVersion, type RuleVersion } from '../rulesHistory';
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
  ruleVersions: 'complyo.rule-versions',
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

/** Anota el cambio en el historial. Sin él, la suscripción de vigilancia no
 * tiene de dónde salir. */
function recordVersion(
  before: ObligationRule | null,
  after: ObligationRule | null,
  changedAt: string,
): void {
  const version = buildVersion(newId(), changedAt, stripMeta(before), after);
  if (!version) return;
  write(KEYS.ruleVersions, [version, ...read<RuleVersion>(KEYS.ruleVersions)]);
}

/** Quita los metadatos de almacenamiento para comparar solo la obligación. */
function stripMeta(rule: StoredRule | ObligationRule | null): ObligationRule | null {
  if (!rule) return null;
  const { updatedAt: _updatedAt, ...clean } = rule as StoredRule;
  void _updatedAt;
  return clean;
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
    const now = new Date().toISOString();
    const previous = read<StoredRule>(KEYS.rules).find((r) => r.id === rule.id) ?? null;
    const stored: StoredRule = { ...rule, updatedAt: now };
    const list = read<StoredRule>(KEYS.rules).filter((r) => r.id !== rule.id);
    write(KEYS.rules, [stored, ...list]);
    recordVersion(previous, rule, now);
    return stored;
  },

  async deleteStoredRule(id) {
    const previous = read<StoredRule>(KEYS.rules).find((r) => r.id === id) ?? null;
    write(
      KEYS.rules,
      read<StoredRule>(KEYS.rules).filter((r) => r.id !== id),
    );
    if (previous) recordVersion(previous, null, new Date().toISOString());
  },

  async listRuleVersions() {
    return read<RuleVersion>(KEYS.ruleVersions).sort((a, b) =>
      b.changedAt.localeCompare(a.changedAt),
    );
  },
};
