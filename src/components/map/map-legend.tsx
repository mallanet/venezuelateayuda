/** Leyenda flotante del mapa: zonas azul (ofrezco) y rojo (necesito). */
export function MapLegend() {
  return (
    <div
      className="absolute bottom-3 left-3 z-[1000] rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-md backdrop-blur"
      data-testid="map-legend"
      aria-label="Leyenda del mapa"
    >
      <p className="mb-1.5 font-medium text-foreground">Zonas de ayuda</p>
      <ul className="grid gap-1">
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border-2 border-blue-600 bg-blue-500/40"
            aria-hidden
          />
          <span>Ofrezco ayuda (azul)</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border-2 border-red-600 bg-red-500/40"
            aria-hidden
          />
          <span>Necesito ayuda (rojo)</span>
        </li>
        <li className="flex items-center gap-2 text-muted-foreground">
          <span
            className="h-3 w-3 rounded-full border-2 border-violet-600 bg-violet-500/40"
            aria-hidden
          />
          <span>Donde se solapan las zonas</span>
        </li>
      </ul>
    </div>
  );
}
