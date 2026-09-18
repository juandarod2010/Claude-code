# Análisis final — Qix-/better-exceptions#10
**Fecha:** 18 sep 2026 · **Estado de la decisión: DROP**

> No se programó. No se abrió PR. No se reclamó la bounty. No se comentó. No se contactó
> a nadie. El repositorio se clonó **en modo lectura** a un directorio temporal, sólo para
> comprobar el historial de commits y la ausencia de política de IA.

---

## Resumen ejecutivo

Esta vez el bloqueo no es la política de IA. Es aritmética.

**[REPO]** Once pull requests han atacado esta única issue entre mayo y septiembre de
2026. **Nueve siguen abiertos.** El más reciente se creó el **9 de septiembre, hace nueve
días**. El mantenedor **no ha respondido a ninguno** — ni una revisión, ni un comentario,
ni una asignación.

Su último commit propio es de **octubre de 2025**, hace once meses.

Abrir un duodécimo PR para competir por $70 contra nueve pendientes, ante un mantenedor
que lleva cuatro meses sin mirar ninguno, no es una oportunidad de trabajo. Es hacer cola
en una ventanilla cerrada.

---

## 1. Estado de la issue #10

**[REPO]** https://github.com/Qix-/better-exceptions/issues/10

| Comprobación | Resultado |
|---|---|
| Estado | **Abierta** |
| Etiquetas | `💵 Funded on IssueHunt`, `enhancement`, `help wanted` |
| Asignada | **No** |
| Financiación | **$70,00**, backer único: `issuehunt` |
| Creada | 22 mar 2017 por `kootenpv` — hace **nueve años** |
| Comentarios | 24 (no pude leerlos: la página devolvió error de carga y la API dio 403 por límite de tasa) |
| Repositorio | 4.700 estrellas, 229 forks |

**Cuerpo íntegro de la issue**, citado literal:

> "Does not appear to work in ipython (at least in emacs)"

Eso es todo. Una línea, de 2017.

**Requisitos de aceptación: no existen.** Ni criterios, ni alcance, ni definición de qué
cuenta como "funcionar en IPython". Nueve años después, sigue sin especificarse. Once
personas han tenido que adivinar qué se esperaba — y ninguna ha acertado de forma
verificable, porque nadie ha recibido respuesta.

**Ficheros afectados y tests:** no los detallo, por el motivo explicado en §5.

---

## 2. Todos los PRs previos

**[REPO]** Búsqueda de PRs que mencionan ipython en el repositorio. **Once resultados.**

