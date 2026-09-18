# Topcoder — Verificación final como mecanismo de ingreso
**Fecha:** 2026-09-18
**Pregunta a responder:** ¿Puede Topcoder ser el mecanismo *Claude hace el trabajo → entregamos → el sistema evalúa → cobramos*, sin vender nada?

---

## 0. LIMITACIÓN CRÍTICA DE ESTA INVESTIGACIÓN — LEER ANTES QUE NADA

**Todos los dominios de Topcoder están bloqueados por el proxy de red de esta sesión.** Comprobado
directamente, todos devuelven fallo de conexión (`CONNECT tunnel failed, response 403`):

| Dominio | Resultado |
|---|---|
| `www.topcoder.com` | BLOQUEADO |
| `community-app.topcoder.com` | BLOQUEADO |
| `help.topcoder.com` | BLOQUEADO |
| `api.topcoder.com` | BLOQUEADO |
| `discussions.topcoder.com` (foros oficiales) | BLOQUEADO |
| `trolley.com` / `docs.trolley.com` | BLOQUEADO |
| `huggingface.co` (blog oficial de Topcoder) | BLOQUEADO |

**Consecuencia directa:** no he podido leer ni una sola página oficial de términos, reglas de competición,
FAQ, política de IA ni foro oficial de Topcoder. **No puedo responder la pregunta 1 con fuentes oficiales
desde este entorno.** Cualquier informe que afirmara lo contrario estaría inventando.

**Lo que sí es fuente oficial y sí pude leer:** el **código fuente público de la organización
`topcoder-platform` en GitHub**, que es propiedad de Topcoder y está activo (commits de septiembre de 2026).
Eso me permite verificar el *mecanismo* de la plataforma (cómo se evalúa, cómo se paga, qué controles
existen) aunque no las *políticas redactadas*.

### Niveles de evidencia usados en este informe

- **[OFICIAL-CÓDIGO]** — leído por mí en repositorios de `topcoder-platform` (GitHub). Es código de
  producción de Topcoder. Alta fiabilidad sobre el funcionamiento, nula sobre políticas legales.
- **[TÍTULO INDEXADO]** — el título de una página de `topcoder.com` tal como aparece en resultados de
  búsqueda. El título es de Topcoder, pero **no leí la página**: no sé si el challenge está abierto,
  cerrado o cuáles son sus reglas.
- **[TERCEROS]** — blogs, agregadores, Wikipedia. **No es regla oficial de Topcoder.**
- **[NO VERIFICADO]** — no encontrado o no confirmable.

**Ningún dato de terceros se presenta en este informe como regla oficial de Topcoder.**

---

## 1. TOPCODER + IA

### Resultado de la búsqueda

Busqué los términos `AI`, `ChatGPT`, `Claude`, `Copilot`, `LLM`, `generative AI`, `artificial intelligence`,
`AI-generated`, `automated tools`, `bots`, `code generation` en:

- la organización completa `topcoder-platform` en GitHub → **0 resultados** de texto de política;
- búsqueda web dirigida a términos, reglas, Thrive (centro de artículos oficial), FAQ y foros → **ninguna
  política pública localizable**.

Los términos oficiales (`topcoder.com/community/terms`, `/community/how-it-works/terms`) y el centro de
ayuda están **bloqueados**, y los términos por challenge se sirven desde una API de términos, no desde el
repositorio — por eso no aparecen en el código.

### Lo que sí encontré en el código oficial, y lo que NO significa

**[OFICIAL-CÓDIGO]** Topcoder ha construido una infraestructura propia de **revisión con IA**:

- `review-api-v6`: módulos `ai-review-config` y `ai-review-escalation`;
- `platform-ui`: componente `SubmissionAiReviewDetails.tsx`, que muestra *workflow runs* con
  `score` y `scorecard.minimumPassingScore`, y registra `gitRunId` / `gitRunUrl`;
- `platform-ui` → `ChallengeEditorForm.tsx`: mensaje *"Update the AI template selection before saving or
  launching this challenge"* — los challenges tienen plantilla de IA configurable.

**Interpretación honesta:** esto prueba que **Topcoder usa IA para *revisar* entregas**. **No prueba nada
sobre si un miembro puede usar IA para *producir* su entrega.** Son dos cosas distintas y no voy a
confundirlas.

