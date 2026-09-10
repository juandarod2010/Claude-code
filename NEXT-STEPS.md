# Qué queda, en orden

## Bloque 1 — Antes de enseñárselo a nadie (bloqueante)

1. **Rellenar la base de reglas.** `src/data/rules/index.ts`, siguiendo
   RULES-GUIDE.md. Hasta que `npm run rules:check` salga en verde, cada
   obligación se imprime con la etiqueta `PENDIENTE DE VERIFICACIÓN — no usar
   con cliente`, y con razón. Es el trabajo más largo y no lo puede hacer una
   máquina: hay que leer seis administraciones nacionales.
2. **Verificar el Reglamento (UE) 2025/40 y su fecha de aplicación** en EUR-Lex.
   Es el único dato normativo que hay escrito en el código (en
   `src/config/brand.ts`) y viene de tu encargo, no de una fuente consultada.
   Está también en la landing y en las dos plantillas de prospección.
3. **Revisar el descargo de responsabilidad con un abogado.** Está en
   `DISCLAIMER`, en `src/config/brand.ts`, y sale en el pie de la web y de todas
   las páginas del PDF.
4. **Decidir la marca de verdad.** Ahora dice Complyo, dominio `complyo.eu` y
   correo `hola@complyo.eu`, que son de relleno. Un solo fichero:
   `src/config/brand.ts`.
5. **Ajustar los compromisos de servicio.** `SERVICE_COMMITMENTS`: prometen
   informe en 24 horas y alta iniciada al confirmar el pago. Son promesas tuyas;
   asegúrate de poder cumplirlas.
6. **Cerrar el acuerdo con el socio establecido en la UE.** El descargo dice que
   las altas se tramitan a través de socios establecidos en la Unión Europea. Si
   ese socio todavía no existe, el descargo dice algo que no es verdad.

## Bloque 2 — Para operar de verdad (una tarde)

7. **Conectar Supabase.** Crear el proyecto, ejecutar
   `supabase/migrations/0001_init.sql`, poner `VITE_MOCK=false` y las dos claves.
   Sin esto, cada lead vive solo en el navegador del visitante y **tú no lo ves
   nunca**: en modo MOCK, `/admin` solo muestra lo que se haya generado en tu
   propio navegador. Este es el punto que convierte el juguete en negocio.
8. **Crear tu usuario de Supabase para leer desde `/admin`.** Con RLS activado,
   la lectura exige el rol `authenticated`. Hay que añadir un inicio de sesión de
   Supabase Auth en el panel interno (unas 30 líneas) o, si prefieres no tocar
   código, consultar los leads desde el propio panel de Supabase. **Nunca pongas
   la clave `service_role` en el navegador.**
9. **Cambiar `VITE_ADMIN_PASSWORD`.** La de por defecto es `complyo-dev` y está
   escrita en el README. Y ten claro que esa contraseña viaja dentro del
   JavaScript: es un portero contra visitas casuales, no seguridad. Lo que de
   verdad protege los datos es RLS.
10. **Desplegar.** `vercel.json` y `netlify.toml` ya están listos, con la
    redirección de rutas a `index.html`. Falta elegir uno, conectar el
    repositorio y cargar las variables de entorno.
11. **Avisar de que llega el informe.** Ahora mismo el visitante ve el informe en
    pantalla y se lo puede descargar, pero **no se le envía ningún correo** y a ti
    no te avisa nada. Hasta que resuelvas esto, hay que mirar `/admin` a mano.

## Bloque 3 — Ideas que me guardé en vez de construir

Ninguna de estas está en el código, tal como pediste.

- Aviso por correo al operador cuando entra un lead (Supabase Database Webhook a
  un servicio gratuito de automatización; sigue sin backend propio).
- Envío del PDF por correo al cliente, en lugar de descarga manual.
- Cobro del informe (enlace de pago externo pegado en el CTA; sin integración).
- Versión del informe en inglés, para vendedores hispanohablantes con socios que
  no lo son.
- Historial de versiones de la base de reglas, para poder decirle a un cliente
  qué cambió desde su último informe. Es el argumento natural de la suscripción
  de vigilancia.
- Panel de tasa de respuesta por variante A/B. Los datos ya se guardan en la
  tabla `prospectos`; falta solo la pantalla y un campo de "respondió".
- Más países y más flujos de residuo. El esquema y el motor ya los soportan sin
  cambios: es puro trabajo de base de reglas.
- Un caso por país en los tests del motor cuando la base de reglas sea real.

## Deuda técnica conocida

- `/admin` carga todos los leads y luego un informe por lead, en paralelo. Con
  cientos de leads irá bien; con decenas de miles habría que paginar.
- El motor no distingue entre "no hay obligación en ese país" y "no hemos
  cargado ese país todavía": lo segundo sale como aviso al operador, no al
  cliente. Cuando la base esté completa, conviene revisarlo.
- Los informes en modo MOCK dependen del `localStorage` del visitante: si borra
  los datos del navegador, el enlace `/informe/:id` deja de resolver. Se arregla
  solo al conectar Supabase (punto 7).
