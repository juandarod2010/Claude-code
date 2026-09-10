# TODO — Fase 4

Lo que queda de NEXT-STEPS que no depende de datos que investigues tú.

## 1. Historial de la base de reglas
- [ ] Registro de cada alta, cambio y baja de obligación, campo a campo
- [ ] Comparación pura y testeable entre dos versiones de una obligación
- [ ] Página `/admin/rules-history` con línea temporal y filtros
- [ ] «Qué ha cambiado desde este informe»: lo que se le cuenta al suscriptor
- [ ] Migración SQL con RLS

## 2. Serie temporal del A/B
- [ ] Evolución semana a semana, no solo el acumulado
- [ ] Mismo criterio: cuenta, no infiere

## 3. Deuda técnica
- [ ] El motor distingue «no hay obligación» de «ese país no está cargado»

## Verificación
- [ ] `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e` en verde
- [ ] Documentación al día
