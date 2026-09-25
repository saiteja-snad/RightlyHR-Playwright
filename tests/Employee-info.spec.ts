import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
//tc01 - Open Employee Info
test('TC01 - Open Employee Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  await page.locator('div:nth-child(2) > a').click();

  await expect(page).toHaveURL(/personal[-/]?info/i);
});
//tc02 - Verify Basic Info fields
test('TC02 - Verify Basic Info fields', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Verify Basic Info fields
  await expect(
    page.getByRole('textbox', {
      name: 'Please enter employee ID',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: 'Please select salutation',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: 'Please select gender',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Date Of Birth*',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: 'Please select marital status',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Save',
      exact: true,
    })
  ).toBeVisible();
});
//tc03
test('TC03 - Select Salutation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Open Salutation dropdown
  await page
    .getByRole('combobox', {
      name: 'Please select salutation',
    })
    .click();

  // Select Mr.
  await page
    .getByRole('option', {
      name: 'Mr.',
      exact: true,
    })
    .click();

  // Verify selected value
  await expect(
    page.getByText('Mr.', { exact: true }).last()
  ).toBeVisible();
});
//tc04
test('TC04 - Select Gender', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Open Gender dropdown
  await page
    .getByRole('combobox', {
      name: 'Please select gender',
    })
    .click();

  // Select Male
  await page
    .getByRole('option', {
      name: 'Male',
      exact: true,
    })
    .click();

  // Verify selected value
  await expect(
    page.getByText('Male', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC05 - Verify Marital Status Selection
// ========================================

test('TC05 - Select Marital Status', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Open Marital Status dropdown
  await page
    .getByRole('combobox', {
      name: 'Please select marital status',
    })
    .click();

  // Select Single
  await page
    .getByText('Single', { exact: true })
    .click();

  // Verify selected value
  await expect(
    page.getByText('Single', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC06 - Verify Blood Group Selection
// ========================================

test('TC06 - Select Blood Group', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Open Blood Group dropdown
  await page
    .getByRole('combobox', {
      name: 'Please select blood group',
    })
    .click();

  // Select AB+
  await page
    .getByText('AB+', { exact: true })
    .click();

  // Verify selected value
  await expect(
    page.getByText('AB+', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC07 - Verify Date of Birth
// ========================================

test('TC07 - Enter Date of Birth', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Enter Date of Birth
  const dateOfBirth = page.getByRole('textbox', {
    name: 'Date Of Birth*',
  });

  await dateOfBirth.fill('2003-07-16');

  // Verify entered date
  await expect(dateOfBirth).toHaveValue('2003-07-16');
});
// ========================================
// TC08 - Verify Employee ID Field
// ========================================

test('TC08 - Enter Employee ID', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Enter Employee ID
  const employeeId = page.getByRole('textbox', {
    name: 'Please enter employee ID',
  });

  await employeeId.fill('EMP001');

  // Verify entered Employee ID
  await expect(employeeId).toHaveValue('EMP001');
});
// ========================================
// TC09 - Verify First Name Field
// ========================================

test('TC09 - Enter First Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Enter First Name
  const firstName = page.getByRole('textbox', {
    name: 'First Name*',
  });

  await firstName.fill('Arpita');

  // Verify First Name
  await expect(firstName).toHaveValue('Arpita');
});
// ========================================
// TC10 - Verify Last Name Field
// ========================================

test('TC10 - Enter Last Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Enter Last Name
  const lastName = page.getByRole('textbox', {
    name: 'Last Name*',
  });

  await lastName.fill('Bhanja');

  // Verify Last Name
  await expect(lastName).toHaveValue('Bhanja');
});
// ========================================
// TC11 - Verify Middle Name Field
// ========================================

test('TC11 - Enter Middle Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Enter Middle Name
  const middleName = page.getByRole('textbox', {
    name: 'Middle Name',
  });

  await middleName.fill('K');

  // Verify Middle Name
  await expect(middleName).toHaveValue('K');
});
// ========================================
// TC12 - Verify Basic Info Save and Close
// ========================================

test('TC12 - Save and Close Basic Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Employee Info
  await page.locator('div:nth-child(2) > a').click();

  // Select Salutation
  await page
    .getByRole('combobox', {
      name: 'Please select salutation',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Mr.',
    })
    .click();

  // Select Gender
  await page
    .getByRole('combobox', {
      name: 'Please select gender',
    })
    .click();

  await page
    .getByText('Male', {
      exact: true,
    })
    .click();

  // Select Marital Status
  await page
    .getByRole('combobox', {
      name: 'Please select marital status',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Single',
    })
    .click();

  // Select Blood Group
  await page
    .getByRole('combobox', {
      name: 'Please select blood group',
    })
    .click();

  await page
    .getByText('AB+', {
      exact: true,
    })
    .click();

  // Enter Date of Birth
  await page
    .getByRole('textbox', {
      name: 'Date Of Birth*',
    })
    .fill('2003-07-16');

  // Save Basic Info
  await page
    .getByRole('button', {
      name: 'Save',
      exact: true,
    })
    .click();

  // Close Basic Info
  await page
    .getByRole('button', {
      name: 'Close',
      exact: true,
    })
    .click();
});
// ========================================
// TC13 - Verify Contact Info
// ========================================

test('TC13 - Verify Contact Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Verify Contact Info fields
  await expect(
    page.getByRole('textbox', {
      name: 'Please enter phone number',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Work Mail*',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Personal Email*',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'LinkedIn Url',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('textbox', {
      name: 'Please enter work number',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Save',
      exact: true,
    })
  ).toBeVisible();
});
// ========================================
// TC14 - Verify Phone Number
// ========================================

test('TC14 - Enter Phone Number', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Phone Number
  const phoneNumber = page.getByRole('textbox', {
    name: 'Please enter phone number',
  });

  await phoneNumber.fill('8596741235');

  // Verify Phone Number
  await expect(phoneNumber).toHaveValue('8596741235');
});
// ========================================
// TC15 - Verify Work Email
// ========================================

test('TC15 - Enter Work Email', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Work Email
  const workEmail = page.getByRole('textbox', {
    name: 'Work Mail*',
  });

  await workEmail.fill('arpita.bhanja@snaddevelopers.com');

  // Verify Work Email
  await expect(workEmail).toHaveValue(
    'arpita.bhanja@snaddevelopers.com'
  );
});
// ========================================
// TC16 - Verify Personal Email
// ========================================

test('TC16 - Enter Personal Email', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Personal Email
  const personalEmail = page.getByRole('textbox', {
    name: 'Personal Email*',
  });

  await personalEmail.fill('arpita.personal@gmail.com');

  // Verify Personal Email
  await expect(personalEmail).toHaveValue(
    'arpita.personal@gmail.com'
  );
});
// ========================================
// TC17 - Verify LinkedIn URL
// ========================================

test('TC17 - Enter LinkedIn URL', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter LinkedIn URL
  const linkedInUrl = page.getByRole('textbox', {
    name: 'LinkedIn Url',
  });

  await linkedInUrl.fill('https://www.linkedin.com/in/arpita-bhanja');

  // Verify LinkedIn URL
  await expect(linkedInUrl).toHaveValue(
    'https://www.linkedin.com/in/arpita-bhanja'
  );
});
// ========================================
// TC18 - Enter Work Number
// ========================================

