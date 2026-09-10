import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Sin Supabase configurado (que es el estado por defecto del repositorio), el
 * panel usa el portero local. Los tests de la ruta con sesión de Supabase
 * necesitarían un proyecto real: eso se comprueba con `npm run health:check`
 * contra el proyecto de verdad, no aquí.
 */
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
vi.stubGlobal('sessionStorage', memory);

const { adminPassword, authMode, currentSession, onSessionChange, signIn, signOut } = await import(
  '../src/lib/adminAuth'
);

beforeEach(() => memory.clear());

describe('acceso al panel interno', () => {
  it('1. sin Supabase configurado usa el modo contraseña', () => {
    expect(authMode()).toBe('password');
  });

  it('2. la contraseña por defecto es la de desarrollo', () => {
    expect(adminPassword()).toBe('complyo-dev');
  });

  it('3. no hay sesión hasta que se entra', async () => {
    expect(await currentSession()).toBeNull();
  });

  it('4. una contraseña correcta abre sesión y persiste', async () => {
    const result = await signIn({ password: 'complyo-dev' });
    expect(result.error).toBeNull();
    expect(result.session?.mode).toBe('password');
    expect(await currentSession()).not.toBeNull();
  });

  it('5. una contraseña incorrecta no abre sesión', async () => {
    const result = await signIn({ password: 'lo-que-sea' });
    expect(result.session).toBeNull();
    expect(result.error).toBe('Contraseña incorrecta.');
    expect(await currentSession()).toBeNull();
  });

  it('6. salir cierra la sesión', async () => {
    await signIn({ password: 'complyo-dev' });
    await signOut();
    expect(await currentSession()).toBeNull();
  });

  it('7. sin Supabase no hay nada a lo que suscribirse y no rompe', () => {
    const unsubscribe = onSessionChange(() => {});
    expect(() => unsubscribe()).not.toThrow();
  });
});
