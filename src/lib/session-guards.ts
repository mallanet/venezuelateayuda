import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { apiErrorResponse, ApiErrorCode } from "@/lib/api-error";

export type SessionUser = Session["user"];

type GuardSuccess = { user: SessionUser; error: null };
type GuardFailure = { user: null; error: ReturnType<typeof apiErrorResponse> };

export async function getSessionUser(options?: {
  requireApproved?: boolean;
}): Promise<GuardSuccess | GuardFailure> {
  const session = await auth();
  if (!session?.user) {
    return {
      user: null,
      error: apiErrorResponse(ApiErrorCode.UNAUTHORIZED, "Debes iniciar sesión", 401),
    };
  }
  if (session.user.status === "SUSPENDIDO") {
    return {
      user: null,
      error: apiErrorResponse(ApiErrorCode.FORBIDDEN, "Tu cuenta está suspendida", 403),
    };
  }
  if (options?.requireApproved && session.user.status !== "APROBADO") {
    return {
      user: null,
      error: apiErrorResponse(
        ApiErrorCode.FORBIDDEN,
        "Tu cuenta aún está en revisión. Podrás usar esta función cuando sea aprobada.",
        403
      ),
    };
  }
  return { user: session.user, error: null };
}

export async function getAdminUser(): Promise<GuardSuccess | GuardFailure> {
  const session = await auth();
  if (!session?.user) {
    return {
      user: null,
      error: apiErrorResponse(ApiErrorCode.UNAUTHORIZED, "Debes iniciar sesión", 401),
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      user: null,
      error: apiErrorResponse(ApiErrorCode.FORBIDDEN, "Acceso restringido", 403),
    };
  }
  return { user: session.user, error: null };
}
