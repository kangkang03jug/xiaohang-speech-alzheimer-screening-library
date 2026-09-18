import { test, expect } from '@playwright/test';

const primaryPaper =
  'Leveraging speech and artificial intelligence to screen for early Alzheimer’s disease and amyloid beta positivity';
const validationPaper =
  'Storyteller in ADNI4: Application of an early Alzheimer’s disease screening tool using brief, remote, and speech-based testing';
const primaryDirection = '基于语音的阿尔茨海默病筛查';

test('Chinese personal library exposes the Paper Pool, Quick Read, and detailed paper reports', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.removeItem('research-library-locale'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { name: primaryDirection })).toBeVisible();
  await expect(page.locator('.eyebrow')).toContainText('研究知识库 ·');
  await expect(page.locator('.hero-subtitle')).toHaveText('研究知识库');
  await expect(page.locator('.hero .lede')).toContainText('围绕语音与语言数字生物标志物');
  await expect(page.getByRole('link', { name: '论文池', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '论文池', exact: true }).click();
  await expect(page.getByRole('heading', { name: '论文池' })).toBeVisible();
  await expect(page.locator('[data-paper-row]')).toHaveCount(2);
  await page.getByRole('button', { name: '快速阅读' }).first().click();
  await expect(page.getByText(/自动故事回忆/)).toBeVisible();
  await page.getByRole('link', { name: primaryPaper }).click();
  await expect(page.getByRole('heading', { name: primaryPaper })).toBeVisible();
  await page.getByRole('button', { name: '阅读详情 ↓' }).click();
  await expect(page.getByRole('heading', { name: '研究问题' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '实验与主要发现' })).toBeVisible();
  await expect(page.getByText(/不提供个体诊断或医疗建议/)).toBeVisible();
  await expect(page.locator('#method p').first()).toContainText('收集故事原文、即时复述和延迟复述');
});

test('Daily Archive lists the initial research reading set', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '每日归档', exact: true }).click();
  await expect(page.getByRole('heading', { name: '每日归档' })).toBeVisible();
  await expect(page.getByRole('link', { name: primaryPaper })).toBeVisible();
  await expect(page.getByRole('link', { name: validationPaper })).toBeVisible();
  const visibleArchiveText = await page
    .locator('body')
    .evaluate((element) => (element as HTMLElement).innerText);
  expect(visibleArchiveText).toMatch(/[\u3400-\u9fff]/);
});
test('hero title wraps long text without overflowing at desktop and mobile widths', async ({
  page,
}) => {
  await page.goto('/');
  const heroTitle = page.locator('.hero h1');
  await heroTitle.evaluate((element) => {
    element.textContent =
      'A deliberately long research library title that should wrap naturally to fit the available content width without creating horizontal overflow';
  });

  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 800 });
    const metrics = await heroTitle.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lineTops = new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top)));
      const titleBounds = element.getBoundingClientRect();
      return {
        whiteSpace: getComputedStyle(element).whiteSpace,
        lineCount: lineTops.size,
        titleOverflows: element.scrollWidth > element.clientWidth + 1,
        titleOutsideViewport: titleBounds.left < -1 || titleBounds.right > window.innerWidth + 1,
      };
    });

    expect(metrics.whiteSpace).not.toBe('nowrap');
    expect(metrics.lineCount).toBeGreaterThan(1);
    expect(metrics.titleOverflows).toBe(false);
    expect(metrics.titleOutsideViewport).toBe(false);
  }
});
