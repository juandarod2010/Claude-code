import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  buildAbReport,
  buildWeeklySeries,
  MIN_SAMPLE_PER_VARIANT,
  type AbReport,
  type VariantStats,
  type WeeklyPoint,
} from '../lib/abStats';
import { storage } from '../lib/storage';
import { VARIANT_DESCRIPTION } from '../lib/prospecting/templates';

/** Comparación de las variantes A y B: prospección y conversión. */
export default function AdminAbPage() {
  const [report, setReport] = useState<AbReport | null>(null);
  const [series, setSeries] = useState<WeeklyPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([storage.listProspects(), storage.listLeads()])
      .then(([prospects, leads]) => {
        setReport(buildAbReport(prospects, leads));
        setSeries(buildWeeklySeries(prospects));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar los datos.'));
  }, []);

  return (
    <AdminLayout title="Variantes A y B">
      <p className="max-w-3xl text-sm text-slate-600">
        Cuenta lo que hay. No hace inferencia estadística a propósito: con las muestras que vas a
        manejar al principio, un cálculo de significación daría una falsa sensación de certeza. Lo
        que sí te dice es cuándo la muestra todavía no da para concluir nada.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-alert">
          {error}
        </p>
      )}

      {!report ? (
        <p className="mt-6 text-sm text-slate-500">Cargando…</p>
      ) : (
        <>
          <div
            className={`mt-6 rounded-xl border p-5 ${
              report.verdict.kind === 'ventaja'
                ? 'border-brand-600 bg-brand-50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Lectura</p>
            <p className="mt-2 text-base text-ink">{report.verdict.message}</p>
            <p className="mt-3 text-xs text-slate-500">
              {report.totalSent} mensaje(s) registrado(s), {report.totalResponded} respuesta(s).
              Umbral mínimo por variante: {MIN_SAMPLE_PER_VARIANT}.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <VariantCard stats={report.A} title={VARIANT_DESCRIPTION.A} />
            <VariantCard stats={report.B} title={VARIANT_DESCRIPTION.B} />
          </div>

          <WeeklySeries points={series} />

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <p className="font-semibold text-ink">Cómo se alimenta esto</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                La variante se asigna sola al registrar un prospecto en <strong>Prospección</strong>:
                alterna A y B. Elegirla a ojo rompería la medición.
              </li>
              <li>
                Marca «¿Respondió?» en la tabla de prospectos cuando te contesten. Es el único dato
                que tienes que acordarte de meter.
              </li>
              <li>
                La conversión y los ingresos salen del estado y del importe que anotes en cada lead
                desde <strong>Leads</strong>.
              </li>
            </ul>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function WeeklySeries({ points }: { points: WeeklyPoint[] }) {
  if (points.length === 0) return null;

  const pct = (value: number) => `${Math.round(value * 1000) / 10} %`;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">Semana a semana</h2>
      <p className="mt-1 text-sm text-slate-600">
        El acumulado esconde lo que más importa: si una variante dejó de funcionar el mes pasado,
        la media sigue diciendo que va bien. Solo salen las semanas con envíos.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-500">
              <th className="py-2 pr-3 font-semibold">Semana</th>
              <th className="py-2 pr-3 font-semibold">A — enviados</th>
              <th className="py-2 pr-3 font-semibold">A — respuesta</th>
              <th className="py-2 pr-3 font-semibold">B — enviados</th>
              <th className="py-2 font-semibold">B — respuesta</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.week} className="border-b border-slate-200">
                <td className="py-2 pr-3 font-mono text-xs">{point.week}</td>
                <td className="py-2 pr-3">{point.A.sent}</td>
                <td className="py-2 pr-3 font-semibold">
                  {point.A.sent ? pct(point.A.rate) : '—'}
                </td>
                <td className="py-2 pr-3">{point.B.sent}</td>
                <td className="py-2 font-semibold">{point.B.sent ? pct(point.B.rate) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Con pocos envíos por semana, estos porcentajes saltan mucho de una a otra. Míralos como
        tendencia, no como medición.
      </p>
    </section>
  );
}

function VariantCard({ stats, title }: { stats: VariantStats; title: string }) {
  const pct = (value: number) => `${Math.round(value * 1000) / 10} %`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold">{title}</h2>

      <div className="mt-4 flex items-baseline gap-3">
        <p className="text-4xl font-bold">{pct(stats.responseRate)}</p>
        <p className="text-sm text-slate-500">tasa de respuesta</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${Math.min(100, stats.responseRate * 100)}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <Row label="Mensajes enviados" value={String(stats.sent)} />
        <Row label="Respuestas" value={String(stats.responded)} />
        <Row label="Leads asignados" value={String(stats.leads)} />
        <Row label="Convertidos" value={`${stats.converted} (${pct(stats.conversionRate)})`} />
        <Row label="Ingresos" value={`${stats.revenue.toLocaleString('es-ES')} $`} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold text-ink">{value}</dd>
    </div>
  );
}
