# Oportunidades de ingreso SIN vender nada — Informe de investigación
**Fecha:** 2026-09-18
**Objetivo:** encontrar sistemas donde *la plataforma provee la demanda* (tarea/reto/bounty) y el flujo sea:
`ENTRO → LA PLATAFORMA ME DA EL TRABAJO → CLAUDE LO HACE → ENTREGO → LA PLATAFORMA PAGA`.
**Restricción absoluta:** sin vender, sin buscar clientes, sin marketing, sin audiencia, sin negociar, legal, sin evadir KYC/ToS.

---

## 0. Limitación metodológica (leer primero)

En esta sesión el proxy de red **bloqueó el acceso directo (WebFetch) a casi todos los sitios primarios**
(`topcoder.com`, `kaggle.com`, `algora.io`, `bughunters.google.com`, etc.). Sólo pude usar **búsqueda web**,
que devuelve resúmenes de terceros.

Por eso este informe usa tres etiquetas de evidencia:

- **VERIFICADO-INDIRECTO** — coincide en varias fuentes secundarias fiables, pero *no* leí la página oficial.
- **NO VERIFICADO** — dato encontrado una sola vez, o proveniente de blogs/agregadores.
- **PENDIENTE (tú)** — sólo se confirma abriendo la página oficial (te dejo el enlace exacto y qué leer).

**No hay en este informe ni un solo dato inventado.** Donde no pude confirmar, dice NO VERIFICADO.
Ningún dato de pago, país o política de IA debe darse por cierto hasta que abras la fuente oficial.

---

## 1. Filtro aplicado (qué quedó descartado de entrada)

Descartado por violar tus condiciones, sin más análisis:

| Modelo | Por qué se descarta |
|---|---|
| Freelancing (Upwork, Fiverr, Contra) | Hay que proponer, competir por clientes y negociar = vender |
| SaaS / apps / plantillas / cursos | Requiere conseguir usuarios |
| Contenido, afiliados, SEO, YouTube | Requiere audiencia |
| Encuestas, microtareas de céntimos, MTurk | Pagan céntimos; además muchas prohíben automatización |
| Apuestas, trading, cripto especulativa | Excluido por ti y por riesgo |
| Captcha farms, granjas de cuentas | Ilegal / violación de ToS |
| "Vender prompts/agentes" | Vender |

---

## 2. Las 10 mejores candidatas (lista corta)

Ordenadas por encaje con tu flujo, no por dinero.

| # | Plataforma | Tipo de trabajo | Modelo de pago | $ por resultado | Encaje flujo | Estado |
|---|---|---|---|---|---|---|
| 1 | **Topcoder** | Retos de desarrollo/QA/datos publicados por clientes de la plataforma | **Premio competitivo** (1º/2º) + algunos pagos por tarea | $25 – $2.500 | Alto | **Candidata fuerte** |
| 2 | **Algora** (bounties GitHub) | Issues de OSS con recompensa en USD | **Pago por resultado** (al merge) | $50 – $2.500 | Muy alto | **Candidata fuerte (bloqueo de pago)** |
| 3 | **Kaggle** | Competiciones de ML/datos | **Premio competitivo** | $0 – $650k pool | Alto | **Candidata fuerte** |
| 4 | **huntr** (Protect AI) | Bug bounty en OSS de IA/ML | Pago por resultado validado | $50 – $50.000 (NO VERIF.) | Alto | Condicionada |
| 5 | **DrivenData** | Competiciones ML de impacto social | Premio competitivo | miles | Alto | Secundaria |
| 6 | **AIcrowd** | Competiciones ML/agentes (NeurIPS, Meta, Sony, Krafton) | Premio competitivo | miles | Alto | Secundaria |
| 7 | **Zindi** | Competiciones de datos | Premio competitivo | cientos–miles | Medio | Secundaria |
| 8 | **boss.dev** | Bounties atados a issues de GitHub, pago automático al cerrar | Pago por resultado | NO VERIFICADO | Alto | Secundaria |
| 9 | **HackerOne / Bugcrowd** | Bug bounty clásico | Pago por resultado | $50 – $10.000+ | Medio | **Riesgo alto ahora** |
| 10 | **Superteam Earn** | Listados con "agent API", pago USDC | Pago por resultado | ~1.500 USDC (NO VERIF.) | Alto | **Descartada** (cripto/wallet) |

