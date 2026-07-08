"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B1F33] px-4 py-16">
      <Card className="w-full max-w-md border-white/10 bg-[#102A44] text-white shadow-elevated">
        <CardHeader className="pb-4 text-center">
          <p className="font-mono-tokens text-xs tracking-[0.18em] text-sky-300 uppercase">
            Mallanet · Moderación
          </p>
          <CardTitle className="font-display text-2xl font-semibold text-white">
            Acceso administración
          </CardTitle>
          <CardDescription className="text-white/65">
            Panel separado del login público de Venezuela Te Ayuda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white/80">
                Usuario
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@mallanet.org"
                className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white/80">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 text-white hover:bg-sky-400"
            >
              {loading ? "Entrando..." : "Entrar al panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
