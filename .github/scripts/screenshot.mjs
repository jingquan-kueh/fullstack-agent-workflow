// Screenshots one app screen at desktop and mobile size (always both).
// Usage: node .github/scripts/screenshot.mjs <name> [path] [tab label]
//   e.g. node .github/scripts/screenshot.mjs home
//        node .github/scripts/screenshot.mjs settings /settings
//        node .github/scripts/screenshot.mjs reports / "Reports"   (screens that are tabs, no URL)
// Expects the dev server on APP_URL (default http://localhost:5173).
// Writes screenshots/<name>-desktop.png and screenshots/<name>-mobile.png.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';
const VIEWPORTS = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 844 },
};

const [name, path = '/', tabLabel] = process.argv.slice(2);
if (!name) {
  console.error('Usage: node .github/scripts/screenshot.mjs <name> [path] [tab label]');
  process.exit(1);
}

await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  for (const [size, viewport] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage({ viewport });
    await page.goto(new URL(path, APP_URL).href);
    if (tabLabel) {
      await page.getByRole('tab', { name: tabLabel }).click();
    }
    // Let data fetches and transitions settle before capturing.
    await page.waitForTimeout(1500);
    const file = `screenshots/${name}-${size}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await page.close();
  }
} finally {
  await browser.close();
}
