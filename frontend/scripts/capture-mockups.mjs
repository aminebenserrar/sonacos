import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUTPUT_ROOT = path.resolve(process.cwd(), "..", "docs", "maquettes");
const README_PATH = path.join(OUTPUT_ROOT, "README.md");
const DESKTOP_DIR = path.join(OUTPUT_ROOT, "desktop");
const MOBILE_DIR = path.join(OUTPUT_ROOT, "mobile");

const desktopViewport = {
  name: "desktop",
  use: {
    viewport: { width: 1440, height: 1600 },
    colorScheme: "light",
  },
};

const mobileViewport = {
  name: "mobile",
  use: {
    ...devices["iPhone 13"],
    colorScheme: "light",
  },
};

const publicPages = [
  { slug: "01-accueil", route: "/" },
  { slug: "02-catalogue", route: "/catalogue" },
  { slug: "03-connexion", route: "/login" },
  { slug: "04-inscription", route: "/register" },
];

const roleJourneys = [
  {
    slug: "client",
    label: "Client",
    email: "client@sonacos.ma",
    password: "Client@2026!",
    dashboard: "/espace-client",
    pages: [
      { slug: "01-tableau-de-bord", route: "/espace-client" },
      { slug: "02-panier", route: "/espace-client/panier" },
      { slug: "03-commandes", route: "/espace-client/commandes" },
      { slug: "04-factures", route: "/espace-client/factures" },
      { slug: "05-profil", route: "/profil" },
    ],
  },
  {
    slug: "gestionnaire",
    label: "Gestionnaire",
    email: "gestionnaire@sonacos.ma",
    password: "Sonacos@2026!",
    dashboard: "/gestionnaire",
    pages: [
      { slug: "01-tableau-de-bord", route: "/gestionnaire" },
      { slug: "02-produits", route: "/gestionnaire/produits" },
      { slug: "03-stock", route: "/gestionnaire/stock" },
      { slug: "04-commandes", route: "/gestionnaire/commandes" },
      { slug: "05-paiements", route: "/gestionnaire/paiements" },
    ],
  },
  {
    slug: "responsable",
    label: "Responsable",
    email: "responsable@sonacos.ma",
    password: "Sonacos@2026!",
    dashboard: "/responsable",
    pages: [
      { slug: "01-tableau-de-bord", route: "/responsable" },
      { slug: "02-validations", route: "/responsable/validations" },
    ],
  },
  {
    slug: "admin",
    label: "Admin",
    email: "admin@sonacos.ma",
    password: "Sonacos@2026!",
    dashboard: "/admin",
    pages: [
      { slug: "01-tableau-de-bord", route: "/admin" },
      { slug: "02-utilisateurs", route: "/admin/utilisateurs" },
      { slug: "03-roles", route: "/admin/roles" },
      { slug: "04-activite", route: "/admin/activite" },
    ],
  },
  {
    slug: "archiviste",
    label: "Archiviste",
    email: "archiviste@sonacos.ma",
    password: "Sonacos@2026!",
    dashboard: "/archiviste",
    pages: [
      { slug: "01-tableau-de-bord", route: "/archiviste" },
      { slug: "02-documents", route: "/archiviste/documents" },
      { slug: "03-factures", route: "/archiviste/factures" },
      { slug: "04-archives", route: "/archiviste/archives" },
    ],
  },
  {
    slug: "auditeur",
    label: "Auditeur",
    email: "auditeur@sonacos.ma",
    password: "Sonacos@2026!",
    dashboard: "/auditeur",
    pages: [
      { slug: "01-tableau-de-bord", route: "/auditeur" },
      { slug: "02-journal", route: "/auditeur/journal" },
      { slug: "03-commandes", route: "/auditeur/commandes" },
      { slug: "04-stock", route: "/auditeur/stock" },
      { slug: "05-paiements", route: "/auditeur/paiements" },
      { slug: "06-validations", route: "/auditeur/validations" },
    ],
  },
];

const injectedStyles = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
  }

  nextjs-portal,
  #nextjs-dev-tools-menu,
  #nextjs__container,
  [data-next-badge-root],
  [data-next-mark],
  [data-nextjs-toast],
  [data-nextjs-dialog-overlay],
  [data-nextjs-scroll-focus-boundary] > div[style*="position: fixed"][style*="bottom"] {
    display: none !important;
    visibility: hidden !important;
  }
`;

async function ensureOutputDirs() {
  await fs.mkdir(DESKTOP_DIR, { recursive: true });
  await fs.mkdir(MOBILE_DIR, { recursive: true });
}

async function waitForServer() {
  const timeoutMs = 60_000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Wait for the app to start.
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`Application inaccessible sur ${BASE_URL}. Lance d'abord le frontend.`);
}

