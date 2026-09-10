import { describe, expect, it } from 'vitest';
import { buildDiagnosisEmail } from '../src/lib/emailTemplates';
import { buildReportReference } from '../src/lib/reportReference';
import { countOverrides } from '../src/lib/rulesSource';
import { buildWeeklyReport, isoWeek, weekBounds } from '../src/scripts/lib/report';
import type { Lead, Prospect, Report } from '../src/lib/storage/types';

function lead(over: Partial<Lead> = {}): Lead {
  return {
    id: 'l1',
    createdAt: '2026-09-09T10:00:00.000Z',
    updatedAt: '2026-09-09T10:00:00.000Z',
    type: 'complyo',
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

function prospect(over: Partial<Prospect> = {}): Prospect {
  return {
    id: 'p1',
    createdAt: '2026-09-09T10:00:00.000Z',
    listingRef: 'B0X',
    country: 'DE',
    missingItems: [],
    variant: 'A',
    notes: null,
    responded: false,
    ...over,
  };
}

describe('número de informe', () => {
  it('1. compone INFORME-YYYYMMDD-XXXX', () => {
    const ref = buildReportReference('2026-09-10T08:30:00.000Z', 'cefa4258-0dd8-41fe');
    expect(ref).toBe('INFORME-20260910-CEFA');
  });

  it('2. es estable para el mismo informe', () => {
    const a = buildReportReference('2026-09-10T08:30:00.000Z', 'abc123');
    const b = buildReportReference('2026-09-10T23:59:00.000Z', 'abc123');
    expect(a).toBe(b);
  });

  it('3. aguanta una fecha inválida o un id raro sin romper', () => {
    expect(buildReportReference('no-es-fecha', '----')).toBe('INFORME-00000000-0000');
  });
});

describe('correo de entrega', () => {
  it('4. incluye la referencia y el descargo', () => {
    const mail = buildDiagnosisEmail({ name: 'Tienda X', reference: 'INFORME-20260910-ABCD' });
    expect(mail.subject).toContain('diagnóstico');
    expect(mail.body).toContain('Tienda X');
    expect(mail.body).toContain('INFORME-20260910-ABCD');
    expect(mail.body).toContain('no constituye asesoramiento jurídico');
  });

  it('5. sin nombre no deja un saludo roto', () => {
    const mail = buildDiagnosisEmail({ name: null, reference: 'INFORME-1' });
    expect(mail.body.startsWith('Hola:')).toBe(true);
  });
});

describe('semana ISO', () => {
  it('6. calcula la semana ISO', () => {
    expect(isoWeek(new Date('2026-09-10T12:00:00.000Z'))).toBe('2026-W37');
    expect(isoWeek(new Date('2026-01-01T12:00:00.000Z'))).toBe('2026-W01');
  });

  it('7. los límites de la semana van de lunes a lunes', () => {
    const { start, end } = weekBounds(new Date('2026-09-10T12:00:00.000Z'));
    expect(start.getDay()).toBe(1);
    expect(Math.round((end.getTime() - start.getTime()) / 86400000)).toBe(7);
  });
});

describe('informe semanal', () => {
  const reference = new Date('2026-09-10T12:00:00.000Z');

  it('8. cuenta mensajes, respuestas y la tasa por variante', () => {
    const report = buildWeeklyReport({
      leads: [],
      reports: [],
      prospects: [
        prospect({ id: 'p1', variant: 'A', responded: true }),
        prospect({ id: 'p2', variant: 'B', responded: true }),
        prospect({ id: 'p3', variant: 'A', responded: false }),
        prospect({ id: 'p4', variant: 'B', responded: false }),
      ],
      rulesVerified: 0,
      reference,
    });
    expect(report.track_a.messages_sent).toBe(4);
    expect(report.track_a.responses).toBe(2);
    expect(report.track_a.response_rate).toBe(0.5);
    expect(report.track_a.variant_a_responses).toBe(1);
    expect(report.track_a.variant_b_responses).toBe(1);
  });

  it('9. separa los ingresos de cada track', () => {
    const report = buildWeeklyReport({
      leads: [
        lead({ id: 'a', type: 'appeal', revenue: 1500, status: 'convertido' }),
        lead({ id: 'b', type: 'complyo', revenue: 97, status: 'convertido' }),
        lead({ id: 'c', type: 'complyo', status: 'nuevo' }),
      ],
      reports: [],
      prospects: [],
      rulesVerified: 0,
      reference,
    });
    expect(report.track_a.revenue).toBe(1500);
    expect(report.track_b.revenue).toBe(97);
    expect(report.track_b.diagnoses_completed).toBe(2);
    expect(report.track_b.reports_purchased).toBe(1);
  });

  it('10. deja fuera lo que cae en otra semana', () => {
    const report = buildWeeklyReport({
      leads: [lead({ createdAt: '2026-08-01T10:00:00.000Z' })],
      reports: [],
      prospects: [prospect({ createdAt: '2026-08-01T10:00:00.000Z' })],
      rulesVerified: 0,
      reference,
    });
    expect(report.track_b.diagnoses_completed).toBe(0);
    expect(report.track_a.messages_sent).toBe(0);
  });

  it('11. cuenta como abiertos los casos de apelación sin cerrar', () => {
    const report = buildWeeklyReport({
      leads: [
        lead({ id: 'a', type: 'appeal', status: 'nuevo' }),
        lead({ id: 'b', type: 'appeal', status: 'contactado' }),
        lead({ id: 'c', type: 'appeal', status: 'convertido' }),
        lead({ id: 'd', type: 'appeal', status: 'descartado' }),
      ],
      reports: [],
      prospects: [],
      rulesVerified: 0,
      reference,
    });
    expect(report.track_a.cases_open).toBe(2);
  });

  it('12. sin datos avisa en vez de inventar cifras', () => {
    const report = buildWeeklyReport({
      leads: [],
      reports: [],
      prospects: [],
      rulesVerified: 0,
      reference,
    });
    expect(report.track_a.response_rate).toBe(0);
    expect(report.notes.join(' ')).toContain('Ninguna obligación verificada');
    expect(report.week).toBe('2026-W37');
  });

  it('13. incluye el recuento de informes del periodo', () => {
    const report = buildWeeklyReport({
      leads: [],
      reports: [
        { id: 'r1', leadId: 'l1', createdAt: '2026-09-09T10:00:00.000Z' } as Report,
      ],
      prospects: [],
      rulesVerified: 3,
      reference,
    });
    expect(report.notes.join(' ')).toContain('Informes generados en el periodo: 1');
    expect(report.track_b.rules_verified).toBe(3);
  });
});

describe('origen de las reglas', () => {
  it('14. cuenta cuántas obligaciones del código están sobrescritas', () => {
    expect(countOverrides([])).toBe(0);
    expect(
      countOverrides([
        { id: 'de-envases-registro', updatedAt: '2026-09-10' } as never,
        { id: 'no-existe-en-codigo', updatedAt: '2026-09-10' } as never,
      ]),
    ).toBe(1);
  });
});
