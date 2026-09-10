import type { PlanOfAction, SuspensionType } from '../modules/appeals/poa-template';

/**
 * Borradores del Plan of Action.
 *
 * Se guardan en el localStorage del navegador, no en la base de datos. Es un
 * documento de trabajo tuyo, no un dato del negocio: mientras lo estás
 * redactando cambia cada dos minutos y no aporta nada tenerlo en Supabase.
 * Cuando el plan está listo, lo que sale es el documento que envías.
 *
 * Consecuencia que conviene tener presente: si borras los datos del navegador,
 * pierdes los borradores a medias. Los planes terminados descárgalos.
 */

const KEY = 'complyo.poa-drafts';

export interface PoaDraft {
  plan: PlanOfAction;
  type: SuspensionType;
  /** Lead del que salió, si vino de uno. */
  leadId: string | null;
  updatedAt: string;
}

function readAll(): Record<string, PoaDraft> {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, PoaDraft>;
  } catch {
    return {};
  }
}

function writeAll(drafts: Record<string, PoaDraft>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    // Sin almacenamiento se trabaja igual, solo que sin red de seguridad.
  }
}

/** Clave del borrador: el lead si viene de uno, o un caso suelto. */
export function draftKey(leadId: string | null): string {
  return leadId ?? 'suelto';
}

export function loadDraft(leadId: string | null): PoaDraft | null {
  return readAll()[draftKey(leadId)] ?? null;
}

export function saveDraft(draft: Omit<PoaDraft, 'updatedAt'>): PoaDraft {
  const stored: PoaDraft = { ...draft, updatedAt: new Date().toISOString() };
  const all = readAll();
  all[draftKey(draft.leadId)] = stored;
  writeAll(all);
  return stored;
}

export function deleteDraft(leadId: string | null): void {
  const all = readAll();
  delete all[draftKey(leadId)];
  writeAll(all);
}

export function listDrafts(): PoaDraft[] {
  return Object.values(readAll()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
