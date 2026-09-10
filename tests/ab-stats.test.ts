import { describe, expect, it } from 'vitest';
import { buildAbReport, MIN_SAMPLE_PER_VARIANT } from '../src/lib/abStats';
import type { Lead, Prospect, ProspectVariant } from '../src/lib/storage/types';

function prospects(variant: ProspectVariant, total: number, responded: number): Prospect[] {
  return Array.from({ length: total }, (_, i) => ({
    id: `${variant}-${i}`,
    createdAt: '2026-09-09T10:00:00.000Z',
    listingRef: 'B0X',
    country: 'DE',
    missingItems: [],
    variant,
    notes: null,
    responded: i < responded,
  }));
}

function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: 'l1',
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-09T10:00:00.000Z',
    type: 'appeal',
    status: 'nuevo',
    email: 'a@b.invalid',
    companyName: null,
    answers: null,
    appeal: null,
    variant: null,
    revenue: null,
    notes: [],
    ...over,
  };
}

const N = MIN_SAMPLE_PER_VARIANT;

describe('comparación A/B', () => {
  it('1. sin datos lo dice en vez de enseñar ceros como si fueran un resultado', () => {
    const report = buildAbReport([], []);
    expect(report.verdict.kind).toBe('sin_datos');
    expect(report.A.responseRate).toBe(0);
  });

  it('2. con muestra corta avisa y dice cuánto falta', () => {
    const report = buildAbReport([...prospects('A', 5, 5), ...prospects('B', 5, 0)], []);
    expect(report.verdict.kind).toBe('muestra_corta');
    if (report.verdict.kind === 'muestra_corta') {
      expect(report.verdict.missing).toBe(N - 5);
    }
  });

  it('3. la muestra corta la marca la variante con MENOS datos', () => {
    const report = buildAbReport([...prospects('A', 200, 100), ...prospects('B', 2, 1)], []);
    expect(report.verdict.kind).toBe('muestra_corta');
    if (report.verdict.kind === 'muestra_corta') {
      expect(report.verdict.missing).toBe(N - 2);
    }
  });

  it('4. con muestra suficiente y diferencia clara señala la ganadora', () => {
    const report = buildAbReport(
      [...prospects('A', N, Math.round(N * 0.4)), ...prospects('B', N, Math.round(N * 0.1))],
      [],
    );
    expect(report.verdict.kind).toBe('ventaja');
    if (report.verdict.kind === 'ventaja') {
      expect(report.verdict.winner).toBe('A');
      expect(report.verdict.gapPoints).toBeGreaterThan(20);
    }
  });

  it('5. gana B cuando le corresponde', () => {
    const report = buildAbReport(
      [...prospects('A', N, 3), ...prospects('B', N, 15)],
      [],
    );
    expect(report.verdict.kind).toBe('ventaja');
    if (report.verdict.kind === 'ventaja') expect(report.verdict.winner).toBe('B');
  });

  it('6. tasas iguales se declaran empate, no una ganadora por decimales', () => {
    const report = buildAbReport([...prospects('A', N, 10), ...prospects('B', N, 10)], []);
    expect(report.verdict.kind).toBe('empate');
  });

  it('7. nunca afirma significación estadística', () => {
    const report = buildAbReport(
      [...prospects('A', N * 10, N * 4), ...prospects('B', N * 10, N)],
      [],
    );
    expect(report.verdict.message.toLowerCase()).not.toContain('significativ');
    expect(report.verdict.message).toContain('diferencia observada');
  });

  it('8. cuenta conversión e ingresos por variante desde los leads', () => {
    const report = buildAbReport(prospects('A', 1, 1), [
      lead({ id: 'a', variant: 'A', status: 'convertido', revenue: 1500 }),
      lead({ id: 'b', variant: 'A', status: 'contactado' }),
      lead({ id: 'c', variant: 'B', status: 'convertido', revenue: 97 }),
      lead({ id: 'd', variant: null, status: 'convertido', revenue: 999 }),
    ]);
    expect(report.A.leads).toBe(2);
    expect(report.A.converted).toBe(1);
    expect(report.A.conversionRate).toBe(0.5);
    expect(report.A.revenue).toBe(1500);
    expect(report.B.revenue).toBe(97);
    // El lead sin variante no cuenta para ninguna de las dos.
    expect(report.A.revenue + report.B.revenue).toBe(1597);
  });

  it('9. los totales suman las dos variantes', () => {
    const report = buildAbReport([...prospects('A', 4, 2), ...prospects('B', 6, 1)], []);
    expect(report.totalSent).toBe(10);
    expect(report.totalResponded).toBe(3);
  });

  it('10. es una función pura', () => {
    const p = [...prospects('A', 3, 1)];
    const snapshot = JSON.parse(JSON.stringify(p));
    const first = buildAbReport(p, []);
    const second = buildAbReport(p, []);
    expect(p).toEqual(snapshot);
    expect(first).toEqual(second);
  });
});
