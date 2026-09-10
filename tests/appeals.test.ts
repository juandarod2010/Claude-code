import { describe, expect, it } from 'vitest';
import { analyzeSuspensionEmail, severityLabel } from '../src/modules/appeals/analyzer';
import {
  buildAppealMessage,
  PLACEHOLDERS,
  recommendVariant,
} from '../src/modules/appeals/messages';
import {
  emptyPlan,
  estimateSuccess,
  missingPlanParts,
  renderPlanAsJson,
  renderPlanAsMarkdown,
  renderPlanAsText,
  type PlanOfAction,
} from '../src/modules/appeals/poa-template';

const ODR_EMAIL = `Hello,
Your Amazon seller account has been deactivated. Your Order Defect Rate is above the
target of 1%. Please send a Plan of Action.`;

const IP_EMAIL = `We received a report from a rights owner that your listing B0ABCD1234 infringes
their trademark. This is an intellectual property complaint. This is our final decision.`;

describe('analizador de suspensiones', () => {
  it('1. clasifica una suspensión por Order Defect Rate', () => {
    const a = analyzeSuspensionEmail(ODR_EMAIL);
    expect(a.type).toBe('order_defect_rate');
    expect(a.scope).toBe('cuenta');
    expect(a.confidence).toBeGreaterThan(0);
  });

  it('2. clasifica una queja de propiedad intelectual y detecta el ASIN', () => {
    const a = analyzeSuspensionEmail(IP_EMAIL);
    expect(a.type).toBe('intellectual_property');
    expect(a.asins).toEqual(['B0ABCD1234']);
  });

  it('3. las señales de escalado agravan el caso', () => {
    const escalated = analyzeSuspensionEmail(IP_EMAIL);
    const plain = analyzeSuspensionEmail('This is an intellectual property complaint.');
    expect(escalated.escalations.length).toBeGreaterThan(0);
    expect(escalated.severity).toBeGreaterThan(plain.severity);
  });

  it('4. un texto vacío no inventa clasificación', () => {
    const a = analyzeSuspensionEmail('');
    expect(a.type).toBe('unknown');
    expect(a.confidence).toBe(0);
    expect(a.nextSteps.join(' ')).toContain('a mano');
  });

  it('5. la confianza nunca llega al 100 %: es un clasificador por palabras clave', () => {
    const a = analyzeSuspensionEmail(`${IP_EMAIL} ${IP_EMAIL} ${IP_EMAIL}`);
    expect(a.confidence).toBeLessThanOrEqual(90);
  });

  it('6. es determinista y siempre lleva descargo', () => {
    const a = analyzeSuspensionEmail(ODR_EMAIL);
    const b = analyzeSuspensionEmail(ODR_EMAIL);
    expect(a).toEqual(b);
    expect(a.disclaimer).toContain('orientativo');
  });

  it('7. reconoce el texto en español y el alcance por producto', () => {
    const a = analyzeSuspensionEmail(
      'Nos han retirado el listado por manipulación de las reseñas en el ASIN B0ZZZZ9999.',
    );
    expect(a.type).toBe('review_manipulation');
    expect(a.scope).toBe('productos');
  });

  it('8. la etiqueta de gravedad cubre todos los tramos', () => {
    expect(severityLabel(95)).toContain('irrecuperable');
    expect(severityLabel(65)).toContain('Difícil');
    expect(severityLabel(45)).toContain('Medio');
    expect(severityLabel(10)).toContain('Abordable');
  });
});

