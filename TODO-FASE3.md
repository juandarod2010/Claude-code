# TODO — Fase 3

Sale de NEXT-STEPS.md: bloque 2 (ideas guardadas) y deuda técnica. Nada de esto
depende de datos que tengas que investigar tú.

## 1. Editor de Plan of Action (`/admin/poa`)
- [x] Formulario con las tres partes: causa raíz, correcciones con prueba, medidas preventivas
- [x] Prellenado desde un lead de apelaciones, con las pistas del analizador
- [x] Puntuación del plan y lista de lo que falta, en vivo
- [x] Salida en Markdown, texto plano y JSON: copiar y descargar
- [x] Borrador guardado para poder retomarlo

## 2. Panel de respuesta A/B (`/admin/ab`)
- [x] Tasa de respuesta por variante, en prospección y en leads
- [x] Aviso honesto cuando la muestra es demasiado pequeña para concluir nada
- [x] Cálculo puro y testeado

## 3. Deuda técnica
- [x] `rules:check` lee también las obligaciones guardadas en Supabase
- [x] Recorrido de extremo a extremo automatizado en el repositorio (`npm run test:e2e`)

## Verificación
- [x] `npm run build`, `npm run lint`, `npm test` limpios
- [x] `npm run test:e2e` en verde
- [x] Documentación al día

---

## Estado final (10 de septiembre de 2026)

- `npm run build`, `npm run lint` — limpios.
- `npm test` — 124 tests, cobertura de la lógica 94,1 % (umbral 80 %).
- `npm run test:e2e` — 9 recorridos en Chromium contra el build, todos en verde.
- `npm run rules:check` — sigue fallando con los datos de ejemplo, como debe, y
  ahora dice de dónde ha leído las obligaciones.
