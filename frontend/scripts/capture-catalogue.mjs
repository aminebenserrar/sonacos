import { chromium, devices } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../../docs/maquettes/", import.meta.url));
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ headless: true });
const captures = [];

async function prepare(page, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator("article").first().waitFor();
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(async (image) => {
      image.loading = "eager";
      await image.decode().catch(() => {});
    }));
  });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  const prices = await page.locator("article p").allTextContents();
  const amounts = prices.filter((text) => /\d[,\.]\d{2}\s+(DH|MAD)/.test(text));
  assert.ok(amounts.length > 0, `No product prices on ${route}`);
  for (const amount of amounts) {
    assert.match(amount, /^\d[\d\s,.]* DH$/);
    assert.equal((amount.match(/DH/g) ?? []).length, 1);
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Horizontal overflow");
  console.log(`${route}: ${amounts.length} prices verified: ${amounts.slice(0, 3).join("; ")}`);
}

async function capture(page, name, fullPage = true) {
  await page.screenshot({ path: path.join(root, name), fullPage, animations: "disabled" });
  captures.push(name);
}

try {
  for (const [name, options] of [
    ["desktop", { viewport: { width: 1440, height: 1600 } }],
    ["mobile", devices["iPhone 13"]],
  ]) {
    const context = await browser.newContext({ ...options, colorScheme: "light" });
    const page = await context.newPage();
    await prepare(page, "/catalogue");
    await capture(page, `${name}/02-catalogue.png`);
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await prepare(page, "/catalogue");
  await capture(page, "rapport/desktop/02-catalogue-desktop.png", false);
  await page.setViewportSize({ width: 1280, height: 1270 });
  await page.locator("article").first().evaluate((article) => window.scrollTo(0, article.getBoundingClientRect().top + scrollY - 140));
  await capture(page, "rapport/desktop/13-catalogue-produits-grille.png", false);
  await page.setViewportSize({ width: 1280, height: 803 });
  await page.locator("article").first().evaluate((article) => window.scrollTo(0, article.getBoundingClientRect().top + scrollY - 70));
  await capture(page, "rapport/desktop/14-cartes-produits-detail.png", false);
  console.log("Updated screenshots:\n" + captures.join("\n"));
} finally {
  await browser.close();
}
