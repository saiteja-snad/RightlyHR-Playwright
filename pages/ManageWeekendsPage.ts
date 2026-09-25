import { type Locator, type Page } from '@playwright/test';
import { ROUTES } from '../config/environment';
import { test, expect } from '@playwright/test';
export class ManageWeekendsPage {
  readonly page: Page;

  // Navigation
  readonly employeeFieldsButton: Locator;
  readonly manageWeekendsMenu: Locator;
  readonly manageWeekendsTitle: Locator;

  // Manage Weekends
  readonly addNewButton: Locator;
  readonly pendingTab: Locator;
  readonly publishedTab: Locator;

  // Form
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly cloneButton: Locator;
  readonly publishButton: Locator;
  readonly confirmYesButton: Locator;
  readonly addWeekendsTitle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Employee Fields
    this.employeeFieldsButton = page.getByRole('button', {
      name: 'Icon Employee Fields Define',
    });

    // Manage Weekends menu
    this.manageWeekendsMenu = page.getByText(
      'Define weekly off days for'
    );

  this.manageWeekendsTitle = page
  .locator('app-settings-header')
  .getByText('Manage Weekends', { exact: true });

    // Add New
    this.addNewButton = page.getByText(
      'Add New',
      { exact: true }
    );

    // Tabs
    this.pendingTab = page.getByRole('link', {
      name: /Pending For Submission/i,
    });

    this.publishedTab = page.getByRole('link', {
      name: /Published/i,
    });

    // Buttons
    this.submitButton = page.getByRole('button', {
      name: 'Submit',
      exact: true,
    });