| PR | Autor | Fecha | Estado |
|---|---|---|---|
| [#169](https://github.com/Qix-/better-exceptions/pull/169) | Kr4z31n | **9 sep 2026** | **Abierto** |
| [#168](https://github.com/Qix-/better-exceptions/pull/168) | NasirBaqi | 8 sep 2026 | **Abierto** |
| [#165](https://github.com/Qix-/better-exceptions/pull/165) | 18680368135 | 29 jul 2026 | **Abierto** |
| [#162](https://github.com/Qix-/better-exceptions/pull/162) | Ghostofcaldera | 13 jun 2026 | **Abierto** |
| [#161](https://github.com/Qix-/better-exceptions/pull/161) | theDevCx | 13 jun 2026 | Cerrado por su propio autor al día siguiente |
| [#160](https://github.com/Qix-/better-exceptions/pull/160) | landeqiming666 | 9 jun 2026 | **Abierto** |
| [#159](https://github.com/Qix-/better-exceptions/pull/159) | Bharath200359 | 9 jun 2026 | **Abierto** |
| [#157](https://github.com/Qix-/better-exceptions/pull/157) | Question86 | 20 may 2026 | Cerrado |
| [#152](https://github.com/Qix-/better-exceptions/pull/152) | darshan-Jahagirdar | 12 may 2026 | **Abierto** |
| [#150](https://github.com/Qix-/better-exceptions/pull/150) | apples-kksk | 9 may 2026 | **Abierto** |
| [#32](https://github.com/Qix-/better-exceptions/pull/32) | blag | 15 abr 2017 | **Abierto desde hace 9 años** |

### Lo que NO encontré, y es lo importante

Revisé #157, #161 y #169 en detalle. **En ninguno hay un solo comentario del mantenedor.**
Ni revisión, ni crítica técnica, ni petición de cambios, ni explicación de cierre.

- **#161** lo cerró **su propio autor** al día siguiente, sin haber recibido respuesta.
- **#157** figura como cerrado sin razón registrada ni intervención visible del mantenedor.
- **#169**, el más reciente, llega con validación contra IPython 7, 8 y 9 sobre Python 3.10
  y 3.12 (14 tests pasando en una combinación, 13 más 1 omitido en otra). Es un trabajo
  aparentemente serio. **Respuesta del mantenedor: ninguna.**

**El mantenedor nunca indicó qué esperaba exactamente.** En nueve años y once intentos, no
hay una sola declaración suya sobre el diseño correcto.

Contraste con el caso anterior: en `awesome-lint`, sindresorhus revisó, criticó con detalle
técnico y cerró. Era exigente, pero estaba presente. Aquí no hay nadie al otro lado.

### El patrón de fondo

**[REPO]** De los 21 PRs abiertos del repositorio, **nueve son de esta issue** y otros
**seis** (#167, #166, #158, #155, #151, #149) atacan un mismo problema distinto — no
colorear excepciones en streams que no son TTY —, todos también entre mayo y septiembre
de 2026.

**[INFERENCIA]** Quince PRs concentrados en dos issues, en cuatro meses, tras años de
calma, con títulos casi idénticos y desde cuentas de aspecto desechable, encaja con
recolección automatizada de bounties. No puedo demostrarlo y no lo presento como hecho.
Lo que sí es hecho verificado es el recuento y la ausencia total de respuesta.

---

## 3. Postura sobre IA

### Búsqueda realizada

**[REPO]** `grep -rin "ai-generated|ai generated|llm|chatgpt|copilot|claude|artificial
intelligence"` sobre todo el repositorio clonado (md, py, cfg, txt): **cero coincidencias**.

**[REPO]** El directorio `.github/` contiene únicamente `FUNDING.yml` y `workflows/`.
**No hay CONTRIBUTING, ni CODE_OF_CONDUCT, ni plantilla de PR, ni política de IA.**

**[REPO]** Revisé #157, #161 y #169: **ninguna declaración del mantenedor sobre IA**.

**[BUSCADOR]** No encontré ninguna declaración pública de Qix- (Josh Junon) sobre PRs
generados con IA.

### Clasificación

> ## AI UNKNOWN

Y lo dejo ahí deliberadamente. **No existe prohibición escrita, y eso no es permiso.** En
`awesome-lint` tampoco había regla escrita y resultó haber un rechazo explícito registrado
en los PRs; aquí no hay ni regla ni rechazo, pero tampoco autorización. Tu criterio es
claro: UNKNOWN no se presenta como compatible.

Que conste con precisión: **UNKNOWN aquí significa silencio absoluto**, no una señal
favorable. El mantenedor no se ha pronunciado sobre nada en cuatro meses, incluida esta
cuestión.

---

## 4. Competencia actual

Esto es lo que invalida la oportunidad.

| Métrica | Valor verificado **[REPO]** |
|---|---|
| PRs abiertos sobre esta issue | **9** |
| PRs cerrados sobre esta issue | 2 |
| Intentos totales | **11** |
| Creado hace menos de 15 días | 2 (#169 el 9 sep, #168 el 8 sep) |
| PRs mergeados sobre esta issue | **0** |
| Revisiones del mantenedor | **0** |
| ¿Alguien cerca de completarlo? | **Sí, varios.** #169 llega con matriz de tests sobre IPython 7/8/9 y Python 3.10/3.12 |

Pediste explícitamente evitar «trabajar durante horas para descubrir que alguien ya está
prácticamente terminado». Aquí no hay uno: **hay nueve**, y al menos uno con validación
más completa de la que probablemente produciríamos en un primer intento.

### Actividad del mantenedor **[REPO]**

Historial real de commits:

```
2026-07-10  Hasanhasan323   add sed pattern for truncated module paths (#163)
2025-10-22  Josh Junon      0.4.0
2025-10-22  Josh Junon      (ráfaga de ~7 commits: CI, Python 2 drop, etc.)
2023-01-05  Delgan          Use stream encoding instead of locale preferred encoding
2022-12-02  Newman          set license in setup.py
```

El mantenedor trabaja **a ráfagas separadas por años**: nada entre enero de 2023 y octubre
de 2025, y desde entonces sólo un merge ajeno en julio de 2026.

Esto no es un repositorio abandonado — se mergeó algo hace dos meses, y por eso no lo
clasifico como muerto. Pero el ciclo de revisión no se mide en días ni en semanas.
**Lo que se cobra no es escribir el PR: es el merge.**

---

## 5. Dificultad real

**No la analizo.** El protocolo que fijaste dice: *"Sólo si la oportunidad sigue siendo
viable después de los pasos anteriores."* No lo es, y el análisis técnico no cambiaría la
decisión.

Lo único que apunto, por ser relevante: `better_exceptions` engancha `sys.excepthook`,
mientras que IPython gestiona las excepciones por su cuenta. Los distintos PRs convergen
en la misma solución — una extensión cargable con `%load_ext better_exceptions` que
registra un hook propio y delega en IPython los casos especiales. Que once intentos
converjan en el mismo diseño indica que el problema **es** resoluble. No es la dificultad
técnica lo que lo bloquea.

---

## 6. IssueHunt

# NO VERIFICADO

`issuehunt.io` sigue bloqueado por el proxy de esta sesión. **No verifiqué**: condiciones
de pago, comisión exacta, método de pago, disponibilidad para Panamá, edad mínima, KYC, ni
cuándo se libera el dinero.

Lo único verificado **[REPO]** es que el bloque de IssueHunt dentro de la issue muestra
**$70,00** con backer `issuehunt`, y que la etiqueta `💵 Funded on IssueHunt` sigue puesta.

**Bruto frente a neto:** por **[BUSCADOR]**, IssueHunt reparte 20% mantenedor / 80%
contribuidor. Si es correcto, **$70 anunciados ≈ $56 para ti**. No confirmado.

No te pido verificar nada: el DROP no depende de estos datos.

---

## 7. Decisión

# DROP

Tres motivos, y el primero basta:

1. **Nueve PRs abiertos compitiendo por la misma bounty**, dos de ellos de hace menos de
   dos semanas, con al menos uno técnicamente sólido. Añadir un décimo no es competir:
   es sumarse a un atasco.
2. **El mantenedor no ha revisado ninguno en cuatro meses**, ni ha dicho nunca qué espera.
   Su ritmo histórico es de ráfagas separadas por años. El pago depende del merge, y el
   merge depende de una persona que no está mirando.
3. **AI UNKNOWN**, sin autorización ni prohibición. Por tu criterio, no se presenta como
   compatible.

No hay aquí una restricción contra la IA como en `awesome-lint`. Hay algo que en la
práctica sale igual de caro: **una cola de nueve personas delante y nadie atendiendo**.

### Lo que este segundo caso añade al primero

Ahora tenemos dos fracasos con causas opuestas, y juntos dibujan el patrón real:

- **`awesome-lint#37`** — mantenedor **presente y exigente**. Revisa, critica, cierra. Y
  rechaza explícitamente los PRs generados con IA.
- **`better-exceptions#10`** — mantenedor **ausente**. Nadie rechaza nada, pero tampoco
  nadie mergea. Once intentos, cero respuestas.

Una bounty pequeña y pública sobre una issue vieja atrae una avalancha de intentos. Si el
mantenedor está presente, sube el listón hasta donde la IA sola no llega. Si está ausente,
el listón no existe pero tampoco existe la puerta. **El dinero sigue ahí en ambos casos, y
en ambos es inalcanzable — por razones contrarias.**

De las cuatro candidatas de IssueHunt, ya hemos descartado dos por inspección directa. Las
dos restantes (`macos-wallpaper#25`, `fkill#21`) son de sindresorhus, cuyo rechazo a los
PRs plenamente generados con IA ya está documentado. **Es razonable considerar agotada la
vía IssueHunt** sin gastar dos análisis más en confirmarlo.

---

## Autorrevisión

Revisé el informe contra las cinco confusiones que pediste vigilar.

1. **Bounty financiada con bounty cobrable** — **Distinción central de este informe.** §1
   confirma **[REPO]** que los $70 están depositados. §7 explica por qué eso no los hace
   cobrables: sin merge no hay pago, y no hay quien mergee. Es exactamente el error que
   cometí al recomendar `awesome-lint#37`, y aquí lo aplico desde el principio.
2. **Ausencia de política de IA con permiso para usar IA** — §3 clasifica **AI UNKNOWN**
   y dice literalmente que la ausencia de prohibición no es permiso. No extiendo aquí la
   postura de sindresorhus: Qix- es otro mantenedor y su silencio es sólo silencio.
3. **PR abierto con competencia irrelevante** — §4 no cuenta un PR abierto: cuenta **nueve
   abiertos y once intentos**, con fechas, y señala que #169 trae matriz de tests. No
   minimizo la competencia describiéndola como "un PR previo", que es como la describí de
   más en el informe anterior.
4. **Código aparentemente sencillo con issue realmente difícil** — §5 señala que once
   intentos convergen en el mismo diseño, luego el problema es resoluble. **La dificultad
   no es el bloqueo, y no lo presento como si lo fuera.** El bloqueo es el proceso.
5. **Cantidad anunciada con cantidad realmente recibida** — §6 da $70 bruto y ~$56 neto
   estimado, marcado **[BUSCADOR]** y no confirmado.

**Limitación que debo declarar:** no pude leer los 24 comentarios de la issue #10. La
página devolvió error de carga y la API de GitHub respondió 403 por límite de tasa. Si
alguno contuviera una declaración del mantenedor sobre IA o sobre lo que espera, **no la
he visto**. No afecta al DROP, que se sostiene sobre §4, pero la clasificación AI UNKNOWN
de §3 podría revisarse si esos comentarios dijeran algo.