Descartes dentro de la lista larga que conviene que sepas:

- **DataAnnotation / Mercor / Surge AI / Outlier (etiquetado y RLHF).** Encajan perfecto en el flujo
  (la plataforma da el trabajo) **pero prohíben justo lo que quieres hacer**: la documentación de Mercor
  indica que en evaluaciones y *work trials* está prohibido usar herramientas de IA, y en proyectos activos
  sólo se permite IA para gramática/tono, nunca para generar contenido sustantivo ni evaluar salidas de
  modelos (VERIFICADO-INDIRECTO). Usar Claude ahí sería violar los ToS → **DESCARTADAS por tu regla de legalidad**.
- **Superteam Earn, Agoragentic, Drips Wave:** pagan en USDC/Solana. Aunque la tarea sea legítima, implica
  wallet cripto y conversión → fuera de tus condiciones prácticas. **DESCARTADAS.**

---

## 3. Investigación profunda de las 3 mejores

### 3.1 — TOPCODER

1. **Qué hago:** me registro, entro a "Challenges", elijo un reto abierto (desarrollo, QA, data science,
   first2finish), descargo las especificaciones que ya escribió el cliente de Topcoder y entrego un ZIP/PR.
2. **Qué hace Claude:** leer la especificación, escribir el código, los tests, la documentación de entrega,
   y preparar el paquete de submission. Realistamente **75–90%** del trabajo técnico.
3. **Qué hago yo:** crear y verificar cuenta, aceptar los términos del reto, subir el archivo,
   responder a la revisión si el revisor pide algo, y configurar el cobro.
4. **Cuánto paga:** varía por reto. Las fuentes secundarias muestran estructuras de premio tipo
   $500 / $200 / $150 con puestos menores de $25–$50, y retos de diseño/desarrollo publicados con
   premios de $1.200 / $600 / $150 y bolsas de ~$3.950 (VERIFICADO-INDIRECTO, vistos en títulos de retos).
   También se anuncian bonus de hasta $2.500 en un leaderboard de retos de IA ago–dic 2026 (NO VERIFICADO).
5. **Cómo se determina el pago:** **premio competitivo con revisión humana**. Un panel de revisores puntúa
   las entregas; pagan 1º y 2º (en "first2finish" paga la primera entrega que pasa la revisión).
   No hay pago por participar.
6. **Cuánto tarda:** retos típicos de 3 a 10 días de ventana. Trabajo efectivo estimado: 3–15 horas con Claude.
7. **Cómo cobro:** desde el 21 de octubre de 2025 Topcoder paga **exclusivamente vía Trolley**; ya no envía
   pagos a PayPal ni Payoneer (VERIFICADO-INDIRECTO, artículo de Topcoder Thrive). Trolley anuncia
   transferencias bancarias a 210+ países (VERIFICADO-INDIRECTO). Implica **KYC/formulario fiscal en Trolley**.
8. **¿Panamá permitido?** **PENDIENTE (tú)** — Panamá no aparece en listas de sanciones OFAC, y Trolley cubre
   210+ países, pero no pude leer la lista oficial. Verificar en la pantalla de onboarding de Trolley.
9. **Edad mínima:** **PENDIENTE (tú)** — típico 18+ en los Community Terms; no verificado.
10. **¿IA permitida?** **NO VERIFICADO.** No encontré una política pública explícita de Topcoder sobre
    entregas generadas con IA. Sí existe una regla general de que la entrega debe ser obra tuya o de
    terceros autorizados. **Esto es el punto crítico: hay que leer los términos de cada reto antes de entregar.**
