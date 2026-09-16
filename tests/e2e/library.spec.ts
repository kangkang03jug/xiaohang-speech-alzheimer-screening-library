import { test, expect } from '@playwright/test';

const primaryPaper =
  'Leveraging speech and artificial intelligence to screen for early Alzheimer’s disease and amyloid beta positivity';
const validationPaper =
  'Storyteller in ADNI4: Application of an early Alzheimer’s disease screening tool using brief, remote, and speech-based testing';

test('personal library exposes the Paper Pool, Quick Read, and detailed paper reports', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'XiaoHang 的阿尔茨海默病语音筛查研究库' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '论文池', exact: true }).click();
  await expect(page.getByRole('heading', { name: '论文池' })).toBeVisible();
  await expect(page.locator('[data-paper-row]')).toHaveCount(2);
  await page.getByRole('button', { name: '快速阅读' }).first().click();
  await expect(page.getByText(/200 名已有淀粉样蛋白/)).toBeVisible();
  await page.getByRole('link', { name: primaryPaper }).click();
  await expect(page.getByRole('heading', { name: primaryPaper })).toBeVisible();
  await page.getByRole('button', { name: '阅读详情' }).click();
  await expect(page.getByRole('heading', { name: '研究问题' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '实验与主要发现' })).toBeVisible();
  await expect(page.getByText(/不提供个体诊断或医疗建议/)).toBeVisible();
});

test('Daily Archive lists the initial research reading set', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '每日归档', exact: true }).click();
  await expect(page.getByRole('heading', { name: '每日归档' })).toBeVisible();
  await expect(page.getByRole('link', { name: primaryPaper })).toBeVisible();
  await expect(page.getByRole('link', { name: validationPaper })).toBeVisible();
});
