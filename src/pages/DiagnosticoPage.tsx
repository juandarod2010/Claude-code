import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChoiceGrid from '../components/ChoiceGrid';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';
import { BRAND } from '../config/brand';
import { evaluate } from '../lib/engine';
import { storage } from '../lib/storage';
import {
  COUNTRIES,
  COUNTRY_LABELS,
  PACKAGING_MATERIALS,
  PACKAGING_MATERIAL_LABELS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABELS,
  SALES_CHANNELS,
  SALES_CHANNEL_LABELS,
  VOLUME_BANDS,
  VOLUME_BAND_LABELS,
  type CountryCode,
  type DiagnosticAnswers,
  type PackagingMaterial,
  type ProductCategory,
  type SalesChannel,
  type VolumeBand,
} from '../types/domain';

const TOTAL_STEPS = 8;

const toOptions = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function DiagnosticoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [established, setEstablished] = useState<'si' | 'no' | null>(null);
  const [volume, setVolume] = useState<VolumeBand | null>(null);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return countries.length > 0;
      case 2:
        return channels.length > 0;
      case 3:
        return categories.length > 0;
      case 4:
        return materials.length > 0;
      case 5:
        return established !== null;
      case 6:
        return volume !== null;
      case 7:
        return EMAIL_RE.test(email.trim());
      case 8:
        return true;
      default:
        return false;
    }
  }, [step, countries, channels, categories, materials, established, volume, email]);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const answers: DiagnosticAnswers = {
        countries,
        channels,
        categories,
        packagingMaterials: materials,
        establishedInEU: established === 'si',
        volume: volume!,
        email: email.trim().toLowerCase(),
        companyName: companyName.trim() || undefined,
      };
      const lead = await storage.createLead({ answers });
      const report = await storage.createReport({ leadId: lead.id, result: evaluate(answers) });
      navigate(`/informe/${report.id}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? `No se ha podido guardar el diagnóstico: ${e.message}`
          : 'No se ha podido guardar el diagnóstico.',
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 px-5 py-4">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="text-lg font-bold tracking-tight">
            {BRAND.name}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-2xl">
          <ProgressBar step={step} total={TOTAL_STEPS} />

          <div className="mt-7">
            {step === 1 && (
              <Question
                title="¿A qué países de la Unión Europea envías?"
                hint="Marca todos los países de destino. Cada uno tiene su propio registro."
              >
                <ChoiceGrid
                  options={toOptions(COUNTRIES, COUNTRY_LABELS)}
                  selected={countries}
                  onToggle={(v) => setCountries((c) => toggle(c, v))}
                />
              </Question>
            )}

            {step === 2 && (
              <Question title="¿Por qué canales vendes?" hint="Marca todos los que uses.">
                <ChoiceGrid
                  options={toOptions(SALES_CHANNELS, SALES_CHANNEL_LABELS)}
                  selected={channels}
                  onToggle={(v) => setChannels((c) => toggle(c, v))}
                />
              </Question>
            )}

            {step === 3 && (
              <Question
                title="¿Qué tipo de productos vendes?"
                hint="Marca todas las categorías. Determinan qué flujos de residuo te afectan."
              >
                <ChoiceGrid
                  options={toOptions(PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS)}
                  selected={categories}
                  onToggle={(v) => setCategories((c) => toggle(c, v))}
                />
              </Question>
            )}

            {step === 4 && (
              <Question
                title="¿Con qué materiales envías tus productos?"
                hint="Incluye la caja de envío, no solo el envase del producto."
              >
                <ChoiceGrid
                  options={toOptions(PACKAGING_MATERIALS, PACKAGING_MATERIAL_LABELS)}
                  selected={materials}
                  onToggle={(v) => setMaterials((m) => toggle(m, v))}
                />
              </Question>
            )}

            {step === 5 && (
              <Question
                title="¿Tienes sede, filial o almacén propio en la Unión Europea?"
                hint="No cuenta usar un almacén logístico de Amazon."
              >
                <ChoiceGrid
                  single
                  options={[
                    { value: 'si' as const, label: 'Sí, estoy establecido en la UE' },
                    { value: 'no' as const, label: 'No, vendo desde fuera de la UE' },
                  ]}
                  selected={established ? [established] : []}
                  onToggle={(v) => setEstablished(v)}
                />
              </Question>
            )}

            {step === 6 && (
              <Question title="¿Cuánto envías a la UE al mes, aproximadamente?">
                <ChoiceGrid
                  single
                  options={toOptions(VOLUME_BANDS, VOLUME_BAND_LABELS)}
                  selected={volume ? [volume] : []}
                  onToggle={(v) => setVolume(v)}
                />
              </Question>
            )}

            {step === 7 && (
              <Question
                title="¿A qué correo te enviamos el informe?"
                hint="Solo lo usamos para enviarte este informe."
              >
                <div className="space-y-3">
                  <input
                    className="field"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="field"
                    type="text"
                    autoComplete="organization"
                    placeholder="Nombre de tu empresa (opcional)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </Question>
            )}

            {step === 8 && (
              <Question
                title="Revisa antes de generar el informe"
                hint="Si algo no cuadra, vuelve atrás y corrígelo."
              >
                <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                  <Summary label="Países" value={countries.map((c) => COUNTRY_LABELS[c]).join(', ')} />
                  <Summary label="Canales" value={channels.map((c) => SALES_CHANNEL_LABELS[c]).join(', ')} />
                  <Summary
                    label="Categorías"
                    value={categories.map((c) => PRODUCT_CATEGORY_LABELS[c]).join(', ')}
                  />
                  <Summary
                    label="Envases"
                    value={materials.map((m) => PACKAGING_MATERIAL_LABELS[m]).join(', ')}
                  />
                  <Summary
                    label="Establecido en la UE"
                    value={established === 'si' ? 'Sí' : 'No'}
                  />
                  <Summary label="Volumen" value={volume ? VOLUME_BAND_LABELS[volume] : ''} />
                  <Summary label="Correo" value={email.trim().toLowerCase()} />
                </dl>
                {error && <p className="mt-4 text-sm font-medium text-alert">{error}</p>}
              </Question>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
            >
              Atrás
            </button>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="btn-primary flex-1 sm:flex-none"
                disabled={!canAdvance}
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary flex-1 sm:flex-none"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Generando…' : 'Generar mi informe'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Question({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="text-2xl font-bold leading-snug tracking-tight">{title}</h1>
      {hint && <p className="mt-2 text-sm text-slate-600">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="text-sm font-semibold text-slate-500 sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="text-sm text-ink">{value || '—'}</dd>
    </div>
  );
}
