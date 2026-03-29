import { expect, test } from "@playwright/test";

test("Storefront: browse, filter, add to cart, checkout", async ({ page }) => {
  test.setTimeout(60_000);

  await test.step("Home page has hero, featured products, brand story, and trust signals", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /természetes kenőcsök/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Termékek megtekintése" })).toBeVisible();

    // Featured products section
    await expect(page.getByRole("heading", { name: "Kiemelt termékek" })).toBeVisible();
    await expect(page.getByTestId("productCard")).toHaveCount(4);

    // Brand story section
    await expect(page.getByRole("heading", { name: /történetünk/i })).toBeVisible();

    // Trust signals
    await expect(page.getByText("100% természetes")).toBeVisible();
    await expect(page.getByText("Kézzel készített")).toBeVisible();
    await expect(page.getByText("Magyar termék")).toBeVisible();
  });

  await test.step("Footer has 3-column layout with links", async () => {
    await expect(page.getByText("Információk")).toBeVisible();
    await expect(page.getByText("Kapcsolat")).toBeVisible();
    await expect(page.getByRole("link", { name: "ÁSZF" })).toBeVisible();
  });

  await test.step("Navigate to product list and filter by category", async () => {
    await page.getByRole("link", { name: "Termékek megtekintése" }).click();
    await page.waitForURL("/termekek");
    await expect(page.getByRole("heading", { name: "Termékek" })).toBeVisible();

    // Category chips should be visible
    await expect(page.getByRole("button", { name: "Mind" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bőrápoló" })).toBeVisible();

    // Filter by category
    await page.getByRole("button", { name: "Bőrápoló" }).click();
    const productCards = page.getByTestId("productCard");
    await expect(productCards).toHaveCount(2);

    // Clear filter
    await page.getByRole("button", { name: "Mind" }).click();
    await expect(productCards.first()).toBeVisible();
  });

  await test.step("Sort products by price", async () => {
    await page.getByLabel("Rendezés").click();
    await page.getByRole("option", { name: /Ár.*növekvő/i }).click();
    // First product should be the cheapest
    const firstPrice = page.getByTestId("productCard").first().getByTestId("priceDisplay");
    await expect(firstPrice).toContainText("2");
  });

  await test.step("View product detail with breadcrumbs and stock indicator", async () => {
    await page.getByTestId("productCard").first().click();
    await page.waitForURL(/\/termekek\/.+/);

    // Breadcrumbs
    await expect(page.getByRole("link", { name: "Főoldal" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Termékek" })).toBeVisible();

    // Product info
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Összetevők")).toBeVisible();

    // Stock indicator chip
    await expect(page.getByText(/Készleten|maradt|Elfogyott/)).toBeVisible();
  });

  await test.step("Add product to cart and see snackbar", async () => {
    await page.getByTestId("addToCartButton").click();
    await expect(page.getByText("Termék hozzáadva a kosárhoz!")).toBeVisible();
  });

  await test.step("Open cart drawer from header", async () => {
    await page.getByTestId("cartBadge").click();
    await expect(page.getByTestId("cartDrawer")).toBeVisible();
    await expect(page.getByText("Összesen:")).toBeVisible();

    // Navigate to full cart page
    await page.getByRole("link", { name: "Kosár megtekintése" }).click();
    await page.waitForURL("/kosar");
  });

  await test.step("Cart page shows shipping cost and summary", async () => {
    await expect(page.getByRole("heading", { name: "Kosár" })).toBeVisible();
    await expect(page.getByTestId("cartLineItem")).toHaveCount(1);

    // Shipping threshold alert
    await expect(page.getByText(/szállítás/i)).toBeVisible();

    // Summary with subtotal, shipping, total
    await expect(page.getByText("Részösszeg")).toBeVisible();
    await expect(page.getByText("Szállítási költség")).toBeVisible();
    await expect(page.getByText("Összesen")).toBeVisible();

    await page.getByRole("button", { name: "Tovább a fizetéshez" }).click();
    await page.waitForURL("/penztar");
  });

  await test.step("Checkout form with validation and order summary", async () => {
    await expect(page.getByRole("heading", { name: "Fizetés" })).toBeVisible();

    // Form sections
    await expect(page.getByText("Kapcsolattartási adatok")).toBeVisible();
    await expect(page.getByText("Szállítási cím")).toBeVisible();
    await expect(page.getByText("Számlázási cím")).toBeVisible();
    await expect(page.getByText("Szállítási mód")).toBeVisible();

    // Order summary sidebar
    await expect(page.getByText("Rendelés összegzése")).toBeVisible();

    // Billing address checkbox
    await expect(page.getByLabel(/Megegyezik a szállítási címmel/i)).toBeChecked();

    // Submit should be disabled until form is valid
    await expect(page.getByTestId("placeOrderButton")).toBeDisabled();
  });

  await test.step("Fill checkout form and submit order", async () => {
    await page.getByLabel("Név", { exact: true }).first().fill("Teszt Felhasználó");
    await page.getByLabel("E-mail").fill("teszt@example.com");
    await page.getByLabel("Telefon").fill("+36301234567");

    // Shipping address
    const shippingSection = page.getByText("Szállítási cím").locator("..");
    await shippingSection.getByLabel("Név").fill("Teszt Felhasználó");
    await shippingSection.getByLabel("Irányítószám").fill("1234");
    await shippingSection.getByLabel("Város").fill("Budapest");
    await shippingSection.getByLabel("Utca, házszám").fill("Teszt utca 1.");

    // Select shipping method
    await page.getByText("GLS futárszolgálat").click();

    // Submit
    await page.getByTestId("placeOrderButton").click();
    await page.waitForURL(/\/rendeles-visszaigazolas\/.+/);
  });

  await test.step("Order confirmation shows order details", async () => {
    await expect(page.getByTestId("orderConfirmation")).toBeVisible();
    await expect(page.getByText("Köszönjük a rendelését!")).toBeVisible();

    // Order details
    await expect(page.getByText("Rendelés részletei")).toBeVisible();
    await expect(page.getByText(/HO-\d{8}-\d{3}/)).toBeVisible();
    await expect(page.getByText("Részösszeg")).toBeVisible();
    await expect(page.getByText("Összesen")).toBeVisible();

    // Shipping address in confirmation
    await expect(page.getByText("Szállítási cím")).toBeVisible();
    await expect(page.getByText("Teszt Felhasználó")).toBeVisible();
  });

  await test.step("404 page shows proper error", async () => {
    await page.goto("/nonexistent-page");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByText("Az oldal nem található")).toBeVisible();
    await expect(page.getByRole("link", { name: "Vissza a főoldalra" })).toBeVisible();
  });
});

test("Mobile navigation drawer", async ({ page }) => {
  test.setTimeout(30_000);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await test.step("Hamburger menu opens mobile nav drawer", async () => {
    await page.getByRole("button", { name: "Menü" }).click();
    await expect(page.getByRole("link", { name: "Termékek" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Kosár" })).toBeVisible();
  });

  await test.step("Navigate via mobile drawer", async () => {
    await page.getByRole("link", { name: "Termékek" }).click();
    await page.waitForURL("/termekek");
    await expect(page.getByRole("heading", { name: "Termékek" })).toBeVisible();
  });
});
