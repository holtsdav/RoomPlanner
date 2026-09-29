import { test, expect } from './fixtures';

test('ramp profile follows run, reverses uphill, and respects locking', async ({
  page,
}, info) => {
  await page.goto('./');
  await expect(page.locator('canvas').first()).toBeVisible();
  if (info.project.name === 'mobile') {
    await page
      .getByRole('button', { name: 'Open object library', exact: true })
      .click();
  }
  await page
    .locator('summary:visible')
    .filter({ hasText: /^Accessibility$/ })
    .click();
  await page
    .getByRole('button', { name: 'Choose Wheelchair ramp', exact: true })
    .click();
  await page.getByRole('menuitem', { name: /150 mm rise \/ 1:12/ }).click();
  const edit = page.getByRole('button', {
    name: 'Edit selected objects',
    exact: true,
  });
  if (await edit.isVisible()) await edit.click();
  const profile = page.getByRole('region', { name: 'Ramp slope' });
  await expect(profile).toContainText('1:12 slope · 8.3% · 4.8°');
  const depth = page.getByRole('textbox', {
    name: 'Object depth in cm',
    exact: true,
  });
  await depth.fill('240');
  await depth.press('Enter');
  await expect(profile).toContainText('1:16 slope · 6.3% · 3.6°');
  await expect(profile.locator('svg[aria-label]')).toHaveAttribute(
    'aria-label',
    'Ramp side view: 15 cm rise over 240 cm horizontal run',
  );
  const reverse = page.getByRole('button', {
    name: 'Reverse uphill',
    exact: true,
  });
  const rotation = page.getByRole('textbox', {
    name: 'Object rotation in degrees',
    exact: true,
  });
  await reverse.click();
  await expect(rotation).toHaveValue('180');
  await reverse.click();
  await expect(rotation).toHaveValue('0');
  await page.getByRole('button', { name: 'Lock object', exact: true }).click();
  await expect(reverse).toBeDisabled();
  await expect(depth).toBeDisabled();
});
