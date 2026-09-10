# TODO — Fase 2

## Track A — Apelaciones (`/src/modules/appeals/`)
- [ ] 1.1 `messages.ts` — variantes A (urgencia) y B (solución) con marcadores
- [ ] 1.2 `poa-template.ts` — estructura tipada + generación de documento
- [ ] 1.3 `analyzer.ts` — correo de Amazon → tipo, gravedad y próximos pasos
- [ ] 1.4 Página pública `/appeals` con formulario y lead `type: 'appeal'`

## Track B — Complyo (`/src/modules/complyo/`)
- [ ] 2.1 `eur-lex-guide.tsx` — guía interactiva con checklist
- [ ] 2.2 `rules-validator.ts` — validación antes de guardar
- [ ] 2.3 `/admin/fill-rules` — alta de obligaciones sin tocar código
- [ ] 2.4 `/admin/rules-status` — estado de las 18 obligaciones

## 3. Métricas y seguimiento
- [ ] 3.1 `/admin/leads` con filtros, búsqueda, estado y columnas nuevas
- [ ] 3.2 Notas por lead
- [ ] 3.3 `npm run report:weekly` → `/reports/weekly-YYYY-WW.json`

## 4. Documentación visual
- [ ] 4.1 `/public/flowchart.svg` con los dos tracks
- [ ] 4.2 README con el flujo visual y el mapa del código

## 5. UX
- [ ] 5.1 Diagnóstico: validación, progreso, atrás y resumen
- [ ] 5.2 PDF: hueco de logo, colores de marca, pie y número de informe
- [ ] 5.3 `/templates/email-diagnosis-sent.txt`

## 6. Scripts
- [ ] 6.1 Scripts de despliegue y mantenimiento en package.json
- [ ] 6.2 `health:check`
- [ ] 6.3 `backup:rules`

## 7. Tests
- [ ] 7.1 Tests del analizador de apelaciones
- [ ] 7.2 Tests del validador de reglas
- [ ] 7.3 Tests de utilidades
- [ ] 7.4 Cobertura > 80 % sobre la lógica

## 8. Configuración y documentación
- [ ] 8.1 `.env.example` ampliado
- [ ] 8.2 `SETUP.md`
- [ ] 8.3 `SUPABASE.md`
- [ ] 8.4 README, RULES-GUIDE, DECISIONS y NEXT-STEPS actualizados

## Verificación final
- [ ] `npm run build` limpio
- [ ] `npm run lint` limpio
- [ ] `npm test` en verde con cobertura > 80 %
- [ ] `npm run rules:check` falla correctamente con los datos de ejemplo
- [ ] Todos los scripts de package.json ejecutan sin error
- [ ] Recorrido completo verificado en navegador
