import type { Lead, Prospect, Report, Storage } from './types';

/**
 * Almacenamiento en localStorage. Es el modo por defecto (VITE_MOCK=true).
 * Permite recorrer la aplicación entera sin ninguna cuenta ni clave.
 * Los datos viven solo en ESTE navegador: no sirve para producción.
 */

const KEYS = {
  leads: 'complyo.leads',
  reports: 'complyo.reports',
  prospects: 'complyo.prospects',
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

export const mockStorage: Storage = {
  mode: 'mock',

  async createLead({ answers }) {
    const lead: Lead = {
      id: newId(),
      createdAt: new Date().toISOString(),
      email: answers.email,
      companyName: answers.companyName ?? null,
      answers,
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

  async createReport({ leadId, result }) {
    const report: Report = {
      id: newId(),
      leadId,
      createdAt: new Date().toISOString(),
      result,
      rulesSnapshotSize: result.obligations.length,
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

  async createProspect(input) {
    const prospect: Prospect = { id: newId(), createdAt: new Date().toISOString(), ...input };
    write(KEYS.prospects, [prospect, ...read<Prospect>(KEYS.prospects)]);
    return prospect;
  },

  async listProspects() {
    return read<Prospect>(KEYS.prospects).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
