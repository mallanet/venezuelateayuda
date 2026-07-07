import { ProfessionalsDirectory } from "@/components/professionals-directory";

export const metadata = {
  title: "Profesionales verificados | Venezuela Te Ayuda",
  description:
    "Directorio de ayudantes verificados en Venezuela. Filtra por nombre, categoría y zona.",
};

export default function ProfesionalesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border/40 bg-section-glow px-4 py-14 text-center sm:py-16">
        <div className="mx-auto grid max-w-3xl gap-3">
          <span className="reveal delay-1 font-mono-tokens text-xs font-medium tracking-[0.18em] text-accent uppercase">
            Profesionales verificados
          </span>
          <h1 className="reveal delay-2 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Directorio
          </h1>
          <p className="reveal delay-3 text-muted-foreground">
            Ayudantes verificados que ya publicaron fichas activas. Encuentra
            quién puede apoyarte en tu zona.
          </p>
        </div>
      </section>
      <ProfessionalsDirectory />
    </div>
  );
}
