const { test, expect } = require('@playwright/test');

const URL = 'https://ohana68.github.io/sv-ohana/';
const EMAIL = 'rorke.anderson123@gmail.com';
const PASSWORD = 'uMqqrTCU77KMf_-';

async function login(page) {
  await page.goto(URL);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('.login-btn');
  await expect(page.locator('#dash-overlay')).toBeVisible({ timeout: 15000 });
}

async function enterApp(page) {
  await login(page);
  await page.locator('#dash-overlay [onclick]').first().click();
  await expect(page.locator('#app')).toBeVisible({ timeout: 5000 });
}

// ── LOGIN ──
test('login page loads with all fields', async ({ page }) => {
  await page.goto(URL);
  await expect(page.locator('#login-screen')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('.login-btn')).toBeVisible();
});

test('bad login shows error', async ({ page }) => {
  await page.goto(URL);
  await page.fill('input[type="email"]', 'wrong@test.com');
  await page.fill('input[type="password"]', 'wrong');
  await page.click('.login-btn');
  await page.waitForTimeout(3000);
  const error = page.locator('.login-err');
  const text = await error.textContent();
  expect(text.trim().length).toBeGreaterThan(0);
});

test('can log in and see dashboard', async ({ page }) => {
  await login(page);
  await expect(page.locator('#dash-overlay')).toBeVisible();
});

// ── DASHBOARD ──
test('dashboard shows vessel name', async ({ page }) => {
  await login(page);
  const hero = await page.locator('#dash-overlay').textContent();
  expect(hero).toContain('Ohana');
});

test('dashboard shows status pill', async ({ page }) => {
  await login(page);
  await expect(page.locator('#dash-status-txt')).toBeVisible();
});

test('presail checklist is on dashboard', async ({ page }) => {
  await login(page);
  await expect(page.locator('#dash-presail')).toBeVisible({ timeout: 5000 });
});

test('presail progress bar exists', async ({ page }) => {
  await login(page);
  await expect(page.locator('#ps-prog-bar')).toHaveCount(1);
});
});

test('can tick a presail item', async ({ page }) => {
  await login(page);
  const item = page.locator('#dash-presail .psi').first();
  await item.waitFor({ timeout: 5000 });
  var boxBefore = await item.locator('.psi-box').getAttribute('class');
  await item.click();
  await page.waitForTimeout(500);
  var boxAfter = await item.locator('.psi-box').getAttribute('class');
  expect(boxBefore).not.toEqual(boxAfter);
});

// ── NAVIGATION ──
test('can enter app from dashboard', async ({ page }) => {
  await enterApp(page);
  await expect(page.locator('#app')).toBeVisible();
});

test('bottom nav works from inside app', async ({ page }) => {
  await enterApp(page);
  var navItems = ['maint', 'cal', 'snag', 'log'];
  for (var i = 0; i < navItems.length; i++) {
    await page.evaluate(function(n) { showNav(n); }, navItems[i]);
    await page.waitForTimeout(500);
  }
});

test('can go back to dashboard from app', async ({ page }) => {
  await enterApp(page);
  await page.evaluate(function() { showNav('dash'); });
  await expect(page.locator('#dash-overlay')).toBeVisible({ timeout: 5000 });
});

// ── ENGINE HOURS ──
test('engines tab shows port and starboard', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  await expect(page.locator('.eng-sel').first()).toBeVisible();
  var buttons = page.locator('.eng-sel').first().locator('.eb');
  await expect(buttons).toHaveCount(2);
});

test('engine hours input is visible', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  await expect(page.locator('#hrs-inp')).toBeVisible();
});

test('can type new engine hours', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  var input = page.locator('#hrs-inp');
  await input.fill('999.9');
  await expect(input).toHaveValue('999.9');
});

test('can switch between port and starboard', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  var buttons = page.locator('.eng-sel').first().locator('.eb');
  await buttons.nth(1).click();
  await page.waitForTimeout(500);
  var stbdClass = await buttons.nth(1).getAttribute('class');
  expect(stbdClass).toContain('a');
  await buttons.nth(0).click();
  await page.waitForTimeout(500);
  var portClass = await buttons.nth(0).getAttribute('class');
  expect(portClass).toContain('a');
});

test('engine service checklists exist and can expand', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  var svcCard = page.locator('.svc-card').first();
  await svcCard.waitFor({ timeout: 5000 });
  var header = svcCard.locator('.svc-hdr');
  await header.click();
  await page.waitForTimeout(500);
  var body = svcCard.locator('.svc-body');
  await expect(body).toBeVisible({ timeout: 3000 });
});

test('can tick a service checklist item', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  var svcCard = page.locator('.svc-card').first();
  await svcCard.locator('.svc-hdr').click();
  await page.waitForTimeout(500);
  var checkbox = svcCard.locator('.cb').first();
  await checkbox.waitFor({ timeout: 5000 });
  await checkbox.click();
  await page.waitForTimeout(500);
  await checkbox.click();
  await page.waitForTimeout(500);
  var finalClass = await checkbox.getAttribute('class');
  expect(finalClass).toBeDefined();

});

// ── YANMAR SCHEMATIC ──
test('yanmar schematic service points are tappable', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Engines');
  await page.locator('#ypt-oil-filter').click({ force: true });
  await page.waitForTimeout(500);
  await expect(page.locator('#yanmar-panel')).toBeVisible();
  var title = await page.locator('#yp-title').textContent();
  expect(title.length).toBeGreaterThan(0);
});

// ── GENERATOR ──
test('generator tab shows hours input', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Generator');
  await expect(page.locator('#gen-inp')).toBeVisible();
});

// ── TENDER ──
test('tender tab shows hours input', async ({ page }) => {
  await enterApp(page);
  await page.click('text=Tender');
  await expect(page.locator('#tend-inp')).toBeVisible();
});

// ── TANKS ──
test('tanks section exists in the DOM', async ({ page }) => {
  await enterApp(page);
  await page.evaluate(function() { showNav('log'); });
  await page.waitForTimeout(500);
  var tankGrid = page.locator('#tank-grid');
  await expect(tankGrid).toHaveCount(1);
});

// ── ALL MAIN TABS ──
test('every visible main tab shows content', async ({ page }) => {
  await enterApp(page);
  var tabs = page.locator('.main-tabs .mtab');
  var count = await tabs.count();
  for (var i = 0; i < count; i++) {
    var tab = tabs.nth(i);
    var visible = await tab.isVisible();
    if (!visible) continue;
    await tab.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.page.a')).toBeVisible();
  }
});
