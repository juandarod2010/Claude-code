import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isMock, loadEnv, supabaseCredentials } from '../src/scripts/lib/env';
import { adminPassword } from '../src/lib/adminAuth';
import { loadEffectiveRules } from '../src/lib/rulesSource';
import { RULES } from '../src/data/rules';

const cwd = process.cwd();
const created: string[] = [];

afterEach(() => {
  process.chdir(cwd);
  for (const dir of created.splice(0)) rmSync(dir, { recursive: true, force: true });
  delete process.env.VITE_SUPABASE_URL;
});

function withEnvFile(contents: string): void {
  const dir = mkdtempSync(join(tmpdir(), 'complyo-'));
  created.push(dir);
  writeFileSync(join(dir, '.env'), contents, 'utf8');
  process.chdir(dir);
}

describe('lectura de .env en los scripts', () => {
  it('1. parsea claves, ignora comentarios y quita comillas', () => {
    // Se usan claves que no existan ya en el entorno del proceso: el entorno
    // manda sobre el fichero, y eso se comprueba en el test siguiente.
    withEnvFile('# comentario\nCOMPLYO_A=false\nCOMPLYO_B="https://x.supabase.co"\n\nMAL\n');
    const env = loadEnv();
    expect(env.COMPLYO_A).toBe('false');
    expect(env.COMPLYO_B).toBe('https://x.supabase.co');
    expect(env.MAL).toBeUndefined();
  });

  it('2. lo que ya está en el entorno manda sobre el fichero', () => {
    withEnvFile('VITE_SUPABASE_URL=https://del-fichero.invalid\n');
    process.env.VITE_SUPABASE_URL = 'https://del-entorno.invalid';
    expect(loadEnv().VITE_SUPABASE_URL).toBe('https://del-entorno.invalid');
  });

  it('3. sin fichero .env devuelve solo el entorno', () => {
    const dir = mkdtempSync(join(tmpdir(), 'complyo-'));
    created.push(dir);
    process.chdir(dir);
    expect(() => loadEnv()).not.toThrow();
  });

  it('4. el modo MOCK es el predeterminado', () => {
    expect(isMock({})).toBe(true);
    expect(isMock({ VITE_MOCK: 'true' })).toBe(true);
    expect(isMock({ VITE_MOCK: 'false' })).toBe(false);
  });

  it('5. las credenciales exigen las dos variables', () => {
    expect(supabaseCredentials({})).toBeNull();
    expect(supabaseCredentials({ VITE_SUPABASE_URL: 'https://x' })).toBeNull();
    expect(
      supabaseCredentials({ VITE_SUPABASE_URL: 'https://x', VITE_SUPABASE_ANON_KEY: 'k' }),
    ).toEqual({ url: 'https://x', key: 'k' });
  });
});

describe('otras utilidades', () => {
  it('6. la contraseña de admin cae a la de desarrollo si no hay variable', () => {
    expect(adminPassword()).toBe('complyo-dev');
  });

  it('7. sin reglas en base de datos se usan las del código', async () => {
    const effective = await loadEffectiveRules();
    expect(effective).toHaveLength(RULES.length);
  });
});
