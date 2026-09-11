# Decisiones tomadas

Todo lo que decidí por ti, con el porqué en una línea. Si algo no te convence,
está aislado a propósito para que puedas cambiarlo sin tocar el resto.

## Datos regulatorios

| Decisión | Por qué |
| --- | --- |
| La base de reglas viene con datos ficticios y `verified: false` en los 18 registros | Es la regla innegociable número 1: nada de hechos jurídicos de memoria |
| `sourceUrl` de ejemplo apunta a `ejemplo.invalid` | Es un TLD reservado: es imposible confundirlo con una fuente real |
| `sourceCheckedAt` de ejemplo es `1970-01-01` | Un valor absurdo salta a la vista; una fecha plausible no |
| `representativeRequiredForNonEstablished` arranca en `false` en todos | Un booleano no admite "no lo sé"; queda documentado en el código y en RULES-GUIDE que es relleno, y `verified: false` lo tapa |
| `rules:check` también falla si queda `__EJEMPLO__` o si la URL sigue siendo la de ejemplo | Poner `verified: true` a mano sin cambiar el resto no debe colar |
| Los plazos de tramitación ante autoridades no aparecen en el informe | Es un dato regulatorio por país; sale como pendiente de verificar |
| Las plantillas de prospección no llevan importes de sanción | No tenemos ninguno verificado; hay un test que lo impide |
| El único dato normativo escrito en el código es el Reglamento (UE) 2025/40 y su fecha | Viene de tu propio encargo, no de mi memoria; está aislado en `brand.ts` para que lo verifiques |

## Producto

| Decisión | Por qué |
| --- | --- |
| Toda categoría de producto activa el flujo de envases | Todo lo que se expide va envasado; es una regla de producto nuestra, marcada como tal en el código |
| 8 pantallas = 8 preguntas, la última es un resumen para revisar | Cabe en menos de dos minutos y reduce respuestas erróneas |
| El correo se pide en la pregunta 7, no en la 1 | Se pide cuando ya ha invertido esfuerzo; el nombre de empresa es opcional |
| El nivel de riesgo se calcula con una puntuación explícita (`RISK_SCORING`) | Son criterios comerciales tuyos, agrupados en un sitio y etiquetados como no jurídicos |
| El informe guarda una copia congelada del resultado del motor | Un informe entregado no puede cambiar porque mañana actualices la base de reglas |
| La landing no lleva testimonios, logos ni cifras | Lo pediste, y además no hay nada que enseñar todavía |
| El CTA del informe es un `mailto:` con el número de informe | Sin pagos ni backend, es la vía más corta de respuesta a un correo tuyo |

## Técnicas

| Decisión | Por qué |
| --- | --- |
| **jsPDF dibujando texto**, no html2canvas | El PDF sale con texto seleccionable, imprime nítido en A4 y no depende de cómo se vea la pantalla; html2canvas habría dado una captura borrosa |
| El módulo del PDF se carga con `import()` diferido | jsPDF pesa 362 kB: solo se descarga si el usuario pide el PDF, y el build queda sin avisos de tamaño |
| Se sanean guiones largos y comillas tipográficas antes de dibujar el PDF | Las fuentes estándar de jsPDF usan WinAnsi y se comían el guión largo del "PENDIENTE DE VERIFICACIÓN — no usar con cliente" |
| El descargo aparece en el pie de **todas** las páginas del PDF | Que no se pierda si alguien reenvía una página suelta |
| Tailwind v3, no v4 | Configuración estable y documentación consolidada; v4 aún mueve la API |
| React Router v6 con `BrowserRouter` | Rutas limpias; la redirección a `index.html` ya está en `vercel.json` y `netlify.toml` |
| Interfaz `Storage` única con dos adaptadores | La aplicación no sabe si detrás hay `localStorage` o Supabase; cambiar de uno a otro es una variable de entorno |
| Modo MOCK por defecto y caída a MOCK si faltan claves | La aplicación nunca se rompe por falta de credenciales |
| El motor recibe la base de reglas como parámetro con valor por defecto | Los tests inyectan reglas propias y no dependen de los datos de ejemplo |
| Tabla `prospectos` además de `leads` e `informes` | Hacía falta para registrar qué variante tocó a cada prospecto, que es el punto 7 |
| La variante A/B se decide por alternancia automática, no a mano | Un A/B elegido a ojo no mide nada |
| RLS: `anon` solo inserta; leer exige usuario autenticado | La clave anónima está en el navegador; si pudiera leer, cualquiera se llevaría tu lista de leads |
| La contraseña de `/admin` es un portero, no seguridad | Va dentro del bundle y así está documentado en el código, en `.env.example` y en NEXT-STEPS |
| ESLint 9 con configuración plana y `typescript-eslint` | Es lo que instala Vite hoy; el proyecto sale sin avisos |
| Vitest en entorno `node`, solo sobre `tests/` | El motor y las plantillas son lógica pura: no hace falta DOM ni levantar el navegador |
| Verifiqué el recorrido completo en Chromium con Playwright | Playwright **no** está en `package.json`: fue una comprobación mía, no una dependencia del proyecto |

