import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-reports',
  imports: [CommonModule],
  templateUrl: './custom-reports.component.html',
  styleUrl: './custom-reports.component.scss'
})
export class CustomReportsComponent {
  showCard: boolean = false;
  JobShowCard: boolean = false;
  selecteditem: string[] = [];
  fieldOptions: string[] = [
    'ID',
    'Employee ID',
    'Salutation',
    'First Name',
    'Last Name',
    'Middle Name',
    'Status',
    'Marital Status',
    'Gender',
    'Date of Birth',
    'Blood Group',
    'Secondary Language',
  ]; //array for the personal data options
  CurrentAddress: string[] = [
    'Address Line 1(current)',
    'Address Line 2(current)',
    'City(current)',
    'State(current)',
    'Country(current)',
    'Zip Code/Post Code(current)',
  ]; //array for the current address info data options
  PermanentAddress: string[] = [
    'Address Line 1(permanemt)',
    'Address Line 2(permanemt)',
    'City(permanemt)',
    'State(permanemt)',
    'Country(permanemt)',
    'Zip Code/Post Code(permanemt)',
  ]; //array for the permanent address info data options
  contactDetailsOptions: string[] = [
    'Work Number',
    'Mobile Phone',
    'Work Email',
    'Home Email',
  ]; //array for the contact details data options
  EmergencyDetailsContact1: string[] = [
    'Name(contact1)',
    'Email(contact1)',
    'Phone Number(contact1)',
    'Relationship(contact1)',
  ]; //array for the emergency details for contact 1
  EmergencyDetailsContact2: string[] = [
    'Name(contact2)',
    'Email(contact2)',
    'Phone Number(contact2)',
    'Relationship(contact2)',
  ]; //array for the emergency details for contact 2
  educationDetails: string[] = [
    'Degree',
    'University',
    'Specialization',
    'GPA',
    'Degree Start Date',
    'Degree End Date',
  ]; //array for the Education details
  visaDetails: string[] = [
    'Visa Type',
    'Issued Country',
    'Issued Date',
    'Expiry Date',
  ]; //array for the Visa details
  identityDetails: string[] = [
    'Aadhaar Number',
    'PAN Number',
    'ESIC Number',
    'PF Number',
    'UAN Number',
  ]; //array for the identity details data options
  bankDetails: string[] = [
    'Bank Name',
    'Account Holders Name',
    'Account Number',
    'IFSC Code',
  ]; // array for the bank details data options
  preOnboardingDetails: string[] = [
    'Offer Sent Date',
    'Offer Sent By',
    'Offer Sent Status',
    'Appointment Sent Date',
    'Appointment Sent By',
    'Appointment Sent Status',
  ]; //array for  pre onboarding details data options
  OnBoardingDetails: string[] = [
    'Date Of Joining',
    'Probation End Date',
    'Probation Status',
    'Branch Code',
    'Notice Period',
    'Background Check Status',
    'Salary Hold',
    'PT',
    'ESIC',
    'PF',
    'Insurance',
  ]; //array for  onboarding details data options
  offBoardingDetails: string[] = [
    'Last Working Day',
    'Eligible For Rehire',
    'Exit Reason',
  ]; // array for offbording details data options
  EmploymentTypeDetails = ['Job Type', 'Grade Name']; //array for employeetype details data options
  jobDetails = [
    'Job Effective Date',
    'Job Role',
    'Grade Name',
    'Department',
    'Team',
    'Team Manager',
    'Reporting Manager',
    'Location',
    'Sub Location',
    'Shift',
    'Shift Code',
    'Job Type',
  ]; //array for job details data option
  compensationDetails = [
    'Compensation Effective Date',
    'Overtime Eligibility',
    'Reason',
    'Frequency',
    'Pay Type',
    'Yearly CTC',
  ];
  //Basic Info
  selectAllIsChecked__select: boolean = false;
  selectedFields__select: string[] = [];

  //current address
  selectAllIsChecked__selectAddress: boolean = false;
  selectedFields__selectAddress: string[] = [];

  //permanent address
  selectAllIsChecked__selectAddress2: boolean = false;
  selectedFields__selectAddress2: string[] = [];

  //Contact Details
  selectAllIsChecked__selectContact: boolean = false;
  selectedFields__selectContact: string[] = [];

  //Emergency Contact Details 1
  selectAllIsChecked__selectContact1: boolean = false;
  selectedFields__selectContact1: string[] = [];

  //Emergency Contact Details 2
  selectAllIsChecked__selectContact2: boolean = false;
  selectedFields__selectContact2: string[] = [];

  //Education Details
  selectAllIsChecked__selectEducationDetails: boolean = false;
  selectedFields__selectEducationDetails: string[] = [];

  //Visa Details
  selectAllIsChecked__selectVisaDetails: boolean = false;
  selectedFields__selectVisaDetails: string[] = [];

  //Identity Details
  selectAllIsChecked__selectIdentityDetails: boolean = false;
  selectedFields__selectIdentityDetails: string[] = [];

  //Bank Details
  selectAllIsChecked__selectBankDetails: boolean = false;
  selectedFields__selectBankDetails: string[] = [];

