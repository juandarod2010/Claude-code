# TODO — Fase 2

## Track A — Apelaciones (`/src/modules/appeals/`)
- [x] 1.1 `messages.ts` — variantes A (urgencia) y B (solución) con marcadores
- [x] 1.2 `poa-template.ts` — estructura tipada + generación de documento
- [x] 1.3 `analyzer.ts` — correo de Amazon → tipo, gravedad y próximos pasos
- [x] 1.4 Página pública `/appeals` con formulario y lead `type: 'appeal'`

## Track B — Complyo (`/src/modules/complyo/`)
- [x] 2.1 `eur-lex-guide.tsx` — guía interactiva con checklist
- [x] 2.2 `rules-validator.ts` — validación antes de guardar
- [x] 2.3 `/admin/fill-rules` — alta de obligaciones sin tocar código
- [x] 2.4 `/admin/rules-status` — estado de las 18 obligaciones

## 3. Métricas y seguimiento
- [x] 3.1 `/admin/leads` con filtros, búsqueda, estado y columnas nuevas
- [x] 3.2 Notas por lead
- [x] 3.3 `npm run report:weekly` → `/reports/weekly-YYYY-WW.json`

## 4. Documentación visual
- [x] 4.1 `/public/flowchart.svg` con los dos tracks
- [x] 4.2 README con el flujo visual y el mapa del código

## 5. UX
- [x] 5.1 Diagnóstico: validación, progreso, atrás y resumen
- [x] 5.2 PDF: hueco de logo, colores de marca, pie y número de informe
- [x] 5.3 `/templates/email-diagnosis-sent.txt`

## 6. Scripts
- [x] 6.1 Scripts de despliegue y mantenimiento en package.json
- [x] 6.2 `health:check`
- [x] 6.3 `backup:rules`

## 7. Tests
- [x] 7.1 Tests del analizador de apelaciones
- [x] 7.2 Tests del validador de reglas
- [x] 7.3 Tests de utilidades
- [x] 7.4 Cobertura > 80 % sobre la lógica

## 8. Configuración y documentación
- [x] 8.1 `.env.example` ampliado
- [x] 8.2 `SETUP.md`
- [x] 8.3 `SUPABASE.md`
- [x] 8.4 README, RULES-GUIDE, DECISIONS y NEXT-STEPS actualizados

## Verificación final
- [x] `npm run build` limpio
- [x] `npm run lint` limpio
- [x] `npm test` en verde con cobertura > 80 %
- [x] `npm run rules:check` falla correctamente con los datos de ejemplo
- [x] Todos los scripts de package.json ejecutan sin error
- [x] Recorrido completo verificado en navegador

---

## Estado final de la verificación (10 de septiembre de 2026)

- `npm run build` — sin errores de TypeScript y sin avisos.
- `npm run lint` — limpio, 0 errores y 0 avisos.
- `npm test` — 101 tests en verde; cobertura de la lógica al 96,2 % con umbral
  del 80 % aplicado dentro del propio comando.
- `npm run rules:check` — **falla con código 1**, como debe con los datos de
  ejemplo.
- `npm run health:check` — 5 correctos, 3 avisos, 0 fallos.
- `npm run report:weekly` y `npm run backup:rules` — ejecutan y escriben su
  fichero.
- Recorrido completo verificado en Chromium: diagnóstico → informe con número
  `INFORME-YYYYMMDD-XXXX` → PDF A4 → `/appeals` clasificando un correo real de
  suspensión → `/admin/leads` con filtros, búsqueda, estado, ingresos y notas →
  `/admin/fill-rules` validando y guardando → guía EUR-Lex con checklist →
  `/admin/rules-status` reflejando la regla guardada → `/prospeccion`
  alternando A y B.
- Ningún dato regulatorio inventado, ninguna tasa de éxito publicada sin
  respaldo.
