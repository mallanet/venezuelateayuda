import { ProfessionalsDirectory } from "@/components/professionals-directory";

export const metadata = {
  title: "Profesionales verificados | Venezuela Te Ayuda",
  description:
    "Directorio de ayudantes verificados en Venezuela. Filtra por nombre, categoría y zona.",
};

export default function ProfesionalesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-primary/15 to-background px-4 py-14 text-center">
        <div className="mx-auto grid max-w-3xl gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Directorio
          </h1>
          <p className="text-muted-foreground">
            Ayudantes verificados que ya publicaron fichas activas. Encuentra quién puede
            apoyarte en tu zona.
          </p>
        </div>
      </section>
      <ProfessionalsDirectory />
    </div>
  );
}