test('TC18 - Enter Work Number', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Contact Info
  await page
    .getByRole('img', { name: 'Contact Info' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Work Number
  const workNumber = page.getByRole('textbox', {
    name: 'Please enter work number',
  });

  await workNumber.fill('8956412368');

  // Verify Work Number
  await expect(workNumber).toHaveValue('8956412368');
});
// ========================================
// TC19 - Verify Addresses
// ========================================

test('TC19 - Verify Addresses', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Addresses
  await page
    .getByRole('img', { name: 'Addresses' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Verify Addresses section
  await expect(
    page.getByText('Addresses', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC20 - Verify Emergency Contacts
// ========================================

test('TC20 - Verify Emergency Contacts', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page
    .getByRole('img', { name: 'Emergency Contacts' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Verify Emergency Contacts section
  await expect(
    page.getByText('Emergency Contacts', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC21 - Enter Emergency Contact 1 Name
// ========================================

test('TC21 - Enter Emergency Contact 1 Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page
    .getByRole('img', { name: 'Emergency Contacts' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Emergency Contact 1 Name
  const contactName = page.locator('#contact1Name');

  await contactName.fill('ram');

  // Verify
  await expect(contactName).toHaveValue('ram');
});
// ========================================
// TC22 - Enter Emergency Contact 1 Email
// ========================================

test('TC22 - Enter Emergency Contact 1 Email', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page
    .getByRole('img', { name: 'Emergency Contacts' })
    .click();

  await page.locator('div:nth-child(2) > a').click();

  // Enter Emergency Contact 1 Email
  const contactEmail = page.locator('#contact1Email');

  await contactEmail.fill('ram@yopmail.com');

  // Verify
  await expect(contactEmail).toHaveValue('ram@yopmail.com');
});

// ========================================
// TC23 - Enter Emergency Contact 1 Phone Number
// ========================================

test('TC23 - Enter Emergency Contact 1 Phone Number', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Select country
  await page.getByText('Select country').first().click();

  const countrySearch = page.getByRole('textbox').nth(2);
  await countrySearch.fill('india');

  await countrySearch.press('ArrowDown');

  await page
    .locator('lib-country-list')
    .filter({ hasText: 'Select countryBritish Indian' })
    .getByRole('textbox')
    .press('Enter');

  // Enter phone number
  const phoneNumber = page
    .locator('form')
    .filter({ hasText: 'Name*Email IDPhone Number*+' })
    .getByPlaceholder('Please enter phone number');

  await phoneNumber.click();
  await phoneNumber.fill('7894561235');
  // Verify phone number after UI formatting
await expect(phoneNumber).toHaveValue('078945 61235');
});
/// ========================================
// TC24 - Select Emergency Contact 1 Relationship
// ========================================

test('TC24 - Select Emergency Contact 1 Relationship', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Select first Emergency Contact relationship
  const relationship = page
    .getByRole('combobox', {
      name: 'Please select relationship',
    })
    .first();

  await relationship.click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Verify
  await expect(
    page.getByText('Brother', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC25 - Enter Emergency Contact 2 Name
// ========================================

test('TC25 - Enter Emergency Contact 2 Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Enter Emergency Contact 2 Name
  const contactName = page.locator('#contact2Name');

  await contactName.fill('janu');

  // Verify
  await expect(contactName).toHaveValue('janu');
});
// ========================================
// TC26 - Enter Emergency Contact 2 Email
// ========================================

test('TC26 - Enter Emergency Contact 2 Email', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Enter Emergency Contact 2 Email
  const contactEmail = page.locator('#contact2Email');

  await contactEmail.fill('janu@yopmail.com');

  // Verify
  await expect(contactEmail).toHaveValue('janu@yopmail.com');
});
// ========================================
// TC27 - Enter Emergency Contact 2 Phone Number
// ========================================

test('TC27 - Enter Emergency Contact 2 Phone Number', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Select country for Contact 2
  await page.getByText('Select country').nth(1).click();

  const countrySearch = page.getByRole('textbox').nth(2);
  await countrySearch.fill('india');

  await page
    .locator('lib-country-list')
    .filter({ hasText: 'Select countryAfghanistan' })
    .getByRole('textbox')
    .fill('ind');

  await page.getByRole('listbox').getByText('+91').click();

  // Enter Contact 2 phone number
  const phoneNumber = page
    .locator('form')
    .filter({ hasText: 'Name*Email IDPhone Number *+' })
    .getByPlaceholder('Please enter phone number');

  await phoneNumber.fill('8956231456');

  // Verify formatted phone number
  await expect(phoneNumber).toHaveValue('089562 31456');
});
// ========================================
// TC28 - Select Emergency Contact 2 Relationship
// ========================================

test('TC28 - Select Emergency Contact 2 Relationship', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Select second Emergency Contact relationship
  const relationship = page
    .getByRole('combobox', {
      name: 'Please select relationship',
    })
    .nth(1);

  await relationship.click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Verify
  await expect(
    page.getByText('Brother', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC29 - Save and Close Emergency Contacts
// ========================================

test('TC29 - Save and Close Emergency Contacts', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Emergency Contacts
  await page.getByText('Emergency Contacts').click();
  await page.locator('div:nth-child(2) > a').click();

  // Contact 1 - Name
  await page.locator('#contact1Name').fill('ram');

  // Contact 1 - Email
  await page.locator('#contact1Email').fill('ram@yopmail.com');

  // Contact 1 - Country
  await page.getByText('Select country').first().click();

  const country1 = page.getByRole('textbox').nth(2);
  await country1.fill('india');
  await country1.press('ArrowDown');

  await page
    .locator('lib-country-list')
    .filter({ hasText: 'Select countryBritish Indian' })
    .getByRole('textbox')
    .press('Enter');

  // Contact 1 - Phone
  const phone1 = page
    .locator('form')
    .filter({ hasText: 'Name*Email IDPhone Number*+' })
    .getByPlaceholder('Please enter phone number');

  await phone1.fill('7894561235');

  // Contact 1 - Relationship
  await page
    .getByRole('combobox', {
      name: 'Please select relationship',
    })
    .first()
    .click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Contact 2 - Name
  await page.locator('#contact2Name').fill('janu');

  // Contact 2 - Email
  await page.locator('#contact2Email').fill('janu@yopmail.com');

 // Contact 2 - Country
await page.getByText('Select country').click();

const country2 = page
  .locator('lib-country-list')
  .filter({ hasText: 'Select countryAfghanistan' })
  .getByRole('textbox');

await country2.fill('ind');

await page.getByRole('listbox').getByText('+91').click();
  // Contact 2 - Phone
  const phone2 = page
    .locator('form')
    .filter({ hasText: 'Name*Email IDPhone Number *+' })
    .getByPlaceholder('Please enter phone number');

  await phone2.fill('8956231456');

  // Contact 2 - Relationship
  // Contact 2 - Relationship
const relationships = page.getByRole('combobox', {
  name: 'Please select relationship',
});

await relationships.last().click();

await page.getByRole('option', {
  name: 'Brother',
  exact: true,
}).click();

  // Verify Save is enabled
  const saveButton = page.getByRole('button', {
    name: 'Save',
  });

  await expect(saveButton).toBeEnabled();

  // Save
  await saveButton.click();

  // Close
  await page.getByRole('button', {
    name: 'Close',
  }).click();
});

// ========================================
// TC30 - Verify Family Members
// ========================================

test('TC30 - Verify Family Members', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Family Members section
  await expect(
    page.getByText('Family Members', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC31 - Enter Family Member Name
// ========================================

test('TC31 - Enter Family Member Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Enter Family Member Name
  const name = page.getByRole('textbox', {
    name: 'Name*',
  });

  await name.fill('dad');

  // Verify
  await expect(name).toHaveValue('dad');
});
// ========================================
// TC32 - Enter Family Member Date of Birth
// ========================================

test('TC32 - Enter Family Member Date of Birth', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Enter Date of Birth
  const dateOfBirth = page.getByRole('textbox', {
    name: 'Date of Birth*',
  });

  await dateOfBirth.fill('2005-10-25');

  // Verify
  await expect(dateOfBirth).toHaveValue('2005-10-25');
});
// ========================================
// TC33 - Select Family Member Relationship
// ========================================

test('TC33 - Select Family Member Relationship', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Select Relationship
  const relationship = page.getByRole('combobox', {
    name: 'Please select relationship',
  });

  await relationship.click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Verify
  await expect(
    page.getByText('Brother', { exact: true }).last()
  ).toBeVisible();
});
// ========================================
// TC34 - Verify Dependent Checkbox
// ========================================

test('TC34 - Verify Dependent Checkbox', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Verify Dependent checkbox
  const dependent = page.getByRole('checkbox', {
    name: 'Dependent',
  });

  await expect(dependent).toBeVisible();

  // Select Dependent
  await dependent.check();

  // Verify selected
  await expect(dependent).toBeChecked();
});
// ========================================
// TC35 - Add Family Member
// ========================================

test('TC35 - Add Family Member', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Enter Name
  await page.getByRole('textbox', {
    name: 'Name*',
  }).fill('dad');

  // Enter Date of Birth
  await page.getByRole('textbox', {
    name: 'Date of Birth*',
  }).fill('2005-10-25');

  // Select Relationship
  await page.getByRole('combobox', {
    name: 'Please select relationship',
  }).click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Select Dependent
  await page.getByRole('checkbox', {
    name: 'Dependent',
  }).check();

  // Click Add
  const addButton = page.getByRole('button', {
    name: 'Add',
  });

  await expect(addButton).toBeEnabled();
  await addButton.click();
});
// ========================================
// TC36 - Verify Added Family Member
// ========================================

test('TC36 - Verify Added Family Member', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();
// Verify added family member
await expect(
  page.getByRole('cell', { name: 'dad' }).first()
).toBeVisible();
});
// ========================================
// TC37 - Verify Family Member Relationship
// ========================================

test('TC37 - Verify Family Member Relationship', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify relationship
  await expect(
    page.getByRole('cell', { name: 'Brother' }).first()
  ).toBeVisible();
});

// ========================================
// TC38 - Verify Family Member Date of Birth
// ========================================

test('TC38 - Verify Family Member Date of Birth', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Date of Birth
  await expect(
    page.getByRole('cell', { name: 'Oct 25,' }).first()
  ).toBeVisible();
});
// ========================================
// TC39 - Verify Dependent Status
// ========================================

test('TC39 - Verify Dependent Status', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Dependent status
  await expect(
    page.getByRole('cell', { name: 'Yes' }).first()
  ).toBeVisible();
});

// ========================================
// TC40 - Add Family Member Successfully
// ========================================

test('TC40 - Add Family Member Successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Click Add New
  await page.getByText('Add New').click();

  // Enter Name
  await page.getByRole('textbox', {
    name: 'Name*',
  }).fill('Test Member');

  // Enter Date of Birth
  await page.getByRole('textbox', {
    name: 'Date of Birth*',
  }).fill('2004-05-15');

  // Select Relationship
  await page.getByRole('combobox', {
    name: 'Please select relationship',
  }).click();

  await page.getByRole('option', {
    name: 'Brother',
    exact: true,
  }).click();

  // Select Dependent
  await page.getByRole('checkbox', {
    name: 'Dependent',
  }).check();

  // Add
  const addButton = page.getByRole('button', {
    name: 'Add',
  });

  await expect(addButton).toBeEnabled();
  await addButton.click();

  // Verify added member
  await expect(
    page.getByRole('cell', {
      name: 'Test Member',
    }).first()
  ).toBeVisible();
});
// ========================================
// TC41 - Verify Family Member Name
// ========================================

test('TC41 - Verify Family Member Name', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Family Member Name
  await expect(
    page.getByRole('cell', {
      name: 'Test Member',
    }).first()
  ).toBeVisible();
});
// ========================================
// TC43 - Verify Family Member Relationship
// ========================================

test('TC43 - Verify Family Member Relationship', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Relationship
  await expect(
    page.getByRole('cell', {
      name: 'Brother',
    }).first()
  ).toBeVisible();
});
// ========================================
// TC44 - Verify Family Member Dependent Status
// ========================================

test('TC44 - Verify Family Member Dependent Status', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page.getByRole('img', {
    name: 'Family Members',
  }).click();

  // Verify Dependent Status
  await expect(
    page.getByRole('cell', {
      name: 'Yes',
    }).first()
  ).toBeVisible();
});
// ========================================
// TC45 - Update Family Member
// ========================================

test('TC45 - Update Family Member', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Family Members
  await page
    .getByRole('img', { name: 'Family Members' })
    .click();

  // Select Test Member
  await page
    .getByRole('cell', { name: 'Test Member' })
    .first()
    .click();

  // Open action menu
await page
  .locator('tr:nth-child(2) > .text-center.ng-star-inserted > .dropdown > span > .bi')
  .click();

// Click visible Update menu item
await page
  .locator('a.dropdown-item:visible')
  .filter({ hasText: 'Update' })
  .click();

  // Update Name
  const name = page.getByRole('textbox', {
    name: 'Name*',
  });

  await name.fill('Updated Member');

  // Click Update button
  await page
    .getByRole('button', { name: 'Update' })
    .click();

  // Verify updated name
  await expect(
    page.getByRole('cell', {
      name: 'Updated Member',
    }).first()
  ).toBeVisible();
});
// ========================================
// TC46 - Verify Identity Info
// ========================================

test('TC46 - Verify Identity Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Identity Info
  await page
    .locator('div')
    .filter({ hasText: /^Identity Info$/ })
    .nth(1)
    .click();

  // Verify Identity Info section
  await expect(
    page.getByText('Identity Info', { exact: true }).last()
  ).toBeVisible();
});


