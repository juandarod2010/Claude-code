# Trabajo técnico remunerado sin depender de un merge
**Fecha:** 18 sep 2026 · **Criterio:** que el pago no dependa de que un mantenedor desconocido decida aceptar nuestro PR

> No participé, no envié submissions, no abrí cuentas, no contacté a nadie, no programé,
> no gasté dinero. Sólo investigación.

---

## Conclusión adelantada

Cambiar de categoría resuelve el problema del merge, pero destapa otro que estaba oculto:
**casi todo lo que tiene evaluación automática es un premio competitivo, no un pago por
tarea.** Cambiamos «que alguien apruebe mi trabajo» por «quedar por delante de miles».

De doce candidatas investigadas: **VIABLE = 0**, **PENDIENTE DE VERIFICACIÓN = 3**,
**DESCARTADA = 9**.

Hay una excepción estructural que merece atención — `huntr` — porque es la única donde
**cada hallazgo válido cobra**, sin ranking. Detalle en §1.

---

## Clasificación de fuentes

**[OFICIAL]** página normativa de la plataforma leída · **[REPO]** GitHub ·
**[BUSCADOR]** fragmento de búsqueda sin abrir la fuente · **[NO VERIFICADO]** ·
**[INFERENCIA]** razonamiento mío.

**Advertencia de alcance:** el proxy de esta sesión bloquea la mayoría de dominios de
plataformas. **Casi todo lo que sigue es [BUSCADOR]**, no fuente oficial abierta por mí.
Esto es una criba para decidir dónde mirar, no una verificación final.

---

## 1. `huntr` — la única con dinero por unidad de trabajo

**Nombre:** huntr (Protect AI) · **Tipo:** bug bounty autorizado para OSS de IA/ML
**URL:** https://huntr.com · Guías: https://huntr.com/guidelines

| Campo | Dato |
|---|---|
| Dinero | Por vulnerabilidad validada, hasta $50.000 en críticas; multiplicador ×10 en lectura/escritura de modelos **[BUSCADOR]** |
| ¿Garantizado o competitivo? | **Por unidad, no competitivo.** No hay leaderboard: cada hallazgo válido se paga |
| Método de pago | USD vía **Stripe Connect**, mensual, día 25 **[BUSCADOR]** |
| Validación | El mantenedor dispone de 31 días para validar **[BUSCADOR]** |
| Alcance | 240+ programas: PyTorch, Hugging Face Transformers, LangChain, formatos GGUF/ONNX/safetensors **[BUSCADOR]** |
| ¿IA permitida? | **AI UNKNOWN** — no localicé política |
| ¿Panamá? | **NO VERIFICADO** |
| ¿Edad/KYC? | **NO VERIFICADO**. Stripe Connect implica KYC e implica 18+ **[INFERENCIA]** |
| Competencia | **NO VERIFICABLE** sin acceso a la plataforma |
| Tiempo | Impredecible: de horas a nunca. Encontrar la vulnerabilidad es el trabajo |
| Claude | **60-80%** en clases concretas (deserialización insegura, path traversal en cargadores de modelos). Claude no garantiza *encontrar* nada |
| Tú tendrías que | Crear cuenta, verificar Stripe, redactar el informe, responder a la validación |
| Riesgos | Que no encuentres nada es el desenlace más probable. Y sigue habiendo un humano validando, sólo que con plazo reglado |
| **Estado** | **PENDIENTE DE VERIFICACIÓN** |

**Por qué es estructuralmente distinta:** rompe el patrón que nos ha bloqueado dos veces.
No compites contra 3.000 equipos ni esperas el capricho de un mantenedor: si el hallazgo
es válido, se paga, y el plazo de validación está reglado. **Lo que no rompe** es la
incertidumbre de entrada: nadie te garantiza que exista un bug que puedas encontrar.

---

## 2. CTFs con premio en metálico

**Tipo:** competición de seguridad · **Evaluación:** **automática por envío de flag** —
la más objetiva que existe.

