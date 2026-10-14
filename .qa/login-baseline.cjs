const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const crypto = require('node:crypto');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {};
  const errors = [];
  for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } })) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:3001/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `.qa/login-before-${name}.png`, fullPage: true });
    results[name] = await page.evaluate(() => {
      const card = document.querySelector('.auth-card');
      const props = ['display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding', 'margin', 'width', 'maxWidth', 'height', 'minHeight', 'gap'];
      const snapshot = el => {
        const box = el.getBoundingClientRect();
        const computed = getComputedStyle(el);
        return {
          tag: el.tagName, className: el.className, id: el.id,
          text: el.children.length === 0 ? el.textContent : null,
          bounds: { x: box.x, y: box.y, width: box.width, height: box.height },
          relativeBounds: { x: box.x - card.getBoundingClientRect().x, y: box.y - card.getBoundingClientRect().y, width: box.width, height: box.height },
          styles: Object.fromEntries(props.map(key => [key, computed[key]])),
        };
      };
      return { url: location.href, viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth,
        authCardHTML: card.outerHTML, card: snapshot(card), descendants: Array.from(card.querySelectorAll('*')).map(snapshot) };
    });
    await page.close();
  }
  const files = ['src/components/LoginForm.tsx', 'src/components/PasswordField.tsx', 'src/lib/auth.ts', 'src/lib/auth-client.ts', 'src/lib/access.ts', 'src/proxy.ts', 'src/app/api/auth/[...path]/route.ts'];
  const hashes = Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  fs.writeFileSync('.qa/login-before.json', JSON.stringify({ results, errors, hashes }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ snapshots: Object.keys(results), errors, filesHashed: files.length }));
})().catch(error => { console.error(error); process.exitCode = 1; });
