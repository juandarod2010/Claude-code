import type { ObligationRule } from '../../data/rules/schema';
import type { DiagnosticAnswers } from '../../types/domain';
import type { EngineResult } from '../engine/types';

/** De qué línea de negocio viene el lead. */
export type LeadType = 'complyo' | 'appeal';

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  complyo: 'Cumplimiento UE',
  appeal: 'Apelación Amazon',
};

/** Estado comercial del lead. Lo mueve el operador a mano desde /admin. */
export type LeadStatus = 'nuevo' | 'contactado' | 'convertido' | 'descartado';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  convertido: 'Convertido',
  descartado: 'Descartado',
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_LABELS) as LeadStatus[];

export interface LeadNote {
  id: string;
  createdAt: string;
  text: string;
}

/** Datos propios de un lead de apelaciones. */
export interface AppealDetails {
  /** Lo que ha contado el vendedor, en sus palabras. */
  story: string;
  /** Tipo detectado por el analizador. */
  suspensionType: string;
  suspensionTypeLabel: string;
  /** Gravedad estimada 0–100. Orientativa. */
  severity: number;
  scope: string;
  daysSuspended: number | null;
}

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: LeadType;
  status: LeadStatus;
  email: string;
  companyName: string | null;
  /** Solo en leads de tipo `complyo`. */
  answers: DiagnosticAnswers | null;
  /** Solo en leads de tipo `appeal`. */
  appeal: AppealDetails | null;
  /** Variante de mensaje que le tocó, si se le ha escrito. */
  variant: 'A' | 'B' | null;
  /** Ingreso real cobrado a este lead, en dólares. Lo escribe el operador. */
  revenue: number | null;
  notes: LeadNote[];
}

export interface Report {
  id: string;
  leadId: string;
  createdAt: string;
  /**
   * Resultado del motor CONGELADO en el momento de generar el informe.
   * Se guarda entero a propósito: si mañana cambia la base de reglas, el informe
   * que ya se entregó al cliente tiene que seguir diciendo lo mismo.
   */
  result: EngineResult;
  /** Versión de la base de reglas usada. Por ahora, el número de obligaciones. */
  rulesSnapshotSize: number;
  /** Número legible del informe: INFORME-YYYYMMDD-XXXX. */
  reference: string;
}

export type ProspectVariant = 'A' | 'B';

export interface Prospect {
  id: string;
  createdAt: string;
  /** URL o ASIN pegado a mano por el operador. Nunca se consulta por red. */
  listingRef: string;
  country: string;
  missingItems: string[];
  /** Variante que le tocó a este prospecto. Sirve para medir cuál responde mejor. */
  variant: ProspectVariant;
  notes: string | null;
  /** ¿Contestó? Lo marca el operador. Sirve para comparar A contra B. */
  responded: boolean;
}

/**
 * Obligación guardada desde `/admin/fill-rules`.
 * Vive en la base de datos, no en el código: el operador la rellena sin
 * tocar TypeScript. Tiene la misma forma que `ObligationRule` más metadatos.
 */
export interface StoredRule extends ObligationRule {
  updatedAt: string;
}

export interface LeadPatch {
  status?: LeadStatus;
  revenue?: number | null;
  variant?: 'A' | 'B' | null;
  companyName?: string | null;
}

export interface Storage {
  readonly mode: 'mock' | 'supabase';

  createLead(input: { answers: DiagnosticAnswers }): Promise<Lead>;
  createAppealLead(input: {
    email: string;
    companyName?: string | null;
    appeal: AppealDetails;
  }): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  updateLead(id: string, patch: LeadPatch): Promise<Lead | null>;
  addLeadNote(id: string, text: string): Promise<Lead | null>;

  createReport(input: { leadId: string; result: EngineResult }): Promise<Report>;
  getReport(id: string): Promise<Report | null>;
  getReportByLead(leadId: string): Promise<Report | null>;
  listReports(): Promise<Report[]>;

  createProspect(input: Omit<Prospect, 'id' | 'createdAt' | 'responded'>): Promise<Prospect>;
  listProspects(): Promise<Prospect[]>;
  setProspectResponded(id: string, responded: boolean): Promise<Prospect | null>;

  listStoredRules(): Promise<StoredRule[]>;
  saveStoredRule(rule: ObligationRule): Promise<StoredRule>;
  deleteStoredRule(id: string): Promise<void>;
}