// ========================================
// TC47 - Add Identity Information
// ========================================

test('TC47 - Add Identity Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Identity Info
  await page
    .locator('div')
    .filter({ hasText: /^Identity Info$/ })
    .nth(1)
    .click();

  // Click Add New
  await page.getByText('Add New', { exact: true }).click();

  // Select Identity Type
  const identityType = page.getByRole('combobox', {
    name: 'Please select identity type',
  });

  await identityType.click();

  await page.getByRole('option', {
    name: 'Driving',
    exact: true,
  }).click();

  // Enter Identity Number
  const identityNumber = page.getByRole('textbox', {
    name: 'Identity Type* Identity',
  });

  await identityNumber.fill('455255789526');

  await expect(identityNumber).toHaveValue('455255789526');

  // Upload Identity Document
  await page
  .getByRole('button', { name: 'Choose File' })
  .setInputFiles('tests/images/pexels-quang-nguyen-vinh-222549-6348018.jpg');
  // Add Identity
  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: true,
  });

  await expect(addButton).toBeEnabled();
  await addButton.click();
});


// ========================================
// TC48 - Update Identity Information
// ========================================

test('TC48 - Update Identity Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Identity Info
  await page
    .locator('div')
    .filter({ hasText: /^Identity Info$/ })
    .nth(1)
    .click();

  // Open identity row action menu
  await page.locator('i').nth(3).click();

  // Click Update
  await page
    .getByRole('button', { name: ' Update' })
    .click();

  // Update Identity Number
  const identityNumber = page.getByRole('textbox', {
    name: 'Identity Number*',
  });

  await identityNumber.fill('8859650336633');

  await expect(identityNumber).toHaveValue('8859650336633');

  // Update
  await page.getByRole('button', {
    name: 'Update',
    exact: true,
  }).click();
});


// ========================================
// TC49 - Update Identity Number Again
// ========================================

test('TC49 - Update Identity Number Again', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Identity Info
  await page
    .locator('div')
    .filter({ hasText: /^Identity Info$/ })
    .nth(1)
    .click();

  // Open identity action
  await page.locator('i').nth(3).click();

  // Click Update
  await page
    .getByRole('button', { name: ' Update' })
    .click();

  // Update Identity Number
  const identityNumber = page.getByRole('textbox', {
    name: 'Identity Number*',
  });

  await identityNumber.fill('885965033663');

  await expect(identityNumber).toHaveValue('885965033663');

  // Update
  await page.getByRole('button', {
    name: 'Update',
    exact: true,
  }).click();
});
// ========================================
// TC50 - Delete Identity Information
// ========================================

test('TC50 - Delete Identity Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto(
    '/employee-management/active/employees',
    { waitUntil: 'domcontentloaded' }
  );

  // Select employee
  await page
    .getByText('Arpita Bhanja', { exact: true })
    .first()
    .click();

  // Open Identity Info
  await page
    .locator('div')
    .filter({ hasText: /^Identity Info$/ })
    .nth(1)
    .click();

  // Wait for Identity Info data
  await expect(
    page.getByText('Driving', { exact: true })
  ).toBeVisible();

  // Find the identity row
  const identityRow = page
    .getByRole('row')
    .filter({ hasText: 'Driving' })
    .first();

  // Open action menu for the identity
  await identityRow
    .locator('.dropdown > span > .bi')
    .click();

  // Click Delete
  await page
    .getByRole('button', { name: ' Delete' })
    .click();

  // Confirm Delete
  await page
    .getByRole('button', { name: 'Yes', exact: true })
    .click();
});
// ========================================
// TC51 - Bank Info Complete Flow
// ========================================
// ========================================
// TC51 - Bank Info Complete Flow
// ========================================
// ========================================
// TC51 - Bank Info Complete Flow
// ========================================
// TC51 - Bank Info Complete Flow
// ========================================
// TC51 - Bank Info Complete Flow
// ========================================
// ========================================
// TC51 - Add Bank Information
// ========================================

// ========================================
// TC51 - Add Bank Information
// ========================================

test('TC51 - Add Bank Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Bank Info
  await page
    .getByRole('img', {
      name: 'Bank Info',
    })
    .click();

  // Click Add New
  await page
    .getByText('Add New', {
      exact: true,
    })
    .click();

  // Select Bank Name
  await page
    .getByRole('combobox', {
      name: 'Please select bank name',
    })
    .click();

  await page
    .getByLabel('Option List')
    .getByText('Andhra Pradesh Grameena Vikas', {
      exact: false,
    })
    .click();

  // Account Holder Name
  const accountHolderName = page.getByRole('textbox', {
    name: "Account Holder's Name*",
  });

  await accountHolderName.fill('gana');

  await expect(accountHolderName).toHaveValue('gana');

  // Account Number
  const accountNumber = page.getByRole('spinbutton', {
    name: 'Account Number*',
  });

  await accountNumber.fill('84555426326232');

  await expect(accountNumber).toHaveValue(
    '84555426326232'
  );

  // IFSC Code
  const ifscCode = page.getByRole('textbox', {
    name: 'IFSC Code*',
  });

  await ifscCode.fill('26233332333');

  await expect(ifscCode).toHaveValue('26233332333');

  // Upload Bank Document
  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles(
      'tests/images/pexels-quang-nguyen-vinh-222549-6348018.jpg'
    );

  // Primary Bank
  const primaryBank = page.getByRole('checkbox', {
    name: 'Primary Bank',
  });

  await primaryBank.check();

  await expect(primaryBank).toBeChecked();

  // Add Bank
  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: true,
  });

  await expect(addButton).toBeEnabled();

  await addButton.click();
});
// ========================================
// TC52 - Update Bank Information
// ========================================

test('TC52 - Update Bank Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Bank Info
  await page
    .getByRole('img', {
      name: 'Bank Info',
    })
    .click();

  // Find Bank Row
  const bankRow = page
    .getByRole('row')
    .filter({
      hasText: 'gana',
    })
    .first();

  await expect(bankRow).toBeVisible({
    timeout: 30000,
  });

  // Open Action Menu
  await bankRow
    .locator('.dropdown > span > .bi')
    .click();

  // Click Update
  await page
    .getByRole('button', {
      name: /Update/i,
    })
    .click();

  // Update Modal
  const modal = page.locator('ngb-modal-window');

  await expect(modal).toBeVisible();

  // Update Account Holder Name
  const accountHolderName = modal.getByRole('textbox', {
    name: "Account Holder's Name*",
  });

  await accountHolderName.fill('sai ram tej');

  await expect(accountHolderName).toHaveValue(
    'sai ram tej'
  );

  // Primary Bank
  const primaryBank = modal.getByRole('checkbox', {
    name: 'Primary Bank',
  });

  await primaryBank.check();

  await expect(primaryBank).toBeChecked();

  // Update
  await modal
    .getByRole('button', {
      name: 'Update',
      exact: true,
    })
    .click();

  // Verify Update Modal Closed
  await expect(modal).toBeHidden({
    timeout: 30000,
  });
});

