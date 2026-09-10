# TODO — Fase 3

Sale de NEXT-STEPS.md: bloque 2 (ideas guardadas) y deuda técnica. Nada de esto
depende de datos que tengas que investigar tú.

## 1. Editor de Plan of Action (`/admin/poa`)
- [ ] Formulario con las tres partes: causa raíz, correcciones con prueba, medidas preventivas
- [ ] Prellenado desde un lead de apelaciones, con las pistas del analizador
- [ ] Puntuación del plan y lista de lo que falta, en vivo
- [ ] Salida en Markdown, texto plano y JSON: copiar y descargar
- [ ] Borrador guardado para poder retomarlo

## 2. Panel de respuesta A/B (`/admin/ab`)
- [ ] Tasa de respuesta por variante, en prospección y en leads
- [ ] Aviso honesto cuando la muestra es demasiado pequeña para concluir nada
- [ ] Cálculo puro y testeado

## 3. Deuda técnica
- [ ] `rules:check` lee también las obligaciones guardadas en Supabase
- [ ] Recorrido de extremo a extremo automatizado en el repositorio (`npm run test:e2e`)

## Verificación
- [ ] `npm run build`, `npm run lint`, `npm test` limpios
- [ ] `npm run test:e2e` en verde
- [ ] Documentación al día
