"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "ok") toast.success("Email verificado correctamente. Ya puedes iniciar sesión.");
    if (verified === "expired") toast.error("El enlace de verificación expiró. Regístrate de nuevo o contacta soporte.");
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
        toast.error("Email o contraseña incorrectos");
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

  return (
    <>
      <div className="mb-8 flex justify-center">
        <Logotype size={44} showTagline />
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-4 text-center">
          <CardTitle className="font-heading text-2xl text-primary">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Accede a tu cuenta de Venezuela Te Ayuda.
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
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Escribe tu contraseña"
                className="focus-visible:ring-accent"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="font-medium text-accent underline-offset-2 hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
