import { describe, expect, it } from 'vitest';
import { createSupabaseStorage } from '../src/lib/storage/supabase';

/**
 * Guardarraíl del camino anónimo contra Supabase.
 *
 * EL FALLO QUE FIJA. El visitante de una página pública usa la clave `anon`,
 * que tiene política de INSERT sobre `leads` e `informes` pero NINGUNA de
 * SELECT (migración 0001: «sin política, RLS deniega»). Un
 * `.insert().select()` pide a PostgREST devolver la fila recién insertada,
 * esa lectura la deniega RLS, y el alta acaba lanzando: la fila queda
 * guardada y el visitante ve un error.
 *
 * No se puede reproducir con RLS de verdad sin una Supabase real, así que se
 * comprueba lo que sí se puede comprobar aquí: que el alta **no encadena un
 * `.select()`**. Un doble del cliente registra las llamadas y falla si
 * aparece.
 */

interface Call {
  table: string;
  op: string;
}

/** Doble mínimo del cliente de Supabase: registra qué se le pide. */
function fakeDb(calls: Call[]) {
  const builder = (table: string) => ({
    insert(row: unknown) {
      calls.push({ table, op: 'insert' });
      // Lo que devuelve un insert sin `.select()`: solo error.
      return Promise.resolve({ data: null, error: null, row }) as never;
    },
    select() {
      calls.push({ table, op: 'select' });
      throw new Error(
        `${table}: se ha encadenado .select() a un alta pública. RLS lo denegará para anon.`,
      );
    },
  });

  return { from: (table: string) => builder(table) } as never;
}

const ANSWERS = {
  email: 'cliente@ejemplo.invalid',
  companyName: 'Tienda',
  countries: ['ES'],
} as never;

describe('altas públicas contra Supabase', () => {
  it('createAppealLead inserta sin releer la fila', async () => {
    const calls: Call[] = [];
    const storage = createSupabaseStorage(fakeDb(calls));

    const lead = await storage.createAppealLead({
      email: 'vendedor@ejemplo.invalid',
      companyName: null,
      appeal: {
        story: 'Suspensión por propiedad intelectual',
        suspensionType: 'intellectual_property',
        suspensionTypeLabel: 'Intellectual Property',
        severity: 70,
        scope: 'cuenta',
        daysSuspended: null,
      },
    });

    expect(calls).toEqual([{ table: 'leads', op: 'insert' }]);
    // Y devuelve un lead utilizable, construido con lo que se acaba de escribir.
    expect(lead.id).toMatch(/[0-9a-f-]{36}/);
    expect(lead.type).toBe('appeal');
    expect(lead.status).toBe('nuevo');
    expect(lead.email).toBe('vendedor@ejemplo.invalid');
    expect(lead.appeal?.story).toContain('propiedad intelectual');
    expect(lead.notes).toEqual([]);
    expect(lead.createdAt).toBe(lead.updatedAt);
  });

  it('createLead (diagnóstico) tampoco relee', async () => {
    const calls: Call[] = [];
    const storage = createSupabaseStorage(fakeDb(calls));

    const lead = await storage.createLead({ answers: ANSWERS });

    expect(calls).toEqual([{ table: 'leads', op: 'insert' }]);
    expect(lead.type).toBe('complyo');
    expect(lead.email).toBe('cliente@ejemplo.invalid');
  });

  it('createReport tampoco relee, y genera su referencia en el cliente', async () => {
    const calls: Call[] = [];
    const storage = createSupabaseStorage(fakeDb(calls));

    const report = await storage.createReport({
      leadId: 'abc',
      result: { obligations: [] } as never,
    });

    expect(calls).toEqual([{ table: 'informes', op: 'insert' }]);
    expect(report.leadId).toBe('abc');
    expect(report.reference).toMatch(/^INFORME-/);
  });
});
