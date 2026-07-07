import { Logo } from "@/components/logo";

/**
 * Loading de raíz — shell marcado con esqueletos navy/oro.
 * Se muestra al navegar entre segmentos mientras se resuelve el contenido.
 */
export default function Loading() {
  return (
    <div className="bg-section-glow flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="heartbeat">
            <Logo size={56} alt="Venezuela Te Ayuda" />
          </span>
          <div className="vta-skeleton h-3 w-40 rounded-full" />
        </div>

        <div className="grid gap-3">
          <div className="vta-skeleton mx-auto h-10 w-[min(100%,520px)] rounded-2xl" />
          <div className="vta-skeleton mx-auto h-4 w-[min(100%,420px)] rounded-full" />
        </div>

        <div className="mx-auto mt-2 flex gap-3">
          <div className="vta-skeleton h-10 w-36 rounded-lg" />
          <div className="vta-skeleton h-10 w-36 rounded-lg" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="vta-skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