**[TÍTULO INDEXADO]** Existe un challenge titulado
*"[$500/$250] - Autonomous AI Architect MultiAgent Workflow for Topcoder Review Scorecards"* — es decir,
Topcoder paga a miembros por construir flujos multiagente. Eso indica que el trabajo *sobre* IA es bienvenido.
**Sigue sin ser una política sobre el uso de IA en las entregas.**

**[TÍTULO INDEXADO]** Topcoder opera un "AI Hub", una "AI Exponential League" y un "AI Leaderboard"
(`topcoder.com/ai-hub/...`). No pude leer su contenido.

### Lo único parecido a una regla de autoría que localicé

**[TERCEROS]** En artículos de Thrive sobre challenges de diseño se menciona que las entregas deben
contener únicamente elementos creados por el miembro o recursos de terceros autorizados. **No leí el texto
original**, es de diseño, y no menciona IA. **No lo cuento como política de IA.**

### CLASIFICACIÓN

> # AI UNKNOWN

Aplico literalmente tu instrucción: **la ausencia de política NO se interpreta como AI ALLOWED.**

**¿Cada challenge fija sus propias reglas?** Sí — **[OFICIAL-CÓDIGO]** el modelo de datos confirma que cada
challenge lleva sus propios `terms` asociados y su propia configuración de revisión y scorecard. Por tanto,
**aunque existiera una política general, la regla vinculante es la de cada challenge concreto**, y hay que
leerla antes de cada entrega. Esto no es opcional: es el punto donde se decide si el método es legal o no.

---

## 2. TIPO DE CHALLENGE QUE NOS INTERESA

De los tipos que existen en la plataforma **[OFICIAL-CÓDIGO]** (`CHALLENGE_TYPES` en
`platform-ui/src/apps/work/src/config/index.config.ts`: `Challenge`, `First2Finish`, `Marathon Match`;
tracks `DEVELOP`, `DESIGN`, `DATA_SCIENCE`, `QA`), el que encaja con tu requisito de **resultado probable
objetivamente y sin hablar con nadie** es **Marathon Match**, y por un motivo verificable:

**[OFICIAL-CÓDIGO]** `marathon-match-api-v6/docs/review-phase-scoring.md` y `submission-phase-scoring.md`
describen el pipeline real:

- la entrega se puntúa **automáticamente**: un *tester jar* se ejecuta en un contenedor ECS aislado
  (*"scrubbed env, no outbound INET/INET6 sockets"*);
- dos fases: **Provisional** (leaderboard en vivo) y **System/Final** (conjunto mayor de casos);
- campos de progreso `testProcess` (`provisional`|`system`), `testProgress`, `testStatus`;
- soporta *relative scoring* recalculado contra el mejor resultado bruto.

**Es decir: cero revisores humanos, cero negociación, cero contacto. Puntuación por máquina.** Ese es
exactamente tu flujo.

Por contraste, **[OFICIAL-CÓDIGO]** los challenges de tipo `Challenge` / `First2Finish` pasan por
**Screening → Review → Appeals → Final Review** con *scorecards* y `minimumPassingScore` (p. ej. 75 u 80 en
los ejemplos del código), y `autopilot-v6` asigna revisores. Ahí **sí hay evaluación humana** y un proceso de
apelación — lo que implica interacción, aunque no sea venta.

### Candidatos concretos localizados

Aviso: **son [TÍTULO INDEXADO]. No pude abrir las páginas, así que NO sé si están abiertos, ni sus fechas,
ni sus reglas, ni cuántos participantes tienen.** Los incluyo como *pistas de dónde mirar*, no como ofertas
verificadas.

| Nombre (título indexado) | Premios en el título | Tipo | Fecha/duración | Participantes | Reglas IA |
|---|---|---|---|---|---|
| March Madness Series: Neptune — Facial Re-Identification Marathon Match | $12000/$8000/$6000/$4000/$3000 | Marathon | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| March Madness Series: Neptune — Facial Detection Marathon Match | $12000/$8000/$6000/$4000/$3000 | Marathon | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| March Madness Series: Neptune — Text Summarization Marathon Challenge | $11000/$6000/$3500/$1500/$1000 | Marathon | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| Marathon Match Practice: SnakeCharmer | sin premio (práctica) | Marathon | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| Test for Success Challenge Series — QA Challenge 3 | $4340 | QA | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| Autonomous AI Architect MultiAgent Workflow for Topcoder Review Scorecards | $500/$250 | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |
| Topcoder AI Hub Minisite Design Challenge | $1200/$600/$150 | Diseño | NO VERIFICADO | NO VERIFICADO | NO VERIFICADO |

