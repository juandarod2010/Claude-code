import type { EngineResult } from '../engine/types';
import type { DiagnosticAnswers } from '../../types/domain';

export interface Lead {
  id: string;
  createdAt: string;
  email: string;
  companyName: string | null;
  answers: DiagnosticAnswers;
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
}

export interface Storage {
  readonly mode: 'mock' | 'supabase';
  createLead(input: { answers: DiagnosticAnswers }): Promise<Lead>;
  listLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  createReport(input: { leadId: string; result: EngineResult }): Promise<Report>;
  getReport(id: string): Promise<Report | null>;
  getReportByLead(leadId: string): Promise<Report | null>;
  createProspect(input: Omit<Prospect, 'id' | 'createdAt'>): Promise<Prospect>;
  listProspects(): Promise<Prospect[]>;
}
