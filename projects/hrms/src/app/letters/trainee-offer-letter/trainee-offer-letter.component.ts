import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, ICountry, IEmployee, IGender, IJobtype, IRole, IServe, ITitle } from '../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trainee-offer-letter',
  imports: [LettersTabComponent, CommonModule, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule, DateformatPipe, LettersheaderComponent,TranslateModule],
  templateUrl: './trainee-offer-letter.component.html',
  styleUrl: './trainee-offer-letter.component.scss'
})
export class TraineeOfferLetterComponent {

  subscription!: Subscription;
  traineeEmpData = {} as any;
  result = {} as any;
  generatedfile = {} as any; //variable to store generated file
  generatingEmployeeId: any;
  documentUrl = {} as any; //variable to store docurl path
  jobRoleDetails: any;
  disableFieldsForApproval: boolean = true; //variable to disable the fields for approval
  SignatureAuthorityValue: any;
  addressType: any;
  employeeaddress = [] as any;
  permanentAddress = {} as IAddress;
  currentAddress = {} as IAddress;
  authorityDetails = [] as any;
  buttonValue: string = 'Generate Offer Letter'; //variable to change the button value
  fusionEmpId: any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  jobDesignation!: string | null;
  disableFields: boolean = true; //variable to disable the fields
  SelectDropDown: any;
  LocationDropDownData = [] as any;
  subLocationsDropdown = [] as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenjob: boolean = false;
  isDropdownOpenauthority: boolean = false;
  filteredOptions = [] as any;
  isDisabled!: boolean;
  isDisabledemployeeid!: boolean;
  isDropdownemployeeidOpen: boolean = false;
  employeeiddetails = [] as any;
  titleDetails = [] as ITitle[];
  genderDetails = [] as IGender[];
  countryDetails = [] as ICountry[];
  JobroleDetails = [] as IRole[];
  disablebuttonfordesignation: boolean = true; //variable to disable the fields
  isIssuedDateValid: boolean = true;
  isExpiryDateValid: boolean = true;
  isStartDateValid: boolean = true;
  isStartDateValidofexpected: boolean = true;
  isSearchFeatureDisabled: boolean = true;
  currentDate: Date = new Date();
  authorityDesignation!: string | null;
  loading: boolean = false;
  Employeeinfo = [] as any;
  offerLetterTemplate: any | string | ArrayBuffer | null = null; //offer letter template
  httpclient: any;
  endDate: Date | undefined;
  employeedetails = [] as any;
  selectedReportingManager: any;
  serveDetails = [] as IServe[];
  servingPeriodDuration: number | undefined;
  getAllEmployeeInfo = [] as any;
  employeeForm!: FormGroup;
  addresFlag= false;
  address = {} as IAddress;
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  addressdata: { name: string, value: string }[] = [
    { name: 'Current Address', value: 'C' },
    { name: 'Permanent Address', value: 'P' },
  ];
  internshipPeriod: { name: string, value: string }[] = [
    { name: '1 ', value: '1' },
    { name: '2 ', value: '2' },
    { name: '3 ', value: '3' },
    { name: '4 ', value: '4' },
    { name: '5 ', value: '5' },
  ];
  countryvalues = {} as any;
  selectedCountryConfig = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true
  };
  phoneNumber: string = '';
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  constructor(
    private http: HttpService,
    config: NgbModalConfig, private modalService: NgbModal, private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef, private conformationPopup: OpenModalService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.initializeForm();
    // (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }
  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.traineeEmpData.mobilePhoneCountryCode = 'India (+91)';
    console.log(this.traineeEmpData.mobilePhoneCountryCode);
    this.traineeEmpData.title = null;
    console.log(this.Employeeinfo);
    this.initializeForm();
    this.getservingperiod();
    this.getJobtype();
    this.getOfferTemplate();
    this.getTitle();
    this.getgender();
    this.getCountry();
    this.getJobrole();
    this.getEmployeeId();
    this.getAllEmployeeDetails();
    this.getAllWorkLocation();
    this.getAuthorityDetails();
    this.getEmployeeIdforReporting();

  }

  searchTerm: string = '';
  filteredEmployees: any[] = [];
  showDropdown = false;
  selectedEmployee: string = '';
  Drop: IEmployee[] = [];
  employeeSelected: boolean = false;
  selectedEmployees: number[] = [];

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      personalEmail: [{ value: null, disabled: true }],
      title: [{ value: null, disabled: true }],
      firstName: [{ value: null, disabled: true }],
      middleName: [{ value: null, disabled: true }],
      lastName: [{ value: null, disabled: true }],
      gender: [{ value: null, disabled: true }],
      salutation: [{ value: null, disabled: true }],
      SelectDropDown: [null, Validators.required],
      addressLine1: [{ value: null, disabled: true }],
      addressLine2: [{ value: null, disabled: true }],
      city: [{ value: null, disabled: true }],
      state: [{ value: null, disabled: true }],
      country: [{ value: null, disabled: true }],
      pinCode: [{ value: null, disabled: true }], 
      phoneNumber: [{ value: null, disabled: true }], 
      jobRoleDetails: [{ value: null, disabled: true }],
      amount: ['', Validators.required],
      isVariablePay: [null, Validators.required],
      variablePayAmount: ['', Validators.required],
      locationId: [{ value: null, disabled: true }],
      JobSubLocationName: [{ value: null, disabled: true }],
      offerSentDate: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      Copys: [null, Validators.required],
      offerExpiryDate: ['', Validators.required],
      note: [''],
      authorityid: [null, Validators.required],
      reportingmanagerId: [null, Validators.required],
      documentType: ['', Validators.required],
      internshipperiod: [null, Validators.required],
    });
    this.employeeForm.get('internshipperiod')?.valueChanges.subscribe((value: string) => {
      this.calculateEndDate(value);
    });
  }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  filterEmployees() {
    console.log(this.employeedetails)
    if (this.employeedetails) {

      this.filteredEmployees = this.Drop.filter(emp =>
        (emp.fusionEmpId + ' ' + emp.firstName + ' ' + emp.middleName + ' ' + emp.lastName).toLowerCase().includes(this.employeedetails.toLowerCase())
      );
      console.log('Filtered Employees:', this.filteredEmployees);
    } else {
      this.filteredEmployees = this.Drop;
    }
  }
  handlePhoneChange(event: any) {
    this.employeeForm.patchValue({
      phoneNumber: event
    });
  }

  requestForApproval() {
    if (this.traineeEmpData.isEmployeevalid === true) {
      this.traineeofferletterUpload(this.generatingEmployeeId, this.generatedfile);
    } else {
      this.traineeofferletterUpload(this.generatingEmployeeId, this.generatedfile);
    }
  }

  toggleDropdown1() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.filterEmployees();
      console.log('Dropdown is now open');
    }
  }

  onSelectEmployee(event: any, employee: IEmployee) {
    if (event.target.checked) {
      this.selectedEmployees.push(employee.employeeId);
    } else {
      this.selectedEmployees = this.selectedEmployees.filter(id => id !== employee.employeeId);
    }
    this.updateSelectedEmployeeDisplay();
    console.log('Selected Employees:', this.selectedEmployees);
  }

  updateSelectedEmployeeDisplay() {
    if (this.selectedEmployees.length > 0) {
      let firstSelectedEmployee = this.filteredEmployees.find(emp => emp.employeeId === this.selectedEmployees[0]);
      this.selectedEmployee = firstSelectedEmployee.firstName;
      // Add middle name if it exists
      if (firstSelectedEmployee.middleName) {
        this.selectedEmployee += ' ' + firstSelectedEmployee.middleName;
      }

      // Add last name
      this.selectedEmployee += ' ' + firstSelectedEmployee.lastName;
      if (this.selectedEmployees.length > 1) {
        this.selectedEmployee += ' +' + (this.selectedEmployees.length - 1).toString();
      }
    } else {
      this.selectedEmployee = '';
    }
  }

  onDateOfJoiningChange() {
    this.calculateEndDate(this.traineeEmpData.internshipperiod);
  }

  calculateEndDate(value: any) {
    if (this.traineeEmpData.dateOfJoining && value) {
      const startDate = new Date(this.traineeEmpData.dateOfJoining);
      const months = parseInt(value, 10);
      console.log(months)
      const days = this.getDaysFromMonths(months);
      console.log(days)
      if (days > 0) {
        this.traineeEmpData.durationOfTrainee = days;
      }
      const endDate = new Date(startDate.setMonth(startDate.getMonth() + months));
      this.traineeEmpData.endDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    console.log(this.traineeEmpData.endDate);

  }

  getDaysFromMonths(months: number): number {
    const startDate = moment(this.traineeEmpData.dateOfJoining); // Current date
    const endDate = moment(startDate).add(months, 'months'); // Future date after adding months
    return endDate.diff(startDate, 'days'); // Difference in days
  }

  getMonthsBetween(startDate: string, endDate: string): number {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'months', true); // 'true' gives exact months with decimals
  }

  //  //to get offer letter template
  async getOfferTemplate() {
    this.offerLetterTemplate = await this.httpclient
      .get('assets/offer.docx', {
        responseType: 'arraybuffer',
      })
      .toPromise();
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employeedetails.find((emp: any) => emp.employeeId === employeeId);
    if (employee) {
      return `${employee?.firstName ?? ''} ${employee?.middleName ?? ''} ${employee?.lastName ?? ''}`;
    }
    return '';
  }

  getEmployeeIdforReporting() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          this.employeedetails = data;
          console.log(this.employeedetails);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getAllEmployeeDetails() {
    const satus = ['active'];
    this.subscription = this.http
      .getData(`Employeedata/Getallemployees?statuses=${satus}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            // this.getAllEmployeeInfo = response;
            this.getAllEmployeeInfo = response.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
              };
            });
          }
        },
      });
  }

  //function to get reporting manager name
  selectReportingname(Value: any) {
    if (Value) {
      const details = this.getAllEmployeeInfo.find(
        (ele: any) => ele.employeeId == Value
      );
      console.log(details);
      this.traineeEmpData.reportingmanagerName = `${details.firstName} ${details.middleName ? details.middleName + ' ' : ''
        }${details.lastName}`;
      this.traineeEmpData.reportingcontactnumber = details.workPhone;
      this.traineeEmpData.reportingworkemail = details.workEmail;
      // this.getJobdetails(Value);
    } else {
      this.traineeEmpData.reportingmanagerName = null;
    }
  }

  //get employee ids for Trainee Employees Drop Dowm
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/GetTraineeAndVerified')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data .map((employee: any) => {
            return {
              ...employee,
              fullName: `${
                employee.employeeId ? employee.employeeId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,

            };
          }); 
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  singleValue: IServe | null = null;
  getservingperiod() {
    this.subscription = this.http.getData("ServingPeriods").subscribe({
      next: (data: any) => {
        console.log(data);
        this.serveDetails = data as IServe[];
        console.log(this.serveDetails);
        const filteredServeDetails = this.serveDetails.filter((serve: IServe) => {
          return serve.servingPeriodType === 'Trainee Duration Period';
        });
        this.singleValue = filteredServeDetails.length > 0 ? filteredServeDetails[0] : null;
        console.log(this.singleValue);
      }
    });
  }

  //function for get job roles
  getJobrole() {
    this.subscription = this.http.getData('JobRole').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data as IRole[];
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'Offer Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim() // Concatenate first, middle, last name and trim any extra spaces
        }));
        console.log(this.authorityDetails);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  //get method for gender
  getgender() {
    this.subscription = this.http.getData('Gender').subscribe({
      next: (data: any) => {
        this.genderDetails = data as IGender[];
        console.log(this.genderDetails);
      },
      error: (reason) => console.log(reason),
    });
  }

  //get method for title
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titleDetails = data as ITitle[];
        console.log(this.titleDetails);
      },
      error: (reason) => console.log(reason),
    });
  }

  //get method for Country
  getCountry() {
    this.subscription = this.http.getData('Country').subscribe({
      next: (data: any) => {
        this.countryDetails = data as ICountry[];
      },
      error: (reason) => console.log(reason),
    });
  }

  //Function to generate offer letter
  onTraineeOfferLetterFormSubmitForGenerateDoc(f: FormGroup) {
    this.loading = true;
    console.log(f);
    this.updateTraineeOfferLetterFieldsDetails(f.value); 
    //const data =  this.traineeEmpData;
    // if (this.traineeEmpData.isEmployeevalid === true) {
    //   this.updateTraineeOfferLetterFieldsDetails(f.value); //existing emp  offer lettr
    // } else {
    //   this.postTraineeOfferLetterFieldsDetails(f.value); //new offer lettr
    // }
  }

  onclickDesignation(selectedAuthority: any) {
    console.log("Selected Authority ID:", selectedAuthority);
  
    if (!selectedAuthority) {
      this.traineeEmpData.authorityName = '';
      this.authorityDesignation = '';
      return;
    }
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == selectedAuthority.employeeId
    );
  
    console.log("Selected Authority Details:", signatureAuthorityDetails);
  
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
  
      // 🔹 Construct full name correctly
      this.traineeEmpData.authorityName = signatureAuthorityDetails.middleName
        ? `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`
        : `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    } else {
      this.traineeEmpData.authorityName = '';
      this.authorityDesignation = '';
    }
  }
  onclickDesignations(data:any) {
    this.traineeEmpData.authorityName = data.value.firstName + ' ' + data.value.middleName + ' ' + data.value.lastName;
    this.authorityDesignation = data.value.designation;
  
}
  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }

  getEmployeeAddress(Value: any) {
    let EmployeeId = Value
    console.log(Value);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeaddress = data as IAddress[];
        console.log(this.employeeaddress.password);
        if (this.employeeaddress.substatus == 'Documents Verified') {
          this.buttonValue = 'Generate Offer Letter';
        }
        else if (this.employeeaddress.substatus == 'Offer Letter Rejected' || this.employeeaddress.substatus == 'Offer Letter Accepted' || this.employeeaddress.substatus == 'Offer Letter Rejected By Manager') {
          this.buttonValue = 'Regenerate Offer Letter';
        }
        console.log(this.buttonValue);

      }

    })
  }

  //function to reset the feilds
  resetInputFields() {
    this.traineeEmpData.personalEmail = '';
    this.traineeEmpData = {};
    this.traineeEmpData.title = null;
    this.jobRoleDetails = '';
    this.buttonValue = 'Generate Offer Letter';
  }

  //checking function if it is new or existing
  onClickOfferCreate(checkValue: any) {
    if (checkValue === 'New') {
      this.disableFields = true;
      this.buttonValue = 'Generate Offer Letter';
      if (
        this.traineeEmpData.personalEmail != null ||
        this.jobRoleDetails != null ||
        this.traineeEmpData.title
      ) {
        window.location.reload();
      }
    } else if (checkValue === 'Existing') {
      this.disableFields = false;
      this.buttonValue = 'Regenerate Offer Letter';
      if (
        this.traineeEmpData.personalEmail != null ||
        this.jobRoleDetails != null ||
        this.traineeEmpData.title
      ) {
        window.location.reload();
      }
    } else {
      this.buttonValue = 'Generate Offer Letter';
    }
  }
  formatDate(date:any) {
    return date?.split('T')[0]; 
   }
//function to patch the values in the form to the template
pathValuesFuction(){
  const formValues = this.employeeForm.value;
console.log(formValues);
this.traineeEmpData = {
  personalEmail: formValues.personalEmail,
  title: formValues.title,
  firstName: formValues.firstName,
  middleName: formValues.middleName,
  lastName: formValues.lastName,
  gender: formValues.gender,
  jobRole: formValues.jobRoleDetails,
  esic: formValues.esic,
  pf: formValues.pf,
  amount: formValues.amount,
  isVariablePay: formValues.isVariablePay,
  variablePayAmount: formValues.variablePayAmount,
  locationId: formValues.locationId,
  sublocationId: formValues.JobSubLocationName,
  offerIssuedDate: formValues.offerIssuedDate,
  dateOfJoining: formValues.dateOfJoining,
  copys: formValues.Copys,
  trainingEndDate:this.traineeEmpData.endDate,
  note: formValues.note,
  authorityid: formValues.authorityid,
};
}
  //employeeid validation to check we have the mail already exist or not
  onClickValidation(Empidvalue: any) {
    if (Empidvalue) {
      this.fusionEmpId = Empidvalue.value;
      this.subscription = this.http
        .getData(
          `OfferLetter/getEmployeeByEmailAddressAndStatus?EmpId=${Empidvalue.value}`
        )
        .subscribe({
          next: (data: any) => {
            console.log(data);
            console.log(data.checkofferletter);
            console.log(data.message);
            if (data.isEmployeevalid === true) {
              // const userConfirmed = window.confirm("Data already exists. Do you want to regenerate?");
              if (Empidvalue) {
                this.disableFields = false; // User clicked "OK," enable fields
                this.traineeEmpData = data.checkofferletter;
                this.employeeForm?.patchValue({
                  personalEmail:this.traineeEmpData.personalEmail,
                  title:this.traineeEmpData?.title,
                   firstName:this.traineeEmpData?.firstName,
                   middleName:this.traineeEmpData?.middleName,
                   lastName:this.traineeEmpData?.lastName,
                   gender:this.traineeEmpData?.gender,
                   SelectDropDown: null,
                   jobRoleDetails: this.traineeEmpData?.jobRole,
                   esic: this.traineeEmpData?.esic,
                   pf: this.traineeEmpData?.pf,
                   amount:this.traineeEmpData?.amount,
                   isVariablePay: this.traineeEmpData?.isVariablePay,
                   variablePayAmount:this.traineeEmpData?.variablePayAmount,
                   locationId: this.traineeEmpData?.locationId,
                   JobSubLocationName: this.traineeEmpData?.sublocationId,
                   offerIssuedDate:this.formatDate(this.traineeEmpData?.offerIssuedDate),
                   dateOfJoining: this.formatDate(this.traineeEmpData?.dateOfJoining),
                   Copys: this.traineeEmpData?.copys,
                  //  offerExpiryDate: this.formatDate(this.traineeEmpData?.offerExpiryDate),
                   trainingEndDate:this.formatDate(this.traineeEmpData.endDate),
                   note:this.traineeEmpData?.note,
                   authorityid: this.traineeEmpData?.authorityid,
                 })
                this.getTraineeEmployeeAddress(data.checkofferletter.empId);
                this.traineeEmpData.CreateOffer =
                  this.traineeEmpData.CreateOffer;
                if (this.traineeEmpData.offerIssuedDate) {
                  this.traineeEmpData.offerIssuedDate =
                    this.formatDateForOfferIssedandExpiry(
                      this.traineeEmpData.offerIssuedDate
                    );
                  console.log(this.traineeEmpData.offerIssuedDate);
                }
                if (this.traineeEmpData.offerExpiryDate) {
                  this.traineeEmpData.offerExpiryDate =
                    this.formatDateForOfferIssedandExpiry(
                      this.traineeEmpData.offerExpiryDate
                    );
                  console.log(this.traineeEmpData.offerExpiryDate);
                }
                if (this.traineeEmpData.dateOfJoining) {
                  this.traineeEmpData.dateOfJoining =
                    this.formatDateForOfferIssedandExpiry(
                      this.traineeEmpData.dateOfJoining

                    );
                  console.log(this.traineeEmpData.dateOfJoining);
                }
                if (!this.traineeEmpData.mobilePhoneCountryCode) {
                  this.traineeEmpData.mobilePhoneCountryCode = 'India (+91)';

                }
                if (!this.traineeEmpData.country) {
                  this.traineeEmpData.country = 'India';
                }
                this.jobDesignation = this.traineeEmpData.jobRole;
                this.jobRoleDetails = this.traineeEmpData.jobRole;

                this.traineeEmpData.isEmployeevalid = data.isEmployeevalid;
                console.log(this.traineeEmpData);

                console.log(this.buttonValue);
                if (this.traineeEmpData.approver) {
                  this.traineeEmpData.reportingmanagerId = this.traineeEmpData.approver;
                }
                if (this.traineeEmpData.signatureAuthority) {
                  this.traineeEmpData.authorityid = this.traineeEmpData.signatureAuthority;
                  this.onclickDesignation(this.traineeEmpData.authorityid);
                }
                if (this.traineeEmpData.dateOfJoining && this.traineeEmpData.offertrainingEndDate) {
                  const months = this.getMonthsBetween(this.traineeEmpData.dateOfJoining, this.traineeEmpData.offertrainingEndDate)
                  this.traineeEmpData.internshipperiod = months;
                  this.calculateEndDate(this.traineeEmpData.internshipperiod)
                }
                // if(this.traineeEmpData.mobilePhoneCountryCode){
                //   this.countryvalues =this.countryCodes.find((c:any)=>c.countryCodeId==this.traineeEmpData.mobilePhoneCountryCode);
                //   this.traineeEmpData.mobilePhoneCountryCodewithname=this.countryvalues.countryName
                //  }
                // this.buttonValue = 'Regenerate Offer Letter';
                this.traineeEmpData.jobLocationName =
                  data.checkofferletter.workLocation;
                this.traineeEmpData.jobSubLocationName =
                  data.checkofferletter.subLocation;
                console.log(this.traineeEmpData.jobLocationName);
                console.log(this.traineeEmpData.jobSubLocationName);
                this.getSubLocationByid(this.traineeEmpData?.locationId);
                this.ctcCalculation();
                 this.OnClickLocation();
                this.disablebuttonforemployeeid = true
              }
            }
            else {
              this.disableFields = false; // disable fields
            }
          },
        });
    }
  }

  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http
      .getData(
        `JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.subLocationsDropdown = data.jobSubLocations;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  //function for getAllWorkLocation
  getAllWorkLocation() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.LocationDropDownData = data.jobLocations;
      },
    });
  }

  //function to get SubLocation
  OnClickLocation() {
    let locationName = this.traineeEmpData.jobLocationName;
    console.log(locationName);
    let jobSubLocationDetails = this.LocationDropDownData.find(
      (c: any) => c.jobLocationName === locationName
    );
    console.log(this.LocationDropDownData);

    console.log(jobSubLocationDetails);
    this.getSubLocationByid(jobSubLocationDetails);
  }

  onclickCTC(Value: any) {
    console.log(Value);
    this.traineeEmpData.amount = Value;
    this.ctcCalculation();
  }

  //ctc Calculation in offer letter
  ctcCalculation() {
    console.log(this.traineeEmpData.amount);
    this.traineeEmpData.pf=this.employeeForm.get('pf')?.value.value;
    this.traineeEmpData.esic=this.employeeForm.get('esic')?.value.value;
    //CTC calculation stated
    let Employee = this.traineeEmpData;
    Employee.grossby = 12;
    Employee.grossSalary = Math.round(
      this.traineeEmpData.amount / Employee.grossby
    );
    console.log(Employee.grossby);
    console.log(Employee.grossSalary);

    //Calculation condition for pf contribution of an employee]
    console.log(this.traineeEmpData.pf)
    if (this.traineeEmpData.pf == true || this.traineeEmpData.pf == false) {
      switch (this.traineeEmpData.pf) {

        case true:
          if (this.traineeEmpData.esic == false) {
            Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));

            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);
          }
          else if (Employee.grossSalary >= 23195) {

            Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));


            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);

          }
          else if (Employee.grossSalary <= 23194) {

            Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);

          }
          else {
            if (Employee.grossSalary <= 15000) {
              Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
              console.log(Employee.pfContribution);
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
              console.log(Employee.pfContribution);
            }
            else if (Employee.grossSalary <= 23194) {

              Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
              console.log(Employee.pfContribution);

            }
            else if (Employee.grossSalary >= 23195) {

              Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));


              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
              console.log(Employee.pfContribution);

            }
          }

          break;
        case false:
          Employee.pfContribution = 0;
          console.log(Employee.pfContribution);

          break;
        default:
      }

    }
    else {
      Employee.pfContribution = 0;
    }
    //==============================================================================================================================
    //Calculation conditions for esic contribution of an employeer
    if (this.traineeEmpData.esic.toString() == 'true') {
      let condition1 = Employee.grossSalary >= 23195;
      if (!condition1) {
        Employee.esicContribution = Math.round(
          Employee.grossSalary * (2.94 / 100)
        );
        console.log(Employee.esicContribution);
        this.traineeEmpData.esic = true;
      } else {
        Employee.esicContribution = 0;
        this.traineeEmpData.esic = false;
        console.log(Employee.esicContribution);
      }

    }
    else {
      Employee.esicContribution = 0;
      this.traineeEmpData.esic = false;
      console.log(Employee.esicContribution);
    }
    //===================================================================================================================================
    //Calculation conditions for pt contrubution of an employee
    if (Employee.grossSalary < 15000) {
      Employee.professionalTax = 0;
      this.traineeEmpData.pt = false;
      console.log(Employee.professionalTax);
    } else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
      Employee.professionalTax = 150;
      this.traineeEmpData.pt = true;
      console.log(Employee.professionalTax);
    } else if (Employee.grossSalary >= 21000) {
      Employee.professionalTax = 200;
      console.log(Employee.professionalTax);
      this.traineeEmpData.pt = true;
    } else {
      Employee.professionalTax = 0;
      this.traineeEmpData.pt = false;
      console.log(Employee.professionalTax);
    }
    //==============================================================================================================================
    //Calculation conditions for totalgrosssalary of an employee
    Employee.totalGrossSalary = Math.round(
      Employee.grossSalary - Employee.pfContribution - Employee.esicContribution
    );
    console.log(Employee.totalGrossSalary);
    //==============================================================================================================================
    //Calculation conditions for esic contrubution of an employee
    if (this.traineeEmpData.esic == true) {
      if (Employee.totalGrossSalary <= 21000) {
        Employee.employeeEsi = Math.round(
          Employee.totalGrossSalary * (0.75 / 100)
        );
        console.log(Employee.employeeEsi);
        this.traineeEmpData.esic = true;
      } else {
        Employee.employeeEsi = 0;
        this.traineeEmpData.esic = false;
      }
    }
    else {
      Employee.employeeEsi = 0;
      this.traineeEmpData.esic = false;
    }

    //==================================================================================================================================
    //===========================================================================================================
    // calculation for the basicsalary
    Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100));
    console.log(Employee.basicSalary);

    //calculation for the hraSalary
    Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
    console.log(Employee.hraSalary);

    //calculation for the educationAllowances
    Employee.educationAllowances = Math.round(
      Employee.totalGrossSalary * (2 / 100)
    );
    console.log(Employee.educationAllowances);

    //calculation for the conveyance
    Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100));
    console.log(Employee.Conveyance);

    //total deductions per month
    Employee.totalDeduction = Math.round(
      Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax
    );
    console.log(Employee.totalDeduction);

    //total net salary  per month
    Employee.netSalary = Math.round(
      Employee.totalGrossSalary - Employee.totalDeduction
    );
    console.log(Employee.netSalary);

    //calculation for the otherallowances
    Employee.otherAllowances = Math.round(
      Employee.totalGrossSalary * (10 / 100)
    );
    console.log(Employee.otherAllowances);

    //pfcontribution per annum
    Employee.pfPreAnuum = Math.round(
      Employee.pfContribution * Employee.grossby
    );
    console.log(Employee.pfPreAnuum);

    //totalGrossPerAnnum calculation
    Employee.totalGrossPerAnnum = Math.round(
      Employee.totalGrossSalary * Employee.grossby
    );
    console.log(Employee.totalGrossPerAnnum);

    //basicsalaryperannum
    Employee.basicPerannum = Math.round(
      Employee.basicSalary * Employee.grossby
    );
    console.log(Employee.basicPerannum);

    //HRA per annum
    Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
    console.log(Employee.hraPerAnnum);

    //esiper anuum
    Employee.esiPerAnnum = Math.round(
      Employee.esicContribution * Employee.grossby
    );
    console.log(Employee.esiPerAnnum);
    //esiper anuum for employee
    Employee.esiPerAnnumemployee = Math.round(
      Employee.employeeEsi * Employee.grossby
    );
    console.log(Employee.esiPerAnnumemployee);
    //educationper annum
    Employee.educationallowancesPerAnnum = Math.round(
      Employee.educationAllowances * Employee.grossby
    );
    console.log(Employee.educationallowancesPerAnnum);
    //conveyance per annum
    Employee.conveyancePerAnnum = Math.round(
      Employee.Conveyance * Employee.grossby
    );
    console.log(Employee.conveyancePerAnnum);

    //otherAllowancesper annum
    Employee.otherAllowancesPerAnnum = Math.round(
      Employee.otherAllowances * Employee.grossby
    );
    console.log(Employee.otherAllowancesPerAnnum);

    //professional per annum
    Employee.professionalPerAnnum = Math.round(
      Employee.professionalTax * Employee.grossby
    );
    console.log(Employee.professionalPerAnnum);

    //salary deductions per annum
    Employee.totalDeductionsPerAnnum = Math.round(
      Employee.pfPreAnuum +
      Employee.esiPerAnnumemployee +
      Employee.professionalPerAnnum
    );
    console.log(Employee.totalDeductionsPerAnnum);

    //net salary per annum
    Employee.netSalaryPerAnnum = Math.round(
      Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum
    );
    console.log(Employee.netSalaryPerAnnum);
    //Ctc per annum
    Employee.ctcperannum = Math.round(
      Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum
    );
    console.log(Employee.ctcperannum);
  }

  //coverting date time to the date formate
  formatDateForOfferIssedandExpiry(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  //function to post the data of the offer letter to the respective feilds
  postTraineeOfferLetterFieldsDetails(f: FormGroup) {
    const data = this.traineeEmpData;
    this.loading = true;
    let sdata = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      empstatus: 'Prospective',
      emptype: 'Trainee',
      emailaddress: data.personalEmail,
      gender:data.gender,
      contactnumber: parseInt(data.phoneNumber),
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      zipCode: parseInt(data.pinCode),
      country: data.country,
      mobilePhoneCountryCode: data.mobilePhoneCountryCode,
      title: data.title,
      pf: data.pf,
      esic: data.esic,
      dateOfJoining: data.dateOfJoining,
      substatus: 'Offer Letter Generated',
      trainingEndDate:this.traineeEmpData.endDate,
    };
    console.log(sdata);

    console.log(this.result.employeeId);
    this.subscription = this.http.postdata('Employeedata', sdata).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == 201) {
          this.result = res.employeeData;
          console.log(this.result);
          this.downLoadDocument(this.result);
          if (this.result.employeeId != null) {
            const jobdata = {
              employeeId: this.result.employeeId,

              effectiveDate: data.dateOfJoining,
              // reportsto: ,

              locationid: data.locationId,
              sublocationid: data.sublocationId,
              reportsto: data.reportingmanagerId,
              jobRole: this.jobRoleDetails,
            };
            const Compensationdata = {
              employeeId: this.result.employeeId,
              compeffectivedate: data.dateOfJoining,
              overtimeeligibility: null,
              reason: null,
              comments: null,
              frequency: null,
              paytype: null,
              compensationamount: parseInt(data.amount),
              status: 'Active',
              compensationcomments: null,
            };

            const employmentdata = {
              empid: this.result.employeeId,
              jobType: 'Contract',
              empEffectiveDate: data.dateOfJoining,
              // "empComments": null,
              // "gradeId": null,
              isdeleted: 'Active',
            };

            this.subscription = this.http
              .postdata('JobDetails', jobdata)
              .subscribe({
                next: (data: any) => {
                  console.log(data);
                  // alert("education data successfully added")
                },
                error: (Reason) => console.log(Reason),
              });

            this.subscription = this.http
              .postdata('Compensationdata', Compensationdata)
              .subscribe({
                next: (data: any) => {
                  console.log(data);
                  // alert("comp data successfully added")
                },
                error: (Reason) => console.log(Reason),
              });
            this.subscription = this.http
              .postdata('Employementtype', employmentdata)
              .subscribe({
                next: (data: any) => {
                  console.log(data);
                  this.disableFieldsForApproval = false;
                  // alert("employeedata coming successfully");
                  // this.router.navigate(['/admin']);
                },
                error: (Reason) => console.log(Reason),
              });
          }
        } else if (res.statusCode == 409) {
          this.conformationPopup.openErrorModal(res.message);
          f.reset();
        } else {
          this.conformationPopup.openErrorModal(res.message);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.conformationPopup.openSuccessModal(
           'Trainee Offer Letter Generated Successfully');
       }
    });
  }
  //download document
  async downLoadDocument(EmpValue: any) {
    const data = this.traineeEmpData;
    console.log(data);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2']; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    // this.isLoading = true;

    for (const contentId of pdfContents) {
      const pdfContent = document.getElementById(contentId);
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        imagesData.push({ imgData, imgHeight });
      }
    }

    // Add all images to the PDF except for the last one
    for (let i = 0; i < imagesData.length - 1; i++) {
      const imageData = imagesData[i];
      pdf.addImage(
        imageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        imageData.imgHeight,
        '',
        'FAST'
      );
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }

    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(
        lastImageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        lastImageData.imgHeight,
        '',
        'FAST'
      );
    }
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_TraineeOfferLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, {
      type: 'application/pdf',
    });
    console.log(file);
    // this.uploadAddressLetter();
    this.generatedfile = file;
    this.generatingEmployeeId = EmpValue.empId;
    this.loading = false;
    this.conformationPopup.openSuccessModal('Trainee Offer Letter Generated Successfully');

    // });
    // }
  }
  //to store file to the azure and return to the url
  private traineeofferletterUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Trainee Offer Letter/${empId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.documentUrl = data.path;
            this.postTraineeOfferDetails(empId, data.path);
            //this.updateOfferDetails(data.path);
            console.log(data);
          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('file upload  is failed');
        },
      });
  }


  Status!: string;
  //to post OfferLetter Details to the offerletter table
  postTraineeOfferDetails(employeeId: number, docurl: string) {
    let loggedInUser = this.authService.getToken();

    let postTraineeOfferDetails = {
      employeeId: employeeId,
      offerSentDate: this.traineeEmpData.offerIssuedDate,
      offerSentStatus: 'Offer Generated',
      offerSentBy: loggedInUser.employeeId,
      documentUrl: docurl,
      isDeleted: false,
      status: 'Waiting For Approval',
      approvedDate: null,
      approvedBy: null,
      approver: null,
      comments: null,
      requestedDate: new Date(),
      offerExpiryDate: this.traineeEmpData.offerExpiryDate,
      authoritySignature: this.SignatureAuthorityValue.employeeId,
      addressType: this.addressType.toUpperCase(),
      note: this.traineeEmpData.note,
      offerStartDate: this.traineeEmpData.offerStartDate,
      trainingEndDate: this.traineeEmpData.endDate,
      durationOfTraining: this.traineeEmpData.durationOfTrainee,
    };
    this.subscription = this.http
      .postdata('TraineeOfferLetter', postTraineeOfferDetails)
      .subscribe({
        next: (data: any) => {
          this.emailToSendManager();
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  //function to updated the data
  updateTraineeOfferLetterFieldsDetails(f: NgForm) {
    const data = JSON.parse(JSON.stringify(this.traineeEmpData));
    this.loading = true;
    let sdata = {
      employeeId: this.traineeEmpData.empId,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      empstatus: 'Trainee Prospective',
      emptype: 'Trainee',
      title: data.title,
      emailaddress: data.personalEmail,
      gender: data.gender,
      contactnumber: parseInt(data.phoneNumber),
      mobilePhoneCountryCode: data.mobilePhoneCountryCode,
      fusionEmpId: data.fusionPlusEmpId,
      durationOfTrainee: data.durationOfTrainee,
      generateOffer: true,
      pf: data.pf,
      esic: data.esic,
      dob: this.employeeaddress.dob,
      bloodGroup: this.employeeaddress.bloodGroup,
      insurance: this.employeeaddress.insurance,
      dateOfJoining: data.dateOfJoining,
      substatus: 'Offer Letter Generated',
      password: this.employeeaddress.password,
      trainingEndDate: this.traineeEmpData.endDate
    };
    if (this.buttonValue == 'Regenerate Offer Letter' && this.employeeaddress.substatus != 'Offer Letter Rejected By Manager') {
      sdata.substatus = 'Offer Letter Regenerated'
    }
    else {
      sdata.substatus = 'Offer Letter Generated'
    }
    console.log(sdata);
    console.log(this.traineeEmpData.empId);
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', sdata)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.result = res;
          if (res.statusCode == 409) {
            this.conformationPopup.openErrorModal(res.message);
          } else if (res.statusCode == 200) {
            this.UpdateFieldsToRespectiveTables();
            this.downLoadDocument(this.traineeEmpData);
          } else if (res.statusCode == 1002) {
            const acceptfield = window.confirm(res.message);
            if (acceptfield) {
              this.updateEmployeeData(sdata)
            } else {
              f.resetForm();
            }
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
  JobtypeDetails = [] as IJobtype[];
  jobtypeId: any;
  //function to get jobtype data
  getJobtype() {
    this.subscription = this.http.getData("Jobtype").subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobtypeDetails = data as IJobtype[];
        let filteredData = this.JobtypeDetails.find((item: any) =>
          item?.jobType1?.toLowerCase() === 'trainee'
        )
        console.log(filteredData);
        this.jobtypeId = filteredData?.sno

      }
    })
  }
  //function to updated details to respective tables
  jobdetailsupdate!: any;
  UpdateFieldsToRespectiveTables() {
    let data = this.traineeEmpData;
    console.log(data);

    console.log(this.result);
    const jobdata = {
      id: data.jobId,
      employeeId: data.empId,
      effectiveDate: data.dateOfJoining,
      department: null,
      bussinessArea: null,
      locationid: data.locationId,
      sublocationid: data.sublocationId,
      jobRole: this.jobRoleDetails,
      status: 'Active',
      subdeptId: null,
      createddate: data.jobCreatedate,
      gradeId: data.gradeId,
      jobTypeId: this.jobtypeId,
      reportsto: data.reportingmanagerId
    };

    // console.log(jobdata);
    this.subscription = this.http
      .postdata('JobDetails/UPDATER', jobdata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // alert("JobDetails data successfully added")
        },
        error: (Reason) => console.log(Reason),
      });


    if (this.buttonValue == 'Regenerate Offer Letter') {
      this.regenerateUpdate();
    }
    else {
      this.generatepostingtorepectivefields()
    }
  }

  generatepostingtorepectivefields() {
    let data = this.traineeEmpData;
    console.log(data);
    const Compensationdata = {
      // id: data.compensationId,
      employeeId: data.empId,
      compeffectivedate: data.dateOfJoining,
      overtimeeligibility: null,
      reason: null,
      comments: null,
      frequency: null,
      paytype: null,
      compensationamount: parseInt(data.amount),
      status: 'Active',
      compensationcomments: null,
    };
    console.log(Compensationdata);

    const employmentdata = {
      //id: data.employemnttypeId,
      empid: data.empId,
      jobType: 'Trainee',
      empEffectiveDate: data.dateOfJoining,
      empComments: null,
      gradeId: null,
      isdeleted: 'Active',
    };
    this.subscription = this.http
      .postdata('Compensationdata', Compensationdata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          //alert("comp data successfully added")
        },
        error: (Reason) => console.log(Reason),
      });
    this.subscription = this.http
      .postdata('Employementtype', employmentdata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.disableFieldsForApproval = false;
          // alert("Employementtype coming successfully");
          // this.router.navigate(['/admin']);
        },
        error: (Reason) => console.log(Reason),
      });
  }
  regenerateUpdate() {
    let data = this.traineeEmpData;
    console.log(data);
    const Compensationdataupdate = {
      id: data.compensationId,
      employeeId: data.empId,
      compeffectivedate: data.dateOfJoining,
      overtimeeligibility: null,
      reason: null,
      comments: null,
      frequency: null,
      paytype: null,
      compensationamount: parseInt(data.amount),
      status: 'Active',
      compensationcomments: null,
    };
    console.log(Compensationdataupdate);

    const employmentdataupdate = {
      id: data.employemnttypeId,
      empid: data.empId,
      jobType: 'Contract',
      empEffectiveDate: data.dateOfJoining,
      empComments: null,
      gradeId: null,
      isdeleted: 'Active',
    };
    this.subscription = this.http
      .postdata('Compensationdata/UPDATER', Compensationdataupdate)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          //alert("comp data successfully added")
        },
        error: (Reason) => console.log(Reason),
      });
    this.subscription = this.http
      .postdata('Employementtype/UPDATER', employmentdataupdate)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.disableFieldsForApproval = false;
          // alert("Employementtype coming successfully");
          // this.router.navigate(['/admin']);
        },
        error: (Reason) => console.log(Reason),
      });

  }
  //function to send the email to employeee
  emailSendingforApprover() {
    if (this.traineeEmpData.isEmployeevalid === true) {
      this.traineeofferletterUpload(this.generatingEmployeeId, this.generatedfile);
    } else {
      this.traineeofferletterUpload(this.generatingEmployeeId, this.generatedfile);
    }
  }
  emailToSendManager() {
    this.loading = true;
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personName: `${this.traineeEmpData.firstName} ${this.traineeEmpData.middleName} ${this.traineeEmpData.lastName}`,
      personEmail: this.traineeEmpData.personalEmail,
      personRole: this.jobRoleDetails,
      employeeId: loggedInUser.employeeId,
      documentUrl: this.documentUrl,
      workLocation:

        this.traineeEmpData.jobLocationName + ', ' + this.traineeEmpData.jobSubLocationName,
      senderName: `${loggedInUser.firstName}  ${loggedInUser.middleName}  ${loggedInUser.lastName}`,

      senderEmail: loggedInUser.workEmail,
      approvedBy: null,
      approvedByName: null,
      firstName: null,
      middleName: null,
      lastName: null,
      comments: null,
      dateOfJoining: this.traineeEmpData.dateOfJoining,
    };
    if (loggedInUser.middleName) {

      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`

    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`

    }
    if (this.traineeEmpData.middleName) {

      emaildetails.personName = `${this.traineeEmpData.firstName} ${this.traineeEmpData.middleName} ${this.traineeEmpData.lastName}`

    } else {
      emaildetails.personName = `${this.traineeEmpData.firstName} ${this.traineeEmpData.lastName}`

    }
    console.log(emaildetails);

    this.subscription = this.http
      .postdata(`CustomEmail/offerManagerEmail`, emaildetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);

          this.Approvednotification();
          if (data) {
            this.openModal('Email Sent Successfully');
          }
          // this.toaster.success({
          //   detail: 'SUCCESS',
          //   summary: 'Email Sent Successfully',
          //   duration: 5000,
          // });
          this.loading = false;

        },
        error: (err: any) => {
          console.log(err);

          const modalElement = document.getElementById('successhide');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            this.Status = 'Email Sent Failed'

            setTimeout(function () {
              location.reload();
            }, 3000);

          }
          // this.toaster.warning({
          //   detail: 'SUCCESS',
          //   summary: 'Email Sent Failed',
          //   duration: 5000,
          // });
        },
        complete: () => { },
      });

    this.openModal('Email Sending.....');


    // this.toaster.success({
    //   detail: 'SUCCESS',
    //   summary: 'Email Sending.....',
    //   duration: 9000,
    // });
  }
  openModal(message: string) {
    const modalRef = this.modalService.open(this.successhide, { backdrop: 'static', keyboard: false, centered: true });
    this.Status = message;
    setTimeout(() => {
      modalRef.close();
    }, 4000); // Close after 5 seconds
  }
  //function for Manger to approve notification
  Approvednotification() {
    const currentDate = new Date();
    this.traineeEmpData;
    console.log(this.traineeEmpData.empid);

    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Offer Letter Approve Request`,
      sentTo: this.traineeEmpData.OffersentbyEmailaddress,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName} ${loggedInUser?.middleName ?? ''} ${loggedInUser.lastName}  requested you for the approval of the offer letter of employee
         ${this.traineeEmpData?.firstName} ${this.traineeEmpData?.middleName ?? ''} ${this.traineeEmpData?.lastName} Offer Letter`,
      empId: loggedInUser.employeeId,
    };
    this.subscription = this.http
      .postdata(`Notification/Notify/Manager`, senddata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 3000);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }


  updateEmployeeData(employeeData: any) {
    if (employeeData.substatus == 'Offer Letter Rejected By Manager') {
      employeeData.substatus = 'Offer Letter Generated'
      employeeData.generateOffer = false
      this.subscription = this.http
        .postdata('Employeedata/UPDATER', employeeData)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.result = res;
            if (res.statusCode == 409) {
              this.conformationPopup.openErrorModal(res.message);
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.traineeEmpData);
            } else if (res.statusCode == 1002) {
              const acceptfield = window.confirm(res.message);
              if (acceptfield) {
                this.UpdateFieldsToRespectiveTables();
                this.downLoadDocument(this.traineeEmpData);
              }
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    }
    else {
      employeeData.substatus = 'Offer Letter Regenerated',
        employeeData.generateOffer = false
      this.subscription = this.http
        .postdata('Employeedata/UPDATER', employeeData)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.result = res;
            if (res.statusCode == 409) {
              this.conformationPopup.openErrorModal(res.message);
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.traineeEmpData);
            } else if (res.statusCode == 1002) {
              const acceptfield = window.confirm(res.message);
              if (acceptfield) {
                this.UpdateFieldsToRespectiveTables();
                this.downLoadDocument(this.traineeEmpData);
              }
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    }


  }

  //toggledropdown to open and close the dropdown list
  toggleDropdown(dropcategory: any) {
    if (dropcategory == 'job') {
      this.isDropdownOpenjob = !this.isDropdownOpenjob;
      if (this.isDropdownOpenjob) {
      } else {
        this.filteredOptions = [];
      }
    } else if (dropcategory == 'empid') {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
      } else {
        this.filteredOptions = [];
      }
    } else if (dropcategory == 'authority') {
      this.isDropdownOpenauthority = !this.isDropdownOpenauthority;
      if (this.isDropdownOpen) {
      } else {
        this.filteredOptions = [];
      }
    }

  }
  //function to validate the offer expiry date and offer issued date
  updateEndDateValidity(): void {
    const offerExpiryDate = new Date(this.traineeEmpData.offerExpiryDate);
    const offerIssuedDate = new Date(this.traineeEmpData.offerIssuedDate);

    if (offerExpiryDate < offerIssuedDate) {
      this.isExpiryDateValid = false;
    } else {
      this.isExpiryDateValid = true;
    }

    // if (
    //   this.traineeEmpData.offerExpiryDate <
    //   this.traineeEmpData.offerIssuedDate
    // ) {
    //   this.isExpiryDateValid = false;
    // } else {
    //   this.isExpiryDateValid = true;
    // }
  }

  //function to validate the offer expected start date and offer issued date
  updateEndDateValidityForExpectedStartDate() {
    const dateOfJoining = new Date(this.traineeEmpData.dateOfJoining);
    const offerIssuedDate = new Date(this.traineeEmpData.offerIssuedDate);

    if (dateOfJoining <= offerIssuedDate) {
      this.isStartDateValid = false;
    } else {
      this.isStartDateValid = true;
    }

    // if (
    //   this.traineeEmpData.dateOfJoining <
    //   this.traineeEmpData.offerIssuedDate
    // ) {
    //   this.isStartDateValid = false;
    // } else {
    //   this.isStartDateValid = true;
    // }

  }
  //function to validate the offer expiry date and offer issued date and expected start date
  updateEndDateValidityupdate(): void {
    if (
      this.traineeEmpData.dateOfJoining >
      this.traineeEmpData.offerExpiryDate
    ) {
      this.isStartDateValidofexpected = false;
    } else {
      this.isStartDateValidofexpected = true;
    }

  }
  shouldShowError(): boolean {
    // Add your conditions here to determine whether to show the error message
    return false; // Return true or false based on your conditions
  }
  optionsFound!: boolean;
  updateOptionsFound(found: boolean) {
    this.optionsFound = found;
  }
  islistedItem: boolean = true;

  isItemIntheList(isitem: boolean) {
    console.log(isitem);
    this.islistedItem = isitem;
  }
  onOptionSelected(option: string, dropdownCategory: string) {
    this.islistedItem = true;
    this.optionsFound = true;
    if (dropdownCategory === 'mobilePhoneCountryCode') {
      this.traineeEmpData.mobilePhoneCountryCode = option
    }
  }

  numbers(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

 
  onclickSelectAddress(Value: any) {
    console.log(Value);
    this.addresFlag= true;
    this.addressType = Value.value;
    console.log(this.addressType);

    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find(
        (address: IAddress) => address?.type.toLowerCase() == Value?.value?.toLowerCase())

    }
    console.log(this.address);
    this.traineeEmpData.addressLine1 = this.address.addressLine1
    this.traineeEmpData.addressLine2 = this.address.addressLine2
    this.traineeEmpData.city = this.address.city
    this.traineeEmpData.state = this.address.state
    this.traineeEmpData.country = this.address.country
    this.traineeEmpData.pinCode = this.address.zipCode
    this.employeeForm?.patchValue({
      addressLine1: this.address.addressLine1,
      addressLine2: this.address.addressLine2,
      city: this.address.city,
      state: this.address.state,
      country: this.address.country,
      pinCode: this.address.zipCode,
    })

  }
  //onclick function to select the designation in the search dropdown
  Onclick(jobdValues: any) {
    this.jobRoleDetails = jobdValues;
    console.log(this.jobRoleDetails);
    if (this.jobRoleDetails == "") {
      this.disablebuttonfordesignation = true
    }
    else {
      this.disablebuttonfordesignation = false
    }
    let jobInfo = this.JobroleDetails.find((c) => c.jobRole1 == jobdValues);
    console.log(jobInfo);
    if (jobInfo) {
      const jobRole1Value = jobInfo.jobRole1;
      if (jobRole1Value === jobdValues) {
        this.disablebuttonfordesignation = true
      }
      else {
        this.disablebuttonfordesignation = false
      }
    }
    this.jobDesignation = JSON.parse(JSON.stringify(this.jobRoleDetails));
    if (jobInfo == undefined) {
      this.jobDesignation = null;
    }

  }

  trainingempadress: any
  getTraineeEmployeeAddress(Value: any) {
    let EmployeeId = Value
    console.log(Value);

    console.log(EmployeeId);

    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {

        this.employeeaddress = data as IAddress[];

        this.trainingempadress = data.employeeAddresses[0];

        console.log(this.trainingempadress);

        console.log(this.employeeaddress.password);
        if (this.employeeaddress.substatus == 'Documents Verified') {
          this.buttonValue = 'Generate Offer Letter';
        }
        else if (this.employeeaddress.substatus == 'Offer Letter Rejected' || this.employeeaddress.substatus == 'Offer Letter Accepted' || this.employeeaddress.substatus == 'Offer Letter Rejected By Manager') {
          this.buttonValue = 'Regenerate Offer Letter';
        }
        console.log(this.buttonValue);

      }

    })
  }



  filteredEmployeedetails = this.employeedetails;
  filteredEmployeesemp(event: any) {
    let filterValue = '';

    // Check if event.target is not null and is of type HTMLInputElement
    if (event && event.target && event.target.value) {
      filterValue = event.target.value.toLowerCase();
    }

    this.filteredEmployeedetails = this.employeedetails.filter((emp: { firstName: string; lastName: string; fusionEmpId: { toString: () => string | string[]; }; }) =>
      (emp.firstName && emp.firstName.toLowerCase().includes(filterValue)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(filterValue)) ||
      (emp.fusionEmpId && emp.fusionEmpId.toString().includes(filterValue))
    );

    // Log the filtered results
    console.log(this.filteredEmployeedetails);
  }


  toggleDropdownemp() {
    this.showDropdown = !this.showDropdown;
    // If the dropdown is opened, display the full list of employees
    if (this.showDropdown) {
      this.filteredEmployeedetails = this.employeedetails;
    }
  }

  selectEmployeeemp(emp: any) {
    console.log(emp);

    this.selectedEmployee = ` ${emp.fusionEmpId ?? ''} ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`;
    this.traineeEmpData.reportingmanager = emp; // Store the selected employee object
    this.showDropdown = false;
    this.traineeEmpData.reportingmanager = emp.employeeId;
    // Log the selected option
    console.log('Selected option:', this.selectedEmployee);
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  onclickDocumentType(Value: any) {
    console.log(Value);
    this.traineeEmpData.documentType = Value.value
    console.log(this.traineeEmpData.documentType);
  }

  onclickSignature(Value: any) {
    console.log(Value);
    this.traineeEmpData.documentType = Value.value
    console.log(this.traineeEmpData.documentType);
  }

  onDataClick(value: any) {
    this.traineeEmpData.offerSentDate = value;
    console.log(this.traineeEmpData.offerSentDate);
  }
 onExpecteddate() {
  this.traineeEmpData.offerStartDate = this.traineeEmpData.dateOfJoining
  console.log(this.traineeEmpData.offerStartDate);
 }
 onClickIntenship(Value: any) {
    this.traineeEmpData.internshipperiod = Value;
 }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
