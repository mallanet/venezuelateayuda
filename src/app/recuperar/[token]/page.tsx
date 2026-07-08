"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Logotype } from "@/components/logo";
import { Reveal } from "@/components/reveal";
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

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const token = params.token;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo actualizar la contraseña");
        return;
      }
      toast.success("Contraseña actualizada. Ya puedes iniciar sesión.");
      router.push("/login?verified=ok");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-16 text-center">
        <p className="text-muted-foreground">Enlace inválido.</p>
        <Button asChild className="mt-4">
          <Link href="/recuperar">Solicitar uno nuevo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-section-glow mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 flex justify-center">
        <Logotype size={44} showTagline />
      </div>

      <Reveal variant="in">
        <Card className="overflow-hidden border-border/60 shadow-elevated">
          <div className="accent-rule h-0.5 w-full" aria-hidden />
          <CardHeader className="pb-4 text-center">
            <CardTitle className="font-display text-2xl font-semibold text-primary">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Elige una contraseña de al menos 8 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  className="focus-visible:ring-accent"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirmar contraseña</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  minLength={8}
                  className="focus-visible:ring-accent"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full shadow-soft">
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
