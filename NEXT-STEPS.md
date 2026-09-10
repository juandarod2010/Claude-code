# Qué queda, en orden

Actualizado al terminar la fase 2.

---

## Bloque 0 — Lo único que te bloquea de verdad

Todo lo demás está construido y funcionando. Esto no lo puede hacer una máquina:
hay que leer fuentes oficiales y hablar con personas.

1. **Rellenar la base de reglas.** 18 combinaciones (6 países × 3 flujos).
   Se hace en `/admin/fill-rules`, con la guía de EUR-Lex desplegada al lado, y
   el avance se ve en `/admin/rules-status`. Método completo en RULES-GUIDE.md.
   Hasta que esto esté, cada obligación del informe sale marcada como
   **PENDIENTE DE VERIFICACIÓN** y el informe no se le puede enseñar a un
   cliente. Es el bloqueante del Track B entero.

2. **Verificar el Reglamento (UE) 2025/40 y su fecha de aplicación** en EUR-Lex.
   Es el único dato normativo escrito en el código (`src/config/brand.ts`) y
   viene de tu encargo, no de una fuente consultada. Aparece en la landing, en
   el informe y en las dos plantillas de prospección.

3. **Cerrar el acuerdo con el socio establecido en la Unión Europea.** El
   descargo de responsabilidad afirma que las altas se tramitan a través de
   socios establecidos en la UE. Si ese socio no existe todavía, el descargo
   dice algo que no es verdad, y va en el pie de cada página del PDF.

4. **Pasar el descargo por un abogado.** `DISCLAIMER` en `src/config/brand.ts`.

5. **Track A: reunir tus primeros casos cerrados.** La página `/appeals` no
   publica ninguna tasa de éxito porque no hay nada que la respalde. Cuando
   tengas casos, rellena `APPEALS.successRate` con la cifra y el tamaño de la
   muestra, y la página la enseña sola.

---

## Bloque 1 — Para operar de verdad (una tarde)

El código de este bloque **ya está hecho**. Lo que queda son tus claves y tus
decisiones. Ejecuta `npm run predeploy:check` y te dice exactamente qué falta.

6. **Conectar Supabase** → SUPABASE.md. Sin esto, cada lead vive en el navegador
   del visitante y **tú no lo ves nunca**. Tres migraciones y dos variables.

7. ~~Añadir inicio de sesión en `/admin`~~ **Hecho.** El panel detecta si hay
   Supabase: si lo hay, pide correo y contraseña reales contra Supabase Auth, y
   esa sesión es la que hace que RLS te deje leer. Si no lo hay, sigue el
   portero local. Solo te queda **crear tu usuario** en Authentication → Users
   (SUPABASE.md, sección 6). Nunca la `service_role` en el navegador.

8. **Cambiar `VITE_ADMIN_PASSWORD`.** La de por defecto es `complyo-dev` y está
   escrita en el README. Con Supabase conectado deja de ser la puerta, pero
   sigue siendo la del modo local.

9. **Decidir la marca real.** Ahora dice Complyo, `complyo.eu` y
   `hola@complyo.eu`, todo de relleno. Un solo fichero: `src/config/brand.ts`.
   Ahí están también los colores del PDF y el hueco del logo (`BRAND_LOGO`).

10. **Ajustar `SERVICE_COMMITMENTS`.** Promete informe en 24 horas y alta
    iniciada al confirmar el pago. Son promesas tuyas.

11. **Desplegar.** `vercel.json` y `netlify.toml` están listos, con la
    redirección de rutas a `index.html`. Antes: `npm run predeploy:check`, que
    revisa marca, descargo, claves, contraseña y build. Hay CI en
    `.github/workflows/ci.yml` con lint, build, tests y comprobación de salud.

12. **Configurar el aviso de lead nuevo.** El disparador está escrito
    (`supabase/migrations/0003_avisos.sql`): ejecuta la migración y pega tu URL
    en la tabla `ajustes`. Instrucciones en SUPABASE.md, sección 7. Mientras
    tanto, el contador junto a «Leads» dice cuántos hay sin tocar.

    El correo al cliente lo sigues enviando tú: el botón «Correo» de
    `/admin/leads` copia el texto que toca según el tipo de lead (entrega del
    diagnóstico, o primera lectura del caso de Amazon con los próximos pasos del
    analizador ya metidos). Las versiones editables están en `/templates/`.

---

## Bloque 2 — Ideas que me guardé en vez de construir

Ninguna está en el código.

- Envío automático del PDF por correo al cliente (hoy el texto se copia y lo
  envías tú).
- Cobro del informe y del análisis de apelación (enlace de pago externo pegado
  en el botón, sin integración).
- Panel de tasa de respuesta A/B con serie temporal. Los datos ya se guardan
  (`prospectos.responded`, `leads.variant`) y el informe semanal ya los cuenta:
  falta solo la pantalla.
- Editor del Plan of Action dentro del panel: hoy `poa-template.ts` genera el
  documento, pero el caso se rellena desde código o desde un JSON.
- Historial de versiones de la base de reglas, para decirle a un cliente qué
  cambió desde su último informe. Es el argumento natural de la suscripción de
  vigilancia.
- Versión del informe en inglés, para socios que no hablan español.
- Más países y más flujos: el esquema y el motor los soportan sin cambios.
- Un caso por país en los tests del motor, cuando la base de reglas sea real.

---

## Deuda técnica conocida

- **`/admin/leads` carga todo de golpe** (leads, informes y prospectos). Con
  cientos va bien; con decenas de miles habría que paginar.
- **`npm run rules:check` solo mira las reglas del código.** Las que guardes
  desde el panel se validan al guardarlas y se revisan en `/admin/rules-status`,
  pero no entran en ese script. Cuando la base viva entera en Supabase, conviene
  que el script lea también de ahí.
- **En modo MOCK los informes dependen del `localStorage` del visitante**: si lo
  borra, el enlace `/informe/:id` deja de resolver. Se arregla al conectar
  Supabase.
- **El analizador de suspensiones es un clasificador por palabras clave.**
  Acierta en los casos típicos y falla en los redactados de forma inusual. Por
  eso nunca dice más del 90 % de confianza y siempre lleva descargo.
- **La cobertura de tests mide la lógica, no las pantallas.** Las pantallas se
  verifican con el recorrido completo en Chromium, que no está automatizado en
  el repositorio: lo ejecuté a mano en cada fase.
- **El motor no distingue** entre «no hay obligación en ese país» y «ese país no
  está cargado todavía»: lo segundo sale como aviso al operador, no al cliente.
  Revísalo cuando la base esté completa.
