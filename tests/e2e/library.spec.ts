import { test, expect } from '@playwright/test';

const primaryPaper =
  'Leveraging speech and artificial intelligence to screen for early Alzheimer’s disease and amyloid beta positivity';
const validationPaper =
  'Storyteller in ADNI4: Application of an early Alzheimer’s disease screening tool using brief, remote, and speech-based testing';
const primaryDirection = 'Speech-based Alzheimer’s disease screening';

test('English personal library exposes the Paper Pool, Quick Read, and detailed paper reports', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: primaryDirection })).toBeVisible();
  await expect(page.locator('.hero-subtitle')).toHaveText('Research Library');
  await expect(page.locator('.hero .lede')).toContainText(
    'A personal research library on speech and language biomarkers',
  );
  await expect(page.getByRole('link', { name: 'Paper Pool', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Chinese' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('link', { name: '论文池', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '切换为 English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'Paper Pool', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Paper Pool' })).toBeVisible();
  await expect(page.locator('[data-paper-row]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Quick Read' }).first().click();
  await expect(page.getByText(/自动故事回忆/)).toBeVisible();
  await page.getByRole('link', { name: primaryPaper }).click();
  await expect(page.getByRole('heading', { name: primaryPaper })).toBeVisible();
  await page.getByRole('button', { name: 'Read Detail' }).click();
  await expect(page.getByRole('heading', { name: 'Research Questions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experiments & Key Findings' })).toBeVisible();
  await expect(page.getByText(/not individual diagnosis or medical advice/i)).toBeVisible();
  await expect(page.locator('#method p').first()).toContainText('收集故事原文、即时复述和延迟复述');
});

test('Daily Archive lists the initial research reading set', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Daily Archive', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Daily Archive' })).toBeVisible();
  await expect(page.getByRole('link', { name: primaryPaper })).toBeVisible();
  await expect(page.getByRole('link', { name: validationPaper })).toBeVisible();
  const visibleArchiveText = await page
    .locator('body')
    .evaluate((element) => (element as HTMLElement).innerText);
  expect(visibleArchiveText).not.toMatch(/[\u3400-\u9fff]/);
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
