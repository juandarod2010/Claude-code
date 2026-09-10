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

6. **Conectar Supabase** → SUPABASE.md. Sin esto, cada lead vive en el navegador
   del visitante y **tú no lo ves nunca**.

7. **Crear tu usuario de Supabase y añadir el inicio de sesión en `/admin`.**
   Con RLS activado la lectura exige rol `authenticated`. Son unas 30 líneas con
   Supabase Auth. Mientras tanto, los leads se consultan desde el Table Editor.
   Nunca la clave `service_role` en el navegador.

8. **Cambiar `VITE_ADMIN_PASSWORD`.** La de por defecto es `complyo-dev` y está
   escrita en el README. Y recuerda que esa contraseña viaja dentro del
   JavaScript: es un portero contra visitas casuales, no seguridad.

9. **Decidir la marca real.** Ahora dice Complyo, `complyo.eu` y
   `hola@complyo.eu`, todo de relleno. Un solo fichero: `src/config/brand.ts`.
   Ahí están también los colores del PDF y el hueco del logo (`BRAND_LOGO`).

10. **Ajustar `SERVICE_COMMITMENTS`.** Promete informe en 24 horas y alta
    iniciada al confirmar el pago. Son promesas tuyas.

11. **Desplegar.** `vercel.json` y `netlify.toml` están listos, con la
    redirección de rutas a `index.html`. `npm run deploy` usa la CLI de Vercel.

12. **Resolver el aviso de lead nuevo.** Hoy nadie te avisa y al cliente no se le
    envía ningún correo: el texto está listo en `/templates/email-diagnosis-sent.txt`
    y se copia desde `/admin/leads` con el botón «Correo», pero lo envías tú a
    mano. Con Supabase conectado, un Database Webhook a un servicio gratuito de
    automatización lo resuelve sin backend propio.

---

## Bloque 2 — Ideas que me guardé en vez de construir

Ninguna está en el código.

- Envío automático del PDF por correo al cliente.
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
