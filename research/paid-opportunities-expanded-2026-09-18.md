# Oportunidades técnicas remuneradas — investigación ampliada
**Fecha:** 18 sep 2026 · **Perfil:** estudiante, 18 años, Panamá · **Objetivo:** primeros $25–$100

---

## 0. Metodología y límites de verificación (leer antes que nada)

### Qué pude verificar directamente
`github.com`, `api.github.com` y `raw.githubusercontent.com` son accesibles desde
este entorno. Todo dato sobre **issues concretas** (autor, asignación, etiquetas,
fechas, PRs vinculados, número de comentarios) está verificado contra la API o el
HTML de GitHub, y es reproducible.

### Qué NO pude verificar
El proxy de red de esta sesión **bloquea** los siguientes dominios, todos ellos
fuentes primarias necesarias para las reglas de plataforma:

`algora.io`, `docs.algora.io`, `bountyhub.dev`, `opire.dev`, `api.opire.dev`,
`devpost.com`, `docs.omi.me`, `www.asyncapi.com`, `www.paypal.com`, `dev.to`.

Por tanto: **toda regla de plataforma (edad, país, comisiones, KYC, método de
pago, política de IA) que aparezca marcada NO VERIFICADO procede de fragmentos
de buscador, no de la página oficial.** Se indica la fuente en cada caso. Estas
son exactamente las cosas que debes confirmar tú abriendo el enlace oficial
antes de invertir tiempo.

### Nota sobre la edad
En el encargo se indicó primero "menor de edad" y después se corrigió a
**18 años**. Todo este informe asume 18. Eso desbloquea PayPal, Stripe, Kaggle,
HackerOne y la mayoría de hackathones, cuyo umbral estándar es precisamente 18.
Si el dato correcto fuera otro, habría que revisar TODAS las secciones de pago.

