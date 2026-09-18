# Verificación final — asyncapi/website#5004
**Fecha:** 18 sep 2026 · **Estado de la decisión: DROP** (para #5004 como trabajo pagado)

> No se escribió código. No se clonó el repositorio para modificarlo. No se abrieron PRs.
> No se reclamó ni asignó ninguna issue. No se contactó a ningún maintainer.

---

## Clasificación de fuentes usada en este documento

| Etiqueta | Significado |
|---|---|
| **[OFICIAL]** | Documento normativo de AsyncAPI leído íntegro desde su repositorio |
| **[GITHUB]** | Estado observado directamente en github.com o su API |
| **[OC]** | Open Collective — **ninguna evidencia de esta clase existe en este informe** (ver §5) |
| **[BUSCADOR]** | Fragmento de resultados de búsqueda, sin abrir la fuente |
| **[INFERENCIA]** | Razonamiento mío, no un hecho observado |

Dominios bloqueados por el proxy de esta sesión, y por tanto no consultables:
`opencollective.com`, `www.asyncapi.com`, `www.paypal.com`.

---

## 1. Estado de la issue #5004

**[GITHUB]** — https://github.com/asyncapi/website/issues/5004

| Comprobación | Resultado |
|---|---|
| ¿Sigue abierta? | **Sí** |
| ¿Sin asignar? | **Sí**, sin asignatarios |
| ¿Existe PR que la resuelva? | **No**, ningún PR vinculado |
| Etiquetas | **`stale` únicamente** |
| Autor | `Sam-61s`, 23 ene 2026 |
| Comentarios | Ninguno |

**Trabajo que requiere** (cuerpo de la issue, [GITHUB]): los docs no llevan
etiqueta canonical en `<head>`; los blog posts sólo la incluyen si existe un campo
`canonical` en el frontmatter. La solución propuesta es que el componente `Head`
incluya siempre una canonical usando la URL de la página actual por defecto, acepte
una prop `canonical` opcional para sobrescribirla, y se use de forma consistente.
Ficheros citados: `components/Head.tsx`, `components/layout/DocsLayout.tsx`,
`components/layout/BlogLayout.tsx`.

**¿Está incluida en la ronda MICROGRANT 2026-09?** Sí, pero **no como crees**.
**[GITHUB]** La issue agregadora
[website#5704](https://github.com/asyncapi/website/issues/5704) lleva la etiqueta
`microgrant` y su cuerpo lista dos issues hijas: #5109 y #5004.
**#5004 en sí misma no lleva ninguna etiqueta `microgrant` ni de complejidad.**

---

## 2. Importe correspondiente a #5004

### El dato decisivo

**[GITHUB]** En la discusión oficial de submissions
[asyncapi/discussions#2279](https://github.com/orgs/asyncapi/discussions/2279),
las candidaturas admitidas a la ronda **2026-09** son:

```
optimizer#306,           400 (Coding)
conference-website#1033, 200 (Coding)
asyncapi-react#1299,     400 (Coding)
parser-js#1203,          200 (Coding)
website#5704,            200 (Coding)
```

La unidad económica del programa es **`website#5704`, por $200 en total** — la issue
agregadora. **#5004 no aparece como candidatura independiente.**

### Conclusión sobre el importe

**El importe asignado específicamente a #5004 es: DESCONOCIDO — y muy probablemente
no existe como partida propia.**

#5004 es una de las **dos** issues hijas dentro de un microgrant de $200. Si esos
$200 cubren el conjunto #5109 + #5004, resolver sólo #5004 no corresponde a una
recompensa definida. **[OFICIAL]** El documento del programa no contempla el pago
parcial de una issue agregadora: el reclamo se hace con el título
`"Microgrant [repo]#[issue]"` sobre la issue del programa, que aquí es #5704.

### Corrección explícita de mi informe anterior

En `paid-opportunities-expanded-2026-09-18.md` presenté "$200 media / $400 avanzada"
en un contexto que sugería que #5004 valía $200. **Eso era incorrecto.** Esa tarifa
**[OFICIAL]** se aplica a la issue del microgrant (#5704), no a cada issue hija.
Es exactamente el error de confundir el promedio del programa con el pago concreto.

---

## 3. Política de IA

### Lo que sí existe

**[OFICIAL]** Hay una política de IA escrita:
`asyncapi/generator/apps/generator/docs/ai-policy.md`, publicada también en
`asyncapi/website/markdown/docs/tools/generator/ai-policy.md`.
Es **permisiva con divulgación obligatoria**. Citas textuales breves:

> "AI tools are instruments — humans are the only authors."

> "If a contribution was materially AI-assisted, you **must** disclose it:
> **Pull requests:** include a `Generated-by:` line in the PR description naming
> the tool and its version, for example: `Generated-by: Claude Code 1.x`"

> "Maintainers may **close non-compliant pull requests without review**, including
> undisclosed AI-generated PRs and PRs the contributor cannot explain."

> "You must be able to justify any part of the contribution if a maintainer asks.
> 'The AI wrote it' is not an answer."

### El problema de alcance

**[OFICIAL]** El propio texto dice *"contributing to **this repository**"*, enlaza al
`CODE_OF_CONDUCT.md` y al `LICENSE` **del repositorio generator**, y remite al canal
`#generator` de Slack. El fichero que vive en `asyncapi/website` está ahí como
**contenido de documentación del generator**, no como política del repositorio website.

**[GITHUB]** Busqué en todo `asyncapi/website` los términos `Generated-by` y
`AI assistance`: sólo aparecen 2 ficheros, ambos bajo
`markdown/docs/tools/generator/`. **No hay política de IA propia del repositorio
`asyncapi/website`, ni sección de IA en su plantilla de PR.**

### Dato adicional en contra

**[OFICIAL]** En `asyncapi/community`, el proceso de revisión de candidaturas del
Maintainership Program filtra explícitamente *"Submissions that **rely heavily** or
**vaguely** on **AI-generated** content"*. Se refiere a **solicitudes de programa**,
no a código — pero muestra una cultura organizativa sensible al asunto.

### Veredicto

> **AI POLICY: NO CONFIRMADA para `asyncapi/website`.**

Existe una política clara y favorable, pero escrita para otro repositorio. No asumo
que se extienda. Lo que sí es razonable **[INFERENCIA]** es que declarar
`Generated-by: Claude Code` nunca puede perjudicarte: cumple la política donde
aplica y demuestra buena fe donde no.

---

## 4. Requisitos del contribuidor

Todo esta sección es **[OFICIAL]**, de
`asyncapi/community/docs/010-contribution-guidelines/microgrant-program.md`.

### Quién puede participar — y en qué orden

> "1. AsyncAPI Maintainers (verified in MAINTAINERS.yaml)
> 2. Regular contributors (3+ merged PRs across AsyncAPI organization)
> 3. Other contributors (per maintainer discretion)"

> "Maintainers receive immediate assignment upon labeling; others wait minimum three days."

**Tu situación:** sin PRs mergeados en la organización AsyncAPI, entras en la
**categoría 3, "a discreción del maintainer"**. No es cola por orden de llegada: es
una decisión discrecional en la que estás detrás de dos grupos enteros.

Además: *"Categories 2-3 participants must explain resolution approaches"* — tendrías
que explicar tu enfoque antes de que te asignen.

### Hay que estar asignado ANTES de trabajar

> "**Start date**: Following Monday after assignment"

> "Mutual exclusion: only assigned participants contribute during Microgrant participation"

Esto es terminante. El cronograma arranca con la asignación, y sólo el participante
asignado contribuye. **Implementar primero y pedir el pago después no es un camino
previsto por el programa.**

### Requisitos de edad y cuenta

- **Edad:** el documento **no menciona ningún requisito de edad**. NO VERIFICADO si
  Open Collective impone 18+ (dominio bloqueado).
- **Cuenta:** *"Legal name matching GitHub account name"* y *"Verified, operational
  bank account"*.

### Cuándo se considera aceptado y quién decide

> "1. Maintainer confirms technical resolution via comment
> 2. Repository maintainer provides second confirmation
> 3. Program Coordinator approves and authorizes payout"

Triple validación. No basta con que el PR se mergee.

### Plazos y caducidad

Medium: draft PR en la semana 2, PR final en la semana 4, merge en la semana 6.
*"Microgrant issues reach End Of Life after the final day of their designated
calendar month"* → la ronda 2026-09 caduca el **30 de septiembre**.

### Sistema de sanciones

Abandonar o incumplir plazos acarrea suspensión de 2 meses; reincidencia, 8 meses.
*"Suspended participants receive no compensation even upon voluntary completion."*

---

## 5. Open Collective

> **Ninguna afirmación de esta sección pudo verificarse en opencollective.com.
> El dominio está bloqueado por el proxy de esta sesión. Todo lo que sigue procede
> del documento [OFICIAL] del programa, no de Open Collective.**

**[OFICIAL]** Requisitos de la factura:

> "- Legal name matching GitHub account name
> - Title format: 'Microgrant [repo]#[issue]'
> - Tag: 'microgrant'
> - Full GitHub issue URL in description"

> "**Critical prerequisites**:
> - Verified, operational bank account
> - Sanctions compliance verification (participants verify Wise eligibility independently)
> - IRS tax forms required if submitting $600.00+ annually to US-hosted Collectives"

> "Supported payout methods include ACH, International SWIFT via Wise, and PayPal."

**[OFICIAL]** Comisiones: el presupuesto anual reserva *"Open Collective fees:
~$400.00 annually"*, es decir, las asume el programa, no el contribuidor. No hay
desglose porcentual publicado en este documento.

### Panamá

**NO VERIFICADO.** El documento no enumera países admitidos. Traslada la
comprobación al participante: *"participants verify Wise eligibility independently"*.

**No afirmo que PayPal funcione para recibir estos pagos en Panamá.** En mi informe
anterior cité límites de retiro vía MetroBank-Kipo procedentes de **[BUSCADOR]**;
`paypal.com` está bloqueado y nunca abrí esa página. Tratar como no verificado.

---

## 6. Historial de pagos

**No pude aportar ni una sola evidencia de clase [OC].** `opencollective.com` está
bloqueado.

### Corrección de mi informe anterior

En `paid-opportunities-expanded-2026-09-18.md` escribí que AsyncAPI tenía
*"Historial público de gastos pagados ✅"* citando el "Expense #263185". **Esa marca
de verificación era indebida.** Ese dato procede de un fragmento de **[BUSCADOR]**;
nunca abrí Open Collective. Lo retiro como evidencia verificada.

### Lo que sí puedo sostener, y de qué clase es

**[OFICIAL]** `asyncapi/community/docs/020-governance-and-policies/initiative-inventory.md`
documenta pagos reales y recurrentes de la organización:

> "[Thulie]: hired through official contract with Open Source Collective (on our
> behalf) to do community management ($2.5k monthly)"

> "[Ash]: makes sure AsyncAPI Microgrant program runs smoothly, organizes 12
> rounds/year, one each month. We pay $150 for each round."

**[OFICIAL]** La discusión #3612 menciona una ronda cerrada *"with the budget state
of `1400/1600`"*, lo que implica ejecución presupuestaria real.

**Fuerza probatoria:** esto demuestra que **AsyncAPI mueve dinero de forma
estructurada y presupuestada**. **No demuestra** que un contribuidor externo
concreto haya cobrado un microgrant. Para eso hace falta abrir Open Collective.

---

## 7. Riesgo de trabajar gratis en #5004

### **ALTO**

No es una estimación prudente. Es una consecuencia directa de tres hechos verificados:

1. **[GITHUB]** La issue del microgrant (#5704) **ya está asignada** a
   `anshgoyalevil`, con estado **"In Progress"** en el tablero del Microgrant Program.
   La abrió esa misma persona el 16 ago 2026.
2. **[OFICIAL]** *"Mutual exclusion: only assigned participants contribute during
   Microgrant participation."* Implementar #5004 ahora sería contribuir a un
   microgrant asignado a otra persona. Está explícitamente excluido, y no se paga.
3. **[OFICIAL]** *"Start date: Following Monday after assignment"* — el trabajo
   remunerado empieza tras la asignación. No hay vía de "entrego y luego cobro".

A esto se suma que el importe propio de #5004 es DESCONOCIDO (§2) y que entrarías
por la categoría 3, discrecional (§4).

### Qué condición falta exactamente para que fuese BAJO

Las cuatro, simultáneamente:

1. Que **tú** figures como **asignado** a una issue del programa Microgrant, antes de
   escribir una línea.
2. Que esa issue lleve su etiqueta de complejidad (`microgrant/medium` o
   `microgrant/advanced`), que es lo que fija $200 o $400.
3. Que la ronda esté **abierta** y la issue no haya alcanzado su End Of Life.
4. Que la política de IA aplicable al repositorio esté **confirmada**, no inferida.

Hoy no se cumple ninguna de las cuatro para #5004.

---

## 8. Decisión operativa

# DROP

**Para #5004 como oportunidad de trabajo pagado.** El microgrant que la contiene está
asignado a un maintainer y en curso; #5004 no tiene importe propio; y las reglas del
programa prohíben que contribuya alguien que no sea el participante asignado.

Esto **no** invalida AsyncAPI como ecosistema. Invalida esta issue, ahora. El programa
es real, está documentado con un detalle poco común, tiene presupuesto anual
aprobado y rondas mensuales activas — la ronda **2026-10 ya está recibiendo
candidaturas** (**[GITHUB]** `princerajpoot20` propuso `website#5759` el 17 sep 2026).

### Lo que esto implica de verdad

El programa AsyncAPI no es un tablón de bounties donde llegas y cobras. Es un
proceso con asignación previa, prioridad por historial y triple validación. Para
entrar por la puerta que sí existe, la categoría 2 exige **3+ PRs mergeados en la
organización AsyncAPI**. Ese es el requisito real, y no se salta.

Conviene decirlo sin adornos: **el camino corto a los primeros $100 vía AsyncAPI no
existe.** Existe un camino de varias semanas que empieza por contribuciones no
pagadas para alcanzar la categoría 2. Es legítimo y verificable, pero no es rápido,
y decidir si vale la pena es tuyo, no mío.

---

## Autorrevisión de este documento

Revisé el informe contra los cinco fallos que pediste vigilar.

1. **Importes confundidos** — **Encontrado y corregido.** §2. Mi informe anterior
   daba a entender que #5004 valía $200. El valor real de la unidad económica es
   $200 para #5704 completa, que contiene dos issues. El importe propio de #5004
   queda declarado DESCONOCIDO.
2. **Reglas no verificadas presentadas como hechos** — **Encontrado y corregido.**
   §5 y §6. Retiré la marca "✅" sobre el historial de Open Collective y separé lo
   [OFICIAL] de lo [BUSCADOR]. Añadí el aviso de que no existe evidencia [OC] alguna.
3. **Afirmaciones sobre IA sin fuente** — Revisado. Toda cita de §3 es textual del
   fichero `ai-policy.md`. El veredicto es **NO CONFIRMADA** para `asyncapi/website`,
   apoyado en una búsqueda de código que devolvió 2 ficheros, ambos del generator.
   No afirmo que la IA esté permitida en website.
4. **Afirmaciones sobre pagos a Panamá sin fuente** — **Encontrado y corregido.**
   §5. Eliminé la afirmación sobre PayPal en Panamá y marqué el país como NO
   VERIFICADO. El propio programa delega esa comprobación en el participante.
5. **Conclusiones que dependen de una suposición** — Revisado. El DROP se apoya en
   tres hechos verificados ([GITHUB] asignación de #5704 + [OFICIAL] exclusión mutua
   + [OFICIAL] inicio tras asignación), ninguno inferido. La única [INFERENCIA]
   marcada del documento es que declarar `Generated-by:` no puede perjudicarte, y va
   etiquetada como tal.

**Corrección adicional detectada en la autorrevisión:** mi informe anterior trataba
el *Bounty Program* y el *Microgrant Program* como el mismo programa. **[OFICIAL]**
son distintos y tienen proyectos separados en Open Collective
(`asyncapi-bounty-program` frente a `asyncapi-microgrant-program`). Las tarifas
$200/$400 que cité pertenecen al **Microgrant Program**, que es el vigente en 2026.
