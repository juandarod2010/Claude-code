import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import type { ObligationRule } from '../data/rules/schema';
import { loadEffectiveRules } from '../lib/rulesSource';
import { validateRule } from '../modules/complyo/rules-validator';
import {
  COUNTRIES,
  COUNTRY_LABELS,
  WASTE_STREAMS,
  WASTE_STREAM_LABELS,
  type CountryCode,
  type WasteStream,
} from '../types/domain';

type VerifiedFilter = '' | 'si' | 'no';

const TOTAL_EXPECTED = COUNTRIES.length * WASTE_STREAMS.length;

/** Estado de las 18 combinaciones país × flujo. */
export default function AdminRulesStatusPage() {
  const [rules, setRules] = useState<ObligationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<CountryCode | ''>('');
  const [stream, setStream] = useState<WasteStream | ''>('');
  const [verified, setVerified] = useState<VerifiedFilter>('');

  useEffect(() => {
    loadEffectiveRules()
      .then(setRules)
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const byCombo = new Map<string, ObligationRule[]>();
    for (const rule of rules) {
      const key = `${rule.country}:${rule.stream}`;
      byCombo.set(key, [...(byCombo.get(key) ?? []), rule]);
    }
    return COUNTRIES.flatMap((c) =>
      WASTE_STREAMS.map((s) => ({
        country: c,
        stream: s,
        rules: byCombo.get(`${c}:${s}`) ?? [],
      })),
    );
  }, [rules]);

  const filtered = rows.filter((row) => {
    if (country && row.country !== country) return false;
    if (stream && row.stream !== stream) return false;
    const isVerified = row.rules.length > 0 && row.rules.every((r) => r.verified);
    if (verified === 'si' && !isVerified) return false;
    if (verified === 'no' && isVerified) return false;
    return true;
  });

  const complete = rows.filter((r) => r.rules.length > 0 && r.rules.every((x) => x.verified)).length;

  return (
    <AdminLayout
      title="Estado de reglas"
      actions={
        <div className="flex gap-3">
          <Link to="/admin/fill-rules" className="btn-secondary">
            Ver guía EUR-Lex
          </Link>
          <Link to="/admin/fill-rules" className="btn-primary">
            Rellenar una obligación
          </Link>
        </div>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-2xl font-bold">
          {complete} de {TOTAL_EXPECTED} obligaciones completas
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${(complete / TOTAL_EXPECTED) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Una combinación cuenta como completa cuando tiene al menos una obligación guardada y
          todas están marcadas como verificadas. Mientras no lo estén, el informe las tapa con la
          etiqueta de pendiente de verificación.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">País</span>
          <select className="field" value={country} onChange={(e) => setCountry(e.target.value as CountryCode | '')}>
            <option value="">Todos</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Flujo</span>
          <select className="field" value={stream} onChange={(e) => setStream(e.target.value as WasteStream | '')}>
            <option value="">Todos</option>
            {WASTE_STREAMS.map((s) => (
              <option key={s} value={s}>
                {WASTE_STREAM_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Verificación</span>
          <select className="field" value={verified} onChange={(e) => setVerified(e.target.value as VerifiedFilter)}>
            <option value="">Todas</option>
            <option value="si">Solo verificadas</option>
            <option value="no">Solo pendientes</option>
          </select>
        </label>
      </div>

      <p className="mt-5 text-sm text-slate-500">{loading ? 'Cargando…' : `${filtered.length} combinación(es).`}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-300 text-left text-slate-500">
              <th className="py-2 pr-3 font-semibold">País</th>
              <th className="py-2 pr-3 font-semibold">Flujo</th>
              <th className="py-2 pr-3 font-semibold">Registro / autoridad</th>
              <th className="py-2 pr-3 font-semibold">Verificado</th>
              <th className="py-2 pr-3 font-semibold">Última comprobación</th>
              <th className="py-2 font-semibold">Problemas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              if (row.rules.length === 0) {
                return (
                  <tr key={`${row.country}-${row.stream}`} className="border-b border-slate-200">
                    <td className="py-2 pr-3 font-medium">{COUNTRY_LABELS[row.country]}</td>
                    <td className="py-2 pr-3">{WASTE_STREAM_LABELS[row.stream]}</td>
                    <td className="py-2 pr-3 text-slate-400" colSpan={4}>
                      Sin obligación cargada
                    </td>
                  </tr>
                );
              }
              return row.rules.map((rule) => {
                const validation = validateRule(rule);
                return (
                  <tr key={rule.id} className="border-b border-slate-200 align-top">
                    <td className="py-2 pr-3 font-medium">{COUNTRY_LABELS[row.country]}</td>
                    <td className="py-2 pr-3">{WASTE_STREAM_LABELS[row.stream]}</td>
                    <td className="py-2 pr-3">
                      {rule.authorityName}
                      <span className="block font-mono text-xs text-slate-400">{rule.id}</span>
                    </td>
                    <td className="py-2 pr-3">
                      {rule.verified ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          Sí
                        </span>
                      ) : (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{rule.sourceCheckedAt}</td>
                    <td className="py-2">
                      {validation.errors.length === 0 && validation.warnings.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <ul className="space-y-0.5 text-xs">
                          {validation.errors.map((e) => (
                            <li key={e} className="text-alert">
                              {e}
                            </li>
                          ))}
                          {validation.warnings.map((w) => (
                            <li key={w} className="text-amber-800">
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
