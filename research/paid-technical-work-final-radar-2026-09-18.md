# Radar final de trabajo técnico remunerado
**Fecha:** 18 sep 2026 · **Objetivo:** problema publicado + dinero asociado + Claude Code hace casi todo + sin conseguir cliente

> No se programó, no se clonó para modificar, no se abrieron PRs, no se reclamó nada,
> no se comentó, no se contactó a nadie, no se registró ninguna cuenta, no se gastó dinero.

**Resultado adelantado:** sección CANDIDATOS PARA EJECUTAR = **0**.
Pero encontré **un inventario financiado real** que no aparecía en informes previos, y
las dos condiciones que lo bloquean son verificables por ti en minutos. Detalle en §6.

---

## Clasificación de fuentes

**[OFICIAL]** documento normativo leído íntegro · **[REPO]** estado observado en GitHub ·
**[PLATAFORMA]** página oficial abierta · **[BUSCADOR]** fragmento de búsqueda ·
**[NO VERIFICADO]** no comprobable.

Bloqueados por el proxy: `opire.dev`, `api.opire.dev`, `app.opire.dev`, `issuehunt.io`,
`opencollective.com`, `devpost.com`, `www.paypal.com`, `www.asyncapi.com`.

---

## 1. PRIORIDAD 1 — Opire: veredicto **UNVERIFIED**

### La API no es accesible

Probé `opire.dev`, `api.opire.dev` y `app.opire.dev`. **Los tres bloqueados.** No pude
hacer ninguna consulta GET a su API pública. La búsqueda sistemática del inventario vía
API que pedías **no fue posible desde este entorno**.

### Vía alternativa: el rastro de Opire en GitHub

Opire funciona mediante un bot que comenta en issues, así que su inventario es rastreable
desde GitHub aunque su web no lo sea. **[REPO]**

- `"app.opire.dev" in:comments`, issues abiertas → **total_count = 12**
- `label:"💰 Reward"`, issues abiertas → **total_count = 9**

No ~$16.000 en bounties activas. Una docena de issues, con solapamiento entre ambas listas.

### El hallazgo que invalida la premisa

**[REPO]** Comentario del bot de Opire en
[FalkorDB#1279](https://github.com/FalkorDB/FalkorDB/issues/1279), citado literal:

> "Everyone can add rewards for this issue commenting `/reward 100` (replace `100` with
> the amount). If someone starts working on this issue to earn the rewards, they can
> comment `/try` to let everyone know! And when they open the PR, they can comment
> `/claim #1279`."

Eso **no es una recompensa financiada. Es una invitación a que alguien la financie.**

El bot comenta automáticamente en los repositorios que instalaron la app, exista o no
dinero. La etiqueta `💰 Reward` la aplica la instalación, no la financiación. Cualquier
recuento que sume estas issues como "bounties activas" está contando invitaciones vacías.

### Comprobación issue por issue de las candidatas plausibles

