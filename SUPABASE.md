# Conectar Supabase

Mientras estés en modo MOCK, cada visitante guarda su lead en **su propio
navegador** y tú no lo ves nunca. Conectar Supabase es lo que convierte esto en
un negocio.

Plan gratuito, sin tarjeta.

## 1. Crear el proyecto

1. Entra en supabase.com y crea un proyecto.
2. Elige una región de la Unión Europea: vas a guardar correos de clientes
   europeos.
3. Guarda la contraseña de la base de datos donde no la pierdas.

## 2. Ejecutar las migraciones

SQL Editor → New query → pega y ejecuta, **en este orden**:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_fase2.sql`
3. `supabase/migrations/0003_avisos.sql` (opcional, ver la sección «Aviso de
   lead nuevo» más abajo)

La segunda y la tercera son idempotentes: se pueden volver a ejecutar sin
romper nada.

Comprueba en Table Editor que existen cuatro tablas: `leads`, `informes`,
`prospectos` y `reglas`.

## 3. Copiar las claves

Project Settings → API:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** → `VITE_SUPABASE_ANON_KEY`

En `.env`:

```env
VITE_MOCK=false
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

La clave `anon` es pública por diseño: va dentro del JavaScript que descarga el
navegador. Lo que protege los datos es Row Level Security, no el secreto de esa
clave.

**La clave `service_role` no se pone aquí ni en ningún sitio del navegador.**
Salta RLS por completo.

## 4. Comprobar

```bash
npm run health:check
```

Debe decir que las cuatro tablas responden. Si dice *«Existe y RLS bloquea la
lectura anónima, como debe ser»*, está bien: es exactamente lo que queremos.

## 5. El modelo de acceso, en corto

| Quién | Puede | No puede |
| --- | --- | --- |
| Visitante anónimo | Crear su lead (diagnóstico o apelación) y su informe | Leer nada, ni lo suyo |
| Operador autenticado | Leer y actualizar leads, informes, prospectos y reglas | — |
| `service_role` | Todo | Estar en el navegador |

Un visitante anónimo tampoco puede escribir su propio estado comercial: la
política de inserción obliga a que el lead entre como `nuevo`, sin ingresos y
sin notas.

## 6. Crear tu usuario para entrar en `/admin`

Con RLS activado, **leer exige un usuario autenticado**. El panel ya lo hace:
en cuanto detecta que hay Supabase configurado, pide correo y contraseña en vez
de la contraseña local.

1. Authentication → Users → **Add user**.
2. Pon tu correo y una contraseña. Marca *Auto Confirm User* para no tener que
   confirmar por correo.
3. Entra en `/admin` con esos datos.

Arriba a la derecha verás tu correo y un botón **Salir**. Si la sesión caduca o
la cierras en otra pestaña, el panel se cierra solo.

**No pongas la `service_role` en el navegador para saltarte esto.** Deja tu base
de datos abierta a cualquiera que abra el inspector.

### Cómo saber en qué modo estás

| | Sin Supabase | Con Supabase |
| --- | --- | --- |
| El panel pide | Solo contraseña | Correo y contraseña |
| Qué protege | Nada: es un portero | RLS, en el servidor |
| Los datos viven en | Tu navegador | La base de datos |
| La etiqueta de arriba dice | `almacenamiento: mock` | `almacenamiento: supabase` |

## 7. Aviso de lead nuevo

Sin esto, nadie te avisa cuando entra un lead: hay que acordarse de mirar el
panel. El contador junto a «Leads» en la navegación dice cuántos están sin
tocar, pero solo lo ves si entras.

`supabase/migrations/0003_avisos.sql` instala un disparador que hace una
petición HTTP cuando se inserta un lead. No hace falta backend: la petición sale
de la propia base de datos con `pg_net`, que Supabase ya trae.

1. Consigue una URL que reciba peticiones POST y te avise (cualquier servicio de
   automatización con plan gratuito, o un webhook entrante de tu mensajería).
2. Ejecuta la migración.
3. Table Editor → `ajustes` → sustituye `PON_AQUI_TU_URL` por la tuya.
4. Completa un diagnóstico en tu propia web y comprueba que te llega.

Mientras el valor siga siendo `PON_AQUI_TU_URL`, el disparador no envía nada y
lo deja anotado en el registro. Y si el envío falla, **el lead se guarda igual**:
un aviso roto nunca puede tumbar la captación.

Al aviso solo va el tipo de lead, el correo, la empresa y la fecha. Ni el
historial comercial ni lo que escribió el vendedor: ese contenido no tiene por
qué salir a un servicio de terceros.

## 8. Copias de seguridad

```bash
npm run backup:rules       # vuelca la base de reglas a backups/
npm run report:weekly      # informe semanal desde Supabase
```

Ambos leen las credenciales de `.env`. Si `rules` no se puede leer por RLS, el
script lo dice y exporta solo lo que hay en el código.
