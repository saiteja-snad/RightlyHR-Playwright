import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ManageWeekendsPage } from '../pages/ManageWeekendsPage';

test.describe('Manage Weekends', () => {

  // TC01 - Login successfully
  test('TC01 - Login successfully', async ({ page }) => {

    const loginPage = new LoginPage(page);

    await loginPage.loginFromEnv();

    await expect(page).toHaveURL(
      /\/dashboard\/emp/
    );

    await expect(
      page.getByText('Have a nice day at work!')
    ).toBeVisible();

  });


  // TC02 - Open Employee Fields
  test('TC02 - Open Employee Fields', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const weekendsPage = new ManageWeekendsPage(page);

    await loginPage.loginFromEnv();

    await weekendsPage.openEmployeeFields();

  });


  // TC03 - Open Manage Weekends
  test('TC03 - Open Manage Weekends', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const weekendsPage = new ManageWeekendsPage(page);

    await loginPage.loginFromEnv();

    await weekendsPage.openEmployeeFields();

    await weekendsPage.openManageWeekends();

    await expect(
      weekendsPage.manageWeekendsTitle
    ).toBeVisible();

    await expect(page).toHaveURL(
      /\/settings\/employee-fields\/manage-weekends\/pending-for-submission/
    );

  });


  // TC04 - Open Add Weekend
  test('TC04 - Open Add Weekend', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const weekendsPage = new ManageWeekendsPage(page);

    // Login
    await loginPage.loginFromEnv();

    // Open Employee Fields
    await weekendsPage.openEmployeeFields();

    // Open Manage Weekends
    await weekendsPage.openManageWeekends();

    // Click Add New
    await weekendsPage.openAddWeekend();

    // Verify Add Weekends page
    await expect(
      page.getByText('Add Weekends', { exact: true })
    ).toBeVisible();

  });

});

// TC04 - Open Add Weekend
test('TC04 - Open Add Weekend', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Click Add New
  await weekendsPage.openAddWeekend();

  // Verify Add Weekends page
  await expect(
    weekendsPage.addWeekendsTitle
  ).toBeVisible();

});

