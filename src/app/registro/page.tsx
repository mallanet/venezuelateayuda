"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

type RoleOption = "AYUDANTE" | "SOLICITANTE";

export default function RegistroPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>("AYUDANTE");
  const [state, setState] = useState("");
  const [municipality, setMunicipality] = useState("");
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
          state,
          municipality,
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Únete a la red de ayuda mutua. Tu cuenta será revisada por nuestro
            equipo antes de activarse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label>¿Cómo quieres participar?</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  data-testid="role-ayudante"
                  onClick={() => setRole("AYUDANTE")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    role === "AYUDANTE"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">Quiero ayudar</div>
                  <div className="text-sm text-muted-foreground">
                    Ofrezco tiempo, recursos o conocimientos
                  </div>
                </button>
                <button
                  type="button"
                  data-testid="role-solicitante"
                  onClick={() => setRole("SOLICITANTE")}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    role === "SOLICITANTE"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="font-medium">Necesito ayuda</div>
                  <div className="text-sm text-muted-foreground">
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
                required
                minLength={2}
                maxLength={60}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono (opcional, nunca se muestra en público)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+58 412 0000000" maxLength={20} />
            </div>

            <StateMunicipalitySelect
              state={state}
              municipality={municipality}
              onStateChange={setState}
              onMunicipalityChange={setMunicipality}
            />

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                data-testid="checkbox-terms"
                checked={acceptTerms}
                onCheckedChange={(v) => setAcceptTerms(v === true)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-snug">
                Acepto los{" "}
                <Link href="/legal/terminos" className="underline" target="_blank">
                  términos de uso
                </Link>{" "}
                y la{" "}
                <Link href="/legal/privacidad" className="underline" target="_blank">
                  política de privacidad
                </Link>
                .
              </Label>
            </div>

            <Button type="submit" disabled={loading || !acceptTerms || !state || !municipality}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
