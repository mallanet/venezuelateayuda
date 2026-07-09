"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "ok") toast.success("Email verificado correctamente. Ya puedes iniciar sesión.");
    if (verified === "expired") {
      toast.error("El enlace expiró. Usa «Reenviar verificación» o recupera tu contraseña.");
    }
    if (verified === "error") toast.error("Enlace de verificación inválido.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (res?.error) {
        toast.error(
          "No se pudo iniciar sesión. Revisa email/contraseña o verifica tu correo primero."
        );
        return;
      }
      router.push("/mapa");
      router.refresh();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Escribe tu email primero");
      return;
    }
    setResending(true);
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
      setResending(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex justify-center">
        <Logotype size={44} showTagline />
      </div>

      <Reveal variant="in">
      <Card className="overflow-hidden border-border/60 shadow-elevated">
        <div className="accent-rule h-0.5 w-full" aria-hidden />
        <CardHeader className="pb-4 text-center">
          <CardTitle className="font-display text-2xl font-semibold text-primary">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Verifica tu email para entrar. La cuenta queda en revisión hasta que el equipo la apruebe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                className="focus-visible:ring-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/recuperar"
                  className="text-xs font-medium text-accent underline-offset-2 link-underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Escribe tu contraseña"
                className="focus-visible:ring-accent"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full cursor-pointer shadow-soft">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={resending}
              onClick={handleResend}
              className="w-full"
            >
              {resending ? "Enviando..." : "Reenviar verificación"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                href="/registro"
                className="font-medium text-accent underline-offset-2 link-underline"
              >
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </Reveal>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-section-glow mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