  //PreOnboarding Details
  selectAllIsChecked__selectPreOnboardingDetails: boolean = false;
  selectedFields__selectPreOnboardingDetails: string[] = [];

  //Onboarding Details
  selectAllIsChecked__selectOnboarding: boolean = false;
  selectedFields__selectOnboarding: string[] = [];

  //Offboarding Details
  selectAllIsChecked__selectOffboarding: boolean = false;
  selectedFields__selectOffboarding: string[] = [];

  //EmployementType Details
  selectAllIsChecked__selectEmploymentTypeDetails: boolean = false;
  selectedFields__selectEmploymentTypeDetails: string[] = [];

  //Job Details
  selectAllIsChecked__selectJobDetails: boolean = false;
  selectedFields__selectJobDetails: string[] = [];

  //Compensation Details
  selectAllIsChecked__selectCompensationDetails: boolean = false;
  selectedFields__selectCompensationDetails: string[] = [];


  selectAll(f: any, newData: any[], type: string) {
    console.log(f);
    this.selecteditem = newData;

    if (type === 'select') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__select = currentCheckboxState; // Update the "Select All" checkbox state
      this.selectedFields__select = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__select.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__select = [];
      }
    } else if (type === 'selectAddress') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectAddress = currentCheckboxState;
      this.selectedFields__selectAddress = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectAddress.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectAddress = [];
      }
    } else if (type === 'selectAddress2') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectAddress2 = currentCheckboxState;
      this.selectedFields__selectAddress2 = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectAddress2.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectAddress2 = [];
      }
    } else if (type === 'selectContact') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectContact = currentCheckboxState;
      this.selectedFields__selectContact = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectContact.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectContact = [];
      }
    } else if (type === 'selectContact1') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectContact1 = currentCheckboxState;
      this.selectedFields__selectContact1 = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectContact1.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectContact1 = [];
      }
    } else if (type === 'selectContact2') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectContact2 = currentCheckboxState;
      this.selectedFields__selectContact2 = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectContact2.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectContact2 = [];
      }
    } else if (type === 'selectEducation') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectEducationDetails = currentCheckboxState;
      this.selectedFields__selectEducationDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectEducationDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectEducationDetails = [];
      }
    } else if (type === 'selectVisa') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectVisaDetails = currentCheckboxState;
      this.selectedFields__selectVisaDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectVisaDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectVisaDetails = [];
      }
    } else if (type === 'selectIdentity') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectIdentityDetails = currentCheckboxState;
      this.selectedFields__selectIdentityDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectIdentityDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectIdentityDetails = [];
      }
    } else if (type === 'selectBank') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectBankDetails = currentCheckboxState;
      this.selectedFields__selectBankDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectBankDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectBankDetails = [];
      }
    } else if (type === 'selectPreOnboarding') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectPreOnboardingDetails =
        currentCheckboxState;
      this.selectedFields__selectPreOnboardingDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectPreOnboardingDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectPreOnboardingDetails = [];
      }
    } else if (type === 'selectOnboarding') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectOnboarding = currentCheckboxState;
      this.selectedFields__selectOnboarding = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectOnboarding.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectOnboarding = [];
      }
    } else if (type === 'selectOffboarding') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectOffboarding = currentCheckboxState;
      this.selectedFields__selectOffboarding = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectOffboarding.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectOffboarding = [];
      }
    } else if (type === 'selectEmploymentType') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectEmploymentTypeDetails =
        currentCheckboxState;
      this.selectedFields__selectEmploymentTypeDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectEmploymentTypeDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectEmploymentTypeDetails = [];
      }
    } else if (type === 'selectJob') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectJobDetails = currentCheckboxState;
      this.selectedFields__selectJobDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectJobDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectJobDetails = [];
      }
    } else if (type === 'selectCompensation') {
      const currentCheckboxState = f.target.checked;
      this.selectAllIsChecked__selectCompensationDetails = currentCheckboxState;
      this.selectedFields__selectCompensationDetails = [];
      if (newData && currentCheckboxState) {
        // Add all newData items to selectedFields
        this.selectedFields__selectCompensationDetails.push(...newData);
      } else {
        // Clear selectedFields if "Select All" is deselected
        this.selectedFields__selectCompensationDetails = [];
      }
    }
  }

  //togglefield to store the fields into a variable

  toggleField(field: any, type: string) {
    // Logic for toggling individual checkboxes

    // Update the "Select All" checkbox state based on the number of selectedFields
    if (type == 'select') {
      const index = this.selectedFields__select.indexOf(field);
      if (index === -1) {
        this.selectedFields__select.push(field); // Add to selectedFields__select if not already included
      } else {
        this.selectedFields__select.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__select =
        this.selectedFields__select.length === this.fieldOptions.length;
    } else if (type == 'selectAddress') {
      const index = this.selectedFields__selectAddress.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectAddress.push(field); // Add to selectedFields__selectAddress if not already included
      } else {
        this.selectedFields__selectAddress.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectAddress =
        this.selectedFields__selectAddress.length ===
        this.CurrentAddress.length;
    } else if (type == 'selectAddress2') {
      const index = this.selectedFields__selectAddress2.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectAddress2.push(field); // Add to  selectedFields__selectAddress2 if not already included
      } else {
        this.selectedFields__selectAddress2.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectAddress2 =
        this.selectedFields__selectAddress2.length ===
        this.PermanentAddress.length;
    } else if (type == 'selectContact') {
      const index = this.selectedFields__selectContact.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectContact.push(field); // Add to selectedFields__selectContact if not already included
      } else {
        this.selectedFields__selectContact.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectContact =
        this.selectedFields__selectContact.length ===
        this.contactDetailsOptions.length;
    } else if (type == 'selectContact1') {
      const index = this.selectedFields__selectContact1.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectContact1.push(field); // Add to selectedFields__selectContact1 if not already included
      } else {
        this.selectedFields__selectContact1.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectContact1 =
        this.selectedFields__selectContact1.length ===
        this.EmergencyDetailsContact1.length;
    } else if (type == 'selectContact2') {
      const index = this.selectedFields__selectContact2.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectContact2.push(field); // Add to selectedFields__selectContact2 if not already included
      } else {
        this.selectedFields__selectContact2.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectContact2 =
        this.selectedFields__selectContact2.length ===
        this.EmergencyDetailsContact2.length;
    } else if (type == 'selectEducation') {
      const index = this.selectedFields__selectEducationDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectEducationDetails.push(field); // Add to selectedFields__selectEducationDetails if not already included
      } else {
        this.selectedFields__selectEducationDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectEducationDetails =
        this.selectedFields__selectEducationDetails.length ===
        this.educationDetails.length;
    } else if (type == 'selectVisa') {
      const index = this.selectedFields__selectVisaDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectVisaDetails.push(field); // Add to selectedFields__selectVisaDetails if not already included
      } else {
        this.selectedFields__selectVisaDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectVisaDetails =
        this.selectedFields__selectVisaDetails.length ===
        this.visaDetails.length;
    } else if (type == 'selectIdentity') {
      const index = this.selectedFields__selectIdentityDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectIdentityDetails.push(field); // Add to selectedFields__selectIdentityDetails if not already included
      } else {
        this.selectedFields__selectIdentityDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectIdentityDetails =
        this.selectedFields__selectIdentityDetails.length ===
        this.identityDetails.length;
    } else if (type == 'selectBank') {
      const index = this.selectedFields__selectBankDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectBankDetails.push(field); // Add to selectedFields__selectBankDetails if not already included
      } else {
        this.selectedFields__selectBankDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectBankDetails =
        this.selectedFields__selectBankDetails.length ===
        this.bankDetails.length;
    } else if (type == 'selectPreOnboarding') {
      const index =
        this.selectedFields__selectPreOnboardingDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectPreOnboardingDetails.push(field); // Add to selectedFields__selectPreOnboardingDetails if not already included
      } else {
        this.selectedFields__selectPreOnboardingDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectPreOnboardingDetails =
        this.selectedFields__selectPreOnboardingDetails.length ===
        this.preOnboardingDetails.length;
    } else if (type == 'selectOnboarding') {
      const index = this.selectedFields__selectOnboarding.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectOnboarding.push(field); // Add to selectedFields__selectContact2 if not already included
      } else {
        this.selectedFields__selectOnboarding.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectOnboarding =
        this.selectedFields__selectOnboarding.length ===
        this.OnBoardingDetails.length;
    } else if (type == 'selectOffboarding') {
      const index = this.selectedFields__selectOffboarding.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectOffboarding.push(field); // Add to selectedFields__selectContact2 if not already included
      } else {
        this.selectedFields__selectOffboarding.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectOffboarding =
        this.selectedFields__selectOffboarding.length ===
        this.offBoardingDetails.length;
    } else if (type == 'selectEmploymentType') {
      const index =
        this.selectedFields__selectEmploymentTypeDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectEmploymentTypeDetails.push(field); // Add to selectedFields__selectEmploymentTypeDetails if not already included
      } else {
        this.selectedFields__selectEmploymentTypeDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectEmploymentTypeDetails =
        this.selectedFields__selectEmploymentTypeDetails.length ===
        this.EmploymentTypeDetails.length;
    } else if (type == 'selectJob') {
      const index = this.selectedFields__selectJobDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectJobDetails.push(field); // Add to selectedFields__selectJobDetails if not already included
      } else {
        this.selectedFields__selectJobDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectJobDetails =
        this.selectedFields__selectJobDetails.length === this.jobDetails.length;
    } else if (type == 'selectCompensation') {
      const index =
        this.selectedFields__selectCompensationDetails.indexOf(field);
      if (index === -1) {
        this.selectedFields__selectCompensationDetails.push(field); // Add to selectedFields__selectCompensationDetails if not already included
      } else {
        this.selectedFields__selectCompensationDetails.splice(index, 1); // Remove from selectedFields if already included
      }
      this.selectAllIsChecked__selectCompensationDetails =
        this.selectedFields__selectCompensationDetails.length ===
        this.compensationDetails.length;
    }
  }
}


