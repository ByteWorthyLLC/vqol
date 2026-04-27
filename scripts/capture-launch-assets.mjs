import { mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium, devices } from 'playwright';

const outDir = join(process.cwd(), 'docs', 'assets', 'screenshots');
const baseUrl = process.env.VQOL_CAPTURE_BASE_URL ?? 'https://byteworthyllc.github.io/vqol/';

const routes = [
  ['launch', '#/launch'],
  ['studio', '#/studio'],
  ['forge', '#/forge'],
  ['proof', '#/proof'],
  ['device', '#/device'],
  ['demo-result', '#/results?demo=1'],
];

function routeUrl(hash) {
  const url = new URL(baseUrl);
  url.searchParams.set('shot', String(Date.now()));
  url.hash = hash.replace(/^#/, '');
  return url.toString();
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function screenshotPage(page, name, hash, viewportName) {
  await page.goto(routeUrl(hash), { waitUntil: 'networkidle' });
  await page.screenshot({
    path: join(outDir, `${name}-${viewportName}.png`),
    fullPage: viewportName === 'desktop',
  });
}

async function makeGif() {
  const magick = existsSync('/opt/homebrew/bin/magick') ? '/opt/homebrew/bin/magick' : 'magick';
  const frames = ['launch', 'studio', 'forge', 'proof', 'device', 'demo-result'].map((name) =>
    join(outDir, `${name}-desktop.png`)
  );
  await run(magick, [
    ...frames,
    '-resize',
    '1200x',
    '-delay',
    '110',
    '-loop',
    '0',
    join(process.cwd(), 'docs', 'assets', 'vqol-launch-tour.gif'),
  ]);
}

async function cleanOldScreenshots() {
  await mkdir(outDir, { recursive: true });
  for (const file of await readdir(outDir)) {
    if (file.endsWith('.png') && file.includes('-')) {
      await rm(join(outDir, file), { force: true });
    }
  }
}

async function runCapture() {
  await cleanOldScreenshots();

  const executablePath =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined);
  const browser = await chromium.launch({ executablePath, headless: true });

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const desktopPage = await desktop.newPage();
  for (const [name, hash] of routes) {
    await screenshotPage(desktopPage, name, hash, 'desktop');
  }
  await desktop.close();

  const mobile = await browser.newContext({
    ...devices['iPhone 14'],
    serviceWorkers: 'block',
  });
  const mobilePage = await mobile.newPage();
  await screenshotPage(mobilePage, 'launch', '#/launch', 'mobile');
  await screenshotPage(mobilePage, 'studio', '#/studio', 'mobile');
  await mobile.close();

  await browser.close();
  await makeGif();
}

runCapture().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
