/**
 * Marca y textos centralizados.
 * Para cambiar el nombre del producto, cambia SOLO este fichero.
 */

export const BRAND = {
  name: 'Complyo',
  tagline: 'Cumplimiento RAP para vender en la Unión Europea',
  domain: 'complyo.eu',
  contactEmail: 'hola@complyo.eu',
  /** Se usa en el pie del PDF y en la web. */
  legalEntityNote: 'Complyo',
} as const;

/**
 * DESCARGO DE RESPONSABILIDAD.
 * Obligatorio en el informe (pantalla y PDF) y en el pie de la web.
 * No modificar sin revisarlo con un abogado.
 */
export const DISCLAIMER =
  'Este informe es orientativo y no constituye asesoramiento jurídico. ' +
  `${BRAND.name} no actúa como representante autorizado ni como organismo de responsabilidad ` +
  'de productor. Las altas ante autoridades y organismos se tramitan a través de socios ' +
  'establecidos en la Unión Europea.';

/** Etiqueta que se pinta sobre toda obligación con verified: false. */
export const UNVERIFIED_BADGE = 'PENDIENTE DE VERIFICACIÓN — no usar con cliente';

/**
 * Norma de referencia del producto.
 * Es el único dato normativo del código y viene del propio encargo del negocio.
 * Verifícalo igual que el resto antes de publicar.
 */
export const REGULATION = {
  reference: 'Reglamento (UE) 2025/40',
  applicationDate: '12 de agosto de 2026',
} as const;

/** Precios del servicio. Son precios nuestros, no importes regulatorios. */
export const PRICING = {
  report: { amount: 97, currency: 'USD', label: '97 $' },
  resolution: { min: 349, max: 499, currency: 'USD', label: '349–499 $' },
  monitoring: { min: 39, max: 99, currency: 'USD', label: '39–99 $/mes' },
} as const;

/** Textos de la landing. Sin testimonios, sin logos, sin cifras no demostrables. */
export const LANDING_COPY = {
  headline: 'El 12 de agosto de 2026, Amazon puede desactivar tus listings en Europa.',
  lines: [
    `El ${REGULATION.reference} obliga a los marketplaces a comprobar tu registro de responsabilidad ampliada del productor antes de mantener activos tus anuncios.`,
    'Si vendes a la Unión Europea sin estar dado de alta en el país de destino, el canal deja de publicar tus productos. No hay aviso gradual.',
    `Responde 8 preguntas y te decimos, país por país, qué te falta y qué pasa si no lo arreglas. Informe en 24 horas por ${PRICING.report.label}.`,
  ],
  ctaLabel: 'Ver mi exposición',
} as const;

export const REPORT_CTA_LABEL = 'Resolverlo';

/**
 * Compromisos de servicio. Son promesas COMERCIALES TUYAS, no plazos legales.
 * Ajústalos a lo que puedas cumplir de verdad antes de publicar.
 */
export const SERVICE_COMMITMENTS = {
  reportDelivery: 'Informe entregado en 24 horas desde el diagnóstico.',
  resolutionStart:
    'El alta se inicia con un socio establecido en la Unión Europea en cuanto se confirma el pago.',
} as const;

/**
 * Plazo de tramitación ante cada autoridad.
 * NO se rellena aquí: depende del país y es un dato regulatorio.
 * El informe lo muestra como pendiente de verificación mientras la base de
 * reglas no esté verificada. Ver RULES-GUIDE.md.
 */
export const AUTHORITY_LEAD_TIME_UNKNOWN =
  'Plazo de tramitación ante la autoridad: pendiente de verificar en fuente oficial.';
