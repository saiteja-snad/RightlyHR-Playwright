import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OpenModalService } from '../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import * as XLSX from 'xlsx';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Ipersonal } from './custom-model';

@Component({
  selector: 'app-custom-reports',
  imports: [SelectModule, ReactiveFormsModule, CommonModule, FormsModule,],
  templateUrl: './custom-reports.component.html',
  styleUrl: './custom-reports.component.scss'
})
export class CustomReportsComponent {
  empStatusList: string[] = ['All Employees', 'Active', 'Inactive'];
  showCard: boolean = false;
  JobShowCard: boolean = false;
  loggedInUser = {} as any;
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
  reportForm!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal
  ) { }
  ngOnInit(): void {
    this.initializeForm();
    this.getCustomReportDetails();
    this.loggedInUser = this.authService.getToken();
    // this.getFamilyDetails();
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      status: ['All Employees', Validators.required],
    });
  }

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
  selectedFields = [] as any;
  emp = [] as Ipersonal[]; 
  onSubmit(form: FormGroup) {
    
      this.selectedData = [];
      this.emp.forEach((user: Ipersonal) => {
        const data: { [key: string]: any } = {};
        this.selectedFields = [
          ...this.selectedFields__select,
          ...this.selectedFields__selectAddress,
          ...this.selectedFields__selectAddress2,
          ...this.selectedFields__selectContact,
          ...this.selectedFields__selectContact1,
          ...this.selectedFields__selectContact2,
          ...this.selectedFields__selectEducationDetails,
          ...this.selectedFields__selectVisaDetails,
          ...this.selectedFields__selectIdentityDetails,
          ...this.selectedFields__selectBankDetails,
          ...this.selectedFields__selectPreOnboardingDetails,
          ...this.selectedFields__selectOnboarding,
          ...this.selectedFields__selectOffboarding,
          ...this.selectedFields__selectEmploymentTypeDetails,
          ...this.selectedFields__selectJobDetails,
          ...this.selectedFields__selectCompensationDetails,
        ];
        console.log(this.selectedFields);
        this.selectedFields.forEach((field: any) => {
          //Basic
          if (field === 'ID') {
            data[field] = user.employeeId;
          } else if (field === 'Employee ID') {
            data[field] = user.fusionEmpId;
          } else if (field === 'Salutation') {
            data[field] = user.title;
          } else if (field === 'First Name') {
            data[field] = user.firstName;
          } else if (field === 'Last Name') {
            data[field] = user.lastName;
          } else if (field === 'Middle Name') {
            data[field] = user.middleName;
          } else if (field === 'Status') {
            data[field] = user.empstatus;
          } else if (field === 'Marital Status') {
            data[field] = user.maritalStatus;
          } else if (field === 'Gender') {
            data[field] = user.gender;
          } else if (field === 'Date of Birth') {
            data[field] = this.formatDate(user.dob);
          } else if (field === 'Blood Group') {
            data[field] = user.bloodGroup;
          } else if (field === 'Secondary Language') {
            data[field] = user.secondaryLanguage;
          }
          // else if (field === 'Contact Number') {
          //   data[field] = user.contactnumber;
          // }
          //current Address
          else if (field === 'Address Line 1(current)') {
            data[field] = user.currentAddressLine1;
          } else if (field === 'Address Line 2(current)') {
            data[field] = user.currentAddressLine2;
          } else if (field === 'City(current)') {
            data[field] = user.currentCity;
          } else if (field === 'State(current)') {
            data[field] = user.currentState;
          } else if (field === 'Country(current)') {
            data[field] = user.currentCountry;
          } else if (field === 'Zip Code/Post Code(current)') {
            data[field] = user.currentZipCode;
          }
          //permanent address
          else if (field === 'Address Line 1(permanemt)') {
            data[field] = user.permanentAddressLine1;
          } else if (field === 'Address Line 2(permanemt)') {
            data[field] = user.permanentAddressLine2;
          } else if (field === 'City(permanemt)') {
            data[field] = user.permanentCity;
          } else if (field === 'State(permanemt)') {
            data[field] = user.permanentState;
          } else if (field === 'Country(permanemt)') {
            data[field] = user.permanentCountry;
          } else if (field === 'Zip Code/Post Code(permanemt)') {
            data[field] = user.permanentZipCode;
          }
          //Contact
          else if (field === 'Work Number') {
            data[field] = user.workPhone;
          } else if (field === 'Mobile Phone') {
            data[field] = user.contactnumber;
          } else if (field === 'Work Mail-Id') {
            data[field] = user.workEmail;
          } else if (field === 'Home Mail-Id') {
            data[field] = user.emailaddress;
          }
          //Emergency Contact 1
          else if (field === 'Name(contact1)') {
            data[field] = user.emergencyName;
          } else if (field === 'Email-Id(contact1)') {
            data[field] = user.emailId;
          } else if (field === 'Email-Id(contact2)') {
            data[field] = user.emergencyEmail1;
          } else if (field === 'Phone Number(contact1)') {
            data[field] = user.emergencynumber;
          }
          //Emergency Contact 2
          else if (field === 'Name(contact2)') {
            data[field] = user.emergencyName1;
          } else if (field === 'Phone Number(contact2)') {
            data[field] = user.emergencyNumber1;
          } else if (field === 'Relationship(contact1)') {
            data[field] = user.relationShip;
          } else if (field === 'Relationship(contact2)') {
            data[field] = user.relationship1;
          }
          //Education
          else if (field === 'Degree') {
            data[field] = user.degree;
          } else if (field === 'Relationship(contact2)') {
            data[field] = user.relationship1;
          } else if (field === 'University') {
            data[field] = user.university;
          } else if (field === 'Specialization') {
            data[field] = user.specialization;
          } else if (field === 'GPA') {
            data[field] = user.gpa;
          } else if (field === 'Degree Start Date') {
            data[field] = this.formatDate(user.degreeStartDate);
          } else if (field === 'Degree End Date') {
            data[field] = this.formatDate(user.degreeEndDate);
          }
          //visa Details
          else if (field === 'Visa Type') {
            data[field] = user.visatype;
          } else if (field === 'Issued Country') {
            data[field] = user.issuedcountry;
          } else if (field === 'Issued Date') {
            data[field] = this.formatDate(user.issueddate);
          } else if (field === 'Expiry Date') {
            data[field] = this.formatDate(user.expirydate);
          }
          //identity
          else if (field === 'Aadhaar Number') {
            data[field] = user.aadhaar;
          } else if (field === 'PAN Number') {
            data[field] = user.pan;
          } else if (field === 'PF Number') {
            data[field] = user.esic;
          } else if (field === 'ESIC Number') {
            data[field] = user.pf;
          } else if (field === 'UAN Number') {
            data[field] = user.uan;
          }
          //Bank
          else if (field === 'Bank Name') {
            data[field] = user.bankName;
          } else if (field === 'Account Holders Name') {
            data[field] = user.accountName;
          } else if (field === 'Account Number') {
            data[field] = user.accountNo;
          } else if (field === 'IFSC Code') {
            data[field] = user.ifscCode;
          }
          //preOnboarding
          else if (field === 'Offer Sent Date') {
            data[field] = this.formatDate(user.offerSentDate);
          } else if (field === 'Offer Sent By') {
            data[field] = user.offerSentBy;
          } else if (field === 'Offer Sent Status') {
            data[field] = user.offerSentStatus;
          } else if (field === 'Appointment Sent Date') {
            data[field] = this.formatDate(user.appointmentSentDate);
          } else if (field === 'Appointment Sent By') {
            data[field] = user.appointmentSenyBy;
          } else if (field === 'Appointment Sent Status') {
            data[field] = user.appointmentSentStatus;
          }
          //Onboarding
          else if (field === 'Date Of Joining') {
            data[field] = this.formatDate(user.dateOfJoining);
          } else if (field === 'Probation End Date') {
            data[field] = this.formatDate(user.probationEndDate);
          } else if (field === 'Probation Status') {
            data[field] = user.probationStatus;
          } else if (field === 'Branch Code') {
            data[field] = user.branchCode;
          } else if (field === 'Notice Period') {
            data[field] = user.noticePeriod;
          } else if (field === 'Background Check Status') {
            data[field] = user.backgroundCheckStatus;
          } else if (field === 'Salary Hold') {
            data[field] = user.salaryHold;
          } else if (field === 'PT') {
            data[field] = user.pt;
          } else if (field === 'PF') {
            data[field] = user.pfApplicable;
          } else if (field === 'ESIC') {
            data[field] = user.esicApplicable;
          } else if (field === 'Insurance') {
            data[field] = user.healthInsurance;
          }
          //Offboarding
          else if (field === 'Last Working Day') {
            data[field] = this.formatDate(user.lastworkingday);
          } else if (field === 'Exit Reason') {
            data[field] = user.termreasonoffboard;
          } else if (field === 'Eligible For Rehire') {
            data[field] = user.eligibleforrehire;
          }
          //Employment
          else if (field === 'Job Type') {
            data[field] = user.jobType;
          } else if (field === 'Grade Name') {
            data[field] = user.gradeName;
          }
          //jobDetails
          else if (field === 'Job Effective Date') {
            data[field] = this.formatDate(user.jobEffectiveDate);
          } else if (field === 'Job Role') {
            data[field] = user.jobRole;
          } else if (field === 'Grade Name') {
            data[field] = user.gradeName;
          } else if (field === 'Department') {
            data[field] = user.departmentName;
          } else if (field === 'Team') {
            data[field] = user.subdepartment_name;
          } else if (field === 'Team Manager') {
            data[field] = user.teamManager;
          } else if (field === 'Reporting Manager') {
            data[field] = user.reportingManager;
          } else if (field === 'Location') {
            data[field] = user.jobLocationName;
          } else if (field === 'Sub Location') {
            data[field] = user.jobSubLocationName;
          } else if (field === 'Shift') {
            data[field] = user.shiftName;
          } else if (field === 'Shift Code') {
            data[field] = user.shiftCode;
          } else if (field === 'Job Type') {
            data[field] = user.jobType;
          }
          //compensation
          else if (field === 'Compensation Effective Date') {
            data[field] = this.formatDate(user.compeffectivedate);
          } else if (field === 'Overtime Eligibility') {
            data[field] = user.overtimeeligibility;
          } else if (field === 'Reason') {
            data[field] = user.reason;
          } else if (field === 'Pay Type') {
            data[field] = user.paytype;
          } else if (field === 'Yearly CTC') {
            data[field] = user.compensationamount;
          } else if (field === 'Frequency') {
            data[field] = user.frequency;
            // }else if (field === 'Yearly CTC') {
            //   data[field] = user.compensationamount;
          }
        });
        this.selectedData.push(data);
        console.log(this.selectedData);
        //this.exportButtonEnabled = false;
      });
    
  }

  private formatDate(dateString: string): string {
    if (dateString) {
      if (dateString != '') {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
      }
    }
    return dateString;
  }

  reportdata !: [];
  getCustomReportDetails() {
    this.http
      .getData('Employeedata/Reports/EmployeeData')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.reportdata = data;
        },
        error: (err: any) => {

        },
      });
  }

  selectedData: any[] = [];
  generateExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.selectedData);
    this.convertHeadersToUpperCase(ws);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout: ArrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(wbout);
    window.location.reload();
  }

  private convertHeadersToUpperCase(ws: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      let cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.v = cell.v.toString().toUpperCase(); // Convert to uppercase
        cell.w = cell.v; // Ensure display is updated
      }
    }
  }

  reportfile = {} as any;
  saveAsExcelFile(buffer: ArrayBuffer): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = `${this.loggedInUser.employeeId
      }_${new Date().getTime()}_custom_reports.xlsx`;
    link.click();
    //creating form file to upload into AZure
    this.reportfile = new File(
      [data],
      `${this.loggedInUser.employeeId
      }_${new Date().getTime()}__custom_reports.xlsx`,
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );
    // this.createReportLog();
    // this.uploadReports();
  }
}


