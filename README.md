# Complyo — MVP

Dos líneas de negocio sobre la misma base de código:

- **Track A — apelaciones.** Reactivar cuentas de Amazon suspendidas. Cobra
  antes y no depende de ningún dato regulatorio.
- **Track B — cumplimiento.** Informes de exposición al cumplimiento RAP
  (responsabilidad ampliada del productor) en la Unión Europea.

No es un producto completo, y a propósito.

```
TRACK A   Buscar caso ─▶ Enviar mensaje (A/B) ─▶ Respuesta ─▶ Redactar POA ─▶ Cobrar 1.500 $ ─▶ Reactivada
          plantillas + analizador de correos + captación en /appeals

TRACK B   Diagnóstico gratis ─▶ Informe 97 $ ─▶ Resolución 349–499 $ ─▶ Vigilancia 39 $/mes ─▶ ¿Datos del SKU?
          8 preguntas       PDF en 24 h     con socio en la UE      fuentes revisadas    (sin construir)
```

Diagrama completo, con los bloqueantes de cada track: [`public/flowchart.svg`](public/flowchart.svg).

> **La base de reglas que viene en el repositorio es FICTICIA.** Todos los
> registros están marcados con `__EJEMPLO__` y con `verified: false`. Antes de
> enseñar un informe a un cliente hay que rellenarla con datos reales de fuentes
> oficiales: ver **RULES-GUIDE.md**.

## Arrancar en local

```bash
npm install
cp .env.example .env     # funciona tal cual: VITE_MOCK=true, sin claves
npm run dev              # http://localhost:5173
```

En modo MOCK los leads, informes y prospectos se guardan en el `localStorage` de
tu navegador. No hace falta ninguna cuenta.

Contraseña del panel interno en desarrollo: `complyo-dev` (o la que pongas en
`VITE_ADMIN_PASSWORD`).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run preview` | Sirve `dist/` para comprobar el build |
| `npm run lint` | ESLint |
| `npm test` | Vitest con cobertura (146 tests, mínimo 80 % sobre la lógica) |
| `npm run test:e2e` | Recorrido completo en Chromium contra el build |
| `npm run rules:check` | Guardarraíl de la base de reglas |
| `npm run health:check` | Revisa entorno, tablas, reglas, PDF y rutas |
| `npm run report:weekly` | Genera `reports/weekly-YYYY-WW.json` |
| `npm run backup:rules` | Vuelca la base de reglas a `backups/` |
| `npm run predeploy:check` | Revisa lo que se suele olvidar antes de desplegar |
| `npm run deploy` | `vercel deploy --prod` (requiere la CLI de Vercel) |

### `npm run rules:check` **debe fallar** ahora mismo

Con los datos de ejemplo sale con código 1 y lista 54 problemas. Es lo correcto:
demuestra que el guardarraíl funciona. Solo pasará a verde cuando cada obligación
tenga `verified: true`, una `sourceUrl` oficial real y una `sourceCheckedAt` con
la fecha en que la leíste.

## Rutas

| Ruta | Acceso | Qué es |
| --- | --- | --- |
| `/` | pública | Landing de una pantalla (Track B) |
| `/appeals` | pública | Landing de apelaciones con analizador (Track A) |
| `/diagnostico` | pública | 8 preguntas, una por pantalla |
| `/informe/:id` | por enlace | Informe en pantalla + descarga PDF |
| `/admin/leads` | contraseña | Leads de los dos tracks: filtros, estado, ingresos, notas |
| `/admin/rules-status` | contraseña | Cuántas de las 18 obligaciones están completas |
| `/admin/poa` | contraseña | Editor del Plan of Action (Track A) |
| `/admin/ab` | contraseña | Comparación de las variantes A y B |
| `/admin/fill-rules` | contraseña | Alta de obligaciones + guía de EUR-Lex |
| `/admin/rules-history` | contraseña | Qué cambió en la base de reglas y cuándo |
| `/prospeccion` | contraseña | Generador de mensajes A/B |

`/admin` redirige a `/admin/leads`.

## Dónde está cada cosa

```
src/
  config/brand.ts            ← marca, textos, precios, colores, descargo
  data/rules/                ← esquema + base de reglas (HOY, DATOS FICTICIOS)
  lib/
    engine/                  ← motor de reglas (función pura, testeable)
    pdf/reportPdf.ts         ← PDF A4 con jsPDF (texto, no captura)
    prospecting/templates.ts ← mensajes de prospección A y B
    storage/                 ← localStorage y Supabase tras la misma interfaz
    rulesSource.ts           ← combina reglas del código y de la base de datos
    emailTemplates.ts        ← correos de entrega y de primera respuesta
    abStats.ts               ← comparación A/B (cuenta, no infiere)
    rulesHistory.ts          ← qué cambió en cada obligación: la vigilancia
    poaDraft.ts              ← borradores del Plan of Action
    reportReference.ts       ← número INFORME-YYYYMMDD-XXXX
  modules/
    appeals/                 ← TRACK A
      messages.ts            ←   variantes A (urgencia) y B (solución)
      analyzer.ts            ←   clasificador del correo de Amazon
      poa-template.ts        ←   Plan of Action: estructura y salida
    complyo/                 ← TRACK B
      rules-validator.ts     ←   validación antes de guardar una obligación
      eur-lex-guide.tsx      ←   guía interactiva con checklist
  pages/                     ← una pantalla por ruta
  scripts/                   ← rules-check, informe semanal, health check, backup
