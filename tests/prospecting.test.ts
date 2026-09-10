import { describe, expect, it } from 'vitest';
import { buildMessage, nextVariant } from '../src/lib/prospecting/templates';

const input = {
  listingRef: 'B0TEST1234',
  country: 'DE' as const,
  missing: ['no_aparece_numero_rap' as const],
  sellerName: 'Ana',
};

describe('prospección', () => {
  it('alterna A y B según cuántos prospectos hay registrados', () => {
    expect([0, 1, 2, 3].map(nextVariant)).toEqual(['A', 'B', 'A', 'B']);
  });

  it('las dos variantes llevan la misma información y distinto enfoque', () => {
    const a = buildMessage('A', input);
    const b = buildMessage('B', input);
    for (const message of [a, b]) {
      expect(message).toContain('B0TEST1234');
      expect(message).toContain('Alemania');
      expect(message).toContain('No aparece número de registro de productor');
      expect(message).toContain('Hola, Ana:');
    }
    expect(a).toContain('deja de publicar');
    expect(b).toContain('sanción económica');
    expect(a).not.toEqual(b);
  });

  it('no incluye importes de sanción: no tenemos ninguno verificado', () => {
    const b = buildMessage('B', input);
    // Solo puede aparecer el precio de nuestro propio informe, nada más.
    const amounts = b.match(/\d[\d.,]*\s?(€|\$|EUR|USD)/g) ?? [];
    expect(amounts).toEqual(['97 $']);
  });
});
