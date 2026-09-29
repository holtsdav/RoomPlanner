import { test, expect } from './fixtures';

test('ramp uses only plan controls, resizes, reverses uphill, and respects locking', async ({
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
  await page.getByRole('menuitem', { name: /Standard/ }).click();
  const edit = page.getByRole('button', {
    name: 'Edit selected objects',
    exact: true,
  });
  if (await edit.isVisible()) await edit.click();
  await expect(page.getByRole('region', { name: 'Ramp slope' })).toHaveCount(0);
  await expect(page.getByText('Ramp · side view', { exact: true })).toHaveCount(
    0,
  );
  const depth = page.getByRole('textbox', {
    name: 'Object depth in cm',
    exact: true,
  });
  await depth.fill('240');
  await depth.press('Enter');
  await expect(depth).toHaveValue('240');
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
