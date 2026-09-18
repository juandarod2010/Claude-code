# Análisis final — sindresorhus/awesome-lint#37
**Fecha:** 18 sep 2026 · **Estado de la decisión: DROP**

> No se programó. No se abrió PR. No se reclamó la bounty. No se comentó la issue.
> No se contactó al mantenedor. El repositorio se clonó **en modo lectura** a un
> directorio temporal, exclusivamente para el análisis de código de §3. No se
> modificó nada.

---

## Resumen ejecutivo

La oportunidad queda invalidada por evidencia directa y de primera clase.

El 12 de mayo de 2026, un contribuidor abrió el PR #234 diciendo literalmente que
implementaba *"an `awesome-header-image` rule **for the funded IssueHunt issue**"*.
El mantenedor lo cerró **el mismo día** con esta respuesta **[REPO]**:

> **sindresorhus: "I don't accept fully AI-generated PRs."**

Acto seguido bloqueó la conversación y la marcó como spam.

Es el mantenedor de `awesome-lint`, sobre esta misma issue, sobre esta misma bounty,
rechazando exactamente el tipo de PR que nuestro plan produciría. No es una política
inferida de otro repositorio: es una acción registrada sobre este caso.

---

## 1. Estado de la issue #37

**[REPO]** https://github.com/sindresorhus/awesome-lint/issues/37

| Comprobación | Resultado |
|---|---|
| Estado | **Abierta** |
| Etiquetas | `💵 Funded on Issuehunt`, `new-rule` |
| Asignada | **No** |
| Financiación IssueHunt | **$60,00**, backer único: `issuehunt` |
| PRs listados en el resumen de IssueHunt | `#225 Add header image rule (SVG/HiDPI)` |
| Creada | 16 ago 2018 |

**Cuerpo íntegro de la issue**, citado literal — nótese la brevedad:

> "Based on discussion in sindresorhus/awesome#1314.
> - If a header image exists (aside from awesome-list badge), ensure it is high-DPI or SVG."

**Requisitos de aceptación: no existen escritos.** Dos líneas, sin criterios de
validación, sin casos límite, sin definición de qué cuenta como "header image". Toda
la especificación real está implícita en la cabeza del mantenedor — lo que explica
buena parte de lo que sigue.

**Dificultad real: muy superior a la aparente.** Ver §2.

---

## 2. Los PRs previos — la parte decisiva

Mi informe anterior registró "1 PR previo". **Era incorrecto: son tres.**

**[REPO]** Búsqueda de PRs relacionados con header image en el repositorio:

| PR | Autor | Creado | Estado | Desenlace |
|---|---|---|---|---|
| [#225](https://github.com/sindresorhus/awesome-lint/pull/225) | Jackyzhangyi | 25 feb 2026 | **Abierto** | Revisado y refutado el 30 mar; sin resolver desde entonces |
| [#228](https://github.com/sindresorhus/awesome-lint/pull/228) | phusi319 | 27 mar 2026 | Cerrado | Cerrado el mismo día por sindresorhus |
| [#234](https://github.com/sindresorhus/awesome-lint/pull/234) | saulane | 12 may 2026 | Cerrado | **Cerrado por ser IA. Bloqueado y marcado como spam** |

**Tres intentos en 2026. Cero merges.**

### PR #225 — el fallo técnico concreto

**[REPO]** Revisión de sindresorhus, 30 mar 2026, citada literal:

> "This misses the common `H1`-then-`<img>` layout. `findTopHeaderImages()` only scans
> leading top-level HTML blocks before any non-HTML node, and then only checks images
> inside the first H1 itself. So both `success-svg.md` and `error-png.md` are not
> actually covered by the rule."

Traducción: el autor escribió la regla **y sus propios tests de fixtures no ejercitaban
la ruta de código que decían probar**. La regla pasaba los tests sin detectar el patrón
más común de imagen de cabecera. Sigue abierto y sin corregir seis meses después.

### PR #228 — nueve defectos independientes

**[REPO]** La revisión automatizada listó, entre otros: la misma laguna de detección
H1-seguido-de-imagen; retorno anticipado que salta patrones posteriores; mensajes de
error anclados al nodo raíz en vez de a la imagen concreta (números de línea
inservibles); texto que menciona sólo `@2x` cuando el código acepta `@3x`; el visitor
de headings abandona la travesía al primer heading que no es H1; contradicción entre
el objetivo declarado de ser permisivo y el comportamiento estricto real; una fixture
llamada "badge-only" que contiene una imagen que no es badge; `readFileSync()` cargando
imágenes enteras en memoria; y cobertura de tests ausente para dos casos.

### PR #234 — el que cierra la cuestión

**[REPO]** Citado literal:

> **saulane (12 may 2026):** "Fixes #37. Adds an `awesome-header-image` rule **for the
> funded IssueHunt issue**. Lints the first non-badge header image and accepts
> SVG/SVGZ/data SVG or raster images that are at least 2x the displayed size."
>
> **sindresorhus (12 may 2026):** "I don't accept fully AI-generated PRs."

Cerrado, conversación bloqueada, marcada como spam.

### Qué demuestran estos tres PRs

**Lo bueno:** la tarea **es** resoluble. El enfoque general converge en los tres
intentos (SVG/SVGZ/data-SVG, marcador `@2x`/`@3x`, o dimensiones ≥2× las mostradas),
y el mantenedor **sigue activo** en la issue — revisó #225 con detalle técnico.

**Lo malo, y pesa más:**

1. El listón no está en el enfoque, sino en la **detección exhaustiva de patrones de
   cabecera en Markdown**, que es donde fallaron los tres.
2. El mantenedor **lee el código con atención** y detecta que unos tests no cubren lo
   que dicen cubrir. No es un repositorio donde un PR pase por inercia.
3. **Hay un PR abierto y vivo (#225) sobre esta issue.** Abrir uno competidor sería un
   atropello a un contribuidor que ya recibió revisión.
4. Y sobre todo: **el único de los tres que se presentó explícitamente como trabajo
   para la bounty fue cerrado por ser generado con IA.**

---

## 3. Análisis del código actual

**[REPO]** Clonado en lectura. Último commit: 6 jul 2026 — repositorio vivo.

**Dónde iría el cambio:**

- `rules/header-image.js` — fichero nuevo. Las reglas usan `lintRule()` de
  `unified-lint-rule` más `visit()` de `unist-util-visit` sobre el AST de remark.
  `rules/badge.js` es el modelo más cercano: ya recorre el primer `heading` buscando
  imágenes dentro de él.
- `rules/index.js` — registrar `[headerImage, ['error']]` en el array de `createRules()`.
- `test/rules/header-image.test.js` — nuevo, siguiendo el patrón de `test/rules/`.
- `test/fixtures/header-image/` — fixtures nuevas; **el punto donde fallaron los tres
  PRs previos**, porque deben cubrir de verdad los distintos layouts de cabecera.
- `test/integration.test.js` — posiblemente ajustar.

**Volumen estimado:** 4–6 ficheros, ~150–250 líneas entre regla, tests y fixtures.

**Cómo comprobaría que funciona:** `npm test` (xo + ava), y específicamente fixtures
que cubran bloque HTML antes del H1, **imagen inmediatamente después del H1** (el caso
que hundió a #225 y #228), sólo badge, SVG remoto, PNG remoto sin `@2x`, y local sin
dimensiones explícitas.

### Clasificación del trabajo

**CLAUDE 90-100%** en el sentido puramente técnico: es JavaScript, con patrón de regla
existente que copiar, criterio objetivo y suite de tests.

Y esa clasificación es exactamente el problema. Un trabajo que Claude puede hacer al
90-100% es, por definición, *"fully AI-generated"* — la categoría que el mantenedor
rechaza por escrito en esta issue.

---

## 4. IssueHunt — condiciones de la recompensa

# NO VERIFICADO POR LIMITACIÓN DE ACCESO

`issuehunt.io` sigue bloqueado por el proxy de esta sesión. **No verifiqué** ninguno de
estos puntos en fuente oficial: método de pago, disponibilidad para Panamá, edad mínima,
KYC, comisiones exactas, plazo de pago, evento que libera el pago, requisitos de
reclamación, ni qué ocurre si el PR es rechazado.

Lo único verificado **[REPO]** es que el bloque de IssueHunt dentro de la issue muestra
**$60,00** con backer `issuehunt`, y que la etiqueta `💵 Funded on Issuehunt` sigue puesta.

**Bruto frente a neto:** por **[BUSCADOR]**, IssueHunt aplica 10% de comisión al
financiador y reparte 20% mantenedor / 80% contribuidor. Si eso es correcto, **$60
anunciados ≈ $48 para ti**, no $60. **No lo doy por confirmado.**

**No te pido que verifiques nada de esto**, porque el DROP de §7 no depende de ello.
Si alguna vez vuelves sobre IssueHunt para otra issue, lo que habría que mirar es:
países admitidos en el alta de payout, método de pago disponible desde Panamá, umbral
mínimo de retiro y el reparto exacto por defecto.

---

## 5. Política de IA

### Búsqueda realizada

**[REPO]** `grep -rin "ai-generated|ai generated|llm|chatgpt|copilot|claude"` sobre todo
el repositorio clonado (md, json, js). **Única coincidencia:** `lib/spell-check-rules.js`
líneas 580-581, una entrada de diccionario que corrige "chatgpt" → "ChatGPT". No es
una política.

**[REPO]** `sindresorhus/.github/contributing.md`, la guía central: **ninguna mención**
a IA, LLM, código generado, Copilot o ChatGPT.

**[BUSCADOR]** No encontré ninguna política global escrita de este mantenedor.

### Pero la ausencia de regla escrita no es permiso

Este es precisamente el error que me pediste vigilar, y aquí la evidencia lo resuelve en
sentido contrario: **no hay regla escrita, pero sí hay una aplicación explícita y
registrada sobre esta misma issue**, citada en §2 — *"I don't accept fully AI-generated
PRs"*, con cierre, bloqueo y marca de spam.

### Clasificación

> ## AI RESTRICTED
>
> Y **AI PROHIBITED en la práctica** para el plan concreto que tenemos entre manos.

El matiz importa y lo señalo con honestidad: el mantenedor dice *"**fully** AI-generated"*.
Eso deja teóricamente abierta la puerta a un PR con autoría humana real donde la IA sea
una herramienta auxiliar. Pero un trabajo clasificado CLAUDE 90-100% no es eso, y
presentarlo como si lo fuera sería exactamente la clase de engaño que descartas.

**No extiendo aquí ninguna política de otro repositorio.** El hallazgo previo de que
`sindresorhus/type-fest` recomienda usar IA **no se aplica** a `awesome-lint` y no lo
uso como atenuante. La evidencia específica de este repositorio apunta en dirección
contraria y es la que manda.

---

## 6. Riesgos, evaluados por separado

| Riesgo | Nivel | Fundamento |
|---|---|---|
| **Técnico** | **Medio** | La tarea es resoluble y hay patrón que copiar, pero tres implementaciones fallaron en el mismo punto: detectar el layout H1-seguido-de-imagen |
| **Issue obsoleta** | **Bajo** | Abierta, financiada, etiquetada, y el mantenedor la revisó en marzo de 2026. No está muerta |
| **PR no aceptado** | **Muy alto** | 3 intentos, 0 merges en 2026. Además #225 sigue abierto: un PR nuestro sería competidor de uno vivo y ya revisado |
| **Recompensa no pagada** | **NO VERIFICADO** | Condiciones de IssueHunt inaccesibles. Irrelevante aquí: sin merge no hay pago, y el merge es lo improbable |
| **Cobro desde Panamá** | **NO VERIFICADO** | Sin evidencia en ningún sentido |
| **IA** | **Crítico — invalidante** | El mantenedor cerró por IA el único PR presentado explícitamente para esta bounty, y lo marcó como spam |

---

## 7. Decisión

# DROP

Tres motivos, cualquiera de ellos suficiente por sí solo:

1. **El mantenedor rechaza PRs generados con IA en esta issue**, con constancia pública
   del 12 may 2026, cierre, bloqueo y marca de spam. Tu propia regla dice: *"Si es AI
   PROHIBITED, descarta."*
2. **Existe un PR abierto y vivo (#225)** de un contribuidor que ya recibió revisión
   técnica del mantenedor. Abrir uno competidor no sería legítimo.
3. **Tres intentos, cero merges.** El PR previo no demuestra que la tarea sea fácil:
   demuestra que el listón está donde nadie lo ha alcanzado todavía.

### Lo que este caso enseña, y que vale más que los $60

El marcador `Funded on Issuehunt` prueba que **hay dinero depositado**. No prueba nada
sobre si **ese dinero es alcanzable**. Son dos preguntas distintas y yo las traté como
una sola en el informe anterior, donde clasifiqué esta issue como la más limpia de las
cuatro basándome en su simplicidad técnica y en un recuento de PRs que estaba mal.

El filtro que faltaba no es técnico ni económico: **antes de mirar el código de una
issue financiada, hay que leer qué les pasó a quienes ya lo intentaron.** En este caso
esa lectura cuesta cinco minutos y ahorra un fin de semana.

Las otras tres candidatas de IssueHunt (`better-exceptions#10` $70, `macos-wallpaper#25`
$60, `fkill#21` $40) **no están descartadas por esto**, pero ahora sabemos que dos de
ellas comparten mantenedor con este caso, y ese mantenedor rechaza PRs plenamente
generados con IA. Eso reduce mucho lo que prometían. `better-exceptions#10` (Qix-) es
la única de las cuatro con un mantenedor distinto.

---

## Autorrevisión

Repasé el informe contra las seis confusiones que pediste vigilar.

1. **Dinero anunciado con dinero financiado** — Correcto en §1: la etiqueta
   `💵 Funded on Issuehunt` y el backer `issuehunt ($60.00)` son **[REPO]**, no promesa.
   Pero añadí en §7 la distinción que faltaba: financiado ≠ alcanzable.
2. **Importe bruto con neto** — §4 muestra $60 bruto y ~$48 neto estimado, con el neto
   marcado **[BUSCADOR]** y explícitamente no confirmado.
3. **Política de otro repositorio con la de awesome-lint** — Vigilado activamente. La
   política permisiva de `type-fest` se menciona en §5 **sólo para declarar que NO la
   aplico**. La clasificación sale de evidencia de este repositorio.
4. **Ausencia de regla de IA con permiso para usar IA** — Este era el riesgo mayor y se
   resolvió con evidencia directa: no hay regla escrita, pero sí hay aplicación
   registrada. Clasificado AI RESTRICTED, nunca UNKNOWN ni ALLOWED.
5. **Existencia de un PR con aceptación del PR** — **Error corregido.** Mi informe
   anterior decía "1 PR previo". Son **tres**, y **ninguno mergeado**. Que exista un PR
   no significa que el problema esté resuelto ni que el enfoque sea aceptable.
6. **Posibilidad de recibir pagos con evidencia de que Panamá está permitido** — §4 y §6
   lo declaran NO VERIFICADO sin excepción. No se afirma en ningún punto que puedas
   cobrar desde Panamá.

**Corrección adicional detectada durante la autorrevisión:** en el informe anterior
clasifiqué `awesome-lint#37` como *"la técnicamente más limpia"* y la propuse como
mejor candidata. Ese juicio se apoyaba en la simplicidad del enunciado y en un recuento
de PRs equivocado. Era una conclusión mal fundada, y este análisis la revoca.