## Lo que NO construí

Autenticación de usuarios, pagos, multiidioma, panel de analítica, envío de
correos y cualquier tipo de scraping. Lo que se me ocurrió por el camino está en
NEXT-STEPS.md, no en el código.

---

# Fase 2 — decisiones

## Datos y afirmaciones

| Decisión | Por qué |
| --- | --- |
| **No publico la tasa de éxito del 90 % en `/appeals`** | Es una cifra que no puedes demostrar todavía, y se la estarías enseñando a alguien que pierde dinero cada día. `APPEALS.successRate` está en `null` y la página dice, en su lugar, que nadie puede garantizar una reactivación. Pon el número real (con tamaño de muestra) cuando tengas casos cerrados y aparecerá solo |
| `estimatedSuccess` del Plan of Action mide lo **completo** que está el plan, no la probabilidad de éxito | Amazon no publica tasas de aceptación. La puntuación es una lista de comprobación ponderada, nunca llega a 0 ni a 100, y lo dice en el propio documento |
| La gravedad del analizador es dificultad de documentación, no pronóstico | Mismo motivo. Y la confianza del clasificador tiene un techo del 90 %: es búsqueda por palabras clave, no un modelo |
| Las plantillas de apelación no citan políticas concretas de Amazon ni plazos | Son datos verificables que no he comprobado. Hay un test que impide que aparezcan porcentajes o promesas de garantía |
| El informe semanal sale a cero cuando no hay datos, y lo dice en `source` y en `notes` | Un panel que se inventa métricas es peor que no tener panel |

## Validador de reglas

| Decisión | Por qué |
| --- | --- |
| La URL de la fuente **no** tiene que ser obligatoriamente de EUR-Lex | Lo pedía el esbozo, pero el registro nacional de cada país es la fuente correcta para casi todos los campos. Se bloquean los dominios que no son oficiales (blogs, redes, wikis, IA) y se **avisa** si no reconoce el dominio |
| La lista de dominios oficiales es una heurística revisable, no una verdad jurídica | Está en `OFFICIAL_DOMAIN_HINTS` con un comentario que te pide revisarla. Equivocarse ahí solo produce un aviso: nunca te impide registrar una obligación legítima |
| `errors` bloquea y `warnings` deja pasar | Lo estructural y la trazabilidad bloquean; lo heurístico avisa. Si no, el guardarraíl acaba estorbando y se termina desactivando |
| No se puede marcar `verified: true` mientras haya errores | La casilla de verificado es tu firma; firmar un registro roto no debería ser posible |

## Arquitectura

