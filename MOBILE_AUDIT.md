# Mobile Audit — Venezuela Te Ayuda

> Viewport audit target: 320px–428px (iPhone SE → Pixel 7)  
> Date: 2026-07-07  
> Status: In progress  
> Follows: definition_of_done (checklist de 9 puntos)

---

## Resumen por ruta

| Ruta | Estado Verificado | Blocker | Major | Minor | OK |
|------|------------------|---------|-------|-------|----|
| `/mapa` | ❌ No verificado | 3 | 2 | 1 | 0 |
| `/` (home) | ❌ No verificado | 1 | 2 | 1 | 0 |
| `/login` | ❌ No verificado | 1 | 0 | 0 | 1 |
| `/registro` | ❌ No verificado | 1 | 0 | 1 | 1 |
| `/perfil` | ❌ No verificado | 1 | 0 | 1 | 0 |
| `/ayuda/nueva` | ❌ No verificado | 1 | 0 | 1 | 0 |
| `/ayuda/[id]` | ❌ No verificado | 1 | 0 | 0 | 1 |
| `/mensajes` | ❌ No verificado | 1 | 0 | 0 | 1 |
| `/mensajes/[id]` | ❌ No verificado | 1 | 0 | 0 | 1 |
| `/admin` | ❌ No verificado | 1 | 0 | 1 | 0 |
| `/profesionales` | ❌ No verificado | 1 | 0 | 0 | 1 |
| `/legal/*` | ❌ No verificado | 1 | 0 | 0 | 1 |

---

## Hallazgos detallados

### 🔴 Blocker (incumplen puntos 1–6 de definition_of_done)

| # | Ruta/Componente | Problema | DoD violado | Archivo:línea | Fix propuesto |
|---|----------------|----------|-------------|---------------|---------------|
| B1 | **Todas** | `Input` usa `h-8` (32px); `Button` default `h-8`; `SelectTrigger` `h-8`; `Textarea` sin `min-h` táctil. Todos bajo el mínimo de 44px. | Punto 4+5 (targets ≥44px) | `ui/input.tsx:11`, `ui/button.tsx:25-33`, `ui/select.tsx:47`, `ui/textarea.tsx:10` | Añadir `min-h-[44px]` en móvil vía clase `md:h-8` + base `min-h-[44px]` o parche en globals.css para inputs/buttons/selects en viewports <768px |
| B2 | **Mapa** | Panel de filtros móvil (`absolute top-14`) y panel de lista móvil (`absolute bottom-0`) se superponen cuando ambos están abiertos. En 320px el filter panel + listing list ocupan >100% del contenedor. | Punto 1+3 (layout, mapa usable) | `map-explorer.tsx:92-103` y `115-127` | Cerrar un panel al abrir el otro; ajustar z-index o convertir a overlay único. |
| B3 | **Mapa** | Leyenda del mapa (`bottom-3 left-3`) queda tapada por el bottom sheet de la lista móvil (`absolute bottom-0`). | Punto 3 (controles visibles) | `map/listings-map.tsx` (MapLegend) + `map-explorer.tsx` | Mover MapLegend arriba de la bottom bar o darle margen inferior dinámico. |
| B4 | **Home hero** | Filtros móviles en home abren inline (no overlay), empujan el mapa hacia abajo y el usuario pierde contexto del mapa. | Punto 3 (filtros sin bloquear mapa) | `home-hero-map.tsx:147-148` el panel se muestra en flujo normal | Convertir `hidden`/`block` toggle a overlay absolute sobre el mapa. |
| B5 | **Modales** | `DialogContent` con `max-h-[90dvh]` en `listing-detail-modal` puede exceder viewport en 320px por el contenido denso (badges, descripción, footer de 3 botones). | Punto 6 (caben en viewport) | `listing-detail-modal.tsx:40` | Ajustar padding, reducir `max-h` en móvil o hacer scroll interno del content. |
| B6 | **Navbar** | Sheet móvil usa `w-72` (288px) → en 320px deja solo 32px de la página visible al fondo, sin indicación visual del contexto. | Punto 2 (menú accesible, sin solapamiento) | `navbar.tsx:87` | Usar `w-[calc(100vw-3rem)]` o similar para dejar ~48px del fondo visible. |
| B7 | **Mapa** | `ListingsMap` no configura Leaflet para evitar zoom accidental (`doubleClickZoom`, `tap` handler). Doble tap en marcador/popup puede hacer zoom no deseado. | Punto 5 (sin doble-tap zoom accidental) | `map/listings-map.tsx:137-141` MapContainer options | Añadir `doubleClickZoom={false}` y manejar `tap` para Leaflet en móvil. |

### 🟠 Major

| # | Ruta | Problema | DoD violado | Archivo:línea | Fix |
|---|------|----------|-------------|---------------|-----|
| M1 | Home hero | Secciones `h-[340px] sm:h-[420px]` → en 320px el mapa ocupa todo el viewport útil, el contenido de hero queda fuera del primer scroll. | Punto 1 (legible sin zoom) | `home-hero-map.tsx:135` | Reducir altura en móvil a `h-[280px]`. |
| M2 | Registro | Formulario largo sin scroll suave con teclado; submit no visible al hacer foco en campos inferiores. | Punto 4 (teclado no oculta submit) | `registro/page.tsx` | El layout usa `flex-1 flex-col justify-center` con padding `py-12`; en móvil con teclado el botón puede quedar oculto. No hay fix trivial sin JS de `visualViewport`, pero podemos asegurar scroll-behavior y padding-bottom extra. |

### 🟡 Minor

| # | Ruta | Problema | DoD violado | Archivo:línea | Fix |
|---|------|----------|-------------|---------------|-----|
| m1 | Mapa | `max-h-[60dvh]` en filter panel es ~192px en 320px; los 5 controles (search, near-me, type, category, state) apenas caben. | Punto 3 | `map-explorer.tsx:93` | Aumentar a `max-h-[70dvh]` en móvil o reducir padding. |
| m2 | Footer | Padding `px-6` inconsistente con navbar `px-4`. | Punto 1 | `site-footer.tsx:9` | Unificar a `px-4`. |
| m3 | Perfil | `grid-cols-2 gap-2 sm:grid-cols-3` para categorías → labels pequeños en móvil. | Punto 4 | `profile-form.tsx:159` | Aumentar gap y padding interno. |
| m4 | Admin | Tabla de métricas `grid-cols-2` → en 320px cada card de métrica es muy angosta. | Punto 1 | `admin-dashboard.tsx:113` | Usar `grid-cols-2` mejor que `grid-cols-3 lg:grid-cols-5` en móvil (ya es `grid-cols-2` en base, correcto). |

---

## Checklist definition_of_done (estado por punto)

1. **Layout** → ❌ Inputs 32px rompen consistencia; scroll horizontal no verificado; safe-area no implementado
2. **Navegación** → ❌ Sheet mide 288px en 320px (solo 32px de contexto visible)
3. **Mapa** → ❌ Filtros y lista se superponen; leyenda tapada; zoom accidental
4. **Formularios** → ❌ Targets <44px generalizados
5. **Interacción táctil** → ❌ Targets <44px; doble-tap zoom en mapa no mitigado
6. **Modales/sheets** → ❌ ListingDetailModal denso; Sheet muy ancho
7. **Rendimiento** → ✅ Loading states existen; no hay imágenes sin sizes
8. **Desktop intacto** → ✅ Por verificar tras cambios
9. **Verificación** → ❌ Playwright mobile-chrome no corrido; typecheck/lint no corrido
