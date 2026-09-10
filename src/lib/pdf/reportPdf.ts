import { jsPDF } from 'jspdf';
import {
  AUTHORITY_LEAD_TIME_UNKNOWN,
  BRAND,
  DISCLAIMER,
  PRICING,
  REGULATION,
  SERVICE_COMMITMENTS,
  UNVERIFIED_BADGE,
} from '../../config/brand';
import type { AppliedObligation } from '../engine/types';
import type { Report } from '../storage/types';
import {
  COUNTRY_LABELS,
  RISK_LABELS,
  WASTE_STREAM_LABELS,
  type CountryCode,
} from '../../types/domain';

/**
 * Generación de PDF en cliente con jsPDF, dibujando texto directamente.
 * No se usa html2canvas: el texto sale seleccionable, pesa poco y no depende
 * de cómo se vea la pantalla. Ver DECISIONS.md.
 *
 * Formato A4 en milímetros.
 */

const PAGE = { width: 210, height: 297, margin: 18 };
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const FOOTER_SPACE = 22;

/**
 * Las fuentes estándar de jsPDF usan WinAnsi y se comen algunos caracteres
 * tipográficos. Se sustituyen por equivalentes ASCII antes de dibujar.
 */
function sanitize(value: string): string {
  return value
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ');
}

interface Cursor {
  doc: jsPDF;
  y: number;
  page: number;
}

function newPage(c: Cursor): void {
  c.doc.addPage();
  c.page += 1;
  c.y = PAGE.margin;
}

function ensure(c: Cursor, needed: number): void {
  if (c.y + needed > PAGE.height - FOOTER_SPACE) newPage(c);
}

function text(
  c: Cursor,
  content: string,
  opts: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: [number, number, number]; gap?: number; indent?: number } = {},
): void {
  const { size = 10, style = 'normal', color = [20, 27, 42], gap = 2, indent = 0 } = opts;
  c.doc.setFont('helvetica', style);
  c.doc.setFontSize(size);
  c.doc.setTextColor(...color);
  const lines = c.doc.splitTextToSize(sanitize(content), CONTENT_WIDTH - indent) as string[];
  const lineHeight = size * 0.45;
  for (const line of lines) {
    ensure(c, lineHeight);
    c.doc.text(line, PAGE.margin + indent, c.y);
    c.y += lineHeight;
  }
  c.y += gap;
}

function heading(c: Cursor, n: number, title: string): void {
  ensure(c, 16);
  c.y += 4;
  c.doc.setDrawColor(29, 78, 216);
  c.doc.setLineWidth(0.6);
  c.doc.line(PAGE.margin, c.y - 3.5, PAGE.margin + CONTENT_WIDTH, c.y - 3.5);
  text(c, `${n}. ${title}`, { size: 13, style: 'bold', color: [29, 78, 216], gap: 3 });
}

function unverifiedBanner(c: Cursor, indent = 0): void {
  text(c, UNVERIFIED_BADGE, { size: 8, style: 'bold', color: [146, 64, 14], gap: 1.5, indent });
}

function obligationTitle(o: AppliedObligation): string {
  return `${COUNTRY_LABELS[o.rule.country]} · ${WASTE_STREAM_LABELS[o.rule.stream]} — ${o.rule.authorityName}`;
}

function drawFooters(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(210, 214, 220);
    doc.setLineWidth(0.3);
    doc.line(PAGE.margin, PAGE.height - 20, PAGE.width - PAGE.margin, PAGE.height - 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(90, 100, 115);
    const lines = doc.splitTextToSize(sanitize(DISCLAIMER), CONTENT_WIDTH) as string[];
    let y = PAGE.height - 16;
    for (const line of lines) {
      doc.text(line, PAGE.margin, y);
      y += 3;
    }
    doc.text(sanitize(`${BRAND.name} · página ${i} de ${total}`), PAGE.width - PAGE.margin, PAGE.height - 6, {
      align: 'right',
    });
  }
}

