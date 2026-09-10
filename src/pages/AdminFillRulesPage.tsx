import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import type { ObligationRule } from '../data/rules/schema';
import { storage, type StoredRule } from '../lib/storage';
import EurLexGuide from '../modules/complyo/eur-lex-guide';
import {
  REPORTING_FREQUENCIES,
  validateRule,
  type ValidationResult,
} from '../modules/complyo/rules-validator';
import {
  COUNTRIES,
  COUNTRY_LABELS,
  WASTE_STREAMS,
  WASTE_STREAM_LABELS,
  type CountryCode,
  type WasteStream,
} from '../types/domain';

const STREAM_SLUG: Record<WasteStream, string> = {
  envases: 'envases',
  aparatos_electricos: 'aee',
  pilas: 'pilas',
};

function emptyForm(): ObligationRule {
  return {
    id: '',
    country: 'DE',
    stream: 'envases',
    authorityName: '',
    complianceSchemeName: '',
    representativeRequiredForNonEstablished: false,
    reportingFrequency: '',
    requiredData: [''],
    nonComplianceConsequence: '',
    appliesToCategories: 'all',
    severityWeight: 60,
    sourceUrl: '',
    sourceCheckedAt: new Date().toISOString().slice(0, 10),
    verified: false,
    notes: '',
  };
}