| Evento | Premio | Fuente |
|---|---|---|
| BSides San Francisco CTF | $1.500 al primer puesto | **[BUSCADOR]** |
| IEEE CARS 2026 CTF | hasta $10.000 | **[BUSCADOR]** |
| CSAW (NYU) | >$1M en becas y premios, ene–abr | **[BUSCADOR]** |
| H7CTF 2026 | 36 h, abierto a cualquier equipo | **[BUSCADOR]** |

**El dato relevante sobre IA [BUSCADOR]:** de H7CTF 2026 se dice que *"doesn't ban AI;
instead the quals run on a scoring economy where judgment beats throughput, so no stack
of agents can buy the top of the board"*. Es la única competición del informe con
tolerancia explícita a la IA.

- **¿Garantizado?** No. **PREMIO COMPETITIVO**, a los primeros puestos.
- **¿Panamá?** **NO VERIFICADO** por evento.
- **¿Edad/KYC?** **NO VERIFICADO**. Varios son estudiantiles con restricciones.
- **Competencia:** **ALTA** — los CTFs con premio atraen equipos profesionales.
- **Claude:** **60-80%** en retos de criptografía, web y reversing sencillo; menos en
  pwn o forense avanzada.
- **Riesgos:** ventana temporal fija, equipos veteranos, y ganar algo exige top-3.
- **Estado:** **PENDIENTE DE VERIFICACIÓN** (sólo H7CTF, por su postura sobre IA).

---

## 3. Topcoder Marathon Matches

**Tipo:** concurso algorítmico con puntuación automática.

- **Dinero:** premios por competición, variables. **PREMIO COMPETITIVO.**
- **Pago:** **Trolley**, 210+ países y territorios **[BUSCADOR]** — desde 2025 ya no usan
  PayPal ni Payoneer. Es el dato de cobertura geográfica más sólido del informe.
- **¿Panamá?** **NO VERIFICADO** en la lista concreta, pero plausible con 210+ países.
- **¿IA permitida?** **AI UNKNOWN** por competición.
- **Competencia:** **ALTA**, con competidores veteranos y rating.
- **Claude:** 60-80%. Las marathon matches premian optimización afinada, no soluciones
  correctas sin más.
- **Estado:** **PENDIENTE DE VERIFICACIÓN**.

---

## 4-12. Descartadas, con el motivo exacto

### 4. Gray Swan Arena — **DESCARTADA por reglas de IA**

Parecía ideal: $40.000–$300.000 por reto, $500 para cada uno de los 20 mejores,
verificación automática de jailbreaks. Pero **[BUSCADOR]** sus reglas dicen que los
participantes *"are prohibited from using automated tools, scripts, or bots; all
submissions must be crafted manually by the participant"*.

**AI RESTRICTED.** Nuestro modelo es que Claude haga ≥80%. Es incompatible por diseño, y
buscarle la vuelta sería justo lo que descartas. Dato adicional: sólo se abonan premios
superiores a $100; por debajo se acumulan para futuras competiciones.

### 5. ARC Prize 2026 (ARC-AGI-2 y ARC-AGI-3) — **DESCARTADA**

Kaggle, puntuación automática, dinero real: milestones de $25K / $10K / $2.5K. Pero
**[BUSCADOR]** ARC-AGI-3 tiene **3.127 equipos** y ARC-AGI-2 **2.071**. Competencia
**ALTA** verificada con cifras. Además el premio mayor exige que un agente puntúe 100%
en la evaluación — un problema de investigación abierta, no una tarea de días.

Fuera de rango en dinero ($25-200), en tiempo y en probabilidad.

### 6. Zindi — **DESCARTADA por reglas de IA**

Tenía el mejor encaje de cobro del informe: **[BUSCADOR]** paga por **PayPal cuando el
premio es ≤$100**, y cubre las comisiones internacionales por debajo de $500. Sólo
excluye pagos a Rusia, así que Panamá no está vetada.

Pero **[BUSCADOR]**: *"Automated machine learning tools such as AutoML are not permitted
in Zindi competitions"*, permitiendo sólo modelos preentrenados de acceso público.
**AI RESTRICTED** frente a nuestro modelo de trabajo. Y es **PREMIO COMPETITIVO**.

