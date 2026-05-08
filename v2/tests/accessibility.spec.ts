import { expect, Page, test } from "@playwright/test";
import axe from "axe-core";

const axeSource = axe.source;
const legalPaths = ["/terms", "/privacy", "/acceptable-use", "/copyright"];

type AxeViolation = {
  id: string;
  impact?: "minor" | "moderate" | "serious" | "critical";
  help: string;
  nodes: Array<{ target: string[] }>;
};

async function expectNoSeriousAxeViolations(page: Page) {
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    const axe = (window as unknown as {
      axe: {
        run: (context: Document, options: Record<string, unknown>) => Promise<{ violations: AxeViolation[] }>;
      };
    }).axe;

    return axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"],
      },
    });
  });

  const serious = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );
  const message = serious
    .map((violation) => {
      const targets = violation.nodes.slice(0, 3).map((node) => node.target.join(" ")).join(", ");
      return `${violation.id} (${violation.impact}): ${violation.help} :: ${targets}`;
    })
    .join("\n");

  expect(serious, message).toEqual([]);
}

test.describe("accessibility", () => {
  test("public entry page has no serious or critical axe violations", async ({ page }) => {
    await page.goto("/vibe-to-prompt.html");
    await expect(page.getByRole("heading", { name: /private studio access/i })).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("login page has no serious or critical axe violations", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  for (const path of legalPaths) {
    test(`${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByText(/draft owner review required/i)).toBeVisible();
      await expectNoSeriousAxeViolations(page);
    });
  }

  test("protected pages redirect to an accessible login surface", async ({ page }) => {
    await page.goto("/studio.html");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});

test.describe("authenticated accessibility", () => {
  test.skip(!process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run authenticated accessibility checks.");

  test("private hub has no serious or critical axe violations", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(process.env.E2E_TEST_EMAIL!);
    await page.getByLabel(/password/i).fill(process.env.E2E_TEST_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home$/);
    await expectNoSeriousAxeViolations(page);
  });
});
