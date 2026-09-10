# TODO — Fase 4

Lo que queda de NEXT-STEPS que no depende de datos que investigues tú.

## 1. Historial de la base de reglas
- [x] Registro de cada alta, cambio y baja de obligación, campo a campo
- [x] Comparación pura y testeable entre dos versiones de una obligación
- [x] Página `/admin/rules-history` con línea temporal y filtros
- [x] «Qué ha cambiado desde este informe»: lo que se le cuenta al suscriptor
- [x] Migración SQL con RLS

## 2. Serie temporal del A/B
- [x] Evolución semana a semana, no solo el acumulado
- [x] Mismo criterio: cuenta, no infiere

## 3. Deuda técnica
- [x] El motor distingue «no hay obligación» de «ese país no está cargado»

## Verificación
- [x] `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e` en verde
- [x] Documentación al día

---

## Estado final (10 de septiembre de 2026)

- `npm run build`, `npm run lint` — limpios.
- `npm test` — 146 tests, cobertura de la lógica 93,8 % (umbral 80 %).
- `npm run test:e2e` — 10 recorridos en Chromium contra el build, en verde.
- `npm run rules:check` — sigue fallando con los datos de ejemplo, como debe.
- `npm run health:check` — 5 correctos, 3 avisos, 0 fallos.
