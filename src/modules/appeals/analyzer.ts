import { SUSPENSION_TYPES, type SuspensionType } from './poa-template';

/**
 * Analizador de correos de suspensión de Amazon.
 *
 * QUÉ ES: un clasificador por palabras clave. Lee el texto que le pegas y
 * decide en qué categoría cae, con qué confianza, y qué conviene hacer primero.
 *
 * QUÉ NO ES: un modelo predictivo. La gravedad NO es una probabilidad de
 * reactivación. Es una puntuación de dificultad basada en criterios nuestros
 * sobre lo costoso que resulta documentar cada tipo de caso. Amazon no publica
 * tasas de aceptación y aquí no se inventa ninguna.
 */

export const ANALYZER_DISCLAIMER =
  'Análisis orientativo obtenido por palabras clave. No es una predicción ni una ' +
  'garantía de reactivación: sirve para decidir por dónde empezar, no para prometer ' +
  'un resultado. Revisa siempre el correo original completo.';

interface Signal {
  type: SuspensionType;
  /** Expresiones que delatan este tipo. Se buscan sin distinguir mayúsculas. */
  patterns: RegExp[];
  /** Cuánto suma cada coincidencia a la confianza. */
  weight: number;
}

/**
 * Las expresiones están en inglés porque los correos de Amazon llegan en
 * inglés incluso a vendedores hispanohablantes; se incluyen equivalentes en
 * español donde el vendedor pueda haber traducido o resumido el correo.
 */
const SIGNALS: Signal[] = [
  {
    type: 'order_defect_rate',
    patterns: [/order defect rate/i, /\bODR\b/, /tasa de (pedidos )?defectuosos/i, /negative feedback/i],
    weight: 3,
  },
  {
    type: 'late_shipment',
    patterns: [/late shipment rate/i, /\bLSR\b/, /envíos? (con )?retraso/i, /valid tracking rate/i],
    weight: 3,
  },
  {
    type: 'intellectual_property',
    patterns: [
      /intellectual property/i,
      /\bIP\b complaint/i,
      /trademark/i,
      /copyright/i,
      /\bpatent\b/i,
      /propiedad intelectual/i,
      /infracción de marca/i,
      /rights owner/i,
    ],
    weight: 4,
  },
  {
    type: 'inauthentic',
    patterns: [/inauthentic/i, /not authentic/i, /counterfeit/i, /falsificad/i, /no aut[ée]ntic/i, /invoices? from your supplier/i],
    weight: 4,
  },
  {
    type: 'condition_complaints',
    patterns: [/item not as described/i, /used sold as new/i, /product condition/i, /estado del producto/i, /no coincide con la descripción/i],
    weight: 3,
  },
  {
    type: 'restricted_product',
    patterns: [/restricted product/i, /prohibited product/i, /producto restringido/i, /listing policy violation/i],
    weight: 3,
  },
  {
    type: 'linked_account',
    patterns: [/related account/i, /linked to (another|an) account/i, /multiple seller accounts/i, /cuenta vinculada/i],
    weight: 5,
  },
  {
    type: 'dropshipping',
    patterns: [/drop ?shipping/i, /third[- ]party (packing slips|invoices)/i, /shipped by another retailer/i],
    weight: 4,
  },
  {
    type: 'review_manipulation',
    patterns: [/review manipulation/i, /incentiviz(ed|ing) reviews?/i, /manipulación de (las )?reseñas/i, /fake reviews?/i],
    weight: 5,
  },
  {
    type: 'policy_violation',
    patterns: [/policy violation/i, /violation of our policies/i, /code of conduct/i, /incumplimiento de (las )?políticas/i],
    weight: 2,
  },
];

/** Señales de que el caso está en una fase más avanzada (y más difícil). */
const ESCALATION_PATTERNS: { pattern: RegExp; label: string; penalty: number }[] = [
  { pattern: /final decision/i, label: 'El correo habla de decisión final', penalty: 15 },
  { pattern: /no longer (be )?(able to )?(consider|review)/i, label: 'Amazon dice que no revisará más apelaciones', penalty: 20 },
  { pattern: /permanently (closed|deactivated|withheld)/i, label: 'Menciona cierre o retención permanente', penalty: 20 },
  { pattern: /funds? (will be )?(withheld|held)/i, label: 'Menciona retención de fondos', penalty: 8 },
  { pattern: /appeal(s)? (has|have) been (denied|rejected)/i, label: 'Ya hay una apelación denegada', penalty: 12 },
  { pattern: /section 3/i, label: 'Cita la sección 3 del acuerdo de servicios', penalty: 10 },
];

/** ASIN detectados en el correo: acota si el problema es de cuenta o de producto. */
const ASIN_RE = /\bB0[A-Z0-9]{8}\b/g;

export interface SuspensionAnalysis {
  /** Tipo detectado. `unknown` si ninguna señal encaja. */
  type: SuspensionType;
  typeLabel: string;
  /** 0–100. Cuánto cuesta documentar y sostener este caso. 100 = probablemente irrecuperable. */
  severity: number;
  /** 0–100. Cuánta confianza hay en la clasificación, según las coincidencias. */
  confidence: number;
  /** Qué expresiones se han encontrado. Sirve para que el operador lo revise. */
  matchedSignals: string[];
  /** Señales de que el caso está escalado. */
  escalations: string[];
  /** ASIN encontrados en el correo. */
  asins: string[];
  /** Alcance aparente: toda la cuenta o productos concretos. */
  scope: 'cuenta' | 'productos' | 'indeterminado';
  /** Próximos pasos recomendados, en orden. */
  nextSteps: string[];
  disclaimer: string;
}

