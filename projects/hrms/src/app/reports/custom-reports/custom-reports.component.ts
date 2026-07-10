import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import * as XLSX from 'xlsx-js-style';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Ipersonal, IStatus } from './custom-model';
import { CalendarModule } from 'primeng/calendar';
import { environment } from '../../../environments/environment';
import dayjs from 'dayjs';
import { AccordionModule } from 'primeng/accordion';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';
import { Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportsHeaderComponent } from "../../shared/reports-tabs/reports-header/reports-header.component";
import { ReportsPlaceholderIconComponent } from "../../icons/reports-placeholder-icon/reports-placeholder-icon.component";
import { style } from '@angular/animations';
import { Table, TableModule } from 'primeng/table';
interface FieldGroup {
  name: string;
  fields: string[];
  selectedFields: string[];
  selectAll: boolean;
}
@Component({
  selector: 'app-custom-reports',
  imports: [SelectModule, MultiSelectModule, ReactiveFormsModule, CommonModule, FormsModule, CalendarModule,
    DatePicker, AccordionModule, NoDataFoundComponent, DataLoaderContentComponent, NgbPopoverModule,
    ReportsHeaderComponent, ReportsPlaceholderIconComponent, TableModule],
  templateUrl: './custom-reports.component.html',
  styleUrl: './custom-reports.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class CustomReportsComponent implements OnInit, OnDestroy {
  reportForm!: FormGroup;
  private destroy$ = new Subject<boolean>();
  activeRangeDates: Date[] | undefined;
  inActiveRangeDates: Date[] | undefined;
  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };
  activeIndex: any;
  ranges: any = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };
  // Form control flags
  showCard = false;
  JobShowCard = false;
  loggedInUser: any = {};
  // Data arrays
  empStatusList = [
    { label: 'All Employees', value: 'All Employees' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Prospective', value: 'Prospective' }
  ];
  selectedData: any[] = [];
  originalSelectedData: any[] = [];
  currentSortField = '';
  currentSortOrder = 0;
  @ViewChild('customReportsTable') customReportsTable!: Table;
  selectedFields: string[] = [
    // 'ID',
    'Employee ID',
    'Salutation',
    'First Name',
    'Middle Name',
    'Last Name',
    'Employee Status'
  ];
  reportFields: string[] = [];
  emp: Ipersonal[] = [];
  reportdata: any[] = [];
  // Define locked fields per group (if needed)
  lockedFields: string[] = [
    // 'ID',
    'Employee ID',
    'Salutation',
    'First Name',
    'Middle Name',
    'Last Name',
    'Employee Status'
  ];
  masterFieldOrder: string[] = [
    'Employee ID',
    'Salutation',
    'First Name',
    'Middle Name',
    'Last Name',
    'Employee Status',
    'Gender',
    'Date of Birth',
    'Blood Group',
    'Marital Status',
    'LinkedIn Url',
    'Work Number',
    'Phone Number',
    'Work Mail',
    'Personal Email',
    'Address Line 1 (Current)',
    'Address Line 2 (Current)',
    'Zip Code/Postal Code (Current)',
    'City (Current)',
    'State (Current)',
    'Country (Current)',
    'Address Line 1 (Permanent)',
    'Address Line 2 (Permanent)',
    'Zip Code/Postal Code (Permanent)',
    'City (Permanent)',
    'State (Permanent)',
    'Country (Permanent)',
    'Name (Primary Contact)',
    'Email (Primary Contact)',
    'Phone Number (Primary Contact)',
    'Relationship (Primary Contact)',
    'Name (Secondary Contact)',
    'Email (Secondary Contact)',
    'Phone Number (Secondary Contact)',
    'Relationship (Secondary Contact)',
    // Identity (current labels used in UI)
    'Aadhaar Number',
    'PAN Number',
    'ESIC Number',
    'PF Number',
    'UAN Number',
    'Bank Name',
    "Account Holder's Name",
    'Account Number',
    'IFSC Code',
    'Qualification',
    'University',
    'Specialization',
    'GPA/CGPA',
    'From Date',
    'To Date',
    'Offer Sent Date',
    'Offer Sent By',
    'Offer Sent Status',
    'Appointment Sent Date',
    'Appointment Sent By',
    'Appointment Sent Status',
    'Trainee Offer Sent Date',
    'Trainee Offer Sent By',
    'Trainee Offer Sent Status',
    'Contract Offer Sent Date',
    'Contract Offer Sent By',
    'Contract Offer Sent Status',
    'Date Of Joining',
    'Branch Code',
    'Probation End Date',
    'Probation Status',
    'Notice Period Status',
    'Background Check Status',
    'Salary Hold',
    'PF',
    'ESIC',
    'PT',
    'Total Previous Years Experience',
    'Employment Type Status',
    'Contract Start Date',
    'Duration of Contract',
    'Contract End Date',
    'Compensation Effective Date',
    'Overtime Eligibility',
    'Reason',
    'Frequency',
    'Pay Type',
    'Annual Salary (in CTC)',
    'Variable Pay',
    'Variable Pay Amount',
    'Next Compensation Review Date',
    'Job Effective Date',
    'Job Role',
    'Job Grade',
    'Department',
    'Team',
    'Team Manager',
    'Reporting Manager',
    'Location',
    'Sub Location',
    'Shift',
    'Shift Code',
    'Job Type',
    'Exit Reason',
    'Eligible For Rehire',
    'Relieving Type',
    'Last Working Day',
    'Contractor Last Working Day'
  ];

  employeeStatus!: string;
  selectedFieldsOption = [] as any;
  Statusdetails = [] as any;
  copyData = [] as Ipersonal[];
  filteredData = [] as Ipersonal[];
  // Field groups
  fieldGroups: { [key: string]: FieldGroup } = {
    basicInfo: {
      name: 'Basic Information',
      fields: [
        // 'ID',
        'Employee ID',
        'Salutation',
        'First Name',
        'Middle Name',
        'Last Name',
        'Employee Status',
        'Gender',
        'Date of Birth',
        'Blood Group',
        'Marital Status',
      ],
      selectedFields: [
        // 'ID',
        'Employee ID',
        'Salutation',
        'First Name',
        'Middle Name',
        'Last Name',
        'Employee Status'
      ],
      selectAll: false,
    },
    currentAddress: {
      name: 'Current Address',
      fields: [
        'Address Line 1 (Current)',
        'Address Line 2 (Current)',
        'City (Current)',
        'State (Current)',
        'Country (Current)',
        'Zip Code/Postal Code (Current)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    permanentAddress: {
      name: 'Permanent Address',
      fields: [
        'Address Line 1 (Permanent)',
        'Address Line 2 (Permanent)',
        'City (Permanent)',
        'State (Permanent)',
        'Country (Permanent)',
        'Zip Code/Postal Code (Permanent)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    contactDetails: {
      name: 'Contact Details',
      fields: ['Work Number', 'Phone Number', 'Work Mail', 'Personal Email','LinkedIn Url'],
      selectedFields: [],
      selectAll: false,
    },
    emergencyContact1: {
      name: 'Emergency Contact 1',
      fields: [
        'Name (Primary Contact)',
        'Email (Primary Contact)',
        'Phone Number (Primary Contact)',
        'Relationship (Primary Contact)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    emergencyContact2: {
      name: 'Emergency Contact 2',
      fields: [
        'Name (Secondary Contact)',
        'Email (Secondary Contact)',
        'Phone Number (Secondary Contact)',
        'Relationship (Secondary Contact)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    educationDetails: {
      name: 'Education Details',
      fields: [
        'Qualification',
        'University',
        'Specialization',
        'GPA/CGPA',
        'From Date',
        'To Date',
      ],
      selectedFields: [],
      selectAll: false,
    },
    // visaDetails: {
    //   name: 'Visa Details',
    //   fields: ['Visa Type', 'Issued Country', 'Issued Date', 'Expiry Date'],
    //   selectedFields: [],
    //   selectAll: false,
    // },
    identityDetails: {
      name: 'Identity Details',
      fields: [
        'Aadhaar Number',
        'PAN Number',
        'ESIC Number',
        'PF Number',
        'UAN Number',
      ],
      selectedFields: [],
      selectAll: false,
    },
    bankDetails: {
      name: 'Bank Details',
      fields: [
        'Bank Name',
        'Account Holder\'s Name',
        'Account Number',
        'IFSC Code',
        // 'Primary Bank'
      ],
      selectedFields: [],
      selectAll: false,
    },
    preOnboardingDetails: {
      name: 'Pre Onboarding Details',
      fields: [
        'Offer Sent Date',
        'Offer Sent By',
        'Offer Sent Status',
        'Appointment Sent Date',
        'Appointment Sent By',
        'Appointment Sent Status',
        'Trainee Offer Sent Date',
        'Trainee Offer Sent By',
        'Trainee Offer Sent Status',
        'Contract Offer Sent Date',
        'Contract Offer Sent By',
        'Contract Offer Sent Status',
      ],
      selectedFields: [],
      selectAll: false,
    },
    onboardingDetails: {
      name: 'Onboarding Details',
      fields: [
        'Date Of Joining',
        'Probation End Date',
        'Probation Status',
        'Branch Code',
        'Notice Period Status',
        'Background Check Status',
        'Salary Hold',
        'PT',
        'ESIC',
        'PF',
        // 'Insurance',
        'Total Previous Years Experience',
        'Employment Type Status',
        'Contract Start Date',
        'Duration of Contract',
        'Contract End Date',
      ],
      selectedFields: [],
      selectAll: false,
    },
    offboardingDetails: {
      name: 'Offboarding Details',
      fields: ['Last Working Day', 'Eligible For Rehire', 'Exit Reason','Relieving Type','Contractor Last Working Day'],
      selectedFields: [],
      selectAll: false,
    },
    jobDetails: {
      name: 'Job Details',
      fields: [
        'Job Effective Date',
        'Job Role',
        'Job Grade',
        'Department',
        'Team',
        'Team Manager',
        'Reporting Manager',
        'Location',
        'Sub Location',
        'Shift',
        'Shift Code',
        'Job Type',
      ],
      selectedFields: [],
      selectAll: false,
    },
    compensationDetails: {
      name: 'Compensation Details',
      fields: [
        'Compensation Effective Date',
        'Overtime Eligibility',
        'Reason',
        'Frequency',
        'Pay Type',
        'Annual Salary (in CTC)',
        'Variable Pay',
        'Variable Pay Amount',
        'Next Compensation Review Date',
      ],
      selectedFields: [],
      selectAll: false,
    },
  };
  hasPendingChanges = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  dataload = false;

  // Status Mapping
  statusMapping: { [key: string]: string[] } = {
    // Broad Categories
    "active": ["Active", "Active Employees", "Active Contract", "Active Contract Employees", "Active Trainees", "Trainee Active", "Probation", "Probation Employees", "Probation Employee"],
    "inactive": ["Inactive", "Inactive Employees", "Inactive Contract", "Inactive Contract Employees", "Inactive Trainees", "Trainee Inactive"],
    "prospective": ["Prospective", "Prospective Employees", "Prospective Contract", "Prospective Contract Employees", "Prospective Trainees", "Trainee Prospective"],
    // Specific Categories
    "active contract": ["Active Contract", "Active Contract Employees"],
    "inactive contract": ["Inactive Contract", "Inactive Contract Employees"],
    "prospective contract": ["Prospective Contract", "Prospective Contract Employees"],
    "probation employee": ["Probation Employee", "Probation Employees"],
    "trainee active": ["Trainee Active", "Active Trainees"],
    "trainee inactive": ["Trainee Inactive", "Inactive Trainees"],
    "trainee prospective": ["Trainee Prospective", "Prospective Trainees"]
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private http: HttpService,public rbac: RbacService, public readonly router: Router) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.activeIndex = '0';
    this.inititalizeForm();
    this.getCustomReportDetails();
    this.getStatus();
    this.showPersonalData();
    this.handleEmployeeStatusChanges();
  }

  handleEmployeeStatusChanges(): void {
    const statusControl = this.reportForm.get('status');
    statusControl?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((selected: any) => {
      if (Array.isArray(selected)) {
        const normalized = selected[0] ?? 'All Employees';
        setTimeout(() => statusControl.setValue(normalized, { emitEvent: false }));
      }
    });
  }

  inititalizeForm() {
    this.reportForm = this.fb.group({
      status: ['All Employees'],
      dateOfJoining: [null],
    });
    this.reportForm.get('status')?.valueChanges.subscribe(() => {
      this.reportForm.get('dateOfJoining')?.reset();
    });
    this.reportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  showPersonalData() {
    this.showCard = true;
    this.JobShowCard = false;
  }

  isFieldLocked(field: string): boolean {
    return this.lockedFields.includes(field);
  }

  showJobData() {
    this.showCard = false;
    this.JobShowCard = true;
    const defaultFields = ['Employee ID', 'First Name', 'Middle Name', 'Last Name'];
    
    if (this.fieldGroups['basicInfo']) {
      // Add default fields to basicInfo if they are not already selected
      defaultFields.forEach(field => {
        if (!this.fieldGroups['basicInfo'].selectedFields.includes(field)) {
          this.fieldGroups['basicInfo'].selectedFields.push(field);
        }
      });
    }
    this.updateSelectedFields();
  }

  getCustomReportDetails(): void {
    this.dataload = true;
    this.http.getData('Employeedata/Reports/EmployeeData').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.emp = data;
        this.copyData = JSON.parse(JSON.stringify(this.emp));
        this.filteredData = JSON.parse(JSON.stringify(this.emp));
      },
      error: (err: any) => {
        console.error('Error fetching report data:', err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  dateofJoiningRangeFilter(value: any) {
    if (value && value.length === 2) {
      const [startDate, endDate] = value;
      this.emp = this.filteredData.filter((emp) => {
        const doj = new Date(emp.dateOfJoining);
        return doj >= startDate && doj <= endDate;
      });
    }
  }

  lastWorkingDayRangeFilter(value: any) {
    if (value) {
      this.emp = this.filteredData.filter(
        (emp) => new Date(emp.lastworkingday) >= value && new Date(emp.lastworkingday) <= value
      );
    }
  }

  toggleFieldSelection(field: string, groupKey: string): void {
    const group = this.fieldGroups[groupKey];
    const index = group.selectedFields.indexOf(field);
    if (index === -1) {
      group.selectedFields.push(field);
    } else {
      group.selectedFields.splice(index, 1);
    }
    // Update selectAll status
    group.selectAll = group.selectedFields.length === group.fields.length;
    this.updateSelectedFields();
    this.hasPendingChanges = true;
  }

  toggleSelectAll(event: Event, groupKey: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const group = this.fieldGroups[groupKey];
    group.selectAll = isChecked;
    if (isChecked) {
      // Include all fields (including locked)
      group.selectedFields = [...group.fields];
    } else {
      // Deselect all EXCEPT locked fields
      group.selectedFields = group.fields.filter((field) =>
        this.isFieldLocked(field)
      );
    }
    this.updateSelectedFields();
    this.hasPendingChanges = true;
  }

  private updateSelectedFields(): void {
    const allSelectedFields = Object.values(this.fieldGroups).reduce(
      (acc: string[], group) => [...acc, ...group.selectedFields], []
    );
    const deduped = Array.from(new Set(allSelectedFields));
    const orderProbe = deduped.map(f => ({ field: f, masterIndex: this.masterFieldOrder.indexOf(f) }));
    const originalIndex: { [key: string]: number } = {};
    deduped.forEach((f, i) => { if (originalIndex[f] === undefined) originalIndex[f] = i; });
    this.selectedFields = deduped.sort((a, b) => {
      const ia = this.masterFieldOrder.indexOf(a);
      const ib = this.masterFieldOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return originalIndex[a] - originalIndex[b];
    });
    const unknowns = this.selectedFields.filter(f => this.masterFieldOrder.indexOf(f) === -1);
    if (unknowns.length) console.warn('FieldsNotInMasterOrder', unknowns);
    if (this.selectedFields.length == 0) {
      this.selectedData = [];
      this.originalSelectedData = [];
      this.currentSortField = '';
      this.currentSortOrder = 0;
      this.customReportsTable?.reset();
    }
  }

  private updateReportFields(): void {
    const aggregated = Object.values(this.fieldGroups).reduce(
      (acc: string[], group) => [...acc, ...group.selectedFields], []
    );
    const deduped = Array.from(new Set(aggregated));
    const originalIndex: { [key: string]: number } = {};
    deduped.forEach((f, i) => { if (originalIndex[f] === undefined) originalIndex[f] = i; });
    this.reportFields = deduped.sort((a, b) => {
      const ia = this.masterFieldOrder.indexOf(a);
      const ib = this.masterFieldOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return originalIndex[a] - originalIndex[b];
    });
    if (this.reportFields.length == 0) this.reportFields = [];
  }

  onSubmit(): void {
    this.spinnerLoader1 = true;
    if (this.reportForm.invalid) {
      this.spinnerLoader1 = false;
      return
    };
    setTimeout(() => {
      try {
        this.selectedData = [];
        this.activeIndex = '1';
        const formData = this.reportForm.value;
        this.updateReportFields();
        this.hasPendingChanges = false;

        const rawStatus = formData.status;
        const statusArray = Array.isArray(rawStatus) ? rawStatus : (rawStatus ? [rawStatus] : []);
        const empStatus = statusArray.join(',').toLowerCase();

        const startDate = formData.dateOfJoining?.length > 0
          ? new Date(formData.dateOfJoining[0])
          : null;
        const endDate = formData.dateOfJoining?.length > 1
          ? new Date(formData.dateOfJoining[1])
          : null;

        const filteredEmployees = this.emp.filter((user: Ipersonal) => {
          if (!empStatus.includes('all employees')) {
            const statusParts = empStatus.split(',').map((s: string) => s.trim());
            let matchFound = false;
            for (const statusPart of statusParts) {
              const allowedStatuses = this.statusMapping[statusPart];
              if (allowedStatuses && user.empstatus && allowedStatuses.some(s => s.toLowerCase() === user.empstatus.toLowerCase())) {
                matchFound = true;
                break;
              }
            }
            if (!matchFound) return false;
          }

          if (startDate || endDate) {
            let dateToCheck: Date | null = null;
            if (empStatus.includes('active')) {
              if (user.dateOfJoining) {
                dateToCheck = new Date(user.dateOfJoining);
              }
            }

            if (empStatus.includes('inactive')) {
              if (user.lastworkingday) {
                dateToCheck = new Date(user.lastworkingday);
              }
            }

            if (!dateToCheck || isNaN(dateToCheck.getTime())) {
              return false;
            }

            if ((startDate && dateToCheck < startDate) || (endDate && dateToCheck > endDate)) {
              return false;
            }
          }
          return true;
        });

        filteredEmployees.forEach((user: Ipersonal) => {
          const data: { [key: string]: any } = {};
          this.selectedFields.forEach((field: string) => {
        // Basic Info
        if (field === 'Employee ID') data[field] = user.fusionEmpId;
        else if (field === 'Employee ID') data[field] = user.fusionEmpId;
        else if (field === 'Salutation') data[field] = user.title;
        else if (field === 'First Name') data[field] = user.firstName;
        else if (field === 'Last Name') data[field] = user.lastName;
        else if (field === 'Middle Name') data[field] = user.middleName;
        else if (field === 'Employee Status') data[field] = user.empstatus;
        else if (field === 'Marital Status') data[field] = user.maritalStatus;
        else if (field === 'Gender') data[field] = user.gender;
        else if (field === 'Date of Birth')
          data[field] = this.formatDate(user.dob);
        else if (field === 'Blood Group') data[field] = user.bloodGroup;
        // else if (field === 'Secondary Language') data[field] = user.secondaryLanguage;
        // Current Address
        else if (field === 'Address Line 1 (Current)')
          data[field] = user.currentaddressline1;
        else if (field === 'Address Line 2 (Current)')
          data[field] = user.currentaddressline2;
        else if (field === 'City (Current)') data[field] = user.currentcity;
        else if (field === 'State (Current)') data[field] = user.currentcity;
        else if (field === 'Country (Current)')
          data[field] = user.currentcountry;
        else if (field === 'Zip Code/Postal Code (Current)')
          data[field] = user.currentzipcode;
        // Permanent Address
        else if (field === 'Address Line 1 (Permanent)')
          data[field] = user.permanentaddressline1;
        else if (field === 'Address Line 2 (Permanent)')
          data[field] = user.permanentaddressline2;
        else if (field === 'City (Permanent)') data[field] = user.permanentcity;
        else if (field === 'State (Permanent)')
          data[field] = user.permanentstate;
        else if (field === 'Country (Permanent)')
          data[field] = user.permanentcountry;
        else if (field === 'Zip Code/Postal Code (Permanent)')  
          data[field] = user.permanentzipcode;
        // Contact Details
        else if (field === 'Work Number') data[field] = user.workPhone;
        else if (field === 'Phone Number') data[field] = user.contactnumber;
        else if (field === 'Work Mail') data[field] = user.workEmail;
        else if (field === 'Personal Email') data[field] = user.emailaddress;
        else if (field === 'LinkedIn Url') data[field] = user.linkedinurl;
        // Emergency Contact 1
        else if (field === 'Name (Primary Contact)') data[field] = user.emergencyName;
        else if (field === 'Email (Primary Contact)') data[field] = user.emailId;
        else if (field === 'Phone Number (Primary Contact)')
          data[field] = user.emergencynumber;
        else if (field === 'Relationship (Primary Contact)')
          data[field] = user.relationShip;
        // Emergency Contact 2
        else if (field === 'Name (Secondary Contact)') data[field] = user.emergencyName1;
        else if (field === 'Email (Secondary Contact)')
          data[field] = user.emergencyEmail1;
        else if (field === 'Phone Number (Secondary Contact)')
          data[field] = user.emergencyNumber1;
        else if (field === 'Relationship (Secondary Contact)')
          data[field] = user.relationship1;
        // Education
        else if (field === 'Qualification') data[field] = user.degree;
        else if (field === 'University') data[field] = user.university;
        else if (field === 'Specialization') data[field] = user.specialization;
        else if (field === 'GPA/CGPA') data[field] = user.gpa;
        else if (field === 'From Date')
          data[field] = this.formatDate(user.degreeStartDate);
        else if (field === 'To Date')
          data[field] = this.formatDate(user.degreeEndDate);
        // Visa Details
        else if (field === 'Visa Type') data[field] = user.visatype;
        else if (field === 'Issued Country') data[field] = user.issuedcountry;
        else if (field === 'Issued Date')
          data[field] = this.formatDate(user.issueddate);
        else if (field === 'Expiry Date')
          data[field] = this.formatDate(user.expirydate);
        // Identity
        else if (field === 'Aadhaar Number') data[field] = user.aadhaar;
        else if (field === 'PAN Number') data[field] = user.pan;
        else if (field === 'PF Number') data[field] = user.pf;
        else if (field === 'ESIC Number') data[field] = user.esic;
        else if (field === 'UAN Number') data[field] = user.uan;
        // Bank
        else if (field === 'Bank Name') data[field] = user.bankName;
        else if (field === 'Account Holder\'s Name')
          data[field] = user.accountName;
        else if (field === 'Account Number') data[field] = user.accountNo;
        else if (field === 'IFSC Code') data[field] = user.ifscCode;
        // else if (field === 'Primary Bank') data[field] = user.primaryBank;
        // Pre Onboarding
        else if (field === 'Offer Sent Date')
          data[field] = this.formatDate(user.offerSentDate);
        else if (field === 'Offer Sent By') data[field] = user.offersentby;
        else if (field === 'Offer Sent Status')
          data[field] = user.offerSentStatus;
        else if (field === 'Appointment Sent Date')
          data[field] = this.formatDate(user.appointmentSentDate);
        else if (field === 'Appointment Sent By')
          data[field] = user.appointmentsentby;
        else if (field === 'Appointment Sent Status')
          data[field] = user.appointmentSentStatus;
        else if (field === 'Trainee Offer Sent Date')
          data[field] = this.formatDate(user.traineeoffersentdate);
        else if (field === 'Trainee Offer Sent By')
          data[field] = user.traineeoffersentby;
        else if (field === 'Trainee Offer Sent Status')
          data[field] = user.traineeoffersentstatus;
        else if (field === 'Contract Offer Sent Date')
          data[field] = this.formatDate(user.contractoffersentdate);
        else if (field === 'Contract Offer Sent By')
          data[field] = user.contractoffersentby;
        else if (field === 'Contract Offer Sent Status')
          data[field] = user.contractoffersentstatus;
        // Onboarding
        else if (field === 'Date Of Joining')
          data[field] = this.formatDate(user.dateOfJoining);
        else if (field === 'Probation End Date')
          data[field] = this.formatDate(user.probationEndDate);
        else if (field === 'Probation Status')
          data[field] = user.probationStatus;
        else if (field === 'Branch Code') data[field] = user.branchcode;
        else if (field === 'Notice Period Status') data[field] = user.noticePeriod;
        else if (field === 'Background Check Status')
          data[field] = user.backgroundCheckStatus;
        else if (field === 'Salary Hold') data[field] = user.salaryhold;
        else if (field === 'PT') data[field] = user.pt;
        else if (field === 'PF') data[field] = user.pfapplicable;
        else if (field === 'ESIC') data[field] = user.esicapplicable;
        else if (field === 'Insurance') data[field] = user.healthinsurance;
        else if (field === 'Total Previous Years Experience') data[field] = user.totalYearsOfExperience;
        else if (field === 'Employment Type Status') data[field] = user.empType;
        else if (field === 'Contract Start Date')
          data[field] = this.formatDate(user.contractStartDate);
        else if (field === 'Duration of Contract')
          data[field] = user.contractDuration;
        else if (field === 'Contract End Date')
          data[field] = this.formatDate(user.contractEndDate);
        // Offboarding
        else if (field === 'Last Working Day')
          data[field] = this.formatDate(user.lastworkingday);
        else if (field === 'Exit Reason') data[field] = user.termreasonoffboard;
        else if (field === 'Eligible For Rehire')
          data[field] = user.eligibleforrehire;
        else if (field === 'Relieving Type') data[field] = user.separationType;
        else if (field === 'Contractor Last Working Day')
          data[field] = this.formatDate(user.contractorLastWorkingDate);
        // Employment
        else if (field === 'Job Type') data[field] = user.jobType;
        else if (field === 'Job Grade') data[field] = user.gradeName;
        // Job Details
        else if (field === 'Job Effective Date')
          data[field] = this.formatDate(user.jobeffectivedate);
        else if (field === 'Job Role') data[field] = user.jobRole;
        else if (field === 'Department') data[field] = user.departmentName;
        else if (field === 'Team') data[field] = user.subdepartment_name;
        else if (field === 'Team Manager') data[field] = user.teammanager;
        else if (field === 'Reporting Manager')
          data[field] = user.reportingmanager;
        else if (field === 'Location') data[field] = user.joblocationname;
        else if (field === 'Sub Location')
          data[field] = user.jobsublocationname;
        else if (field === 'Shift') data[field] = user.shiftname;
        else if (field === 'Shift Code') data[field] = user.shiftcode;
        // Compensation
        else if (field === 'Compensation Effective Date')
          data[field] = this.formatDate(user.compeffectivedate);
        else if (field === 'Overtime Eligibility')
          data[field] = user.overtimeeligibility;
        else if (field === 'Reason') data[field] = user.reason;
        else if (field === 'Pay Type') data[field] = user.paytype;
        else if (field === 'Annual Salary (in CTC)') data[field] = user.compensationamount;
        else if (field === 'Frequency') data[field] = user.frequency;
        else if (field === 'Variable Pay') data[field] = user.isVariablePay ? 'Yes' : 'No';
        else if (field === 'Variable Pay Amount') data[field] = user.variablePayAmount;
        else if (field === 'Next Compensation Review Date')
          data[field] = this.formatDate(user.nextCompReviewDate);
          });
          this.selectedData.push(data);
        });

        this.originalSelectedData = [...this.selectedData];
        this.applyCurrentSort();
      } finally {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
      }
    }, 0);
  }

  getStatus() {
    this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[];
      },
    });
  }

  options(employeeStatus: string[] | string) {
    console.log(employeeStatus);

    if (!employeeStatus || employeeStatus.length === 0) {
      this.selectedFieldsOption = [];
      return;
    }

    this.emp = this.copyData;
    this.filteredData = this.emp;

    const statusLower = Array.isArray(employeeStatus) ? employeeStatus.map(s => s.toLowerCase()) : [employeeStatus.toLowerCase()];

    if (!statusLower.includes('all employees')) {
      this.filteredData = this.emp.filter(emp => {
        if (!emp.empstatus) return false;
        return statusLower.some(status => {
          const allowedStatuses = this.statusMapping[status];
          return allowedStatuses && allowedStatuses.some(s => s.toLowerCase() === emp.empstatus.toLowerCase());
        });
      });
    }

    this.emp = this.filteredData;
  }

   clearAllFilters(): void {
    this.reportForm.patchValue({
      status: 'All Employees',
      dateOfJoining: null
    });

    this.emp = [...this.copyData];
    this.filteredData = [...this.copyData];
    this.selectedData = [];
    this.originalSelectedData = [];

    this.disableBtn = false;
    this.hasPendingChanges = false;
    this.onSubmit();
  }

  customSort(event: any): void {
    const field = String(event.field ?? '');

    if (!field) {
      return;
    }

    if (!this.reportFields.includes(field)) {
      this.currentSortField = '';
      this.currentSortOrder = 0;
      this.customReportsTable?.reset();
      return;
    }

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.selectedData = [...this.originalSelectedData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.customReportsTable?.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    this.sortSelectedData(event.data, field, event.order);
  }

  // Check if field is a phone/contact number field (should not be sortable)
  isPhoneNumberField(field: string): boolean {
    const phoneFields = [
      'Phone Number',
      'Work Number',
      'Phone Number (Primary Contact)',
      'Phone Number (Secondary Contact)',
      'Mobile Number',
      'Contact Number'
    ];
    return phoneFields.includes(field);
  }

  private applyCurrentSort(): void {
    if (!this.currentSortField || this.currentSortOrder === 0) {
      this.selectedData = [...this.originalSelectedData];
      return;
    }

    if (!this.reportFields.includes(this.currentSortField)) {
      this.selectedData = [...this.originalSelectedData];
      this.currentSortField = '';
      this.currentSortOrder = 0;
      this.customReportsTable?.reset();
      return;
    }

    this.selectedData = [...this.originalSelectedData];
    this.sortSelectedData(this.selectedData, this.currentSortField, this.currentSortOrder);
  }

  private sortSelectedData(data: any[], field: string, order: number): void {
    data.sort((a: any, b: any) => {
      const value1 = this.getSortValue(a?.[field]);
      const value2 = this.getSortValue(b?.[field]);

      const bothNumbers = typeof value1 === 'number' && typeof value2 === 'number';
      if (bothNumbers) {
        return order * (Number(value1) - Number(value2));
      }

      return order * String(value1).localeCompare(String(value2), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  private getSortValue(value: any): string | number {
    if (value === null || value === undefined || value === '' || value === '-') {
      return '';
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return '';
    }

    if (/^\d+(\.\d+)?$/.test(normalized)) {
      return Number(normalized);
    }

    if (/^[A-Za-z]{3}\s\d{2},\s\d{4}$/.test(normalized)) {
      const time = new Date(normalized).getTime();
      return Number.isFinite(time) ? time : normalized;
    }

    return normalized;
  }

  private getStatusLower(): string[] {
    const rawValue = this.reportForm.get('status')?.value;
    const statusArray = Array.isArray(rawValue) ? rawValue : (rawValue ? [rawValue] : []);

    return statusArray.map((s: any) =>
      typeof s === 'string'
        ? s.toLowerCase()
        : s?.value?.toLowerCase?.() || ''
    );
  }

isActiveOrInactive(): boolean {
  const status = this.getStatusLower();
  return status.includes('active') || status.includes('inactive');
}

getDateLabel(): string {
  const status = this.getStatusLower();
  return status.includes('active') ? 'Date of Joining' : 'Last Working Day';
}

getDatePlaceholder(): string {
  const status = this.getStatusLower();
  return status.includes('active')
    ? 'Please select date of joining'
    : 'Please select last working day';
}
  generateExcel(): void {
    if (this.selectedData.length === 0) {
      return;
    }
    this.spinnerLoader2 = true;
    const dataWithDashes = this.selectedData.map(row => {
      const newRow: any = {};
      this.selectedFields.forEach(field => {
        const value = row[field];
        newRow[field] = (value === null || value === undefined || value === '' || value === 'null') ? '-' : value;
      });
      return newRow;
    });

    const headers = this.selectedFields;
    const title = ['CUSTOM REPORT'];

    const sheetData = [
      title,
      headers.map(h => h.toUpperCase()),
      ...dataWithDashes.map(row => headers.map(header => row[header]))
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetData);

    const borderStyle = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

    // Apply borders to the title row
    for (let C = 0; C < headers.length; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cell_address]) {
        ws[cell_address] = { t: 's', v: '' }; // Ensure cell exists for border
      }
      ws[cell_address].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'left' },
        // border: borderStyle
      };
    }

    // Apply borders to the header row
    for (let C = 0; C < headers.length; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 1, c: C });
      if (ws[cell_address]) {
        ws[cell_address].s = {
          font: { bold: true },
          border: borderStyle
        };
      }
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Custom Report');
    const wbout: ArrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(wbout);
  }

  private convertHeadersToUpperCase(ws: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      const cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.v = cell.v.toString().toUpperCase();
        cell.w = cell.v;
      }
    }
  }

  private saveAsExcelFile(buffer: ArrayBuffer): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    link.download = `Custom Report - ${formattedDate}.xlsx`;
    link.click();
    // Create file for potential upload
    const reportFile = new File(
      [data], `Custom Report - ${formattedDate}.xlsx`,
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', }
    );
    this.spinnerLoader2 = false;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateString;
    }
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}