    this.cancelButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });

    this.cloneButton = page.getByRole('button', {
      name: 'Clone',
      exact: true,
    });

    this.publishButton = page.getByRole('button', {
      name: 'Publish',
      exact: true,
    });

    this.confirmYesButton = page.getByRole('button', {
      name: 'Yes',
      exact: true,
    });

    // Add Weekends page
    this.addWeekendsTitle = page.getByText(
      'Add Weekends',
      { exact: true }
    );
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  async openEmployeeFields() {
    const isVisible = await this.employeeFieldsButton.isVisible().catch(() => false);
    if (!isVisible) {
      // Open sidebar if not already visible
      await this.page.locator('rect').first().click().catch(() => {});
    }

    // Open Employee Fields
    await this.employeeFieldsButton.click();
  }

  async openManageWeekends() {
    /*
     * The Codegen menu locator was unreliable.
     * Navigate directly to the confirmed Manage Weekends route.
     */
    await this.page.goto(
      ROUTES.manageWeekends,
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await this.manageWeekendsTitle.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async navigateFromDashboard() {
    await this.openEmployeeFields();
    await this.openManageWeekends();
  }

  // =====================================================
  // DIRECT ROUTES
  // =====================================================

  async goto() {
    await this.page.goto(
      ROUTES.manageWeekends,
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await this.manageWeekendsTitle.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async gotoAddWeekends() {
    await this.page.goto(
      ROUTES.addWeekends,
      {
        waitUntil: 'domcontentloaded',
      }
    );

    await this.addWeekendsTitle.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  async gotoUpdateWeekends() {
    await this.page.goto(
      ROUTES.updateWeekends,
      {
        waitUntil: 'domcontentloaded',
      }
    );
  }

  // =====================================================
  // ADD WEEKEND
  // =====================================================

  async openAddWeekend() {
    await this.addNewButton.click();

    await this.addWeekendsTitle.waitFor({
      state: 'visible',
      timeout: 15000,
    });
  }

  // =====================================================
  // FORM DROPDOWNS
  // =====================================================

  async selectYear(year: string) {
    const yearDropdown = this.page
      .getByRole('button', {
        name: 'dropdown trigger',
      })
      .first();

    await yearDropdown.click();

    await this.page
      .getByRole('option', {
        name: year,
        exact: true,
      })
      .click();
  }

  async selectLocation(location: string) {
    const locationDropdown = this.page.getByRole(
      'combobox',
      {
        name: 'Please select location',
      }
    );

    await locationDropdown.click();

    await this.page
      .getByRole('option', {
        name: location,
        exact: true,
      })
      .click();
  }

  async selectSubLocation(subLocation: string) {
    const subLocationDropdown = this.page.getByRole(
      'combobox',
      {
        name: 'Please select sub location',
      }
    );

    await subLocationDropdown.click();

    await this.page
      .getByRole('option', {
        name: subLocation,
        exact: true,
      })
      .click();
  }

  async selectShift(shift: string) {
    const shiftDropdown = this.page.getByRole(
      'combobox',
      {
        name: 'Please select shift',
      }
    );

    await shiftDropdown.click();

    await this.page
      .getByRole('option', {
        name: shift,
        exact: true,
      })
      .click();
  }

  // =====================================================
  // DAY
  // =====================================================

  async selectDay(
    day: string,
    rowIndex = 0
  ) {
    const dayCells = this.page.getByRole(
      'cell',
      {
        name: 'Day* dropdown trigger',
      }
    );

    const dayCell = dayCells.nth(rowIndex);

    await dayCell
      .getByLabel('dropdown trigger')
      .click();

    await this.page
      .getByRole('option', {
        name: day,
        exact: true,
      })
      .click();
  }

  /** Set a day without failing when that value is already selected. */
  async setDay(day: string, rowIndex = 0) {
    const dayCell = this.page
      .getByRole('cell', { name: 'Day* dropdown trigger' })
      .nth(rowIndex);
    const dayDropdown = dayCell.getByRole('combobox');

    const selectedDay = await dayDropdown.getAttribute('aria-label')
      ?? (await dayDropdown.textContent())?.trim();

    if (selectedDay === day) {
      return;
    }

    await dayCell.getByLabel('dropdown trigger').click();
    await this.page
      .getByRole('option', { name: day, exact: true })
      .click();
  }

  async addNewDay() {
    await this.page
      .getByRole('button', {
        name: '+ Add New',
        exact: true,
      })
      .click();
  }

  // =====================================================
  // OCCURRENCES
  // =====================================================

  async selectOccurrences(
  rowIndex: number,
  occurrences: Array<1 | 2 | 3 | 4 | 5>
) {
  const checkboxes = this.page.locator(
    'input[type="checkbox"]'
  );

  for (const occurrence of occurrences) {
    await checkboxes
      .nth((rowIndex * 5) + (occurrence - 1))
      .check();
  }
}

  // =====================================================
  // ACTIONS
  // =====================================================

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async confirmCancel() {
    await this.confirmYesButton.click();
  }

async clone() {
  await this.page
    .getByRole('button', {
      name: 'Clone',
    })
    .click();
}
  async publish() {
  const publishControl = this.page
    .locator('button, a')
    .filter({ hasText: /^Publish$/ })
    .first();

  await publishControl.waitFor({
    state: 'visible',
    timeout: 15000,
  });

  await publishControl.click();
}

  // =====================================================
  // TABS
  // =====================================================

  async openPendingTab() {
    await this.pendingTab.click();

    await this.pendingTab.waitFor({
      state: 'visible',
    });
  }

  async openPublishedTab() {
    await this.publishedTab.click();

    await this.publishedTab.waitFor({
      state: 'visible',
    });
  }

  // =====================================================
  // RECORD ACTIONS
  // =====================================================

  getRecordRow(
    year: string,
    location: string,
    subLocation: string,
    shift: string
  ): Locator {
    return this.page
      .getByRole('row')
      .filter({
        hasText: year,
      })
      .filter({
        hasText: location,
      })
      .filter({
        hasText: subLocation,
      })
      .filter({
        hasText: shift,
      })
      .first();
  }

  async openRecordActionMenu(
    year: string,
    location: string,
    subLocation: string,
    shift: string
  ) {
    const row = this.getRecordRow(
      year,
      location,
      subLocation,
      shift
    );

    await row.waitFor({
      state: 'visible',
    });

    await row
      .locator('.dropdown')
      .click();

  }

  async clickUpdate() {
  await this.page
    .locator('a.dropdown-item:visible')
    .filter({ hasText: 'Update' })
    .click();
}

  // =====================================================
  // CREATE WEEKEND RECORD
  // =====================================================

  async createWeekendRecord(
    year: string,
    location: string,
    subLocation: string,
    shift: string,
    day: string,
    occurrences: Array<1 | 2 | 3 | 4 | 5>
  ) {
    await this.openAddWeekend();

    await this.selectYear(year);

    await this.selectLocation(location);

    await this.selectSubLocation(
      subLocation
    );

    await this.selectShift(shift);

    await this.selectDay(day);

    await this.selectOccurrences(
      0,
      occurrences
    );

    await this.submit();
  }
}

