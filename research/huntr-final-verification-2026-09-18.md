# Verificación final — huntr
**Fecha:** 18 sep 2026 · **Estado de la decisión: DROP**

> No busqué vulnerabilidades, no envié nada, no abrí cuentas, no contacté a nadie,
> no intenté explotar ningún objetivo, no programé.

---

## 0. Limitación de acceso, declarada antes que nada

Pediste priorizar **exclusivamente fuentes oficiales**. **No pude abrir ninguna.**

`huntr.com` está **completamente bloqueado** por el proxy de esta sesión, incluidas
`/guidelines`, `/terms`, `/policies` y `/new-huntr-faq`. También bloqueado
`www.stingrai.io`. Busqué un espejo de las reglas en el repositorio original
`418sec/huntr` mediante búsqueda de código: **cero resultados**.

Por tanto, **no pude verificar directamente** ni el modelo de recompensa, ni la política
de IA, ni la edad mínima, ni las condiciones de pago, ni la elegibilidad de Panamá.

Esto bastaría por sí solo para no pasar de aquí. Pero encontré algo que zanja la cuestión.

---

## 1. El hallazgo que cierra el caso

**[REPO]** [keras-team/keras#23055](https://github.com/keras-team/keras/issues/23055),
abierta el 8 jun 2026, citando la FAQ de transición de huntr:

> "Huntr has announced it is sunsetting its OSS vulnerability program on a hard timeline:
>
> - **July 31, 2026** — all OSS submissions are locked. Per Huntr's transition FAQ,
> reports not fully processed by this date will not be processed further, will be kept
> private, and **no further bounties will be issued**."

**Hoy es 18 de septiembre de 2026. Ese plazo venció hace siete semanas.**

El programa de bounties de open source de huntr —exactamente lo que te propuse
investigar— **dejó de aceptar envíos el 31 de julio**. No es que sea difícil entrar: es
que la puerta está cerrada.

### Corroboración y su límite

**[REPO]** El mismo día se abrió una consulta equivalente en
[nltk/nltk#3603](https://github.com/nltk/nltk/issues/3603). Una búsqueda en GitHub de
issues que mencionan huntr y sunset desde mayo de 2026 devuelve **3 resultados**.

**Honestidad sobre la fuerza de esta evidencia:** las dos issues relevantes las abrió
aparentemente **la misma persona el mismo día**. Es *un* informante citando la FAQ
oficial, no dos independientes. Yo **no he leído la FAQ de huntr** porque el dominio está
bloqueado.

Dicho eso: la cita es específica, fechada, con consecuencias concretas, y encaja con un
patrón verificado del sector — **[BUSCADOR]** Google cerró su OSS-Fuzz Reward Program el
1 de mayo de 2026, y un fragmento de búsqueda describe una página de huntr como
*"sunsetting soon"*.

**[INFERENCIA]** Es evidencia suficiente para no invertir tiempo, no para escribir un
certificado de defunción.

---

## 2. Modelo de pago — lo que pudo y no pudo verificarse

Todo **[BUSCADOR]**. Ninguna fuente oficial abierta.

| Pregunta tuya | Respuesta |
|---|---|
| ¿Cada vulnerabilidad válida recibe dinero? | Aparentemente sí: pago por hallazgo validado, sin ranking |
| Rango | Hasta $50.000 en críticas; multiplicador ×10 en lectura/escritura de modelos |
| **Recompensa mínima** | **NO VERIFICADO.** No encontré la tabla por severidad |
| **Recompensa típica** | **NO VERIFICADO.** Se afirma que *"most submissions earn at the medium-low end"*, sin cifras |
| ¿Quién decide la validez? | **El mantenedor del proyecto afectado** |
| Plazo de respuesta | 31 días citados en una fuente, 45 días en otra. **Contradictorio, NO VERIFICADO** |
| Si el mantenedor no responde | **NO VERIFICADO** |
| Si disputa el hallazgo | **NO VERIFICADO** |
| ¿Existe apelación? | **NO VERIFICADO** |
| ¿Depende de un merge? | **NO.** Depende de la *validación*, no del arreglo |
| ¿Depende de que lo arreglen? | Aparentemente no, aunque se menciona recompensa extra por ayudar a arreglar |
| Límite de submissions | **NO VERIFICADO** |
| Competencia por prioridad | **NO VERIFICADO**, pero el duplicado es riesgo estructural en todo bug bounty |

### Clasificación

**PAGO POR HALLAZGO VÁLIDO**, no premio competitivo. Esa parte del modelo era real y es
lo que me hizo proponerlo.

**Pero el detalle que yo mismo pasé por alto en el informe anterior:** quien valida es
**el mantenedor del proyecto**. Es decir, huntr no elimina la dependencia de un
mantenedor desconocido — sólo le pone un plazo. Cambiábamos «que acepte mi PR» por «que
valide mi informe». Sigue siendo la misma persona decidiendo, con los mismos incentivos
para no mirar. Las pruebas están a la vista: **[REPO]**
[psycopg2#1832](https://github.com/psycopg/psycopg2/issues/1832) es un investigador
pidiendo públicamente que alguien revise su informe pendiente.

Eso ya debilitaba la premisa antes de saber que el programa había cerrado.

---

## 3. Política de IA

> ## AI UNKNOWN

`huntr.com/policies` y `/guidelines` están bloqueados. **No leí su política.**

Lo único encontrado, **[BUSCADOR]**, es un censo de julio de 2026 sobre 53 programas de
divulgación: *"zero prohibit AI-assisted or AI-generated submissions outright"*, y de los
16 que mencionan IA, 13 la permiten con condiciones, casi siempre exigiendo un humano
responsable. **huntr no aparece nombrado.** Esa página también está bloqueada.

**[REPO]** Un indicio contextual, no una política: la propia Protect AI publica
`vulnhuntr`, descrito como *"Zero shot vulnerability discovery using LLMs"*. Que una
empresa desarrolle descubrimiento autónomo de vulnerabilidades con LLMs sugiere que no es
hostil a la IA. **Sugiere. No es su reglamento**, y no lo trato como tal.

**No interpreto el silencio como permiso.** UNKNOWN se queda en UNKNOWN.

---

## 4. Claude Code — dónde caería nuestro modelo

Análisis hipotético, ya que el programa está cerrado.

Lo que Claude podría hacer legítimamente: leer código fuente, analizar repositorios,
identificar patrones de riesgo (deserialización insegura, path traversal en cargadores de
modelos, uso de `pickle`), escribir scripts de análisis estático, ejecutar tests locales
en tu propia máquina, y redactar el informe.

Lo que **no** puede hacer: garantizar que exista un fallo que nadie haya visto.

**CLAUDE 60-80%.** No llega al 80% que fijaste, y la razón es conceptual: en este trabajo
el valor no está en producir el artefacto —el informe— sino en **encontrar algo que otros
no encontraron**. Claude acelera la búsqueda; no la asegura.

**Matiz que importa, aunque ya no aplique:** la mayoría de políticas de divulgación que sí
mencionan IA exigen **un humano responsable del hallazgo**. Nuestro modelo —Claude hace
≥80% y tú revisas— cae en esa categoría sólo si tú entiendes el hallazgo lo bastante
como para defenderlo. Enviar un informe de vulnerabilidad que no puedes explicar es,
además de incompatible con esas reglas, una forma rápida de quemar tu nombre en un campo
donde el nombre es el activo.

---

## 5. Panamá

# NO VERIFICADO

No pude abrir los términos de huntr. No sé si Panamá está excluida ni si no lo está.

Lo único con base **[BUSCADOR]**: los pagos se harían en **USD mediante Stripe Connect**,
mensualmente el día 25. **Stripe Connect existe en Panamá no es lo mismo que «un
investigador en Panamá puede completar el onboarding y cobrar»**, y esa segunda pregunta
queda sin responder. Comisiones, mínimo de retiro y requisitos fiscales: **NO VERIFICADO**.

---

## 6. Edad

# NO VERIFICADO

Los términos están bloqueados. No encontré la edad mínima de huntr.

**[INFERENCIA]** Stripe Connect exige verificación de identidad y normalmente 18+, pero
eso es un razonamiento mío sobre el proveedor de pago, no una regla leída de huntr.

**Necesito que aclares una contradicción antes de seguir con cualquier plataforma.** En
un mensaje anterior escribiste *"soy estudiante y menor de edad"*; después, a mitad de
turno, *"tengo los 18 años"*. En esta petición has vuelto a pedir que marque como
incompatible cualquier oportunidad que exija ser mayor de edad.

He asumido 18 desde entonces, y eso condiciona los informes anteriores. **Si no tienes
18 cumplidos, dímelo y lo reviso todo**: PayPal, Stripe, Kaggle y la mayoría de
plataformas fijan el umbral justo ahí. No voy a buscar formas de sortearlo, y tampoco
voy a seguir construyendo sobre un dato ambiguo.

---

## 7. Oportunidades reales en el programa

**[BUSCADOR]** Cuando estaba abierto: 240+ programas activos sobre librerías de IA/ML
(PyTorch, Hugging Face Transformers, LangChain) y formatos de modelo (GGUF, ONNX,
safetensors). Asignación de CVE y divulgación a 90 días automáticas.

Número de investigadores activos: **NO VERIFICADO** — no es público en lo que pude ver.

No busqué ni analicé ninguna vulnerabilidad concreta, como pediste.

---

## 8. Tiempo y expectativa real

- Trabajo para producir un informe válido: **NO VERIFICADO**, y estructuralmente
  impredecible. Podrían ser horas o podría no encontrarse nada nunca.
- **Tasa de rechazo: no existen datos fiables públicos.** No la invento.
- Validación: 31 o 45 días según la fuente. Contradictorio.
- Pago: mensual, día 25 **[BUSCADOR]**.
- Competencia por el mismo bug: sí, el duplicado es riesgo real en todo bug bounty.
- **¿Es realista buscar $25-200?** Probablemente no en el sentido que buscas. Las
  recompensas por severidad baja rondan cifras de dos o tres dígitos, pero **el coste de
  entrada es encontrar un fallo real**, no completar una tarea definida. Es un modelo de
  lotería con billetes caros, no de trabajo por unidad.

---

## 9. Decisión

# DROP

Tres motivos, en orden de contundencia:

1. **El programa OSS de huntr cerró envíos el 31 de julio de 2026**, hace siete semanas,
   y según la cita de su propia FAQ los informes no procesados no reciben bounty.
2. **No pude verificar una sola condición** en fuente oficial: IA, edad, Panamá, pago,
   mínimos. Todo el dominio está bloqueado. Aunque el programa siguiera abierto, esto
   sería WAIT, nunca GO.
3. **La premisa por la que lo propuse era parcialmente falsa.** Dije que huntr rompía la
   dependencia del mantenedor. No la rompe: la reetiqueta. Quien valida el hallazgo es el
   mantenedor del proyecto, con los mismos incentivos para ignorarte. Debí verlo antes de
   proponerlo, y no lo vi.

---

## 10. Conclusión honesta: dónde está el cuello de botella

No voy a traerte otro informe de veinte plataformas que termine en cero. Esto es lo que
seis informes permiten afirmar con datos.

### El patrón completo

| Categoría | Qué filtra el acceso al dinero |
|---|---|
| Bounties de GitHub | Un mantenedor decide mergear |
| Microgrants | Asignación previa según historial |
| Competiciones auto-evaluadas | Un ranking contra miles |
| Bug bounty | Encontrar algo que nadie encontró, y que un mantenedor valide |

Las cuatro tienen dinero real y verificado. **Ninguna paga por «trabajo correcto
entregado».**

### Por qué, económicamente

Dinero comprometido de antemano con un desconocido, sin relación previa, sin reputación
y sin competencia, **no puede existir de forma estable**: sería arbitrado de inmediato.
Y de hecho **lo está siendo** — es exactamente lo que vimos en `better-exceptions`, con
once PRs en cuatro meses sobre una bounty de $70, y en los repositorios granja del primer
informe.

Todo mercado que pre-compromete dinero necesita un mecanismo de escasez: un guardián, un
ranking, o un oráculo objetivo. Lo escaso que se compra **no es el código: es la
verificación de que el código merece el pago.** Y eso es precisamente lo que Claude Code
no puede producir por ti.

### El requisito que causa el cuello de botella

De tus doce requisitos, el que bloquea más categorías por sí solo es:

> **(11) No depender de semanas de reputación previa.**

Es el que cierra la única puerta que encontramos documentada y abierta: la categoría 2
del programa de AsyncAPI, que exige **3 PRs mergeados en la organización**. No son
semanas indefinidas: son **tres PRs concretos y contables**, en repositorios que ya
conocemos, con tareas que Claude puede hacer al 90%. Es el requisito más barato de
relajar y el que más abre.

El segundo cuello de botella no es tuyo, es del mercado, y va a peor: **la política de
IA**. En 2026 los mantenedores están cerrando esa puerta a medida que se inundan de PRs
automáticos. Esperar no mejora la situación.

### Lo que eso implica

Si relajas el requisito 11, la vía es concreta y ya está mapeada: tres PRs pequeños y
buenos —declarando el uso de IA— en repositorios activos con política de IA compatible,
y después entrar en la categoría 2 del microgrant. De los datos que tenemos,
`asyncapi/generator` es el candidato natural: **[OFICIAL]** tiene política de IA escrita
y permisiva, con divulgación mediante `Generated-by:`, y pertenece a una organización con
presupuesto anual aprobado de $21.400 y rondas mensuales.

Si no lo relajas, mi lectura honesta es que **no existe la categoría que buscas**, y
seguir buscándola tiene coste y rendimiento cero. Prefiero decírtelo ahora que en el
séptimo informe.

La decisión es tuya y no voy a tomarla por ti.

---

## Autorrevisión

Repasé el informe eliminando toda afirmación sin evidencia suficiente.

1. **«huntr paga por hallazgo válido, no por ranking»** — Sostenido, pero **corregido en
   su implicación**. Es cierto que no hay ranking; es **falso** que elimine la dependencia
   del mantenedor, que es como lo presenté en el informe anterior. §2 lo rectifica de
   forma explícita.
2. **El sunset** — Marcado **[REPO] citando una FAQ oficial que no pude leer**, con
   advertencia expresa de que las dos issues corroborantes son del mismo autor y el mismo
   día. No lo presento como hecho oficial verificado por mí.
3. **Política de IA** — **AI UNKNOWN**, sin excepción. El indicio de `vulnhuntr` se
   menciona señalando que es contextual y no reglamentario.
4. **Panamá** — NO VERIFICADO, con la distinción explícita entre «Stripe Connect opera en
   Panamá» y «un investigador en Panamá puede cobrar esto».
5. **Edad** — NO VERIFICADO, y planteada la contradicción pendiente en tus mensajes en
   lugar de asumir en silencio.
6. **Tasa de éxito y recompensa típica** — Declaradas inexistentes como dato fiable. No
   hay ninguna probabilidad inventada en este informe.
7. **Plazo de validación** — Mantengo la contradicción visible (31 frente a 45 días) en
   vez de elegir la cifra que más convenga.
8. **Autocrítica que corresponde:** propuse huntr como «la única que rompe el patrón» sin
   haber verificado quién valida los informes. La respuesta —el mantenedor del proyecto—
   estaba disponible en la misma búsqueda que ya había hecho. Fue un error de análisis
   mío, no una limitación del entorno.
