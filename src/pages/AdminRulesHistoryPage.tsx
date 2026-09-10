import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { storage, type Report } from '../lib/storage';
import {
  changesSince,
  CHANGE_TYPE_LABELS,
  describeVersion,
  isMaterial,
  type RuleVersion,
} from '../lib/rulesHistory';
import { COUNTRY_LABELS, WASTE_STREAM_LABELS, type CountryCode } from '../types/domain';

/**
 * Historial de la base de reglas.
 * Es lo que hace que la suscripción de vigilancia tenga algo que vender.
 */
export default function AdminRulesHistoryPage() {
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState<CountryCode | ''>('');
  const [onlyMaterial, setOnlyMaterial] = useState(false);
  const [since, setSince] = useState('');
  const [reportId, setReportId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([storage.listRuleVersions(), storage.listReports()])
      .then(([v, r]) => {
        setVersions(v);
        setReports(r);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar el historial.'))
      .finally(() => setLoading(false));
  }, []);

  /** Informe elegido: acota el historial a lo que salía en ÉL. */
  const report = reports.find((r) => r.id === reportId) ?? null;

  const scoped = useMemo(() => {
    const from = report ? report.createdAt : since ? `${since}T00:00:00.000Z` : '';
    const ruleIds = report ? report.result.obligations.map((o) => o.rule.id) : undefined;
    if (!from) {
      return {
        versions: versions.filter((v) => !ruleIds || ruleIds.includes(v.ruleId)),
        material: [] as RuleVersion[],
        ruleIds: [] as string[],
      };
    }
    return changesSince(versions, from, ruleIds);
  }, [versions, since, report]);

  const visible = scoped.versions.filter((v) => {
    if (country && !v.payload.country.startsWith(country)) return false;
    if (onlyMaterial && !isMaterial(v)) return false;
    return true;
  });

  /** El resumen que se le pega al suscriptor en un correo. */
  const summary = useMemo(() => {
    if (!report) return '';
    const material = scoped.material;
    if (material.length === 0) {
      return `Desde tu informe ${report.reference} no ha cambiado nada que te afecte. Seguimos vigilando.`;
    }
    return [
      `Desde tu informe ${report.reference} han cambiado ${material.length} obligación(es) que te afectan:`,
      '',
      ...material.map((v) => `- ${describeVersion(v)}`),
      '',
      'Si quieres, lo repasamos y actualizamos tu informe.',
    ].join('\n');
  }, [report, scoped.material]);

  return (
    <AdminLayout title="Historial de reglas">
      <p className="max-w-3xl text-sm text-slate-600">
        Cada alta, cambio y baja de una obligación queda aquí con el detalle de qué campo cambió.
        Es lo que convierte la vigilancia de 39 $/mes en algo que se puede enseñar: sin este
        registro, «te avisamos si cambia algo» no se puede demostrar.
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-alert">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Desde la fecha</span>
          <input
            type="date"
            className="field"
            value={since}
            disabled={Boolean(report)}
            onChange={(e) => setSince(e.target.value)}
          />
        </label>
        <label className="text-sm lg:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">
            O desde el informe de un cliente
          </span>
          <select className="field" value={reportId} onChange={(e) => setReportId(e.target.value)}>
            <option value="">Todos los cambios</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.reference} — {new Date(r.createdAt).toLocaleDateString('es-ES')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">País</span>
          <select
            className="field"
            value={country}
            onChange={(e) => setCountry(e.target.value as CountryCode | '')}
          >
            <option value="">Todos</option>
            {(Object.keys(COUNTRY_LABELS) as CountryCode[]).map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={onlyMaterial}
          onChange={(e) => setOnlyMaterial(e.target.checked)}
        />
        <span>
          Solo lo que afecta al cliente{' '}
          <span className="text-slate-500">
            (cambia lo que tiene que hacer; deja fuera notas internas, fuente y peso)
          </span>
        </span>
      </label>

      {report && (
        <div className="mt-6 rounded-xl border border-brand-600 bg-brand-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold">Aviso de vigilancia para {report.reference}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                navigator.clipboard
                  .writeText(summary)
                  .then(() => setCopied(true))
                  .catch(() => setCopied(false));
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Copiado' : 'Copiar aviso'}
            </button>
          </div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-700">{summary}</pre>
          <p className="mt-3 text-xs text-slate-600">
            Se compara contra las {report.result.obligations.length} obligación(es) que salían en
            ese informe, no contra toda la base: al cliente solo le interesa lo suyo.
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-500">
        {loading ? 'Cargando…' : `${visible.length} entrada(s) de ${versions.length}.`}
      </p>

      {!loading && versions.length === 0 && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Todavía no hay historial. Se llena solo en cuanto guardes o cambies una obligación desde
          «Rellenar reglas».
        </p>
      )}

      <ol className="mt-4 space-y-4">
        {visible.map((version) => (
          <li key={version.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{version.payload.authorityName}</p>
                <p className="text-xs text-slate-500">
                  {COUNTRY_LABELS[version.payload.country]} ·{' '}
                  {WASTE_STREAM_LABELS[version.payload.stream]} ·{' '}
                  <span className="font-mono">{version.ruleId}</span>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    version.changeType === 'baja'
                      ? 'bg-red-100 text-red-900'
                      : version.changeType === 'alta'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {CHANGE_TYPE_LABELS[version.changeType]}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(version.changedAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {version.changes.length > 0 && (
              <table className="mt-4 w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-1 pr-3 font-semibold">Campo</th>
                    <th className="py-1 pr-3 font-semibold">Antes</th>
                    <th className="py-1 font-semibold">Después</th>
                  </tr>
                </thead>
                <tbody>
                  {version.changes.map((change) => (
                    <tr key={change.field} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-3 font-medium">
                        {change.label}
                        {!change.material && (
                          <span className="ml-1 text-xs font-normal text-slate-400">(interno)</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-slate-500 line-through">{change.before}</td>
                      <td className="py-2 font-medium">{change.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        ))}
      </ol>
    </AdminLayout>
  );
}