async function preparePage(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function finalizePage(page) {
  await page.addStyleTag({ content: injectedStyles }).catch(() => {});
  await page.waitForTimeout(250);
}

async function goTo(page, route) {
  await page.goto(`${BASE_URL}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
  await finalizePage(page);
}

async function login(page, journey) {
  await goTo(page, "/login");
  await page.locator("#email").fill(journey.email);
  await page.locator("#password").fill(journey.password);

  await Promise.all([
    page.waitForURL(new RegExp(`${escapeRegExp(journey.dashboard)}(?:$|[/?#])`), {
      timeout: 30_000,
    }),
    page.getByRole("button", { name: "Se connecter" }).click(),
  ]);

  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
  await finalizePage(page);
}

async function capturePage(page, filePath) {
  await page.screenshot({
    path: filePath,
    fullPage: true,
    animations: "disabled",
  });
}

function roleOutputDir(viewName, journey) {
  return path.join(viewName === "desktop" ? DESKTOP_DIR : MOBILE_DIR, journey.slug);
}

async function capturePublicPages(browser, viewportConfig, outputs) {
  const context = await browser.newContext(viewportConfig.use);
  const page = await context.newPage();
  await preparePage(page);

  for (const screen of publicPages) {
    const filePath = path.join(
      viewportConfig.name === "desktop" ? DESKTOP_DIR : MOBILE_DIR,
      `${screen.slug}.png`,
    );

    await goTo(page, screen.route);
    await capturePage(page, filePath);
    outputs.push({
      group: "Public",
      viewport: viewportConfig.name,
      filePath,
      route: screen.route,
    });
  }

  await context.close();
}

async function captureRolePages(browser, viewportConfig, journey, outputs) {
  const context = await browser.newContext(viewportConfig.use);
  const page = await context.newPage();
  await preparePage(page);
  await fs.mkdir(roleOutputDir(viewportConfig.name, journey), { recursive: true });
  await login(page, journey);

  for (const screen of journey.pages) {
    const filePath = path.join(
      roleOutputDir(viewportConfig.name, journey),
      `${screen.slug}.png`,
    );

    await goTo(page, screen.route);
    await capturePage(page, filePath);
    outputs.push({
      group: journey.label,
      viewport: viewportConfig.name,
      filePath,
      route: screen.route,
    });
  }

  await context.close();
}

async function writeReadme(outputs) {
  const generatedAt = new Date().toLocaleString("fr-MA", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const lines = [
    "# Maquettes SONACOS",
    "",
    `Generation automatique depuis l'application sur \`${BASE_URL}\`.`,
    "",
    `Date: ${generatedAt}`,
    "",
    "## Dossiers",
    "",
    "- `desktop/` : captures desktop",
    "- `mobile/` : captures mobile",
    "",
    "## Ecrans generes",
    "",
  ];

  const groups = new Map();
  for (const output of outputs) {
    const key = `${output.group} - ${output.viewport}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(output);
  }

  for (const [groupName, entries] of groups.entries()) {
    lines.push(`### ${groupName}`);
    lines.push("");
    for (const entry of entries) {
      const relativePath = path.relative(OUTPUT_ROOT, entry.filePath).replaceAll("\\", "/");
      lines.push(`- \`${entry.route}\` -> [${relativePath}](./${relativePath})`);
    }
    lines.push("");
  }

  lines.push("## Commande");
  lines.push("");
  lines.push("```bash");
  lines.push("npm run capture:mockups");
  lines.push("```");
  lines.push("");
  lines.push("Le frontend doit etre lance avant la capture.");

  await fs.writeFile(README_PATH, lines.join("\n"), "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  await ensureOutputDirs();
  await waitForServer();

  const browser = await chromium.launch({ headless: true });
  const outputs = [];
  const failures = [];

  try {
    for (const viewportConfig of [desktopViewport, mobileViewport]) {
      await capturePublicPages(browser, viewportConfig, outputs).catch((error) => {
        failures.push(`Public ${viewportConfig.name}: ${error.message}`);
      });

      for (const journey of roleJourneys) {
        await captureRolePages(browser, viewportConfig, journey, outputs).catch((error) => {
          failures.push(`${journey.label} ${viewportConfig.name}: ${error.message}`);
        });
      }
    }
  } finally {
    await browser.close();
  }

  await writeReadme(outputs);

  console.log(`Maquettes generees dans: ${OUTPUT_ROOT}`);
  console.log(`Captures reussies: ${outputs.length}`);

  if (failures.length > 0) {
    console.log("Ecrans a verifier:");
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
