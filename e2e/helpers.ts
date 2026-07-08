import { PrismaClient } from "@prisma/client";
import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://vta:vta_dev@localhost:5433/venezuelateayuda";

export const prisma = new PrismaClient({ datasourceUrl: DATABASE_URL });

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@mallanet.org";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin-vta-2026";
export const TEST_PASSWORD = "password-e2e-123";

/** Genera un email único para aislar los tests que corren en paralelo. */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.test`;
}

/**
 * Registra un usuario vía API y verifica su email usando el enlace real
 * de verificación. Devuelve el email creado.
 */
export async function registerAndVerifyUser(
  request: APIRequestContext,
  options: { email: string; role: "AYUDANTE" | "SOLICITANTE"; displayName: string }
) {
  const res = await request.post("/api/register", {
    data: {
      email: options.email,
      password: TEST_PASSWORD,
      role: options.role,
      displayName: options.displayName,
      phone: "",
      state: "Miranda",
      municipality: "Chacao",
      acceptTerms: true,
    },
  });
  expect(res.status()).toBe(201);

  const user = await prisma.user.findUniqueOrThrow({
    where: { email: options.email },
    include: { verificationTokens: true },
  });
  const token = user.verificationTokens[0]?.token;
  expect(token).toBeTruthy();

  const verifyRes = await request.get(`/api/verify-email?token=${token}`);
  expect(verifyRes.ok()).toBeTruthy();
}

/** Aprueba una cuenta directamente en la base de datos (atajo de setup). */
export async function approveUserInDb(email: string) {
  await prisma.user.update({ where: { email }, data: { status: "APROBADO" } });
}

/** Inicia sesión a través del formulario de login público. */
export async function login(page: Page, email: string, password: string = TEST_PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/mapa");
}

/** Login del panel de administración (ruta separada). */
export async function adminLogin(
  page: Page,
  email: string = ADMIN_EMAIL,
  password: string = ADMIN_PASSWORD
) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuario").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar al panel" }).click();
  await page.waitForURL("**/admin");
}

/** Crea una ficha directamente en la base de datos para setup de tests. */
export async function createListingInDb(options: {
  email: string;
  title: string;
  type: "OFREZCO" | "NECESITO";
  status?: "PENDIENTE" | "APROBADA";
}) {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: options.email } });
  return prisma.helpListing.create({
    data: {
      userId: user.id,
      type: options.type,
      title: options.title,
      description: "Descripción de prueba end-to-end con detalle suficiente.",
      category: "ALIMENTOS",
      state: "Miranda",
      municipality: "Chacao",
      lat: 10.49,
      lng: -66.85,
      status: options.status ?? "APROBADA",
    },
  });
}
