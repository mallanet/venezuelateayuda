"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logotype } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMunicipalitySelect } from "@/components/state-municipality-select";
import { AbroadHelperFields } from "@/components/abroad-helper-fields";
import { ABROAD_STATE } from "@/lib/abroad";
import { cn } from "@/lib/utils";

type RoleOption = "AYUDANTE" | "SOLICITANTE";

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>("AYUDANTE");
  const [state, setState] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [isAbroad, setIsAbroad] = useState(false);
  const [country, setCountry] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          displayName: form.get("displayName"),
          phone: form.get("phone") || "",
          role,
          state: isAbroad ? ABROAD_STATE : state,
          municipality: isAbroad ? country.trim() : municipality,
          acceptTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo completar el registro");
        return;
      }
      toast.success("Cuenta creada. Revisa tu email para verificarla.");
      router.push("/registro/exito");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Logotype size={44} showTagline />
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="font-heading text-2xl text-primary">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Únete a la red de ayuda mutua. Tu cuenta será revisada por nuestro
            equipo antes de activarse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label>¿Cómo quieres participar?</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  data-testid="role-ayudante"
                  onClick={() => {
                    setRole("AYUDANTE");
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 text-left transition-all",
                    role === "AYUDANTE"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border/60 hover:border-accent/40"
                  )}
                >
                  <div className="font-heading font-medium text-primary">Quiero ayudar</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Ofrezco tiempo, recursos o conocimientos
                  </div>
                </button>
                <button
                  type="button"
                  data-testid="role-solicitante"
                  onClick={() => {
                    setRole("SOLICITANTE");
                    setIsAbroad(false);
                    setCountry("");
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 text-left transition-all",
                    role === "SOLICITANTE"
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border/60 hover:border-accent/40"
                  )}
                >
                  <div className="font-heading font-medium text-primary">Necesito ayuda</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Busco apoyo en mi zona
                  </div>
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="displayName">Nombre</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Tu nombre (solo el nombre de pila será público)"
                className="focus-visible:ring-accent"
                required
                minLength={2}
                maxLength={60}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="focus-visible:ring-accent"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="focus-visible:ring-accent"
                required
                minLength={8}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono (opcional, nunca se muestra en público)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+58 412 0000000"
                className="focus-visible:ring-accent"
                maxLength={20}
              />
            </div>

            {role === "AYUDANTE" && (
              <AbroadHelperFields
                isAbroad={isAbroad}
                country={country}
                onIsAbroadChange={(value) => {
                  setIsAbroad(value);
                  if (!value) {
                    setCountry("");
                  } else {
                    setState("");
                    setMunicipality("");
                  }
                }}
                onCountryChange={setCountry}
              />
            )}

            {!isAbroad && (
              <StateMunicipalitySelect
                state={state}
                municipality={municipality}
                onStateChange={setState}
                onMunicipalityChange={setMunicipality}
              />
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                data-testid="checkbox-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug text-muted-foreground">
                Acepto los{" "}
                <Link href="/legal/terminos" className="font-medium text-accent underline-offset-2 hover:underline" target="_blank">
                  términos de uso
                </Link>{" "}
                y la{" "}
                <Link href="/legal/privacidad" className="font-medium text-accent underline-offset-2 hover:underline" target="_blank">
                  política de privacidad
                </Link>
                .
              </Label>
            </div>

            <Button
              type="submit"
              disabled={
                loading ||
                !acceptTerms ||
                (isAbroad ? country.trim().length < 2 : !state || !municipality)
              }
              className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium text-accent underline-offset-2 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
