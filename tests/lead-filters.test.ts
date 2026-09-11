import { describe, expect, it } from 'vitest';
import {
  aggregate,
  clampPage,
  matchesFilters,
  pageCount,
  rangeLabel,
} from '../src/lib/leadFilters';
import type { Lead } from '../src/lib/storage/types';
import { answers } from './fixtures';

function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: 'l1',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z',
    type: 'complyo',
    status: 'nuevo',
    email: 'ana@tienda.invalid',
    companyName: 'Tienda Ana',
    answers: answers({ countries: ['DE', 'FR'] }),
    appeal: null,
    variant: null,
    revenue: null,
    notes: [],
    ...over,
  };
}

describe('filtros del panel de leads', () => {
  it('1. sin filtros pasa todo', () => {
    expect(matchesFilters(lead(), {})).toBe(true);
  });

  it('2. filtra por tipo', () => {
    expect(matchesFilters(lead({ type: 'appeal' }), { type: 'complyo' })).toBe(false);
    expect(matchesFilters(lead({ type: 'appeal' }), { type: 'appeal' })).toBe(true);
  });

  it('3. filtra por estado', () => {
    expect(matchesFilters(lead({ status: 'convertido' }), { status: 'nuevo' })).toBe(false);
    expect(matchesFilters(lead({ status: 'convertido' }), { status: 'convertido' })).toBe(true);
  });

  it('4. filtra por país de destino', () => {
    expect(matchesFilters(lead(), { country: 'DE' })).toBe(true);
    expect(matchesFilters(lead(), { country: 'ES' })).toBe(false);
  });

  it('5. un lead de apelación no tiene países: el filtro por país lo descarta', () => {
    expect(matchesFilters(lead({ type: 'appeal', answers: null }), { country: 'DE' })).toBe(false);
  });

  it('6. las fechas son inclusivas por los dos extremos', () => {
    const l = lead({ createdAt: '2026-09-10T23:59:00.000Z' });
    expect(matchesFilters(l, { from: '2026-09-10', to: '2026-09-10' })).toBe(true);
    expect(matchesFilters(l, { from: '2026-09-11' })).toBe(false);
    expect(matchesFilters(l, { to: '2026-09-09' })).toBe(false);
  });

  it('7. la búsqueda mira correo y empresa, sin distinguir mayúsculas', () => {
    expect(matchesFilters(lead(), { search: 'TIENDA' })).toBe(true);
    expect(matchesFilters(lead(), { search: 'ana@' })).toBe(true);
    expect(matchesFilters(lead(), { search: '  ana  ' })).toBe(true);
    expect(matchesFilters(lead(), { search: 'otra cosa' })).toBe(false);
  });

  it('8. una empresa vacía no rompe la búsqueda: se busca solo en el correo', () => {
    const sinEmpresa = lead({ companyName: null, email: 'ana@correo.invalid' });
    expect(matchesFilters(sinEmpresa, { search: 'ana' })).toBe(true);
    expect(matchesFilters(sinEmpresa, { search: 'tienda' })).toBe(false);
  });

  it('9. los filtros se acumulan', () => {
    const l = lead({ type: 'complyo', status: 'convertido' });
    expect(matchesFilters(l, { type: 'complyo', status: 'convertido', country: 'FR' })).toBe(true);
    expect(matchesFilters(l, { type: 'complyo', status: 'convertido', country: 'IT' })).toBe(false);
  });

  it('10. agrega sobre el conjunto filtrado', () => {
    const result = aggregate([
      lead({ id: 'a', status: 'convertido', revenue: 97 }),
      lead({ id: 'b', status: 'convertido', revenue: 1500 }),
      lead({ id: 'c', status: 'nuevo' }),
    ]);
    expect(result).toEqual({ total: 3, converted: 2, revenue: 1597 });
  });
});

describe('cálculo de páginas', () => {
  it('11. reparte el total en páginas', () => {
    expect(pageCount(0, 25)).toBe(1);
    expect(pageCount(25, 25)).toBe(1);
    expect(pageCount(26, 25)).toBe(2);
    expect(pageCount(312, 25)).toBe(13);
  });

  it('12. recoloca la página cuando el filtro deja menos resultados', () => {
    expect(clampPage(7, 312, 25)).toBe(7);
    expect(clampPage(7, 30, 25)).toBe(1);
    expect(clampPage(7, 0, 25)).toBe(0);
    expect(clampPage(-3, 312, 25)).toBe(0);
  });

  it('13. la etiqueta de rango dice dónde estás', () => {
    expect(rangeLabel(0, 25, 312)).toBe('1–25 de 312');
    expect(rangeLabel(25, 25, 312)).toBe('26–50 de 312');
    expect(rangeLabel(300, 12, 312)).toBe('301–312 de 312');
    expect(rangeLabel(0, 0, 0)).toBe('0 de 0');
  });
});