**Qué haría Claude** en un Marathon Match: leer la especificación, implementar la solución, iterar contra el
leaderboard provisional, optimizar la métrica. Realistamente **85–95%** del trabajo técnico.
**Qué harías tú:** crear/verificar cuenta, aceptar los términos del challenge (y leer su regla de IA), lanzar
los envíos, completar KYC y formulario fiscal.

**Dificultad:** alta. Un Marathon Match de visión por computador o resumen de texto con $12.000 de bolsa
atrae a especialistas. No es trabajo de unas horas.

---

## 3. COMPETENCIA

**Participantes por challenge: NO VERIFICADO.** La página de cada challenge muestra el número de
registrados y de envíos, pero está bloqueada.

**Submissions: NO VERIFICADO.**

**Puestos pagados — dato oficial parcial:**
**[OFICIAL-CÓDIGO]** el modelo de datos confirma que los premios son una lista ordenada por `placement`, y
**[TERCEROS]** los propios títulos de los Marathon Matches muestran **5 puestos premiados**
($12000/$8000/$6000/$4000/$3000).

**[TERCEROS]** Sobre el testeo final en Marathon Match se afirma que, si hay N premios principales, al menos
las 2N mejores entregas del leaderboard provisional pasan a testeo final. **No pude confirmarlo en fuente
oficial** — lo marco **NO VERIFICADO**.

**No calculo ninguna probabilidad de ganar.** No tengo el número de participantes, así que cualquier cifra
sería inventada. Lo que sí puedo afirmar sin inventar: **en un Marathon Match con 5 puestos premiados,
cobrar exige quedar entre los 5 mejores de un campo abierto y desconocido de especialistas.**

---

## 4. PAGOS — lo mejor verificado de todo el informe

Aquí el código oficial sí da respuestas sólidas. **[OFICIAL-CÓDIGO]**, repositorios `tc-finance-api` y
`platform-ui` (app `wallet`):

| Punto | Hallazgo | Fuente |
|---|---|---|
| Proveedor | Trolley, integrado de forma nativa: `trolley_recipient`, webhooks, widget `widget.trolley.com` | `tc-finance-api`, `platform-ui/default.env.ts` |
| Métodos | El README de `tc-finance-api` cita "Trolley, PayPal, Payoneer"; **todo el código activo es de Trolley** | `tc-finance-api/README.md` |
| Mínimo de pago | Existe la variable `TROLLEY_MINIMUM_PAYMENT_AMOUNT`, expuesta al usuario como `minWithdrawAmount`. **Su valor por defecto en el código es `0`; el valor real en producción NO ES PÚBLICO** | `config.env.ts`, `wallet.service.ts` |
| KYC | **Confirmado.** La UI muestra el estado `'On Hold (ID Verification)'` para pagos retenidos, y hay un webhook `recipient-verification.handler.ts` | `platform-ui/.../PaymentsListView.tsx` |
| Formulario fiscal | **Confirmado.** La UI tiene un botón `'COMPLETE TAX FORM'` y existen `tax_form_status`, `user_tax_form_associations`, `tax-form.handler.ts` | `platform-ui/HomeTab.tsx`, `tc-finance-api` |
| Retención fiscal | Existe `taxWithholdingDetails` en el servicio de wallet | `wallet.service.ts` |
| Cuándo se paga | El pago pasa a estado retirable ("releasable winnings") y el miembro lo retira; **el plazo concreto NO ES PÚBLICO** | `withdrawal.service.ts` |
| Comisiones | **NO VERIFICADO** |
| Países / Panamá | **NO VERIFICADO.** No hay lista de países en el código: la elegibilidad la resuelve Trolley en su widget, y `trolley.com` está bloqueado | — |

### ¿Puede una persona en Panamá recibir legalmente un premio de Topcoder vía Trolley?

> # PENDIENTE DE VERIFICACIÓN DEL USUARIO

No lo puedo confirmar. Lo que sí puedo afirmar con base oficial: **el cobro está condicionado a superar
verificación de identidad (KYC) y a completar un formulario fiscal**, ambos gestionados dentro del widget
de Trolley. Ese widget es el que te dirá si Panamá es un destino admitido y con qué método.

