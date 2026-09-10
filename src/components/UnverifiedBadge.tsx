import { UNVERIFIED_BADGE } from '../config/brand';

/**
 * Etiqueta obligatoria sobre cualquier obligación con verified: false.
 * No se puede ocultar por configuración: si el dato no está verificado, se ve.
 */
export default function UnverifiedBadge() {
  return (
    <p className="inline-block rounded border border-amber-400 bg-amber-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
      {UNVERIFIED_BADGE}
    </p>
  );
}