11. **¿Automatización permitida?** Scraping/bots sobre la plataforma: asumir que NO. Usar Claude localmente
    para producir el código es otra cosa, y depende del punto 10.
12. **Competencia:** real pero acotada — decenas de participantes por reto, no miles. Retos "first2finish"
    premian velocidad, que es exactamente donde Claude te da ventaja legítima.
13. **Evidencia:** topcoder.com/challenges · topcoder.com/community/how-it-works/terms ·
    topcoder.com/thrive/articles/payment-policies-and-instructions ·
    topcoder.com/thrive/articles/topcoder-payments-are-moving-to-trolley

**Clasificación: PENDIENTE DE VERIFICACIÓN** (falta política de IA + elegibilidad Panamá). Es la más
prometedora de todas si esos dos puntos salen bien.

---

### 3.2 — ALGORA (bounties sobre issues de GitHub)

1. **Qué hago:** entro a algora.io/bounties, elijo un issue que ya tiene dinero asignado por la empresa
   dueña del repo, comento para reclamarlo, abro un PR; si lo hacen merge, cobro.
2. **Qué hace Claude:** leer el repo, reproducir el bug, escribir el fix y los tests, redactar el PR.
   **Hasta ~90%** en issues bien definidos.
3. **Qué hago yo:** cuenta GitHub + cuenta Algora + KYC de pagos, reclamar el issue, abrir el PR con mi
   nombre, contestar los comentarios de revisión del mantenedor.
4. **Cuánto paga:** rangos citados $50 – $2.500 por bounty en 2026, con casos de $10k+ (VERIFICADO-INDIRECTO).
5. **Cómo se determina:** **pago por resultado puro** — se paga al hacer merge del PR. Comisión de
   plataforma ~4% (NO VERIFICADO).
6. **Cuánto tarda:** 1–8 horas de trabajo; el merge puede tardar días o semanas según el mantenedor.
7. **Cómo cobro:** **Stripe Connect**, 1–3 días hábiles tras el merge (VERIFICADO-INDIRECTO).
8. **¿Panamá permitido?** **AQUÍ ESTÁ EL PROBLEMA.** La documentación de Stripe indica que los
   *cross-border payouts* de plataformas sólo llegan a cuentas conectadas en EE.UU., Reino Unido, EEE,
   Canadá y Suiza, y que Stripe **no soporta payouts self-serve fuera de esas regiones**; además Stripe no
   está disponible para negocios en Panamá (VERIFICADO-INDIRECTO). **Es muy probable que no puedas cobrar
   desde Panamá sin una entidad en otro país** — y montar una entidad extranjera sólo para cobrar
   no es algo que yo te recomiende hacer a la ligera.
9. **Edad mínima:** NO VERIFICADO (Stripe exige 18+ para cuentas de pago).
10. **¿IA permitida?** **NO VERIFICADO** a nivel de Algora. Lo que manda de verdad es la política del
    **repositorio**: cada vez más proyectos OSS exigen declarar código generado por IA o directamente
    rechazan PRs generados por IA. Hay que leer el `CONTRIBUTING.md` de cada repo.
11. **¿Automatización permitida?** Reclamar bounties en masa con bot: no. Usar Claude para escribir el
    parche: depende del repo.
12. **Competencia:** alta y desigual. Un censo público de bounties de Algora encontró que
    **la mayor parte del dinero se concentra en muy pocos repositorios y que sólo una fracción pequeña
    de los bounties abiertos era realmente reclamable** (NO VERIFICADO — proviene de un repo de GitHub
    de terceros, `AsherKasper/bounty-census`). Esto coincide con la queja habitual: muchos bounties
    "abiertos" llevan meses asignados a alguien.
13. **Evidencia:** algora.io/bounties · docs de Stripe cross-border payouts · github.com/AsherKasper/bounty-census

