import { test, expect } from "@playwright/test";
import { login, prisma, uniqueEmail, TEST_PASSWORD } from "./helpers";

test.describe("Registro y verificación de cuenta", () => {
  test("una persona puede registrarse por la interfaz, verificar su email e iniciar sesión con la cuenta en revisión", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("registro");

    await page.goto("/registro");
    await page.getByTestId("role-ayudante").click();
    await page.getByLabel("Nombre").fill("Ana Prueba");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill(TEST_PASSWORD);
    await page.getByTestId("select-estado").click();
    await page.getByRole("option", { name: "Miranda" }).click();
    await page.getByTestId("select-municipio").click();
    await page.getByRole("option", { name: "Chacao" }).click();
    await page.getByTestId("checkbox-terms").click();
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await page.waitForURL("**/registro/exito");
    await expect(page.getByText("Revisa tu email", { exact: true })).toBeVisible();

    const user = await prisma.user.findUniqueOrThrow({
      where: { email },
      include: { verificationTokens: true },
    });
    expect(user.status).toBe("PENDIENTE");
    expect(user.role).toBe("AYUDANTE");
    expect(user.emailVerified).toBeNull();

    const verificationToken = user.verificationTokens[0]?.token;
    expect(verificationToken).toBeTruthy();

    const verifyRes = await request.get(`/api/verify-email?token=${verificationToken}`);
    expect(verifyRes.ok()).toBeTruthy();

    await login(page, email);
    await page.goto("/perfil");
    await expect(page.getByTestId("account-status")).toContainText("En revisión");
  });

  test("no se puede registrar dos veces el mismo email", async ({ request }) => {
    const email = uniqueEmail("duplicado");
    const payload = {
      email,
      password: TEST_PASSWORD,
      role: "SOLICITANTE",
      displayName: "Persona Duplicada",
      phone: "",
      state: "Miranda",
      municipality: "Chacao",
      acceptTerms: true,
    };

    const first = await request.post("/api/register", { data: payload });
    expect(first.status()).toBe(201);

    const second = await request.post("/api/register", { data: payload });
    expect(second.status()).toBe(409);
  });
});
