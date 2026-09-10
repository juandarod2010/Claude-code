import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { loadDraft, saveDraft, type PoaDraft } from '../lib/poaDraft';
import { storage, type Lead } from '../lib/storage';
import { analyzeSuspensionEmail } from '../modules/appeals/analyzer';
import {
  emptyPlan,
  estimateSuccess,
  isSuspensionType,
  missingPlanParts,
  renderPlanAsJson,
  renderPlanAsMarkdown,
  renderPlanAsText,
  SUSPENSION_TYPES,
  type Correction,
  type PlanOfAction,
  type PreventiveMeasure,
  type SuspensionType,
} from '../modules/appeals/poa-template';

type Format = 'markdown' | 'texto' | 'json';

const FORMAT_LABELS: Record<Format, string> = {
  markdown: 'Markdown',
  texto: 'Texto plano',
  json: 'JSON',
};

/**
 * Editor del Plan of Action.
 *
 * El documento que se envía a Amazon y por el que cobras. Esta pantalla no
 * redacta por ti: estructura lo que escribes, te dice qué falta y saca el
 * documento limpio. La causa raíz la pone quien conoce el caso.
 */
export default function AdminPoaPage() {
  return <PoaEditor />;
}

function PoaEditor() {
  const [params, setParams] = useSearchParams();
  const leadId = params.get('lead');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [plan, setPlan] = useState<PlanOfAction>(() => emptyPlan());
  const [type, setType] = useState<SuspensionType>('unknown');
  const [format, setFormat] = useState<Format>('markdown');
  const [saved, setSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    storage
      .listLeads()
      .then((list) => setLeads(list.filter((l) => l.type === 'appeal')))
      .catch(() => setLeads([]));
  }, []);

  /** Al cambiar de caso: primero el borrador guardado; si no hay, el lead. */
  useEffect(() => {
    const draft = loadDraft(leadId);
    if (draft) {
      setPlan(draft.plan);
      setType(draft.type);
      return;
    }
    if (!leadId) {
      setPlan(emptyPlan());
      setType('unknown');
      return;
    }
    storage.getLead(leadId).then((lead) => {
      if (!lead || lead.type !== 'appeal') return;
      const detected = lead.appeal?.suspensionType ?? 'unknown';
      setType(isSuspensionType(detected) ? detected : 'unknown');
      setPlan({
        ...emptyPlan(lead.companyName ?? lead.email, lead.appeal?.suspensionTypeLabel ?? ''),
        daysSuspended: lead.appeal?.daysSuspended ?? 0,
      });
    });
  }, [leadId]);

  /** Pistas del analizador para no arrancar de una página en blanco. */
  const hints = useMemo(() => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.appeal?.story) return [];
    return analyzeSuspensionEmail(lead.appeal.story).nextSteps;
  }, [leads, leadId]);

  const score = useMemo(() => estimateSuccess(plan, type), [plan, type]);
  const missing = useMemo(() => missingPlanParts(plan), [plan]);
  const scoredPlan: PlanOfAction = useMemo(
    () => ({ ...plan, estimatedSuccess: score }),
    [plan, score],
  );

  const output = useMemo(() => {
    if (format === 'markdown') return renderPlanAsMarkdown(scoredPlan, type);
    if (format === 'texto') return renderPlanAsText(scoredPlan, type);
    return renderPlanAsJson(scoredPlan, type);
  }, [scoredPlan, type, format]);

  function update(patch: Partial<PlanOfAction>) {
    setPlan((p) => ({ ...p, ...patch }));
    setSaved(null);
  }

  function persist() {
    const draft: Omit<PoaDraft, 'updatedAt'> = { plan: scoredPlan, type, leadId };
    const stored = saveDraft(draft);
    setSaved(stored.updatedAt);
  }

  function download() {
    const extension = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
    const name = (plan.sellerName || 'plan-of-action').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poa-${name}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminLayout
      title="Plan of Action"
      actions={
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={persist}>
            Guardar borrador
          </button>
          <button type="button" className="btn-primary" onClick={download}>
            Descargar
          </button>
        </div>
      }
    >
      <p className="max-w-3xl text-sm text-slate-600">
        Esto no redacta por ti: ordena lo que escribes y te dice qué falta. El revisor busca tres
        cosas en este orden — causa raíz, correcciones con prueba, y medidas preventivas que se
        puedan comprobar. Lo demás sobra.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-slate-600">Caso</span>
          <select
            className="field"
            value={leadId ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              setParams(value ? { lead: value } : {});
            }}
          >
            <option value="">Caso suelto (sin lead)</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.companyName ?? lead.email} — {lead.appeal?.suspensionTypeLabel ?? 'sin clasificar'}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Tipo de suspensión</span>
          <select
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value as SuspensionType)}
          >
            {(Object.keys(SUSPENSION_TYPES) as SuspensionType[]).map((t) => (
              <option key={t} value={t}>
                {SUSPENSION_TYPES[t].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* ------------------------------------------------ Formulario */}
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Nombre del vendedor</span>
              <input
                className="field"
                value={plan.sellerName}
                onChange={(e) => update({ sellerName: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-600">Días suspendido</span>
              <input
                className="field"
                type="number"
                min={0}
                value={plan.daysSuspended}
                onChange={(e) => update({ daysSuspended: Number(e.target.value) || 0 })}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">
              Motivo, tal y como lo llama Amazon
            </span>
            <input
              className="field"
              value={plan.suspensionReason}
              onChange={(e) => update({ suspensionReason: e.target.value })}
            />
          </label>

          <ListField
            label="1. Causa raíz"
            hint="No «un proveedor falló», sino qué parte de tu proceso dejó que ese fallo llegara al cliente. Una por línea."
            values={plan.rootCauses}
            onChange={(rootCauses) => update({ rootCauses })}
            placeholder="El control de calidad de salida no cubría los envíos directos del proveedor."
          />

          {hints.length > 0 && (
            <details className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-slate-700">
                Pistas del analizador para este caso
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                {hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Son puntos de partida, no la causa raíz. Esa la escribes tú.
              </p>
            </details>
          )}

          <CorrectionsField
            corrections={plan.correctionsTaken}
            onChange={(correctionsTaken) => update({ correctionsTaken })}
          />

          <PreventiveField
            measures={plan.preventiveMeasures}
            onChange={(preventiveMeasures) => update({ preventiveMeasures })}
          />
        </section>

        {/* --------------------------------------------------- Salida */}
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">Puntuación del plan</p>
              <p className="text-3xl font-bold">{score}/100</p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  score >= 70 ? 'bg-green-600' : score >= 45 ? 'bg-amber-500' : 'bg-alert'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Mide lo <strong>completo</strong> que está este plan, no la probabilidad de que te
              reactiven. Amazon no publica tasas de aceptación y nadie puede garantizarte un
              resultado.
            </p>
          </div>

          {missing.length > 0 ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">Le falta:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-amber-900">
                {missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-medium text-green-800">
              Las tres partes están y todas las correcciones llevan prueba.
            </p>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border px-3 py-1.5 text-sm ${
                      format === f
                        ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard
                    .writeText(output)
                    .then(() => setCopied(true))
                    .catch(() => setCopied(false));
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>

            <pre className="mt-3 max-h-[32rem] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
              {output}
            </pre>
          </div>

          {saved && (
            <p className="text-sm text-green-700">
              Borrador guardado a las {new Date(saved).toLocaleTimeString('es-ES')}. Vive en este
              navegador: los planes terminados, descárgalos.
            </p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

function ListField({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-600">{label}</span>
      <textarea
        className="field"
        rows={3}
        placeholder={placeholder}
        value={values.join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n').filter((v) => v !== ''))}
      />
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    </label>
  );
}

function CorrectionsField({
  corrections,
  onChange,
}: {
  corrections: Correction[];
  onChange: (value: Correction[]) => void;
}) {
  function set(index: number, patch: Partial<Correction>) {
    onChange(corrections.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-600">
        2. Correcciones ya realizadas
      </legend>
      <p className="mb-3 text-xs text-slate-500">
        En pasado y con prueba. Una corrección sin prueba documental baja la puntuación, porque al
        revisor no le vale tu palabra.
      </p>
      <div className="space-y-3">
        {corrections.map((correction, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-3">
            <input
              className="field"
              placeholder="Qué has corregido"
              value={correction.action}
              onChange={(e) => set(index, { action: e.target.value })}
            />
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                className="field"
                placeholder="Prueba: URL, expediente, documento"
                value={correction.evidence}
                onChange={(e) => set(index, { evidence: e.target.value })}
              />
              <input
                className="field"
                type="date"
                value={correction.completedDate}
                onChange={(e) => set(index, { completedDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="mt-2 text-xs text-alert underline"
              onClick={() => onChange(corrections.filter((_, i) => i !== index))}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-secondary mt-3"
        onClick={() => onChange([...corrections, { action: '', evidence: '', completedDate: '' }])}
      >
        Añadir corrección
      </button>
    </fieldset>
  );
}

function PreventiveField({
  measures,
  onChange,
}: {
  measures: PreventiveMeasure[];
  onChange: (value: PreventiveMeasure[]) => void;
}) {
  function set(index: number, patch: Partial<PreventiveMeasure>) {
    onChange(measures.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-slate-600">3. Medidas preventivas</legend>
      <p className="mb-3 text-xs text-slate-500">
        Un control que se pueda comprobar, no una promesa. Di también quién lo comprueba y cada
        cuánto.
      </p>
      <div className="space-y-3">
        {measures.map((measure, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-3">
            <input
              className="field"
              placeholder="La medida"
              value={measure.measure}
              onChange={(e) => set(index, { measure: e.target.value })}
            />
            <input
              className="field mt-2"
              placeholder="Cómo se implementa y quién lo comprueba"
              value={measure.implementation}
              onChange={(e) => set(index, { implementation: e.target.value })}
            />
            <button
              type="button"
              className="mt-2 text-xs text-alert underline"
              onClick={() => onChange(measures.filter((_, i) => i !== index))}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-secondary mt-3"
        onClick={() => onChange([...measures, { measure: '', implementation: '' }])}
      >
        Añadir medida
      </button>
    </fieldset>
  );
}
