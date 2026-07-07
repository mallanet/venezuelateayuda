/** Loading del directorio de profesionales — cabecera + cuadrícula. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 grid gap-3 text-center">
        <div className="vta-skeleton mx-auto h-9 w-72 rounded-lg" />
        <div className="vta-skeleton mx-auto h-4 w-96 rounded-full" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="vta-skeleton h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
