"use client";

import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegistroExitoPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Escribe el email con el que te registraste");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo reenviar");
        return;
      }
      toast.success("Si la cuenta no está verificada, enviamos un nuevo enlace.");
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-section-glow flex flex-1 items-center px-4 py-16">
      <Card className="mx-auto w-full max-w-lg shadow-elevated">
        <div className="flag-rule h-1 w-full" aria-hidden />
        <CardHeader className="border-b border-border/50">
          <span className="kicker">Cuenta creada</span>
          <CardTitle as="h1" className="text-3xl text-primary">Revisa tu email</CardTitle>
          <CardDescription>Tu cuenta fue creada correctamente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            Te enviamos un enlace de verificación a tu correo. Después de
            verificar tu email, nuestro equipo revisará tu cuenta antes de
            activarla — esto nos ayuda a mantener la comunidad segura.
          </p>
          <p>
            Si no llegó el correo, revisa spam o reenvíalo aquí. También puedes{" "}
            <Link href="/recuperar" className="font-medium text-accent link-underline">
              recuperar tu contraseña
            </Link>{" "}
            (eso también verifica el email).
          </p>
          <form onSubmit={handleResend} className="grid gap-3 rounded-lg bg-secondary/70 p-4">
            <Label htmlFor="resend-email" className="text-foreground">
              Reenviar verificación
            </Label>
            <Input
              id="resend-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="outline" disabled={loading}>
              {loading ? "Enviando..." : "Reenviar email"}
            </Button>
          </form>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
