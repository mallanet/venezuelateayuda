"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/logo";
import { StateMunicipalitySelect } from "@/components/state-municipality-select";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { MODALITY_LABELS, QUANTITY_UNITS, QUANTITY_UNIT_LABELS } from "@/lib/listing-meta";
import { ABROAD_STATE, abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { VENEZUELA_CENTER, getZoneCoords } from "@/lib/venezuela";
import { cn } from "@/lib/utils";

const MapPicker = dynamic(() => import("@/components/map/map-picker"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

type ListingTypeOption = "OFREZCO" | "NECESITO";

export default function NuevaFichaPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [type, setType] = useState<ListingTypeOption>("OFREZCO");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [position, setPosition] = useState(VENEZUELA_CENTER);
  const [quantityUnit, setQuantityUnit] = useState("UNIDAD");
  const [modality, setModality] = useState<"PRESENCIAL" | "ONLINE">("PRESENCIAL");
  const [isAbroadProfile, setIsAbroadProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: { profile?: { state: string; municipality: string } }) => {
        if (!data.profile || !isAbroadState(data.profile.state)) return;
        setIsAbroadProfile(true);
        setType("OFREZCO");
        setModality("ONLINE");
        setState(ABROAD_STATE);
        setMunicipality(data.profile.municipality);
        setPosition(abroadMapPosition(data.profile.municipality, session.user.id));
      })
      .catch(() => {});
  }, [session?.user?.id]);

  function handleStateChange(newState: string) {
    setState(newState);
    const coords = getZoneCoords(newState);
    if (coords) setPosition(coords);
  }

  function handleMunicipalityChange(newMunicipality: string) {
    setMunicipality(newMunicipality);
    const coords = getZoneCoords(state, newMunicipality);
    if (coords) setPosition(coords);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: form.get("title"),
          description: form.get("description"),
          category,
          state,
          municipality,
          lat: position.lat,
          lng: position.lng,
          quantity: Number(form.get("quantity")),
          quantityUnit,
          modality,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo crear la ficha");
        return;
      }
      toast.success("Ficha enviada. Será visible en el mapa cuando sea aprobada.");
      router.push("/perfil");
    } finally {
      setLoading(false);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
          <Logo size={24} />
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold text-primary">
            Publicar ficha de ayuda
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu ficha será revisada antes de aparecer en el mapa
          </p>
        </div>
      </div>

      <Card className="shadow-elevated">
        <CardContent className="pt-6">
          {session.user.status !== "APROBADO" && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-foreground">
              <Clock className="size-4 shrink-0 text-accent" />
              Tu cuenta aún está en revisión. Podrás publicar fichas cuando sea
              aprobada por nuestro equipo.
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-6">
            {isAbroadProfile && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                Publicas como ayudante en el exterior ({municipality}). Tu ficha será online y
                aparecerá en el mapa internacional.
              </div>
            )}

            {!isAbroadProfile && (
            <div className="grid gap-2">
              <Label id="listing-type-label" className="font-heading text-sm font-semibold">Tipo de ficha</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-labelledby="listing-type-label">
                <button
                  type="button"
                  data-testid="type-ofrezco"
                  aria-pressed={type === "OFREZCO"}
                  onClick={() => setType("OFREZCO")}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    type === "OFREZCO"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="font-heading font-medium text-primary">Ofrezco ayuda</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Comparte tu tiempo, recursos o habilidades
                  </p>
                </button>
                <button
                  type="button"
                  data-testid="type-necesito"
                  aria-pressed={type === "NECESITO"}
                  onClick={() => setType("NECESITO")}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    type === "NECESITO"
                      ? "border-destructive bg-destructive/5 shadow-sm"
                      : "border-border bg-card hover:border-destructive/30"
                  )}
                >
                  <div className="font-heading font-medium text-destructive">Necesito ayuda</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Busca apoyo de la comunidad
                  </p>
                </button>
              </div>
            </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title" className="font-heading text-sm font-semibold">
                Título
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej.: Ofrezco transporte a citas médicas en Chacao"
                required
                minLength={5}
                maxLength={100}
                className="border-accent/20 focus-visible:ring-accent"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria" className="font-heading text-sm font-semibold">
                Categoría
              </Label>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger id="categoria" data-testid="select-categoria" className="w-full border-accent/20 focus:ring-accent">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="z-[1300]">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  max={9999}
                  defaultValue={1}
                  required
                  data-testid="input-quantity"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantityUnit">Unidad</Label>
                <Select value={quantityUnit} onValueChange={setQuantityUnit}>
                  <SelectTrigger id="quantityUnit" data-testid="select-quantity-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[1300]">
                    {QUANTITY_UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {QUANTITY_UNIT_LABELS[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label id="modality-label">Modalidad</Label>
                {isAbroadProfile ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {MODALITY_LABELS.ONLINE} (ayuda desde el exterior)
                  </p>
                ) : (
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="modality-label">
                  <button
                    type="button"
                    data-testid="modality-presencial"
                    aria-pressed={modality === "PRESENCIAL"}
                    onClick={() => setModality("PRESENCIAL")}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-colors",
                      modality === "PRESENCIAL"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {MODALITY_LABELS.PRESENCIAL}
                  </button>
                  <button
                    type="button"
                    data-testid="modality-online"
                    aria-pressed={modality === "ONLINE"}
                    onClick={() => setModality("ONLINE")}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm transition-colors",
                      modality === "ONLINE"
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {MODALITY_LABELS.ONLINE}
                  </button>
                </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="font-heading text-sm font-semibold">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe qué ofreces o necesitas, con qué frecuencia y cualquier detalle útil. No incluyas datos personales."
                required
                minLength={20}
                maxLength={2000}
                rows={5}
                className="border-accent/20 focus-visible:ring-accent"
              />
            </div>

            {!isAbroadProfile && (
              <StateMunicipalitySelect
                state={state}
                municipality={municipality}
                onStateChange={handleStateChange}
                onMunicipalityChange={handleMunicipalityChange}
              />
            )}

            {!isAbroadProfile && (
            <div className="grid gap-2">
              <Label className="font-heading text-sm font-semibold">
                Ubicación aproximada
              </Label>
              <p className="text-xs text-muted-foreground">
                Arrastra el pin o haz clic en el mapa
              </p>
              <div className="h-72 overflow-hidden rounded-xl border border-accent/20" data-testid="map-picker">
                <MapPicker
                  lat={position.lat}
                  lng={position.lng}
                  zoom={state ? 12 : 6}
                  onChange={(lat, lng) => setPosition({ lat, lng })}
                />
              </div>
            </div>
            )}

            <div className="border-t border-accent/10 pt-4">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !category ||
                  (!isAbroadProfile && (!state || !municipality)) ||
                  (isAbroadProfile && !municipality) ||
                  session.user.status !== "APROBADO"
                }
                className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
              >
                {loading ? "Enviando..." : "Enviar para revisión"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
