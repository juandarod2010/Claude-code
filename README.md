# Complyo — MVP

Máquina de generar informes de exposición al cumplimiento RAP (responsabilidad
ampliada del productor) en la Unión Europea, más una herramienta de prospección
asistida.

No es un producto completo. Hace tres cosas:

1. Un desconocido responde 8 preguntas en `/diagnostico`.
2. La aplicación genera un informe en pantalla y en PDF en `/informe/:id`.
3. Tú ves el lead en `/admin` y redactas el mensaje de contacto en `/prospeccion`.

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
| `npm test` | Vitest (motor de reglas y plantillas) |
| `npm run rules:check` | Guardarraíl de la base de reglas |

### `npm run rules:check` **debe fallar** ahora mismo

Con los datos de ejemplo sale con código 1 y lista 54 problemas. Es lo correcto:
demuestra que el guardarraíl funciona. Solo pasará a verde cuando cada obligación
tenga `verified: true`, una `sourceUrl` oficial real y una `sourceCheckedAt` con
la fecha en que la leíste.

## Rutas

| Ruta | Acceso | Qué es |
| --- | --- | --- |
| `/` | pública | Landing de una pantalla |
| `/diagnostico` | pública | 8 preguntas, una por pantalla |
| `/informe/:id` | por enlace | Informe en pantalla + descarga PDF |
| `/admin` | contraseña | Lista de leads con filtros |
| `/prospeccion` | contraseña | Generador de mensajes A/B |

## Estructura

```
src/
  config/brand.ts       ← marca, textos, precios, descargo de responsabilidad
  data/rules/           ← esquema + base de reglas (AHORA MISMO, DATOS FICTICIOS)
  lib/engine/           ← motor de reglas (función pura, testeable)
  lib/pdf/              ← generación del PDF con jsPDF
  lib/prospecting/      ← plantillas A y B
  lib/storage/          ← localStorage y Supabase tras la misma interfaz
  pages/                ← una pantalla por ruta
supabase/migrations/    ← esquema SQL con Row Level Security
scripts/rules-check.ts  ← guardarraíl
```

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
informes. Para que `/admin` lea de Supabase hace falta un usuario autenticado:
ver NEXT-STEPS.md. Mientras tanto, `/admin` funciona en modo MOCK.

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
