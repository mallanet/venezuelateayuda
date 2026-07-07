/** Loading del explorador de mapa — panel lateral + área de mapa contenida. */
export default function Loading() {
  return (
    <div className="bg-section-glow flex flex-1 flex-col" data-testid="map-explorer">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="hidden overflow-y-auto rounded-2xl border border-border/60 bg-card p-5 shadow-soft lg:flex lg:flex-col lg:gap-4">
            <div className="vta-skeleton h-5 w-32 rounded-md" />
            <div className="vta-skeleton h-9 w-full rounded-xl" />
            <div className="vta-skeleton h-9 w-full rounded-xl" />
            <div className="vta-skeleton h-9 w-full rounded-xl" />
            <div className="vta-skeleton h-9 w-full rounded-xl" />
            <div className="vta-skeleton mt-4 h-5 w-20 rounded-md" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="vta-skeleton h-28 w-full rounded-xl" />
            ))}
          </aside>
          <div className="vta-skeleton h-[420px] rounded-2xl sm:h-[480px] lg:h-[560px]" />
        </div>
      </div>
    </div>
  );
}