// ========================================
// TC53 - Delete Bank Information
// ========================================

test('TC53 - Delete Bank Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Bank Info
  await page
    .getByRole('img', {
      name: 'Bank Info',
    })
    .click();

  // Find Updated Bank Row
  const bankRow = page
    .getByRole('row')
    .filter({
      hasText: 'sai ram tej',
    })
    .first();

  await expect(bankRow).toBeVisible({
    timeout: 30000,
  });

  // Open Action Menu
  await bankRow
    .locator('.dropdown > span > .bi')
    .click();

  // Click Delete
  await page
    .getByRole('button', {
      name: /Delete/i,
    })
    .click();

  // Confirm Delete
  await page
    .getByRole('button', {
      name: 'Yes',
      exact: true,
    })
    .click();

  // Verify Bank Row Deleted
  await expect(bankRow).toBeHidden({
    timeout: 30000,
  });
});

// ========================================
// TC54 - Add Academic Information
// ========================================
// ========================================
// TC54 - Add Academic Information
// ========================================

test('TC54 - Add Academic Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Academics
  await page
    .getByRole('img', {
      name: 'Academics',
    })
    .click();

  // Add New
  await page
    .getByText('Add New', {
      exact: true,
    })
    .click();

  // Qualification
  const qualification = page.getByRole('combobox', {
    name: 'please select qualification',
  });

  await qualification.click();

  await page
    .getByRole('option', {
      name: 'Masters',
      exact: true,
    })
    .click();

  // University
  const university = page.getByRole('textbox', {
    name: 'University*',
  });

  await university.fill('ku');

  await expect(university).toHaveValue('ku');

  // Specialization
  const specialization = page.getByRole('textbox', {
    name: 'Specialization*',
  });

  await specialization.fill('eee');

  await expect(specialization).toHaveValue('eee');

  // GPA / CGPA
  const cgpa = page.getByRole('spinbutton', {
    name: 'GPA/CGPA*',
  });

  await cgpa.fill('7');

  await expect(cgpa).toHaveValue('7');

  // From Date
  const fromDate = page.getByRole('textbox', {
    name: 'From Date*',
  });

  await fromDate.fill('2022-02-02');

  await expect(fromDate).toHaveValue('2022-02-02');

  // To Date
  const toDate = page.getByRole('textbox', {
    name: 'To Date*',
  });

  await toDate.fill('2026-09-07');

  await expect(toDate).toHaveValue('2026-09-07');

  // Upload Document
  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles(
      'tests/images/pexels-quang-nguyen-vinh-222549-6348018.jpg'
    );

  // Add
  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: true,
  });

  await expect(addButton).toBeEnabled();

  await addButton.click();
});
// ========================================
// TC55 - Update Academic Information
// ========================================

test('TC55 - Update Academic Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Academics
  await page
    .getByRole('img', {
      name: 'Academics',
    })
    .click();

  // Open Academic Action Menu
  await page.locator('i').nth(3).click();

  // Click Update
  await page
    .getByText('Update', {
      exact: true,
    })
    .first()
    .click();

  // Update University
  const university = page.getByRole('textbox', {
    name: 'University*',
  });

  await university.fill('jntu-h');

  await expect(university).toHaveValue('jntu-h');

  // Update GPA / CGPA
  const cgpa = page.getByRole('spinbutton', {
    name: 'GPA/CGPA*',
  });

  await cgpa.fill('9.5');

  await expect(cgpa).toHaveValue('9.5');

  // Update
  await page
    .getByRole('button', {
      name: 'Update',
      exact: true,
    })
    .click();
});
// ========================================
// TC56 - Delete Academic Information
// ========================================

test('TC56 - Delete Academic Information', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Academics
  await page
    .getByRole('img', {
      name: 'Academics',
    })
    .click();

  // Open Academic Action Menu
  await page.locator('i').nth(3).click();

  // Click Delete
  await page
    .getByText('Delete', {
      exact: true,
    })
    .first()
    .click();

  // Confirm Delete
  await page
    .getByRole('button', {
      name: 'Yes',
      exact: true,
    })
    .click();
});
// ========================================
// TC57 - Add Skills
// ========================================

test('TC57 - Add Skills', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Skills
  await page
    .getByRole('img', {
      name: 'Skills',
    })
    .click();

  // ========================================
  // Add Technical Skill
  // ========================================

  await page
    .getByText('Add New Skill', {
      exact: true,
    })
    .click();

  // Skill Category
  await page
    .getByRole('combobox', {
      name: 'Please select skill category',
    })
    .click();

  await page
    .getByLabel('Technical Skills')
    .getByText('Technical Skills', {
      exact: true,
    })
    .click();

  // Skill
  const skillInput = page.getByRole('textbox', {
    name: 'Please type a skill and press',
  });

  await skillInput.fill('.net');
  await skillInput.press('Enter');

  // Proficiency
  await page
    .getByRole('combobox', {
      name: 'Please select proficiency',
    })
    .click();

  await page
    .getByLabel('Intermediate')
    .getByText('Intermediate', {
      exact: true,
    })
    .click();

  // Change Proficiency to Beginner
  await page
    .getByRole('combobox', {
      name: 'Intermediate',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Beginner',
      exact: true,
    })
    .click();

  // Change Proficiency to Expert
  await page
    .getByRole('combobox', {
      name: 'Beginner',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Expert',
      exact: true,
    })
    .click();

  // Add Technical Skill
  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();

  const yesBtn = page.getByRole('button', { name: 'Yes', exact: true });
  if (await yesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await yesBtn.click();
  }

  // ========================================
  // Add Leadership Skill
  // ========================================

  await page
    .locator('app-my-skills, .custom-add-btn')
    .getByText('Add New Skill')
    .first()
    .click();

  // Skill Category
  await page
    .getByRole('combobox', {
      name: 'Please select skill category',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Leadership Skills',
      exact: true,
    })
    .click();

  // Skill
  const leadershipSkill = page.getByRole('textbox', {
    name: 'Please type a skill and press',
  });

  await leadershipSkill.fill('team work');
  await leadershipSkill.press('Enter');

  // Proficiency
  await page
    .getByRole('combobox', {
      name: 'Please select proficiency',
    })
    .click();

  await page
    .getByText('Beginner', {
      exact: true,
    })
    .click();

  // Change Proficiency to Intermediate
  await page
    .getByRole('combobox', {
      name: 'Beginner',
    })
    .click();

  await page
    .getByLabel('Intermediate')
    .getByText('Intermediate', {
      exact: true,
    })
    .click();

  // Add Leadership Skill
  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();

  if (await yesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await yesBtn.click();
  }
});

// ========================================
// TC60 - Add Certification
// ========================================
// ========================================
// TC60 - Add Certification
// ========================================

test('TC60 - Add Certification', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Navigate directly to Certifications
  await page.goto('/personalinfo/job/certifications', {
    waitUntil: 'domcontentloaded',
  });

  // Add New
  await page
    .getByText('Add New', {
      exact: true,
    })
    .click();

  // Certification Name
  const certificationName = page.getByRole('textbox', {
    name: 'Certification Name *',
  });

  await certificationName.fill('AWS Solutions Architect');

  await expect(certificationName).toHaveValue('AWS Solutions Architect');

  // Certification ID
  const certificationId = page.getByRole('textbox', {
    name: 'Certification ID *',
  });

  const uniqueCertId = 'CERT_' + Date.now().toString().slice(-5);
  await certificationId.fill(uniqueCertId);

  await expect(certificationId).toHaveValue(uniqueCertId);

  // Issued Date
  const issuedDate = page.getByRole('textbox', {
    name: 'Issued Date *',
  });

  await issuedDate.fill('2026-09-07');

  await expect(issuedDate).toHaveValue('2026-09-07');

  // Expiry Date
  const expiryDate = page.getByRole('textbox', {
    name: 'Expiry Date *',
  });

  await expiryDate.fill('2026-09-25');

  await expect(expiryDate).toHaveValue('2026-09-25');

  // Upload Attachment
  await page
    .getByRole('button', {
      name: 'Attachment(Upload the Pdf/',
    })
    .setInputFiles(
      'tests/images/pexels-quang-nguyen-vinh-222549-6348018.jpg'
    );

  // Add
  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: true,
  });

  await expect(addButton).toBeEnabled();

  await addButton.click();
  await page.waitForTimeout(2000);
});
// ========================================
// TC61 - Update Certification
// ========================================

