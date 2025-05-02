import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import * as XLSX from 'xlsx';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Ipersonal, IStatus } from './custom-model';
import { CalendarModule } from 'primeng/calendar';
import { environment } from '../../../environments/environment';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import dayjs from 'dayjs';
import { AccordionModule } from 'primeng/accordion';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
interface FieldGroup {
  name: string;
  fields: string[];
  selectedFields: string[];
  selectAll: boolean;
}
@Component({
  selector: 'app-custom-reports',
  imports: [
    SelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    CalendarModule,
    NgxDaterangepickerBootstrapDirective,
    AccordionModule,
    NoDataFoundComponent
],
  templateUrl: './custom-reports.component.html',
  styleUrl: './custom-reports.component.scss',
  encapsulation:ViewEncapsulation.None
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
  activeIndex:any;
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
  empStatusList = ['All Employees', 'Active', 'Inactive', 'Prospective'];
  selectedData: any[] = [];
  selectedFields: string[] = [
    'ID',
    'Employee ID',
    'First Name',
    'Middle Name',
    'Last Name',
  ];
  reportFields: string[] = [];
  emp: Ipersonal[] = [];
  reportdata: any[] = [];
  // Define locked fields per group (if needed)
  lockedFields: string[] = [
    'ID',
    'Employee ID',
    'First Name',
    'Middle Name',
    'Last Name',
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
        'ID',
        'Employee ID',
        'First Name',
        'Middle Name',
        'Last Name',
        'Salutation',
        'Status',
        'Marital Status',
        'Gender',
        'Date of Birth',
        'Blood Group',
      ],
      selectedFields: [
        'ID',
        'Employee ID',
        'First Name',
        'Middle Name',
        'Last Name',
      ],
      selectAll: false,
    },
    currentAddress: {
      name: 'Current Address',
      fields: [
        'Address Line 1(current)',
        'Address Line 2(current)',
        'City(current)',
        'State(current)',
        'Country(current)',
        'Zip Code/Post Code(current)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    permanentAddress: {
      name: 'Permanent Address',
      fields: [
        'Address Line 1(permanemt)',
        'Address Line 2(permanemt)',
        'City(permanemt)',
        'State(permanemt)',
        'Country(permanemt)',
        'Zip Code/Post Code(permanemt)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    contactDetails: {
      name: 'Contact Details',
      fields: ['Work Number', 'Mobile Phone', 'Work Email', 'Personal Email'],
      selectedFields: [],
      selectAll: false,
    },
    emergencyContact1: {
      name: 'Emergency Contact 1',
      fields: [
        'Name(contact1)',
        'Email(contact1)',
        'Phone Number(contact1)',
        'Relationship(contact1)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    emergencyContact2: {
      name: 'Emergency Contact 2',
      fields: [
        'Name(contact2)',
        'Email(contact2)',
        'Phone Number(contact2)',
        'Relationship(contact2)',
      ],
      selectedFields: [],
      selectAll: false,
    },
    educationDetails: {
      name: 'Education Details',
      fields: [
        'Degree',
        'University',
        'Specialization',
        'GPA',
        'Degree Start Date',
        'Degree End Date',
      ],
      selectedFields: [],
      selectAll: false,
    },
    visaDetails: {
      name: 'Visa Details',
      fields: ['Visa Type', 'Issued Country', 'Issued Date', 'Expiry Date'],
      selectedFields: [],
      selectAll: false,
    },
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
        'Account Holders Name',
        'Account Number',
        'IFSC Code',
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
        'Notice Period',
        'Background Check Status',
        'Salary Hold',
        'PT',
        'ESIC',
        'PF',
        'Insurance',
      ],
      selectedFields: [],
      selectAll: false,
    },
    offboardingDetails: {
      name: 'Offboarding Details',
      fields: ['Last Working Day', 'Eligible For Rehire', 'Exit Reason'],
      selectedFields: [],
      selectAll: false,
    },
    employmentTypeDetails: {
      name: 'Employment Type Details',
      fields: ['Job Type', 'Grade Name'],
      selectedFields: [],
      selectAll: false,
    },
    jobDetails: {
      name: 'Job Details',
      fields: [
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
        'Yearly CTC',
      ],
      selectedFields: [],
      selectAll: false,
    },
  };
  hasPendingChanges = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.activeIndex = '0';
    this.inititalizeForm();
    this.getCustomReportDetails();
    this.getStatus();
    this.showPersonalData();
  }

  inititalizeForm() {
    this.reportForm = this.fb.group({
      status: ['All Employees'],
      dateOfJoining: [null],
    });

    this.reportForm.get('status')?.valueChanges.subscribe(() => {
      this.reportForm.get('dateOfJoining')?.reset();
    });
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
    this.selectedFields = [
      'ID',
      'Employee ID',
      'First Name',
      'Middle Name',
      'Last Name',
      ...this.selectedFields,
    ];
    if (this.fieldGroups['basicInfo']) {
      this.fieldGroups['basicInfo'].selectedFields = [...this.selectedFields];
    }
  }

  getCustomReportDetails(): void {
    this.http.getData('Employeedata/Reports/EmployeeData').pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.emp = data;
          this.copyData = JSON.parse(JSON.stringify(this.emp));
          this.filteredData = JSON.parse(JSON.stringify(this.emp));
        },
        error: (err: any) => {
          console.error('Error fetching report data:', err);
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
    this.selectedFields = Object.values(this.fieldGroups).reduce(
      (acc: string[], group) => [...acc, ...group.selectedFields], []
    );
    if (this.selectedFields.length == 0) {
      this.selectedData = [];
    }
  }

  private updateReportFields(): void {
    this.reportFields = Object.values(this.fieldGroups).reduce(
      (acc: string[], group) => [...acc, ...group.selectedFields], []
    );
    if (this.reportFields.length == 0) {
      this.reportFields = [];
    }
  }

  onSubmit(): void {
    this.spinnerLoader1 = true;
    if (this.reportForm.invalid) return;
    this.selectedData = [];
    this.activeIndex = '1';
    const formData = this.reportForm.value;
    this.updateReportFields();
    this.hasPendingChanges = false;
    //if dateOfJoining present filter the data with provide range
    const startDate = formData.dateOfJoining?.startDate ? new Date(formData.dateOfJoining.startDate) : null;
    const endDate = formData.dateOfJoining?.endDate ? new Date(formData.dateOfJoining.endDate) : null;
    // Step 1: Filter employees based on DoJ if date range is provided
    const filteredEmployees = this.emp.filter((user: Ipersonal) => {
      const doj = user.dateOfJoining ? new Date(user.dateOfJoining) : null;
      if (!doj || user.dateOfJoining === '0001-01-01T00:00:00' || isNaN(doj.getTime()))
        return false;
      if (startDate && doj < startDate) return false;
      if (endDate && doj > endDate) return false;
      return true;
    });

    filteredEmployees.forEach((user: Ipersonal) => {
      const data: { [key: string]: any } = {};
      this.selectedFields.forEach((field: string) => {
        // Basic Info
        if (field === 'ID') data[field] = user.employeeId;
        else if (field === 'Employee ID') data[field] = user.fusionEmpId;
        else if (field === 'Salutation') data[field] = user.title;
        else if (field === 'First Name') data[field] = user.firstName;
        else if (field === 'Last Name') data[field] = user.lastName;
        else if (field === 'Middle Name') data[field] = user.middleName;
        else if (field === 'Status') data[field] = user.empstatus;
        else if (field === 'Marital Status') data[field] = user.maritalStatus;
        else if (field === 'Gender') data[field] = user.gender;
        else if (field === 'Date of Birth')
          data[field] = this.formatDate(user.dob);
        else if (field === 'Blood Group') data[field] = user.bloodGroup;
        // else if (field === 'Secondary Language') data[field] = user.secondaryLanguage;
        // Current Address
        else if (field === 'Address Line 1(current)')
          data[field] = user.currentaddressline1;
        else if (field === 'Address Line 2(current)')
          data[field] = user.currentaddressline2;
        else if (field === 'City(current)') data[field] = user.currentcity;
        else if (field === 'State(current)') data[field] = user.currentstate;
        else if (field === 'Country(current)')
          data[field] = user.currentcountry;
        else if (field === 'Zip Code/Post Code(current)')
          data[field] = user.currentzipcode;
        // Permanent Address
        else if (field === 'Address Line 1(permanemt)')
          data[field] = user.permanentaddressline1;
        else if (field === 'Address Line 2(permanemt)')
          data[field] = user.permanentaddressline2;
        else if (field === 'City(permanemt)') data[field] = user.permanentcity;
        else if (field === 'State(permanemt)')
          data[field] = user.permanentstate;
        else if (field === 'Country(permanemt)')
          data[field] = user.permanentcountry;
        else if (field === 'Zip Code/Post Code(permanemt)')
          data[field] = user.permanentzipcode;
        // Contact Details
        else if (field === 'Work Number') data[field] = user.workPhone;
        else if (field === 'Mobile Phone') data[field] = user.contactnumber;
        else if (field === 'Work Email') data[field] = user.workEmail;
        else if (field === 'Home Email') data[field] = user.emailaddress;
        // Emergency Contact 1
        else if (field === 'Name(contact1)') data[field] = user.emergencyName;
        else if (field === 'Email(contact1)') data[field] = user.emailId;
        else if (field === 'Phone Number(contact1)')
          data[field] = user.emergencynumber;
        else if (field === 'Relationship(contact1)')
          data[field] = user.relationShip;
        // Emergency Contact 2
        else if (field === 'Name(contact2)') data[field] = user.emergencyName1;
        else if (field === 'Email(contact2)')
          data[field] = user.emergencyEmail1;
        else if (field === 'Phone Number(contact2)')
          data[field] = user.emergencyNumber1;
        else if (field === 'Relationship(contact2)')
          data[field] = user.relationship1;
        // Education
        else if (field === 'Degree') data[field] = user.degree;
        else if (field === 'University') data[field] = user.university;
        else if (field === 'Specialization') data[field] = user.specialization;
        else if (field === 'GPA') data[field] = user.gpa;
        else if (field === 'Degree Start Date')
          data[field] = this.formatDate(user.degreeStartDate);
        else if (field === 'Degree End Date')
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
        else if (field === 'PF Number') data[field] = user.esic;
        else if (field === 'ESIC Number') data[field] = user.pf;
        else if (field === 'UAN Number') data[field] = user.uan;
        // Bank
        else if (field === 'Bank Name') data[field] = user.bankName;
        else if (field === 'Account Holders Name')
          data[field] = user.accountName;
        else if (field === 'Account Number') data[field] = user.accountNo;
        else if (field === 'IFSC Code') data[field] = user.ifscCode;
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
        // Onboarding
        else if (field === 'Date Of Joining')
          data[field] = this.formatDate(user.dateOfJoining);
        else if (field === 'Probation End Date')
          data[field] = this.formatDate(user.probationEndDate);
        else if (field === 'Probation Status')
          data[field] = user.probationStatus;
        else if (field === 'Branch Code') data[field] = user.branchcode;
        else if (field === 'Notice Period') data[field] = user.noticePeriod;
        else if (field === 'Background Check Status')
          data[field] = user.backgroundCheckStatus;
        else if (field === 'Salary Hold') data[field] = user.salaryhold;
        else if (field === 'PT') data[field] = user.pt;
        else if (field === 'PF') data[field] = user.pfapplicable;
        else if (field === 'ESIC') data[field] = user.esicapplicable;
        else if (field === 'Insurance') data[field] = user.healthinsurance;
        // Offboarding
        else if (field === 'Last Working Day')
          data[field] = this.formatDate(user.lastworkingday);
        else if (field === 'Exit Reason') data[field] = user.termreasonoffboard;
        else if (field === 'Eligible For Rehire')
          data[field] = user.eligibleforrehire;
        // Employment
        else if (field === 'Job Type') data[field] = user.jobType;
        else if (field === 'Grade Name') data[field] = user.gradeName;
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
        else if (field === 'Yearly CTC') data[field] = user.compensationamount;
        else if (field === 'Frequency') data[field] = user.frequency;
      });
      this.selectedData.push(data);
    });
    this.spinnerLoader1 = false;
  }

  getStatus() {
    this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[];
      },
    });
  }

  options(employeeStatus: string) {
    this.employeeStatus = employeeStatus;
    if (employeeStatus) {
      this.selectedFieldsOption = this.Statusdetails.find(
        (e: { statusname: string }) => e.statusname == employeeStatus
      );
      this.emp = this.copyData;
      this.filteredData = this.emp;
      if (employeeStatus.toLowerCase() == 'prospective') {
        this.filteredData = this.emp.filter(
          (emp) => emp.empstatus.toLowerCase() == employeeStatus.toLowerCase()
        );
      }
      if (employeeStatus.toLowerCase() == 'active') {
        this.filteredData = this.emp.filter(
          (emp) => emp.empstatus.toLowerCase() == employeeStatus.toLowerCase()
        );
      }
      if (employeeStatus.toLowerCase() == 'inactive') {
        this.filteredData = this.emp.filter(
          (emp) => emp.empstatus.toLowerCase() == employeeStatus.toLowerCase()
        );
      }
      this.emp = this.filteredData;
    } else {
      this.selectedFieldsOption = [];
    }
  }

  isActiveOrInactive(): boolean {
    const status = this.employeeStatus?.toLowerCase();
    return status === 'active' || status === 'inactive';
  }

  getDateLabel(): string {
    const status = this.reportForm.get('status')?.value?.toLowerCase();
    return status === 'active' ? 'Date of Joining' : 'Last Working Day';
  }

  getDatePlaceholder(): string {
    const status = this.employeeStatus?.toLowerCase();
    return status === 'active' ? 'Please select date of joining' : 'Please select last working day';
  }

  generateExcel(): void {
    if (this.selectedData.length === 0) {
      return;
    }
    this.spinnerLoader2 = true;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.selectedData);
    this.convertHeadersToUpperCase(ws);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
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
    link.download = `${
      this.loggedInUser.employeeId
    }_${new Date().getTime()}_custom_reports.xlsx`;
    link.click();
    // Create file for potential upload
    const reportFile = new File(
      [data],`${this.loggedInUser.employeeId}_${new Date().getTime()}__custom_reports.xlsx`,
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
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}