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

La segunda es idempotente: se puede volver a ejecutar sin romper nada.

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

## 6. Lo que falta para que `/admin` lea de Supabase

Con RLS activado, **leer exige un usuario autenticado**. El panel interno usa
hoy la clave anónima, así que:

- Con `VITE_MOCK=false`, el formulario público **sí** guarda en Supabase.
- Pero `/admin` no podrá listar nada hasta que haya una sesión autenticada.

Dos salidas:

1. **Rápida, sin código**: consulta los leads desde el Table Editor de Supabase.
   La captación queda operativa desde el primer día.
2. **Correcta, unas 30 líneas**: añadir inicio de sesión con Supabase Auth
   (Authentication → Users → crea tu usuario) y usar esa sesión en el panel.
   Está anotado en NEXT-STEPS.md.

No hay una tercera salida que consista en poner la `service_role` en el
navegador. Eso deja tu base de datos abierta a cualquiera que abra el inspector.

## 7. Copias de seguridad

```bash
npm run backup:rules       # vuelca la base de reglas a backups/
npm run report:weekly      # informe semanal desde Supabase
```

Ambos leen las credenciales de `.env`. Si `rules` no se puede leer por RLS, el
script lo dice y exporta solo lo que hay en el código.
