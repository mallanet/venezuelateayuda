/** Loading de la bandeja de mensajes — tarjeta + lista de conversaciones. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft">
        <div className="border-b border-border/40 p-6">
          <div className="vta-skeleton h-7 w-40 rounded-lg" />
        </div>
        <div className="grid gap-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vta-skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