| Decisión | Por qué |
| --- | --- |
| Las reglas de la **base de datos mandan** sobre las del código, por identificador | Permite sustituir los 18 ejemplos uno a uno desde `/admin/fill-rules` sin desplegar |
| Tabla `reglas` con el contenido en una columna `jsonb` | El esquema de una obligación va a cambiar según aprendas de cada país; así no hay una migración por cada campo nuevo |
| El identificador y el número del informe se generan en el **cliente** | El visitante anónimo puede insertar pero no actualizar (RLS). Si la referencia se calculase después, haría falta un UPDATE que la política deniega, y con razón |
| La política de inserción anónima obliga a `status = 'nuevo'`, sin ingresos ni notas | Un visitante no puede escribir su propio historial comercial |
| Migración 0002 idempotente (`add column if not exists`, `drop policy if exists`) | Se puede volver a ejecutar sin miedo cuando dudes de si la aplicaste |
| Los scripts leen `.env` con un parser propio de 20 líneas | No pasan por Vite, así que `import.meta.env` no existe. Añadir `dotenv` por esto no compensa |
| `npm test` ejecuta la cobertura y su umbral; `npm run test:fast` la salta | El umbral solo sirve si está en el comando que se ejecuta por costumbre |
| La cobertura mide la **lógica** (`src/lib`, `src/modules`, `src/data`, `src/scripts/lib`), no las pantallas `.tsx` | Las pantallas se verifican con el recorrido real en Chromium, que prueba más que una cobertura de renderizado. Está declarado en `vite.config.ts` y aquí, para que el 96 % no se lea como algo que no es |
| `eslint .` en vez de `eslint src` | Así también se revisan los tests y los scripts |
| `vitest run` en vez de `vitest` | El comando por defecto no debe quedarse en modo vigilancia: en CI no terminaría nunca |
| `deploy` usa la CLI de Vercel sin instalarla como dependencia | No añado 40 MB de dependencia a un proyecto estático; `npx vercel` o la CLI global hacen lo mismo |
| Sin capturas de pantalla en la guía de EUR-Lex | Los portales cambian de aspecto y una captura vieja despista más de lo que ayuda. La guía enlaza a los sitios reales |
| El logo del PDF es un hueco reservado con las iniciales | No me invento un logo. En cuanto pegues una imagen en `BRAND_LOGO.dataUri`, la usa |
| La exportación de datos de `/admin` alimenta `npm run report:weekly` | En modo MOCK los datos están en el navegador y Node no puede leerlos. Con Supabase conectado, el script los lee directamente y el botón sobra |

---

# Fase 3 — decisiones

| Decisión | Por qué |
| --- | --- |
| El panel A/B **cuenta, no infiere** | Con decenas de mensajes, un cálculo de significación daría una falsa sensación de certeza. Por debajo de 30 envíos por variante dice «muestra corta» y no señala ganadora; por encima, habla de «diferencia observada» y lo repite. Hay un test que impide que la palabra «significativo» acabe en pantalla |
| El umbral de 30 envíos es un criterio práctico nuestro, no un resultado estadístico | Está en `MIN_SAMPLE_PER_VARIANT`, con nombre y en un sitio, para poder cambiarlo |
| La puntuación del Plan of Action se enseña con su aclaración pegada | Un número grande en pantalla se lee como una probabilidad aunque el texto diga lo contrario. La aclaración va debajo de la barra, no en una nota al pie |
| Los borradores del Plan of Action van a `localStorage`, no a Supabase | Es un documento de trabajo que cambia cada dos minutos mientras lo redactas; no es un dato del negocio. Lo que importa es el documento final, que se descarga |
| El editor del Plan of Action prellena desde el lead pero **no redacta la causa raíz** | Las pistas del analizador se enseñan aparte, plegadas y etiquetadas como puntos de partida. Si el editor propusiera una causa raíz, acabarías enviándola |
| `rules:check` avisa cuando no ha podido leer Supabase, en vez de callarse | Un guardarraíl que da luz verde sobre una base que no ha mirado es peor que no tenerlo |
| El recorrido de extremo a extremo corre contra el **build**, no contra el servidor de desarrollo | Es lo que se despliega. Las diferencias entre uno y otro son justo las que se escapan |
| Playwright entra como dependencia de desarrollo, con `PLAYWRIGHT_CHROMIUM_PATH` opcional | Cubre lo que la cobertura de Vitest no puede cubrir. Los fallos que detectó en las fases anteriores (el guion largo del PDF, el 404 del favicon, la sesión que no se cerraba) no los habría visto ninguna prueba de renderizado |
| El CI separa lógica y recorrido en dos trabajos | El segundo tarda y necesita navegador; que un fallo de lint se vea en veinte segundos y no en tres minutos |

