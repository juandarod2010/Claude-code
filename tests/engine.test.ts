import { describe, expect, it } from 'vitest';
import { RULES } from '../src/data/rules';
import { evaluate, RISK_SCORING, streamsForCategories } from '../src/lib/engine';
import { answers, rule } from './fixtures';

describe('motor de reglas', () => {
  it('1. sin países de destino no devuelve obligaciones y avisa', () => {
    const result = evaluate(answers({ countries: [] }), [rule('DE', 'envases')]);
    expect(result.obligations).toHaveLength(0);
    expect(result.warnings).toContain('No se ha seleccionado ningún país de destino.');
  });

  it('2. solo devuelve obligaciones de los países seleccionados', () => {
    const result = evaluate(answers({ countries: ['FR'] }), [
      rule('DE', 'envases'),
      rule('FR', 'envases'),
    ]);
    expect(result.obligations.map((o) => o.rule.country)).toEqual(['FR']);
  });

  it('3. avisa cuando un país seleccionado no tiene reglas cargadas', () => {
    const result = evaluate(answers({ countries: ['PL'] }), [rule('DE', 'envases')]);
    expect(result.obligations).toHaveLength(0);
    expect(result.warnings.join(' ')).toContain('Polonia');
  });

  it('4. una categoría sin componente eléctrico no activa el flujo de aparatos', () => {
    const result = evaluate(answers({ categories: ['textil'] }), [
      rule('DE', 'envases'),
      rule('DE', 'aparatos_electricos'),
      rule('DE', 'pilas'),
    ]);
    expect(result.obligations.map((o) => o.rule.stream)).toEqual(['envases']);
  });

  it('5. una categoría con más de un flujo aplicable activa los tres flujos', () => {
    const result = evaluate(answers({ categories: ['electronica_consumo'] }), [
      rule('DE', 'envases'),
      rule('DE', 'aparatos_electricos'),
      rule('DE', 'pilas'),
    ]);
    expect(new Set(result.obligations.map((o) => o.rule.stream))).toEqual(
      new Set(['envases', 'aparatos_electricos', 'pilas']),
    );
  });

  it('6. juguetes con pilas activan pilas y aparatos, juguetes sin pilas no', () => {
    const rules = [rule('DE', 'envases'), rule('DE', 'aparatos_electricos'), rule('DE', 'pilas')];
    const conPilas = evaluate(answers({ categories: ['juguetes_con_pilas'] }), rules);
    const sinPilas = evaluate(answers({ categories: ['juguetes'] }), rules);
    expect(conPilas.obligations).toHaveLength(3);
    expect(sinPilas.obligations).toHaveLength(1);
  });

  it('7. vendedor multipaís recibe las obligaciones de cada país sin duplicar', () => {
    const result = evaluate(answers({ countries: ['DE', 'FR', 'ES', 'DE'] }), [
      rule('DE', 'envases'),
      rule('FR', 'envases'),
      rule('ES', 'envases'),
      rule('IT', 'envases'),
    ]);
    expect(result.obligations).toHaveLength(3);
    expect(result.summary.countriesCovered).toBe(3);
    expect(result.countries.map((c) => c.country)).toEqual(['DE', 'FR', 'ES']);
  });

  it('8. vendedor NO establecido en la UE eleva la puntuación de toda obligación', () => {
    const rules = [rule('DE', 'envases')];
    const dentro = evaluate(answers({ establishedInEU: true }), rules);
    const fuera = evaluate(answers({ establishedInEU: false }), rules);
    expect(fuera.obligations[0].score - dentro.obligations[0].score).toBe(
      RISK_SCORING.nonEstablished,
    );
  });

  it('9. vendedor no establecido + obligación con representante marca representativeGap', () => {
    const rules = [
      rule('DE', 'envases', { representativeRequiredForNonEstablished: true }),
      rule('FR', 'envases', { representativeRequiredForNonEstablished: false }),
    ];
    const result = evaluate(answers({ countries: ['DE', 'FR'], establishedInEU: false }), rules);
    const gaps = result.obligations.filter((o) => o.representativeGap);
    expect(gaps).toHaveLength(1);
    expect(result.summary.representativeGapCountries).toEqual(['DE']);
  });

  it('10. estando establecido en la UE nunca hay representativeGap', () => {
    const result = evaluate(answers({ establishedInEU: true }), [
      rule('DE', 'envases', { representativeRequiredForNonEstablished: true }),
    ]);
    expect(result.obligations[0].representativeGap).toBe(false);
    expect(result.summary.representativeGapCountries).toEqual([]);
  });

  it('11. el peor caso (no establecido, representante, Amazon, alto volumen) es crítico', () => {
    const result = evaluate(
      answers({
        categories: ['electronica_consumo'],
        establishedInEU: false,
        channels: ['amazon_eu'],
        volume: '10000+',
      }),
      [rule('DE', 'aparatos_electricos', {
        severityWeight: 80,
        representativeRequiredForNonEstablished: true,
      })],
    );
    expect(result.obligations[0].risk).toBe('critico');
    expect(result.summary.criticalCount).toBe(1);
  });

  it('12. el caso más benigno queda en riesgo medio', () => {
    const result = evaluate(
      answers({ establishedInEU: true, channels: ['web_propia'], volume: '0-100' }),
      [rule('DE', 'envases', { severityWeight: 60 })],
    );
    expect(result.obligations[0].risk).toBe('medio');
    expect(result.summary.criticalCount).toBe(0);
  });

  it('13. las obligaciones salen ordenadas de más a menos urgente', () => {
    const result = evaluate(answers({ countries: ['DE', 'FR'], categories: ['electronica_consumo'] }), [
      rule('DE', 'envases', { severityWeight: 10 }),
      rule('FR', 'aparatos_electricos', { severityWeight: 200 }),
      rule('DE', 'pilas', { severityWeight: 100 }),
    ]);
    expect(result.obligations.map((o) => o.score)).toEqual([200, 100, 10]);
    expect(result.obligations.map((o) => o.risk)).toEqual(['critico', 'alto', 'medio']);
  });

  it('14. appliesToCategories filtra por categoría concreta', () => {
    const rules = [
      rule('DE', 'envases', { id: 'solo-textil', appliesToCategories: ['textil'] }),
      rule('DE', 'envases', { id: 'solo-cosmetica', appliesToCategories: ['cosmetica'] }),
    ];
    const result = evaluate(answers({ categories: ['textil'] }), rules);
    expect(result.obligations.map((o) => o.rule.id)).toEqual(['solo-textil']);
    expect(result.obligations[0].triggeringCategories).toEqual(['textil']);
  });

  it('15. las obligaciones sin verificar se cuentan y marcan allUnverified', () => {
    const result = evaluate(answers(), [rule('DE', 'envases', { verified: false })]);
    expect(result.obligations[0].verified).toBe(false);
    expect(result.summary.unverifiedCount).toBe(1);
    expect(result.summary.allUnverified).toBe(true);
  });

  it('16. con la base mezclada allUnverified es false pero el contador es exacto', () => {
    const result = evaluate(answers({ countries: ['DE', 'FR'] }), [
      rule('DE', 'envases', { verified: false }),
      rule('FR', 'envases', { verified: true }),
    ]);
    expect(result.summary.unverifiedCount).toBe(1);
    expect(result.summary.allUnverified).toBe(false);
    expect(result.countries.find((c) => c.country === 'DE')?.unverifiedCount).toBe(1);
  });

  it('17. es una función pura: no muta la entrada y es determinista', () => {
    const input = answers({ countries: ['FR', 'DE'], categories: ['textil', 'textil'] });
    const snapshot = JSON.parse(JSON.stringify(input));
    const rules = [rule('DE', 'envases'), rule('FR', 'envases')];
    const a = evaluate(input, rules);
    const b = evaluate(input, rules);
    expect(input).toEqual(snapshot);
    expect(a).toEqual(b);
  });

  it('18. avisa si no se ha declarado ningún material de envase', () => {
    const result = evaluate(answers({ packagingMaterials: [] }), [rule('DE', 'envases')]);
    expect(result.warnings.join(' ')).toContain('material de envase');
  });

  it('19. el resumen por país agrupa flujos y calcula el peor riesgo', () => {
    const result = evaluate(answers({ categories: ['electronica_consumo'], establishedInEU: false }), [
      rule('DE', 'envases', { severityWeight: 10 }),
      rule('DE', 'aparatos_electricos', { severityWeight: 200 }),
    ]);
    const de = result.countries[0];
    expect(de.streams).toEqual(['envases', 'aparatos_electricos']);
    expect(de.highestRisk).toBe('critico');
    expect(de.obligations).toHaveLength(2);
  });

  it('20. streamsForCategories mapea categoría a flujos y acumula las que coinciden', () => {
    const map = streamsForCategories(['textil', 'juguetes_con_pilas']);
    expect(map.get('envases')).toEqual(['textil', 'juguetes_con_pilas']);
    expect(map.get('pilas')).toEqual(['juguetes_con_pilas']);
  });

  it('21. la base de reglas del proyecto sigue siendo íntegramente de ejemplo', () => {
    // Si este test falla es buena noticia: alguien ha verificado datos reales.
    // Actualízalo entonces a conciencia.
    const result = evaluate(
      answers({ countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'PL'], categories: ['electronica_consumo'] }),
      RULES,
    );
    expect(result.obligations.length).toBe(18);
    expect(result.summary.allUnverified).toBe(true);
  });
});

