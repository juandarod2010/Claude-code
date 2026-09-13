import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  composeRevisionStory,
  isRevisionLead,
  NO_DRAFT_NOTE,
  ORIGIN_MARKER,
} from '../src/lib/revisionLead';
import { analyzeSuspensionEmail } from '../src/modules/appeals/analyzer';

describe('composición del lead de /revision', () => {
  const CORREO = 'Your account was deactivated due to an intellectual property complaint.';

  it('marca el origen para poder distinguirlo en el panel', () => {
    expect(composeRevisionStory(CORREO, '')).toContain(ORIGIN_MARKER);
    expect(isRevisionLead(composeRevisionStory(CORREO, ''))).toBe(true);
  });

  it('conserva el correo y el borrador del cliente', () => {
    const story = composeRevisionStory(CORREO, 'Mi borrador a medias.');
    expect(story).toContain(CORREO);
    expect(story).toContain('Mi borrador a medias.');
  });

  it('sin borrador deja escrito qué hay que pedirle', () => {
    expect(composeRevisionStory(CORREO, '   ')).toContain(NO_DRAFT_NOTE);
  });

  it('un lead de otra procedencia no se confunde con uno de revisión', () => {
    expect(isRevisionLead('Me han suspendido la cuenta')).toBe(false);
    expect(isRevisionLead(null)).toBe(false);
    expect(isRevisionLead(undefined)).toBe(false);
  });

  it('el texto compuesto puede desviar la clasificación', () => {
    // Por esto la página clasifica el correo a secas. No siempre cambia el
    // tipo —una señal fuerte como la de propiedad intelectual aguanta el
    // ruido—, pero con un motivo de peso medio el borrador del cliente sí se
    // lo lleva, y entonces el caso entra etiquetado como otra cosa.
    const correoFlojo = 'Your listing was removed. Please review the policy and reply.';
    const borradorRuidoso =
      'Reconocemos que hubo counterfeit e inauthentic items y facturas del proveedor incorrectas.';

    const soloCorreo = analyzeSuspensionEmail(correoFlojo).type;
    const compuesto = analyzeSuspensionEmail(composeRevisionStory(correoFlojo, borradorRuidoso));

    expect(compuesto.type).not.toBe(soloCorreo);
    expect(compuesto.type).toBe('inauthentic');
  });

  it('una señal fuerte del correo sí resiste el ruido del borrador', () => {
    const compuesto = composeRevisionStory(CORREO, 'Tuvimos algún late shipment suelto.');
    expect(analyzeSuspensionEmail(CORREO).type).toBe('intellectual_property');
    expect(analyzeSuspensionEmail(compuesto).type).toBe('intellectual_property');
  });
});

describe('restricción de escritura del visitante anónimo', () => {
  /**
   * Esto no es un test de comportamiento, es un guardarraíl sobre el código
   * fuente. El visitante anónimo puede INSERTAR en `leads` pero no SELECCIONAR
   * ni ACTUALIZAR (migración 0001). Cualquier segunda escritura desde una
   * página pública falla en Supabase y pasa en MOCK, que es exactamente el
   * fallo que se coló la primera vez.
   */
  const PAGINAS_PUBLICAS = [
    'src/pages/RevisionPage.tsx',
    'src/pages/AppealsPage.tsx',
    'src/pages/DiagnosticoPage.tsx',
  ];

  it('ninguna página pública actualiza un lead después de crearlo', () => {
    for (const ruta of PAGINAS_PUBLICAS) {
      const fuente = readFileSync(ruta, 'utf8');
      expect(fuente, `${ruta} no puede llamar a addLeadNote`).not.toContain('addLeadNote');
      expect(fuente, `${ruta} no puede llamar a updateLead`).not.toContain('storage.updateLead');
    }
  });
});