test('TC61 - Update Certification', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Navigate directly to Certifications
  await page.goto('/personalinfo/job/certifications', {
    waitUntil: 'domcontentloaded',
  });

  // Open Action Menu
  await page.locator('i').nth(3).click();

  // Click Update
  await page
    .getByText('Update', {
      exact: true,
    })
    .first()
    .click();

  // Update Certification ID
  const certificationId = page.getByRole('textbox', {
    name: 'Certification ID *',
  });

  const updatedCertId = 'CERT_UPD_' + Date.now().toString().slice(-5);
  await certificationId.fill(updatedCertId);

  await expect(certificationId).toHaveValue(updatedCertId);

  // No Expiry
  const noExpiry = page.getByRole('checkbox', {
    name: 'No Expiry',
  });

  await noExpiry.check();

  await expect(noExpiry).toBeChecked();

  // Update
  await page
    .getByRole('button', {
      name: 'Update',
      exact: true,
    })
    .click();
});
// ========================================
// TC62 - Delete Certification
// ========================================

// ========================================
// TC62 - Delete Certification
// ========================================

test('TC62 - Delete Certification', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Navigate directly to Certifications
  await page.goto('/personalinfo/job/certifications', {
    waitUntil: 'domcontentloaded',
  });

  // Open Action Menu
  await page.locator('i').nth(3).click();

  // Click Delete
  await page
    .getByText('Delete', {
      exact: true,
    })
    .first()
    .click();

  // Confirm Delete
  await page
    .getByRole('button', {
      name: 'Yes',
      exact: true,
    })
    .click();
});
/// ========================================
// TC63 - Save Onboarding Info
// ========================================

test('TC63 - Save Onboarding Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job', {
    exact: true,
  }).click();

  // Open Pre Onboarding Info
  await page
    .locator('app-personal-job-tabs')
    .getByText('Pre Onboarding Info', {
      exact: true,
    })
    .click();

  // Open Onboarding Info
  await page
    .locator('div')
    .filter({
      hasText: /^Onboarding Info$/,
    })
    .nth(1)
    .click();

  // Open details
  await page.locator('div:nth-child(2) > a').click();

  // Employment Status
  await page
    .locator('div')
    .filter({
      hasText: /^Active$/,
    })
    .click();

  // Branch Code
  await page
    .getByRole('combobox', {
      name: 'Select branch code',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'HYDERABAD',
      exact: true,
    })
    .click();

  // Probation End Date
  await page
    .getByRole('textbox', {
      name: 'Probation End Date',
    })
    .fill('2026-09-07');

  // Probation Status
  await page
    .getByText('Probation StatusSelect')
    .click();

  await page
    .getByText('Passed', {
      exact: true,
    })
    .click();

  // Background Verification
  await page
    .getByRole('combobox', {
      name: 'Please select background',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Passed',
      exact: true,
    })
    .click();

  // Salary Hold
  await page
    .getByRole('combobox', {
      name: 'Select salary hold',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Yes',
      exact: true,
    })
    .click();

  // Additional Yes/No field 1
  const yesField1 = page.getByRole('combobox', {
    name: 'Yes',
  }).first();

  await yesField1.click();

  await page
    .getByRole('option', {
      name: 'No',
      exact: true,
    })
    .click();

  // Additional Yes/No field 2
  const noField1 = page.getByRole('combobox', {
    name: 'No',
  }).first();

  await noField1.click();

  await page
    .getByLabel('Option List')
    .getByText('Yes', {
      exact: true,
    })
    .click();

  // Additional Yes/No field 3
  const yesField2 = page.getByRole('combobox', {
    name: 'Yes',
  }).first();

  await yesField2.click();

  await page
    .getByRole('option', {
      name: 'No',
      exact: true,
    })
    .click();

  // Additional Yes/No field 4
  const noField2 = page.getByRole('combobox', {
    name: 'No',
  }).first();

  await noField2.click();

  await page
    .getByRole('option', {
      name: 'No',
      exact: true,
    })
    .click();

  // Additional Yes/No field 5
  const noField3 = page.getByRole('combobox', {
    name: 'No',
  }).first();

  await noField3.click();

  await page
    .getByRole('option', {
      name: 'Yes',
      exact: true,
    })
    .click();

  // Save
  await page
    .getByRole('button', {
      name: 'Save',
      exact: true,
    })
    .click();

  // Close
  await page
    .getByRole('button', {
      name: 'Close',
      exact: true,
    })
    .click();
});

// ========================================
// TC64 - Add Compensation
// ========================================

test('TC64 - Add Compensation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job', {
    exact: true,
  }).click();

  // Open Pre Onboarding Info
  await page
    .locator('app-personal-job-tabs')
    .getByText('Pre Onboarding Info', {
      exact: true,
    })
    .click();

  // Open Compensations
  await page
    .getByText('Compensations', {
      exact: true,
    })
    .click();

  // Add New
  await page
    .getByText('Add New', {
      exact: true,
    })
    .click();

  // Effective Date
  await page
    .locator('input[type="date"]')
    .first()
    .fill('2026-09-07');

  // Reason
  await page
    .getByRole('combobox', {
      name: 'Please select reason',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Annual salary',
      exact: true,
    })
    .click();

  // Pay Type
  await page
    .getByRole('combobox', {
      name: 'Please select pay type',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Yearly',
      exact: true,
    })
    .click();

  // Overtime
  await page
    .getByRole('combobox', {
      name: 'Please select overtime',
    })
    .click();

  await page
    .getByLabel('Option List')
    .getByText('Applicable', {
      exact: true,
    })
    .click();

  // Frequency
  await page
    .getByRole('combobox', {
      name: 'Please select frequency',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Monthly',
      exact: true,
    })
    .click();

  // Amount
  await page
    .getByRole('textbox', {
      name: 'Please enter amount',
    })
    .fill('50000');

  // Next Compensation Review Date
  const reviewDate = page
    .locator('input[type="date"]')
    .nth(1);

  await reviewDate.fill('2027-09-07');

  // Submit
  const submitButton = page.getByRole('button', {
    name: 'Submit',
    exact: true,
  });

  await expect(submitButton).toBeEnabled({
    timeout: 10000,
  });

  await submitButton.click();
});
// ========================================
// TC65 - Update Compensation
// ========================================

test('TC65 - Update Compensation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page
    .getByText('Job', {
      exact: true,
    })
    .click();

  // Open Pre Onboarding Info
  await page
    .locator('app-personal-job-tabs')
    .getByText('Pre Onboarding Info', {
      exact: true,
    })
    .click();

  // Open Compensations
  await page
    .getByText('Compensations', {
      exact: true,
    })
    .click();

  // Select latest compensation record
  const compensationRow = page.locator('tbody tr').last();

  // Open action menu
  await compensationRow
    .locator('.dropdown > span > .bi')
    .click();

  // Click Update
  await page
    .locator('a.dropdown-item:visible')
    .filter({
      hasText: 'Update',
    })
    .click();

  // Update Reason
  const reasonDropdown = page
    .locator('[role="combobox"]:visible')
    .first();

  await reasonDropdown.click();

  await page
    .locator('[role="option"]:visible')
    .filter({
      hasText: /^Annual pay increase$/,
    })
    .click();

  // Update Amount
  await page
    .getByRole('textbox', {
      name: 'Please enter amount',
    })
    .fill('55000');

  // Update
  const updateButton = page.getByRole('button', {
    name: 'Update',
    exact: true,
  });

  await expect(updateButton).toBeEnabled({
    timeout: 10000,
  });

  await updateButton.click();
});
// ========================================
// TC66 - Delete Compensation
// ========================================

test('TC66 - Delete Compensation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page
    .getByText('Job', {
      exact: true,
    })
    .click();

  // Open Pre Onboarding Info
  await page
    .locator('app-personal-job-tabs')
    .getByText('Pre Onboarding Info', {
      exact: true,
    })
    .click();

  // Open Compensations
  await page
    .getByText('Compensations', {
      exact: true,
    })
    .click();

  // Select latest compensation record
  const compensationRow = page.locator('tbody tr').last();

  // Open action menu
  await compensationRow
    .locator('.dropdown > span > .bi')
    .click();

  // Click Delete
  await page
    .locator('a.dropdown-item:visible')
    .filter({
      hasText: 'Delete',
    })
    .click();

  // Confirm Delete
  await page
    .getByRole('button', {
      name: 'Yes',
      exact: true,
    })
    .click();
});
// ========================================
// TC67 - Add Job Info
// ========================================