// TC05 - Validate required fields
// TC05 - Select Year
test('TC05 - Select Year', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

});
// TC06 - Select Location
test('TC06 - Select Location', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

  // Select Location
  await weekendsPage.selectLocation('Hyderabad');

});
// TC07 - Select Sub Location
test('TC07 - Select Sub Location', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

  // Select Location
  await weekendsPage.selectLocation('Hyderabad');

  // Select Sub Location
  await weekendsPage.selectSubLocation(
    'Ayyappa Society'
  );

});
// TC08 - Select Shift
test('TC08 - Select Shift', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

  // Select Location
  await weekendsPage.selectLocation('Hyderabad');

  // Select Sub Location
  await weekendsPage.selectSubLocation(
    'Ayyappa Society'
  );

  // Select Shift
  await weekendsPage.selectShift(
    'Holiday shift'
  );

});
// TC09 - Select Day
test('TC09 - Select Day', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

  // Select Location
  await weekendsPage.selectLocation('Hyderabad');

  // Select Sub Location
  await weekendsPage.selectSubLocation(
    'Ayyappa Society'
  );

  // Select Shift
  await weekendsPage.selectShift(
    'Holiday shift'
  );

  // Select Day
  await weekendsPage.selectDay('Sunday');

});
// TC10 - Select Occurrences
test('TC10 - Select Occurrences', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employee Fields
  await weekendsPage.openEmployeeFields();

  // Open Manage Weekends
  await weekendsPage.openManageWeekends();

  // Open Add Weekend
  await weekendsPage.openAddWeekend();

  // Select Year
  await weekendsPage.selectYear('2025');

  // Select Location
  await weekendsPage.selectLocation('Hyderabad');

  // Select Sub Location
  await weekendsPage.selectSubLocation(
    'Ayyappa Society'
  );

  // Select Shift
  await weekendsPage.selectShift(
    'Holiday shift'
  );

  // Select Day
  await weekendsPage.selectDay('Sunday');

  // Select 1st, 2nd, 3rd and 4th occurrences
  await weekendsPage.selectOccurrences(
    0,
    [1, 2, 3, 4]
  );

});
// TC11 - Add New Day
test('TC11 - Add New Day', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();
  await weekendsPage.openAddWeekend();

  await weekendsPage.selectYear('2025');
  await weekendsPage.selectLocation('Hyderabad');
  await weekendsPage.selectSubLocation('Ayyappa Society');
  await weekendsPage.selectShift('Holiday shift');
  await weekendsPage.selectDay('Sunday');

  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);

  // Click + Add New
  await weekendsPage.addNewDay();
});
// TC12 - Select Day in Second Row
test('TC12 - Select Day in Second Row', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();
  await weekendsPage.openAddWeekend();

  await weekendsPage.selectYear('2025');
  await weekendsPage.selectLocation('Hyderabad');
  await weekendsPage.selectSubLocation('Ayyappa Society');
  await weekendsPage.selectShift('Holiday shift');

  // First row
  await weekendsPage.selectDay('Sunday');

  // Add second row
  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);
  await weekendsPage.addNewDay();

  // Second row
  await weekendsPage.selectDay('Monday', 1);
});
// TC13 - Select Occurrences for Second Row
test('TC13 - Select Occurrences for Second Row', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();
  await weekendsPage.openAddWeekend();

  await weekendsPage.selectYear('2025');
  await weekendsPage.selectLocation('Hyderabad');
  await weekendsPage.selectSubLocation('Ayyappa Society');
  await weekendsPage.selectShift('Holiday shift');

  // First row
  await weekendsPage.selectDay('Sunday');
  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);

  // Add second row
  await weekendsPage.addNewDay();

  // Second row
  await weekendsPage.selectDay('Monday', 1);

  // Select 1st–4th occurrences for second row
  await weekendsPage.selectOccurrences(1, [1, 2, 3, 4]);
});
// TC14 - Submit Weekend Record
test('TC14 - Submit Weekend Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();
  await weekendsPage.openAddWeekend();

  await weekendsPage.selectYear('2025');
  await weekendsPage.selectLocation('Hyderabad');
  await weekendsPage.selectSubLocation('Ayyappa Society');
  await weekendsPage.selectShift('Holiday shift');

  // First row
  await weekendsPage.selectDay('Sunday');
  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);

  // Second row
  await weekendsPage.addNewDay();
  await weekendsPage.selectDay('Monday', 1);
  await weekendsPage.selectOccurrences(1, [1, 2, 3, 4]);

  // Submit
  await weekendsPage.submit();
});
// TC15 - Verify Submitted Weekend Record
test('TC15 - Verify Submitted Weekend Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  // Verify the submitted record
  const recordRow = weekendsPage.getRecordRow(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await expect(recordRow).toBeVisible();
});
// TC16 - Open Record Action Menu
test('TC16 - Open Record Action Menu', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );
});
// TC17 - Open Update Weekend
test('TC17 - Open Update Weekend', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();

  await expect(page).toHaveURL(/\/settings\/employee-fields\/update-weekends/);
});
// TC18 - Verify Update Weekend Page
test('TC18 - Verify Update Weekend Page', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();

  await expect(page).toHaveURL(
    /\/settings\/employee-fields\/update-weekends/
  );

  await expect(
    page.getByText('Update Weekends', { exact: true })
  ).toBeVisible();
});
// TC19 - Verify Existing Weekend Values
test('TC19 - Verify Existing Weekend Values', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();

  await expect(page).toHaveURL(
    /\/settings\/employee-fields\/update-weekends/
  );

  // Verify update page values
  await expect(
    page.getByText('2025', { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText('Hyderabad', { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText('Ayyappa Society', { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText('Holiday shift', { exact: true })
  ).toBeVisible();

  // Day is rendered as the value of a combobox, not as standalone text. The
  // record can have been updated by an earlier suite run, so only assert that
  // the persisted day value is populated here.
  await expect(
    page.getByRole('cell', { name: /Day.*dropdown trigger/i })
      .first()
      .getByRole('combobox')
  ).not.toHaveText('');
});
// TC20 - Change Day in Update Weekend
// TC20 - Change Day in Update Weekend
test('TC20 - Change Day in Update Weekend', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();
  await weekendsPage.setDay('Saturday');

  const day = page
    .getByRole('cell', { name: /Day.*dropdown trigger/i })
    .first()
    .getByRole('combobox');

  await expect(day).toHaveAccessibleName('Saturday');
});
// TC21 - Submit Updated Weekend Record
// TC21 - Submit Updated Weekend Record
test('TC21 - Submit Updated Weekend Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();
  await weekendsPage.setDay('Saturday');

  await page.getByRole('button', {
    name: 'Update',
    exact: true,
  }).click();

  await expect(page).toHaveURL(
    /\/settings\/employee-fields\/update-weekends/
  );
});
// TC22 - Verify Updated Weekend Record
// ...existing code...

test('TC22 - Verify Updated Weekend Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  const recordRow = weekendsPage.getRecordRow(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await expect(recordRow).toBeVisible();
});
// TC23 - Clone Weekend Record
test('TC23 - Clone Weekend Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'

  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone from Update page
  await weekendsPage.clone();
});
// TC24 - Verify Clone Form
test('TC24 - Verify Clone Form', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Verify cloned form is displayed
  await expect(
    page.getByRole('button', {
      name: 'Submit',
      exact: true,
    })
  ).toBeVisible();
});

