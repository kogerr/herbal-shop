import { expect, test } from "@playwright/test";

const ADMIN_API_KEY = "dev-admin-key";

test("Admin: login, dashboard, products, orders", async ({ page }) => {
  test.setTimeout(60_000);

  await test.step("Admin login page renders", async () => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /Admin belépés/i })).toBeVisible();
    await expect(page.getByLabel(/API kulcs/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Belépés" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Vissza a webshopba/i })).toBeVisible();
  });

  await test.step("Login with invalid key shows error", async () => {
    await page.getByLabel(/API kulcs/i).fill("wrong-key");
    await page.getByRole("button", { name: "Belépés" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  await test.step("Login with valid key navigates to dashboard", async () => {
    await page.getByLabel(/API kulcs/i).fill(ADMIN_API_KEY);
    await page.getByRole("button", { name: "Belépés" }).click();
    await page.waitForURL("/admin");
    await expect(page.getByRole("heading", { name: /Irányítópult/i })).toBeVisible();
  });

  await test.step("Dashboard shows stat cards", async () => {
    await expect(page.getByText("Összes megrendelés", { exact: true })).toBeVisible();
    await expect(page.getByText("Függőben lévő")).toBeVisible();
    await expect(page.getByText("Mai bevétel")).toBeVisible();
    await expect(page.getByText("Aktív termékek")).toBeVisible();
  });

  await test.step("Navigate to product list via sidebar", async () => {
    await page.getByRole("link", { name: "Termékek", exact: true }).click();
    await page.waitForURL("/admin/termekek");
    await expect(page.getByRole("heading", { name: "Termékek" })).toBeVisible();

    // Products should be listed in a table
    await expect(page.getByRole("table")).toBeVisible();
    // At least the seeded 6 products (+ header row, + any previously created test products)
    const dataRows = page.locator("tbody tr");
    expect(await dataRows.count()).toBeGreaterThanOrEqual(6);
  });

  await test.step("Navigate to new product form", async () => {
    await page.getByRole("link", { name: /Új termék/i }).click();
    await page.waitForURL("/admin/termekek/uj");
    await expect(page.getByRole("heading", { name: /Új termék/i })).toBeVisible();

    // Form fields should be present
    await expect(page.getByLabel("Név")).toBeVisible();
    await expect(page.getByLabel(/Slug/i)).toBeVisible();
    await expect(page.getByLabel("Leírás")).toBeVisible();
    await expect(page.getByLabel("Összetevők")).toBeVisible();
    await expect(page.getByLabel("Ár")).toBeVisible();
    await expect(page.getByLabel("Készlet")).toBeVisible();
    await expect(page.getByLabel("Súly")).toBeVisible();
  });

  await test.step("Create a new product", async () => {
    const uniqueName = `Teszt kenőcs ${Date.now()}`;
    await page.getByLabel("Név").fill(uniqueName);
    // Slug should auto-generate
    await expect(page.getByLabel(/Slug/i)).not.toHaveValue("");

    await page.getByLabel("Leírás").fill("Teszt leírás a kenőcshöz");
    await page.getByLabel("Összetevők").fill("Teszt összetevők");
    await page.getByLabel("Ár").fill("2990");
    await page.getByLabel("Készlet").fill("25");
    await page.getByLabel("Súly").fill("50");

    // Select category
    await page.getByLabel(/Kategória/i).click();
    await page.getByRole("option").first().click();

    await page.getByRole("button", { name: "Mentés" }).click();

    // Should show success and redirect to list
    await expect(page.getByText(/sikeresen mentve/i)).toBeVisible({ timeout: 10_000 });
    await page.waitForURL("/admin/termekek", { timeout: 10_000 });
  });

  await test.step("Navigate to order list", async () => {
    await page.getByRole("link", { name: "Megrendelések" }).click();
    await page.waitForURL("/admin/megrendelesek");
    await expect(page.getByRole("heading", { name: "Megrendelések" })).toBeVisible();

    // Status filter chips
    await expect(page.getByRole("button", { name: "Mind" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Függőben" })).toBeVisible();
  });

  await test.step("Sidebar has all navigation items", async () => {
    await expect(page.getByRole("link", { name: "Irányítópult" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Termékek" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Megrendelések" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Webshop megtekintése/i })).toBeVisible();
  });

  await test.step("Logout clears session and redirects", async () => {
    await page.getByRole("button", { name: /Kijelentkezés/i }).click();
    await page.waitForURL("/admin/login");
  });

  await test.step("Protected routes redirect to login when not authenticated", async () => {
    await page.goto("/admin");
    await page.waitForURL("/admin/login");
  });
});