test('TC67 - Add Job Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page
    .getByText('Job', {
      exact: true,
    })
    .click();

  // Open Job Info
  await page
    .getByRole('img', {
      name: 'Job Info',
    })
    .click();

  // Add New
  await page
    .getByText('Add New', {
      exact: true,
    })
    .click();

  // ========================================
  // Effective Date *
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Effective Date *',
    })
    .fill('2026-09-07');

  // ========================================
  // Job Role *
  // ========================================

  await page
    .getByRole('combobox', {
      name: 'Please select job role',
    })
    .click();

  await page
    .getByRole('option', {
      name: 'Senior Developer',
      exact: true,
    })
    .click();

  // ========================================
  // Department *
  // Select DevOps
  // ========================================

  const department = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select department',
    });

  await department.click();

  await page
    .getByLabel('Option List')
    .getByText('DevopS', {
      exact: true,
    })
    .click();

  // ========================================
  // Team *
  // ========================================

  const team = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select team',
    });

  await team.click();

  const teamOptions = page.locator('[role="option"]:visible');

  await expect(teamOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await teamOptions.first().click();

  // ========================================
  // Reporting Manager *
  // ========================================

  const reportingManager = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select Reporting Manager',
    });

  await reportingManager.click();

  const reportingManagerOptions = page.locator(
    '[role="option"]:visible'
  );

  await expect(reportingManagerOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await reportingManagerOptions.first().click();

  // ========================================
  // Location *
  // ========================================

  const location = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select location',
    });

  await location.click();

  const locationOptions = page.locator(
    '[role="option"]:visible'
  );

  await expect(locationOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await locationOptions.first().click();

  // ========================================
  // Sub Location *
  // ========================================

  const subLocation = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select sub location',
    });

  await subLocation.click();

  const subLocationOptions = page.locator(
    '[role="option"]:visible'
  );

  await expect(subLocationOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await subLocationOptions.first().click();

  // ========================================
  // Shift *
  // ========================================

  const shift = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select shift',
    });

  await shift.click();

  const shiftOptions = page.locator(
    '[role="option"]:visible'
  );

  await expect(shiftOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await shiftOptions.first().click();

  // ========================================
  // Job Type *
  // ========================================

  const jobType = page
    .getByRole('combobox')
    .filter({
      hasText: 'Please select job type',
    });

  await jobType.click();

  const jobTypeOptions = page.locator(
    '[role="option"]:visible'
  );

  await expect(jobTypeOptions.first()).toBeVisible({
    timeout: 10000,
  });

  await jobTypeOptions.first().click();

  // ========================================
  // Submit
  // ========================================

  const submitButton = page.getByRole('button', {
    name: 'Submit',
    exact: true,
  });

  await expect(submitButton).toBeEnabled({
    timeout: 10000,
  });

  await submitButton.click();
});
// ========================================
// TC70 - Update WFH / Remote Login
// ========================================

test('TC70 - Update WFH / Remote Login', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job', {
    exact: true,
  }).click();

  // Open Job Details
  await page.goto('/personalinfo/job/job-details', {
    waitUntil: 'domcontentloaded',
  });

  // Open WFH / Remote Login
  await page
    .getByRole('link', {
      name: 'WFH / Remote Login',
    })
    .click();

  // Inactivate active allocation if present
  const activeRow = page.locator('tbody tr').filter({ hasText: 'Active' }).first();
  if (await activeRow.isVisible({ timeout: 2000 }).catch(() => false)) {
    const kebab = activeRow.locator('.dropdown > span > .bi, .dropdown').first();
    if (await kebab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await kebab.click();
      const inactiveItem = page.locator('a.dropdown-item:visible').filter({ hasText: 'Inactive' });
      if (await inactiveItem.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inactiveItem.click();
        await page.getByRole('button', { name: 'Yes', exact: true }).click();
        await page.waitForTimeout(1000);
      }
    }
  }

  // Click Allocate to open allocation form
  await page.getByText('Allocate', { exact: true }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Allow Work From Home = No
  const wfhTrigger = dialog.getByText(/Allow Work From Home \*/i).locator('..').getByRole('button', { name: 'dropdown trigger' });
  if (await wfhTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await wfhTrigger.click();
    await page.getByRole('option', { name: 'No', exact: true }).click();
  }

  // Allow Remote Login = Yes
  const rlTrigger = dialog.getByText(/Allow Remote Login \*/i).locator('..').getByRole('button', { name: 'dropdown trigger' });
  if (await rlTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await rlTrigger.click();
    await page.getByRole('option', { name: 'Yes', exact: true }).click();
  }

  // Remote Login Work Location
  const locTrigger = dialog.getByText(/Work Location \*/i).locator('..').getByRole('button', { name: 'dropdown trigger' }).first();
  if (await locTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await locTrigger.click();
    const opt = page.getByRole('option').first();
    await opt.click();
  }

  // Remote Login Manager
  const mgrTrigger = dialog.getByText(/Remote Login Manager \*/i).locator('..').getByRole('button', { name: 'dropdown trigger' });
  if (await mgrTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await mgrTrigger.click();
    const opt = page.getByRole('option').first();
    await opt.click();
  }

  // Effective Date
  const dateInput = dialog.getByRole('textbox').first();
  if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    const today = new Date().toISOString().split('T')[0];
    await dateInput.fill(today);
  }

  // Submit
  const submitBtn = dialog.getByRole('button', { name: /Submit|Update/i, exact: true });
  if (await submitBtn.isEnabled({ timeout: 3000 }).catch(() => false)) {
    await submitBtn.click();
  } else {
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
});
// ========================================
// TC71 - Change Reporting Manager
// ========================================

test('TC71 - Change Reporting Manager', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Team Members
  await page.goto('/personalinfo/job/team/team-members', {
    waitUntil: 'domcontentloaded',
  });

  // Change RM
  await page.getByRole('button', {
    name: 'Change RM',
    exact: true,
  }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Select Team Member(s)
  const teamMemberDropdown = dialog.locator('p-multiselect, .p-multiselect').first();
  await teamMemberDropdown.click();

  const memberOption = page.locator('.p-multiselect-item, [role="option"]').first();
  if (await memberOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    await memberOption.click();
    await page.keyboard.press('Escape');
  }

  // Select Reporting Manager
  const rmDropdown = dialog.getByRole('button', { name: 'dropdown trigger' }).last();
  await rmDropdown.click();

  const rmOption = page.getByRole('option').first();
  if (await rmOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    await rmOption.click();
  }

  // Save / Submit
  const submitBtn = dialog.getByRole('button', { name: 'Submit', exact: true });
  if (await submitBtn.isEnabled().catch(() => false)) {
    await submitBtn.click();
  } else {
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
});
// ========================================
// TC72 - Bulk Location Change
// ========================================

test('TC72 - Bulk Location Change', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Navigate to Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page
    .getByText('Job', {
      exact: true,
    })
    .click();

  // Open Team Members
  await page
    .locator('div')
    .filter({
      hasText: /^Team Members$/,
    })
    .nth(1)
    .click();

  // Bulk Location Change
  await page
    .getByRole('link', {
      name: 'Bulk Location Change',
    })
    .click();

  // Location Change
  await page
    .getByRole('button', {
      name: 'Location Change',
      exact: true,
    })
    .click();

  // Open Selection Type
  await page
    .getByRole('combobox', {
      name: 'Selection Type',
    })
    .click();

  // Select Department / Team
  await page
    .getByText('Select by Department/Team', {
      exact: true,
    })
    .click();

  // Open Department selection
  await page
    .getByText('Please Select Department', {
      exact: true,
    })
    .click();

  // Select first department
  await page
    .locator('p-checkbox')
    .first()
    .click();

  // Effective Date
  await page
    .locator('#effectiveDate')
    .fill('2026-09-08');
});
// ========================================
// TC73 - Add Past Experience
// ========================================

test('TC73 - Add Past Experience', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // ========================================
  // Open Active Employees
  // ========================================

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // ========================================
  // Employment History
  // ========================================

  await page.goto('/personalinfo/job/past-experiences', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForLoadState('networkidle');

  // Click Add New
  await page.getByText('Add New', {
    exact: true,
  }).click();

  // Wait for Add Employment
  await page.getByText('Add Employment', {
    exact: true,
  }).waitFor({
    state: 'visible',
    timeout: 15000,
  });

  // ========================================
  // Company Name
  // ========================================

  await page
    .locator('p-autocomplete')
    .getByRole('button')
    .click();

  await page
    .getByText('eyewyewy', {
      exact: true,
    })
    .click();

  /// ========================================
// Employment Type
// ========================================

await page
  .getByRole('combobox', {
    name: 'Please select employment type',
  })
  .click();

const fullTimeOptions = page.getByRole('option', {
  name: 'Full-Time',
});

await expect(fullTimeOptions).toHaveCount(2);

await fullTimeOptions.last().click();

  // ========================================
  // From Date
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'From Date *',
    })
    .fill('2023-07-04');

  // ========================================
  // To Date
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'To Date *',
    })
    .fill('2023-07-14');

  // ========================================
  // Job Role
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Job Role *',
    })
    .fill('Software Developer');

  // ========================================
  // Contact Name
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Please enter contact name',
    })
    .fill('Test Contact');

  // ========================================
  // Contact Number
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Please enter contact number',
    })
    .fill('7894561235');

  // ========================================
  // Contact Email
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Please enter contact email',
    })
    .fill('testcontact@gmail.com');
// ========================================
// Upload Experience / Relieving Letter
// ========================================

const uploadButton = page.getByRole('button', {
  name: 'Experience/Relieving Letter *',
});

await uploadButton.setInputFiles({
  name: 'experience-letter.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from(
    '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Count 0 >>\nendobj\ntrailer\n<< /Root 2 0 R >>\n%%EOF'
  ),
});
  // ========================================
  // Verify Add Button
  // ========================================

  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: true,
  });

  await expect(addButton).toBeEnabled();

  // ========================================
  // Submit
  // ========================================

  await addButton.click();
});

// ========================================
// TC74 - Update Past Experience
// ========================================