describe('mensajes de apelación', () => {
  it('9. sustituye los marcadores en las dos variantes', () => {
    for (const variant of ['A', 'B'] as const) {
      const m = buildAppealMessage(variant, { name: 'Lucía', reason: 'ODR alto', daysSuspended: 3 });
      expect(m.body).toContain('Lucía');
      expect(m.body).toContain('ODR alto');
      expect(m.body).not.toContain(PLACEHOLDERS.name);
      expect(m.body).not.toContain(PLACEHOLDERS.reason);
    }
  });

  it('10. sin datos deja el marcador de razón visible para no inventarlo', () => {
    const m = buildAppealMessage('A');
    expect(m.body).toContain(PLACEHOLDERS.reason);
    expect(m.body).not.toContain('undefined');
  });

  it('11. recomienda urgencia si es reciente y solución si no', () => {
    expect(recommendVariant(2)).toBe('A');
    expect(recommendVariant(30)).toBe('B');
    expect(recommendVariant(undefined)).toBe('B');
  });

  it('12. ninguna variante promete un resultado ni da tasas de éxito', () => {
    for (const variant of ['A', 'B'] as const) {
      const body = buildAppealMessage(variant, { name: 'X', reason: 'Y' }).body.toLowerCase();
      expect(body).not.toMatch(/garantiz/);
      expect(body).not.toMatch(/\d+\s*%/);
    }
  });
});

describe('plan of action', () => {
  const fullPlan: PlanOfAction = {
    sellerName: 'Tienda X',
    suspensionReason: 'Order Defect Rate',
    daysSuspended: 7,
    rootCauses: ['El proveedor enviaba sin control de calidad de salida.'],
    correctionsTaken: [
      { action: 'Cambio de proveedor', evidence: 'Contrato firmado', completedDate: '2026-09-01' },
    ],
    preventiveMeasures: [
      { measure: 'Inspección del 100 % de entradas', implementation: 'Checklist diario del almacén' },
    ],
    estimatedSuccess: 0,
  };

  it('13. un plan completo puntúa más que uno vacío', () => {
    const empty = estimateSuccess(emptyPlan('Tienda X', 'ODR'), 'order_defect_rate');
    const full = estimateSuccess(fullPlan, 'order_defect_rate');
    expect(full).toBeGreaterThan(empty);
  });

  it('14. la puntuación nunca es 0 ni 100: no es una probabilidad', () => {
    const best = estimateSuccess(fullPlan, 'order_defect_rate');
    const worst = estimateSuccess(emptyPlan(), 'review_manipulation');
    expect(best).toBeLessThanOrEqual(95);
    expect(worst).toBeGreaterThanOrEqual(5);
  });

  it('15. una corrección sin prueba penaliza', () => {
    const withoutEvidence: PlanOfAction = {
      ...fullPlan,
      correctionsTaken: [{ action: 'Cambio de proveedor', evidence: '', completedDate: '2026-09-01' }],
    };
    expect(estimateSuccess(withoutEvidence)).toBeLessThan(estimateSuccess(fullPlan));
  });

  it('16. un tipo más difícil baja la puntuación del mismo plan', () => {
    expect(estimateSuccess(fullPlan, 'review_manipulation')).toBeLessThan(
      estimateSuccess(fullPlan, 'order_defect_rate'),
    );
  });

  it('17. missingPlanParts enumera exactamente lo que falta', () => {
    expect(missingPlanParts(fullPlan)).toEqual([]);
    const missing = missingPlanParts(emptyPlan());
    expect(missing).toContain('Nombre del vendedor');
    expect(missing).toContain('Al menos una causa raíz');
    expect(missing).toHaveLength(5);
  });

  it('18. el documento sale en Markdown, texto y JSON, siempre con descargo', () => {
    const md = renderPlanAsMarkdown({ ...fullPlan, estimatedSuccess: 60 });
    expect(md).toContain('# Plan of Action — Tienda X');
    expect(md).toContain('1. Causa raíz');
    expect(md).toContain('orientativo');

    const txt = renderPlanAsText({ ...fullPlan, estimatedSuccess: 60 });
    expect(txt).not.toContain('**');
    expect(txt).toContain('Causa raíz');

    const json = JSON.parse(renderPlanAsJson({ ...fullPlan, estimatedSuccess: 60 }, 'order_defect_rate'));
    expect(json.suspensionType).toBe('order_defect_rate');
    expect(json.plan.sellerName).toBe('Tienda X');
    expect(json.disclaimer).toContain('orientativo');
  });

  it('19. un plan a medias avisa de las secciones pendientes', () => {
    const md = renderPlanAsMarkdown(emptyPlan('Tienda X', 'ODR'));
    expect(md).toContain('pendiente de completar');
  });
});
