import { expect, type Locator, type Page, type Download } from '@playwright/test';
import path from 'path';

export interface PersonalInfoData {
  salutation?: string;
  gender?: 'Male' | 'Female';
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  maritalStatus?: 'Single' | 'Married';
  marriageAnniversary?: string;
}

export interface ContactInfoData {
  workNumber?: string;
  phoneNumber?: string;
  personalEmail?: string;
  linkedInUrl?: string;
}

export interface AddressData {
  permanentZip?: string;
  currentZip?: string;
  sameAsPermanent?: boolean;
}

export interface EmergencyContactDetails {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface EmergencyContactsData {
  contact1: EmergencyContactDetails;
  contact2?: EmergencyContactDetails;
}

export interface FamilyMemberData {
  name: string;
  dob: string;
  relationship: string;
  dependent?: boolean;
}

export interface IdentityData {
  type: string;
  number: string;
  filePath?: string;
}

export interface BankData {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  filePath?: string;
  primaryBank?: boolean;
}

export interface AcademicData {
  qualification: string;
  university: string;
  specialization: string;
  gpa: string;
  fromDate: string;
  toDate: string;
  filePath?: string;
}

export interface SkillData {
  category: string;
  skill: string;
  proficiency: string;
}

export interface EmploymentData {
  company: string;
  employmentType: string;
  fromDate: string;
  toDate: string;
  jobRole: string;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  filePath?: string;
}

export interface CertificationData {
  name: string;
  certId: string;
  issuedDate: string;
  noExpiry?: boolean;
  filePath?: string;
}

export class MyInfoPage {
  readonly defaultAttachmentPath: string;

  constructor(private page: Page) {
    this.defaultAttachmentPath = path.resolve(
      __dirname,
      '../tests/images/pexels-quang-nguyen-vinh-222549-6348018.jpg'
    );
  }

  // ==========================================
  // NAVIGATION
  // ==========================================

  async navigateToMyInfo() {
    if (this.page.url().includes('/myinfo')) {
      return;
    }

    const myInfoLink = this.page
      .locator('app-sidebar')
      .getByText('My Info', { exact: true })
      .or(this.page.getByRole('link', { name: 'My Info' }))
      .first();

    if (await myInfoLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await myInfoLink.click();
    }
    try {
      await this.page.waitForURL(/\/myinfo/, { timeout: 6000 });
    } catch {
      await this.page.goto('/myinfo/personal/basic-info', { waitUntil: 'domcontentloaded' });
    }
    await expect(this.page).toHaveURL(/\/myinfo/, { timeout: 15000 });
  }

  async openPersonalTab() {
    await this.navigateToMyInfo();
    const personalTab = this.page.locator('a.nav-link').filter({ hasText: 'Personal' }).first();
    if (await personalTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await personalTab.click().catch(() => {});
    }
  }

  async openPersonalSubTab(tabName: string) {
    await this.navigateToMyInfo();
    await this.openPersonalTab();

    const tabRouteMap: Record<string, string> = {
      'Basic Info': '/myinfo/personal/basic-info',
      'Contact Info': '/myinfo/personal/contact-details',
      'Addresses': '/myinfo/personal/address-info',
      'Emergency Contacts': '/myinfo/personal/emergency-contact-details',
      'Family Members': '/myinfo/personal/family-details',
      'Identity Info': '/myinfo/personal/identity-details',
      'Bank Info': '/myinfo/personal/bank-details',
      'Academics': '/myinfo/personal/education-details',
      'Skills': '/myinfo/personal/my-skills',
    };

    const targetRoute = tabRouteMap[tabName];
    if (targetRoute && this.page.url().includes(targetRoute)) {
      return;
    }

    const subTab = this.page.locator(`img[alt="${tabName}"]`).first();
    if (await subTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await subTab.click();
    } else if (targetRoute) {
      await this.page.goto(targetRoute, { waitUntil: 'domcontentloaded' });
    }

    if (targetRoute) {
      await expect(this.page).toHaveURL(new RegExp(targetRoute), { timeout: 15000 });
    }
  }

  async openJobTab() {
    await this.navigateToMyInfo();
    const jobTab = this.page.locator('a.nav-link').filter({ hasText: 'Job' }).first();
    await expect(jobTab).toBeVisible({ timeout: 15000 });
    await jobTab.click();
    await expect(this.page).toHaveURL(/\/myinfo\/job/, { timeout: 15000 });
  }

  async openDocumentsTab() {
    await this.navigateToMyInfo();
    if (this.page.url().includes('/myinfo/documents')) return;
    const docsTab = this.page.locator('a.nav-link').filter({ hasText: 'Documents' }).first();
    if (await docsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await docsTab.click();
    } else {
      await this.page.goto('/myinfo/documents/general-documents', { waitUntil: 'domcontentloaded' });
    }
    await expect(this.page).toHaveURL(/\/myinfo\/documents/, { timeout: 15000 });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private async clickEditIcon(_container?: string) {
    const saveBtn = this.page.getByRole('button', { name: 'Save', exact: true });
    if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      return;
    }

    const editBtn = this.page.locator('app-edit-icon').first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
    await editBtn.click();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
  }