/** Alta y edición de obligaciones sin tocar código. */
export default function AdminFillRulesPage() {
  const [form, setForm] = useState<ObligationRule>(emptyForm);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [stored, setStored] = useState<StoredRule[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    storage
      .listStoredRules()
      .then(setStored)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar las reglas.'));
  }, []);

  /** El identificador se propone solo a partir de país y flujo. */
  const suggestedId = useMemo(
    () => `${form.country.toLowerCase()}-${STREAM_SLUG[form.stream]}-registro`,
    [form.country, form.stream],
  );

  function set<K extends keyof ObligationRule>(key: K, value: ObligationRule[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setValidation(null);
    setSaved(null);
  }

  function validate(): ValidationResult {
    const candidate = { ...form, id: form.id.trim() || suggestedId };
    const result = validateRule(candidate);
    setValidation(result);
    return result;
  }

  async function save() {
    const result = validate();
    if (!result.isValid) return;
    setError(null);
    try {
      const candidate: ObligationRule = {
        ...form,
        id: form.id.trim() || suggestedId,
        requiredData: form.requiredData.map((d) => d.trim()).filter(Boolean),
        complianceSchemeName: form.complianceSchemeName?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };
      const result2 = await storage.saveStoredRule(candidate);
      setStored((list) => [result2, ...list.filter((r) => r.id !== result2.id)]);
      setSaved(result2.id);
      setForm(emptyForm());
      setValidation(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido guardar.');
    }
  }

  function edit(rule: StoredRule) {
    const { updatedAt: _updatedAt, ...clean } = rule;
    void _updatedAt;
    setForm({ ...clean, requiredData: clean.requiredData.length ? clean.requiredData : [''] });
    setValidation(null);
    setSaved(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id: string) {
    await storage.deleteStoredRule(id);
    setStored((list) => list.filter((r) => r.id !== id));
  }

  return (
    <AdminLayout
      title="Rellenar reglas"
      actions={
        <button type="button" className="btn-secondary" onClick={() => setShowGuide((v) => !v)}>
          {showGuide ? 'Ocultar guía EUR-Lex' : 'Ver guía EUR-Lex'}
        </button>
      }
    >
      <p className="max-w-3xl text-sm text-slate-600">
        Lo que guardes aquí va a la base de datos y sustituye a la obligación del código que tenga
        el mismo identificador. Así puedes ir cambiando los ejemplos uno a uno sin desplegar.
        Copia los textos literales de la fuente: no los resumas ni los traduzcas.
      </p>

      {showGuide && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <EurLexGuide />
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="País">
              <select
                className="field"
                value={form.country}
                onChange={(e) => set('country', e.target.value as CountryCode)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_LABELS[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Flujo de residuo">
              <select
                className="field"
                value={form.stream}
                onChange={(e) => set('stream', e.target.value as WasteStream)}
              >
                {WASTE_STREAMS.map((s) => (
                  <option key={s} value={s}>
                    {WASTE_STREAM_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Identificador" hint={`Si lo dejas vacío se usa: ${suggestedId}`}>
            <input
              className="field"
              value={form.id}
              placeholder={suggestedId}
              onChange={(e) => set('id', e.target.value)}
            />
          </Field>

          <Field label="Nombre del registro o autoridad" hint="Literal, en el idioma original.">
            <input
              className="field"
              value={form.authorityName}
              onChange={(e) => set('authorityName', e.target.value)}
            />
          </Field>

          <Field label="Organismo de responsabilidad ampliada (si el país lo separa)">
            <input
              className="field"
              value={form.complianceSchemeName ?? ''}
              onChange={(e) => set('complianceSchemeName', e.target.value)}
            />
          </Field>

          <Field label="¿Representante autorizado obligatorio para no establecidos?">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={form.representativeRequiredForNonEstablished}
                onChange={(e) => set('representativeRequiredForNonEstablished', e.target.checked)}
              />
              <span>{form.representativeRequiredForNonEstablished ? 'Sí, es obligatorio' : 'No es obligatorio'}</span>
            </label>
          </Field>

          <Field label="Periodicidad de declaración">
            <input
              className="field"
              list="periodicidades"
              value={form.reportingFrequency}
              onChange={(e) => set('reportingFrequency', e.target.value)}
            />
            <datalist id="periodicidades">
              {REPORTING_FREQUENCIES.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </Field>

          <Field label="Datos que exige" hint="Uno por línea.">
            <textarea
              className="field"
              rows={4}
              value={form.requiredData.join('\n')}
              onChange={(e) => set('requiredData', e.target.value.split('\n'))}
            />
          </Field>

          <Field label="Consecuencia del incumplimiento" hint="Sin importes salvo que la fuente los diga.">
            <textarea
              className="field"
              rows={3}
              value={form.nonComplianceConsequence}
              onChange={(e) => set('nonComplianceConsequence', e.target.value)}
            />
          </Field>

          <Field label="URL de la fuente oficial" hint="Enlace profundo, no la portada.">
            <input
              className="field"
              type="url"
              placeholder="https://…"
              value={form.sourceUrl}
              onChange={(e) => set('sourceUrl', e.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha en que lo verificaste">
              <input
                className="field"
                type="date"
                value={form.sourceCheckedAt}
                onChange={(e) => set('sourceCheckedAt', e.target.value)}
              />
            </Field>
            <Field label="Peso de severidad" hint="Criterio comercial tuyo. Solo ordena el informe.">
              <input
                className="field"
                type="number"
                value={form.severityWeight}
                onChange={(e) => set('severityWeight', Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Notas internas">
            <textarea
              className="field"
              rows={2}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Field>

          <Field label="¿Verificado?">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={form.verified}
                onChange={(e) => set('verified', e.target.checked)}
              />
              <span>
                Marca esto solo si <strong>tú</strong> has leído la página que has enlazado. Es tu
                firma: mientras no lo marques, el informe la tapa con la etiqueta de pendiente.
              </span>
            </label>
          </Field>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={validate}>
              Validar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={save}
              disabled={validation !== null && !validation.isValid}
            >
              Guardar
            </button>
          </div>

          {error && <p className="text-sm font-medium text-alert">{error}</p>}
          {saved && <p className="text-sm font-medium text-green-700">Guardada la obligación {saved}.</p>}

          {validation && (
            <div className="space-y-2">
              {validation.errors.length > 0 && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                  <p className="text-sm font-bold text-alert">No se puede guardar:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-alert">
                    {validation.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validation.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="text-sm font-bold text-amber-900">Avisos (no bloquean):</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-amber-900">
                    {validation.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validation.isValid && validation.warnings.length === 0 && (
                <p className="text-sm font-medium text-green-700">Todo correcto. Se puede guardar.</p>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold">Obligaciones guardadas ({stored.length})</h2>
          <p className="mt-1 text-sm text-slate-600">
            Estas viven en la base de datos y mandan sobre las del código.
          </p>
          <ul className="mt-4 space-y-3">
            {stored.map((rule) => (
              <li key={rule.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{rule.authorityName}</p>
                    <p className="text-xs text-slate-500">
                      {COUNTRY_LABELS[rule.country]} · {WASTE_STREAM_LABELS[rule.stream]} ·{' '}
                      <span className="font-mono">{rule.id}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      rule.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {rule.verified ? 'Verificada' : 'Pendiente'}
                  </span>
                </div>
                <div className="mt-3 flex gap-3 text-sm">
                  <button type="button" className="text-brand-600 underline" onClick={() => edit(rule)}>
                    Editar
                  </button>
                  <button type="button" className="text-alert underline" onClick={() => remove(rule.id)}>
                    Borrar
                  </button>
                </div>
              </li>
            ))}
            {stored.length === 0 && (
              <li className="text-sm text-slate-500">
                Todavía no has guardado ninguna. Las 18 del código siguen siendo de ejemplo.
              </li>
            )}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
