import { describe, expect, it } from 'vitest';
import { inflateSync } from 'node:zlib';
import { DISCLAIMER, UNVERIFIED_BADGE } from '../src/config/brand';
import { evaluate } from '../src/lib/engine';
import { buildReportPdf } from '../src/lib/pdf/reportPdf';
import type { Report } from '../src/lib/storage/types';
import { answers, rule } from './fixtures';

/** Extrae el texto dibujado en el PDF para poder afirmar sobre su contenido. */
function extractText(bytes: Uint8Array): string {
  const buffer = Buffer.from(bytes);
  const chunks: string[] = [];
  const re = /stream\r?\n/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(buffer.toString('latin1'))) !== null) {
    const start = match.index + match[0].length;
    const end = buffer.toString('latin1').indexOf('endstream', start);
    if (end === -1) continue;
    try {
      chunks.push(inflateSync(buffer.subarray(start, end)).toString('latin1'));
    } catch {
      chunks.push(buffer.subarray(start, end).toString('latin1'));
    }
  }
  return [...chunks.join('\n').matchAll(/\((.*?)\)\s*Tj/g)].map((m) => m[1]).join(' ');
}

function makeReport(over: Partial<Report> = {}): Report {
  const result = evaluate(
    answers({ countries: ['DE', 'FR'], categories: ['electronica_consumo'], establishedInEU: false }),
    [
      rule('DE', 'envases', { verified: false }),
      rule('DE', 'aparatos_electricos', { verified: false, severityWeight: 80 }),
      rule('FR', 'pilas', { verified: true }),
    ],
  );
  return {
    id: 'abc12345-0000-0000-0000-000000000000',
    leadId: 'lead-1',
    createdAt: '2026-09-10T09:00:00.000Z',
    result,
    rulesSnapshotSize: result.obligations.length,
    reference: 'INFORME-20260910-ABC1',
    ...over,
  };
}

describe('generación del PDF', () => {
  const report = makeReport();
  const doc = buildReportPdf(report, 'cliente@ejemplo.invalid', 'Tienda X');
  const bytes = new Uint8Array(doc.output('arraybuffer'));
  const text = extractText(bytes);

  it('1. produce un PDF válido en A4', () => {
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    const size = doc.internal.pageSize;
    expect(Math.round(size.getWidth())).toBe(210);
    expect(Math.round(size.getHeight())).toBe(297);
  });

  it('2. lleva las cinco secciones fijas', () => {
    for (const heading of [
      '1. Situación actual, país por país',
      '2. Qué falta y qué norma lo exige',
      '3. Qué pasa si no se arregla',
      '4. Qué cuesta y en cuánto tiempo se resuelve',
      '5. Resolverlo',
    ]) {
      expect(text).toContain(heading);
    }
  });

  it('3. el descargo de responsabilidad aparece en todas las páginas', () => {
    const pages = doc.getNumberOfPages();
    const fragment = DISCLAIMER.slice(0, 40);
    const occurrences = text.split(fragment.slice(0, 25)).length - 1;
    expect(pages).toBeGreaterThan(0);
    expect(occurrences).toBeGreaterThanOrEqual(pages);
  });

  it('4. las obligaciones sin verificar salen con la etiqueta visible', () => {
    expect(text).toContain(UNVERIFIED_BADGE.split(' —')[0]);
  });

  it('5. incluye el número de informe y el cliente', () => {
    expect(text).toContain('INFORME-20260910-ABC1');
    expect(text).toContain('Tienda X');
  });

  it('6. sin nombre de empresa usa el correo', () => {
    const anon = buildReportPdf(makeReport(), 'cliente@ejemplo.invalid', null);
    expect(extractText(new Uint8Array(anon.output('arraybuffer')))).toContain('cliente@ejemplo.invalid');
  });

  it('7. un informe sin obligaciones no rompe el PDF', () => {
    const empty = evaluate(answers({ countries: [] }), []);
    const doc2 = buildReportPdf(makeReport({ result: empty }), 'x@y.invalid', null);
    const text2 = extractText(new Uint8Array(doc2.output('arraybuffer')));
    expect(text2).toContain('No se han identificado obligaciones');
  });

  it('8. los guiones largos se sustituyen por ASCII: las fuentes base no los tienen', () => {
    expect(text).not.toContain('—');
    expect(text).toContain('PENDIENTE DE VERIFICACI');
  });
});
