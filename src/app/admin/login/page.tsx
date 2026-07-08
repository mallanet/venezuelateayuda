"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await signIn("admin-credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (res?.error) {
        toast.error("Credenciales de administración inválidas");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-section-glow mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <div className="mb-8 flex justify-center">
        <Logotype size={44} showTagline />
      </div>

      <Card className="overflow-hidden border-border/60 shadow-elevated">
        <div className="accent-rule h-0.5 w-full" aria-hidden />
        <CardHeader className="pb-4 text-center">
          <p className="font-mono-tokens text-[11px] font-medium tracking-[0.18em] text-accent uppercase">
            Mallanet · Moderación
          </p>
          <CardTitle className="font-display text-2xl font-semibold text-primary">
            Acceso administración
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Panel separado del login público. Solo cuentas con rol ADMIN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Usuario</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@mallanet.org"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Entrar al panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
