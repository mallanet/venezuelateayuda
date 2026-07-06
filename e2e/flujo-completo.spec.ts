import { test, expect } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  approveUserInDb,
  createListingInDb,
  login,
  prisma,
  registerAndVerifyUser,
  uniqueEmail,
} from "./helpers";

test.describe("Flujo completo: publicar, moderar, contactar", () => {
  test("el admin aprueba usuario y ficha, la ficha aparece en el mapa y otro usuario contacta por chat", async ({
    page,
    request,
    browser,
    isMobile,
  }) => {
    const helperEmail = uniqueEmail("ayudante");
    const seekerEmail = uniqueEmail("solicitante");
    const listingTitle = `Ofrezco mercado solidario ${Date.now()}`;

    await registerAndVerifyUser(request, {
      email: helperEmail,
      role: "AYUDANTE",
      displayName: "Helena Ayudante",
    });
    await registerAndVerifyUser(request, {
      email: seekerEmail,
      role: "SOLICITANTE",
      displayName: "Samuel Solicitante",
    });
    await approveUserInDb(seekerEmail);

    await test.step("el admin aprueba al usuario ayudante desde el panel", async () => {
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
      await page.goto("/admin");
      await page.getByTestId(`approve-user-${helperEmail}`).click();
      await expect(page.getByTestId(`approve-user-${helperEmail}`)).toBeHidden();
    });

    await test.step("el ayudante publica una ficha que queda pendiente", async () => {
      const helperContext = await browser.newContext();
      const helperPage = await helperContext.newPage();
      await login(helperPage, helperEmail);

      await helperPage.goto("/ayuda/nueva");
      await helperPage.getByTestId("type-ofrezco").click();
      await helperPage.getByLabel("Título").fill(listingTitle);
      await helperPage.getByTestId("select-categoria").click();
      await helperPage.getByRole("option", { name: "Alimentos" }).click();
      await helperPage.getByTestId("select-quantity-unit").click();
      await helperPage.getByRole("option", { name: "Kit" }).click();
      await helperPage.getByTestId("modality-presencial").click();
      await helperPage
        .getByLabel("Descripción")
        .fill("Puedo compartir un mercado solidario mensual con una familia de la zona.");
      await helperPage.getByTestId("select-estado").click();
      await helperPage.getByRole("option", { name: "Miranda" }).click();
      await helperPage.getByTestId("select-municipio").click();
      await helperPage.getByRole("option", { name: "Chacao" }).click();
      await helperPage.getByRole("button", { name: "Enviar para revisión" }).click();

      await helperPage.waitForURL("**/perfil");
      await expect(helperPage.getByTestId("my-listings")).toContainText(listingTitle);
      await expect(helperPage.getByTestId("my-listings")).toContainText("En revisión");
      await helperContext.close();
    });

    await test.step("la ficha pendiente no aparece en el listado público", async () => {
      const res = await request.get("/api/listings");
      const data = await res.json();
      const titles = data.listings.map((l: { title: string }) => l.title);
      expect(titles).not.toContain(listingTitle);
    });

    await test.step("el admin aprueba la ficha", async () => {
      await page.goto("/admin");
      await page.getByTestId("tab-fichas").click();
      const pendingItem = page
        .getByTestId("pending-listings")
        .locator("li", { hasText: listingTitle });
      await pendingItem.getByRole("button", { name: "Aprobar" }).click();
      await expect(pendingItem).toBeHidden();
    });

    await test.step("la ficha aprobada aparece en el mapa y el solicitante contacta por chat", async () => {
      const seekerContext = await browser.newContext();
      const seekerPage = await seekerContext.newPage();
      await login(seekerPage, seekerEmail);

      await seekerPage.goto("/mapa");
      if (isMobile) {
        await seekerPage.getByRole("button", { name: /Ver lista/ }).click();
      }
      const listingCard = seekerPage
        .getByTestId(isMobile ? "listing-list-mobile" : "listing-list-desktop")
        .locator("li", { hasText: listingTitle })
        .first();
      await expect(listingCard).toBeVisible();
      await expect(listingCard).toContainText("1 kit");
      await expect(listingCard).toContainText("Presencial");
      await listingCard.getByRole("link", { name: "Ver ficha completa" }).click();

      await seekerPage.waitForURL("**/ayuda/**");
      await expect(seekerPage.getByText(listingTitle)).toBeVisible();
      await seekerPage.getByTestId("contact-button").click();

      await seekerPage.waitForURL("**/mensajes/**");
      await seekerPage
        .getByTestId("chat-input")
        .fill("Hola, me interesa tu oferta de mercado solidario.");
      await seekerPage.getByTestId("chat-send").click();
      await expect(seekerPage.getByTestId("chat-messages")).toContainText(
        "me interesa tu oferta"
      );
      await seekerContext.close();
    });

    await test.step("el ayudante ve el mensaje recibido en su bandeja", async () => {
      const helperContext = await browser.newContext();
      const helperPage = await helperContext.newPage();
      await login(helperPage, helperEmail);

      await helperPage.goto("/mensajes");
      const conversation = helperPage
        .getByTestId("conversation-list")
        .locator("li", { hasText: listingTitle })
        .first();
      await expect(conversation).toBeVisible();
      await expect(conversation).toContainText("me interesa tu oferta");
      await helperContext.close();
    });
  });

  test("un usuario con cuenta en revisión no puede publicar fichas por la API", async ({
    request,
  }) => {
    const email = uniqueEmail("pendiente");
    await registerAndVerifyUser(request, {
      email,
      role: "AYUDANTE",
      displayName: "Pedro Pendiente",
    });

    const loginRes = await request.post("/api/auth/callback/credentials", {
      form: { email, password: "password-e2e-123" },
    });
    expect(loginRes.status()).toBeLessThan(500);

    const res = await request.post("/api/listings", {
      data: {
        type: "OFREZCO",
        title: "Ficha que no debería crearse",
        description: "Descripción suficientemente larga para pasar validación.",
        category: "ALIMENTOS",
        state: "Miranda",
        municipality: "Chacao",
        lat: 10.49,
        lng: -66.85,
      },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("el mapa público solo expone fichas aprobadas con datos minimizados", async ({
    request,
  }) => {
    const email = uniqueEmail("mapa");
    await registerAndVerifyUser(request, {
      email,
      role: "AYUDANTE",
      displayName: "Marta Mapa Apellido",
    });
    await approveUserInDb(email);

    const approved = await createListingInDb({
      email,
      title: `Ficha aprobada visible ${Date.now()}`,
      type: "OFREZCO",
      status: "APROBADA",
    });
    const pending = await createListingInDb({
      email,
      title: `Ficha pendiente oculta ${Date.now()}`,
      type: "NECESITO",
      status: "PENDIENTE",
    });

    const res = await request.get("/api/listings");
    const data = await res.json();
    const ids = data.listings.map((l: { id: string }) => l.id);
    expect(ids).toContain(approved.id);
    expect(ids).not.toContain(pending.id);

    const publicListing = data.listings.find((l: { id: string }) => l.id === approved.id);
    expect(publicListing.authorName).toBe("Marta");
    expect(publicListing.authorAvatarUrl).toContain("pravatar.cc");
    expect(publicListing.quantity).toBe(1);
    expect(publicListing.quantityUnit).toBe("UNIDAD");
    expect(publicListing.modality).toBe("PRESENCIAL");
    expect(JSON.stringify(publicListing)).not.toContain(email);

    await prisma.helpListing.deleteMany({ where: { id: { in: [approved.id, pending.id] } } });
  });
});