Nota importante y favorable: a diferencia del caso Stripe (Algora/huntr) del informe anterior, **aquí no
encontré ninguna evidencia de exclusión de Panamá**. Simplemente no hay información pública. Es
*desconocido*, no *negativo*.

---

## 5. EDAD

- Edad mínima: **NO VERIFICADO.** Los términos oficiales están bloqueados y no hay ninguna comprobación de
  edad en el código público que haya encontrado.
- Restricciones para menores: **NO VERIFICADO.**
- Requisitos de identidad: **CONFIRMADO [OFICIAL-CÓDIGO]** — verificación de identidad obligatoria antes de
  poder cobrar (estado `On Hold (ID Verification)`), más formulario fiscal.

**[TERCEROS]** Es habitual que estas plataformas exijan 18+. **No lo presento como regla de Topcoder** porque
no lo he leído en su documento.

No he buscado, ni buscaré, ninguna forma de eludir una restricción de edad o de identidad.

---

## 6. MODELO REAL DE INGRESO — ¿encaja?

**Sí, estructuralmente encaja, y es el mejor encaje que hemos encontrado.**

Flujo real de Topcoder, según su propio código:

```
ENTRAR → ELEGIR CHALLENGE ABIERTO → CLAUDE PRODUCE LA SOLUCIÓN → SUBIR ENTREGA
      → EVALUACIÓN (automática en Marathon Match / scorecard con revisor en Challenge y F2F)
      → PREMIO SEGÚN PLACEMENT → KYC + FORMULARIO FISCAL → RETIRADA VÍA TROLLEY
```

**Lo que NO hay en ningún punto:** buscar cliente, vender, negociar precio, hacer marketing, construir
audiencia. La demanda la pone Topcoder. **Ese requisito tuyo se cumple al 100%.**

La única interacción humana posible es responder a un revisor en los tipos `Challenge`/`First2Finish` — y en
**Marathon Match ni siquiera eso**, porque puntúa una máquina.

**Los dos problemas no son de modelo, son de viabilidad:**
1. No sabemos si usar IA para producir la entrega está permitido (**AI UNKNOWN**).
2. No sabemos si puedes cobrar desde Panamá.

---

## 7. OBJETIVO DE DINERO — aquí hay una incompatibilidad que debes conocer

Tu objetivo declarado: **$25–$200 por resultado, en horas o pocos días, sin inversión inicial.**

Lo que realmente encontré:

| Lo que buscas | Lo que ofrece Topcoder |
|---|---|
| $25–$200 por tarea | Los challenges localizados tienen premios de **$250 a $12.000** |
| Horas o pocos días | Un Marathon Match con $12.000 de bolsa es trabajo de **semanas**, no de horas |
| Pago por completar | **Pago por *ganar*.** Solo cobran los primeros puestos |

**No presento los premios grandes como equivalentes a tu objetivo — son otra cosa.** Un Marathon Match de
$12.000 no es "un resultado de $200 multiplicado": es una apuesta de semanas de trabajo con probabilidad
desconocida de cobrar cero.

**Los premios de tercer/cuarto puesto ($150–$250 en challenges de diseño y desarrollo) sí caen en tu rango**,
pero siguen siendo competitivos: hay que quedar entre los primeros para cobrarlos.

**Inversión inicial:** no encontré ninguna cuota de entrada. **[NO VERIFICADO]** formalmente, pero no hay
rastro de pago por participar en el código ni en ninguna fuente.

**Conclusión honesta de este punto:** Topcoder **no** es una fuente de tareas de $25–$200 pagadas por
completarlas. Es una plataforma de **premio competitivo**. Encaja con tu *flujo* pero no con tu *estructura
de pago ideal*.

---

## 8. VERIFICACIÓN MANUAL — 5 puntos, solo lo que yo no puedo hacer

### 1. Política de IA en los términos generales
- **Dónde:** `topcoder.com/community/terms` y `topcoder.com/community/how-it-works/terms`
- **Qué buscar (Ctrl+F):** `AI`, `artificial intelligence`, `generative`, `machine-generated`, `own work`, `originality`
- **Compatible:** no se prohíbe la asistencia de IA, o se permite con divulgación
- **DESCARTAR si:** prohíbe entregas generadas o asistidas por IA, o exige que el código sea escrito íntegramente a mano por el miembro