test('TC74 - Update Past Experience', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // ========================================
  // Open Active Employees
  // ========================================

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // ========================================
  // Open Employment History
  // ========================================

  await page.goto('/personalinfo/job/past-experiences', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForLoadState('networkidle');

  // ========================================
  // Open Update menu
  // ========================================

  await page.locator('i').nth(3).click();

  await page
    .getByText('Update', {
      exact: true,
    })
    .first()
    .click();

  // ========================================
  // Update Employment Type
  // ========================================

  await page
    .getByRole('combobox', {
      name: 'Full-Time',
    })
    .click();

  await page
    .getByText('Contract', {
      exact: true,
    })
    .click();

  // ========================================
  // Update Contact Name
  // ========================================

  await page
    .getByRole('textbox', {
      name: 'Please enter contact name',
    })
    .fill('ravi teja');

  // ========================================
  // Update
  // ========================================

  const updateButton = page.getByRole('button', {
    name: 'Update',
    exact: true,
  });

  await expect(updateButton).toBeEnabled();

  await updateButton.click();
});
// ========================================
// TC75 - Delete Past Experience
// ========================================

test('TC75 - Delete Past Experience', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Past Experiences directly
  await page.goto('/personalinfo/job/past-experiences', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForLoadState('networkidle');

  // Open first action menu
  await page
    .locator('.text-center > .dropdown')
    .first()
    .click();

  // Click Delete
  await page
    .getByText('Delete', {
      exact: true,
    })
    .first()
    .click();

  // Confirm Delete
  await page
    .getByRole('button', {
      name: 'Yes',
      exact: true,
    })
    .click();
});
// ========================================
// TC76 - Verify Desk Info
// ========================================

test('TC76 - Verify Desk Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Active Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Verify Desk Info
  await expect(
    page.getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
  ).toBeVisible();
});
// ========================================
// TC77 - Separation Request / Recall
// ========================================

test('TC77 - Separation Request Recall or Exit Feedback', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Open Separation Request
  await page
    .getByRole('img', {
      name: 'Separation Request',
      exact: true,
    })
    .click();

  // ========================================
  // Check Recall action
  // ========================================

  const recallAction = page.getByText('Recall', {
    exact: true,
  }).first();

  if (await recallAction.isVisible().catch(() => false)) {
    // Recall is available

    await recallAction.click();

    await page
      .getByRole('textbox', {
        name: 'Please enter recall reason',
      })
      .fill('Test recall reason');

    await page
      .getByRole('button', {
        name: 'Submit',
        exact: true,
      })
      .click();
  } else {
    // Recall is not available
    // Go to Exit Feedback Details

    await page
      .getByRole('link', {
        name: 'Exit-Feedback-Details',
        exact: true,
      })
      .click();

    await expect(
      page.getByRole('link', {
        name: 'Exit-Feedback-Details',
        exact: true,
      })
    ).toBeVisible();
  }
});
// ========================================
// TC79 - Verify No Due Clearance Info
// ========================================

test('TC79 - Verify No Due Clearance Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Open No Due Clearance Info
  await page
    .getByRole('img', {
      name: 'No Due Clearance Info',
      exact: true,
    })
    .click();

  // Verify section
  await expect(
    page.getByRole('img', {
      name: 'No Due Clearance Info',
      exact: true,
    })
  ).toBeVisible();
});
// ========================================
// TC80 - Verify Onboarding Documents
// ========================================

test('TC80 - Verify Onboarding Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Open Onboarding Documents
  await page
    .getByText('Onboarding Documents', {
      exact: true,
    })
    .click();

  // Verify
  await expect(
    page.getByText('Onboarding Documents', {
      exact: true,
    }).last()
  ).toBeVisible();
});
// ========================================
// TC81 - Verify Trainee Onboard Request
// ========================================

test('TC81 - Verify Trainee Onboard Request', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Open Trainee Onboard Request
  await page
    .getByText('Trainee Onboard Request', {
      exact: true,
    })
    .click();

  // Verify
  await expect(
    page.getByText('Trainee Onboard Request', {
      exact: true,
    }).last()
  ).toBeVisible();
});
// ========================================
// TC82 - Verify Offboarding Info
// ========================================

test('TC82 - Verify Offboarding Info', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Desk Info
  await page
    .getByRole('img', {
      name: 'Desk Info',
      exact: true,
    })
    .click();

  // Open Offboarding Info
  await page
    .getByRole('img', {
      name: 'Offboarding Info',
      exact: true,
    })
    .click();

  // Verify Offboarding Info
  await expect(
    page.getByRole('img', {
      name: 'Offboarding Info',
      exact: true,
    })
  ).toBeVisible();
});
// ========================================
// TC83 - Verify Cards
// ========================================

test('TC83 - Verify Cards', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Cards
  await page
    .getByText('Cards', {
      exact: true,
    })
    .first()
    .click();

  // Verify Cards
  await expect(
    page.getByText('Cards', {
      exact: true,
    }).last()
  ).toBeVisible();
});
// ========================================
// TC84 - Assigned Projects
// ========================================

test('TC84 - Verify Assigned Projects', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Assigned Projects
  await page
    .getByText('Assigned Projects', {
      exact: true,
    })
    .click();

  // Open Year dropdown
  await page
    .getByRole('button', {
      name: 'dropdown trigger',
    })
    .click();

  // Select 2026
  await page
    .getByRole('option', {
      name: '2026',
      exact: true,
    })
    .click();

  // Verify Assigned Projects
  await expect(
    page.getByText('Assigned Projects', {
      exact: true,
    }).first()
  ).toBeVisible();
});
// ========================================
// TC85 - Upload Client Call Document
// ========================================

test('TC85 - Upload Client Call Document', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open Client Documents
  await page.getByText('ClientDocuments', {
    exact: true,
  }).click();

  // Open Client Calls
  await page.getByText('Client Calls', {
    exact: true,
  }).click();

  // Upload File
  await page
    .getByRole('button', {
      name: 'Upload File',
    })
    .click();

  // Upload test file
  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'client-call-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  // Add
  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
});
// ========================================
// TC86 - Upload Client Requirement Document
// ========================================

test('TC86 - Upload Client Requirement Document', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open Client Documents
  await page.getByText('ClientDocuments', {
    exact: true,
  }).click();

  // Open Client Requirement
  await page.getByText('Client Requirement', {
    exact: true,
  }).click();

  // Upload File
  await page
    .getByRole('button', {
      name: 'Upload File',
    })
    .click();

  // Choose File
  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'client-requirement-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  // Add
  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
});
// ========================================
// TC87 - Upload Client Documents
// ========================================

test('TC87 - Upload Client Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open ClientDocuments
  await page.getByText('ClientDocuments', {
    exact: true,
  }).click();

  // Open Client documents
  await page.getByText('Client documents', {
    exact: true,
  }).click();

  // Upload File
  await page.getByRole('button', {
    name: 'Upload File',
  }).click();

  // Choose File
  await page.getByRole('button', {
    name: 'Choose File',
  }).setInputFiles({
    name: 'client-documents-test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
    ),
  });

  // Add
  await page.getByRole('button', {
    name: 'Add',
    exact: true,
  }).click();
});
// ========================================
// TC88 - Upload Requirement Discussion
// ========================================

test('TC88 - Upload Requirement Discussion', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open ClientDocuments
  await page.getByText('ClientDocuments', {
    exact: true,
  }).click();

  // Open Requirement discussion
  await page.getByText('Requirement discussion', {
    exact: true,
  }).click();

  // Upload File
  await page.getByRole('button', {
    name: 'Upload File',
  }).click();

  // Choose File
  await page.getByRole('button', {
    name: 'Choose File',
  }).setInputFiles({
    name: 'requirement-discussion-test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
    ),
  });

  // Add
  await page.getByRole('button', {
    name: 'Add',
    exact: true,
  }).click();
});
// ========================================
// TC89 - Upload Academic Documents
// ========================================

test('TC89 - Upload Academic Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Login
  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open Employee Documents
  await page.getByText('Employee Documents', {
    exact: true,
  }).click();

  // Open Academic Documents
  await page.getByText('Academic Documents', {
    exact: true,
  }).click();

  // Upload File
  await page.getByRole('button', {
    name: 'Upload File',
  }).click();

  // Choose File
  await page.getByRole('button', {
    name: 'Choose File',
  }).setInputFiles({
    name: 'academic-document-test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(
      '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
    ),
  });

  // Add
  await page.getByRole('button', {
    name: 'Add',
    exact: true,
  }).click();
});
// ========================================
// Document Upload Helper
// ========================================

async function openEmployeeDocuments(page: any) {
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  await page.getByText('Job').click();

  await page.getByText('Documents', {
    exact: true,
  }).click();
}

async function uploadDocument(page: any) {
  await page
    .getByRole('button', {
      name: /Upload File/,
    })
    .click();

  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
}


// ========================================
// TC90 - Address Proof Letters
// ========================================

