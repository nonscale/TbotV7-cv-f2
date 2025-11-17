import { test, expect } from '@playwright/test';

test.describe('Strategy Builder E2E Test', () => {
  const BASE_URL = 'http://localhost:5173';

  test.beforeEach(async ({ page }) => {
    // 개발 서버 URL로 이동
    await page.goto(BASE_URL);
    // 페이지가 완전히 로드되기를 기다림 (앱이 복잡할 경우 selector를 기다리는 것이 더 안정적)
    await page.waitForSelector('h2:text("Strategy Builder")');
  });

  test('should render the initial UI correctly', async ({ page }) => {
    // 초기 UI 요소 확인
    await expect(page.locator('h2')).toHaveText('Strategy Builder');
    await expect(page.locator('input[placeholder="전략 이름 입력"]')).toBeVisible();
    await expect(page.locator('button:text("Save")')).toBeVisible();
    await expect(page.locator('h3:text("팔레트")')).toBeVisible();
    await expect(page.locator('button:text("최종 조합")')).toHaveClass(/active/);
    await expect(page.locator('h3:text("최종 캔버스")')).toBeVisible();
    await expect(page.locator('button:text("Run Scan")')).toBeVisible();

    // 초기 스크린샷
    await page.screenshot({ path: 'test-results/01-initial-render.png' });
  });

  test('should allow creating and editing a logic variable', async ({ page }) => {
    // 1. 조건 추가 버튼 클릭
    await page.click('button:text("+")');

    // 2. 새로운 탭이 생성되고 활성화되었는지 확인
    await expect(page.locator('button:text("조건_1")')).toBeVisible();
    await expect(page.locator('button:text("조건_1")')).toHaveClass(/active/);

    // 3. 변수 이름과 타임프레임 UI가 나타나는지 확인
    await expect(page.locator('input.variable-name-input')).toHaveValue('조건_1');
    await expect(page.locator('select')).toHaveValue('1d');

    // 스크린샷
    await page.screenshot({ path: 'test-results/02-new-variable-created.png' });

    // 4. 팔레트에서 아이템 클릭하여 캔버스에 추가
    await page.click('button:text("close")');
    await page.click('button:text(">")');
    await page.click('button:text("open")');

    // 5. Preview에 내용이 반영되었는지 확인
    await expect(page.locator('.preview-box')).toContainText('조건_1 (1d): close > open');

    // 스크린샷
    await page.screenshot({ path: 'test-results/03-items-added-to-variable.png' });
  });

  test('should build a final expression and save the strategy', async ({ page }) => {
    // 조건 변수 2개 생성
    await page.click('button:text("+")'); // 조건_1 생성
    await page.click('button:text("close")');
    await page.click('button:text(">")');
    await page.click('button:text("open")');

    await page.click('button:text("+")'); // 조건_2 생성
    await page.click('button:text("volume")');
    await page.click('button:text(">")');
    await page.locator('input[placeholder="숫자 입력"]').fill('10000');
    await page.keyboard.press('Enter');

    // 최종 조합 캔버스로 전환
    await page.click('button:text("최종 조합")');

    // 팔레트의 '조건식 변수' 섹션에 변수들이 있는지 확인
    await expect(page.locator('.palette-section:has-text("조건식 변수") button:text("조건_1")')).toBeVisible();
    await expect(page.locator('.palette-section:has-text("조건식 변수") button:text("조건_2")')).toBeVisible();

    // 변수들을 최종 캔버스에 추가
    await page.click('.palette-section:has-text("조건식 변수") button:text("조건_1")');
    await page.click('button:text("AND")');
    await page.click('.palette-section:has-text("조건식 변수") button:text("조건_2")');

    // 최종 조합 Preview 확인
    await expect(page.locator('.preview-box')).toContainText('최종 조합: 조건_1 AND 조건_2');
    await page.screenshot({ path: 'test-results/04-final-expression-built.png' });

    // 전략 저장
    const strategyName = `E2E 테스트 전략 ${Date.now()}`;
    await page.locator('input[placeholder="전략 이름 입력"]').fill(strategyName);

    // Save 버튼 클릭과 API 응답 기다리기를 동시에 수행
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/v1/strategies') && resp.status() === 200),
      page.click('button:text("Save")'),
    ]);

    // 저장 성공 확인 (드롭다운에 추가되었는지 확인)
    await expect(page.locator(`select option:text("${strategyName}")`)).toBeVisible();
    await page.screenshot({ path: 'test-results/05-strategy-saved.png' });

    // 새로고침 후 다시 불러오기
    await page.reload();
    await page.waitForSelector('h2:text("Strategy Builder")');

    // 드롭다운에서 저장된 전략 선택
    await page.locator('select').nth(2).selectOption({ label: strategyName });

    // 상태가 복원되었는지 확인
    await expect(page.locator('.preview-box')).toContainText('조건_1 (1d): close > open');
    await expect(page.locator('.preview-box')).toContainText('최종 조합: 조건_1 AND 조건_2');
    await page.screenshot({ path: 'test-results/06-strategy-loaded.png' });
  });

  test.skip('should run scan and show results', async ({ page }) => { // TODO: ScanResultsTable 복구 후 이 테스트 활성화 필요
    // 간단한 전략 생성
    await page.locator('input[placeholder="전략 이름 입력"]').fill('간단한 스캔 전략');
    await page.click('button:text("+")');
    await page.locator('select').selectOption('1d');
    await page.click('button:text("close")');
    await page.click('button:text(">")');
    await page.locator('input[placeholder="숫자 입력"]').fill('0');
    await page.keyboard.press('Enter');
    await page.click('button:text("최종 조합")');
    await page.click('.palette-section:has-text("조건식 변수") button:text("조건_1")');

    // 스캔 실행
    await page.click('button:text("Run Scan")');

    // 로딩 상태 확인
    await expect(page.locator('button:text("Scanning...")')).toBeVisible();
    await expect(page.locator('.loading-spinner')).toBeVisible(); // ScanResultsTable에 로딩 인디케이터가 있다고 가정

    // 결과 테이블이 나타나기를 기다림 (최대 30초)
    await expect(page.locator('table')).toBeVisible({ timeout: 30000 });

    // 결과가 최소 1개 이상 있는지 확인 (API 응답에 따라 달라짐)
    const resultsCount = await page.locator('tbody tr').count();
    expect(resultsCount).toBeGreaterThan(0);

    await page.screenshot({ path: 'test-results/07-scan-results.png' });
  });
});
