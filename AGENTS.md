<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:motion-system -->
# Motion system — Venezuela Te Ayuda

Single source of truth: `globals.css` CSS custom properties + CSS classes. No framer-motion.

## Tokens (—motion-*) defined in :root
- `--motion-ease-out`: cubic-bezier(0.22, 1, 0.36, 1) — entrada suave
- `--motion-ease-in-out`: cubic-bezier(0.45, 0, 0.55, 1) — transiciones simétricas
- `--motion-duration-fast`: 160ms — template enter, micro-feedback
- `--motion-duration-base`: 280ms — hover, active, detalles UI
- `--motion-duration-slow`: 520ms — modales, sheets, cambios de estado
- `--motion-duration-reveal`: 720ms — scroll-reveal (hero, secciones)
- `--motion-stagger-step`: 80ms — escalonamiento de .delay-*

## Clases CSS reutilizables
| Clase | Uso |
|-------|-----|
| `.reveal` | Scroll reveal con subida (opacity+translateY). Añadir `.delay-1`...`.delay-6`. |
| `.reveal-in` | Scroll reveal solo opacidad. |
| `.template-enter` | Fade-in de navegación entre rutas (template.tsx). |
| `.hover-lift` | Card hover: sube 4px y sombra elevada. |
| `.vta-skeleton` | Esqueleto con shimmer azul. |
| `.heartbeat` | Logo heartbeat en loading. |
| `.template-enter` | Fade-in de página (template.tsx). |

## Componentes
- `Reveal` (`src/components/reveal.tsx`): IntersectionObserver + transition. Usos: `as`, `delay`, `className`. Server pages usan `.reveal` CSS class directa.
- `template.tsx`: Server component con fade-in automático (160ms) — navbar y footer estables.

## Reglas
- `prefers-reduced-motion`: override global en `@layer base` → todo instantáneo.
- Leaflet: solo opacity en page transition (160ms, sin transform); no animar contenedor del mapa.
- Hover: usar `hover-lift` para consistencia, no clases ad-hoc.
- Transiciones CSS: animar solo `opacity` y `transform`, nunca `width`/`height`/`top`/`left`.
<!-- END:motion-system -->
