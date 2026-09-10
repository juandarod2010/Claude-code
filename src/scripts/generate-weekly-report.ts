/**
 * Genera /reports/weekly-YYYY-WW.json.
 *
 * De dónde saca los datos, por orden:
 *   1. Supabase, si VITE_MOCK=false y hay credenciales.
 *   2. Un volcado manual en /reports/export.json (lo que exportes desde el
 *      navegador en modo MOCK: los datos viven en tu localStorage y Node no
 *      puede leerlos).
 *   3. Nada: genera el informe con ceros y lo dice en `source` y en `notes`.
 *
 * Nunca inventa cifras: si no hay datos, el informe sale a cero y avisa.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { RULES } from '../data/rules';
import type { Lead, Prospect, Report } from '../lib/storage/types';
import { isMock, loadEnv, supabaseCredentials } from './lib/env';
import { buildWeeklyReport, isoWeek, type WeeklyReport } from './lib/report';

interface Dataset {
  leads: Lead[];
  reports: Report[];
  prospects: Prospect[];
  rulesVerified: number;
  source: WeeklyReport['source'];
}

const EMPTY: Dataset = {
  leads: [],
  reports: [],
  prospects: [],
  rulesVerified: RULES.filter((r) => r.verified).length,
  source: 'vacío',
};

async function fromSupabase(url: string, key: string): Promise<Dataset> {
  const db = createClient(url, key);
  const [leads, reports, prospects, rules] = await Promise.all([
    db.from('leads').select('*'),
    db.from('informes').select('*'),
    db.from('prospectos').select('*'),
    db.from('reglas').select('*'),
  ]);

  const storedVerified = (rules.data ?? []).filter(
    (r: { payload?: { verified?: boolean } }) => r.payload?.verified,
  ).length;

  return {
    leads: (leads.data ?? []).map((l: Record<string, unknown>) => ({
      ...(l as unknown as Lead),
      createdAt: l.created_at as string,
    })),
    reports: (reports.data ?? []).map((r: Record<string, unknown>) => ({
      ...(r as unknown as Report),
      createdAt: r.created_at as string,
    })),
    prospects: (prospects.data ?? []).map((p: Record<string, unknown>) => ({
      ...(p as unknown as Prospect),
      createdAt: p.created_at as string,
    })),
    rulesVerified: storedVerified + RULES.filter((r) => r.verified).length,
    source: 'supabase',
  };
}

function fromExportFile(path: string): Dataset | null {
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<Dataset>;
    return {
      leads: raw.leads ?? [],
      reports: raw.reports ?? [],
      prospects: raw.prospects ?? [],
      rulesVerified: raw.rulesVerified ?? RULES.filter((r) => r.verified).length,
      source: 'archivo',
    };
  } catch (e) {
    console.warn(`No se pudo leer ${path}: ${(e as Error).message}`);
    return null;
  }
}

async function main(): Promise<void> {
  const env = loadEnv();
  const credentials = supabaseCredentials(env);
  const exportPath = resolve(process.cwd(), 'reports/export.json');

  let dataset: Dataset = EMPTY;
  if (!isMock(env) && credentials) {
    try {
      dataset = await fromSupabase(credentials.url, credentials.key);
    } catch (e) {
      console.warn(`Supabase no respondió (${(e as Error).message}). Se sigue sin sus datos.`);
      dataset = fromExportFile(exportPath) ?? EMPTY;
    }
  } else {
    dataset = fromExportFile(exportPath) ?? EMPTY;
  }

  const report = buildWeeklyReport({ ...dataset, source: dataset.source });

  const dir = resolve(process.cwd(), 'reports');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `weekly-${report.week}.json`);
  writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Informe semanal ${isoWeek(new Date())} escrito en ${file}`);
  console.log(`Origen de los datos: ${report.source}`);
  if (report.source === 'vacío') {
    console.log(
      'Sin datos: en modo MOCK los leads viven en el localStorage del navegador.\n' +
        'Exporta desde /admin (botón de copia) a reports/export.json, o conecta Supabase.',
    );
  }
  for (const note of report.notes) console.log(`  · ${note}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