---

# Fase 4 — decisiones

| Decisión | Por qué |
| --- | --- |
| El historial distingue cambios **materiales** de mantenimiento interno | Cambiar la periodicidad de declaración afecta a lo que el cliente tiene que hacer; corregir una nota interna o el peso de severidad, no. Avisar de todo entrena al cliente a ignorar tus avisos |
| `material` es criterio comercial nuestro, no jurídico | Está en una sola tabla, en `rulesHistory.ts`, con nombre y comentario. Si te equivocas al clasificar, se cambia ahí |
| Guardar una obligación sin cambiar nada **no** genera entrada | Si no, el historial se llena de ruido y deja de servir para lo único que sirve: enseñar qué cambió |
| El aviso de vigilancia se acota a las obligaciones **de ese informe** | Al cliente no le interesa que haya cambiado Polonia si él solo vende a Alemania. Y mandarle todo hace que no lea ninguno |
| `reglas_historial` sin UPDATE ni DELETE para nadie, y sin clave ajena contra `reglas` | Un historial reescribible no es un historial; y con clave ajena, borrar una obligación se llevaría por delante justo el registro de su baja |
| Una baja guarda el último estado conocido completo | Si dentro de un año un cliente pregunta qué decía aquella obligación, hay respuesta |
| El fallo al anotar el historial **no** impide guardar la obligación | El dato es lo primero; el registro es importante pero secundario. Se avisa por consola |
| La serie A/B solo pinta semanas con envíos | Rellenar las vacías a cero haría parecer que la respuesta se hundió una semana en la que simplemente no escribiste a nadie |
| El motor separa «país no cargado» de «nada aplica», y el informe lo dice | Confundirlos le decía al vendedor que no tiene nada que hacer en un país que ni siquiera habíamos mirado. Es el mismo principio que la etiqueta de pendiente de verificación: un hueco nuestro no se disfraza de respuesta |

---

# Paginación del panel de leads

| Decisión | Por qué |
| --- | --- |
| Se pagina **en el origen**, no cortando la lista en el navegador | Cortar en el navegador no arregla nada: el problema era traerse la tabla entera. Ahora se piden solo las filas de la página |
| Las cifras de cabecera son del **filtro entero**, no de la página | «Ingresos registrados: 300 $» cambiando al pasar de página sería inútil. Se calculan aparte, con consultas de recuento que no traen filas |
| El importe se suma pidiendo solo la columna `revenue` de los leads que la tienen | Postgres no suma sin una función en la base; esto es lo más barato sin añadir una |
| Los informes se piden solo para los leads visibles (`in`) | Antes se traían todos para cruzarlos con los leads |
| El predicado de filtrado vive aparte y puro (`src/lib/leadFilters.ts`) | Es lo que aplica el modo local y lo que hay que replicar en la consulta a Supabase. Teniéndolo en un sitio se puede comprobar que los dos caminos filtran igual |
| La búsqueda espera 300 ms antes de consultar | Si no, cada tecla es una consulta a la base |
| Cambiar un filtro vuelve a la página 1, y si el filtro deja menos páginas se recoloca | Quedarte mirando una página 7 que ya no existe parece que la aplicación se ha roto |
| Se limpian comas, paréntesis y porcentajes del texto buscado | La coma separa condiciones dentro de `or()` y el porcentaje es comodín: sin limpiarlos, escribir una coma rompe la consulta |
| La exportación sigue trayéndolo todo, pero solo al pulsar | Es su cometido; lo que no tiene sentido es pagarlo cada vez que se abre la pantalla |
| Tamaños de página: 25, 50 y 100 | Suficiente para trabajar sin convertirlo en una preferencia más que mantener |
