import { describe, expect, it } from 'vitest';
import type { ObligationRule } from '../src/data/rules/schema';
import {
  buildVersion,
  changesSince,
  describeVersion,
  diffRules,
  isMaterial,
  type RuleVersion,
} from '../src/lib/rulesHistory';

function rule(over: Partial<ObligationRule> = {}): ObligationRule {
  return {
    id: 'de-envases-registro',
    country: 'DE',
    stream: 'envases',
    authorityName: 'Registro alemán',
    representativeRequiredForNonEstablished: false,
    reportingFrequency: 'anual',
    requiredData: ['NIF'],
    nonComplianceConsequence: 'Consecuencia documentada.',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: 'https://eur-lex.europa.eu/x',
    sourceCheckedAt: '2026-09-01',
    verified: true,
    ...over,
  };
}

describe('comparación de obligaciones', () => {
  it('1. sin cambios no devuelve nada', () => {
    expect(diffRules(rule(), rule())).toEqual([]);
  });

  it('2. detecta el campo que cambió, con antes y después', () => {
    const changes = diffRules(rule(), rule({ reportingFrequency: 'trimestral' }));
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe('reportingFrequency');
    expect(changes[0].before).toBe('anual');
    expect(changes[0].after).toBe('trimestral');
    expect(changes[0].material).toBe(true);
  });

  it('3. los booleanos y las listas se leen en claro', () => {
    const changes = diffRules(
      rule(),
      rule({ representativeRequiredForNonEstablished: true, requiredData: ['NIF', 'EORI'] }),
    );
    const rep = changes.find((c) => c.field === 'representativeRequiredForNonEstablished');
    const datos = changes.find((c) => c.field === 'requiredData');
    expect(rep?.before).toBe('no');
    expect(rep?.after).toBe('sí');
    expect(datos?.after).toBe('NIF; EORI');
  });

  it('4. distingue lo que afecta al cliente de lo que es mantenimiento nuestro', () => {
    const material = diffRules(rule(), rule({ authorityName: 'Otro registro' }));
    const interno = diffRules(rule(), rule({ notes: 'revisar', severityWeight: 80 }));
    expect(material[0].material).toBe(true);
    expect(interno.every((c) => c.material)).toBe(false);
  });

  it('5. un campo que pasa a vacío se muestra como raya, no como "undefined"', () => {
    const changes = diffRules(rule({ complianceSchemeName: 'Organismo' }), rule());
    expect(changes[0].before).toBe('Organismo');
    expect(changes[0].after).toBe('—');
  });
});

describe('entradas del historial', () => {
  it('6. sin estado anterior es un alta', () => {
    const version = buildVersion('v1', '2026-09-10T10:00:00.000Z', null, rule());
    expect(version?.changeType).toBe('alta');
    expect(version?.ruleId).toBe('de-envases-registro');
  });

  it('7. sin estado posterior es una baja, y guarda el último estado conocido', () => {
    const version = buildVersion('v1', '2026-09-10T10:00:00.000Z', rule(), null);
    expect(version?.changeType).toBe('baja');
    expect(version?.payload.authorityName).toBe('Registro alemán');
  });

  it('8. guardar sin cambiar nada NO genera entrada', () => {
    expect(buildVersion('v1', '2026-09-10T10:00:00.000Z', rule(), rule())).toBeNull();
  });

  it('9. altas y bajas siempre cuentan como material', () => {
    const alta = buildVersion('v1', '2026-09-10T10:00:00.000Z', null, rule())!;
    const baja = buildVersion('v2', '2026-09-10T10:00:00.000Z', rule(), null)!;
    expect(isMaterial(alta)).toBe(true);
    expect(isMaterial(baja)).toBe(true);
  });

  it('10. una modificación solo interna no es material', () => {
    const version = buildVersion(
      'v1',
      '2026-09-10T10:00:00.000Z',
      rule(),
      rule({ notes: 'revisado' }),
    )!;
    expect(isMaterial(version)).toBe(false);
  });

  it('11. describeVersion resume el cambio en una línea', () => {
    const version = buildVersion(
      'v1',
      '2026-09-10T10:00:00.000Z',
      rule(),
      rule({ reportingFrequency: 'trimestral' }),
    )!;
    expect(describeVersion(version)).toContain('Registro alemán');
    expect(describeVersion(version)).toContain('periodicidad');
  });
});

describe('qué ha cambiado desde un informe', () => {
  const versions: RuleVersion[] = [
    buildVersion('v1', '2026-09-01T10:00:00.000Z', null, rule())!,
    buildVersion('v2', '2026-09-05T10:00:00.000Z', rule(), rule({ reportingFrequency: 'mensual' }))!,
    buildVersion('v3', '2026-09-08T10:00:00.000Z', rule(), rule({ notes: 'ok' }))!,
    buildVersion('v4', '2026-09-09T10:00:00.000Z', null, rule({ id: 'fr-envases-registro', country: 'FR' }))!,
  ];

  it('12. solo devuelve lo posterior a la fecha, de más reciente a más antiguo', () => {
    const result = changesSince(versions, '2026-09-04T00:00:00.000Z');
    expect(result.versions.map((v) => v.id)).toEqual(['v4', 'v3', 'v2']);
  });

  it('13. separa lo material de lo interno', () => {
    const result = changesSince(versions, '2026-09-04T00:00:00.000Z');
    expect(result.material.map((v) => v.id)).toEqual(['v4', 'v2']);
  });

  it('14. acotado a las obligaciones del informe, ignora las de otros países', () => {
    const result = changesSince(versions, '2026-09-04T00:00:00.000Z', ['de-envases-registro']);
    expect(result.versions.map((v) => v.id)).toEqual(['v3', 'v2']);
    expect(result.ruleIds).toEqual(['de-envases-registro']);
  });

  it('15. sin cambios posteriores devuelve listas vacías, no inventa nada', () => {
    const result = changesSince(versions, '2026-12-31T00:00:00.000Z');
    expect(result.versions).toEqual([]);
    expect(result.material).toEqual([]);
  });
});
