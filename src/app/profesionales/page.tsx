import { ProfessionalsDirectory } from "@/components/professionals-directory";

export const metadata = {
  title: "Profesionales verificados | Venezuela Te Ayuda",
  description:
    "Directorio de ayudantes verificados en Venezuela. Filtra por nombre, categoría y zona.",
};

export default function ProfesionalesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border/40 bg-gradient-to-b from-primary/[0.08] to-background px-4 py-14 text-center sm:py-20">
        <div className="mx-auto grid max-w-3xl gap-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Directorio
          </h1>
          <p className="text-muted-foreground">
            Ayudantes verificados que ya publicaron fichas activas. Encuentra
            quién puede apoyarte en tu zona.
          </p>
        </div>
      </section>
      <ProfessionalsDirectory />
    </div>
  );
}
