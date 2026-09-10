# Cómo rellenar la base de reglas

Este documento es la parte del proyecto que más importa. La aplicación ya
funciona; lo que no tiene es contenido regulatorio real.

## Por qué está vacía a propósito

El producto le dice a un empresario qué obligaciones legales tiene. Un dato
inventado le puede costar dinero real y a ti tu reputación. Por eso la base de
reglas del repositorio contiene **solo datos ficticios**, marcados con
`__EJEMPLO__` y con `verified: false`, y el informe los tapa con la etiqueta
`PENDIENTE DE VERIFICACIÓN — no usar con cliente`.

**Nadie ha comprobado ninguno de esos datos. No los uses como punto de partida
"aproximado": bórralos y empieza de cero, país por país.**

## Dónde está

`src/data/rules/index.ts` — un array de objetos `ObligationRule`.
`src/data/rules/schema.ts` — el tipo, con un comentario por campo.

Hay 18 registros de ejemplo: 6 países × 3 flujos de residuo. Cuando conozcas
mejor cada país verás que un país puede necesitar más de un registro por flujo
(por ejemplo, registro público por un lado y organismo colectivo por otro).
Añade tantos registros como haga falta: el motor no asume que haya uno por
combinación.

## El campo por campo

| Campo | Qué pones | Cuidado |
| --- | --- | --- |
| `id` | `pais-flujo-sufijo`, en minúsculas | Debe ser único; el script lo comprueba |
| `country` | `DE` `FR` `ES` `IT` `NL` `PL` | — |
| `stream` | `envases`, `aparatos_electricos`, `pilas` | — |
| `authorityName` | Nombre exacto del registro o autoridad | Cópialo literal de la fuente, sin traducir |
| `complianceSchemeName` | Organismo de responsabilidad, si el país lo separa | Déjalo fuera si no aplica |
| `representativeRequiredForNonEstablished` | `true` / `false` | **Ahora está en `false` como relleno. Eso no es una afirmación: verifícalo sí o sí** |
| `reportingFrequency` | Periodicidad de declaración, en español | Sin redondear: si es "anual con anticipo trimestral", eso escribe |
| `requiredData` | Un elemento por dato exigido | Literal de la fuente |
| `nonComplianceConsequence` | Consecuencia documentada | **Sin importes salvo que la fuente los diga** |
| `appliesToCategories` | `'all'` o lista de categorías | `'all'` = todas las que activen ese flujo |
| `severityWeight` | Número. Criterio comercial tuyo, no jurídico | Solo ordena el informe |
| `sourceUrl` | URL **oficial** de la que sale todo lo anterior | Enlace profundo, no la portada del ministerio |
| `sourceCheckedAt` | `YYYY-MM-DD` del día en que la leíste | No la fecha de la norma: la de tu lectura |
| `verified` | `true` solo cuando tú has leído la fuente | Es tu firma |

## Cómo llegar a la fuente oficial de cada país

No te fíes de mi memoria ni de la de ningún modelo de lenguaje para los nombres
de registros y autoridades: es exactamente el dato que más fácil se inventa. El
camino correcto es siempre de arriba abajo:

1. **El texto de la norma europea.** Busca el Reglamento (UE) 2025/40 en
   **eur-lex.europa.eu**, en español. Es la fuente primaria y es gratis. De ahí
   sacas qué obliga la Unión y qué deja a cada Estado miembro.
2. **Las directivas de base de cada flujo**, también en EUR-Lex: envases,
   residuos de aparatos eléctricos y electrónicos, y pilas y acumuladores. Cada
   una remite a la transposición nacional.
3. **El punto de acceso único europeo**: el portal *Your Europe* de la Comisión
   (`europa.eu`) enlaza, por país y por materia, a la administración nacional
   competente. Úsalo como índice para llegar al registro nacional real.
4. **El registro nacional**, ya en el dominio oficial del país (dominios de
   administración pública, no de consultoras ni de gestores). Esa URL es la que
   va en `sourceUrl`.
5. **El boletín oficial del país** para la norma nacional concreta, cuando el
   registro no explique la periodicidad o las sanciones.

Reglas al buscar:

- Fuente oficial = dominio de la administración de ese país o de la Unión
  Europea. Un blog de una consultora, un PDF de un competidor o una respuesta de
  un modelo de lenguaje **no** son fuentes.
- Si la página oficial está solo en alemán, francés, italiano o polaco, tradúcela
  para entenderla, pero copia el nombre del registro en el idioma original.
- Si una fuente oficial se contradice con otra, anótalo en `notes` y deja
  `verified: false` hasta resolverlo.
- Si no encuentras el dato, **déjalo pendiente**. Un informe con una obligación
  menos y honesto vale más que uno completo y falso.

## Los seis países, uno por uno

Rellena esta tabla según vayas verificando. Está vacía a propósito: soy yo quien
no debe rellenarla.

| País | Flujo | Registro / autoridad | URL oficial | Fecha de consulta | Verificado |
| --- | --- | --- | --- | --- | --- |
| Alemania | envases | | | | ☐ |
| Alemania | aparatos eléctricos | | | | ☐ |
| Alemania | pilas | | | | ☐ |
| Francia | envases | | | | ☐ |
| Francia | aparatos eléctricos | | | | ☐ |
| Francia | pilas | | | | ☐ |
| España | envases | | | | ☐ |
| España | aparatos eléctricos | | | | ☐ |
| España | pilas | | | | ☐ |
| Italia | envases | | | | ☐ |
| Italia | aparatos eléctricos | | | | ☐ |
| Italia | pilas | | | | ☐ |
| Países Bajos | envases | | | | ☐ |
| Países Bajos | aparatos eléctricos | | | | ☐ |
| Países Bajos | pilas | | | | ☐ |
| Polonia | envases | | | | ☐ |
| Polonia | aparatos eléctricos | | | | ☐ |
| Polonia | pilas | | | | ☐ |

## Flujo de trabajo recomendado

Ve país por país y flujo por flujo, no todo a la vez:

```bash
# 1. Edita un registro en src/data/rules/index.ts
# 2. Comprueba cuánto te queda
npm run rules:check
# 3. Repite hasta que salga "rules:check OK"
```

El script te lista exactamente qué falta en cada registro. Mientras falle, el
informe sigue marcando esas obligaciones como pendientes: puedes seguir usando
la aplicación internamente sin riesgo de enseñar algo falso por accidente.

## Mantenimiento

- Cuando revises una obligación y siga igual, actualiza `sourceCheckedAt` a la
  fecha de hoy. Es lo que respalda la suscripción de vigilancia que vendes.
- Si una norma cambia, pon `verified: false` de nuevo hasta releer la fuente.
- Los informes ya entregados guardan una copia congelada del resultado del
  motor: cambiar la base de reglas no reescribe el pasado.
