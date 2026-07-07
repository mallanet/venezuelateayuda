/** Loading del panel de administración — métricas + pestañas. */
export default function Loading() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10">
      <div className="vta-skeleton h-8 w-64 rounded-lg" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="vta-skeleton h-24 rounded-xl" />
        ))}
      </div>
      <div className="vta-skeleton h-10 w-72 rounded-xl" />
      <div className="vta-skeleton h-96 w-full rounded-xl" />
    </div>
  );
}