function detectScope(text: string, asins: string[]): SuspensionAnalysis['scope'] {
  if (/account (has been )?(deactivated|suspended)/i.test(text) || /cuenta (ha sido )?(desactivada|suspendida)/i.test(text)) {
    return 'cuenta';
  }
  if (asins.length > 0 || /listing(s)? (has|have) been (removed|deactivated)/i.test(text)) {
    return 'productos';
  }
  return 'indeterminado';
}

function nextStepsFor(
  type: SuspensionType,
  scope: SuspensionAnalysis['scope'],
  escalations: string[],
): string[] {
  const steps: string[] = [];

  if (escalations.length > 0) {
    steps.push(
      'El correo tiene señales de caso escalado: antes de escribir nada, reunir todo el historial de apelaciones anteriores y ver qué se respondió ya.',
    );
  }

  steps.push('Guardar el correo original completo, con cabeceras y fecha. Es la base del expediente.');

  switch (type) {
    case 'intellectual_property':
      steps.push(
        'Identificar quién ha puesto la queja: la vía más corta suele ser que el reclamante la retire.',
        'Reunir la cadena de suministro completa: facturas del proveedor con datos verificables.',
      );
      break;
    case 'inauthentic':
      steps.push(
        'Reunir facturas de compra del proveedor: fechas, cantidades y datos de contacto comprobables.',
        'Comprobar que las cantidades facturadas cubren las unidades vendidas del periodo reclamado.',
      );
      break;
    case 'order_defect_rate':
    case 'late_shipment':
      steps.push(
        'Descargar el informe de métricas del periodo y localizar los pedidos concretos que disparan la tasa.',
        'Buscar el patrón común entre esos pedidos: es ahí donde está la causa raíz.',
      );
      break;
    case 'linked_account':
      steps.push(
        'Documentar la relación real entre las cuentas: quién las abrió, con qué datos y por qué.',
        'Si la otra cuenta sigue suspendida, resolver esa primero: mientras siga abierta, esta no se reactiva.',
      );
      break;
    case 'review_manipulation':
      steps.push(
        'Reconstruir de dónde salieron las reseñas señaladas y si hubo intermediarios o agencias implicadas.',
        'Cortar cualquier relación con servicios de reseñas antes de apelar.',
      );
      break;
    case 'dropshipping':
      steps.push(
        'Revisar qué albaranes llegan al cliente y con qué marca salen los paquetes.',
        'Documentar el cambio de proveedor o de proceso de envío si ya se ha hecho.',
      );
      break;
    case 'restricted_product':
    case 'condition_complaints':
    case 'policy_violation':
      steps.push(
        'Localizar la política concreta que cita el correo y leerla entera antes de responder.',
        'Revisar el catálogo completo buscando otros productos con el mismo problema.',
      );
      break;
    case 'unknown':
      steps.push(
        'No se ha podido clasificar el caso automáticamente: hay que leer el correo entero a mano.',
        'Buscar en el correo la política citada o el identificador del expediente.',
      );
      break;
  }

  if (scope === 'productos') {
    steps.push('El alcance parece limitado a productos concretos: apelar por ASIN, no por cuenta.');
  } else if (scope === 'cuenta') {
    steps.push('El alcance parece ser toda la cuenta: el plan tiene que hablar del proceso, no de un producto.');
  }

  steps.push('Redactar el Plan of Action con las tres partes: causa raíz, correcciones con prueba y medidas preventivas.');
  return steps;
}

/**
 * Analiza el texto bruto del correo de Amazon.
 * Función pura: mismo texto, mismo resultado.
 */
export function analyzeSuspensionEmail(rawEmail: string): SuspensionAnalysis {
  const text = rawEmail ?? '';
  const matchedSignals: string[] = [];
  const scores = new Map<SuspensionType, number>();

  for (const signal of SIGNALS) {
    for (const pattern of signal.patterns) {
      const match = text.match(pattern);
      if (match) {
        scores.set(signal.type, (scores.get(signal.type) ?? 0) + signal.weight);
        matchedSignals.push(match[0]);
      }
    }
  }

  let type: SuspensionType = 'unknown';
  let best = 0;
  for (const [candidate, score] of scores) {
    if (score > best) {
      best = score;
      type = candidate;
    }
  }

  const escalations = ESCALATION_PATTERNS.filter((e) => e.pattern.test(text));
  const asins = [...new Set(text.match(ASIN_RE) ?? [])];
  const scope = detectScope(text, asins);

  const escalationPenalty = escalations.reduce((sum, e) => sum + e.penalty, 0);
  const severity = Math.max(
    0,
    Math.min(100, SUSPENSION_TYPES[type].difficulty + escalationPenalty),
  );

  // La confianza sube con las coincidencias, pero nunca llega al 100 %:
  // esto es un clasificador por palabras clave, no una certeza.
  const confidence = text.trim() === '' ? 0 : Math.min(90, best * 12);

  return {
    type,
    typeLabel: SUSPENSION_TYPES[type].label,
    severity,
    confidence,
    matchedSignals: [...new Set(matchedSignals)],
    escalations: escalations.map((e) => e.label),
    asins,
    scope,
    nextSteps: nextStepsFor(type, scope, escalations.map((e) => e.label)),
    disclaimer: ANALYZER_DISCLAIMER,
  };
}

/** Lectura en texto del nivel de gravedad. */
export function severityLabel(severity: number): string {
  if (severity >= 80) return 'Muy difícil — probablemente irrecuperable por la vía ordinaria';
  if (severity >= 60) return 'Difícil — exige documentación de proveedores o de terceros';
  if (severity >= 40) return 'Medio — recuperable con un plan bien documentado';
  return 'Abordable — el caso depende sobre todo de tus propias métricas';
}