### 7. DrivenData — **DESCARTADA**

**PREMIO COMPETITIVO.** Pago por cheque o transferencia electrónica. Territorio elegible
definido por exclusión de jurisdicciones OFAC, por lo que **Panamá no está excluida**
**[BUSCADOR]**. Pero exige publicar la solución ganadora bajo licencia MIT con
documentación formal, son competiciones de semanas y sólo cobran los primeros puestos.

### 8. Google OSS-Fuzz Reward Program — **DESCARTADA: programa cerrado**

**[BUSCADOR]** Google está retirando el programa: **no acepta envíos después del 1 de
mayo de 2026**. Muerto.

### 9. Google Patch Rewards / OSS VRP — **DESCARTADA por tamaño y perfil**

Vivos y legítimos, hasta $20.000. Pero son recompensas discrecionales por trabajo de
seguridad profundo, no tareas de horas, y quedan muy fuera de la franja $25-200.

### 10. Numerai — **DESCARTADA por método de pago**

Evaluación automática semanal y pago por rendimiento del modelo — encaje conceptual
excelente. Paga en **NMR**, su propio token. Tu filtro excluye tokens como forma
principal de pago.

### 11. Kaggle (resto de competiciones) — **DESCARTADA**

**PREMIO COMPETITIVO** a los primeros puestos, competiciones de semanas, entrega por
cheque o transferencia a 30 días tras verificación. No encaja con $25-200 en horas.

### 12. HackerOne / Bugcrowd — **DESCARTADA para este objetivo**

Programas autorizados y legítimos, y con 18 años cobras sin intermediarios. Pero el
triaje es humano y la probabilidad de un hallazgo pagable sin experiencia previa es baja
e impredecible en plazo. **Claude <60%** para descubrimiento original.

---

## Tabla comparativa de las supervivientes

| | huntr | H7CTF | Topcoder Marathon |
|---|---|---|---|
| Dinero por tarea | Variable, por hallazgo | Sólo top-3 | Sólo primeros puestos |
| ¿Garantizado? | **Sí, por unidad** | No | No |
| Evaluación | Validación reglada, 31 días | **Automática (flag)** | **Automática** |
| IA | **UNKNOWN** | No prohibida **[BUSCADOR]** | **UNKNOWN** |
| Panamá | NO VERIFICADO | NO VERIFICADO | Plausible (Trolley, 210+) |
| Competencia | No aplica ranking | ALTA | ALTA |
| Claude | 60-80% | 60-80% | 60-80% |
| Estado | PENDIENTE | PENDIENTE | PENDIENTE |

---

## Qué requisito cumple y cuál no

De tus doce requisitos, así queda el conjunto:

**Se cumplen sin problema en las tres supervivientes:** no buscar clientes (2), no hacer
llamadas (3), no construir audiencia (10), no pagar por participar (12).

**Se cumple parcialmente:** existe recompensa real (1) — sí, pero en dos de las tres es
un premio competitivo, no un pago.

**No se cumple en ninguna:**
- **(4) Claude ≥80%** — ninguna supera el 60-80%. Las tres exigen algo que Claude no
  aporta solo: encontrar una vulnerabilidad que nadie vio, o superar a competidores
  humanos afinando.
- **(6) $25-200 por tarea** — o es variable e impredecible (huntr), o es un premio de
  varios miles al que sólo llegan los primeros.
- **(8) Método de pago compatible con Panamá** — NO VERIFICADO en las tres.
- **(9) IA permitida explícitamente** — sólo H7CTF se acerca, y por una mención
  **[BUSCADOR]**, no por su reglamento leído.
- **(11) Sin reputación previa** — los CTFs y Topcoder premian de facto la experiencia
  acumulada.

**Ninguna alcanza el estado VIABLE.** Por eso no marco ninguna como tal.

---

## Las 3 que merecen investigación adicional

### 1. huntr — por su estructura de pago
Es la única candidata de todo el proyecto donde **cada unidad de trabajo válida cobra**,
sin ranking ni merge. Eso ataca exactamente el problema que nos ha bloqueado dos veces.
Lo que hay que averiguar antes de nada: **su política sobre IA** y si un residente en
Panamá puede completar el onboarding de Stripe Connect. Si la IA estuviera prohibida,
se cae entera.

