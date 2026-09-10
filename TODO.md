# TODO — MVP Complyo

Derivado de los 10 entregables. Se marca al completar cada bloque.

## 0. Andamiaje
- [x] Proyecto Vite + React 18 + TypeScript
- [x] Tailwind CSS configurado
- [x] ESLint + Vitest configurados
- [x] Configuración de despliegue lista (Vercel + Netlify), sin desplegar
- [x] `.env.example` documentado y modo MOCK

## 1. Base de reglas (`/src/data/rules/`)
- [x] Esquema TypeScript tipado (país × flujo × categoría)
- [x] Datos de ejemplo `__EJEMPLO__` para 6 países × 3 flujos
- [x] Script `npm run rules:check` con salida != 0 si `verified:false` o falta `source_url`

## 2. Formulario de diagnóstico (`/diagnostico`)
- [x] 8 preguntas, una por pantalla, barra de progreso, móvil primero
- [x] Recoge países, canales, categorías, materiales, establecimiento UE, volumen, email

## 3. Motor de reglas (`/src/lib/engine/`)
- [x] Función pura respuestas → obligaciones ordenadas con nivel de riesgo

## 4. Informe (`/informe/:id`)
- [x] 5 secciones fijas + CTA único "Resolverlo"
- [x] Descarga PDF A4 con descargo de responsabilidad
- [x] Etiqueta "PENDIENTE DE VERIFICACIÓN" en obligaciones no verificadas

## 5. Persistencia (Supabase)
- [x] Cliente con modo MOCK (localStorage)
- [x] Migración SQL en `/supabase/migrations/` con RLS y políticas

## 6. Panel interno (`/admin`)
- [x] Contraseña por variable de entorno
- [x] Lista de leads con filtro por país y fecha + acceso al informe

## 7. Prospección (`/prospeccion`)
- [x] Formulario URL/ASIN + casillas de qué falta
- [x] Variantes A/B alternadas automáticamente y registradas

## 8. Landing (`/`)
- [x] Una pantalla, titular, 3 líneas, CTA a diagnóstico, sin pruebas sociales falsas
- [x] Marca centralizada en `/src/config/brand.ts`

## 9. Tests
- [x] Vitest con >= 15 casos del motor (no establecido, multipaís, multiflujo)

## 10. Documentación
- [x] README.md
- [x] RULES-GUIDE.md
- [x] DECISIONS.md
- [x] NEXT-STEPS.md

## Verificación final
- [x] `npm run build` sin errores
- [x] `npm run lint` limpio
- [x] `npm test` en verde
- [x] `npm run rules:check` falla como es esperado con datos de ejemplo

---

## Estado final de la verificación

Ejecutado el 10 de septiembre de 2026:

- `npm run build` — sin errores de TypeScript y sin avisos.
- `npm run lint` — limpio, 0 errores y 0 avisos.
- `npm test` — 24 tests en verde (21 del motor de reglas, 3 de prospección).
- `npm run rules:check` — **falla con código 1 y 54 problemas. Es lo esperado**:
  demuestra que el guardarraíl impide dar por buenos los datos de ejemplo.
- Recorrido completo verificado en Chromium: landing → diagnóstico (8 pantallas)
  → informe en pantalla → descarga de PDF (3 páginas A4, con el descargo de
  responsabilidad en el pie de cada una) → lead visible en `/admin` con los
  filtros funcionando → `/prospeccion` generando las dos variantes y alternando
  A y B con registro de cuál tocó a cada prospecto.
- Ningún dato regulatorio real inventado: los 18 registros están marcados
  `__EJEMPLO__` con `verified: false`.
