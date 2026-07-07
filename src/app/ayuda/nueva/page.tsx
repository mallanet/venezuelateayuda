"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { StateMunicipalitySelect } from "@/components/state-municipality-select";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { MODALITY_LABELS, QUANTITY_UNITS, QUANTITY_UNIT_LABELS } from "@/lib/listing-meta";
import { ABROAD_STATE, abroadMapPosition, isAbroadState } from "@/lib/abroad";
import { VENEZUELA_CENTER, getState } from "@/lib/venezuela";
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
        setPosition(abroadMapPosition(session.user.id));
      })
      .catch(() => {});
  }, [session?.user?.id]);

  function handleStateChange(newState: string) {
    setState(newState);
    const info = getState(newState);
    if (info) setPosition({ lat: info.lat, lng: info.lng });
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Publicar ficha de ayuda</CardTitle>
          <CardDescription>
            Tu ficha será revisada por nuestro equipo antes de aparecer en el
            mapa. Usa una ubicación aproximada: nunca publiques tu dirección
            exacta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.user.status !== "APROBADO" && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Tu cuenta aún está en revisión. Podrás publicar fichas cuando sea
              aprobada por nuestro equipo.
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-5">
            {isAbroadProfile && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                Publicas como ayudante en el exterior ({municipality}). Tu ficha será online y
                aparecerá en el mapa internacional.
              </div>
            )}

            {!isAbroadProfile && (
            <div className="grid gap-2">
              <Label>Tipo de ficha</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  data-testid="type-ofrezco"
                  onClick={() => setType("OFREZCO")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    type === "OFREZCO"
                      ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">Ofrezco ayuda</div>
                </button>
                <button
                  type="button"
                  data-testid="type-necesito"
                  onClick={() => setType("NECESITO")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    type === "NECESITO"
                      ? "border-rose-600 bg-rose-50 ring-1 ring-rose-600"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">Necesito ayuda</div>
                </button>
              </div>
            </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej.: Ofrezco transporte a citas médicas en Chacao"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={category || undefined} onValueChange={setCategory}>
                <SelectTrigger id="categoria" data-testid="select-categoria" className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="z-[1300]">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
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
                <Label>Modalidad</Label>
                {isAbroadProfile ? (
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {MODALITY_LABELS.ONLINE} (ayuda desde el exterior)
                  </p>
                ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="modality-presencial"
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
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe qué ofreces o necesitas, con qué frecuencia y cualquier detalle útil. No incluyas datos personales."
                required
                minLength={20}
                maxLength={2000}
                rows={5}
              />
            </div>

            {!isAbroadProfile && (
              <StateMunicipalitySelect
                state={state}
                municipality={municipality}
                onStateChange={handleStateChange}
                onMunicipalityChange={setMunicipality}
              />
            )}

            {!isAbroadProfile && (
            <div className="grid gap-2">
              <Label>Ubicación aproximada (arrastra el pin o haz clic en el mapa)</Label>
              <div className="h-72 overflow-hidden rounded-lg border" data-testid="map-picker">
                <MapPicker
                  lat={position.lat}
                  lng={position.lng}
                  zoom={state ? 12 : 6}
                  onChange={(lat, lng) => setPosition({ lat, lng })}
                />
              </div>
            </div>
            )}

            <Button
              type="submit"
              disabled={
                loading ||
                !category ||
                (!isAbroadProfile && (!state || !municipality)) ||
                (isAbroadProfile && !municipality) ||
                session.user.status !== "APROBADO"
              }
            >
              {loading ? "Enviando..." : "Enviar para revisión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
