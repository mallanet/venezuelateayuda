import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegistroExitoPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
          <CardDescription>Tu cuenta fue creada correctamente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            Te enviamos un enlace de verificación a tu correo. Después de
            verificar tu email, nuestro equipo revisará tu cuenta antes de
            activarla — esto nos ayuda a mantener la comunidad segura.
          </p>
          <p>
            Recibirás acceso completo (publicar fichas y contactar personas)
            una vez que tu cuenta sea aprobada.
          </p>
          <Button asChild className="justify-self-start">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