| Issue | Repo real | ¿Importe financiado? | Estado |
|---|---|---|---|
| [FalkorDB#1279](https://github.com/FalkorDB/FalkorDB/issues/1279) | Sí, empresa real | **No** — sólo invitación genérica | Sin asignar, sin PRs |
| [denoland/deno#18147](https://github.com/denoland/deno/issues/18147) | Sí, proyecto mayor | **No** — ningún comentario de bounty | Sin asignar |
| [secondlife/viewer#1149](https://github.com/secondlife/viewer/issues/1149) | Sí, Linden Lab | **No** — etiqueta sin importe | **Asignada a RyeMutt**, 3 PRs |
| [trovu#329](https://github.com/trovu/trovu/issues/329) | Sí | No visible | Ver abajo — **descartada** |
| jahmeergnlt/traefik#1 | **Fork personal** | `$100` en etiqueta | Descartado por fork |
| lb1192176991-lab/zeroeye#2 | Cuenta desechable | `$50` en título | Descartado |

### trovu#329 — la trampa mejor disfrazada

**[REPO]** Parecía la mejor candidata pequeña: proyecto real, activo, tarea acotada.
Al abrirla, el mantenedor escribe:

> "By now, I am receiving a new PR almost every day. All of them claim to solve the
> problem, yet when testing, _none of them have worked so far_."

Y ahora exige, para cualquier PR: un vídeo grabado en un dispositivo Android real
demostrando el comportamiento, **y una declaración confirmando autoría humana de los
comentarios**. Además admite que *"it might be technically impossible to solve this (at
the moment) due to how PWAs are handled"*.

Traducción: competencia diaria, requisito de hardware físico que Claude no puede aportar,
exigencia de autoría humana (**AI RESTRICTED**) y problema posiblemente irresoluble.
**Descartada por cuatro motivos independientes.**

### Ficha Opire

**IMPORTE: NO VERIFICADO** · **FUNDING: NO VERIFICADO** · **AI POLICY UNKNOWN** ·
**PANAMÁ: NO VERIFICADO** · **KYC/edad/comisiones: NO VERIFICADO** (web bloqueada).
Clasificación: **UNVERIFIED**. No hay una sola bounty de Opire ejecutable hoy.

---

## 2. PRIORIDAD 3 — IssueHunt: el único inventario **FUNDED** que encontré

Aquí sí hay algo. **[REPO]** IssueHunt marca las issues financiadas con una etiqueta
inequívoca: `:dollar: Funded on Issuehunt`.

> `is:issue is:open label:":dollar: Funded on Issuehunt"` → **total_count = 112**

A diferencia de Opire, **la etiqueta sólo se aplica cuando hay dinero depositado**, y el
importe aparece en el resumen de IssueHunt dentro de la propia issue.

### Importes verificados uno a uno **[REPO]**

| Issue | Repo | **Importe** | Asignada | PRs existentes | Creada |
|---|---|---|---|---|---|
| [better-exceptions#10](https://github.com/Qix-/better-exceptions/issues/10) | Qix-/better-exceptions | **$70,00** | No | Sí (#169) | 2017 |
| [macos-wallpaper#25](https://github.com/sindresorhus/macos-wallpaper/issues/25) | sindresorhus | **$60,00** | No | **Sí, 2 PRs** | 2019 |
| [awesome-lint#37](https://github.com/sindresorhus/awesome-lint/issues/37) | sindresorhus | **$60,00** | No | Sí (#225) | 2018 |
| [fkill#21](https://github.com/sindresorhus/fkill/issues/21) | sindresorhus | **$40,00** | No | Sí (1 PR) | 2017 |

Las cuatro están **sin asignar** y en repositorios de mantenedores activos. Las cuatro
tienen **al menos un PR previo intentándolo** — ese es su principal problema.

### El importe real no es el importe anunciado

**[BUSCADOR]** Términos de IssueHunt: *"10% of the amount paid by the funding user is
applied as the company's fee"*, y los fondos se reparten *"to owner and contributor in a
20%:80% split (which can be customized)"*.

Es decir: **una issue anunciada a $70 puede pagarte ~$56**, no $70, porque el 20% va al
mantenedor del proyecto. Es un dato que ningún listado de bounties menciona y que cambia
el cálculo en el rango de $25–$250. **[NO VERIFICADO]** en fuente oficial — `issuehunt.io`
está bloqueado.

### Antigüedad: el dato que hay que mirar con frialdad

Las 112 issues se crearon entre **2015 y 2021**. Todas muestran `updated_at` agrupado en
los primeros días de septiembre de 2026, lo que es coherente con un paso automático del
bot, no con actividad humana real. Dinero depositado hace años sobre problemas que quizá
ya no le importen a nadie.

### Ficha IssueHunt

- **Clasificación: FUNDED** — es la única de todo el informe que se lo gana.
- **Estado plataforma:** *"Live"* **[BUSCADOR]** únicamente.
- **Comisiones:** 10% al financiador + reparto 20/80 **[BUSCADOR]**.
- **Método de pago, países, edad, KYC, plazo de payout: NO VERIFICADO** — web bloqueada.
- **PANAMÁ: NO VERIFICADO.**
- **AI POLICY UNKNOWN** — ver §3.

---

## 3. Filtro de IA aplicado a los repositorios concretos

Esto es lo que descalifica a las cuatro candidatas de §2.

**[REPO]** Busqué políticas de IA en los repos donde habría que trabajar:

- `sindresorhus/.github/contributing.md` — guía central que cubre sus repositorios:
  **ninguna mención a IA, LLM, código generado, Copilot o ChatGPT**.
- `Qix-/better-exceptions` — sin política de IA localizada.

→ `macos-wallpaper`, `awesome-lint`, `fkill`, `better-exceptions`: **AI POLICY UNKNOWN**.

Tu propia regla es clara: *"Si es UNKNOWN, no la presentes como compatible."* La aplico.

### Un dato que merece guardarse

**[REPO]** `sindresorhus/type-fest/.github/contributing.md` dice literalmente:

> "**Use AI (like ChatGPT) to catch type bugs, improve docs, spot typos, validate
> examples, and suggest more tests.**"

Eso es **AI ALLOWED** explícito, del mismo mantenedor que los repos financiados. Sugiere
que no hay hostilidad de fondo hacia la IA en su ecosistema — pero `type-fest` **no tiene
issues financiadas en IssueHunt**, así que hoy no es una oportunidad. Es una pista sobre
dónde preguntar, no una conclusión sobre los otros repos.

---

## 4. Resto de plataformas revisadas

| Plataforma | Clasificación | Motivo |
|---|---|---|
| **Algora** | UNVERIFIED | Inventario nuevo ≈ 0, ya verificado en informes previos |
| **BountyHub** | UNVERIFIED | Web bloqueada; sin inventario rastreable en GitHub |
| **Open Collective** | FUNDED pero inaccesible | Dominio bloqueado; OBS tiene bounties de 2021 sin importe visible y exigen propuesta aprobada |
| **Topcoder** | PRIZE | Premio a los primeros puestos. Pagos por Trolley, 210+ países **[PLATAFORMA]** |
| **Devpost / hackathones** | PRIZE | Dominio bloqueado; premios competitivos |
| **Gitcoin** | Descartada | Pago en cripto |
| **Code4rena, Sherlock, Immunefi** | PRIZE + descartadas | Auditoría competitiva de smart contracts; pago en cripto; requiere especialización profunda en seguridad. **Claude <60%** |
| **HackerOne, Bugcrowd** | FUNDED pero no encaja | Programas autorizados y legítimos. Pero hallar una vulnerabilidad pagable es de probabilidad baja e impredecible en plazo. **Claude <60%** para descubrimiento original |
| **ProjectDiscovery OSS Bounty** | Cerrada | Programa discontinuado **[BUSCADOR]** |
| **tscircuit** | Canal muerto | 10 de sus 16 bounties abiertas están en `docs-old`, deprecado |
| **AsyncAPI** | Cerrada por ahora | Las tres candidaturas de 2026-10 asignadas. No se reinvestiga por indicación tuya |

Sobre seguridad: no propongo ninguna actividad fuera de un programa que la autorice
explícitamente. Los cuatro programas de seguridad listados son legítimos y autorizados;
quedan fuera por encaje con tu objetivo, no por legalidad.

---

## 5. Tabla de oportunidades supervivientes

| Issue | Plataforma | Pago | Funded | Claude | Tiempo | Competencia | IA | Panamá | Riesgo |
|---|---|---|---|---|---|---|---|---|---|
| [better-exceptions#10](https://github.com/Qix-/better-exceptions/issues/10) | IssueHunt | $70 (~$56 neto) | **FUNDED** | 80-90% | 3-8 h | 1 PR previo, 24 coment. | **UNKNOWN** | **NO VERIF.** | Medio-alto |
| [awesome-lint#37](https://github.com/sindresorhus/awesome-lint/issues/37) | IssueHunt | $60 (~$48 neto) | **FUNDED** | **90-100%** | 1-3 h | 1 PR previo, 14 coment. | **UNKNOWN** | **NO VERIF.** | Medio |
| [macos-wallpaper#25](https://github.com/sindresorhus/macos-wallpaper/issues/25) | IssueHunt | $60 (~$48 neto) | **FUNDED** | 60-80% | 3-8 h | **2 PRs previos** | **UNKNOWN** | **NO VERIF.** | Alto |
| [fkill#21](https://github.com/sindresorhus/fkill/issues/21) | IssueHunt | $40 (~$32 neto) | **FUNDED** | 80-90% | 3-8 h | 1 PR previo | **UNKNOWN** | **NO VERIF.** | Medio-alto |

`macos-wallpaper#25` es Swift/macOS y requiere un Mac con varias pantallas para
reproducir el bug: por eso baja a 60-80% Claude y sube a riesgo alto.

`awesome-lint#37` es la técnicamente más limpia: una regla nueva de linting en JavaScript,
con criterio objetivo (imagen de cabecera SVG o HiDPI) y suite de tests existente.

---

## 6. CANDIDATOS PARA EJECUTAR

# 0

Ninguna oportunidad cumple las once condiciones que fijaste. Las cuatro de §5 pasan siete
de ellas — abiertas, sin asignar, dinero real depositado, rango $25–$250, Claude ≥80% en
tres de los cuatro casos, trabajo ≤3 días, sin cliente, sin llamadas, sin reputación
obligatoria — y **fallan exactamente en dos**:

1. **IA permitida** → UNKNOWN en los cuatro repositorios.
2. **Pago compatible con Panamá** → NO VERIFICADO, porque `issuehunt.io` está bloqueado
   para mí.

No las incluyo como candidatas porque tu regla lo prohíbe, y hacerlo sería justo el tipo
de relleno dudoso que me pediste evitar.

### Lo que separa estas cuatro de todo lo anterior

En cuatro informes, esta es la **primera vez que encuentro dinero verificablemente
depositado sobre issues abiertas, sin asignar, de tamaño adecuado y en repositorios de un
mantenedor activo**. AsyncAPI tenía dinero pero todo asignado. Opire no tiene dinero. Las
granjas no tienen nada. Esto es distinto.

Los dos bloqueos son **fallos de mi entorno de red, no defectos de la oportunidad**, y
ambos se resuelven desde tu navegador:

1. Abrir `issuehunt.io` → método de pago, países admitidos, edad mínima, KYC, plazo de
   payout y confirmación del reparto 20/80.
2. La política de IA no está escrita en esos repos. Preguntarlo **antes** de trabajar es
   la única forma limpia de resolverlo.

Si ambas salen favorables, `awesome-lint#37` pasa a cumplir las once condiciones.

### Advertencia que no debe perderse

Las cuatro issues tienen **al menos un PR previo sin mergear**. Eso significa una de dos
cosas, y conviene saber cuál antes de trabajar: o el problema es más difícil de lo que
parece, o el mantenedor no está revisando. Ninguna de las dos se arregla escribiendo
código más rápido. Es lo primero que yo miraría de cada issue candidata.

---

## Autorrevisión

1. **Bounties no financiadas presentadas como financiadas** — **Encontrado, y es el
   hallazgo central de §1.** El comentario del bot de Opire es una invitación genérica a
   financiar (`/reward 100`), no una recompensa. Reclasifiqué todo Opire a UNVERIFIED en
   lugar de sumarlo como inventario.
2. **Importes incorrectos** — **Corregido.** Los importes de IssueHunt se muestran con su
   valor bruto **y** con el neto estimado tras el reparto 20/80, marcado como
   **[BUSCADOR]**. No presento $70 como lo que cobrarías.
3. **Issues asignadas** — Comprobado una a una. `secondlife/viewer#1149` está asignada a
   RyeMutt con 3 PRs: descartada. Las cuatro de §5 están sin asignar.
4. **PRs existentes** — Comprobado. **Las cuatro tienen PR previo** y así consta en la
   tabla y en la advertencia final. No lo omito por conveniencia.
5. **Plataformas confundidas** — Revisado. Opire (bot en GitHub, web bloqueada) e
   IssueHunt (etiqueta de financiación, comisión 10% + reparto 20/80) se tratan por
   separado y no comparten mecánica.
6. **Concursos presentados como bounties** — Revisado. Code4rena, Sherlock, Immunefi,
   Topcoder y los hackathones van a §4 marcados **PRIZE**, no a la tabla de §5.
7. **Políticas de IA de otro repositorio** — **Riesgo evitado.** La política permisiva que
   encontré es de `type-fest`. **No la extiendo** a `macos-wallpaper`, `fkill` ni
   `awesome-lint` pese a compartir mantenedor. Los cuatro repos quedan AI POLICY UNKNOWN.
8. **Métodos de pago no verificados** — Revisado. El único dato de pago con fuente
   **[PLATAFORMA]** es Trolley en Topcoder. Todo lo de IssueHunt va como NO VERIFICADO.
9. **Afirmaciones sobre Panamá sin evidencia** — Revisado. No se afirma en ningún punto
   que se pueda cobrar desde Panamá.
10. **Reputación previa / aprobación previa** — Revisado. Descarté OBS por exigir
    propuesta aprobada y AsyncAPI por asignación previa. IssueHunt, según su flujo
    descrito, no exige ninguna de las dos: se abre PR y se reclama.
11. **Repos abandonados y forks personales** — **Encontrado y descartado.**
    `jahmeergnlt/traefik#1` es un fork personal; `lb1192176991-lab/zeroeye#2` es una
    cuenta desechable; `tscircuit/docs-old` está deprecado. Ninguno entra en §5.
12. **Tareas demasiado grandes para el pago** — Revisado. `macos-wallpaper#25` se mantiene
    en la tabla pero marcada 60-80% Claude y riesgo alto por requerir hardware físico.
    OBS queda fuera: features de C++ de escritorio con importe desconocido.

**Corrección adicional detectada en la autorrevisión:** en un borrador contabilicé las 12
issues con rastro de Opire como "bounties activas de Opire". Al leer el texto del bot
resultó que ninguna acredita financiación. Presentarlas como inventario habría repetido
exactamente el error que este informe documenta en §1.