### 2. H7CTF 2026 — por su postura sobre IA
Es la única oportunidad del informe con una señal explícita de tolerancia a la IA, y la
evaluación por flag es perfectamente objetiva. Hay que confirmar en su reglamento
oficial que esa tolerancia es real, si hay premio en metálico y de cuánto, y si admite
participantes individuales desde Panamá.

### 3. Topcoder Marathon Matches — por el cobro
Trolley con 210+ países es la mejor cobertura de pago verificada del informe, y la
puntuación es automática. Es la más débil de las tres en probabilidad de cobro, pero la
más fuerte en «si cobro, cobro sin fricción».

---

## Lo que creo que hay que decir con claridad

Llevamos cinco informes. El patrón ya no es ruido, es señal:

- **Bounties de GitHub** → dependen de un mantenedor que revisa poco o rechaza la IA.
- **Programas de microgrants** → dependen de asignación previa por historial.
- **Competiciones con evaluación automática** → dependen de ganar a miles.

Las tres categorías tienen dinero real. Ninguna paga por «trabajo correcto entregado».
Todas pagan por **trabajo correcto que además supera un filtro de escasez**: la atención
de un mantenedor, la prioridad de un programa, o un ranking.

Ese filtro es el producto que en realidad se compra, y es exactamente lo que Claude Code
no puede producir por ti. No es un fallo de la búsqueda: es cómo está construido este
mercado.

La categoría que no hemos explorado y que no tiene ese filtro es aquella donde **el
comprador se compromete antes de que empiece el trabajo**. Eso normalmente implica un
acuerdo previo con alguien — que es justo lo que has excluido, y con buenas razones. Es
una tensión real entre tus restricciones y la estructura del mercado, y creo que merece
que la decidas tú conscientemente, en vez de que yo siga trayendo informes con cero
VIABLE.

---

## Autorrevisión — depuración de suposiciones

Repasé el informe buscando cualquier oportunidad sostenida por una suposición no
verificada. Eliminé o reclasifiqué lo siguiente:

1. **Zindi como candidata por su pago vía PayPal.** En un borrador la tenía como
   PENDIENTE por ser la única con PayPal para premios ≤$100. La **reclasifiqué a
   DESCARTADA** al confirmar que prohíbe AutoML: el atractivo del cobro no compensa una
   regla de IA contraria a nuestro modelo.
2. **ARC Prize como «evaluación objetiva ideal».** Lo es, pero añadí las cifras reales de
   participación (3.127 y 2.071 equipos) en vez de calificar la competencia de memoria.
   Con datos, la conclusión cambia de «prometedora» a descartada.
3. **huntr como VIABLE.** En un borrador la marqué VIABLE por su modelo de pago por
   unidad. **La bajé a PENDIENTE**: su política de IA es UNKNOWN, y tu regla dice que
   UNKNOWN no se considera compatible. No hago excepción porque me guste el modelo.
4. **«Panamá compatible» en Topcoder.** Escribí «compatible» en un borrador a partir de
   los 210+ países de Trolley. Corregido a **plausible, NO VERIFICADO**: cobertura amplia
   no es lo mismo que Panamá confirmada en la lista.
5. **Gray Swan.** Estuvo como candidata fuerte por sus $500 × 20 ganadores y verificación
   automática. La prohibición de herramientas automatizadas la descarta; la mantengo
   listada sólo para dejar constancia de por qué.
6. **Estado VIABLE.** Ninguna oportunidad lo recibe. Habría podido marcar una para que el
   informe «cerrara» mejor, y sería falso: las tres supervivientes fallan al menos en los
   requisitos 4, 6, 8 y 9.
7. **Límite de alcance declarado:** casi todo este informe es **[BUSCADOR]**. No abrí el
   reglamento oficial de ninguna de las tres finalistas porque sus dominios están
   bloqueados. Es una criba para decidir dónde mirar, y así queda etiquetado en cada ficha.
