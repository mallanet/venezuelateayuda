"use client";

import Link from "next/link";
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

export default function RecuperarPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo enviar el email");
        return;
      }
      setSent(true);
      toast.success("Si la cuenta existe, enviamos un enlace a tu email.");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
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
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Te enviamos un enlace para crear una nueva contraseña. También sirve
              si nunca llegó el email de verificación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="grid gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Revisa tu bandeja (y spam). El enlace expira en 1 hora.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/login">Volver a iniciar sesión</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
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
                <Button type="submit" disabled={loading} className="w-full shadow-soft">
                  {loading ? "Enviando..." : "Enviar enlace"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="font-medium text-accent link-underline">
                    Volver a iniciar sesión
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