e2e/                         ← recorrido completo en navegador
supabase/migrations/         ← esquema SQL con Row Level Security
templates/                   ← plantillas de correo editables a mano
public/flowchart.svg         ← el diagrama de arriba, completo
```

## Checklist de puesta en marcha

- [ ] `npm install && cp .env.example .env && npm run dev` → **SETUP.md**
- [ ] Recorrer los dos tracks en local
- [ ] Conectar Supabase → **SUPABASE.md**
- [ ] Rellenar la base de reglas → **RULES-GUIDE.md** y `/admin/fill-rules`
- [ ] Pasar el descargo de responsabilidad por un abogado
- [ ] Cambiar `VITE_ADMIN_PASSWORD` y crear tu usuario de Supabase
- [ ] Configurar el aviso de lead nuevo (SUPABASE.md, sección 7)
- [ ] `npm run predeploy:check` y resolver los bloqueantes
- [ ] Desplegar

El orden completo y lo que falta: **NEXT-STEPS.md**.

## Cambiar la marca

Todo el texto de marca vive en `src/config/brand.ts`: nombre, dominio, correo,
titular de la landing, precios y descargo de responsabilidad. Cambia ese fichero
y no hay que tocar nada más. El nombre del fichero PDF se deriva del nombre de
marca automáticamente.

El descargo de responsabilidad (`DISCLAIMER`) es obligatorio y aparece en el pie
de la web y en el pie de **todas** las páginas del PDF. No lo quites.

## Conectar Supabase (opcional)

1. Crea un proyecto en supabase.com (plan gratuito).
2. Ejecuta `supabase/migrations/0001_init.sql` en el SQL Editor.
3. En `.env`: `VITE_MOCK=false`, más `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API).

Con Row Level Security activado, la clave anónima solo puede **insertar** leads e
informes. Para leerlos hace falta una sesión: en cuanto detecta Supabase, el
panel pide correo y contraseña en vez de la contraseña local. Crea tu usuario en
Authentication → Users (SUPABASE.md, sección 6).

Si pones `VITE_MOCK=false` sin claves, la aplicación avisa por consola y sigue
funcionando con `localStorage`. Nunca se rompe por falta de credenciales.

## Desplegar

El proyecto es estático: `dist/`. No hay backend.

**Vercel** — `vercel.json` ya está listo. Importa el repositorio, framework Vite,
y añade las variables de entorno que quieras usar en Project Settings.

**Netlify** — `netlify.toml` ya está listo. Build `npm run build`, publish `dist`.

Ambos ficheros incluyen la redirección de todas las rutas a `index.html`, que es
imprescindible para que `/informe/:id` funcione al recargar la página.

Recuerda: las variables `VITE_*` acaban dentro del JavaScript que descarga el
navegador. No pongas ahí nada que sea un secreto de verdad (en particular, jamás
la clave `service_role` de Supabase).
