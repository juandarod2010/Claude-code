import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * El adaptador MOCK escribe en localStorage, que en Node no existe.
 * Se instala un doble mínimo antes de importar el módulo.
 */
class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}

const memory = new MemoryStorage();
vi.stubGlobal('localStorage', memory);

const { mockStorage, newId } = await import('../src/lib/storage/mock');
const { answers } = await import('./fixtures');
const { evaluate } = await import('../src/lib/engine');

beforeEach(() => memory.clear());

describe('almacenamiento en localStorage', () => {
  it('1. crea y lista un lead de cumplimiento', async () => {
    const lead = await mockStorage.createLead({ answers: answers({ email: 'a@b.invalid' }) });
    expect(lead.type).toBe('complyo');
    expect(lead.status).toBe('nuevo');
    expect(lead.notes).toEqual([]);
    expect(await mockStorage.listLeads()).toHaveLength(1);
    expect(await mockStorage.getLead(lead.id)).toEqual(lead);
  });

  it('2. crea un lead de apelación con sus datos propios', async () => {
    const lead = await mockStorage.createAppealLead({
      email: 'c@d.invalid',
      companyName: 'Tienda X',
      appeal: {
        story: 'Me han cerrado la cuenta',
        suspensionType: 'order_defect_rate',
        suspensionTypeLabel: 'Order Defect Rate',
        severity: 25,
        scope: 'cuenta',
        daysSuspended: 4,
      },
    });
    expect(lead.type).toBe('appeal');
    expect(lead.answers).toBeNull();
    expect(lead.appeal?.severity).toBe(25);
  });

  it('3. actualiza estado e ingresos y toca updatedAt', async () => {
    const lead = await mockStorage.createLead({ answers: answers() });
    const updated = await mockStorage.updateLead(lead.id, { status: 'convertido', revenue: 97 });
    expect(updated?.status).toBe('convertido');
    expect(updated?.revenue).toBe(97);
    expect(updated!.updatedAt >= lead.updatedAt).toBe(true);
  });

  it('4. añade notas y las devuelve de más reciente a más antigua', async () => {
    const lead = await mockStorage.createLead({ answers: answers() });
    await mockStorage.addLeadNote(lead.id, 'Primer contacto');
    const withTwo = await mockStorage.addLeadNote(lead.id, 'Envié el informe');
    expect(withTwo?.notes.map((n) => n.text)).toEqual(['Envié el informe', 'Primer contacto']);
  });

  it('5. actualizar un lead inexistente devuelve null en vez de romper', async () => {
    expect(await mockStorage.updateLead('no-existe', { status: 'contactado' })).toBeNull();
    expect(await mockStorage.addLeadNote('no-existe', 'x')).toBeNull();
    expect(await mockStorage.getLead('no-existe')).toBeNull();
  });

  it('6. crea un informe con número legible y lo encuentra por lead', async () => {
    const lead = await mockStorage.createLead({ answers: answers() });
    const report = await mockStorage.createReport({ leadId: lead.id, result: evaluate(answers()) });
    expect(report.reference).toMatch(/^INFORME-\d{8}-[A-Z0-9]{4}$/);
    expect(await mockStorage.getReport(report.id)).toEqual(report);
    expect(await mockStorage.getReportByLead(lead.id)).toEqual(report);
    expect(await mockStorage.listReports()).toHaveLength(1);
  });

  it('7. registra prospectos y marca la respuesta', async () => {
    const prospect = await mockStorage.createProspect({
      listingRef: 'B0TEST',
      country: 'DE',
      missingItems: ['no_aparece_numero_rap'],
      variant: 'A',
      notes: null,
    });
    expect(prospect.responded).toBe(false);
    const updated = await mockStorage.setProspectResponded(prospect.id, true);
    expect(updated?.responded).toBe(true);
    expect(await mockStorage.setProspectResponded('no-existe', true)).toBeNull();
  });

  it('8. guarda, sustituye y borra reglas por identificador', async () => {
    const rule = {
      id: 'de-envases-registro',
      country: 'DE' as const,
      stream: 'envases' as const,
      authorityName: 'Registro real',
      representativeRequiredForNonEstablished: true,
      reportingFrequency: 'anual',
      requiredData: ['NIF'],
      nonComplianceConsequence: 'Consecuencia',
      appliesToCategories: 'all' as const,
      severityWeight: 60,
      sourceUrl: 'https://eur-lex.europa.eu/x',
      sourceCheckedAt: '2026-09-01',
      verified: true,
    };
    await mockStorage.saveStoredRule(rule);
    await mockStorage.saveStoredRule({ ...rule, authorityName: 'Registro corregido' });
    const stored = await mockStorage.listStoredRules();
    expect(stored).toHaveLength(1);
    expect(stored[0].authorityName).toBe('Registro corregido');
    expect(stored[0].updatedAt).toBeTruthy();

    await mockStorage.deleteStoredRule(rule.id);
    expect(await mockStorage.listStoredRules()).toHaveLength(0);
  });

  it('9. un localStorage corrupto no rompe la lectura', async () => {
    memory.setItem('complyo.leads', '{no es json');
    expect(await mockStorage.listLeads()).toEqual([]);
  });

  it('10. newId genera identificadores distintos', () => {
    expect(newId()).not.toBe(newId());
  });
});

