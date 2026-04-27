import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.VQOL_DEVICE_BASE_URL ?? 'https://byteworthyllc.github.io/vqol/';
const outDir = join(process.cwd(), 'docs', 'assets');

function routeUrl(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set('device-smoke', String(Date.now()));
  url.hash = hash.replace(/^#/, '');
  return url.toString();
}

async function assertVisibleText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ timeout: 10_000 });
}

async function runContext(browser, device) {
  const context = await browser.newContext({
    viewport: device.viewport,
    userAgent: device.userAgent,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    serviceWorkers: 'block',
  });
  await context.addInitScript(() => {
    window.__vqolPrintCalled = false;
    window.print = () => {
      window.__vqolPrintCalled = true;
    };
  });
  const page = await context.newPage();
  const checks = [];

  for (const [route, expected] of [
    ['#/launch', 'Viral functionality kit'],
    ['#/studio', 'Outcomes studio'],
    ['#/forge', 'Practice forge'],
    ['#/proof', 'Local-first proof'],
    ['#/results?demo=1', 'Demo data'],
  ]) {
    await page.goto(routeUrl(route), { waitUntil: 'networkidle' });
    await assertVisibleText(page, expected);
    checks.push(`${route} rendered ${expected}`);
  }

  await page.goto(routeUrl('#/results?demo=1'), { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Export PDF for clinician/i }).click();
  const printCalled = await page.evaluate(() => window.__vqolPrintCalled === true);
  if (!printCalled) throw new Error(`${device.name}: export PDF button did not call window.print`);
  checks.push('Export PDF button called window.print');

  await context.close();
  return { name: device.name, checks };
}

async function run() {
  await mkdir(outDir, { recursive: true });
  const executablePath =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined);
  const browser = await chromium.launch({ executablePath, headless: true });

  const devices = [
    {
      name: 'desktop-chromium',
      viewport: { width: 1440, height: 1000 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
      isMobile: false,
      hasTouch: false,
    },
    {
      name: 'android-chrome-layout',
      viewport: { width: 412, height: 915 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Mobile Safari/537.36',
      isMobile: true,
      hasTouch: true,
    },
    {
      name: 'ios-safari-layout',
      viewport: { width: 390, height: 844 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
    },
  ];

  const report = [];
  try {
    for (const device of devices) {
      const result = await runContext(browser, device);
      report.push(result);
      console.log(`${result.name}: ${result.checks.length} checks passed`);
    }

    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    await page.goto(routeUrl('#/results?demo=1'), { waitUntil: 'networkidle' });
    await page.pdf({
      path: join(outDir, 'vqol-demo-report.pdf'),
      format: 'Letter',
      printBackground: true,
    });
    await page.close();
  } finally {
    await browser.close();
  }

  await writeFile(
    join(outDir, 'device-smoke-report.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, report }, null, 2)}\n`
  );
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
