import { RISK_LABELS, type RiskLevel } from '../types/domain';

const STYLES: Record<RiskLevel, string> = {
  critico: 'bg-red-100 text-red-900 border-red-300',
  alto: 'bg-orange-100 text-orange-900 border-orange-300',
  medio: 'bg-slate-100 text-slate-800 border-slate-300',
};

export default function RiskPill({ risk }: { risk: RiskLevel }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${STYLES[risk]}`}
    >
      Riesgo {RISK_LABELS[risk].toLowerCase()}
    </span>
  );
}
