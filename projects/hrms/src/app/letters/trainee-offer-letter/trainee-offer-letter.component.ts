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
  searchTerm: string = '';
  filteredEmployees: any[] = [];
  showDropdown = false;
  selectedEmployee: string = '';
  Drop: IEmployee[] = [];
  employeeSelected: boolean = false;
  selectedEmployees: number[] = [];
  serveDetails = [] as IServe[];
  servingPeriodDuration: number | undefined;
  getAllEmployeeInfo = [] as any;
  employeeForm!: FormGroup;
  addresFlag = false;
  address = {} as IAddress;
  countryvalues = {} as any;
  selectedCountryConfig = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true
  };
  phoneNumber: string = '';
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
  
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  constructor(
    private http: HttpService,
    config: NgbModalConfig, private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.initializeForm();
  }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.traineeEmpData.mobilePhoneCountryCode = 'India (+91)';
    console.log(this.traineeEmpData.mobilePhoneCountryCode);
    this.traineeEmpData.title = null;
    console.log(this.Employeeinfo);
    this.initializeForm();
    this.getservingperiod();
    this.getJobtype();
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

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      personalEmail: [{ value: null, disabled: true }],
      title: [{ value: null, disabled: true }],
      firstName: [{ value: null, disabled: true }],
      middleName: [{ value: null, disabled: true }],
      lastName: [{ value: null, disabled: true }],
      gender: [{ value: null, disabled: true }],
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
      locationId: [{ value: null, disabled: true }],
      JobSubLocationName: [{ value: null, disabled: true }],
      offerSentDate: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
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

  onDateOfJoiningChange() {
    this.calculateEndDate(this.traineeEmpData.internshipperiod);
  }

  calculateEndDate(value: any) {
    if (this.traineeEmpData.dateOfJoining && value) {
      const startDate = new Date(this.traineeEmpData.dateOfJoining);
      const months = parseInt(value.value, 10);
      console.log(months)
      const days = this.getDaysFromMonths(months);
      console.log(days)
      if (days > 0) {
        this.traineeEmpData.durationOfTrainee = days;
      }
      const endDate = new Date(startDate.setMonth(startDate.getMonth() + months));
      this.traineeEmpData.endDate = moment(endDate).format('YYYY-MM-DD') // Format as YYYY-MM-DD
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
          this.employeeiddetails = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
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
    if (this.traineeEmpData.isEmployeevalid === true) {
      this.updateTraineeOfferLetterFieldsDetails(f.value); //existing emp  offer lettr
    } else {
      this.postTraineeOfferLetterFieldsDetails(f); //new offer lettr
    }

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
  onclickDesignations(data: any) {
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
  formatDate(date: any) {
    return date?.split('T')[0];
  }
  //function to patch the values in the form to the template
  // pathValuesFuction() {
  //   const formValues = this.employeeForm.value;
  //   console.log(formValues);
  //   this.traineeEmpData = {
  //     personalEmail: formValues.personalEmail,
  //     title: formValues.title,
  //     firstName: formValues.firstName,
  //     middleName: formValues.middleName,
  //     lastName: formValues.lastName,
  //     gender: formValues.gender,
  //     jobRole: formValues.jobRoleDetails,
  //     esic: formValues.esic,
  //     pf: formValues.pf,
  //     amount: formValues.amount,
  //     isVariablePay: formValues.isVariablePay,
  //     variablePayAmount: formValues.variablePayAmount,
  //     locationId: formValues.locationId,
  //     sublocationId: formValues.JobSubLocationName,
  //     offerIssuedDate: formValues.offerIssuedDate,
  //     dateOfJoining: formValues.dateOfJoining,
  //     copys: formValues.Copys,
  //     trainingEndDate: this.traineeEmpData.endDate,
  //     note: formValues.note,
  //     authorityid: formValues.authorityid,
  //   };
  // }

  patchForm(data:any){
    this.employeeForm?.patchValue({
       personalEmail:data.personalEmail,
       title:this.titleDetails.find((x: any) => x.titlename === data.title),
       firstName:data?.firstName,
       middleName:data?.middleName,
       lastName:data?.lastName,
       gender:this.genderDetails.find((x:any) => x.genderName === data.gender),
       SelectDropDown: null,
       jobRoleDetails: this.JobroleDetails.find((x:any) => x.jobRole1 === data.jobRole),
       esic: data?.esic,
       pf: data?.pf,
       amount:data?.amount,
       isVariablePay: data?.isVariablePay,
       variablePayAmount:data?.variablePayAmount,
       locationId: this.LocationDropDownData.find((x:any) => x.jobLocationName === data?.workLocation),
       JobSubLocationName: data?.sublocationId,
       offerIssuedDate:this.formatDate(data?.offerIssuedDate),
       dateOfJoining: this.formatDate(data?.dateOfJoining),
       Copys: data?.copys,
       trainingEndDate:this.formatDate(data.endDate),
       note:data?.note,
       authorityid: data?.authorityid,
       phoneNumber: data?.phoneNumber,
     })
  }


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
                this.patchForm(this.traineeEmpData);
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
                this.traineeEmpData.jobLocationName =
                  data.checkofferletter.workLocation;
                this.traineeEmpData.jobSubLocationName =
                  data.checkofferletter.subLocation;
                console.log(this.traineeEmpData.jobLocationName);
                console.log(this.traineeEmpData.jobSubLocationName);
                console.log(this.traineeEmpData.locationId);
                
                this.getSubLocationByid(this.traineeEmpData.locationId);
                // this.ctcCalculation();
                this.OnClickLocation(this.traineeEmpData.locationId);
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

  isDataPopulated(){
    this.traineeEmpData.offerIssuedDate = this.employeeForm.get('offerSentDate')?.value;
    console.log(this.traineeEmpData.offerIssuedDate);
    
    

  }

  isDataPopulated1(){
    this.traineeEmpData.internshipperiod = this.employeeForm.get('internshipperiod')?.value.value;
    console.log(this.traineeEmpData.internshipperiod);
    

  }
  //function to get sublocation by id
  getSubLocationByid(id: any) {
    this.subscription = this.http
      .getData(
        `JobLocation/sub-location-by-joblocation/${id} `
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
  OnClickLocation(id: any) {
    this.getSubLocationByid(id);
  }

  onclickCTC(Value: any) {
    console.log(Value);
    this.traineeEmpData.amount = Value;
    // this.ctcCalculation();
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
      gender: data.gender,
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
      trainingEndDate: this.traineeEmpData.endDate,
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
    this.generatedfile = file;
    this.generatingEmployeeId = EmpValue.empId;
    this.loading = false;
    this.conformationPopup.openSuccessModal('Trainee Offer Letter Generated Successfully');

  
  }
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
      offerSentDate: this.employeeForm.get('offerSentDate')?.value,
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
      offerExpiryDate: this.employeeForm.get('offerExpiryDate')?.value,
      authoritySignature: this.employeeForm.get('authorityid')?.value.employeeId,
      addressType: this.addressType,
      note: this.employeeForm.get('note')?.value,
      offerStartDate: this.employeeForm.get('dateOfJoining')?.value,
      trainingEndDate: this.traineeEmpData.trainingEndDate,
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

          //this.Approvednotification();
          if (data) {
            this.conformationPopup.openSuccessModal('Email sent successfully');
          }
          this.loading = false;

        },
        error: (err: any) => {
          console.log(err);

          this.conformationPopup.openErrorModal('Email sent failed');
          this.loading = false;
        },
        complete: () => { },
      });
  }

  //function for Manger to approve notification
  // Approvednotification() {
  //   const currentDate = new Date();
  //   this.traineeEmpData;
  //   console.log(this.traineeEmpData.empid);

  //   let loggedInUser = this.authService.getToken();
  //   let senddata = {
  //     message: `Offer Letter Approve Request`,
  //     sentTo: this.traineeEmpData.OffersentbyEmailaddress,
  //     isRead: false,
  //     isDelete: false,
  //     notificationDate: currentDate,
  //     notificationType: `${loggedInUser?.firstName} ${loggedInUser?.middleName ?? ''} ${loggedInUser.lastName}  requested you for the approval of the offer letter of employee
  //        ${this.traineeEmpData?.firstName} ${this.traineeEmpData?.middleName ?? ''} ${this.traineeEmpData?.lastName} Offer Letter`,
  //     empId: loggedInUser.employeeId,
  //   };
  //   this.subscription = this.http
  //     .postdata(`Notification/Notify/Manager`, senddata)
  //     .subscribe({
  //       next: (data: any) => {
  //         console.log(data);
  //         this.loading = false;

  //         setTimeout(() => {
  //           this.router.navigate(['/admin']);
  //         }, 3000);
  //       },
  //       error: (err: any) => {
  //         console.log(err);
  //       },
  //     });
  // }


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
  }
  
  
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
    
    return false; 
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


  onclickSelectAddress(Value: any) {
    console.log(Value);
    this.addresFlag = true;
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

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  onclickDocumentType(Value: any) {
    console.log(Value);
    this.traineeEmpData.documentType = Value.value
    console.log(this.traineeEmpData.documentType);
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
