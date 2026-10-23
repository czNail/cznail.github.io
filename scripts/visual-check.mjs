import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from '@playwright/test';

const roots = { '/my-blog': resolve('../my-blog/dist'), '/totp': resolve('../totp/dist'), '/portfolio-pilot': resolve('../portfolio-pilot/dist'), '': resolve('dist') };
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const prefix = Object.keys(roots).find(prefix => path === prefix || path.startsWith(prefix + '/')) ?? '';
    const root = roots[prefix];
    let file = resolve(root, '.' + (path.slice(prefix.length) || '/'));
    if (file !== root && !file.startsWith(root + sep)) throw Error('outside root');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] } : {}) });
await mkdir('artifacts/site-ui', { recursive: true });
try {
  for (const width of [375, 1280]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('neil-homepage:theme', theme), theme);
    let reference;
    for (const path of ['/', '/my-blog/', '/totp/', '/portfolio-pilot/']) {
      const page = await context.newPage();
      const errors = [];
      const githubRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (new URL(request.url()).hostname === 'api.github.com') githubRequests.push(request.url()); });
      // Avoid live catalog requests in a deterministic local visual check.
      await page.route('**/api.github.com/**', route => route.abort());
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.locator('.site-ui-header').waitFor();
      const style = await page.evaluate(() => {
        const header = document.querySelector('.site-ui-header');
        const css = getComputedStyle(header);
        const brand = document.querySelector('.site-ui-brand');
        return { background: css.backgroundColor, color: css.color, font: css.fontFamily, height: header.getBoundingClientRect().height, brandFont: getComputedStyle(brand).fontSize, brandWeight: getComputedStyle(brand).fontWeight, theme: document.documentElement.dataset.theme, bodyBackground: getComputedStyle(document.body).backgroundColor, bodyColor: getComputedStyle(document.body).color, bodyFont: getComputedStyle(document.body).fontFamily, accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      assert.equal(style.theme, theme, `${path}: theme`);
      assert.equal(style.overflow, false, `${path} at ${width}px: horizontal overflow`);
      assert.deepEqual(errors, [], `${path}: browser errors`);
      if (reference) assert.deepEqual(style, reference, `${path}: shared header differs`);
      else reference = style;
      const button = page.locator('[data-site-theme]');
      await button.click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), theme === 'dark' ? 'light' : 'dark');
      await button.click();
      const summary = page.locator('.site-ui-header summary');
      await summary.click();
      assert.equal(await page.locator('.site-ui-header .tools-popover a').count() >= 3, true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.site-ui-header details').getAttribute('open'), null);
      await summary.evaluate(element => element.blur());
      if (path === '/') {
        const cards = page.locator('#projects .project-card');
        const repositories = await cards.evaluateAll(elements => elements.map(element => element.dataset.repository));
        assert.equal(new Set(repositories).size, repositories.length, 'a work must only appear once');
        assert.equal(repositories[0], 'pg-playground', 'editorial order');
        const playground = page.locator('[data-catalog-preview] [data-repository="pg-playground"]');
        assert.equal(await playground.locator('.work-primary').getAttribute('href'), 'https://cznail.github.io/pg-playground/');
        assert.equal(await playground.locator('.source-link').getAttribute('href'), 'https://github.com/czNail/pg-playground');
        assert.equal(await page.locator('.recommendation').getAttribute('data-repository'), 'pg-playground');
        assert.equal(await page.locator('#tools').count(), 1, 'old tools deep link');
        assert.deepEqual(githubRequests, [], 'homepage/menu must not contact GitHub');
        const latest = JSON.parse(await readFile('src/data/posts.json', 'utf8'))[0];
        assert.equal(await page.locator('.featured-reading').getAttribute('href'), latest.url, 'hero recommends the latest published article');
        assert.equal(await page.locator('.featured-post').getAttribute('href'), latest.url, 'writing card uses the same latest article');
        assert.equal(await page.locator('.post-cover .pattern-reading').isVisible(), true, 'fixed book art');
        assert.equal(await page.locator('.post-cover img').count(), 0, 'article cover does not replace the book art');
        for (const image of await page.locator('.project-preview img, .post-cover img').all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(element => element.decode());
          assert.ok(await image.evaluate(element => element.naturalWidth > 0), 'preview image must load');
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      }
      await page.screenshot({ path: `artifacts/site-ui/${path.replaceAll('/', '') || 'home'}-${width}-${theme}.png`, fullPage: true });
      // Long-form typography and client-side blog navigation need their own check.
      if (path === '/my-blog/' && width === 375 && theme === 'dark') {
        await page.locator('main a[href*="/posts/"]').first().click();
        await page.waitForLoadState('networkidle');
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'blog article overflow');
        await page.screenshot({ path: 'artifacts/site-ui/blog-article-375-dark.png', fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(base + '/');
  await page.locator('[data-site-theme]').click();
  for (const path of ['/my-blog/', '/totp/', '/portfolio-pilot/']) {
    await page.goto(base + path);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', `theme lost entering ${path}`);
  }
  const other = await context.newPage();
  await other.goto(base + '/');
  await other.locator('[data-site-theme]').click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await context.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: {width:375,height:960} });
  const staticPage = await noJS.newPage();
  await staticPage.goto(base + '/');
  assert.equal(await staticPage.locator('.project-card').count() >= 4, true, 'works must render without JS');
  await staticPage.locator('.site-ui-header summary').click();
  assert.equal(await staticPage.locator('.site-ui-header .tools-popover').isVisible(), true, 'native menu works without JS');
  assert.equal(await staticPage.locator('[data-repository="pg-playground"] .work-primary').getAttribute('href'), 'https://cznail.github.io/pg-playground/');
  await noJS.close();
  console.log('Four sites: desktop/mobile, light/dark, navigation and cross-tab theme checks passed. Screenshots: artifacts/site-ui');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
