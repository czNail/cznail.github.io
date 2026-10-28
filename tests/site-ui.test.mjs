import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { headerMarkup } from '../packages/site-ui/shell.mjs';

const source = readFileSync(new URL('../packages/site-ui/runtime.js', import.meta.url), 'utf8');
function boot(values = {}, denied = false) {
  const stored = new Map(Object.entries(values));
  const handlers = {}, windowHandlers = {}, attributes = {};
  const button = { setAttribute: (name, value) => { attributes[name] = value; } };
  const document = { documentElement: { dataset: {} }, querySelectorAll: selector => selector === '[data-site-theme]' ? [button] : [], querySelector: () => null, addEventListener: (name, fn) => { handlers[name] = fn; } };
  const window = { addEventListener: (name, fn) => { windowHandlers[name] = fn; } };
  const localStorage = { getItem: name => { if (denied) throw Error('disabled'); return stored.get(name) ?? null; }, setItem: (name, value) => { if (denied) throw Error('disabled'); stored.set(name, value); } };
  vm.runInNewContext(source, { document, window, localStorage, getComputedStyle: () => ({ getPropertyValue: () => '' }), setTimeout });
  return { window, document, stored, attributes, handlers, windowHandlers };
}
test('canonical preference wins; old tool preference migrates without touching tool data', () => {
  const legacy = boot({ 'portfolio-pilot:theme': 'dark', 'portfolio-pilot:data': 'keep-me' });
  assert.equal(legacy.document.documentElement.dataset.theme, 'dark');
  assert.equal(legacy.stored.get('neil-homepage:theme'), 'dark');
  assert.equal(legacy.stored.get('portfolio-pilot:data'), 'keep-me');
  const current = boot({ 'neil-homepage:theme': 'light', 'portfolio-pilot:theme': 'dark' });
  assert.equal(current.document.documentElement.dataset.theme, 'light');
});
test('theme remains usable without storage and reflects button accessibility', () => {
  const context = boot({}, true);
  context.window.__siteUI.setTheme('dark');
  assert.equal(context.document.documentElement.dataset.theme, 'dark');
  assert.equal(context.attributes['aria-label'], '切换到浅色主题');
  assert.equal(context.attributes['aria-pressed'], 'true');
  context.window.__siteUI.setTheme('invalid');
  assert.equal(context.document.documentElement.dataset.theme, 'dark');
});
test('other tabs and Astro navigation retain the same preference', () => {
  const context = boot();
  context.stored.set('neil-homepage:theme', 'dark');
  context.windowHandlers.storage({ key: 'neil-homepage:theme' });
  assert.equal(context.document.documentElement.dataset.theme, 'dark');
  const next = { documentElement: { dataset: {} } };
  context.handlers['astro:before-swap']({ newDocument: next });
  assert.equal(next.documentElement.dataset.theme, 'dark');
  context.handlers['astro:page-load']();
  assert.equal(context.document.documentElement.dataset.theme, 'dark');
});
test('server-rendered navigation is escaped, filters unsafe URLs and marks the current section', () => {
  const html = headerMarkup({ active: 'blog', tools: [{ name: '<script>', url: '/safe/' }, { name: 'unsafe', url: 'javascript:alert(1)' }] });
  assert.match(html, /href="\/my-blog\/" aria-current="page"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /javascript:|<script>/);
  assert.match(html, /<summary>小工具<\/summary>/);
});
test('static menus carry their catalog without a browser refresh and keep old anchors', () => {
  const html = headerMarkup({active:'home',staticTools:true,tools:[{name:'实验台',url:'/pg-playground/'}]});
  assert.match(html, /data-tools-static/);
  assert.match(html, /href="\/#projects">作品/);
  assert.match(html, /href="\/#tools"/);
  assert.match(html, /href="\/pg-playground\/"/);
  assert.doesNotMatch(headerMarkup(), /data-tools-static/);
});
test('games has its own current navigation state without marking the tools menu', () => {
  const html = headerMarkup({active:'games'});
  assert.match(html, /href="\/games\/" aria-current="page">小游戏/);
  assert.doesNotMatch(html, /data-current-section="tools"/);
});

