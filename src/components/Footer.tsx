import { BRAND, DISCLAIMER } from '../config/brand';

/** Pie común. El descargo de responsabilidad es obligatorio y visible. */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 px-5 py-8">
      <div className="mx-auto max-w-3xl space-y-3">
        <p className="text-sm font-semibold text-ink">{BRAND.name}</p>
        <p className="text-sm leading-relaxed text-slate-600">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
