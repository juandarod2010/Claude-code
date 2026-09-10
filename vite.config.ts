/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // Se mide la LÓGICA, que es lo que los tests pueden cubrir de verdad sin
      // levantar un navegador: motor de reglas, validador, apelaciones,
      // plantillas y utilidades. Las pantallas (.tsx) se verifican con el
      // recorrido en Chromium, no con cobertura. Ver DECISIONS.md.
      include: [
        'src/lib/**/*.ts',
        'src/modules/**/*.ts',
        'src/data/**/*.ts',
        'src/config/**/*.ts',
        'src/types/**/*.ts',
        'src/scripts/lib/**/*.ts',
      ],
      exclude: ['src/lib/storage/supabase.ts', 'src/lib/storage/index.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 75,
      },
    },
  },
});
