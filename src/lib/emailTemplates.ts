import { APPEALS, BRAND, DISCLAIMER } from '../config/brand';

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

/**
 * Primera respuesta a un lead de apelaciones.
 * La versión editable a mano está en /templates/email-appeal-received.txt.
 * Los próximos pasos salen del analizador: no se inventan aquí.
 */
export interface AppealEmailInput {
  name?: string | null;
  suspensionTypeLabel: string;
  nextSteps: string[];
}

export function buildAppealReplyEmail({
  name,
  suspensionTypeLabel,
  nextSteps,
}: AppealEmailInput): { subject: string; body: string } {
  const steps = nextSteps.slice(0, 3);
  return {
    subject: 'Tu caso de Amazon — primera lectura',
    body: `Hola${name ? `, ${name}` : ''}:

He leído lo que me has contado. Por lo que describes, tu caso cae en:
${suspensionTypeLabel}

Lo primero que haría yo, en este orden:

${steps.length ? steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : '1. Leer entero el correo original de Amazon.'}

Y lo que NO haría todavía: enviar otro Plan of Action. Cada intento rechazado
deja rastro en el expediente y hace más cuesta arriba el siguiente.

Si quieres que lo lleve yo: analizo el caso a fondo, identifico la causa raíz
que va a buscar el revisor y te entrego el Plan of Action redactado y listo para
enviar. Son ${APPEALS.analysisPrice.label}.

Lo que no te voy a decir es que tengo un porcentaje de éxito garantizado. Nadie
puede garantizarte una reactivación, y quien te la garantice te está mintiendo.

¿Seguimos?

${BRAND.name}
${BRAND.contactEmail}`,
  };
}
