# Ronda AsyncAPI 2026-10 y alternativas externas
**Fecha:** 18 sep 2026 · **Criterio:** $25–$100 lo antes posible, sin clientes, sin ventas, sin reputación previa

> No se programó nada. No se abrieron PRs. No se reclamó ninguna oportunidad.
> No se contactó a nadie. No se gastó dinero.

**Conclusión adelantada:** ninguna oportunidad verificada cumple los siete criterios
simultáneamente. El detalle está en §8. Lo que sigue son los datos para que decidas.

---

## Clasificación de fuentes

| Etiqueta | Significado en este documento |
|---|---|
| **[OFICIAL]** | Documento normativo leído íntegro desde su repositorio fuente |
| **[REPO]** | Estado observado en github.com o su API |
| **[OPEN COLLECTIVE]** | **Ninguna evidencia de esta clase existe aquí** — dominio bloqueado |
| **[PLATAFORMA]** | Página oficial de la plataforma, abierta y leída |
| **[BUSCADOR]** | Fragmento de resultados de búsqueda, sin abrir la fuente |
| **[NO VERIFICADO]** | No se pudo comprobar |

Bloqueados por el proxy de esta sesión: `opencollective.com`, `www.asyncapi.com`,
`www.paypal.com`, `devpost.com`, `opire.dev`, `issuehunt.io`, `dev.to`.

---

## 1. AsyncAPI — ronda Microgrant 2026-10

### Reglas específicas de esta ronda

