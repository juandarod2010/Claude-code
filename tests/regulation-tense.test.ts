import { describe, expect, it } from 'vitest';
import {
  landingCopy,
  REGULATION,
  regulationHeadline,
  regulationInForce,
  regulationLead,
} from '../src/config/brand';

/**
 * La landing anunciaba en futuro una fecha que se pasó sola. Estos tests
 * existen para que no vuelva a ocurrir sin que nadie se entere.
 */

const ANTES = new Date('2026-01-01T00:00:00Z');
const DESPUES = new Date('2026-09-13T00:00:00Z');
const EL_DIA = new Date(`${REGULATION.applicationDateIso}T00:00:00Z`);

describe('vigencia de la norma', () => {
  it('distingue antes y después de la fecha de aplicación', () => {
    expect(regulationInForce(ANTES)).toBe(false);
    expect(regulationInForce(DESPUES)).toBe(true);
  });

  it('el propio día ya cuenta como en vigor', () => {
    expect(regulationInForce(EL_DIA)).toBe(true);
  });

  it('la fecha ISO y la fecha escrita son la misma', () => {
    expect(REGULATION.applicationDate).toContain('2026');
    expect(REGULATION.applicationDateIso.startsWith('2026-08')).toBe(true);
  });
});

describe('titular y entradilla', () => {
  it('antes de la fecha habla en futuro', () => {
    expect(regulationHeadline(ANTES)).toMatch(/^El /);
    expect(regulationLead(ANTES)).toContain('obligará');
  });

  it('después de la fecha habla en presente', () => {
    expect(regulationHeadline(DESPUES)).toMatch(/^Desde el /);
    expect(regulationLead(DESPUES)).toContain('obliga a los marketplaces');
    expect(regulationLead(DESPUES)).not.toContain('obligará');
  });

  it('la landing usa el titular que toca', () => {
    expect(landingCopy(DESPUES).headline).toBe(regulationHeadline(DESPUES));
    expect(landingCopy(ANTES).lines[0]).toBe(regulationLead(ANTES));
  });

  it('la landing mantiene sus tres líneas y su llamada a la acción', () => {
    const copy = landingCopy(DESPUES);
    expect(copy.lines).toHaveLength(3);
    expect(copy.ctaLabel).toBe('Ver mi exposición');
  });
});
