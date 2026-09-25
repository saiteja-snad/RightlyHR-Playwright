import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { MyInfoPage } from '../pages/my-infopage';

test.describe('My Info Module Automation Suite', () => {
  let loginPage: LoginPage;
  let myInfoPage: MyInfoPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    myInfoPage = new MyInfoPage(page);

    // Common authentication using environment variables
    await loginPage.loginFromEnv();
    await myInfoPage.navigateToMyInfo();
  });

  // ==========================================
  // TC01 - Login and My Info navigation
  // ==========================================
  test('TC01 - Login and My Info navigation', async ({ page }) => {
    await expect(page).toHaveURL(/\/myinfo/);
    await expect(page.getByText('Personal', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Basic Info', { exact: true }).first()).toBeVisible();
  });

  // ==========================================
  // TC02 - Update Personal Information
  // ==========================================
  test('TC02 - Update Personal Information', async ({ page }) => {
    await myInfoPage.updatePersonalInfo({
      salutation: 'Miss.',
      gender: 'Female',
      firstName: 'Induu',
      lastName: 'Priyaa',
      dateOfBirth: '1996-01-02',
      bloodGroup: 'AB+',
      maritalStatus: 'Married',
      marriageAnniversary: '2022-05-15',
    });

    // Verification
    await expect(page.getByText('Induu Priyaa').first()).toBeVisible();
    await expect(page.getByText('AB+').first()).toBeVisible();
  });

  // ==========================================
  // TC03 - Update Contact Information
  // ==========================================
  test('TC03 - Update Contact Information', async ({ page }) => {
    const uniqueEmail = `indu_${Date.now().toString().slice(-4)}@yopmail.com`;

    await myInfoPage.updateContactInfo({
      workNumber: '9123499798',
      phoneNumber: '9886577745',
      personalEmail: uniqueEmail,
    });

    await expect(page.locator('input[formcontrolname="personalEmail"]')).toHaveValue(uniqueEmail, { timeout: 15000 });
  });

  // ==========================================
  // TC04 - Update Address Information
  // ==========================================
  test('TC04 - Update Address Information', async ({ page }) => {
    await myInfoPage.updateAddress({
      sameAsPermanent: false,
      permanentZip: '500082',
      currentZip: '800072',
    });

    await expect(page.locator('#permanentZipCode')).toHaveValue('500082');
  });

  // ==========================================
  // TC05 - Emergency Contact CRUD
  // ==========================================
  test('TC05 - Emergency Contact CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const contact1Name = `PW_Emerg1_${uniqueId}`;
    const contact2Name = `PW_Emerg2_${uniqueId}`;

    await myInfoPage.updateEmergencyContacts({
      contact1: {
        name: contact1Name,
        email: `emerg1_${uniqueId}@test.com`,
        phone: '9876543210',
        relationship: 'Brother',
      },
      contact2: {
        name: contact2Name,
        email: `emerg2_${uniqueId}@test.com`,
        phone: '9876543211',
        relationship: 'Uncle',
      },
    });

    await expect(page.locator('#contact1Name')).toHaveValue(contact1Name);
    await expect(page.locator('#contact2Name')).toHaveValue(contact2Name);
  });

  // ==========================================
  // TC06 - Family Member CRUD
  // ==========================================
  test('TC06 - Family Member CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-5);
    const memberName = `PW_Fam_${uniqueId}`;
    const updatedMemberName = `PW_FamUpd_${uniqueId}`;

    // 1. Add
    await myInfoPage.addFamilyMember({
      name: memberName,
      dob: '2015-08-10',
      relationship: 'Brother',
      dependent: true,
    });
    await expect(myInfoPage.getTableRow(memberName)).toBeVisible();

    // 2. Update
    await myInfoPage.updateFamilyMember(memberName, updatedMemberName);
    await expect(myInfoPage.getTableRow(updatedMemberName)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteFamilyMember(updatedMemberName);
    await expect(myInfoPage.getTableRow(updatedMemberName)).toBeHidden();
  });

  // ==========================================
  // TC07 - Identity Information CRUD
  // ==========================================
  test('TC07 - Identity Information CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-6);
    const identityNumber = `789456${uniqueId}`;

    // 1. Add
    await myInfoPage.addIdentity({
      type: 'Pass Book',
      number: identityNumber,
    });
    await expect(myInfoPage.getTableRow(identityNumber)).toBeVisible();

    // 2. Update
    await myInfoPage.updateIdentity(identityNumber);
    await expect(myInfoPage.getTableRow(identityNumber)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteIdentity(identityNumber);
    await expect(myInfoPage.getTableRow(identityNumber)).toBeHidden();
  });

  // ==========================================
  // TC08 - Bank Information CRUD
  // ==========================================
  test('TC08 - Bank Information CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-5);
    const accountHolder = `PW_Bank_${uniqueId}`;
    const updatedAccountHolder = `PW_BankUpd_${uniqueId}`;
    const accountNumber = `688990089${uniqueId}`;

    // 1. Add
    await myInfoPage.addBank({
      bankName: 'Maharashtra Gramin Bank',
      accountHolder: accountHolder,
      accountNumber: accountNumber,
      ifsc: 'UTIB0001234',
      primaryBank: false,
    });
    await expect(myInfoPage.getTableRow(accountHolder)).toBeVisible();

    // 2. Update
    await myInfoPage.updateBank(accountHolder, updatedAccountHolder);
    await expect(myInfoPage.getTableRow(updatedAccountHolder)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteBank(updatedAccountHolder);
    await expect(myInfoPage.getTableRow(updatedAccountHolder)).toBeHidden();
  });

  // ==========================================
  // TC09 - Academic Information CRUD
  // ==========================================
  test('TC09 - Academic Information CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-5);
    const university = `PW_Univ_${uniqueId}`;

    // 1. Add
    await myInfoPage.addAcademic({
      qualification: 'B.TECH',
      university: university,
      specialization: 'CSE',
      gpa: '8',
      fromDate: '2006-06-01',
      toDate: '2010-05-30',
    });
    await expect(myInfoPage.getTableRow(university)).toBeVisible();

    // 2. Update
    await myInfoPage.updateAcademic(university, '9');
    await expect(myInfoPage.getTableRow(university)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteAcademic(university);
    await expect(myInfoPage.getTableRow(university)).toBeHidden();
  });

  // ==========================================
  // TC10 - Skills CRUD
  // ==========================================
  test('TC10 - Skills CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const skillName = `Java_${uniqueId}`;

    // 1. Add
    await myInfoPage.addSkill({
      category: 'Technical Skills',
      skill: skillName,
      proficiency: 'Expert',
    });
    await expect(page.getByText(skillName, { exact: true }).first()).toBeVisible();

    // 2. Delete
    await myInfoPage.deleteSkill(skillName);
    await expect(page.getByText(skillName, { exact: true })).toBeHidden();
  });
  // ==========================================
  // TC-JOB-01 - Verify all Job information sections
  // ==========================================
  test('TC-JOB-01 - Verify all Job information sections', async ({ page }) => {
    const jobSections = [
      'Pre Onboarding Info',
      'Onboarding Info',
      'Compensations',
      'Probation Info',
      'Job Info',
      'Team Members',
      'Assigned Assets',
      'Employment History',
      'Certifications',
      'Desk Info',
      'Separation Request',
      'No Due Clearance Info',
      'Onboarding Documents',
      'Trainee Onboard Request',
      'Offboarding Info',
      'Cards',
      'Assigned Projects',
    ];

    for (const section of jobSections) {
      await myInfoPage.verifyJobSection(section);
    }
  });


  // ==========================================
  // TC11 - Job/Probation/Compensation navigation
  // ==========================================
  test('TC11 - Job/Probation/Compensation navigation', async ({ page }) => {
    await myInfoPage.verifyJobNavigation();
    await expect(page.getByText('Job', { exact: true }).first()).toBeVisible();
  });

  // ==========================================
  // TC12 - Employment History CRUD
  // ==========================================
  test('TC12 - Employment History CRUD', async ({ page }) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomSuffix = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const jobRole = `QA_${randomSuffix}`;
    const updatedJobRole = `SR_${randomSuffix}`;

    // 1. Add
    await myInfoPage.addEmployment({
      company: 'ABC',
      employmentType: 'Full-Time',
      fromDate: '2020-01-01',
      toDate: '2023-01-01',
      jobRole: jobRole,
      contactName: `Ramu${randomSuffix}`,
      contactNumber: '8652524244',
      contactEmail: 'ramu@gmail.com',
    });
    await expect(myInfoPage.getTableRow(jobRole)).toBeVisible();

    // 2. Update
    await myInfoPage.updateEmployment(jobRole, updatedJobRole);
    await expect(myInfoPage.getTableRow(updatedJobRole)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteEmployment(updatedJobRole);
    await expect(myInfoPage.getTableRow(updatedJobRole)).toBeHidden();
  });

  // ==========================================
  // TC13 - Certifications CRUD
  // ==========================================
  test('TC13 - Certifications CRUD', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-5);
    const certName = `PW_Cert_${uniqueId}`;
    const certId = `789${uniqueId}`;

    // 1. Add
    await myInfoPage.addCertification({
      name: certName,
      certId: certId,
      issuedDate: '2023-08-15',
      noExpiry: true,
    });
    await expect(myInfoPage.getTableRow(certName)).toBeVisible();

    // 2. Update
    await myInfoPage.updateCertification(certName);
    await expect(myInfoPage.getTableRow(certName)).toBeVisible();

    // 3. Delete
    await myInfoPage.deleteCertification(certName);
    await expect(myInfoPage.getTableRow(certName)).toBeHidden();
  });

  // ==========================================
  // TC14 - Documents upload
  // ==========================================
  test('TC14 - Documents upload', async ({ page }) => {
    // Navigate into ClientDocuments -> Client Calls or TimesheetReports
    await myInfoPage.uploadDocument(['TimesheetReports', '12460']);
    await expect(page.getByText('12460', { exact: true }).first()).toBeVisible();
  });

  // ==========================================
  // TC15 - Documents download
  // ==========================================
  test('TC15 - Documents download', async ({ page }) => {
    const download = await myInfoPage.downloadDocument(['ClientDocuments', 'Client Calls']);
    const filename = download.suggestedFilename();
    expect(filename).toBeTruthy();
    expect(filename.length).toBeGreaterThan(0);
  });


  // ==========================================
  // TC-DOC-LETTERS-01 - Verify Letters section and all letter types
  // ==========================================
  test('TC-DOC-LETTERS-01 - Verify Letters section and all letter types', async ({ page }) => {
    await myInfoPage.openLettersTab();
    await expect(page).toHaveURL(/\/letter-acknowledge-documents/);

    const letterTypes = [
      'Appointment Letter',
      'Appraisal Letter',
      'Contractor Extension Letter',
      'Probation Confirmation Letter',
      'Probation Extension Letter',
      'Salary Revision Letter',
      'Trainee Appointment Letter',
    ];

    for (const letter of letterTypes) {
      const checkedTabs = await myInfoPage.verifyLetterStatusTabs(letter);
      expect(checkedTabs.length).toBeGreaterThan(0);
    }
  });
});