// TC25 - Change Year in Cloned Record
test('TC25 - Change Year in Cloned Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year: 2025 → 2026
  await page.getByText('2025', { exact: true }).click();

  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Verify selected year
  await expect(
    page.getByText('2026', { exact: true })
  ).toBeVisible();
});
// TC26 - Change Location in Cloned Record
test('TC26 - Change Location in Cloned Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year: 2025 → 2026
  await page.getByText('2025', { exact: true }).click();

  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Change Location: Hyderabad → Gujarat
  // Change Location: Hyderabad → Gujarat
await page
  .getByRole('combobox', {
    name: 'Please select location',
  })
  .click();

await page.getByRole('option', {
  name: 'Gujarat',
  exact: true,
}).click();

// Verify location
await expect(
  page.getByText('Gujarat', { exact: true })
).toBeVisible();
});
// TC27 - Change Sub Location in Cloned Record
test('TC27 - Change Sub Location in Cloned Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year: 2025 → 2026
  await page.getByText('2025', { exact: true }).click();

  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Change Location: Hyderabad → Gujarat
  await page
    .getByRole('combobox', {
      name: 'Please select location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gujarat',
    exact: true,
  }).click();

  // Change Sub Location: Gujarat sub-location
  await page
    .getByRole('combobox', {
      name: 'Please select sub location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gandhi Nagar',
    exact: true,
  }).click();

  // Verify sub location
  await expect(
    page.getByText('Gandhi Nagar', { exact: true })
  ).toBeVisible();
});

// TC28 - Change Shift in Cloned Record
test('TC28 - Change Shift in Cloned Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();

  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year: 2025 → 2026
  await page.getByText('2025', { exact: true }).click();

  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Change Location: Hyderabad → Gujarat
  await page
    .getByRole('combobox', {
      name: 'Please select location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gujarat',
    exact: true,
  }).click();

  // Change Sub Location: Ayyappa Society → Gandhi Nagar
  await page
    .getByRole('combobox', {
      name: 'Please select sub location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gandhi Nagar',
    exact: true,
  }).click();

  // Change Shift: Holiday shift → Gen
  await page
    .getByRole('combobox', {
      name: 'Please select shift',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gen',
    exact: true,
  }).click();

  // Verify shift
  await expect(
    page.getByText('Gen', { exact: true })
  ).toBeVisible();
});

// TC29 - Change Day in Cloned Record
test('TC29 - Change Day in Cloned Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  await weekendsPage.clickUpdate();
  await weekendsPage.clone();

  await page.getByText('2025', { exact: true }).click();
  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  await page.getByRole('combobox', {
    name: 'Please select location',
  }).click();
  await page.getByRole('option', {
    name: 'Gujarat',
    exact: true,
  }).click();

  await page.getByRole('combobox', {
    name: 'Please select sub location',
  }).click();
  await page.getByRole('option', {
    name: 'Gandhi Nagar',
    exact: true,
  }).click();

  await page.getByRole('combobox', {
    name: 'Please select shift',
  }).click();
  await page.getByRole('option', {
    name: 'Gen',
    exact: true,
  }).click();

  await weekendsPage.setDay('Saturday');

  const dayRows = page.getByRole('row', {
    name: /Day.*dropdown trigger/i,
  });

  await expect(dayRows.nth(0).getByRole('combobox'))
    .toHaveAccessibleName('Saturday');

  if (await dayRows.count() > 1) {
    await expect(dayRows.nth(1).getByRole('combobox'))
      .toHaveAccessibleName('Monday');
  }
});
// TC30 - Select Occurrences in Cloned Record
test('TC30 - Select Occurrences in Cloned Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year
  await page.getByText('2025', { exact: true }).click();
  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Change Location
  await page
    .getByRole('combobox', {
      name: 'Please select location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gujarat',
    exact: true,
  }).click();

  // Change Sub Location
  await page
    .getByRole('combobox', {
      name: 'Please select sub location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gandhi Nagar',
    exact: true,
  }).click();

  // Change Shift
  await page
    .getByRole('combobox', {
      name: 'Please select shift',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gen',
    exact: true,
  }).click();

  // Monday is already a second cloned row and is disabled for this row.
  await weekendsPage.setDay('Saturday');

  // Select 1st–4th occurrences
  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);
});

