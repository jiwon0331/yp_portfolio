const { chromium } = require('C:/Users/문지원/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = 'C:/Users/문지원/Documents/Codex/yp_portfolio/outputs/site';
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relative = pathname.replace(/^\/portfolio\//, '');
  const file = path.resolve(root, relative || 'index.html');
  if (!file.startsWith(path.resolve(root) + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(bytes);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/portfolio/`;
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [], failedResponses = [], consoleErrors = [], failedRequests = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', request => failedRequests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failedResponses.push(response.url()); });
    async function ready() {
      await page.goto(url);
      await page.locator('.project-card').first().waitFor();
      assert.equal(await page.locator('.project-card').count(), 4);
      assert.equal(await page.locator('.additional-item').count(), 4);
    }
    async function open(id) {
      const trigger = page.locator(`#project-${id} button`).filter({ hasText: 'View Case Study' });
      await trigger.click();
      await page.locator('dialog[open]').waitFor();
      return page.locator('dialog .case-gallery');
    }
    async function activeImage() {
      const img = page.locator('dialog .gallery-image:not([hidden]) img');
      await img.waitFor({ state: 'visible' });
      await img.evaluate(element => element.complete && element.naturalWidth > 0 ? undefined : new Promise((resolve, reject) => {
        element.addEventListener('load', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
      }));
      return path.basename(new URL(await img.getAttribute('src'), url).pathname);
    }
    await ready();
    const mainText = await page.locator('main').innerText();
    assert.doesNotMatch(mainText, /성과공유회 기획서 작성|매개변수 분석|undefined/);
    assert.ok(mainText.includes('회귀분석 / Regression Analysis'));
    assert.ok(mainText.includes('매개효과 분석 / Mediation Analysis'));
    const oa = page.locator('.skill-group').filter({ has: page.locator('h3', { hasText: '문서·데이터 활용' }) });
    assert.deepEqual(await oa.locator('.skill-tools li').allTextContents(), ['Excel', 'PowerPoint', '한글 / Hangul Word Processor']);
    assert.ok((await oa.locator('.skill-level').innerText()).includes('중 / Intermediate'));
    assert.ok((await oa.innerText()).includes('컴퓨터활용능력 1급'));
    assert.equal(await page.locator('#learning .section-heading .eyebrow').innerText(), '04');
    assert.equal(await page.locator('#learning-title > span').first().innerText(), 'INTEREST AREAS');
    assert.equal(await page.locator('#learning-title .title-ko').innerText(), '관심 영역');
    assert.ok((await page.locator('#learning-interest-title').innerText()).includes('Areas of Interest'));
    assert.ok((await page.locator('.learning-note').innerText()).includes('기존 수행 경험과 구분'));
    assert.equal(await page.locator('.learning-card').count(), 5);
    console.log('PASS rendered WHAT I BRING, statistics, OA and Interest Areas content');
    for (const project of data.projects) {
      const gallery = await open(project.id);
      const detailText = await page.locator('dialog .case-study').innerText();
      assert.doesNotMatch(detailText, /성과공유회 기획서 작성|매개변수 분석|undefined/);
      if (project.id === 'koica-paraguay') assert.ok(detailText.includes('성과공유회 PPT 및 영상 제작'));
      if (project.id === 'research-data-analysis') {
        assert.ok(detailText.includes('회귀분석 / Regression Analysis'));
        assert.ok(detailText.includes('매개효과 분석 / Mediation Analysis'));
      }
      if (!project.images.length) {
        assert.equal(await gallery.count(), 0);
        assert.equal(await page.locator(`#project-${project.id}-gallery`).count(), 0);
        assert.ok((await page.locator('dialog .case-study').innerText()).trim().length > 0);
      } else {
        await gallery.waitFor({ state: 'visible' });
        assert.equal(await activeImage(), path.basename(project.images[0].src));
        if (project.images.length > 1) {
          const prev = gallery.getByRole('button', { name: '이전 사진' });
          const next = gallery.getByRole('button', { name: '다음 사진' });
          await prev.click();
          assert.equal(await activeImage(), path.basename(project.images.at(-1).src));
          await next.click();
          assert.equal(await activeImage(), path.basename(project.images[0].src));
          for (let i = 1; i < project.images.length; i++) {
            await next.click();
            assert.equal(await activeImage(), path.basename(project.images[i].src));
            assert.equal(await gallery.locator('.gallery-counter').innerText(), `${i + 1} / ${project.images.length}`);
          }
          await next.click();
          assert.equal(await activeImage(), path.basename(project.images[0].src));
        } else {
          assert.equal(await gallery.getByRole('button').count(), 0);
        }
      }
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('dialog[open]').count(), 0);
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), `${project.title} — View Case Study`);
      console.log(`PASS ${project.id}: ${project.images.length} images, wraparound/details/focus`);
    }
    for (const width of [375, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const gallery = await open('koica-paraguay');
      await activeImage();
      await gallery.scrollIntoViewIfNeeded();
      const frameHeight = await gallery.locator('.gallery-frame').first().evaluate(el => el.getBoundingClientRect().height);
      await gallery.getByRole('button', { name: '이전 사진' }).click();
      await activeImage();
      assert.equal(await gallery.locator('.gallery-image:not([hidden]) .gallery-frame').evaluate(el => el.getBoundingClientRect().height), frameHeight);
      for (const button of await gallery.getByRole('button').all()) {
        const box = await button.boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('.modal-content').evaluate(el => el.scrollWidth <= el.clientWidth), true);
      assert.equal(await gallery.locator('.gallery-image:not([hidden]) img').evaluate(el => getComputedStyle(el).objectFit), 'contain');
      if (width === 375 || width === 1440) await page.screenshot({ path: path.join(__dirname, `carousel-${width}.png`) });
      await page.keyboard.press('Escape');
      if (width === 375) {
        await page.getByRole('button', { name: 'Menu — 주요 메뉴 열기', exact: true }).click();
        await page.locator('#primary-navigation a[href="#learning"]').click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      }
      console.log(`PASS viewport ${width}: contain, fixed frame, 44px controls, no overflow`);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failedResponses, []);
    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(failedRequests, []);
    console.log('PASS normal browsing: zero console errors, JS exceptions, failed requests or HTTP errors');
    // Exercise numeric sorting on shuffled data and project-name fallback alt.
    const fixtures = structuredClone(data);
    fixtures.projects[0].images.reverse();
    fixtures.projects[0].images.forEach(img => { delete img.alt; img.caption = '긴 설명 '.repeat(60) + 'long-caption-'.repeat(30); });
    await page.route('**/data/projects.json', route => route.fulfill({ json: fixtures }));
    await ready();
    let gallery = await open('koica-paraguay');
    assert.equal(await activeImage(), '1.jpg');
    assert.match(await gallery.locator('.gallery-image:not([hidden]) img').getAttribute('alt'), /KOICA 프로젝트 봉사단/);
    await page.setViewportSize({ width: 375, height: 900 });
    assert.equal(await page.locator('.modal-content').evaluate(el => el.scrollWidth <= el.clientWidth), true);
    await page.keyboard.press('Escape');
    console.log('PASS shuffled numeric sorting, fallback alt, long caption');
    // Missing/null/malformed images must not suppress cards or textual details.
    for (const variant of [null, [], [{ src: '', alt: 'empty' }], [{ src: 'https://example.invalid/image.jpg', alt: 'external' }]]) {
      fixtures.projects[0].images = variant;
      await ready();
      gallery = await open('koica-paraguay');
      assert.equal(await gallery.count(), 0);
      assert.ok((await page.locator('dialog .case-study').innerText()).includes('주요 수행'));
      await page.keyboard.press('Escape');
    }
    // All failed files remove the Gallery section; one failed file is skipped.
    const valid = data.projects[0].images[0];
    for (const images of [[{ src: 'assets/missing-1.jpg', alt: 'missing' }], [{ src: 'assets/missing-1.jpg', alt: 'missing' }, valid]]) {
      fixtures.projects[0].images = images;
      await ready();
      gallery = await open('koica-paraguay');
      if (images.length === 1) {
        await page.waitForFunction(() => !document.querySelector('dialog .case-gallery'));
        assert.equal(await page.locator('#project-koica-paraguay-gallery').count(), 0);
      } else {
        await gallery.waitFor({ state: 'visible' });
        await gallery.getByRole('button', { name: '다음 사진' }).click();
        await page.waitForFunction(() => document.querySelector('dialog .gallery-controls').hidden);
        assert.equal(await activeImage(), '1.jpg');
      }
      assert.ok((await page.locator('dialog .case-study').innerText()).includes('주요 수행'));
      await page.keyboard.press('Escape');
    }
    assert.deepEqual(errors, []);
    console.log('PASS empty/invalid/all-failed/partly-failed image handling and preserved text');
    // A failed path must not be requested again every time its detail is reopened.
    let missingRequests = 0;
    page.on('request', request => { if (request.url().includes('qa-missing-repeat.jpg')) missingRequests++; });
    fixtures.projects[0].images = [{ src: 'assets/qa-missing-repeat.jpg', alt: 'missing' }];
    await ready();
    for (let attempt = 0; attempt < 3; attempt++) {
      await open('koica-paraguay');
      await page.waitForFunction(() => !document.querySelector('dialog .case-gallery'));
      await page.keyboard.press('Escape');
    }
    assert.equal(missingRequests, 1, 'Repeated 404s when reopening a missing image');
    console.log('PASS missing image requested only once across three detail opens');
    console.log('ALL CHECKS PASSED');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
