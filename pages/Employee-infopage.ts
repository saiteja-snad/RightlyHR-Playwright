import { type Locator, type Page } from '@playwright/test';

export class EmployeeInfoPage {
  readonly page: Page;

  // Employee navigation
  readonly employeesMenu: Locator;
  readonly activeStatus: Locator;
  readonly employeeName: Locator;

  // Employee Info
  readonly basicInfo: Locator;
  readonly employeeInfoLink: Locator;

  // Basic Info fields
  readonly employeeId: Locator;
  readonly salutation: Locator;
  readonly gender: Locator;
  readonly maritalStatus: Locator;
  readonly bloodGroup: Locator;
  readonly dateOfBirth: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.employeesMenu = page
      .getByRole('img', { name: 'Icon' })
      .nth(2);

    this.activeStatus = page.getByText('Active', {
      exact: true,
    });

    this.employeeName = page
      .getByText('Arpita Bhanja', {
        exact: true,
      })
      .first();

    this.basicInfo = page.getByRole('img', {
      name: 'Basic Info',
    });

    this.employeeInfoLink = page.locator(
      'div:nth-child(2) > a'
    );

    this.employeeId = page.getByRole('textbox', {
      name: 'Please enter employee ID',
    });

    this.salutation = page.getByRole('combobox', {
      name: 'Please select salutation',
    });

    this.gender = page.getByRole('combobox', {
      name: 'Please select gender',
    });

    this.maritalStatus = page.getByRole('combobox', {
      name: 'Please select marital status',
    });

    this.bloodGroup = page.getByRole('combobox', {
      name: 'Please select blood group',
    });

    this.dateOfBirth = page.getByRole('textbox', {
      name: 'Date Of Birth*',
    });

    this.saveButton = page.getByRole('button', {
      name: 'Save',
      exact: true,
    });
  }

  async openEmployees() {
    await this.employeesMenu.click();

    // Codegen recorded the Employees icon twice.
    await this.employeesMenu.click();
  }

  async selectActiveEmployees() {
    await this.activeStatus.click();
  }

  async openEmployee() {
    await this.employeeName.click();
  }

  async openEmployeeInfo() {
    await this.basicInfo.click();

    await this.employeeInfoLink.click();
  }

  async enterEmployeeId(value: string) {
    await this.employeeId.fill(value);
  }

  async selectSalutation(value: string) {
    await this.salutation.click();

    await this.page
      .getByRole('option', { name: value })
      .click();
  }

  async selectGender(value: string) {
    await this.gender.click();

    await this.page
      .getByRole('option', {
        name: value,
        exact: true,
      })
      .click();
  }

  async selectMaritalStatus(value: string) {
    await this.maritalStatus.click();

    await this.page
      .getByText(value, {
        exact: true,
      })
      .click();
  }

  async selectBloodGroup(value: string) {
    await this.bloodGroup.click();

    await this.page
      .getByText(value, {
        exact: true,
      })
      .click();
  }

  async enterDateOfBirth(value: string) {
    await this.dateOfBirth.fill(value);
  }

  async save() {
    await this.saveButton.click();
  }
}