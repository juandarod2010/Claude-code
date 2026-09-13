import { describe, expect, it } from 'vitest';
import {
  firstTouch,
  followUpOne,
  followUpTwo,
  hookFor,
  OBJECTIONS,
  PLACEHOLDERS,
  sequence,
} from '../src/modules/appeals/entryMessages';
import { ENTRY_OFFER } from '../src/config/brand';
import { SUSPENSION_TYPES, type SuspensionType } from '../src/modules/appeals/poa-template';

const ALL_TYPES = Object.keys(SUSPENSION_TYPES) as SuspensionType[];

describe('primer contacto', () => {
  it('ancla el mensaje en lo que ha escrito el prospecto', () => {
    const msg = firstTouch({ name: 'Marta', quote: 'me suspendieron por facturas' });
    expect(msg.body).toContain('Hola, Marta:');
    expect(msg.body).toContain('me suspendieron por facturas');
    expect(msg.body).not.toContain(PLACEHOLDERS.quote);
  });

  it('sin cita deja el marcador visible, para que no se envíe así', () => {
    expect(firstTouch().body).toContain(PLACEHOLDERS.quote);
  });

  it('sin nombre el saludo queda neutro y no dice "Hola, :"', () => {
    const body = firstTouch({ quote: 'algo' }).body;
    expect(body).toContain('Hola:');
    expect(body).not.toContain('Hola, :');
  });

  it('cambia el ángulo si ya le han rechazado un plan', () => {
    const yes = firstTouch({ quote: 'x', planRejected: true }).body;
    const no = firstTouch({ quote: 'x', planRejected: false }).body;
    expect(yes).toContain('mismo encuadre');
    expect(no).toContain('menos prejuicio');
  });

  it('el asunto nombra el tipo cuando se conoce', () => {
    expect(firstTouch({ suspensionType: 'inauthentic' }).subject).toContain(
      SUSPENSION_TYPES.inauthentic.label,
    );
  });

  it('lleva precio, plazo y garantía', () => {
    const body = firstTouch({ quote: 'x' }).body;
    expect(body).toContain(ENTRY_OFFER.price.label);
    expect(body).toContain(String(ENTRY_OFFER.deliveryHours));
    expect(body).toContain('devuelvo el dinero');
  });
});

describe('ganchos por tipo de suspensión', () => {
  it('hay uno para cada tipo y ninguno está vacío', () => {
    for (const type of ALL_TYPES) {
      expect(hookFor(type).length).toBeGreaterThan(40);
    }
  });

  it('un tipo desconocido cae en el gancho genérico sin romperse', () => {
    expect(hookFor(undefined)).toBe(hookFor('unknown'));
  });

  it('son distintos entre sí: el gancho es lo que hace el mensaje específico', () => {
    expect(new Set(ALL_TYPES.map(hookFor)).size).toBe(ALL_TYPES.length);
  });
});

describe('seguimientos', () => {
  it('el primero aporta contenido nuevo, no pregunta "¿lo viste?"', () => {
    const body = followUpOne().body;
    expect(body).toContain('causa raíz');
    expect(body.toLowerCase()).not.toContain('¿lo viste');
  });

  it('el segundo cierra la secuencia sin insistir', () => {
    const msg = followUpTwo();
    expect(msg.body).toContain('No te molesto más');
    expect(msg.when).toContain('último');
  });

  it('la secuencia son tres mensajes con identificadores únicos', () => {
    const ids = sequence().map((m) => m.id);
    expect(ids).toEqual(['primer_contacto', 'seguimiento_1', 'seguimiento_2']);
  });
});

describe('objeciones', () => {
  it('cubre las cinco situaciones del encargo', () => {
    expect(OBJECTIONS.map((o) => o.id)).toEqual([
      'interes',
      'precio',
      'no_interesa',
      'ya_tengo_alguien',
      'lo_pensare',
    ]);
  });

  it('la respuesta al "no" acepta el no y no vuelve a vender', () => {
    const body = OBJECTIONS.find((o) => o.id === 'no_interesa')!.body;
    expect(body).toContain('no insisto');
    expect(body).not.toContain(ENTRY_OFFER.price.label);
  });

  it('la respuesta de precio dice el precio y delimita el alcance', () => {
    const body = OBJECTIONS.find((o) => o.id === 'precio')!.body;
    expect(body).toContain(ENTRY_OFFER.price.label);
    expect(body).toContain('no una gestión ante Amazon');
  });

  it('el mensaje de interés pide el correo original completo', () => {
    expect(OBJECTIONS.find((o) => o.id === 'interes')!.body).toContain('sin recortar');
  });
});

describe('lo que ningún mensaje puede decir', () => {
  const bodies = [...sequence({ quote: 'x' }), ...OBJECTIONS].map((m) => m.body);

  it('no promete reactivación ni garantiza resultado', () => {
    // El negativo va explícito en el patrón: "No garantizo la reactivación" es
    // el descargo y tiene que poder decirse. Lo que no puede aparecer es la
    // misma frase en afirmativo.
    for (const body of bodies) {
      expect(body).not.toMatch(/(?<!\bno\s)garantizo la reactivación/i);
      expect(body).not.toMatch(/te reactivo|reactivación garantizada|seguro que te la reactivan/i);
    }
  });

  it('y el descargo sí está presente donde se menciona el precio', () => {
    expect(firstTouch({ quote: 'x' }).body).toMatch(/no garantizo la reactivación/i);
  });

  it('no publica tasas de éxito', () => {
    for (const body of bodies) {
      expect(body).not.toMatch(/\d+\s?% de (éxito|reactivaci)/i);
    }
  });

  it('no afirma plazos de respuesta de Amazon', () => {
    for (const body of bodies) {
      expect(body).not.toMatch(/Amazon (te )?(responde|contesta) en \d+/i);
    }
  });
});
