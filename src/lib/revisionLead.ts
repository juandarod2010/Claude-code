import { ENTRY_OFFER } from '../config/brand';

/**
 * Composición del lead que entra por `/revision`.
 *
 * POR QUÉ EXISTE ESTE MÓDULO. La primera versión guardaba el origen y el
 * borrador del cliente como una NOTA, llamando a `addLeadNote()` justo después
 * de crear el lead. Eso funciona en modo MOCK y se rompe en Supabase: el
 * visitante anónimo puede INSERTAR en `leads`, pero no SELECCIONAR ni
 * ACTUALIZAR (migración 0001, y el propio `storage/supabase.ts` lo dice en
 * `createReport`). El resultado habría sido el peor posible: el lead guardado,
 * el cliente viendo un error, y el borrador que acababa de pegar perdido.
 *
 * La solución es no escribir nada después del alta: todo lo que hay que
 * conservar viaja DENTRO del insert, en el campo `story`, que ya forma parte
 * del lead. Sin migración y sin ampliar los permisos de `anon`.
 */

/** Marca que identifica de qué oferta viene el lead. La busca `/admin/leads`. */
export const ORIGIN_MARKER = `ORIGEN: ${ENTRY_OFFER.name} (${ENTRY_OFFER.price.label})`;

export const NO_DRAFT_NOTE = 'No ha pegado borrador: pídeselo en la primera respuesta.';

/**
 * Monta el texto que se guarda en el lead.
 *
 * OJO: el analizador NO debe recibir esto, sino el correo de Amazon a secas.
 * Si se le pasa el texto compuesto, el borrador del cliente mete palabras que
 * desvían la clasificación.
 */
export function composeRevisionStory(email: string, draft: string): string {
  const cleanEmail = email.trim();
  const cleanDraft = draft.trim();

  return [
    ORIGIN_MARKER,
    '',
    'CORREO DE AMAZON:',
    cleanEmail,
    '',
    'BORRADOR DEL CLIENTE:',
    cleanDraft || NO_DRAFT_NOTE,
  ].join('\n');
}

/** ¿Este lead viene de la oferta de entrada? Lo usa el panel para distinguirlos. */
export function isRevisionLead(story: string | null | undefined): boolean {
  return Boolean(story?.startsWith(ORIGIN_MARKER));
}
