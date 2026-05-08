import { expect, test } from "@playwright/test";

const protectedPages = [
  "/vibe-to-prompt-dev.html",
  "/home",
  "/studio.html",
  "/prompts",
  "/analyze",
  "/create.html",
  "/account",
  "/admin/invite",
  "/admin/users",
];

const protectedApis = [
  { path: "/api/admin/users", method: "GET" },
  { path: "/api/admin/invite", method: "POST", data: {} },
  { path: "/api/admin/revoke", method: "POST", data: {} },
  { path: "/api/analytics", method: "POST", data: {} },
  { path: "/api/analyze", method: "POST", data: {} },
  { path: "/api/generate-music", method: "POST", data: {} },
  { path: "/api/upload-audio", method: "POST" },
  { path: "/api/vibe-prompt", method: "POST", data: {} },
];

test.describe("anonymous route gates", () => {
  test("public entry and login pages render", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/vibe-to-prompt\.html$/);
    await expect(page.getByRole("heading", { name: /private studio access/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to studio/i })).toHaveAttribute("href", "/login");

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /booman lab/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  for (const path of protectedPages) {
    test(`${path} redirects anonymous users to login`, async ({ request }) => {
      const res = await request.head(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(307);
      expect(res.headers().location || "", path).toMatch(/^\/login/);
    });
  }

  for (const api of protectedApis) {
    test(`${api.method} ${api.path} returns standardized 401`, async ({ request }) => {
      const res = await request.fetch(api.path, {
        method: api.method,
        data: api.data,
        failOnStatusCode: false,
      });
      expect(res.status(), api.path).toBe(401);
      const body = await res.json();
      expect(body).toMatchObject({
        ok: false,
        code: "authentication_required",
      });
      expect(typeof body.error).toBe("string");
    });
  }
});

test.describe("authenticated smoke", () => {
  test.skip(!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated UI smoke tests.");

  test("invited user can reach the prompt library", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel(/password/i).fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home$/);

    await page.goto("/prompts");
    await expect(page.getByRole("heading", { name: /prompt library/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /copy prompt/i }).first()).toBeVisible();
  });
});