**Clasificación: PENDIENTE DE VERIFICACIÓN, con fuerte sospecha de DESCARTE por cobro.**
El encaje con tu flujo es el mejor de los tres; el cobro desde Panamá es el muro.
Misma advertencia aplica a **huntr**, que también paga por Stripe Connect.

---

### 3.3 — KAGGLE (y, mismo patrón, DrivenData / AIcrowd)

1. **Qué hago:** me registro, elijo una competición con premio, descargo los datos que ya provee la
   plataforma, subo un archivo de predicciones o un notebook, y el leaderboard me puntúa automáticamente.
2. **Qué hace Claude:** análisis exploratorio, feature engineering, entrenamiento, validación cruzada,
   iteración sobre el score. **80–95%** — este es el caso donde Claude es más autónomo, porque la
   evaluación es automática y objetiva, sin revisor humano ni negociación.
3. **Qué hago yo:** cuenta + aceptar reglas, ejecutar/supervisar, hacer el submit, y — si gano — entregar
   documentación del modelo y datos fiscales.
4. **Cuánto paga:** sólo a los primeros puestos. Bolsas reales citadas: $650k (PREPARE/NIH),
   $500k (Water Supply Forecast Rodeo), $120k (Gates Foundation), $70k — esas cifras son de **DrivenData**
   (VERIFICADO-INDIRECTO). Kaggle tiene desde $0 (sólo medallas) hasta cientos de miles.
5. **Cómo se determina:** **premio competitivo con evaluación automática** por métrica en el leaderboard
   privado. Gana el score, no la relación con nadie. Eso encaja perfecto con tus condiciones.
6. **Cuánto tarda:** competiciones de 1 a 3 meses. Trabajo real: de decenas a cientos de horas si quieres
   ganar de verdad.
7. **Cómo cobro:** transferencia tras verificación de identidad y formularios fiscales (W-8BEN para no
   residentes en EE.UU.). **PENDIENTE (tú).**
8. **¿Panamá permitido?** Probablemente sí: las exclusiones típicas son países OFAC (Cuba, Irán, Siria,
   Corea del Norte, Crimea, DNR/LNR) y Panamá no está en esa lista (VERIFICADO-INDIRECTO). Cada competición
   tiene sus propias reglas de elegibilidad — algunas están restringidas sólo a EE.UU.
9. **Edad mínima:** 18 años al momento de participar, según las reglas estándar de competición
   (VERIFICADO-INDIRECTO).
10. **¿IA permitida?** Sí, de forma natural: son competiciones **de** modelos de IA. Usar Claude para
    escribir el código de tu solución es normal y esperado. Ojo con la cláusula de licencia
    open-source de la solución ganadora en algunas competiciones.
11. **¿Automatización permitida?** Sí dentro de los límites de submissions diarias (típicamente 5/día).
    Prohibido: cuentas múltiples, colusión, *leaderboard probing* abusivo.
12. **Competencia: BRUTAL y hay que decirlo claro.** Miles de participantes por competición
    (las grandes superan los 1.000–3.000 equipos), y **pagan sólo los 3–5 primeros puestos**.
    Ganar exige superar a equipos de doctorandos y de grandes empresas. La probabilidad realista de
    monetizar esto a corto plazo es **baja**, aunque el flujo sea perfecto y no tengas que vender nada.
13. **Evidencia:** kaggle.com/docs/competitions · kaggle.com/competitions · drivendata.org/competitions ·
    mlcontests.com (estado anual del sector)

**Clasificación: VIABLE en cuanto a reglas — pero con expectativa de ingreso realista cercana a $0
salvo que inviertas meses.** No cumple tu criterio de "$25–$200 por resultado" de forma fiable.

---

## 4. La verdad incómoda que tienes que leer

Tu flujo ideal —*la plataforma pone la demanda, Claude hace el trabajo, la plataforma paga*— **existe**,
pero el mercado está estructurado así:

