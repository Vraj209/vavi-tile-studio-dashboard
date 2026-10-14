const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ headless: true, channel: "msedge" });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
 const errors = []; page.on('pageerror', e => errors.push(e.message));
 await page.goto('http://127.0.0.1:3002');
 const project = page.getByRole('combobox', { name: 'Project type', exact: true });
 await project.click();
 await page.getByRole('listbox').waitFor();
 await page.getByRole('listbox').evaluate(el => Promise.all(el.parentElement.getAnimations().map(a => a.finished))); await page.screenshot({ path: '.qa/dropdown-desktop.png' });
 await project.press('End'); await project.press('Enter');
 assert.equal(await project.getAttribute('aria-expanded'), 'false');
 const chosen = await project.innerText();
 await page.getByRole('combobox', { name: 'Received', exact: true }).click();
 await page.getByRole('option', { name: 'Last 30 days', exact: true }).click();
 await page.getByRole('combobox', { name: 'Sort by', exact: true }).click();
 await page.getByRole('option', { name: 'Oldest first', exact: true }).click();
 await page.getByRole('button', { name: 'Apply filters' }).click();
 await page.waitForURL(u => u.searchParams.get('sort') === 'oldest');
 assert.equal(new URL(page.url()).searchParams.get('period'), '30d');
 assert.equal((await project.innerText()).trim(), chosen.trim());
 await project.click(); await project.press('Escape');
 assert.equal(await project.getAttribute('aria-expanded'), 'false');
 await project.press('ArrowDown'); await project.press('Tab');
 assert.equal(await project.getAttribute('aria-expanded'), 'false');
 for (const width of [320, 768, 1024]) {
  await page.setViewportSize({ width, height: 640 });
  await project.scrollIntoViewIfNeeded(); await project.click();
  const box = await page.getByRole('listbox').boundingBox();
  assert(box.x >= 0 && box.x + box.width <= width + 1 && box.y >= 0 && box.y + box.height <= 641, JSON.stringify(box));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('listbox').evaluate(el => Promise.all(el.parentElement.getAnimations().map(a => a.finished))); if(width === 320) await page.screenshot({ path: '.qa/dropdown-mobile.png' });
  await project.press('Escape');
 }
 const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
 const mobile = await touch.newPage(); await mobile.goto('http://127.0.0.1:3002');
 await mobile.getByRole('combobox', { name: 'Inspiration', exact: true }).tap();
 await mobile.getByRole('option', { name: 'With a file', exact: true }).tap();
 assert.match(await mobile.getByRole('combobox', { name: 'Inspiration', exact: true }).innerText(), /With a file/);
 assert.deepEqual(errors, []);
 console.log('PASS: keyboard selection/Escape/Tab, filter URL and retained values, viewport bounds at 320/768/1024, touch selection, no browser errors.');
 await browser.close();
})().catch(e => { console.error(e); process.exit(1); });


