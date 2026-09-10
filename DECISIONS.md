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