  private async openDropdown(dropdown: Locator) {
    const trigger = dropdown.locator('.custom-p-select-content, .p-select-dropdown, [role="combobox"]').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
    } else {
      await dropdown.click();
    }
  }

  private async selectDropdownOption(dropdown: Locator, optionText: string) {
    await this.openDropdown(dropdown);

    const option = this.page
      .locator('[role="option"], .p-select-option')
      .filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`) })
      .first();

    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  }

  private async setFileInput(buttonOrInput: Locator, filePath: string) {
    const dialog = this.page.locator('.modal.show, ngb-modal-window, [role="dialog"], .p-dialog').first();
    const modalInput = dialog.locator('input[type="file"]').first();

    if (await modalInput.count() > 0) {
      await modalInput.setInputFiles(filePath);
      await modalInput.evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
    } else if (await buttonOrInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await buttonOrInput.setInputFiles(filePath);
      await buttonOrInput.evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
    } else {
      const lastInput = this.page.locator('input[type="file"]').last();
      await lastInput.setInputFiles(filePath);
      await lastInput.evaluate((el: HTMLInputElement) => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }).catch(() => {});
    }
  }

  private async confirmYes() {
    const yesButton = this.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Yes', exact: true })
      .or(this.page.getByRole('button', { name: 'Yes', exact: true }))
      .first();

    await expect(yesButton).toBeVisible({ timeout: 10000 });
    await yesButton.click();
  }

  private async waitForDialogClose() {
    const dialog = this.page.getByRole('dialog').or(this.page.locator('ngb-modal-window'));
    await expect(dialog).toBeHidden({ timeout: 15000 }).catch(() => {});
  }

  // ==========================================
  // 1. PERSONAL INFORMATION (BASIC INFO)
  // ==========================================

  async openBasicInfo() {
    await this.openPersonalSubTab('Basic Info');
  }

  async selectSalutation(value: string) {
    const dropdown = this.page.locator('p-select[formcontrolname="salutation"]');
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await this.openDropdown(dropdown);
    await this.page.getByRole('option', { name: value, exact: true }).click();
  }

  async selectGender(gender: 'Male' | 'Female') {
    const dropdown = this.page.locator('p-select[formcontrolname="gender"]');
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await this.openDropdown(dropdown);
    await this.page.getByRole('option', { name: gender, exact: true }).click();
  }

  async selectBloodGroup(value: string) {
    const dropdown = this.page.locator('p-select[formcontrolname="bloodGroup"]');
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await this.openDropdown(dropdown);
    await this.page.getByRole('option', { name: value, exact: true }).click();
  }

  async selectMaritalStatus(value: 'Single' | 'Married') {
    const dropdown = this.page.locator('p-select[formcontrolname="maritalStatus"]');
    await expect(dropdown).toBeVisible({ timeout: 15000 });
    await this.openDropdown(dropdown);
    await this.page.getByRole('option', { name: value, exact: true }).click();
  }

  async updatePersonalInfo(data: PersonalInfoData) {
    await this.openBasicInfo();
    await this.clickEditIcon();

    if (data.salutation) {
      await this.selectSalutation(data.salutation);
    }

    if (data.gender) {
      await this.selectGender(data.gender);
    }

    if (data.firstName) {
      const firstNameInput = this.page.locator('input[formcontrolname="firstName"]');
      await firstNameInput.fill(data.firstName);
    }

    if (data.middleName !== undefined) {
      const middleNameInput = this.page.locator('input[formcontrolname="middleName"]');
      if (await middleNameInput.isVisible()) {
        await middleNameInput.fill(data.middleName);
      }
    }

    if (data.lastName) {
      const lastNameInput = this.page.locator('input[formcontrolname="lastName"]');
      await lastNameInput.fill(data.lastName);
    }

    if (data.dateOfBirth) {
      const dobInput = this.page.locator('input[formcontrolname="dob"]');
      await dobInput.fill(data.dateOfBirth);
    }

    if (data.bloodGroup) {
      await this.selectBloodGroup(data.bloodGroup);
    }

    if (data.maritalStatus) {
      await this.selectMaritalStatus(data.maritalStatus);
    }

    if (data.maritalStatus === 'Married' && data.marriageAnniversary) {
      const anniversaryInput = this.page.locator('input[formcontrolname="marriageDate"]');
      if (await anniversaryInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await anniversaryInput.fill(data.marriageAnniversary);
      }
    }

    // Save
    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();

    await expect(
      this.page.getByText(/Basic information updated|saved successfully|updated successfully/i).first()
    ).toBeVisible({ timeout: 15000 });
  }

  // ==========================================
  // 2. CONTACT INFORMATION
  // ==========================================

  async openContactInfo() {
    await this.openPersonalSubTab('Contact Info');
  }

  async updateContactInfo(data: ContactInfoData) {
    await this.openContactInfo();
    await this.clickEditIcon();

    if (data.workNumber) {
      const workNumberInput = this.page.locator('input[formcontrolname="workNumber"]');
      await workNumberInput.fill(data.workNumber);
    }

    if (data.phoneNumber) {
      const phoneInput = this.page.locator('input[formcontrolname="phoneNumber"]');
      await phoneInput.fill(data.phoneNumber);
    }

    if (data.personalEmail) {
      const emailInput = this.page.locator('input[formcontrolname="personalEmail"]');
      await emailInput.fill(data.personalEmail);
    }

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();

    await expect(
      this.page.getByText(/Contact Details updated|Contact Information updated|saved successfully|updated successfully/i).first()
    ).toBeVisible({ timeout: 15000 });
  }

  // ==========================================
  // 3. ADDRESS INFORMATION
  // ==========================================

  async openAddresses() {
    await this.openPersonalSubTab('Addresses');
  }

  async updateAddress(data: AddressData) {
    await this.openAddresses();
    await this.clickEditIcon();

    const sameAsPermCheckbox = this.page.locator('input[formcontrolname="sameAsPermanent"]');
    if (data.sameAsPermanent !== undefined) {
      if (data.sameAsPermanent) {
        await sameAsPermCheckbox.check();
      } else {
        await sameAsPermCheckbox.uncheck();
      }
    }

    if (data.permanentZip) {
      const permZip = this.page.locator('#permanentZipCode');
      await permZip.fill(data.permanentZip);
    }

    if (!data.sameAsPermanent && data.currentZip) {
      const currZip = this.page.locator('#currentZipCode');
      if (await currZip.isVisible()) {
        await currZip.fill(data.currentZip);
      }
    }

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();
    await expect(saveButton).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 4. EMERGENCY CONTACTS
  // ==========================================

  async openEmergencyContacts() {
    await this.openPersonalSubTab('Emergency Contacts');
  }

  async updateEmergencyContacts(data: EmergencyContactsData) {
    await this.openEmergencyContacts();
    await this.clickEditIcon();

    // Contact 1
    const contact1Name = this.page.locator('input[formcontrolname="contact1Name"]');
    await contact1Name.fill(data.contact1.name);

    const contact1Email = this.page.locator('input[formcontrolname="contact1Email"]');
    await contact1Email.fill(data.contact1.email);

    const phone1Input = this.page.locator('input[formcontrolname="contact1Phone"]');
    await phone1Input.fill(data.contact1.phone);

    if (data.contact1.relationship) {
      const rel1 = this.page.locator('p-select[formcontrolname="contact1Relationship"]');
      await this.selectDropdownOption(rel1, data.contact1.relationship);
    }

    // Contact 2
    if (data.contact2) {
      const contact2Name = this.page.locator('input[formcontrolname="contact2Name"]');
      if (await contact2Name.isVisible()) {
        await contact2Name.fill(data.contact2.name);
      }

      const contact2Email = this.page.locator('input[formcontrolname="contact2Email"]');
      if (await contact2Email.isVisible()) {
        await contact2Email.fill(data.contact2.email);
      }

      const phone2Input = this.page.locator('input[formcontrolname="contact2Phone"]');
      if (await phone2Input.isVisible()) {
        await phone2Input.fill(data.contact2.phone);
      }

      if (data.contact2.relationship) {
        const rel2 = this.page.locator('p-select[formcontrolname="contact2Relationship"]');
        await this.selectDropdownOption(rel2, data.contact2.relationship);
      }
    }

    const saveButton = this.page.getByRole('button', { name: 'Save', exact: true });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click();
    await expect(saveButton).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 5. FAMILY MEMBERS
  // ==========================================

  async openFamilyMembers() {
    await this.openPersonalSubTab('Family Members');
  }

  async addFamilyMember(data: FamilyMemberData) {
    await this.openFamilyMembers();
    await this.page.getByText('Add New', { exact: true }).click();

    const nameInput = this.page.getByRole('textbox', { name: 'Name*' });
    await nameInput.fill(data.name);

    const dobInput = this.page.getByRole('textbox', { name: 'Date of Birth*' });
    await dobInput.fill(data.dob);

    const relDropdown = this.page.getByRole('combobox', { name: 'Please select relationship' });
    await this.selectDropdownOption(relDropdown, data.relationship);

    if (data.dependent) {
      const depCheckbox = this.page.getByRole('checkbox', { name: 'Dependent' });
      await depCheckbox.check();
    }

    const addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.name)).toBeVisible({ timeout: 15000 });
  }

  async updateFamilyMember(searchName: string, updatedName: string) {
    const row = this.getTableRow(searchName);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const nameInput = this.page.getByRole('textbox', { name: 'Name*' });
    await nameInput.fill(updatedName);

    const updateBtn = this.page.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(updatedName)).toBeVisible({ timeout: 15000 });
  }

  async deleteFamilyMember(searchName: string) {
    const row = this.getTableRow(searchName);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(searchName)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 6. IDENTITY INFORMATION
  // ==========================================

  async openIdentityInfo() {
    await this.openPersonalSubTab('Identity Info');
  }

  async addIdentity(data: IdentityData) {
    await this.openIdentityInfo();

    const existingTypeRow = this.getTableRow(data.type);
    if (await existingTypeRow.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.deleteIdentity(data.type).catch(() => {});
    }

    await this.page.getByText('Add New', { exact: true }).click();

    const typeDropdown = this.page.getByRole('combobox', { name: 'Please select identity type' });
    await this.selectDropdownOption(typeDropdown, data.type);

    const numInput = this.page
      .getByRole('textbox', { name: /Identity Number|Identity Type\* Identity/i })
      .first();
    await numInput.fill(data.number);

    const filePath = data.filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: 'Choose File' }), filePath);

    const dialog = this.page.locator('.modal.show, ngb-modal-window, [role="dialog"], .p-dialog').first();
    const addButton = dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.number)).toBeVisible({ timeout: 15000 });
  }

  async updateIdentity(identityNumber: string, filePath?: string) {
    const row = this.getTableRow(identityNumber);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const file = filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: 'Choose File' }), file).catch(() => {});

    const updateBtn = this.page.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
  }

  async deleteIdentity(identityNumber: string) {
    const row = this.getTableRow(identityNumber);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(identityNumber)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 7. BANK INFORMATION
  // ==========================================

  async openBankInfo() {
    await this.openPersonalSubTab('Bank Info');
  }

  async addBank(data: BankData) {
    await this.openBankInfo();
    await this.page.getByText('Add New', { exact: true }).click();

    const bankDropdown = this.page
      .getByRole('combobox', { name: /bank name/i })
      .or(this.page.getByRole('button', { name: 'dropdown trigger' }))
      .first();
    await this.selectDropdownOption(bankDropdown, data.bankName);

    const holderInput = this.page.getByRole('textbox', { name: "Account Holder's Name*" });
    await holderInput.fill(data.accountHolder);

    const accountInput = this.page.getByRole('spinbutton', { name: 'Account Number*' });
    await accountInput.fill(data.accountNumber);

    const ifscInput = this.page.getByRole('textbox', { name: 'IFSC Code*' });
    await ifscInput.fill(data.ifsc);

    const filePath = data.filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: 'Choose File' }), filePath);

    if (data.primaryBank) {
      const primaryCheckbox = this.page.getByRole('checkbox', { name: 'Primary Bank' });
      await primaryCheckbox.check();
    }

    const addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.accountHolder)).toBeVisible({ timeout: 15000 });
  }

  async updateBank(accountHolder: string, newAccountHolder: string) {
    const row = this.getTableRow(accountHolder);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const holderInput = this.page.getByRole('textbox', { name: "Account Holder's Name*" });
    await holderInput.fill(newAccountHolder);

    const updateBtn = this.page.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(newAccountHolder)).toBeVisible({ timeout: 15000 });
  }

  async deleteBank(accountHolder: string) {
    const row = this.getTableRow(accountHolder);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(accountHolder)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 8. ACADEMICS
  // ==========================================

  async openAcademics() {
    await this.openPersonalSubTab('Academics');
  }

  async addAcademic(data: AcademicData) {
    await this.openAcademics();
    await this.page.getByText('Add New', { exact: true }).click();

    const qualDropdown = this.page
      .getByRole('combobox', { name: /qualification|degree/i })
      .or(this.page.getByRole('button', { name: 'dropdown trigger' }))
      .first();
    await this.selectDropdownOption(qualDropdown, data.qualification);

    const univInput = this.page.getByRole('textbox', { name: 'University*' });
    await univInput.fill(data.university);

    const specInput = this.page.getByRole('textbox', { name: 'Specialization*' });
    await specInput.fill(data.specialization);

    const gpaInput = this.page.getByRole('spinbutton', { name: 'GPA/CGPA*' });
    await gpaInput.fill(data.gpa);

    const fromDateInput = this.page.getByRole('textbox', { name: 'From Date*' });
    await fromDateInput.fill(data.fromDate);

    const toDateInput = this.page.getByRole('textbox', { name: 'To Date*' });
    await toDateInput.fill(data.toDate);

    const filePath = data.filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: 'Choose File' }), filePath);

    const addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.university)).toBeVisible({ timeout: 15000 });
  }

  async updateAcademic(university: string, newGpa: string) {
    const row = this.getTableRow(university);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const gpaInput = this.page.getByRole('spinbutton', { name: 'GPA/CGPA*' });
    await gpaInput.fill(newGpa);

    const updateBtn = this.page.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
  }

  async deleteAcademic(university: string) {
    const row = this.getTableRow(university);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(university)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 9. SKILLS
  // ==========================================

  async openSkills() {
    await this.openPersonalSubTab('Skills');
  }

  async addSkill(data: SkillData) {
    await this.openSkills();
    await this.page.getByText('Add New Skill', { exact: true }).click();

    const catDropdown = this.page.getByRole('combobox', { name: 'Please select skill category' });
    await this.selectDropdownOption(catDropdown, data.category);

    const skillInput = this.page.getByRole('textbox', { name: 'Please type a skill and press' });
    await skillInput.fill(data.skill);
    await skillInput.press('Enter');

    const profDropdown = this.page.getByRole('combobox', { name: 'Please select proficiency' });
    await this.selectDropdownOption(profDropdown, data.proficiency);

    const addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.page.getByText(data.skill, { exact: true }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteSkill(skillName: string) {
    const chip = this.page
      .locator('.custom-chip-card')
      .filter({ hasText: skillName })
      .first();
    await expect(chip).toBeVisible({ timeout: 15000 });

    const deleteIcon = chip.locator('.custom-delete-img, img, i').first();
    await deleteIcon.click();

    await this.confirmYes();
    await expect(this.page.getByText(skillName, { exact: true })).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 10. JOB NAVIGATION
  // ==========================================

  async verifyJobNavigation() {
    await this.openJobTab();

    const sections = ['Job Info', 'Probation Info', 'Compensations', 'Onboarding Info'];
    for (const section of sections) {
      const tab = this.page
        .getByRole('img', { name: section, exact: true })
        .or(this.page.locator(`img[alt="${section}"]`))
        .or(this.page.getByText(section, { exact: true }))
        .first();

      if (await tab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await tab.click();
        await expect(
          this.page.getByText(section, { exact: true }).first()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  }

  // ==========================================
  // 11. EMPLOYMENT HISTORY
  // ==========================================

  async openEmploymentHistory() {
    await this.navigateToMyInfo();
    if (this.page.url().includes('/myinfo/job/past-experiences')) return;
    await this.openJobTab();
    const tab = this.page.locator('img[alt="Employment History"]').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    } else {
      await this.page.goto('/myinfo/job/past-experiences', { waitUntil: 'domcontentloaded' });
    }
    await expect(this.page).toHaveURL(/\/myinfo\/job\/past-experiences/, { timeout: 15000 });
  }

  async addEmployment(data: EmploymentData) {
    await this.openEmploymentHistory();
    await this.page.getByText('Add New', { exact: true }).click();

    const dialog = this.page.locator('.modal.show, ngb-modal-window, [role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // 1. Company via autocomplete
    const compButton = dialog.locator('p-autocomplete button');
    if (await compButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await compButton.click();
      await this.page.waitForTimeout(500);
      const opt = this.page
        .locator('.p-autocomplete-option, [role="option"]')
        .filter({ hasText: new RegExp(`^\\s*${data.company}\\s*$`) })
        .first();
      await opt.click();
    } else {
      const compInput = dialog.locator('input[placeholder*="company"], p-autocomplete input').first();
      await compInput.fill(data.company);
      await this.page.waitForTimeout(500);
      const opt = this.page
        .locator('.p-autocomplete-option, [role="option"]')
        .filter({ hasText: new RegExp(`^\\s*${data.company}\\s*$`) })
        .first();
      if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await opt.click();
      }
    }

    // 2. Employment type
    const typeDropdown = dialog.locator('p-select[formcontrolname="employmentType"]').first();
    await this.selectDropdownOption(typeDropdown, data.employmentType);

    // 3. Dates
    await dialog.locator('#FromDate').fill(data.fromDate);
    await dialog.locator('#ToDate').fill(data.toDate);

    // 4. Job role
    await dialog.locator('#jobRole').fill(data.jobRole);

    // 5. Contact fields
    if (data.contactName) {
      await dialog.locator('input[formcontrolname="previousContactName"]').fill(data.contactName);
    }
    if (data.contactNumber) {
      await dialog.locator('input[formcontrolname="previousContactNumber"]').fill(data.contactNumber);
    }
    if (data.contactEmail) {
      await dialog.locator('input[formcontrolname="previousContactEmail"]').fill(data.contactEmail);
    }

    // 6. Attachment
    const filePath = data.filePath || this.defaultAttachmentPath;
    await this.setFileInput(dialog.locator('input[type="file"]'), filePath);

    const addButton = dialog.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled({ timeout: 10000 });
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.jobRole)).toBeVisible({ timeout: 15000 });
  }

  async updateEmployment(jobRole: string, newRole: string) {
    const row = this.getTableRow(jobRole);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const dialog = this.page.locator('.modal.show, ngb-modal-window, [role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const roleInput = dialog
      .locator('#jobRole, input[formcontrolname="jobTitle"], input[placeholder*="job role"]')
      .first();
    await roleInput.fill(newRole);

    const updateBtn = dialog.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(newRole)).toBeVisible({ timeout: 15000 });
  }

  async deleteEmployment(jobRole: string) {
    const row = this.getTableRow(jobRole);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(jobRole)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 12. CERTIFICATIONS
  // ==========================================

  async openCertifications() {
    await this.navigateToMyInfo();
    if (this.page.url().includes('/myinfo/job/certifications')) return;
    await this.openJobTab();
    const tab = this.page.locator('img[alt="Certifications"]').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    } else {
      await this.page.goto('/myinfo/job/certifications', { waitUntil: 'domcontentloaded' });
    }
    await expect(this.page).toHaveURL(/\/myinfo\/job\/certifications/, { timeout: 15000 });
  }

  async addCertification(data: CertificationData) {
    await this.openCertifications();
    await this.page.getByText('Add New', { exact: true }).click();

    const nameInput = this.page.getByRole('textbox', { name: 'Certification Name *' });
    await nameInput.fill(data.name);

    const idInput = this.page.getByRole('textbox', { name: 'Certification ID *' });
    await idInput.fill(data.certId);

    const dateInput = this.page.getByRole('textbox', { name: 'Issued Date *' });
    await dateInput.fill(data.issuedDate);

    if (data.noExpiry) {
      const noExpiryCheckbox = this.page.getByRole('checkbox', { name: 'No Expiry' });
      await noExpiryCheckbox.check();
    }

    const filePath = data.filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: /Attachment/i }), filePath);

    const addButton = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addButton).toBeEnabled();
    await addButton.click();

    await this.waitForDialogClose();
    await expect(this.getTableRow(data.name)).toBeVisible({ timeout: 15000 });
  }

  async updateCertification(certName: string) {
    const row = this.getTableRow(certName);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Update');

    const dialog = this.page.locator('.modal.show, ngb-modal-window, [role="dialog"]').first();
    const fileInput = dialog.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(this.defaultAttachmentPath).catch(() => {});
    }

    const updateBtn = this.page.getByRole('button', { name: 'Update', exact: true });
    await updateBtn.click();

    await this.waitForDialogClose();
  }

  async deleteCertification(certName: string) {
    const row = this.getTableRow(certName);
    await expect(row).toBeVisible({ timeout: 15000 });

    await this.clickRowAction(row, 'Delete');

    await this.confirmYes();
    await expect(this.getTableRow(certName)).toBeHidden({ timeout: 15000 });
  }

  // ==========================================
  // 13. DOCUMENTS
  // ==========================================

  async uploadDocument(folderPath: string[], filePath?: string) {
    await this.openDocumentsTab();

    for (const folder of folderPath) {
      const folderItem = this.page.getByText(folder, { exact: true }).first();
      await expect(folderItem).toBeVisible({ timeout: 10000 });
      await folderItem.click();
    }

    const uploadBtn = this.page.getByRole('button', { name: /Upload File/i }).first();
    await expect(uploadBtn).toBeVisible({ timeout: 10000 });
    await uploadBtn.click();

    const file = filePath || this.defaultAttachmentPath;
    await this.setFileInput(this.page.getByRole('button', { name: 'Choose File' }), file);

    const addBtn = this.page.getByRole('button', { name: 'Add', exact: true });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    await this.waitForDialogClose();
  }

  async downloadDocument(folderPath: string[]): Promise<Download> {
    await this.openDocumentsTab();

    for (const folder of folderPath) {
      const folderItem = this.page.getByText(folder, { exact: true }).first();
      await expect(folderItem).toBeVisible({ timeout: 10000 });
      await folderItem.click();
    }

    const downloadIcon = this.page.locator('app-download-icon').first();
    await expect(downloadIcon).toBeVisible({ timeout: 15000 });

    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    const innerClickable = downloadIcon.locator('.cursor, svg, path').first();
    if (await innerClickable.isVisible().catch(() => false)) {
      await innerClickable.click();
    } else {
      await downloadIcon.click();
    }
    const download = await downloadPromise;
    return download;
  }

  // ==========================================
  // TABLE HELPERS
  // ==========================================

  getTableRow(text: string): Locator {
    return this.page.getByRole('row').filter({ hasText: text }).first();
  }

  async openRowActionMenu(row: Locator) {
    const trigger = row.locator('[data-bs-toggle="dropdown"], .bi-three-dots-vertical, .bi-three-dots').first();
    await expect(trigger).toBeVisible({ timeout: 10000 });
    await trigger.click();
  }

  async clickRowAction(row: Locator, action: 'Update' | 'Delete') {
    const menu = row.locator('.dropdown-menu');
    const isAlreadyOpen = await menu.evaluate(el => el.classList.contains('show')).catch(() => false);
    if (!isAlreadyOpen) {
      await this.openRowActionMenu(row);
    }

    try {
      await expect(menu).toHaveClass(/show/, { timeout: 4000 });
    } catch {
      await this.openRowActionMenu(row);
      await expect(menu).toHaveClass(/show/, { timeout: 6000 });
    }

    const actionBtn = menu
      .locator('button, a, .dropdown-item')
      .filter({ hasText: new RegExp(action, 'i') })
      .first();

    await actionBtn.click();
  }

  // ==========================================
  // 14. EXTENDED JOB SECTIONS NAVIGATION
  // ==========================================

  async openJobSection(sectionName: string) {
    const sectionConfigs: Record<string, { iconAlt: string; route: string; expectedHeading: RegExp }> = {
      'Pre Onboarding Info': {
        iconAlt: 'Pre Onboarding Info',
        route: '/myinfo/job/pre-onboarding-details',
        expectedHeading: /Pre-?Onboarding Info/i,
      },
      'Onboarding Info': {
        iconAlt: 'Onboarding Info',
        route: '/myinfo/job/onboarding-details',
        expectedHeading: /Onboarding Info/i,
      },
      'Compensations': {
        iconAlt: 'Compensations',
        route: '/myinfo/job/compensation-details',
        expectedHeading: /Compensations/i,
      },
      'Probation Info': {
        iconAlt: 'Probation Info',
        route: '/myinfo/job/probation-details',
        expectedHeading: /Probation Info/i,
      },
      'Job Info': {
        iconAlt: 'Job Info',
        route: '/myinfo/job/job-details',
        expectedHeading: /Job Info/i,
      },
      'Team Members': {
        iconAlt: 'Team Members',
        route: '/myinfo/job/team/my-team-members',
        expectedHeading: /(Team Members|Reports To You|Works With You)/i,
      },
      'Assigned Assets': {
        iconAlt: 'Assigned Assets',
        route: '/myinfo/job/assets-details',
        expectedHeading: /Assigned Assets/i,
      },
      'Employment History': {
        iconAlt: 'Employment History',
        route: '/myinfo/job/past-experiences',
        expectedHeading: /Employment History/i,
      },
      'Certifications': {
        iconAlt: 'Certifications',
        route: '/myinfo/job/certifications',
        expectedHeading: /Certifications/i,
      },
      'Desk Info': {
        iconAlt: 'Desk info',
        route: '/myinfo/job/desk-details',
        expectedHeading: /Desk Info/i,
      },
      'Separation Request': {
        iconAlt: 'Separation Request',
        route: '/myinfo/job/separation-details/separation-requests',
        expectedHeading: /Separation Request/i,
      },
      'No Due Clearance Info': {
        iconAlt: 'No Due Clearance Info',
        route: '/myinfo/job/no-due-clearance-details',
        expectedHeading: /No Due Clearance/i,
      },
      'Onboarding Documents': {
        iconAlt: 'Onboarding Documents',
        route: '/myinfo/job/onboarding-verification',
        expectedHeading: /Onboarding Verification/i,
      },
      'Trainee Onboard Request': {
        iconAlt: 'Trainee Onboard Request',
        route: '/myinfo/job/trainee-onboarding-requests',
        expectedHeading: /Trainee Onboarding Verification/i,
      },
      'Offboarding Info': {
        iconAlt: 'Offboarding Info',
        route: '/myinfo/job/employmentType',
        expectedHeading: /Offboarding Info/i,
      },
      'Cards': {
        iconAlt: 'Cards',
        route: '/myinfo/job/cards',
        expectedHeading: /Cards/i,
      },
      'Assigned Projects': {
        iconAlt: 'Assigned Projects',
        route: '/myinfo/job/project-info',
        expectedHeading: /Assigned Projects/i,
      },
    };

    const config = sectionConfigs[sectionName];
    if (!config) {
      throw new Error(`Unknown Job section name: "${sectionName}"`);
    }

    await this.openJobTab();

    if (this.page.url().includes(config.route)) {
      return;
    }

    const subTabIcon = this.page
      .locator(`img[alt="${config.iconAlt}"]`)
      .or(this.page.getByRole('img', { name: config.iconAlt, exact: true }))
      .or(this.page.locator('.cdk-drag, .grid-item, div').filter({ hasText: new RegExp(`^\\s*${sectionName}\\s*$`) }))
      .first();

    if (await subTabIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
      await subTabIcon.click();
    }

    try {
      await expect(this.page).toHaveURL(new RegExp(config.route.replace(/\//g, '\\/')), { timeout: 4000 });
    } catch {
      await this.page.goto(config.route, { waitUntil: 'domcontentloaded' });
      await expect(this.page).toHaveURL(new RegExp(config.route.replace(/\//g, '\\/')), { timeout: 15000 });
    }
  }

  async verifyJobSection(sectionName: string) {
    const sectionConfigs: Record<string, { route: string; expectedHeading: RegExp }> = {
      'Pre Onboarding Info': {
        route: '/myinfo/job/pre-onboarding-details',
        expectedHeading: /Pre-?Onboarding Info/i,
      },
      'Onboarding Info': {
        route: '/myinfo/job/onboarding-details',
        expectedHeading: /Onboarding Info/i,
      },
      'Compensations': {
        route: '/myinfo/job/compensation-details',
        expectedHeading: /Compensations/i,
      },
      'Probation Info': {
        route: '/myinfo/job/probation-details',
        expectedHeading: /Probation Info/i,
      },
      'Job Info': {
        route: '/myinfo/job/job-details',
        expectedHeading: /Job Info/i,
      },
      'Team Members': {
        route: '/myinfo/job/team/my-team-members',
        expectedHeading: /(Team Members|Reports To You|Works With You)/i,
      },
      'Assigned Assets': {
        route: '/myinfo/job/assets-details',
        expectedHeading: /Assigned Assets/i,
      },
      'Employment History': {
        route: '/myinfo/job/past-experiences',
        expectedHeading: /Employment History/i,
      },
      'Certifications': {
        route: '/myinfo/job/certifications',
        expectedHeading: /Certifications/i,
      },
      'Desk Info': {
        route: '/myinfo/job/desk-details',
        expectedHeading: /Desk Info/i,
      },
      'Separation Request': {
        route: '/myinfo/job/separation-details/separation-requests',
        expectedHeading: /Separation Request/i,
      },
      'No Due Clearance Info': {
        route: '/myinfo/job/no-due-clearance-details',
        expectedHeading: /No Due Clearance/i,
      },
      'Onboarding Documents': {
        route: '/myinfo/job/onboarding-verification',
        expectedHeading: /Onboarding Verification/i,
      },
      'Trainee Onboard Request': {
        route: '/myinfo/job/trainee-onboarding-requests',
        expectedHeading: /Trainee Onboarding Verification/i,
      },
      'Offboarding Info': {
        route: '/myinfo/job/employmentType',
        expectedHeading: /Offboarding Info/i,
      },
      'Cards': {
        route: '/myinfo/job/cards',
        expectedHeading: /Cards/i,
      },
      'Assigned Projects': {
        route: '/myinfo/job/project-info',
        expectedHeading: /Assigned Projects/i,
      },
    };

    const config = sectionConfigs[sectionName];
    if (!config) {
      throw new Error(`Unknown Job section: ${sectionName}`);
    }

    await this.openJobSection(sectionName);

    const heading = this.page
      .locator('h1, h2, h3, h4, h5, .card-title, .component-header, .page-header, .header-text, .component-sub-header, .nav-link.active')
      .filter({ hasText: config.expectedHeading })
      .or(this.page.getByRole('heading', { name: config.expectedHeading }))
      .or(this.page.getByText(config.expectedHeading))
      .filter({ visible: true })
      .first();

    await expect(heading).toBeVisible({ timeout: 15000 });

    const errorAlert = this.page.locator('.alert-danger, .p-toast-message-error').first();
    await expect(errorAlert).toBeHidden();
  }

  // Individual section helper methods
  async verifyPreOnboardingInfo() { await this.verifyJobSection('Pre Onboarding Info'); }
  async verifyOnboardingInfo() { await this.verifyJobSection('Onboarding Info'); }
  async verifyCompensations() { await this.verifyJobSection('Compensations'); }
  async verifyProbationInfo() { await this.verifyJobSection('Probation Info'); }
  async verifyJobInfo() { await this.verifyJobSection('Job Info'); }
  async verifyTeamMembers() { await this.verifyJobSection('Team Members'); }
  async verifyAssignedAssets() { await this.verifyJobSection('Assigned Assets'); }
  async verifyEmploymentHistorySection() { await this.verifyJobSection('Employment History'); }
  async verifyCertificationsSection() { await this.verifyJobSection('Certifications'); }
  async verifyDeskInfo() { await this.verifyJobSection('Desk Info'); }
  async verifySeparationRequest() { await this.verifyJobSection('Separation Request'); }
  async verifyNoDueClearanceInfo() { await this.verifyJobSection('No Due Clearance Info'); }
  async verifyOnboardingDocuments() { await this.verifyJobSection('Onboarding Documents'); }
  async verifyTraineeOnboardRequest() { await this.verifyJobSection('Trainee Onboard Request'); }
  async verifyOffboardingInfo() { await this.verifyJobSection('Offboarding Info'); }
  async verifyCards() { await this.verifyJobSection('Cards'); }
  async verifyAssignedProjects() { await this.verifyJobSection('Assigned Projects'); }

  // ==========================================
  // 15. DOCUMENTS & LETTERS
  // ==========================================

  async openDocuments() {
    await this.openDocumentsTab();
  }

  async openLettersTab() {
    await this.openDocumentsTab();

    if (this.page.url().includes('/myinfo/documents/letter-acknowledge-documents')) {
      return;
    }

    const lettersTab = this.page
      .getByRole('img', { name: 'Letters' })
      .or(this.page.locator('img[alt="Letters"]'))
      .or(this.page.getByText('Letters', { exact: true }))
      .first();

    if (await lettersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lettersTab.click();
    } else {
      await this.page.goto('/myinfo/documents/letter-acknowledge-documents', { waitUntil: 'domcontentloaded' });
    }

    await expect(this.page).toHaveURL(/\/letter-acknowledge-documents/, { timeout: 15000 });
  }

  async openLetters() {
    await this.openLettersTab();
  }

  async openLetter(letterName: string) {
    await this.openLettersTab();

    const tab = this.page
      .locator('button[role="tab"], [role="tab"]')
      .filter({ hasText: new RegExp(letterName, 'i') })
      .first();

    await expect(tab).toBeVisible({ timeout: 10000 });
    await tab.click();
    await expect(tab).toHaveClass(/active/, { timeout: 5000 });
  }

  async verifyLetterStatusTab(status: string): Promise<boolean> {
    const statusTab = this.page
      .locator('button[role="tab"], [role="tab"]')
      .filter({ hasText: new RegExp(`^\\s*${status}\\s*$`, 'i') })
      .first();

    if (await statusTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusTab.click();
      await expect(statusTab).toHaveClass(/active/, { timeout: 5000 });

      const content = this.page
        .locator('table, .table, [class*="no-data"], .component-sub-header, app-letter-acknowledgement-details')
        .or(this.page.getByText(/No Data Found/i))
        .first();

      await expect(content).toBeVisible({ timeout: 10000 });
      return true;
    }
    return false;
  }

  async verifyLetterStatusTabs(letterName: string): Promise<string[]> {
    await this.openLetter(letterName);

    const checkedTabs: string[] = [];
    const statusCandidates = ['Generated', 'Accepted', 'Rejected'];

    for (const status of statusCandidates) {
      const isChecked = await this.verifyLetterStatusTab(status);
      if (isChecked) {
        checkedTabs.push(status);
      }
    }

    return checkedTabs;
  }
}
