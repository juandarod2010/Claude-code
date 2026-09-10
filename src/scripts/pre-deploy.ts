/**
 * Comprobación previa al despliegue.
 *
 * No despliega nada: revisa lo que suele olvidarse y que, si se te pasa, se
 * nota en producción y no antes.
 *
 * Uso: npm run predeploy:check
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { APPEALS, BRAND, DISCLAIMER, SERVICE_COMMITMENTS } from '../config/brand';
import { RULES } from '../data/rules';
import { isMock, loadEnv, supabaseCredentials } from './lib/env';

type Level = 'bloqueante' | 'aviso';

interface Finding {
  level: Level;
  message: string;
  fix: string;
}

const findings: Finding[] = [];
const add = (level: Level, message: string, fix: string) => findings.push({ level, message, fix });

const env = loadEnv();

// --- Datos regulatorios ------------------------------------------------------
const verified = RULES.filter((r) => r.verified).length;
if (verified === 0) {
  add(
    'bloqueante',
    `Ninguna de las ${RULES.length} obligaciones está verificada.`,
    'Rellénalas en /admin/fill-rules siguiendo RULES-GUIDE.md. Hasta entonces, el informe sale marcado como PENDIENTE DE VERIFICACIÓN y no se le puede enseñar a un cliente.',
  );
} else if (verified < RULES.length) {
  add(
    'aviso',
    `Solo ${verified} de ${RULES.length} obligaciones están verificadas.`,
    'Las que falten saldrán marcadas como pendientes en el informe.',
  );
}

// --- Marca y textos ----------------------------------------------------------
if (BRAND.domain === 'complyo.eu' || BRAND.contactEmail === 'hola@complyo.eu') {
  add(
    'aviso',
    'La marca sigue con los valores de relleno (complyo.eu).',
    'Cámbialos en src/config/brand.ts. Es un solo fichero.',
  );
}

if (!DISCLAIMER.includes('no constituye asesoramiento jurídico')) {
  add(
    'bloqueante',
    'El descargo de responsabilidad ha cambiado y ya no dice lo esencial.',
    'Revisa DISCLAIMER en src/config/brand.ts: va en el pie de la web y de cada página del PDF.',
  );
}

if (DISCLAIMER.includes('socios establecidos en la Unión Europea')) {
  add(
    'aviso',
    'El descargo afirma que las altas se tramitan con socios establecidos en la UE.',
    'Si ese acuerdo todavía no existe, el descargo dice algo que no es verdad. Ciérralo o cambia el texto.',
  );
}

if (SERVICE_COMMITMENTS.reportDelivery.includes('24 horas')) {
  add(
    'aviso',
    'Sigues prometiendo el informe en 24 horas.',
    'Asegúrate de poder cumplirlo, o ajusta SERVICE_COMMITMENTS en src/config/brand.ts.',
  );
}

if (APPEALS.successRate === null) {
  add(
    'aviso',
    'La página de apelaciones no publica tasa de éxito (correcto si aún no tienes casos cerrados).',
    'Cuando los tengas, rellena APPEALS.successRate con la cifra y el tamaño de la muestra.',
  );
}

// --- Entorno -----------------------------------------------------------------
if (isMock(env)) {
  add(
    'bloqueante',
    'VITE_MOCK sigue en true: cada lead se guardaría en el navegador del visitante.',
    'Conecta Supabase (SUPABASE.md) y pon VITE_MOCK=false en las variables de entorno del despliegue.',
  );
} else if (!supabaseCredentials(env)) {
  add(
    'bloqueante',
    'VITE_MOCK=false pero faltan las claves de Supabase.',
    'Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  );
}

const password = env.VITE_ADMIN_PASSWORD;
if (!password || password === 'complyo-dev') {
  add(
    'bloqueante',
    'La contraseña del panel es la de desarrollo, que está escrita en el README.',
    'Cambia VITE_ADMIN_PASSWORD. Con Supabase conectado, el panel pide además correo y contraseña reales.',
  );
}

if (env.VITE_SUPABASE_SERVICE_ROLE || env.SUPABASE_SERVICE_ROLE_KEY) {
  add(
    'bloqueante',
    'Hay una clave service_role en el entorno del cliente.',
    'Quítala. Esa clave salta Row Level Security y acabaría dentro del JavaScript que descarga cualquiera.',
  );
}

// --- Build -------------------------------------------------------------------
const indexPath = resolve(process.cwd(), 'dist/index.html');
if (!existsSync(indexPath)) {
  add('aviso', 'No hay build reciente en dist/.', 'Ejecuta npm run build antes de desplegar.');
} else if (readFileSync(indexPath, 'utf8').includes('complyo-dev')) {
  add('bloqueante', 'El build contiene la contraseña de desarrollo.', 'Reconstruye con las variables de entorno correctas.');
}

for (const file of ['vercel.json', 'netlify.toml']) {
  if (!existsSync(resolve(process.cwd(), file))) {
    add('aviso', `Falta ${file}.`, 'Sin la redirección a index.html, /informe/:id se rompe al recargar.');
  }
}

// --- Salida ------------------------------------------------------------------
const blockers = findings.filter((f) => f.level === 'bloqueante');

if (findings.length === 0) {
  console.log('predeploy:check OK — nada que objetar.');
  process.exit(0);
}

for (const f of findings) {
  console.log(`${f.level === 'bloqueante' ? '✗' : '!'} ${f.message}`);
  console.log(`   → ${f.fix}\n`);
}

console.log(`${blockers.length} bloqueante(s), ${findings.length - blockers.length} aviso(s).`);
if (blockers.length > 0) {
  console.log('\nEsto no impide desplegar por la fuerza, pero cada bloqueante es algo que');
  console.log('se va a notar con un cliente delante.');
}
process.exit(blockers.length === 0 ? 0 : 1);
