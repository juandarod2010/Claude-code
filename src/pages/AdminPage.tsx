import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminGate from '../components/AdminGate';
import { BRAND } from '../config/brand';
import { storage, type Lead, type Report } from '../lib/storage';
import { COUNTRIES, COUNTRY_LABELS, type CountryCode } from '../types/domain';

/** Panel interno: lista de leads con filtros. Solo para el operador. */
export default function AdminPage() {
  return (
    <AdminGate>
      <AdminContent />
    </AdminGate>
  );
}

function AdminContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reports, setReports] = useState<Record<string, Report | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState<CountryCode | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await storage.listLeads();
        setLeads(list);
        const entries = await Promise.all(
          list.map(async (l) => [l.id, await storage.getReportByLead(l.id)] as const),
        );
        setReports(Object.fromEntries(entries));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar los leads.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      leads.filter((lead) => {
        if (country && !lead.answers.countries.includes(country)) return false;
        const day = lead.createdAt.slice(0, 10);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      }),
    [leads, country, from, to],
  );

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{BRAND.name} · leads</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">
              almacenamiento: {storage.mode}
            </span>
            <Link to="/prospeccion" className="btn-secondary">
              Prospección
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">País de destino</span>
            <select
              className="field"
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode | '')}
            >
              <option value="">Todos</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Desde</span>
            <input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Hasta</span>
            <input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-alert">
            {error}
          </p>
        )}

        <p className="mt-6 text-sm text-slate-500">
          {loading ? 'Cargando…' : `${filtered.length} lead(s) de ${leads.length}.`}
        </p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-slate-500">
                <th className="py-2 pr-3 font-semibold">Fecha</th>
                <th className="py-2 pr-3 font-semibold">Correo</th>
                <th className="py-2 pr-3 font-semibold">Empresa</th>
                <th className="py-2 pr-3 font-semibold">Países</th>
                <th className="py-2 pr-3 font-semibold">UE</th>
                <th className="py-2 pr-3 font-semibold">Volumen</th>
                <th className="py-2 font-semibold">Informe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const report = reports[lead.id];
                return (
                  <tr key={lead.id} className="border-b border-slate-200 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleString('es-ES')}
                    </td>
                    <td className="py-2 pr-3">{lead.email}</td>
                    <td className="py-2 pr-3">{lead.companyName ?? '—'}</td>
                    <td className="py-2 pr-3">
                      {lead.answers.countries.map((c) => COUNTRY_LABELS[c]).join(', ')}
                    </td>
                    <td className="py-2 pr-3">{lead.answers.establishedInEU ? 'Sí' : 'No'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{lead.answers.volume}</td>
                    <td className="py-2">
                      {report ? (
                        <Link className="text-brand-600 underline" to={`/informe/${report.id}`}>
                          Ver informe
                        </Link>
                      ) : (
                        <span className="text-slate-400">sin informe</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No hay leads con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