### Falso positivo detectado (importante)
Buscar `"algora.io" in:comments` en GitHub devuelve 34 issues abiertas, pero
**no son bounties financiadas**. Comprobé
[markdown-oxide#269](https://github.com/Feel-ix-343/markdown-oxide/issues/269) y
[pgstrap#2](https://github.com/seveibar/pgstrap/issues/2): ninguna tiene comentario
del bot de bounty ni importe. Son menciones en conversación. Cualquier lista que
use esa búsqueda como fuente está inflada.

---

## A. Oportunidades que puedo atacar AHORA

Encontré **3**, no 10. Las tres pertenecen al mismo programa, que es el único
que reúne simultáneamente: dinero documentado, tarea acotada, repositorio activo,
cero competencia registrada y un canal de cobro legítimo y auditable.

### A1 · AsyncAPI — Bounty Program (marco general)

| Campo | Dato |
|---|---|
| Plataforma | AsyncAPI Initiative (Linux Foundation) + Open Collective |
| URL programa | https://www.asyncapi.com/docs/community/010-contribution-guidelines/bounty_program |
| URL fondos | https://opencollective.com/asyncapi/projects/asyncapi-bounty-program |
| Tipo | Contribución open source remunerada |
| Recompensa | $200 (complejidad media) / $400 (avanzada) — NO VERIFICADO |
| Presupuesto | $21.400/año, $1.600 por ronda mensual — NO VERIFICADO |
| Cobro | Factura ("Submit expense") en Open Collective |
| Requisito fiscal | >$600/año acumulados → formulario **W-8BEN** (individuo no-US). Panamá cualifica; es un trámite estándar, no un obstáculo |
| Edad mínima | NO VERIFICADO — Open Collective exige 18+ para cobrar |
| Países | Sin restricción documentada; Panamá no está sancionada |
| Reglas IA | **NO VERIFICADO** — no pude leer la página oficial. Hay que comprobarlo antes de escribir código |
| Evidencia | Historial público de gastos pagados, ej. [Expense #263185 "Bounty cli#1794"](https://opencollective.com/asyncapi-bounty-program/expenses/263185) |

**Por qué es la mejor evidencia de todo el informe:** Open Collective publica cada
pago como un gasto con número. No es una promesa en un README: es un registro
contable consultable de dinero que ya salió hacia contribuidores.

### A2 · asyncapi/website #5004 — Canonical tags ausentes

| Campo | Dato |
|---|---|
| URL | https://github.com/asyncapi/website/issues/5004 |
| Programa | Incluida en la ronda [MICROGRANT 2026-09](https://github.com/asyncapi/website/issues/5704) (verificado: la issue agregadora la lista) |
| Estado verificado | **Sin asignar, sin PRs vinculados, sin comentarios reclamándola** |
| Actividad | La issue agregadora se actualizó el 2026-09-16 (hace 2 días) |
| Stack | Next.js / React — componente `Head` |
| Importe | **NO VERIFICADO** — los microgrants son un programa distinto del bounty program y no pude leer sus importes |

**Qué hay que hacer:** el componente `Head` debe incluir siempre una etiqueta
canonical usando la URL de la página actual por defecto, aceptar una prop
`canonical` opcional para sobrescribirla, y usarse de forma consistente en todos
los tipos de página. Hoy los docs no tienen canonical y los blog posts sólo la
incluyen si existe un campo `canonical` en el frontmatter.

**Qué puede hacer Claude Code:** prácticamente todo. Clonar el repo, localizar el
componente `Head` y sus usos, implementar el default + la prop, propagarlo a
docs y blog, y verificar el HTML renderizado. Es un cambio de alcance pequeño y
mecánicamente comprobable.

**Qué tienes que hacer tú:** confirmar el importe y las reglas de IA; comentar en
la issue para reservarla; revisar el diff antes de que se abra el PR; responder a
la revisión del maintainer; enviar la factura en Open Collective.

**Tiempo estimado:** 1–3 h de trabajo de Claude + tu revisión. Días o semanas
hasta el merge, que no dependen de ti.

**Riesgos:** el importe podría ser bajo o cero si los microgrants no se pagan
igual que las bounties. La issue lleva la etiqueta `stale` en el repo, lo que
sugiere baja prioridad del maintainer y posible lentitud en la revisión.

### A3 · asyncapi/website #5109 — Breadcrumbs en documentación

| Campo | Dato |
|---|---|
| URL | https://github.com/asyncapi/website/issues/5109 |
| Programa | Misma ronda MICROGRANT 2026-09 |
| Estado verificado | **Sin asignar, sin PRs vinculados, sin comentarios** |
| Stack | Next.js / React |
| Importe | **NO VERIFICADO** (mismo caso que A2) |

**Qué hay que hacer:** añadir navegación breadcrumb sobre el título de las páginas
de documentación (`Docs > Tutorials > Getting Started > Request/Reply Pattern`).
La propia issue afirma que **la jerarquía ya existe en la estructura de docs y no
haría falta tocar el pipeline de build** — eso acota mucho el trabajo.

**Qué puede hacer Claude Code:** todo el componente, su integración en el layout
de docs, y el cumplimiento del patrón de accesibilidad de W3C (`nav` +
`aria-label="Breadcrumb"`).

**Riesgos:** es un `[FEATURE]` con etiqueta `stale` y estado "To Be Triaged".
Un maintainer podría rechazar el enfoque de diseño. Mayor riesgo de discusión
que A2, que es un bug objetivo.

---

## B. Oportunidades que requieren confirmación

### B1 · BasedHardware/omi — 83 issues `[Bounty $X]`, $25–$400
Ya le escribiste al equipo. Sigue **sin resolver** el hallazgo de la investigación
anterior: la etiqueta oficial `Paid Bounty` tiene 0 issues abiertas y 0 cerradas,
las issues `[Bounty $X]` las abren colaboradores externos (no maintainers), y la
pregunta pública [#13478](https://github.com/BasedHardware/omi/issues/13478)
pidiendo prueba de pagos sigue sin respuesta. **No inviertas tiempo hasta que
respondan por escrito.** Método de pago documentado: PayPal (NO VERIFICADO).

### B2 · moorcheh-ai/memanto #1852 — auditoría de seguridad, $100
URL: https://github.com/moorcheh-ai/memanto/issues/1852 · Deadline **30 sep 2026**.
Verificado: la abrió `@Xenogents`, **no un maintainer**; 42 comentarios; el pago es
"$100 al mejor envío del leaderboard" vía BountyHub. Es un **concurso con un solo
ganador**, no trabajo remunerado. Riesgo alto de trabajar gratis.

### B3 · microg/GmsCore — bounties comunitarias de $2.340 y $14.999
URLs: [#2843 WearOS](https://github.com/microg/GmsCore/issues/2843) ·
[#2994 RCS](https://github.com/microg/GmsCore/issues/2994). microG es un proyecto
real y antiguo, y los importes son creíbles. Pero son tareas de **meses** de
ingeniería Android de bajo nivel, con 169 y 675 comentarios. No encaja con
"$100 en menos de un día". Fuente de financiación y método de pago: NO VERIFICADO.

### B4 · Hackathones online con premios en metálico
**Todo NO VERIFICADO** — `devpost.com` está bloqueado en este entorno y no pude
abrir ninguna página oficial. Lo que devolvió el buscador, sin confirmar:
AssemblyAI (1–30 sep 2026, $10k), IBM Bob 2.0 (25–27 sep), TechEx Europe
(16–19 oct), Decentralize AI Hackathon. Reglas generales sí verificadas por
fuente secundaria: Devpost permite que menores participen si un tutor registra la
cuenta, y **la mayoría de hackathones fijan el mínimo en 18 años** — con 18 eres
elegible. Los premios van a los primeros puestos, así que el riesgo de trabajar
gratis es estructural.

### B5 · HackerOne y bug bounty
[Términos de comunidad](https://www.hackerone.com/terms/community). Verificado por
fuente secundaria: 13+ con consentimiento parental, menores de 18 cobran a través
del tutor. **Con 18 años cobras directamente, sin intermediarios.** Es legal y
legítimo dentro de los programas autorizados. Pero la probabilidad de encontrar
un hallazgo pagable en menos de un día, sin experiencia previa, es muy baja. No
lo descarto — lo sitúo fuera del objetivo de "primeros $100 rápido".

### B6 · Polar.sh — issue funding
[Payouts](https://polar.sh/docs/features/finance/payouts). Plataforma real, pagos
por Stripe Connect, retención de 7 días. **No logré verificar que exista
inventario abierto de issues financiadas** — el dominio de listados no es
accesible desde aquí. Merece una revisión manual tuya de 10 minutos.

---

## C. Descartadas y por qué exactamente

| Oportunidad | Motivo del descarte |
|---|---|
| `SecureBananaLabs/bug-bounty` | Granja. $430–$1.2k por bugs triviales, 461–1.406 comentarios por issue, sin producto real |
| `xevrion-v2/agent-playground` | Granja. $50 por un typo en README; $1k por "calcular el valor exacto de PI" (tarea imposible) |
| `UnsafeLabs/Bounty-Hunters` | Etiqueta literal "AI only allowed - no humans". Patrón de granja |
| `Scottcjn/rustchain-bounties` | Paga en token propio RTC por acciones como dar estrellas. Token sin valor verificable — excluido por tus reglas |
| `claude-builders-bounty/*` | 1.457–2.169 comentarios por issue de $50–$200. Lotería, no trabajo |
| `jahmeergnlt/traefik#1` | `$100` en un **fork personal** de Traefik, no el repo oficial. Financiación no atribuible |
| Ubiquity DevPool | Cobro exclusivamente on-chain (USDC). Incompatible con tu requisito de cobro. Además 13 tareas, la mayoría estancadas desde oct 2025 |
| Kaggle | Verificado: premios sólo a los primeros puestos, entrega por cheque/transferencia a 30 días, competiciones de semanas. No encaja con "$25–100 rápido con mínimo trabajo humano" |
| Algora (como canal) | Plataforma viva, pero **inventario nuevo ≈ cero**: `label:"💎 Bounty"` creadas después del 2026-06-01 → total_count = 4, las cuatro en repos de granja. En `org:tscircuit` después del 2026-07-01 → total_count = 0 |

---

## D. Interesantes pero sin evidencia suficiente

- **`daytona/content#13`** — etiqueta `💎 Bounty`, abierta, sin PRs. Pero **no hay
  importe, ni plazo, ni procedimiento de reclamación visibles** en la issue.
  Publicada en ago 2024 y con 149 comentarios. Sin importe verificable, no es
  una oportunidad, es una intención.
- **`oven-sh/bun#13656`** — bun es un proyecto enorme y activo, pero la mención a
  algora no viene acompañada de ningún comentario de bot con importe. 95
  comentarios. Ver el falso positivo descrito en §0.
- **OBS Project Bounty Program** (Open Collective) — el modelo es idéntico al de
  AsyncAPI y por tanto prometedor, pero no pude enumerar bounties abiertas.
  Vale la pena que lo revises tú.

---

## E. Los tres caminos más claros hacia los primeros $25–$100

No los ordeno por puntuación. Los comparo por los factores que de verdad
diferencian, y dejo claro dónde está la incertidumbre de cada uno.

### AsyncAPI #5004 (canonical tags)
- **Dinero:** importe sin confirmar, pero el programa paga de forma auditable.
- **Dificultad:** baja. Un componente y sus usos.
- **Competencia:** ninguna registrada. Sin asignar, sin PRs, sin comentarios.
- **Riesgo de trabajar gratis:** bajo. Es un bug objetivo dentro de una ronda
  activa; o se acepta o se rechaza por razones técnicas concretas.
- **Trabajo humano tuyo:** mínimo — reservar, revisar, responder revisión, facturar.
- **Punto débil:** el importe del microgrant es la única incógnita seria.

### AsyncAPI #5109 (breadcrumbs)
- Idéntico en dinero, cobro y competencia.
- **Diferencia clave:** es una *feature*, no un bug. Un maintainer puede discutir
  el diseño. Más superficie de conversación y por tanto más trabajo humano tuyo.
- Ventaja propia: la issue afirma que no hace falta tocar el build, lo que acota
  el riesgo técnico.

### AsyncAPI Bounty Program (tarea de $200)
- **Dinero:** el más alto y el mejor documentado de todo el informe.
- **Dificultad:** media por definición del propio programa.
- **Riesgo de cobro:** el más bajo de los tres — hay historial público de pagos.
- **Punto débil:** requiere entender primero el proceso de selección de rondas, que
  es justo la página que no pude abrir. Es el de mayor recompensa y el de arranque
  más lento.

**Lectura honesta del conjunto:** los tres son la misma apuesta —AsyncAPI— con
tres niveles de riesgo. Eso no es diversificación. Es el reconocimiento de que,
a fecha de hoy, sólo encontré un ecosistema que combine dinero documentado,
tareas acotadas y cobro legítimo.

---

## F. Qué falta verificar (en orden de importancia)

1. **Importe de los microgrants 2026-09.** Sin esto, A2 y A3 son trabajo de valor
   desconocido. Fuente: la página del programa AsyncAPI, o preguntar en la propia
   issue agregadora #5704.
2. **Política de IA de AsyncAPI.** Es condición previa innegociable. No escribas
   una línea de código antes de leerla.
3. **Edad mínima y disponibilidad de Open Collective para Panamá**, y si el payout
   llega por PayPal, transferencia o Wise.
4. **Respuesta de BasedHardware** al email que ya enviaste.
5. **Inventario real de Polar.sh** — 10 minutos de revisión manual.

---

## G. Resumen de cobro

| Vía | Método | Comisión | Cuándo se paga | Verificado |
|---|---|---|---|---|
| Open Collective (AsyncAPI) | Factura → PayPal/transferencia | No verificada | Tras aprobar el gasto | Historial público de gastos ✅ |
| Omi | PayPal | — | Tras merge, escribiendo a team@basedhardware.com | ❌ Sin prueba de pagos |
| BountyHub (memanto) | Stripe, PayPal como alternativa | No verificada | Al ganador del leaderboard | Plataforma sí, este pago no |
| PayPal en Panamá | Retiro vía MetroBank-Kipo, hasta $750/día y $5.000/mes (persona física) | No verificada | 48 h con MetroBank, hasta 7 días otros bancos | Fuente: paypal.com/pa — NO VERIFICADO (dominio bloqueado) |

---

## Apéndice · Consultas reproducibles

```
# Inventario nuevo de bounties Algora (resultado: 4, todas granjas)
https://api.github.com/search/issues?q=is:issue+is:open+label:"💎 Bounty"+-label:"💰 Rewarded"+created:>2026-06-01

# tscircuit, histórico mayor emisor (resultado: 0)
https://api.github.com/search/issues?q=org:tscircuit+is:issue+is:open+label:"💎 Bounty"+created:>2026-07-01

# Rondas microgrant AsyncAPI activas (resultado: 5)
https://api.github.com/search/issues?q=org:asyncapi+is:issue+is:open+label:microgrant

# Etiqueta oficial de bounty pagada en Omi (resultado: 0 abiertas, 0 cerradas)
https://github.com/BasedHardware/omi/issues?q=is%3Aissue+label%3A"Paid+Bounty"
```
