import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import RiskPill from '../components/RiskPill';
import UnverifiedBadge from '../components/UnverifiedBadge';
import {
  AUTHORITY_LEAD_TIME_UNKNOWN,
  BRAND,
  PRICING,
  REGULATION,
  REPORT_CTA_LABEL,
  SERVICE_COMMITMENTS,
} from '../config/brand';
import type { AppliedObligation } from '../lib/engine/types';
import { storage, type Lead, type Report } from '../lib/storage';
import { COUNTRY_LABELS, RISK_LABELS, WASTE_STREAM_LABELS } from '../types/domain';

export default function InformePage() {
  const { id = '' } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [state, setState] = useState<'cargando' | 'listo' | 'no-encontrado'>('cargando');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = await storage.getReport(id);
      if (cancelled) return;
      if (!found) {
        setState('no-encontrado');
        return;
      }
      setReport(found);
      setLead(await storage.getLead(found.leadId));
      setState('listo');
    })().catch(() => setState('no-encontrado'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === 'cargando') {
    return <Centered>Cargando informe…</Centered>;
  }

  if (state === 'no-encontrado' || !report) {
    return (
      <Centered>
        <p className="font-semibold">No encontramos ese informe.</p>
        <p className="mt-2 text-sm text-slate-600">
          En modo local los informes se guardan en este navegador. Si has cambiado de dispositivo o
          borrado los datos, hay que repetir el diagnóstico.
        </p>
        <Link to="/diagnostico" className="btn-primary mt-6">
          Repetir el diagnóstico
        </Link>
      </Centered>
    );
  }

  const { result } = report;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            {BRAND.name}
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              // Carga diferida: jsPDF solo se descarga si el usuario pide el PDF.
              const { downloadReportPdf } = await import('../lib/pdf/reportPdf');
              downloadReportPdf(report, lead?.email ?? '', lead?.companyName ?? null);
            }}
          >
            Descargar en PDF
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-8">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Informe de exposición al cumplimiento RAP en la Unión Europea
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {lead?.companyName ?? lead?.email ?? 'Sin identificar'} · {report.reference} ·{' '}
            {new Date(report.createdAt).toLocaleDateString('es-ES')}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Norma de referencia: {REGULATION.reference}. Fecha de aplicación:{' '}
            {REGULATION.applicationDate}.
          </p>

          {result.summary.allUnverified && (
            <div className="mt-6 rounded-xl border border-amber-400 bg-amber-50 p-4">
              <UnverifiedBadge />
              <p className="mt-2 text-sm text-amber-900">
                La base de reglas usada para este informe todavía no ha sido verificada contra
                fuentes oficiales. Es un borrador interno: no debe entregarse a un cliente.
              </p>
            </div>
          )}

          {/* 1 */}
          <Section n={1} title="Situación actual, país por país">
            {result.countries.length === 0 && result.summary.countriesNotLoaded.length === 0 && (
              <p className="text-sm text-slate-600">
                No se han identificado obligaciones con los datos facilitados.
              </p>
            )}
            <div className="space-y-4">
              {result.countries.map((country) => (
                <div key={country.country} className="card">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">{COUNTRY_LABELS[country.country]}</h3>
                    <RiskPill risk={country.highestRisk} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {country.obligations.length} obligación(es) aplicable(s). Flujos afectados:{' '}
                    {country.streams.map((s) => WASTE_STREAM_LABELS[s]).join(', ')}.
                  </p>
                  {country.unverifiedCount > 0 && (
                    <div className="mt-3">
                      <UnverifiedBadge />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {result.summary.countriesNotLoaded.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-400 bg-amber-50 p-4">
                <UnverifiedBadge />
                <p className="mt-2 text-sm font-semibold text-amber-900">
                  Pendiente de cubrir:{' '}
                  {result.summary.countriesNotLoaded.map((c) => COUNTRY_LABELS[c]).join(', ')}
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  Todavía no hemos cargado las obligaciones de{' '}
                  {result.summary.countriesNotLoaded.length === 1 ? 'este país' : 'estos países'}.
                  Que no aparezcan aquí <strong>no significa que no tengas obligaciones allí</strong>:
                  significa que no las hemos verificado y no vamos a decirte algo que no sabemos.
                </p>
              </div>
            )}
          </Section>

          {/* 2 */}
          <Section n={2} title="Qué falta y qué norma lo exige">
            <div className="space-y-4">
              {result.obligations.map((o) => (
                <div key={o.rule.id} className="card">
                  <ObligationHeader o={o} />
                  <dl className="mt-3 space-y-2 text-sm">
                    {o.rule.complianceSchemeName && (
                      <Row label="Organismo" value={o.rule.complianceSchemeName} />
                    )}
                    <Row
                      label="Representante autorizado obligatorio si no estás establecido en la UE"
                      value={o.rule.representativeRequiredForNonEstablished ? 'Sí' : 'No'}
                    />
                    <Row label="Periodicidad de declaración" value={o.rule.reportingFrequency} />
                    <Row label="Datos que exige" value={o.rule.requiredData.join('; ')} />
                  </dl>
                  <p className="mt-3 text-xs text-slate-500">
                    Fuente:{' '}
                    <a
                      className="underline"
                      href={o.rule.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {o.rule.sourceUrl}
                    </a>{' '}
                    (consultada el {o.rule.sourceCheckedAt})
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* 3 */}
          <Section n={3} title="Qué pasa si no se arregla">
            <div className="space-y-4">
              {result.obligations.map((o) => (
                <div key={o.rule.id} className="card">
                  <ObligationHeader o={o} />
                  <p className="mt-2 text-sm text-slate-700">{o.rule.nonComplianceConsequence}</p>
                  {o.riskReasons.length > 0 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {o.riskReasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* 4 */}
          <Section n={4} title="Qué cuesta y en cuánto tiempo se resuelve">
            <div className="card space-y-2 text-sm">
              <p>
                <strong>Este informe:</strong> {PRICING.report.label}.
              </p>
              <p>
                <strong>Resolución del alta</strong> (por obligación y país):{' '}
                {PRICING.resolution.min}–{PRICING.resolution.max} {PRICING.resolution.currency},
                cobrado por adelantado.
              </p>
              <p>
                <strong>Vigilancia posterior:</strong> {PRICING.monitoring.min}–
                {PRICING.monitoring.max} {PRICING.monitoring.currency} al mes.
              </p>
              <p className="text-slate-600">{SERVICE_COMMITMENTS.reportDelivery}</p>
              <p className="text-slate-600">{SERVICE_COMMITMENTS.resolutionStart}</p>
              <p className="font-medium text-amber-900">{AUTHORITY_LEAD_TIME_UNKNOWN}</p>
              <p className="text-slate-600">
                Obligaciones detectadas: {result.summary.totalObligations} en{' '}
                {result.summary.countriesCovered} país(es). Críticas:{' '}
                {result.summary.criticalCount}.
              </p>
            </div>
          </Section>

          {/* 5 */}
          <Section n={5} title={REPORT_CTA_LABEL}>
            <a
              className="btn-primary w-full sm:w-auto"
              href={`mailto:${BRAND.contactEmail}?subject=${encodeURIComponent(
                `Quiero resolverlo — ${report.reference}`,
              )}`}
            >
              {REPORT_CTA_LABEL}
            </a>
          </Section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

function ObligationHeader({ o }: { o: AppliedObligation }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold">
          {COUNTRY_LABELS[o.rule.country]} · {WASTE_STREAM_LABELS[o.rule.stream]}
        </h3>
        <RiskPill risk={o.risk} />
      </div>
      <p className="mt-1 text-sm text-slate-700">{o.rule.authorityName}</p>
      {!o.verified && (
        <div className="mt-2">
          <UnverifiedBadge />
        </div>
      )}
      <p className="sr-only">Nivel de riesgo: {RISK_LABELS[o.risk]}</p>
    </>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 border-b border-brand-600 pb-2 text-xl font-bold text-brand-700">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="font-semibold text-slate-500 sm:w-64 sm:shrink-0">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="max-w-md">{children}</div>
    </div>
  );
}
