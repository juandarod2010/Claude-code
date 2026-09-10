import { BRAND, DISCLAIMER } from '../config/brand';

/**
 * Correo de entrega del diagnóstico.
 *
 * La versión editable a mano está en /templates/email-diagnosis-sent.txt.
 * Esta es la misma, con los marcadores rellenos, para poder copiarla desde el
 * panel interno. Si cambias una, cambia la otra.
 */
export interface DiagnosisEmailInput {
  name?: string | null;
  reference: string;
}

export function buildDiagnosisEmail({ name, reference }: DiagnosisEmailInput): {
  subject: string;
  body: string;
} {
  return {
    subject: 'Tu diagnóstico de cumplimiento UE está listo',
    body: `Hola${name ? `, ${name}` : ''}:

Tu diagnóstico está listo. Lo tienes en el archivo adjunto (${reference}).

Incluye:
- Qué te falta, país por país
- El riesgo de cada obligación y qué norma lo exige
- Qué cuesta resolverlo y en qué plazos

Si tienes dudas, responde a este correo y lo vemos.

${BRAND.name}
${BRAND.contactEmail}

---
${DISCLAIMER}`,
  };
}