export function buildReportPdf(report: Report, email: string, companyName: string | null): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({
    title: `${BRAND.name} — Informe de exposición`,
    subject: `Exposición al ${REGULATION.reference}`,
  });

  const c: Cursor = { doc, y: PAGE.margin, page: 1 };
  const { result } = report;

  // ---------------------------------------------------------------- Portada
  text(c, BRAND.name, { size: 11, style: 'bold', color: [29, 78, 216], gap: 1 });
  text(c, 'Informe de exposición al cumplimiento RAP en la Unión Europea', {
    size: 18,
    style: 'bold',
    gap: 3,
  });
  text(
    c,
    `${companyName ?? email} · Informe ${report.id} · Generado el ${new Date(report.createdAt).toLocaleDateString('es-ES')}`,
    { size: 9, color: [90, 100, 115], gap: 4 },
  );
  text(
    c,
    `Norma de referencia: ${REGULATION.reference}. Fecha de aplicación: ${REGULATION.applicationDate}.`,
    { size: 9, color: [90, 100, 115], gap: 3 },
  );

  if (result.summary.allUnverified) {
    unverifiedBanner(c);
    text(
      c,
      'La base de reglas usada para este informe todavía no ha sido verificada contra fuentes oficiales. Este documento es un borrador interno.',
      { size: 8, style: 'italic', color: [146, 64, 14], gap: 3 },
    );
  }

  // ------------------------------------------------ 1. Situación actual
  heading(c, 1, 'Situación actual, país por país');
  if (result.countries.length === 0) {
    text(c, 'No se han identificado obligaciones con los datos facilitados.', { size: 10 });
  }
  for (const country of result.countries) {
    text(c, COUNTRY_LABELS[country.country as CountryCode], { size: 11, style: 'bold', gap: 1 });
    text(
      c,
      `${country.obligations.length} obligación(es) aplicable(s) · Riesgo más alto: ${RISK_LABELS[country.highestRisk]} · Flujos: ${country.streams
        .map((s) => WASTE_STREAM_LABELS[s])
        .join(', ')}`,
      { size: 9, color: [70, 80, 95], gap: 1 },
    );
    if (country.unverifiedCount > 0) unverifiedBanner(c);
    c.y += 1.5;
  }

  // --------------------------------------- 2. Qué falta y qué lo exige
  heading(c, 2, 'Qué falta y qué norma lo exige');
  for (const o of result.obligations) {
    ensure(c, 30);
    text(c, obligationTitle(o), { size: 10, style: 'bold', gap: 1 });
    if (!o.verified) unverifiedBanner(c);
    text(c, `Riesgo: ${RISK_LABELS[o.risk]}`, { size: 9, color: [70, 80, 95], gap: 1 });
    if (o.rule.complianceSchemeName) {
      text(c, `Organismo: ${o.rule.complianceSchemeName}`, { size: 9, gap: 1, indent: 3 });
    }
    text(
      c,
      `Representante autorizado obligatorio si no estás establecido en la UE: ${o.rule.representativeRequiredForNonEstablished ? 'sí' : 'no'}`,
      { size: 9, gap: 1, indent: 3 },
    );
    text(c, `Periodicidad de declaración: ${o.rule.reportingFrequency}`, { size: 9, gap: 1, indent: 3 });
    text(c, `Datos que exige: ${o.rule.requiredData.join('; ')}`, { size: 9, gap: 1, indent: 3 });
    text(c, `Fuente: ${o.rule.sourceUrl} (consultada el ${o.rule.sourceCheckedAt})`, {
      size: 8,
      color: [90, 100, 115],
      gap: 3,
      indent: 3,
    });
  }

  // ------------------------------------- 3. Qué pasa si no se arregla
  heading(c, 3, 'Qué pasa si no se arregla');
  for (const o of result.obligations) {
    ensure(c, 16);
    text(c, obligationTitle(o), { size: 9, style: 'bold', gap: 1 });
    if (!o.verified) unverifiedBanner(c, 3);
    text(c, o.rule.nonComplianceConsequence, { size: 9, gap: 1, indent: 3 });
    for (const reason of o.riskReasons) {
      text(c, `· ${reason}`, { size: 8, color: [70, 80, 95], gap: 0.5, indent: 3 });
    }
    c.y += 1.5;
  }

  // ------------------------------- 4. Qué cuesta y en cuánto tiempo
  heading(c, 4, 'Qué cuesta y en cuánto tiempo se resuelve');
  text(c, `Este informe: ${PRICING.report.label}.`, { size: 10, gap: 1 });
  text(
    c,
    `Resolución del alta (por obligación y país): ${PRICING.resolution.min}–${PRICING.resolution.max} ${PRICING.resolution.currency}, cobrado por adelantado.`,
    { size: 10, gap: 1 },
  );
  text(c, `Vigilancia posterior: ${PRICING.monitoring.min}–${PRICING.monitoring.max} ${PRICING.monitoring.currency} al mes.`, {
    size: 10,
    gap: 2,
  });
  text(c, SERVICE_COMMITMENTS.reportDelivery, { size: 9, gap: 1 });
  text(c, SERVICE_COMMITMENTS.resolutionStart, { size: 9, gap: 2 });
  text(c, AUTHORITY_LEAD_TIME_UNKNOWN, { size: 9, style: 'italic', color: [146, 64, 14], gap: 2 });
  text(
    c,
    `Obligaciones detectadas: ${result.summary.totalObligations} en ${result.summary.countriesCovered} país(es). Críticas: ${result.summary.criticalCount}.`,
    { size: 9, color: [70, 80, 95], gap: 2 },
  );

  // ------------------------------------------------------------ 5. CTA
  heading(c, 5, 'Resolverlo');
  text(
    c,
    `Responde a este correo o escribe a ${BRAND.contactEmail} indicando el número de informe ${report.id} y lo ponemos en marcha.`,
    { size: 10, gap: 2 },
  );

  drawFooters(doc);
  return doc;
}

export function downloadReportPdf(report: Report, email: string, companyName: string | null): void {
  const doc = buildReportPdf(report, email, companyName);
  doc.save(`${BRAND.name.toLowerCase()}-informe-${report.id.slice(0, 8)}.pdf`);
}