describe('paginación de leads', () => {
  async function seed(count: number): Promise<void> {
    for (let i = 0; i < count; i += 1) {
      const lead = await mockStorage.createLead({
        answers: answers({ email: `lead-${String(i).padStart(3, '0')}@ejemplo.invalid` }),
      });
      // Fechas descendentes para que el orden sea comprobable.
      const all = JSON.parse(localStorage.getItem('complyo.leads') ?? '[]');
      const index = all.findIndex((l: { id: string }) => l.id === lead.id);
      all[index].createdAt = `2026-09-${String(28 - i).padStart(2, '0')}T10:00:00.000Z`;
      localStorage.setItem('complyo.leads', JSON.stringify(all));
    }
  }

  it('11. devuelve solo la página pedida, con el total detrás', async () => {
    await seed(7);
    const first = await mockStorage.queryLeads({ limit: 3, offset: 0 });
    expect(first.rows).toHaveLength(3);
    expect(first.total).toBe(7);

    const last = await mockStorage.queryLeads({ limit: 3, offset: 6 });
    expect(last.rows).toHaveLength(1);
    expect(last.total).toBe(7);
  });

  it('12. las páginas no se solapan y van de más reciente a más antigua', async () => {
    await seed(6);
    const a = await mockStorage.queryLeads({ limit: 3, offset: 0 });
    const b = await mockStorage.queryLeads({ limit: 3, offset: 3 });
    const ids = [...a.rows, ...b.rows].map((l) => l.id);
    expect(new Set(ids).size).toBe(6);
    const fechas = [...a.rows, ...b.rows].map((l) => l.createdAt);
    expect([...fechas].sort((x, y) => y.localeCompare(x))).toEqual(fechas);
  });

  it('13. un desplazamiento más allá del final devuelve vacío, no un error', async () => {
    await seed(3);
    const page = await mockStorage.queryLeads({ limit: 25, offset: 100 });
    expect(page.rows).toEqual([]);
    expect(page.total).toBe(3);
  });

  it('14. el filtro se aplica ANTES de paginar', async () => {
    await seed(4);
    const all = JSON.parse(localStorage.getItem('complyo.leads') ?? '[]');
    all[0].status = 'convertido';
    localStorage.setItem('complyo.leads', JSON.stringify(all));

    const page = await mockStorage.queryLeads({ status: 'convertido', limit: 25, offset: 0 });
    expect(page.total).toBe(1);
    expect(page.rows).toHaveLength(1);
  });

  it('15. las cifras son del filtro entero, no de la página', async () => {
    await seed(5);
    const all = JSON.parse(localStorage.getItem('complyo.leads') ?? '[]');
    for (const l of all) {
      l.status = 'convertido';
      l.revenue = 100;
    }
    localStorage.setItem('complyo.leads', JSON.stringify(all));

    const stats = await mockStorage.aggregateLeads({});
    expect(stats).toEqual({ total: 5, converted: 5, revenue: 500 });

    // Aunque la página muestre dos, las cifras siguen siendo de las cinco.
    const page = await mockStorage.queryLeads({ limit: 2, offset: 0 });
    expect(page.rows).toHaveLength(2);
    expect(stats.total).toBe(5);
  });

  it('16. cuenta los leads sin tocar', async () => {
    await seed(3);
    const all = JSON.parse(localStorage.getItem('complyo.leads') ?? '[]');
    all[0].status = 'contactado';
    localStorage.setItem('complyo.leads', JSON.stringify(all));
    expect(await mockStorage.countNewLeads()).toBe(2);
  });

  it('17. los informes se piden solo para los leads de la página', async () => {
    const uno = await mockStorage.createLead({ answers: answers() });
    const dos = await mockStorage.createLead({ answers: answers() });
    const informe = await mockStorage.createReport({
      leadId: uno.id,
      result: evaluate(answers()),
    });
    await mockStorage.createReport({ leadId: dos.id, result: evaluate(answers()) });

    const found = await mockStorage.getReportsForLeads([uno.id]);
    expect(Object.keys(found)).toEqual([uno.id]);
    expect(found[uno.id].id).toBe(informe.id);
    expect(await mockStorage.getReportsForLeads([])).toEqual({});
  });
});