1. **Donde la IA está permitida (Kaggle, AIcrowd, DrivenData, Topcoder), el pago es competitivo:**
   no cobras por trabajar, cobras por ganar. El riesgo no es vender — es trabajar gratis.
2. **Donde el pago es por resultado garantizado (Algora, huntr, boss.dev), el cobro pasa por
   Stripe Connect**, que según la documentación de Stripe no hace payouts self-serve a Panamá.
   Ese es tu cuello de botella real, no la parte técnica.
3. **Donde el pago es por tarea y sin competencia (DataAnnotation, Mercor, Surge), el uso de IA está
   prohibido por contrato.** No hay forma honesta de usar Claude ahí.

La única casilla que combina *pago razonablemente alcanzable* + *IA no prohibida* + *cobro plausible desde
Panamá* es **Topcoder**, y depende de dos verificaciones que sólo puedes hacer tú desde tu cuenta.

---

## 5. Clasificación final

### VIABLE
- **Kaggle / DrivenData / AIcrowd** — reglas compatibles al 100% con tus condiciones (IA permitida,
  cero venta, cero clientes, evaluación automática). **Pero ingreso esperado bajo por competencia masiva.**

### PENDIENTE DE VERIFICACIÓN
- **Topcoder** — *mejor candidata global*. Falta: (a) política sobre entregas asistidas por IA,
  (b) elegibilidad de Panamá en Trolley, (c) edad mínima en Community Terms.
- **Algora / boss.dev / huntr** — encaje de flujo excelente; falta confirmar si un residente en Panamá
  puede cobrar por Stripe Connect. Si la respuesta es no, pasan a DESCARTADAS.
- **Zindi** — sin datos suficientes sobre premios y elegibilidad.

### DESCARTADAS
- **DataAnnotation, Mercor, Surge AI, Outlier** — prohíben usar IA para el trabajo sustantivo.
- **Superteam Earn, Agoragentic, Drips Wave** — pago en cripto/wallet.
- **HackerOne / Bugcrowd** — en 2026 el ecosistema está saturado de reportes generados por IA; HackerOne
  llegó a pausar nuevas submissions en marzo de 2026 y su código de conducta exige validación humana con
  PoC reproducible (VERIFICADO-INDIRECTO). Entrar ahí como recién llegado con reportes asistidos por IA es
  el peor momento posible, y roza lo que tú mismo quieres evitar.
- **Todo lo del apartado 1.**

---

## 6. Revisión final de conformidad

Repasé cada entrada que queda en pie contra tus condiciones. **Ninguna de las opciones
clasificadas como VIABLE o PENDIENTE requiere:** vender un producto, buscar clientes, contactar a nadie,
hacer llamadas, cold email, marketing, crear contenido para atraer compradores, construir audiencia o
seguidores, ni negociar precios. En todas, la demanda la pone la plataforma.

Las únicas interacciones humanas que quedan son **inevitables y no son ventas**: responder a un revisor
de Topcoder sobre tu entrega, o a un mantenedor de OSS sobre tu PR.

---

## 7. Qué verificar tú (3 pasos, ~30 minutos, sin abrir cuentas todavía)

1. **Topcoder → política de IA.** Abrir `topcoder.com/community/how-it-works/terms` y los términos de
   2–3 retos abiertos; buscar "AI", "artificial intelligence", "generated". *Esto decide todo.*
2. **Trolley → Panamá.** Confirmar en la documentación de Trolley que Panamá recibe transferencia bancaria.
3. **Algora/huntr → Stripe.** Comprobar en `docs.stripe.com/connect/cross-border-payouts` si Panamá está
   en la lista de destinos. Si no está, tacha las tres plataformas de bounties de una vez.

**Nota de cumplimiento del encargo:** no participé en ninguna oportunidad, no abrí cuentas, no envié
submissions, no contacté a nadie y no programé nada. Sólo investigación.