### 2. Política de IA en el challenge concreto
- **Dónde:** pestaña de un challenge abierto en `topcoder.com/challenges` → sección de términos/reglas del propio challenge
- **Qué buscar:** las mismas palabras, más `tooling`, `third-party code`, `disclose`
- **Compatible:** silencio + regla general permisiva, o permiso explícito
- **DESCARTAR si:** ese challenge prohíbe IA (entonces descartas *ese* challenge, no la plataforma — hay que revisar uno por uno)

### 3. Panamá en Trolley
- **Dónde:** Topcoder → Wallet → pestaña **Payout** (abre el widget de Trolley). Se puede llegar sin participar en ningún challenge
- **Qué buscar:** si Panamá aparece en el selector de país y qué métodos de cobro ofrece
- **Compatible:** Panamá seleccionable con transferencia bancaria o similar
- **DESCARTAR si:** Panamá no está en la lista, o no ofrece ningún método de retirada

### 4. Mínimo de retirada real
- **Dónde:** misma pantalla Wallet → campo de importe mínimo (`minWithdrawAmount`)
- **Qué buscar:** la cifra concreta
- **Compatible:** mínimo bajo (p. ej. $0–$25), que permite cobrar premios pequeños
- **DESCARTAR si:** el mínimo es tan alto que un premio de $150–$250 quedaría atrapado sin poder retirarse

### 5. Edad mínima y verificación de identidad
- **Dónde:** términos oficiales + el flujo de verificación de identidad en Wallet
- **Qué buscar:** `age`, `18`, `minor`, `eligibility`, y qué documento pide el KYC
- **Compatible:** cumples la edad y puedes aportar el documento con tu nombre real
- **DESCARTAR si:** no cumples el requisito de edad. **En ese caso se descarta y no se busca ninguna alternativa para sortearlo.**

---

## 9. DECISIÓN

> # WAIT FOR USER VERIFICATION

**Por qué no es GO:** la política de IA está clasificada **AI UNKNOWN** y la elegibilidad de Panamá es
desconocida. Son exactamente las dos cosas que deciden si esto es legal y cobrable para ti, y ninguna se
puede resolver desde este entorno porque todos los dominios de Topcoder están bloqueados.

**Por qué no es DROP:** no encontré **ninguna incompatibilidad confirmada**. El modelo de ingreso encaja con
tu requisito central —la plataforma pone la demanda y nunca tienes que vender—, el mecanismo de evaluación
automática de Marathon Match es exactamente el flujo que pediste, y el sistema de pagos vía Trolley con KYC
y formulario fiscal es real, está en producción y no muestra exclusión de Panamá.

**Reserva que debo dejar por escrito:** aunque las 5 verificaciones salgan bien, Topcoder es **premio
competitivo**, no pago por tarea. Cumple tu flujo pero no tu objetivo de $25–$200 por resultado en horas.
Si tu criterio de "$25–$200 por resultado completado" es innegociable, entonces la respuesta honesta es que
**Topcoder cumple el flujo pero no el modelo económico**, y eso deberías decidirlo tú con este dato delante.

---

## Registro de cumplimiento

No participé en ningún challenge. No abrí ninguna cuenta. No envié código. No contacté a nadie.
No programé nada. Solo investigación.

## Segunda revisión (realizada antes de cerrar el informe)

Repasé el documento entero buscando tres fallos concretos:

1. **¿Presento algún dato de terceros como regla oficial de Topcoder?** No. Los tres puntos con origen en
   terceros (la regla de autoría en challenges de diseño, el testeo final 2N en Marathon Match, y la edad
   de 18 años) están marcados como [TERCEROS] o NO VERIFICADO, con la advertencia explícita de que no los
   cuento como política de Topcoder.
2. **¿Interpreto en algún punto el silencio como permiso?** No. La clasificación es AI UNKNOWN pese a que
   Topcoder opera un AI Hub y usa IA en su propia revisión; dejo escrito que revisar con IA y entregar con
   IA son cosas distintas.
3. **¿Inventé alguna probabilidad de ganar, número de participantes, país admitido o importe mínimo?** No.
   Todos esos campos están como NO VERIFICADO o PENDIENTE DE VERIFICACIÓN DEL USUARIO.