test('TC90 - Upload Address Proof Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Address Proof Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC91 - Appointment Letter
// ========================================

test('TC91 - Upload Appointment Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Appointment Letter', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC92 - AppointmentLetter
// ========================================

test('TC92 - Upload AppointmentLetter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('AppointmentLetter', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC93 - Appraisal Letters
// ========================================

test('TC93 - Upload Appraisal Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Appraisal Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC94 - Assets Details
// ========================================

test('TC94 - Upload Assets Details', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Assets Details', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC95 - Bank Details
// ========================================

test('TC95 - Upload Bank Details', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Bank Details', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC96 - Bank Documents
// ========================================

test('TC96 - Upload Bank Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Bank Documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC97 - Bank letter
// ========================================

test('TC97 - Upload Bank letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Bank letter', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC98 - BankLoan Letters
// ========================================

test('TC98 - Upload BankLoan Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('BankLoan Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC99 - Certifications
// ========================================

test('TC99 - Upload Certifications Document', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Certifications', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC100 - Contractor Extension Letters
// ========================================

test('TC100 - Upload Contractor Extension Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Contractor Extension Letters', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC101 - Education Documents
// ========================================

test('TC101 - Upload Education Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Education Documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC102 - Exit Feedback Form
// ========================================

test('TC102 - Upload Exit Feedback Form', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Exit Feedback Form', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC103 - Expenses
// ========================================

test('TC103 - Upload Expenses', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();

  await page
    .locator('app-documents')
    .getByText('Expenses', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC104 - Identity Documents
// ========================================

test('TC104 - Upload Identity Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Identity Documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC105 - KRA Documents
// ========================================

test('TC105 - Upload KRA Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('KRA Documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC106 - KT documents
// ========================================

test('TC106 - Upload KT documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('KT documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC107 - MSA Letters
// ========================================

test('TC107 - Upload MSA Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('MSA Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC108 - No Due Form
// ========================================

test('TC108 - Upload No Due Form', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('No Due Form', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC109 - Upload Non-Disclosure Agreement
// ========================================

test('TC109 - Upload Non-Disclosure Agreement', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  await page.getByText('Job').click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByText('Employee Documents', {
    exact: true,
  }).click();

  const documents = page.locator('app-documents');

  await documents
    .getByText(/Non-Disclosure Agreement/i)
    .first()
    .click();

  await page.getByRole('button', {
    name: /Upload File/,
  }).click();

  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'non-disclosure-agreement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
});

// ========================================
// TC110 - Offer Letter
// ========================================

test('TC110 - Upload Offer Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Offer Letter', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC111 - Pre Onboarding Documents - 1
// ========================================

test('TC111 - Upload Pre Onboarding Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Pre Onboarding Documents', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC112 - Pre Onboarding Documents - 2
// ========================================

test('TC112 - Upload Second Pre Onboarding Document', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Pre Onboarding Documents', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC113 - Previous Experience Documents
// ========================================

test('TC113 - Upload Previous Experience Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Previous Experience Documents', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC114 - Probation Assessment Form
// ========================================

test('TC114 - Upload Probation Assessment Form', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Probation Assessment Form', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC115 - Probation Confirmation Letter
// ========================================

test('TC115 - Upload Probation Confirmation Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Probation Confirmation Letter', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC116 - Probation Documents
// ========================================

test('TC116 - Upload Probation Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Probation Documents', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC117 - Probation Extension Letter
// ========================================

test('TC117 - Upload Probation Extension Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Probation Extension Letter', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC118 - Promotion Letters
// ========================================

test('TC118 - Upload Promotion Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Promotion Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC119 - Relieving Letters
// ========================================

test('TC119 - Upload Relieving Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Relieving Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC120 - Reports
// ========================================

test('TC120 - Upload Reports', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();

  await page
    .locator('app-documents')
    .getByText('Reports', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC121 - Salary Revision Letters
// ========================================

test('TC121 - Upload Salary Revision Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Salary Revision Letters', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC122 - Trainee Appointment Letter
// ========================================

test('TC122 - Upload Trainee Appointment Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Trainee Appointment Letter', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC123 - Trainee Offer Letter
// ========================================

test('TC123 - Upload Trainee Offer Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Trainee Offer Letter', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC124 - Welcome Letters
// ========================================

test('TC124 - Upload Welcome Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page.getByText('Welcome Letters', { exact: true }).click();

  await uploadDocument(page);
});


// ========================================
// TC125 - Work Order Letters
// ========================================

test('TC125 - Upload Work Order Letters', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page.getByText('Employee Documents', { exact: true }).click();
  await page
    .getByText('Work Order Letters', { exact: true })
    .click();

  await uploadDocument(page);
});


// ========================================
// TC126 - Employee%20Documents
// ========================================

test('TC126 - Verify Employee Documents Folder', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page
    .getByText('Employee%20Documents', {
      exact: true,
    })
    .click();
await expect(
  page
    .locator('app-documents')
    .getByText('Policies', {
      exact: true,
    })
).toBeVisible();
});


// ========================================
// TC127 - Policies
// ========================================

test('TC127 - Verify Policies', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.loginFromEnv();

  await openEmployeeDocuments(page);

  await page
    .getByText('Employee%20Documents', {
      exact: true,
    })
    .click();

  await page
    .locator('app-documents')
    .getByText('Policies', {
      exact: true,
    })
    .click();

  await expect(
    page.getByText('No Subfolders Found', {
      exact: true,
    })
  ).toBeVisible();
});
// ========================================
// TC128 - Download Timesheet Report 12460
// ========================================

test('TC128 - Download Timesheet Report 12460', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open Timesheet Reports
  await page.getByText('TimesheetReports', {
    exact: true,
  }).click();

  // Open 12460
  await page.getByText('12460', {
    exact: true,
  }).click();

  // Download 12460
  const downloadPromise = page.waitForEvent('download');

  await page
    .locator('app-download-icon > .cursor > svg > path')
    .click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBeTruthy();
});
// ========================================
// TC129 - Download Consolidated Timesheet
// ========================================

test('TC129 - Download Consolidated Timesheet', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  // Open Employees
  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  // Select Employee
  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  // Open Job
  await page.getByText('Job').click();

  // Open Documents
  await page.getByText('Documents', {
    exact: true,
  }).click();

  // Open Timesheet Reports
  await page.getByText('TimesheetReports', {
    exact: true,
  }).click();

  // Open 12460
  await page.getByText('12460', {
    exact: true,
  }).click();

  // Open Consolidated
  await page.getByText('Consolidated', {
    exact: true,
  }).click();

  // Download Consolidated
  const downloadPromise = page.waitForEvent('download');

  await page
    .locator('app-download-icon > .cursor > svg')
    .click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBeTruthy();
});
// ========================================
// TC130 - Upload organizationPolicy
// ========================================

test('TC130 - Upload organizationPolicy', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  await page.getByText('Job').click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByText('organizationPolicy', {
    exact: true,
  }).click();

  await page.getByText('12460', {
    exact: true,
  }).click();

  await page
    .getByRole('button', {
      name: /Upload File/,
    })
    .click();

  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'organization-policy-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
});
// ========================================
// TC131 - Upload Trainee Documents
// ========================================

test('TC131 - Upload Trainee Documents', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByText('Arpita Bhanja', {
      exact: true,
    })
    .first()
    .click();

  await page.getByText('Job').click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByText('organizationPolicy', {
    exact: true,
  }).click();

  await page.getByText('Trainee Documents', {
    exact: true,
  }).click();

  await page
    .getByRole('button', {
      name: /Upload File/,
    })
    .click();

  await page
    .getByRole('button', {
      name: 'Choose File',
    })
    .setInputFiles({
      name: 'trainee-document-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'
      ),
    });

  await page
    .getByRole('button', {
      name: 'Add',
      exact: true,
    })
    .click();
});

// ========================================
// TC132 - Letters - Appointment Letter
// ========================================

test('TC132 - Verify Appointment Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Appointment Letter',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();

  await page.getByRole('tab', {
    name: 'Rejected',
  }).click();
});
// ========================================
// TC133 - Letters - Appraisal Letter
// ========================================

test('TC133 - Verify Appraisal Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Appraisal Letter',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();

  await page.getByRole('tab', {
    name: 'Rejected',
  }).click();
});
// ========================================
// TC134 - Letters - Contractor Extension
// ========================================

test('TC134 - Verify Contractor Extension', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Contractor Extension',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();

  await page.getByRole('tab', {
    name: 'Rejected',
  }).click();
});
// ========================================
// TC135 - Letters - Probation Confirmation
// ========================================

test('TC135 - Verify Probation Confirmation', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Probation Confirmation',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();
});
// ========================================
// TC136 - Letters - Probation Extension
// ========================================

test('TC136 - Verify Probation Extension', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Probation Extension',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();
});
// ========================================
// TC137 - Letters - Salary Revision Letter
// ========================================

test('TC137 - Verify Salary Revision Letter', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Salary Revision Letter',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();

  await page.getByRole('tab', {
    name: 'Rejected',
  }).click();
});
// ========================================
// TC138 - Letters - Trainee Appointment
// ========================================

test('TC138 - Verify Trainee Appointment', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.loginFromEnv();

  await page.goto('/employee-management/active/employees', {
    waitUntil: 'domcontentloaded',
  });

  await page.getByText('Arpita Bhanja', {
    exact: true,
  }).first().click();

  await page.getByText('Documents', {
    exact: true,
  }).click();

  await page.getByRole('img', {
    name: 'Letters',
    exact: true,
  }).click();

  await page.getByRole('tab', {
    name: 'Icon Trainee Appointment',
  }).click();

  await page.getByRole('tab', {
    name: 'Generated',
  }).click();

  await page.getByRole('tab', {
    name: 'Accepted',
  }).click();

  await page.getByRole('tab', {
    name: 'Rejected',
  }).click();
});