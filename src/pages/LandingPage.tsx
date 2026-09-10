import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { BRAND, LANDING_COPY, REGULATION } from '../config/brand';

/**
 * Landing de una sola pantalla.
 * Deliberadamente SIN testimonios, SIN logos de clientes y SIN cifras que no
 * podamos demostrar. Cuando haya clientes reales, se añaden aquí.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-5 pt-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight">{BRAND.name}</span>
          <span className="text-xs text-slate-500">{REGULATION.reference}</span>
        </div>
      </header>

      <main className="flex flex-1 items-center px-5 py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {LANDING_COPY.headline}
          </h1>

          <div className="mt-6 space-y-4">
            {LANDING_COPY.lines.map((line) => (
              <p key={line} className="text-base leading-relaxed text-slate-700">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-9">
            <Link to="/diagnostico" className="btn-primary w-full sm:w-auto">
              {LANDING_COPY.ctaLabel}
            </Link>
            <p className="mt-3 text-sm text-slate-500">
              8 preguntas, menos de dos minutos. Sin registro.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
