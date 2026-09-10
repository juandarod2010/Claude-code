import { beforeEach, describe, expect, it, vi } from 'vitest';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  clear() {
    this.data.clear();
  }
}

const memory = new MemoryStorage();
vi.stubGlobal('localStorage', memory);

const { deleteDraft, draftKey, listDrafts, loadDraft, saveDraft } = await import(
  '../src/lib/poaDraft'
);
const { emptyPlan } = await import('../src/modules/appeals/poa-template');

beforeEach(() => memory.clear());

describe('borradores del Plan of Action', () => {
  it('1. un caso sin lead se guarda bajo una clave propia', () => {
    expect(draftKey(null)).toBe('suelto');
    expect(draftKey('lead-1')).toBe('lead-1');
  });

  it('2. guarda y recupera un borrador', () => {
    const plan = { ...emptyPlan('Tienda X', 'ODR'), daysSuspended: 5 };
    saveDraft({ plan, type: 'order_defect_rate', leadId: 'lead-1' });
    const loaded = loadDraft('lead-1');
    expect(loaded?.plan.sellerName).toBe('Tienda X');
    expect(loaded?.type).toBe('order_defect_rate');
    expect(loaded?.updatedAt).toBeTruthy();
  });

  it('3. cada caso tiene su borrador y no se pisan', () => {
    saveDraft({ plan: emptyPlan('Uno'), type: 'unknown', leadId: 'a' });
    saveDraft({ plan: emptyPlan('Dos'), type: 'unknown', leadId: 'b' });
    saveDraft({ plan: emptyPlan('Suelto'), type: 'unknown', leadId: null });
    expect(loadDraft('a')?.plan.sellerName).toBe('Uno');
    expect(loadDraft('b')?.plan.sellerName).toBe('Dos');
    expect(loadDraft(null)?.plan.sellerName).toBe('Suelto');
    expect(listDrafts()).toHaveLength(3);
  });

  it('4. volver a guardar el mismo caso lo sustituye', () => {
    saveDraft({ plan: emptyPlan('Antes'), type: 'unknown', leadId: 'a' });
    saveDraft({ plan: emptyPlan('Después'), type: 'unknown', leadId: 'a' });
    expect(listDrafts()).toHaveLength(1);
    expect(loadDraft('a')?.plan.sellerName).toBe('Después');
  });

  it('5. borrar un borrador no toca los demás', () => {
    saveDraft({ plan: emptyPlan('Uno'), type: 'unknown', leadId: 'a' });
    saveDraft({ plan: emptyPlan('Dos'), type: 'unknown', leadId: 'b' });
    deleteDraft('a');
    expect(loadDraft('a')).toBeNull();
    expect(loadDraft('b')).not.toBeNull();
  });

  it('6. un almacenamiento corrupto no rompe la lectura', () => {
    memory.setItem('complyo.poa-drafts', 'esto no es json');
    expect(loadDraft('a')).toBeNull();
    expect(listDrafts()).toEqual([]);
  });
});