**[REPO]** [discussions#2279](https://github.com/orgs/asyncapi/discussions/2279),
comentario de apertura del 13 sep 2026:

> "Submission of GitHub issues that will become [Microgrant Issues]... is open from
> [2026-09-14 00:00:00 UTC+12:00]"

Reglas declaradas para 2026-10: una sola issue por repositorio; priorizar issues
alineadas con los Community Goals; **prohibidas las Microgrant Issues agregadas**
(el formato "Set of issues..." que bloqueó el caso #5004); negociación entre
maintainers si se desborda el presupuesto; justificar las clasificaciones Advanced.

### Las tres candidaturas, con importe exacto

**[REPO]** Transcripción literal de las candidaturas admitidas:

| # | Issue | Repositorio | **Importe exacto** | Complejidad | Tipo |
|---|---|---|---|---|---|
| 1 | [#877](https://github.com/asyncapi/conference-website/issues/877) | `conference-website` | **$200** | Medium | Coding |
| 2 | [#1248](https://github.com/asyncapi/parser-js/issues/1248) | `parser-js` | **$400** | Advanced | Coding |
| 3 | [#5759](https://github.com/asyncapi/website/issues/5759) | `website` | **$200** | Medium | Coding |

Estos importes son de **candidatura**, no de ronda ni de issue hija. La ronda
dispone de $1.600 **[OFICIAL]**; lo comprometido visible suma $800.

### Estado de cada una — el dato que decide

**[REPO]**, comprobado issue por issue:

| Issue | Estado | **Asignada a** | Autor | Creada | PRs | Comentarios |
|---|---|---|---|---|---|---|
| conference-website#877 | Abierta | **TenzDelek** | kajal-jotwani | 17 dic 2025 | 0 | 0 |
| parser-js#1248 | Abierta | **princerajpoot20** | princerajpoot20 | 13 sep 2026 | 0 | 0 |
| website#5759 | Abierta | **princerajpoot20** | princerajpoot20 | 17 sep 2026 | 0 | 0 |

**Las tres están asignadas.** Ninguna está libre.

En dos de los tres casos, **quien propuso la issue al programa es quien la tiene
asignada**, y la asignación es simultánea a la creación de la issue.

### Trabajo y dificultad (por si alguna se liberase)

- **conference-website#877** — Sección de galería: grid de imágenes en la landing,
  página `/gallery`, imágenes en el nivel gratuito de Cloudinary, enlace a Drive
  para el archivo histórico. Frontend acotado, dificultad baja. 1–2 días.
- **parser-js#1248** — Migrar `@asyncapi/avro-schema-parser` al monorepo
  `parser-js` conservando nombre npm y API pública; configuración del monorepo,
  CODEOWNERS, specs, proceso de release. Dificultad media-alta, riesgo de romper
  publicación de paquetes. Varios días.
- **website#5759** — `/llms.txt`, `/llms-full.txt` y vistas Markdown por página.
  Acotado y mecánico, dificultad baja-media. 1–2 días.

### Requisitos, plazos y cobro

**[OFICIAL]** `asyncapi/community/docs/010-contribution-guidelines/microgrant-program.md`:

- **Prioridad de asignación:** (1) maintainers en MAINTAINERS.yaml, (2)
  contribuidores con **3+ PRs mergeados en la organización**, (3) otros *"per
  maintainer discretion"*. Maintainers reciben asignación inmediata; el resto
  espera **mínimo tres días**.
- **Asignación previa obligatoria:** *"Start date: Following Monday after
  assignment"* y *"Mutual exclusion: only assigned participants contribute during
  Microgrant participation."*
- **Caducidad:** *"Microgrant issues reach End Of Life after the final day of their
  designated calendar month"* → la ronda 2026-10 expira el **31 de octubre de 2026**.
- **Aceptación:** triple validación — maintainer confirma, segundo maintainer
  confirma, Coordinador autoriza el pago.
- **Cobro:** factura en Open Collective, nombre legal coincidente con el de GitHub,
  título `"Microgrant [repo]#[issue]"`, etiqueta `microgrant`, URL completa de la
  issue. Requiere cuenta bancaria verificada y operativa. Formularios del IRS si se
  superan $600/año.
- **Métodos de pago:** *"ACH, International SWIFT via Wise, and PayPal."*

### Política de IA por repositorio

**[REPO]** Búsqueda de código en toda la organización: los únicos ficheros sobre uso
de IA son `apps/generator/docs/ai-policy.md` (repo `generator`) y su copia publicada
en `website/markdown/docs/tools/generator/ai-policy.md`. El texto dice *"contributing
to **this repository**"* y enlaza al CODE_OF_CONDUCT y LICENSE **del generator**.

- `conference-website` → **AI POLICY: NO VERIFICADA**
- `parser-js` → **AI POLICY: NO VERIFICADA**
- `website` → **AI POLICY: NO VERIFICADA** (el fichero vive ahí como *contenido de
  documentación del generator*, no como política del repositorio)

### Evidencia de que este tipo de pago se ha realizado

**[OPEN COLLECTIVE]: ninguna.** El dominio está bloqueado.

**[OFICIAL]** `initiative-inventory.md` documenta pagos recurrentes de la
organización: $2,5k mensuales a la community manager mediante contrato con Open
Source Collective, y $150 por ronda al coordinador del programa. **[REPO]** La
discusión #3612 cita una ronda cerrada *"with the budget state of `1400/1600`"*.

Esto prueba que **AsyncAPI ejecuta presupuesto de forma estructurada**. **No prueba**
que un contribuidor externo haya cobrado un microgrant. La diferencia importa.

### Panamá

**PANAMÁ: NO VERIFICADO.** El documento del programa no enumera países y traslada la
comprobación al participante: *"participants verify Wise eligibility independently"*.

### Lectura estructural de la Parte A

El programa declara **[OFICIAL]** su propósito: *"redistributing sponsor
contributions directly to **maintainers**"*. Las tres candidaturas de octubre son
coherentes con eso: propuestas y asignadas por gente de dentro. No es un fallo del
proceso — es el proceso. Para alguien externo sin PRs mergeados, esta puerta está
cerrada en la práctica.

---

## 2. Oportunidades externas

### 2.1 OBS Project Bounty Program

- **Fuente:** **[REPO]** [wiki del programa](https://github.com/obsproject/obs-studio/wiki/OBS-Project-Bounty-Program)
  y su categoría de discusiones RFP.
- **Clasificación: MONEY_ALREADY_FUNDED** — los fondos residen en un proyecto de
  Open Collective creado para ese fin **[BUSCADOR]**.
- **Bounties abiertas [REPO]:** "Scene Organization Tools" (disc. 5076, 25
  comentarios) y "VST3 Support" (disc. 5074, 93 comentarios), ambas
  `bounty/needs-proposal`. "Automatic File Splitting" y "Hotkey Duplicate
  Detection" figuran como `bounty/claimed`.
- **IMPORTE: NO VERIFICADO** — las cantidades no aparecen en GitHub y la página de
  Open Collective está bloqueada.
- **Proceso:** hay que leer el RFP, **enviar una propuesta de implementación y que
  el equipo la acepte** antes de trabajar. Después, factura en Open Collective.
- **Realidad:** son features grandes de C++ en una aplicación de escritorio,
  publicadas en **agosto de 2021** y aún sin resolver. VST3 lleva 93 comentarios.
  No es trabajo de 1–3 días, y el cuello de botella es la aprobación previa.
- **AI POLICY: NO VERIFICADA.** **PANAMÁ: NO VERIFICADO.**

### 2.2 Topcoder

- **[PLATAFORMA]** Desde el 1 jul 2025 los pagos dejaron de hacerse por PayPal y
  Payoneer; **todos se procesan por Trolley**, que cubre 210+ países y territorios.
  Eso hace a Panamá plausible, aunque **PANAMÁ: NO VERIFICADO** en la lista concreta.
- **Clasificación: PRIZE_POOL.** Los challenges reparten premio entre los primeros
  puestos. No es trabajo financiado por entregar: es una competición.
- **AI POLICY: NO VERIFICADA** por challenge.

### 2.3 tscircuit — canal agotado

**[REPO]** 16 issues abiertas con etiqueta `💎 Bounty` sin recompensar y sin asignar.
Al examinarlas:

- **10 de las 16 están en `tscircuit/docs-old`** — repositorio cuyo propio nombre
  indica que está deprecado, sin actividad desde enero de 2025.
- `jlcsearch#92` vale **$1** y acumula **160 comentarios**.
- `pcb-viewer#163` tiene 65 comentarios y ninguna etiqueta de importe.

Coherente con lo hallado en la investigación previa: cero bounties nuevas en
`org:tscircuit` desde julio de 2026. **Canal muerto.**

### 2.4 Plataformas que no pude verificar

| Plataforma | Estado | Clasificación |
|---|---|---|
| **Opire** | *"over $16,000 in active bounties"* **[BUSCADOR]**. `opire.dev` y su API bloqueados | **NO VERIFICADO** |
| **IssueHunt** | **[REPO]** El repo `IssueHunt/readme` tiene 4 commits y no documenta comisiones, países ni reglas de IA. `issuehunt.io` bloqueado | **NO VERIFICADO** |
| **ProjectDiscovery OSS Bounty** | *"they've decided to shut down the program"* **[BUSCADOR]** | **Cerrado** |

---

## 3. MONEY_ALREADY_FUNDED (dinero presupuestado antes del trabajo)

| Oportunidad | Evidencia de financiación | Obstáculo real |
|---|---|---|
| AsyncAPI Microgrant 2026-10 | **[OFICIAL]** presupuesto anual $21.400, ronda $1.600, importes por candidatura publicados | **Las tres candidaturas ya están asignadas** |
| OBS Bounty Program | **[BUSCADOR]** proyecto dedicado en Open Collective | Importe desconocido; features de 2021; requiere propuesta aprobada |

Son las **dos únicas** de la categoría A que pude verificar. Ninguna es accesible
ahora mismo en la práctica.

---

## 4. PRIZE_POOL (hay dinero, pero hay que ganar)

- **Topcoder** — premio a los primeros puestos.
- **Hackathones** (AssemblyAI, TechEx Europe, Decentralize AI) — **[BUSCADOR]**
  únicamente; `devpost.com` bloqueado. Premios a ganadores.
- **moorcheh-ai/memanto#1852** — $100 *"al mejor envío del leaderboard"*, plazo
  30 sep. **[REPO]** Abierta por un no-maintainer, 42 comentarios.

Tu filtro excluye los premios donde ganar dependa principalmente de competir mucho
tiempo. Los tres entran de lleno en esa exclusión. Los dejo listados por
transparencia, no como recomendación.

---

## 5. Oportunidades descartadas, con el motivo exacto

| Oportunidad | Motivo |
|---|---|
| **DataAnnotation, Outlier, Surge AI** | Doble descarte. (a) **[BUSCADOR]** prohíben trabajo generado con IA — *"the entire point of your role is genuine human judgment"*, bans permanentes; usar Claude violaría sus TOS. (b) DataAnnotation admite sólo EEUU, Canadá, Reino Unido, Irlanda, Australia y Nueva Zelanda — **Panamá excluido** |
| **ProjectDiscovery OSS Bounty** | Programa cerrado |
| **tscircuit `docs-old`** | Repositorio deprecado, sin actividad desde ene 2025 |
| **asyncapi/website#5004 y #5109** | Verificado en el informe anterior: pertenecen a una issue agregada ya asignada; exclusión mutua del programa |
| **Granjas** (SecureBananaLabs, xevrion-v2, UnsafeLabs, claude-builders-bounty) | Cientos o miles de comentarios por issue, importes inverosímiles, sin producto |
| **RustChain / Elyan Labs** | Pago en token propio |
| **Ubiquity DevPool** | Cobro exclusivamente on-chain |
| **jahmeergnlt/traefik#1** | Fork personal, no el repositorio oficial |

---

## 6. Problemas transversales de pago, edad, IA y país

**Pago.** Ninguna vía verificada permite cobrar sin **cuenta bancaria verificada y
operativa a tu nombre legal**, que además debe coincidir con el nombre de tu cuenta
de GitHub en el caso de AsyncAPI **[OFICIAL]**. Es el requisito que menos se
menciona en los listados de bounties y el que más gente bloquea.

**Edad.** Con 18 años cumplidos no hay ningún bloqueo en las vías examinadas. El
documento de AsyncAPI no menciona edad; Open Collective **NO VERIFICADO**.

**IA.** No encontré **ninguna** oportunidad verificada que autorice explícitamente
el uso de IA en el repositorio donde habría que trabajar. La única política de IA
escrita en AsyncAPI pertenece al repo `generator`, y ninguna candidatura de la ronda
2026-10 está en ese repositorio. Las plataformas de anotación, que sí se pronuncian,
lo **prohíben**.

**País.** Panamá no aparece excluida en ninguna vía verificada, pero tampoco
confirmada en ninguna. Único dato sólido: Trolley (Topcoder) cubre 210+ países
**[PLATAFORMA]**.

---

## 7. Tabla comparativa de oportunidades verificadas

| | AsyncAPI 2026-10 | OBS Bounty | Topcoder | tscircuit |
|---|---|---|---|---|
| **Categoría** | A · financiada | A · financiada | B · premio | — |
| **Dinero** | $200 / $400 exactos | NO VERIFICADO | Variable | $1–$65 |
| **Tiempo de trabajo** | 1–2 d (#877, #5759) · varios d (#1248) | Semanas | Variable | Horas |
| **Trabajo manual tuyo** | Alto: negociar asignación, explicar enfoque, 3 validaciones | Alto: redactar y defender propuesta | Medio | Bajo |
| **Trabajo de Claude Code** | Casi toda la implementación | Parte; es C++ de escritorio | Variable | Casi todo |
| **Competencia** | **Las 3 ya asignadas** | 2 abiertas desde 2021 | Alta por diseño | 65–160 comentarios |
| **Riesgo de trabajar gratis** | **Alto** — exclusión mutua | Alto sin propuesta aceptada | Alto — sólo gana el primero | Alto — canal muerto |
| **Requisitos de pago** | Banco verificado + nombre legal = GitHub | Factura en Open Collective | Trolley | NO VERIFICADO |
| **Panamá** | NO VERIFICADO | NO VERIFICADO | Plausible (210+ países) | NO VERIFICADO |
| **IA** | NO VERIFICADA | NO VERIFICADA | NO VERIFICADA | NO VERIFICADA |
| **Velocidad al primer pago** | Semanas (merge + 3 validaciones + factura) | Meses | Semanas | — |

---

## 8. Cuáles cumplen todos los criterios simultáneamente

Los siete criterios eran: dinero previamente financiado · trabajo acotado · IA
permitida · pago compatible con Panamá · sin conseguir clientes · sin semanas de
reputación · completable en 1–3 días.

### **Ninguna. Cero.**

Dónde falla cada una:

- **AsyncAPI 2026-10** cumple *dinero financiado*, *trabajo acotado* y *sin
  clientes*. **Falla en tres:** las tres candidaturas están asignadas (no hay
  trabajo disponible); la IA no está verificada para esos repositorios; y la
  categoría 2 exige 3+ PRs mergeados, que es precisamente la reputación de semanas
  que querías evitar.
- **OBS** cumple *dinero financiado* y *sin clientes*. **Falla en:** importe
  desconocido, alcance de semanas, IA no verificada y aprobación previa de propuesta.
- **Topcoder** cumple *sin clientes* y probablemente *pago compatible*. **Falla en:**
  es un premio competitivo, no dinero financiado por entregar.
- **tscircuit** falla por canal muerto.

### Lo que esto significa

El obstáculo no es encontrar dinero: el dinero existe y está presupuestado. El
obstáculo es que **todas las vías serias que verifiqué exigen asignación o
aprobación previa**, y esa asignación se otorga por historial de contribución. Es
exactamente el filtro que tu criterio quería saltarse.

Merece decirse con claridad: **la combinación "dinero ya financiado + sin reputación
previa + 1–3 días" no aparece en ninguna de las fuentes que pude verificar hoy.**
Los sitios que prometen esa combinación son justamente los que resultaron ser
granjas. Esa correlación no parece casual.

### Qué queda sin verificar, y podría cambiar la respuesta

Tres dominios bloqueados guardan datos que podrían alterar estas conclusiones, y tu
navegador sí puede abrirlos:

1. **`opire.dev`** — se le atribuyen $16.000 en bounties activas **[BUSCADOR]**, con
   API pública sin autenticación. Es la incógnita con más potencial.
2. **`issuehunt.io`** — comisiones, países y estado real del inventario.
3. **`opencollective.com`** — el historial de gastos de AsyncAPI y OBS resolvería de
   una vez si un contribuidor externo ha cobrado alguna vez.

---

## Autorrevisión

Revisé el documento contra los siete fallos que pediste vigilar.

1. **Importes confundidos** — Revisado. §1 separa explícitamente importe de ronda
   ($1.600), importe de candidatura ($200/$400) y presupuesto anual ($21.400). No se
   menciona ningún importe de issue hija porque la ronda 2026-10 **prohíbe** las
   issues agregadas. El importe de OBS se declara NO VERIFICADO en vez de inferirse
   de bounties comparables.
2. **Bounties no financiadas presentadas como financiadas** — Revisado. §3 sólo
   admite dos entradas, ambas con evidencia documental de presupuesto. Topcoder y
   los hackathones se mandan a §4 (PRIZE_POOL) pese a tener dinero real detrás.
3. **Plataformas confundidas** — **Corregido.** Mantengo separados Bounty Program y
   Microgrant Program de AsyncAPI, que son proyectos distintos en Open Collective;
   todos los importes de este informe pertenecen al **Microgrant**. También separo
   OBS (Open Collective) de Topcoder (Trolley), que no comparten mecánica.
4. **Políticas de IA atribuidas al repositorio incorrecto** — **Este era el riesgo
   mayor y está corregido.** La política de IA de AsyncAPI es del repo `generator`.
   Ninguna de las tres candidaturas de 2026-10 está en `generator`, así que las tres
   quedan marcadas **AI POLICY: NO VERIFICADA**, incluida `website` — donde el
   fichero existe físicamente, pero sólo como contenido de documentación.
5. **Afirmaciones de pago en Panamá sin evidencia** — Revisado. No se afirma en
   ningún punto que se pueda cobrar desde Panamá. El único dato de país con fuente
   **[PLATAFORMA]** es la cobertura de Trolley. Se eliminó todo rastro de la
   afirmación sobre PayPal/MetroBank de informes anteriores.
6. **Concursos disfrazados de trabajo remunerado** — **Encontrado uno.**
   `moorcheh-ai/memanto#1852` se anuncia como bounty de $100 pero paga *"al mejor
   envío del leaderboard"*. Reclasificado a §4 (PRIZE_POOL) y señalado como tal.
7. **Datos basados sólo en una suposición** — Revisado. La afirmación más fuerte del
   informe — que las tres candidaturas están asignadas — procede de tres
   comprobaciones **[REPO]** independientes, una por issue. La lectura estructural
   del final de §1 se apoya en una cita **[OFICIAL]** literal sobre el propósito del
   programa, no en una impresión mía.

**Corrección adicional detectada durante la autorrevisión:** en un borrador conté
las 16 bounties abiertas de tscircuit como inventario disponible. Al comprobar los
repositorios, **10 de las 16 están en `docs-old`**, deprecado. Presentarlas como
oportunidades habría inflado el recuento con issues muertas. Reescrito en §2.3.
