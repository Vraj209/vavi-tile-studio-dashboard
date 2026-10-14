const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

(async () => {
  const baseline = JSON.parse(fs.readFileSync('.qa/login-before.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = {};
  const errors = [];
  const checks = [
    ['desktop', 1440, 900], ['desktop-1024', 1024, 768], ['desktop-1920', 1920, 1080],
    ['tablet-768', 768, 1024], ['mobile', 390, 844], ['mobile-320', 320, 844], ['mobile-767', 767, 844],
  ];
  const mobileOnly = process.argv.includes('--mobile-only');
  for (const [name, width, height] of checks.filter(([name]) => !mobileOnly || ['mobile', 'mobile-320'].includes(name))) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const imageRequests = [];
    page.on('request', request => { if (decodeURIComponent(request.url()).includes('login-ivory-interior')) imageRequests.push(request.url()); });
    page.on('pageerror', error => errors.push({ name, message: error.message }));
    await page.goto('http://127.0.0.1:3001/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (width >= 768) await page.locator('.auth-panel-image').evaluate(image => image.decode());
    await page.screenshot({ path: `.qa/login-after-${name}.png`, fullPage: true });
    const snapshot = await page.evaluate(() => {
      const card = document.querySelector('.auth-card');
      const props = ['display', 'position', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding', 'margin', 'width', 'maxWidth', 'height', 'minHeight', 'gap'];
      const inspect = el => {
        const box = el.getBoundingClientRect();
        const computed = getComputedStyle(el);
        return { tag: el.tagName, className: el.className, id: el.id, text: el.children.length === 0 ? el.textContent : null,
          bounds: { x: box.x, y: box.y, width: box.width, height: box.height },
          relativeBounds: { x: box.x - card.getBoundingClientRect().x, y: box.y - card.getBoundingClientRect().y, width: box.width, height: box.height },
          styles: Object.fromEntries(props.map(key => [key, computed[key]])) };
      };
      const image = document.querySelector('.auth-panel-image');
      const imageBox = image.getBoundingClientRect();
      const imageStyle = getComputedStyle(image);
      const submit = card.querySelector('button[type="submit"]').getBoundingClientRect();
      const logo = document.querySelector('.auth-brand img');
      return { url: location.href, viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth,
        authCardHTML: card.outerHTML, card: inspect(card), descendants: Array.from(card.querySelectorAll('*')).map(inspect),
        panel: inspect(document.querySelector('.auth-panel')), logo: logo ? inspect(logo) : null,
        image: { display: imageStyle.display, objectFit: imageStyle.objectFit, objectPosition: imageStyle.objectPosition,
          width: imageBox.width, height: imageBox.height, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete, currentSrc: image.currentSrc },
        submitVisible: submit.top >= 0 && submit.bottom <= innerHeight,
      };
    });
    assert.equal(snapshot.scrollWidth, width, `${name} horizontal overflow`);
    if (width < 768) {
      assert.equal(snapshot.image.display, 'none');
      assert.equal(imageRequests.length, 0, `${name} downloaded decorative image`);
      assert(snapshot.submitVisible, `${name} submit not in initial viewport`);
    } else {
      assert.equal(snapshot.image.objectFit, 'cover');
      assert(snapshot.image.naturalWidth > 0, `${name} image did not decode`);
      assert.equal(snapshot.image.width, snapshot.panel.bounds.width);
      assert.equal(snapshot.image.height, snapshot.panel.bounds.height);
    }
    if (name === 'desktop') {
      assert.deepEqual(snapshot.card, baseline.results.desktop.card, 'Desktop card changed');
      assert.deepEqual(snapshot.descendants, baseline.results.desktop.descendants, 'Desktop form changed');
      assert.equal(snapshot.authCardHTML, baseline.results.desktop.authCardHTML, 'Desktop auth-card DOM changed');
    }
    if (name === 'mobile') {
      const relative = items => items.map(({ bounds, ...item }) => item);
      assert.deepEqual(relative(snapshot.descendants), relative(baseline.results.mobile.descendants), 'Mobile form relative layout/style changed');
      assert.equal(snapshot.authCardHTML, baseline.results.mobile.authCardHTML, 'Mobile auth-card DOM changed');
      await page.getByLabel('Password', { exact: true }).fill('preview-only-password');
      await page.getByRole('button', { name: 'Show password', exact: true }).click();
      assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text');
      await page.getByRole('button', { name: 'Hide password', exact: true }).click();
      assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'password');
      await page.getByRole('link', { name: 'Forgot your password?', exact: true }).click();
      await page.waitForURL('**/forgot-password');
      assert.equal(await page.getByRole('heading', { name: 'Forgot your password?', exact: true }).count(), 1);
    }
    results[name] = { ...snapshot, imageRequests };
    console.log(JSON.stringify({ name, viewport: snapshot.viewport, card: snapshot.card.bounds, panel: snapshot.panel.bounds,
      imageRequests: imageRequests.length, submitVisible: snapshot.submitVisible, overflow: snapshot.scrollWidth > width }));
    await context.close();
  }
  const hashes = Object.fromEntries(Object.keys(baseline.hashes).map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
  assert.deepEqual(hashes, baseline.hashes, 'Authentication source files changed');
  assert.deepEqual(errors, [], 'Browser errors');
  const reportPath = mobileOnly ? '.qa/login-after-mobile-final.json' : '.qa/login-after.json';
  fs.writeFileSync(reportPath, JSON.stringify({ results, errors, hashes, baselineDesktopParity: mobileOnly ? 'not rerun' : true, baselineMobileFormParity: true }, null, 2));
  await browser.close();
  console.log(mobileOnly ? 'PASS: 390px and320px mobile, internal form baseline parity, no decorative image download, submit visible, password toggle/reset navigation, seven auth hashes unchanged, no browser errors.' : 'PASS: all seven viewports, desktop card exact baseline parity, mobile form internal layout/styles/DOM parity, no mobile image download, password toggle and reset navigation, seven auth hashes unchanged, no browser errors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