describe('cobertura por país', () => {
  it('22. distingue un país sin reglas cargadas de uno donde nada aplica', () => {
    const result = evaluate(
      answers({ countries: ['DE', 'FR', 'ES'], categories: ['textil'] }),
      [
        // Alemania: cargada y aplica (textil activa envases).
        rule('DE', 'envases'),
        // Francia: cargada, pero solo con un flujo que el textil no activa.
        rule('FR', 'aparatos_electricos'),
        // España: no hay nada cargado.
      ],
    );

    expect(result.summary.countriesNotLoaded).toEqual(['ES']);
    expect(result.summary.countriesWithoutMatches).toEqual(['FR']);
    expect(result.countries.map((c) => c.country)).toEqual(['DE']);
  });

  it('23. el aviso de país no cargado deja claro que no es una respuesta', () => {
    const result = evaluate(answers({ countries: ['PL'] }), [rule('DE', 'envases')]);
    const warning = result.warnings.join(' ');
    expect(warning).toContain('Polonia');
    expect(warning).toContain('no las hemos verificado');
  });

  it('24. con la base completa para lo que vende, no hay huecos', () => {
    const result = evaluate(answers({ countries: ['DE'] }), [rule('DE', 'envases')]);
    expect(result.summary.countriesNotLoaded).toEqual([]);
    expect(result.summary.countriesWithoutMatches).toEqual([]);
  });
});
