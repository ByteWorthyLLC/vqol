import { spawn } from 'node:child_process';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const port = Number(process.env.VQOL_PREVIEW_PORT ?? 4173);
const baseUrl = `http://127.0.0.1:${port}/`;
const threshold = Number(process.env.VQOL_A11Y_THRESHOLD ?? 0.95);

const routes = [
  ['home', ''],
  ['demo-result', '#/results?demo=1'],
  ['lab', '#/lab'],
  ['studio', '#/studio'],
  ['forge', '#/forge'],
  ['launch', '#/launch'],
  ['proof', '#/proof'],
  ['poster', '#/poster'],
];
const ciRouteNames = new Set(['home', 'demo-result', 'launch', 'proof']);
const checkedRoutes = process.env.CI ? routes.filter(([name]) => ciRouteNames.has(name)) : routes;

function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          resolve();
          return;
        }
      } catch {
        // Keep polling until Vite preview is listening.
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(tick, 250);
    };
    void tick();
  });
}

function spawnPreview() {
  const child = spawn(
    process.execPath,
    ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );
  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  return child;
}

function withTimeout(promise, label, timeoutMs = 25_000) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function stopPreview(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  const exited = await Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (!exited && child.exitCode === null) child.kill('SIGKILL');
}

async function run() {
  const preview = spawnPreview();
  let chrome;

  try {
    await waitForServer(baseUrl);
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
      chromePath: process.env.CHROME_PATH,
    });

    const failures = [];
    for (const [name, hash] of checkedRoutes) {
      const url = `${baseUrl}${hash}`;
      const result = await withTimeout(
        lighthouse(url, {
          port: chrome.port,
          onlyCategories: ['accessibility'],
          output: 'json',
          logLevel: 'error',
          maxWaitForLoad: 15_000,
          throttlingMethod: 'provided',
        }),
        `Lighthouse ${name}`
      );
      const score = result?.lhr?.categories?.accessibility?.score ?? 0;
      const percent = Math.round(score * 100);
      console.log(`${name}: accessibility ${percent}%`);
      if (score < threshold) failures.push(`${name} scored ${percent}%`);
    }

    if (failures.length > 0) {
      throw new Error(`Lighthouse accessibility threshold failed:\n${failures.join('\n')}`);
    }
  } finally {
    if (chrome) await chrome.kill();
    await stopPreview(preview);
  }
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
