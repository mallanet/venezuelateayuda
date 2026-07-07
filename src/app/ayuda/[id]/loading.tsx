/** Loading de detalle de ficha — tarjeta con banda dorada y mini-mapa. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="vta-skeleton mb-8 h-4 w-32 rounded-full" />
      <div className="overflow-hidden rounded-2xl border border-accent/10 bg-card shadow-elevated">
        <div className="h-1.5 w-full accent-rule" />
        <div className="grid gap-6 p-6">
          <div className="flex flex-wrap gap-2">
            <div className="vta-skeleton h-6 w-28 rounded-full" />
            <div className="vta-skeleton h-6 w-24 rounded-full" />
            <div className="vta-skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="vta-skeleton h-8 w-[min(100%,420px)] rounded-lg" />
          <div className="vta-skeleton h-4 w-[min(100%,360px)] rounded-full" />
          <div className="vta-skeleton mt-2 h-40 w-full rounded-xl" />
          <div className="vta-skeleton h-48 w-full rounded-xl" />
          <div className="flex gap-3">
            <div className="vta-skeleton h-10 flex-1 rounded-lg" />
            <div className="vta-skeleton h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
