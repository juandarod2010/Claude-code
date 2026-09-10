import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminGate from '../components/AdminGate';
import { BRAND } from '../config/brand';
import {
  buildMessage,
  MISSING_ITEMS,
  MISSING_ITEM_LABELS,
  nextVariant,
  VARIANT_DESCRIPTION,
  type MissingItem,
} from '../lib/prospecting/templates';
import { storage, type Prospect } from '../lib/storage';
import { COUNTRIES, COUNTRY_LABELS, type CountryCode } from '../types/domain';

/**
 * Prospección ASISTIDA. No hay scraping ni peticiones automáticas a ningún
 * marketplace: el operador abre la ficha a mano, pega la URL o el ASIN y marca
 * qué falta. La herramienta solo redacta el mensaje y registra la variante.
 */
export default function ProspeccionPage() {
  return (
    <AdminGate>
      <ProspeccionContent />
    </AdminGate>
  );
}

function ProspeccionContent() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [listingRef, setListingRef] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [country, setCountry] = useState<CountryCode>('DE');
  const [missing, setMissing] = useState<MissingItem[]>([]);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<Prospect | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storage
      .listProspects()
      .then(setProspects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar prospectos.'));
  }, []);

  /** La variante se decide por alternancia, no a mano: así el A/B es limpio. */
  const variant = useMemo(() => nextVariant(prospects.length), [prospects.length]);

  const messageA = buildMessage('A', { listingRef: listingRef || '(URL o ASIN)', country, missing, sellerName });
  const messageB = buildMessage('B', { listingRef: listingRef || '(URL o ASIN)', country, missing, sellerName });
  const chosen = variant === 'A' ? messageA : messageB;

  const counts = useMemo(
    () => ({
      A: prospects.filter((p) => p.variant === 'A').length,
      B: prospects.filter((p) => p.variant === 'B').length,
    }),
    [prospects],
  );

  async function handleRegister() {
    if (!listingRef.trim()) {
      setError('Pega la URL o el ASIN de la ficha antes de registrar.');
      return;
    }
    setError(null);
    try {
      const prospect = await storage.createProspect({
        listingRef: listingRef.trim(),
        country,
        missingItems: missing,
        variant,
        notes: notes.trim() || null,
      });
      setProspects((p) => [prospect, ...p]);
      setSaved(prospect);
      setListingRef('');
      setSellerName('');
      setMissing([]);
      setNotes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido registrar el prospecto.');
    }
  }

  async function copy(textToCopy: string) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('El navegador ha bloqueado el portapapeles. Copia el texto a mano.');
    }
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{BRAND.name} · prospección</h1>
          <Link to="/admin" className="btn-secondary">
            Volver a leads
          </Link>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Abre la ficha a mano en el navegador, pega aquí la URL o el ASIN y marca qué falta. Esta
          herramienta no consulta ningún marketplace: solo redacta el mensaje.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">URL o ASIN de la ficha</span>
              <input
                className="field"
                value={listingRef}
                onChange={(e) => setListingRef(e.target.value)}
                placeholder="B0XXXXXXXX o https://…"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">
                Nombre del vendedor (opcional)
              </span>
              <input
                className="field"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">País de destino</span>
              <select
                className="field"
                value={country}
                onChange={(e) => setCountry(e.target.value as CountryCode)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-600">
                Qué falta en la ficha
              </legend>
              <div className="space-y-2">
                {MISSING_ITEMS.map((item) => (
                  <label key={item} className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={missing.includes(item)}
                      onChange={() =>
                        setMissing((m) =>
                          m.includes(item) ? m.filter((x) => x !== item) : [...m, item],
                        )
                      }
                    />
                    <span>{MISSING_ITEM_LABELS[item]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">Notas (opcional)</span>
              <textarea
                className="field"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {error && <p className="text-sm font-medium text-alert">{error}</p>}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" onClick={handleRegister}>
                Registrar prospecto ({variant})
              </button>
              <button type="button" className="btn-secondary" onClick={() => copy(chosen)}>
                {copied ? 'Copiado' : `Copiar variante ${variant}`}
              </button>
            </div>

            <p className="text-sm text-slate-500">
              Le toca la <strong>{VARIANT_DESCRIPTION[variant]}</strong>. Enviadas hasta ahora: A ={' '}
              {counts.A}, B = {counts.B}.
            </p>
            {saved && (
              <p className="text-sm text-green-700">
                Registrado {saved.listingRef} con variante {saved.variant}.
              </p>
            )}
          </section>

          <section className="space-y-6">
            <MessageBox
              title={VARIANT_DESCRIPTION.A}
              active={variant === 'A'}
              message={messageA}
              onCopy={() => copy(messageA)}
            />
            <MessageBox
              title={VARIANT_DESCRIPTION.B}
              active={variant === 'B'}
              message={messageB}
              onCopy={() => copy(messageB)}
            />
          </section>
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-bold">Prospectos registrados</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-slate-500">
                  <th className="py-2 pr-3 font-semibold">Fecha</th>
                  <th className="py-2 pr-3 font-semibold">Ficha</th>
                  <th className="py-2 pr-3 font-semibold">País</th>
                  <th className="py-2 pr-3 font-semibold">Variante</th>
                  <th className="py-2 font-semibold">Qué faltaba</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => (
                  <tr key={p.id} className="border-b border-slate-200 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleString('es-ES')}
                    </td>
                    <td className="py-2 pr-3 break-all">{p.listingRef}</td>
                    <td className="py-2 pr-3">
                      {COUNTRY_LABELS[p.country as CountryCode] ?? p.country}
                    </td>
                    <td className="py-2 pr-3 font-semibold">{p.variant}</td>
                    <td className="py-2">{p.missingItems.length}</td>
                  </tr>
                ))}
                {prospects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Todavía no has registrado ningún prospecto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function MessageBox({
  title,
  message,
  active,
  onCopy,
}: {
  title: string;
  message: string;
  active: boolean;
  onCopy: () => void;
}) {
  return (
    <div className={`card ${active ? 'border-brand-600 ring-1 ring-brand-600' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold">
          {title}
          {active && <span className="ml-2 text-xs font-semibold text-brand-600">le toca</span>}
        </h3>
        <button type="button" className="btn-secondary" onClick={onCopy}>
          Copiar
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-slate-700">
        {message}
      </pre>
    </div>
  );
}
