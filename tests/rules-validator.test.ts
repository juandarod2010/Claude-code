import { describe, expect, it } from 'vitest';
import { RULES } from '../src/data/rules';
import type { ObligationRule } from '../src/data/rules/schema';
import {
  isEurLex,
  looksOfficial,
  validateRule,
  validateRules,
} from '../src/modules/complyo/rules-validator';

const TODAY = '2026-09-10';

function goodRule(overrides: Partial<ObligationRule> = {}): ObligationRule {
  return {
    id: 'de-envases-registro',
    country: 'DE',
    stream: 'envases',
    authorityName: 'Registro de prueba',
    representativeRequiredForNonEstablished: true,
    reportingFrequency: 'anual',
    requiredData: ['Número de identificación fiscal'],
    nonComplianceConsequence: 'Consecuencia documentada en la fuente.',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32025R0040',
    sourceCheckedAt: '2026-09-01',
    verified: true,
    ...overrides,
  };
}

describe('validador de reglas', () => {
  it('1. acepta una obligación bien rellenada', () => {
    const r = validateRule(goodRule(), TODAY);
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('2. bloquea si falta la URL de la fuente', () => {
    const r = validateRule(goodRule({ sourceUrl: '' }), TODAY);
    expect(r.isValid).toBe(false);
    expect(r.errors.join(' ')).toContain('URL de la fuente');
  });

  it('3. bloquea una URL que no sea https', () => {
    const r = validateRule(goodRule({ sourceUrl: 'http://eur-lex.europa.eu/x' }), TODAY);
    expect(r.isValid).toBe(false);
  });

  it('4. bloquea fuentes que no son oficiales', () => {
    const r = validateRule(goodRule({ sourceUrl: 'https://midespacho.medium.com/rap-alemania' }), TODAY);
    expect(r.isValid).toBe(false);
    expect(r.errors.join(' ')).toContain('fuente oficial');
  });

  it('5. bloquea si falta la fecha de verificación', () => {
    const r = validateRule(goodRule({ sourceCheckedAt: '' }), TODAY);
    expect(r.isValid).toBe(false);
    expect(r.errors.join(' ')).toContain('fecha de verificación');
  });

  it('6. bloquea una fecha con formato incorrecto o futura', () => {
    expect(validateRule(goodRule({ sourceCheckedAt: '01/09/2026' }), TODAY).isValid).toBe(false);
    expect(validateRule(goodRule({ sourceCheckedAt: '2027-01-01' }), TODAY).isValid).toBe(false);
  });

  it('7. bloquea la fecha de relleno de los ejemplos', () => {
    const r = validateRule(goodRule({ sourceCheckedAt: '1970-01-01' }), TODAY);
    expect(r.errors.join(' ')).toContain('relleno');
  });

  it('8. bloquea si conserva la marca __EJEMPLO__', () => {
    const r = validateRule(goodRule({ authorityName: '__EJEMPLO__ Registro' }), TODAY);
    expect(r.isValid).toBe(false);
    expect(r.errors.join(' ')).toContain('__EJEMPLO__');
  });

  it('9. avisa —sin bloquear— si no está verificada', () => {
    const r = validateRule(goodRule({ verified: false }), TODAY);
    expect(r.isValid).toBe(true);
    expect(r.warnings.join(' ')).toContain('PENDIENTE DE VERIFICACIÓN');
  });

  it('10. avisa si la fuente no es EUR-Lex pero es oficial', () => {
    const r = validateRule(goodRule({ sourceUrl: 'https://www.gob.es/registro/rap' }), TODAY);
    expect(r.isValid).toBe(true);
    expect(r.warnings.join(' ')).toContain('no es EUR-Lex');
  });

  it('11. avisa si el dominio no parece de una administración', () => {
    const r = validateRule(goodRule({ sourceUrl: 'https://registro-rap.de/alta' }), TODAY);
    expect(r.isValid).toBe(true);
    expect(r.warnings.join(' ')).toContain('no parece');
  });

  it('12. avisa si la URL apunta a la portada', () => {
    const r = validateRule(goodRule({ sourceUrl: 'https://eur-lex.europa.eu/' }), TODAY);
    expect(r.warnings.join(' ')).toContain('portada');
  });

  it('13. avisa si la fuente se consultó hace más de un año', () => {
    const r = validateRule(goodRule({ sourceCheckedAt: '2025-01-01' }), TODAY);
    expect(r.warnings.join(' ')).toContain('más de un año');
  });

  it('14. bloquea campos de contenido vacíos', () => {
    const r = validateRule(
      goodRule({ authorityName: '', reportingFrequency: '', requiredData: [], nonComplianceConsequence: '' }),
      TODAY,
    );
    // Cuatro campos vacíos, más el aviso de que no puede estar marcada como
    // verificada mientras haya errores pendientes.
    expect(r.errors).toHaveLength(5);
    expect(r.errors.join(' ')).toContain('No se puede marcar como verificada');
  });

  it('15. bloquea país o flujo no reconocidos', () => {
    const r = validateRule(
      { ...goodRule(), country: 'XX' as never, stream: 'nuclear' as never },
      TODAY,
    );
    expect(r.errors.join(' ')).toContain('País no reconocido');
    expect(r.errors.join(' ')).toContain('Flujo no reconocido');
  });

  it('16. avisa si el identificador no sigue la convención', () => {
    const r = validateRule(goodRule({ id: 'DE Envases 1' }), TODAY);
    expect(r.warnings.join(' ')).toContain('convención');
  });

  it('17. detecta identificadores duplicados al validar una lista', () => {
    const results = validateRules([goodRule(), goodRule()], TODAY);
    expect(results[0].result.isValid).toBe(true);
    expect(results[1].result.isValid).toBe(false);
    expect(results[1].result.errors.join(' ')).toContain('duplicado');
  });

  it('18. las 18 obligaciones de ejemplo del proyecto NO pasan la validación', () => {
    // Si esto falla, o has verificado datos reales (bien) o alguien ha marcado
    // como verificado algo que no lo está (muy mal). Compruébalo antes de tocarlo.
    const results = validateRules(RULES, TODAY);
    expect(results.every((r) => !r.result.isValid)).toBe(true);
  });

  it('19. looksOfficial e isEurLex distinguen los dominios', () => {
    expect(isEurLex('https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=x')).toBe(true);
    expect(isEurLex('https://europa.eu/youreurope')).toBe(false);
    expect(looksOfficial('https://europa.eu/youreurope')).toBe(true);
    expect(looksOfficial('https://consultora-rap.com/alemania')).toBe(false);
    expect(looksOfficial('no-es-una-url')).toBe(false);
  });
});
