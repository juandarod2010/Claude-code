# TODO — MVP Complyo

Derivado de los 10 entregables. Se marca al completar cada bloque.

## 0. Andamiaje
- [ ] Proyecto Vite + React 18 + TypeScript
- [ ] Tailwind CSS configurado
- [ ] ESLint + Vitest configurados
- [ ] Configuración de despliegue lista (Vercel + Netlify), sin desplegar
- [ ] `.env.example` documentado y modo MOCK

## 1. Base de reglas (`/src/data/rules/`)
- [ ] Esquema TypeScript tipado (país × flujo × categoría)
- [ ] Datos de ejemplo `__EJEMPLO__` para 6 países × 3 flujos
- [ ] Script `npm run rules:check` con salida != 0 si `verified:false` o falta `source_url`

## 2. Formulario de diagnóstico (`/diagnostico`)
- [ ] 8 preguntas, una por pantalla, barra de progreso, móvil primero
- [ ] Recoge países, canales, categorías, materiales, establecimiento UE, volumen, email

## 3. Motor de reglas (`/src/lib/engine/`)
- [ ] Función pura respuestas → obligaciones ordenadas con nivel de riesgo

## 4. Informe (`/informe/:id`)
- [ ] 5 secciones fijas + CTA único "Resolverlo"
- [ ] Descarga PDF A4 con descargo de responsabilidad
- [ ] Etiqueta "PENDIENTE DE VERIFICACIÓN" en obligaciones no verificadas

## 5. Persistencia (Supabase)
- [ ] Cliente con modo MOCK (localStorage)
- [ ] Migración SQL en `/supabase/migrations/` con RLS y políticas

## 6. Panel interno (`/admin`)
- [ ] Contraseña por variable de entorno
- [ ] Lista de leads con filtro por país y fecha + acceso al informe

## 7. Prospección (`/prospeccion`)
- [ ] Formulario URL/ASIN + casillas de qué falta
- [ ] Variantes A/B alternadas automáticamente y registradas

## 8. Landing (`/`)
- [ ] Una pantalla, titular, 3 líneas, CTA a diagnóstico, sin pruebas sociales falsas
- [ ] Marca centralizada en `/src/config/brand.ts`

## 9. Tests
- [ ] Vitest con >= 15 casos del motor (no establecido, multipaís, multiflujo)

## 10. Documentación
- [ ] README.md
- [ ] RULES-GUIDE.md
- [ ] DECISIONS.md
- [ ] NEXT-STEPS.md

## Verificación final
- [ ] `npm run build` sin errores
- [ ] `npm run lint` limpio
- [ ] `npm test` en verde
- [ ] `npm run rules:check` falla como es esperado con datos de ejemplo
