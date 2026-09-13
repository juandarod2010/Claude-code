import { describe, expect, it } from 'vitest';
import {
  goalProgress,
  MIN_SAMPLE_FOR_RATES,
  observeFunnel,
  planFunnel,
  requiredProspects,
  revenueLast7Days,
  SEED_RATES,
  WEEKLY_GOAL_USD,
} from '../src/lib/funnel';
import type { Lead, Prospect } from '../src/lib/storage/types';

function prospect(over: Partial<Prospect> = {}): Prospect {
  return {
    id: Math.random().toString(36).slice(2),
    createdAt: '2026-09-01T00:00:00.000Z',
    listingRef: 'B000',
    country: 'ES',
    missingItems: [],
    variant: 'A',
    notes: null,
    responded: false,
    ...over,
  };
}

function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: Math.random().toString(36).slice(2),
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    type: 'appeal',
    status: 'nuevo',
    email: 'x@y.com',
    companyName: null,
    answers: null,
    appeal: null,
    variant: null,
    revenue: null,
    notes: [],
    ...over,
  };
}

describe('planFunnel', () => {
  it('calcula el embudo del caso base: 59 $ hacia 100 $/semana', () => {
    const plan = planFunnel({ ticket: 59, responseRate: 0.1, closeRate: 0.2 });
    // 100/59 = 1,69 → 2 clientes. 2/0,2 = 10 respuestas. 10/0,1 = 100 prospectos.
    expect(plan.clientsPerWeek).toBe(2);
    expect(plan.responsesPerWeek).toBe(10);
    expect(plan.prospectsPerWeek).toBe(100);
    expect(plan.prospectsPerWorkday).toBe(20);
  });

  it('redondea los clientes hacia arriba: medio cliente no paga', () => {
    expect(planFunnel({ ticket: 80, responseRate: 0.5, closeRate: 0.5 }).clientsPerWeek).toBe(2);
  });

  it('un ticket que cubre el objetivo entero deja un solo cliente', () => {
    expect(planFunnel({ ticket: 1500, responseRate: 0.1, closeRate: 0.2 }).clientsPerWeek).toBe(1);
  });

  it('usa el objetivo semanal por defecto', () => {
    expect(planFunnel({ ticket: 59, responseRate: 0.1, closeRate: 0.2 }).goal).toBe(WEEKLY_GOAL_USD);
  });

  it('rechaza entradas que darían infinitos prospectos', () => {
    expect(() => planFunnel({ ticket: 0, responseRate: 0.1, closeRate: 0.2 })).toThrow();
    expect(() => planFunnel({ ticket: 59, responseRate: 0, closeRate: 0.2 })).toThrow();
    expect(() => planFunnel({ ticket: 59, responseRate: 0.1, closeRate: 0 })).toThrow();
    expect(() => planFunnel({ ticket: 59, responseRate: 1.5, closeRate: 0.2 })).toThrow();
    expect(() => planFunnel({ goal: 0, ticket: 59, responseRate: 0.1, closeRate: 0.2 })).toThrow();
  });
});

describe('observeFunnel', () => {
  it('sin datos no inventa tasas: devuelve null, no 0', () => {
    const o = observeFunnel([], []);
    expect(o.responseRate).toBeNull();
    expect(o.closeRate).toBeNull();
    expect(o.averageTicket).toBeNull();
    expect(o.ratesAreReliable).toBe(false);
    expect(o.sampleMissing).toBe(MIN_SAMPLE_FOR_RATES);
  });

  it('cuenta respuestas, clientes e ingresos', () => {
    const prospects = [
      ...Array.from({ length: 8 }, () => prospect()),
      ...Array.from({ length: 2 }, () => prospect({ responded: true })),
    ];
    const leads = [
      lead({ status: 'convertido', revenue: 59 }),
      lead({ status: 'convertido', revenue: 141 }),
      lead({ status: 'descartado' }),
    ];
    const o = observeFunnel(prospects, leads);
    expect(o.prospectsContacted).toBe(10);
    expect(o.responses).toBe(2);
    expect(o.responseRate).toBeCloseTo(0.2);
    expect(o.clients).toBe(2);
    expect(o.revenue).toBe(200);
    expect(o.averageTicket).toBe(100);
    expect(o.closeRate).toBe(1);
  });

  it('marca la muestra como fiable al llegar al mínimo', () => {
    const o = observeFunnel(Array.from({ length: MIN_SAMPLE_FOR_RATES }, () => prospect()), []);
    expect(o.ratesAreReliable).toBe(true);
    expect(o.sampleMissing).toBe(0);
  });
});

describe('requiredProspects', () => {
  it('con muestra corta usa las tasas de arranque y lo dice', () => {
    const target = requiredProspects(observeFunnel([prospect({ responded: true })], []), 59);
    expect(target.source).toBe('arranque');
    expect(target.plan.responseRate).toBe(SEED_RATES.responseRate);
    expect(target.rationale).toContain('faltan');
  });

  it('con muestra suficiente usa lo medido', () => {
    const prospects = [
      ...Array.from({ length: 40 }, () => prospect()),
      ...Array.from({ length: 10 }, () => prospect({ responded: true })),
    ];
    const leads = [lead({ status: 'convertido', revenue: 59 })];
    const target = requiredProspects(observeFunnel(prospects, leads), 59);
    expect(target.source).toBe('observadas');
    expect(target.plan.responseRate).toBeCloseTo(0.2);
    expect(target.plan.closeRate).toBeCloseTo(0.1);
  });

  it('con muestra pero cero respuestas no divide por cero, y avisa del canal', () => {
    const o = observeFunnel(Array.from({ length: 50 }, () => prospect()), []);
    const target = requiredProspects(o, 59);
    expect(target.source).toBe('arranque');
    expect(Number.isFinite(target.plan.prospectsPerWeek)).toBe(true);
    expect(target.rationale).toContain('canal');
  });

  it('respuesta medida y cierre sin datos dan tasas mixtas', () => {
    const prospects = [
      ...Array.from({ length: 45 }, () => prospect()),
      ...Array.from({ length: 5 }, () => prospect({ responded: true })),
    ];
    const target = requiredProspects(observeFunnel(prospects, []), 59);
    expect(target.source).toBe('mixtas');
    expect(target.plan.closeRate).toBe(SEED_RATES.closeRate);
  });
});

describe('goalProgress', () => {
  it('mide lo que falta y no pasa del tope', () => {
    expect(goalProgress(0).missing).toBe(100);
    expect(goalProgress(59).ratio).toBeCloseTo(0.59);
    expect(goalProgress(250).ratio).toBe(1);
    expect(goalProgress(250).missing).toBe(0);
    expect(goalProgress(100).reached).toBe(true);
  });
});

describe('revenueLast7Days', () => {
  const now = new Date('2026-09-13T12:00:00.000Z');

  it('cuenta solo lo cobrado dentro de la ventana', () => {
    const leads = [
      lead({ revenue: 59, updatedAt: '2026-09-12T00:00:00.000Z' }),
      lead({ revenue: 59, updatedAt: '2026-08-01T00:00:00.000Z' }),
      lead({ revenue: null, updatedAt: '2026-09-12T00:00:00.000Z' }),
    ];
    expect(revenueLast7Days(leads, now)).toBe(59);
  });

  it('sin cobros devuelve 0', () => {
    expect(revenueLast7Days([lead()], now)).toBe(0);
  });
});
