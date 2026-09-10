# Puesta en marcha en local

Cinco minutos, sin cuentas ni claves.

## 1. Clonar

```bash
git clone https://github.com/juandarod2010/Claude-code
cd Claude-code
```

## 2. Instalar

```bash
npm install
```

Node 20 o superior.

## 3. Variables de entorno

```bash
cp .env.example .env
```

Déjalo tal cual: `VITE_MOCK=true` hace que todo se guarde en el `localStorage`
del navegador. No hace falta nada más para que funcione de punta a punta.

## 4. Arrancar

```bash
npm run dev
```

## 5. Visitar

http://localhost:5173

## 6. Recorrido de prueba

**Track B — cumplimiento**

1. Landing → «Ver mi exposición».
2. Responde las 8 preguntas.
3. Sale el informe con su número (`INFORME-YYYYMMDD-XXXX`) y todas las
   obligaciones marcadas como **PENDIENTE DE VERIFICACIÓN**. Es lo correcto:
   los datos que trae el repositorio son ficticios.
4. «Descargar en PDF» → A4, texto seleccionable, descargo en el pie de cada
   página.

**Track A — apelaciones**

5. Ve a `/appeals`, pega un correo de suspensión de Amazon (o descríbelo) y
   mira cómo lo clasifica antes de enviarlo.

**Panel interno** (contraseña: `complyo-dev`)

6. `/admin/leads` — los dos leads, con filtros, estado, ingresos y notas.
7. `/admin/poa` — redacta el Plan of Action del caso de apelación: te puntúa lo
   completo que está y te dice qué falta.
8. `/prospeccion` — genera los mensajes A y B, y marca quién respondió.
9. `/admin/ab` — compara las dos variantes.
10. `/admin/fill-rules` — rellena una obligación con la guía de EUR-Lex al lado.
11. `/admin/rules-status` — mira cómo sube el contador de 18.
12. `/admin/rules-history` — cambia una obligación que ya habías guardado y mira
    cómo queda registrado campo a campo. Eso es lo que vende la vigilancia.

## 7. Comprobaciones

```bash
npm run build          # compila; debe terminar sin errores
npm run lint           # debe salir limpio
npm test               # 101 tests + cobertura mínima del 80 %
npm run health:check   # revisa entorno, tablas, reglas, PDF y rutas
npm run rules:check    # DEBE FALLAR: es el guardarraíl de los datos de ejemplo
npm run test:e2e       # recorrido completo en un navegador de verdad
```

Para el recorrido, la primera vez: `npx playwright install chromium`.

Que `rules:check` falle es lo esperado hasta que la base de reglas esté
verificada. Si algún día pasa a verde, es que has terminado de rellenarla.

## 8. Cuando quieras ir en serio

1. Conectar Supabase → **SUPABASE.md**.
2. Rellenar las reglas → **RULES-GUIDE.md** y `/admin/fill-rules`.
3. Pasar el descargo de responsabilidad por un abogado.
4. Cambiar `VITE_ADMIN_PASSWORD`.
5. Desplegar → sección «Desplegar» del README.

El orden y el resto de pendientes están en **NEXT-STEPS.md**.