// TC31 - Submit Cloned Weekend Record
test('TC31 - Submit Cloned Weekend Record', async ({ page }) => {

  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2025',
    'Hyderabad',
    'Ayyappa Society',
    'Holiday shift'
  );

  // Open Update page
  await weekendsPage.clickUpdate();

  // Clone record
  await weekendsPage.clone();

  // Change Year: 2025 → 2026
  await page.getByText('2025', { exact: true }).click();
  await page.getByRole('option', {
    name: '2026',
    exact: true,
  }).click();

  // Change Location: Hyderabad → Gujarat
  await page
    .getByRole('combobox', {
      name: 'Please select location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gujarat',
    exact: true,
  }).click();

  // Change Sub Location: Ayyappa Society → Gandhi Nagar
  await page
    .getByRole('combobox', {
      name: 'Please select sub location',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gandhi Nagar',
    exact: true,
  }).click();

  // Change Shift: Holiday shift → Gen
  await page
    .getByRole('combobox', {
      name: 'Please select shift',
    })
    .click();

  await page.getByRole('option', {
    name: 'Gen',
    exact: true,
  }).click();

  // Monday is already a second cloned row and is disabled for this row.
  await weekendsPage.setDay('Saturday');

  // Select occurrences
  await weekendsPage.selectOccurrences(0, [1, 2, 3, 4]);

  // Submit cloned record
  await weekendsPage.submit();
});

// TC32 - Verify Cloned Weekend Record
test('TC32 - Verify Cloned Weekend Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  const recordRow = weekendsPage.getRecordRow(
    '2026',
    'Gujarat',
    'Gandhi Nagar',
    'Gen'
  );

  await expect(recordRow).toBeVisible();
});
// TC33 - Verify Cloned Weekend Day
test('TC33 - Verify Cloned Weekend Day', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openRecordActionMenu(
    '2026',
    'Gujarat',
    'Gandhi Nagar',
    'Gen'
  );

  await weekendsPage.clickUpdate();

  const day = page
    .getByRole('cell', { name: /Day.*dropdown trigger/i })
    .first()
    .getByRole('combobox');

  await expect(day).toHaveAccessibleName('Saturday');
});
// TC34 - Verify Published Weekend Record
test('TC34 - Verify Published Weekend Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  // Open Published tab
  await weekendsPage.openPublishedTab();

  // Verify published cloned weekend record
  const recordRow = weekendsPage.getRecordRow(
    '2026',
    'Gujarat',
    'Gandhi Nagar',
    'Gen'
  );

  await expect(recordRow).toBeVisible();
});

// TC35 - Verify Published Weekend Record
test('TC35 - Verify Published Weekend Record', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  await weekendsPage.openPublishedTab();

  const recordRow = weekendsPage.getRecordRow(
    '2026',
    'Gujarat',
    'Gandhi Nagar',
    'Gen'
  );

  await expect(recordRow).toBeVisible();
});
// TC36 - Verify Published Weekend Record Details
test('TC36 - Verify Published Weekend Record Details', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const weekendsPage = new ManageWeekendsPage(page);

  await loginPage.loginFromEnv();
  await weekendsPage.openEmployeeFields();
  await weekendsPage.openManageWeekends();

  // Open Published tab
  await weekendsPage.openPublishedTab();

  // Verify the published record
  const recordRow = weekendsPage.getRecordRow(
    '2026',
    'Gujarat',
    'Gandhi Nagar',
    'Gen'
  );

  await expect(recordRow).toBeVisible();

  // Verify the record contains the expected values
  await expect(recordRow).toContainText('2026');
  await expect(recordRow).toContainText('Gujarat');
  await expect(recordRow).toContainText('Gandhi Nagar');
  await expect(recordRow).toContainText('Gen');
});
