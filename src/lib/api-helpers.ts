import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

export type SessionUser = Session["user"];

/**
 * Obtiene el usuario autenticado o devuelve una respuesta 401.
 * Con requireApproved, exige además que la cuenta esté aprobada por un admin.
 */
export async function getSessionUser(options?: { requireApproved?: boolean }) {
  const session = await auth();
  if (!session?.user) {
    return { user: null, error: NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 }) };
  }
  if (session.user.status === "SUSPENDIDO") {
    return { user: null, error: NextResponse.json({ error: "Tu cuenta está suspendida" }, { status: 403 }) };
  }
  if (options?.requireApproved && session.user.status !== "APROBADO") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Tu cuenta aún está en revisión. Podrás usar esta función cuando sea aprobada." },
        { status: 403 }
      ),
    };
  }
  return { user: session.user, error: null };
}

/** Obtiene el usuario autenticado si es admin, o una respuesta 401/403. */
export async function getAdminUser() {
  const session = await auth();
  if (!session?.user) {
    return { user: null, error: NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { user: null, error: NextResponse.json({ error: "Acceso restringido" }, { status: 403 }) };
  }
  return { user: session.user, error: null };
}
