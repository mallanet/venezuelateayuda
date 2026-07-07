/** Leyenda flotante del mapa: azul (ofrezco), rojo (necesito), amarillo (exterior/online). */
export function MapLegend() {
  return (
    <div
      className="absolute bottom-16 left-3 z-[1000] rounded-xl border border-border/60 bg-background/95 px-3.5 py-2.5 text-xs shadow-elevated backdrop-blur lg:bottom-3"
      data-testid="map-legend"
      aria-label="Leyenda del mapa"
    >
      <p className="mb-2 font-display text-sm font-semibold text-primary">Zonas de ayuda</p>
      <ul className="grid gap-1.5">
        <li className="flex items-center gap-2">
          <span
            className="size-3 rounded-full border-2 border-[#0E6BCB] bg-[#0E6BCB]/40"
            aria-hidden
          />
          <span className="text-foreground">Ofrezco ayuda</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-3 rounded-full border-2 border-[#C94C3E] bg-[#C94C3E]/40"
            aria-hidden
          />
          <span className="text-foreground">Necesito ayuda</span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="size-3 rounded-full border-2 border-[#FFCC00] bg-[#FFCC00]/50"
            aria-hidden
          />
          <span className="text-foreground">Ayuda online desde el exterior</span>
        </li>
      </ul>
    </div>
  );
}
