import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Select } from 'primeng/select';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { CountryCodePhoneNumberComponent } from "../../shared/country-code-phone-number/country-code-phone-number.component";
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../pipes/dateformat.pipe";

import { Subscription } from 'rxjs';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { IAddress, IAuthority, ICountry, IemployeeDetails, IGender, IJobtype, IRole, ITitle } from '../../Interfaces/letters-model';

@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule, LettersTabComponent, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule, DateformatPipe],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.scss',
})

export class OfferLetterComponent {
  max = "{{ new Date().toISOString().split('T')[0] }}";
  currentDate: Date = new Date();
  isIssuedDateValid: boolean = true;
  isExpiryDateValid: boolean = true;
  isStartDateValid: boolean = true;
  isStartDateValidofexpected: boolean = true;
  prospectiveEmpData = {} as any; //offer letter form object
  offerLetterTemplate: any | string | ArrayBuffer | null = null; //offer letter template
  docDefinition: any; //for doc to PDF conversion
  result = {} as any;
  titleDetails = [] as ITitle[];
  genderDetails = [] as IGender[];
  countryDetails = [] as ICountry[];
  JobroleDetails = [] as IRole[];
  emailgeneration = {} as any;
  subscription!: Subscription;
  employeedata = [] as any;
  Employeeinfo = [] as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenjob: boolean = false;
  isDropdownOpenauthority: boolean = false;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  isDisabledemployeeid!: boolean;
  isDropdownemployeeidOpen: boolean = false;
  showemployeeidDropdown: boolean = false;
  filteredOptions = [] as any;
  jobRoleDetails: any;
  jobDesignation!: string | null;
  pf: any;
  address = {} as IAddress;
  addresFlag= false;
  disableFields: boolean = true; //variable to disable the fields
  disableFieldsForApproval: boolean = true; //variable to disable the fields for approval
  generatedfile = {} as any; //variable to store generated file
  documentUrl = {} as any; //variable to store docurl path
  fusionEmpId: any;
  generatingEmployeeId:any;
  employeeiddetails = [] as any;
  employeeaddress = [] as any;
  permanentAddress = {} as IAddress;
  currentAddress = {} as IAddress;
  authorityDetails = [] as any;
  buttonValue: string = 'Generate Offer Letter'; //variable to change the button value
  SelectDropDown: any;
  loading: boolean = false;
  LocationDropDownData = [] as any;
  Locationdata = {} as any;
  subLocationsDropdown = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null;
  authorityDesignation!: string | null;
  disablebuttonfordesignation: boolean = true; //variable to disable the fields
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  addressType: any;
  SignatureAuthorityValue: any;
  isSearchFeatureDisabled: boolean = true;
  isofferlettergenerated: boolean = true;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Status: any;
  countryvalues = {} as any;
  selectedCountryConfig = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true
  };
  phoneNumber: string = '';
  employeeForm!: FormGroup;
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  // employeementType = [{ name: 'Permanent' }, { name: 'Contract' }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];

  selectedEmployee: any;
  @ViewChild('success') success: any;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  constructor(private router: Router, private modalService: NgbModal, private fb: FormBuilder,private http: HttpService,
    private httpclient: HttpClient,
    private authService: AuthService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig,
   ) { }

  ngOnInit(): void {
   
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.prospectiveEmpData.mobilePhoneCountryCode = 'India (+91)';
    console.log(this.prospectiveEmpData.mobilePhoneCountryCode);
    this.prospectiveEmpData.title = null;
    // this.prospectiveEmpData.country = 'India';
    console.log(this.Employeeinfo);
    this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
      ...emp,
      fullName: `${emp.firstName} ${emp.middleName} ${emp.lastName}`, // Concatenate firstName, middleName, lastName
    }));
    this.authorityDetails = this.authorityDetails.map((authority: IAuthority) => ({
      ...authority,
      fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim(), // Concatenate and remove excess spaces
    }));
    this.initializeForm();
    this.getJobtype();
    this.getOfferTemplate();
    this.getTitle();
    this.getgender();
    this.getCountry();
    this.getJobrole();
    this.getEmployeeId();
    this.getAllWorkLocation();
    this.getAuthorityDetails();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      title: [null, Validators.required],
      firstName: ['', Validators.required,Validators.minLength(3)],
      middleName: [''],
      lastName: ['', Validators.required,Validators.minLength(3)],
      gender: [null, Validators.required],
      SelectDropDown: [null, Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pinCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      jobRoleDetails: ['', Validators.required],
      esic: [null, Validators.required],
      pf: [null, Validators.required],
      amount: ['', Validators.required],
      isVariablePay: [null, Validators.required],
      variablePayAmount: ['', Validators.required],
      locationId: [null, Validators.required],
      sublocationId: [null, Validators.required],
      offerIssuedDate: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      Copys: [null, Validators.required],
      offerExpiryDate: ['', Validators.required],
      note: [''],
      authorityid: [null, Validators.required]
    });
  }

  handlePhoneChange(event: any) {
    this.employeeForm.patchValue({
      phoneNumber: event
    });
  }

  requestForApproval() {
    if (this.employeeForm.valid) {
      console.log('Request for approval:', this.employeeForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  //download document
  async downLoadDocument(EmpValue: any) {
    const data = this.prospectiveEmpData;
    console.log(data);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1'];
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
      pdf.addImage(imageData.imgData, 'PNG', 0, 0, imgWidth, imageData.imgHeight, '', 'FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData, 'PNG', 0, 0, imgWidth, lastImageData.imgHeight, '', 'FAST');
    }
    const fileName = `OfferLetter.pdf`;
    pdf.save(fileName);
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  dataFailureMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.errorhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }
  //function to validate the offer expiry date and offer issued date
  updateEndDateValidity(): void {
    const offerExpiryDate = new Date(this.prospectiveEmpData.offerExpiryDate);
    const offerIssuedDate = new Date(this.prospectiveEmpData.offerIssuedDate);

    if (offerExpiryDate <= offerIssuedDate) {
      this.isExpiryDateValid = false;
    } else {
      this.isExpiryDateValid = true;
    }

    // if (
    //   this.prospectiveEmpData.offerExpiryDate <
    //   this.prospectiveEmpData.offerIssuedDate
    // ) {
    //   this.isExpiryDateValid = false;
    // } else {
    //   this.isExpiryDateValid = true;
    // }
  }
  //function to validate the offer expected start date and offer issued date
  updateEndDateValidityForExpectedStartDate() {
    if (this.employeeaddress.empstatus != 'Trainee Active') {
      const dateOfJoining = new Date(this.prospectiveEmpData.dateOfJoining);
      const offerIssuedDate = new Date(this.prospectiveEmpData.offerIssuedDate);

      if (dateOfJoining <= offerIssuedDate) {
        this.isStartDateValid = false;
      } else {
        this.isStartDateValid = true;
      }

      // if ( this.prospectiveEmpData.dateOfJoining <this.prospectiveEmpData.offerIssuedDate ) {
      //   this.isStartDateValid = false;
      // } else {
      //   this.isStartDateValid = true;
      // }
    }
  }
  //function to validate the offer expiry date and offer issued date and expected start date
  updateEndDateValidityupdate(): void {
    const dateOfJoining = new Date(this.prospectiveEmpData.dateOfJoining);
    const offerExpiryDate = new Date(this.prospectiveEmpData.offerExpiryDate);

    if (dateOfJoining <= offerExpiryDate) {
      this.isStartDateValidofexpected = false;
    } else {
      this.isStartDateValidofexpected = true;
    }

    // if (
    //   this.prospectiveEmpData.dateOfJoining >
    //   this.prospectiveEmpData.offerExpiryDate
    // ) {
    //   this.isStartDateValidofexpected = false;
    // } else {
    //   this.isStartDateValidofexpected = true;
    // }
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

  //get employee ids for Prospective Employees Drop Dowm
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/GetProspectiveAndVerified')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          //this.employeeiddetails = data as IemployeeDetails[];
          this.employeeiddetails = data.map((employee: any) => {
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
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value;
    console.log(Value);

    console.log(EmployeeId);

    this.subscription = this.http
      .getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeaddress = data as IAddress[];
          console.log(this.employeeaddress.password);
          if (
            this.employeeaddress.substatus == 'Documents Verified' ||
            this.employeeaddress.substatus == 'Trainee Onboarded'
          ) {
            this.buttonValue = 'Generate Offer Letter';
          } else if (
            this.employeeaddress.substatus == 'Offer Letter Rejected' ||
            this.employeeaddress.substatus == 'Offer Letter Accepted' ||
            this.employeeaddress.substatus == 'Offer Letter Rejected By Manager'
          ) {
            this.buttonValue = 'Regenerate Offer Letter';
          }
          console.log(this.buttonValue);
        },
      });
  }

  onclickSelectAddress(Value:any){
    console.log(Value);
    this.addresFlag= true;
    this.addressType=Value
    console.log(this.addressType);

    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find(
        (address: IAddress) => address.type.toLowerCase() == Value
      );
    }
    console.log(this.address);
    this.prospectiveEmpData.addressLine1 = this.address.addressLine1;
    this.prospectiveEmpData.addressLine2 = this.address.addressLine2;
    this.prospectiveEmpData.city = this.address.city;
    this.prospectiveEmpData.state = this.address.state;
    this.prospectiveEmpData.country = this.address.country;
    this.prospectiveEmpData.pinCode = this.address.zipCode;
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
    let locationName = this.prospectiveEmpData.jobLocationName;
    console.log(locationName);
    let jobSubLocationDetails = this.LocationDropDownData.find(
      (c: any) => c.jobLocationName === locationName
    );
    console.log(this.LocationDropDownData);

    console.log(jobSubLocationDetails);
    this.getSubLocationByid(jobSubLocationDetails);
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
  //hostlister to close the dropdown when we Click out side the box
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: any) {
    const dropdownToggle =
      this.elementRef.nativeElement.querySelector('.dropdown-toggles');
    const dropdownMenu =
      this.elementRef.nativeElement.querySelector('.dropdown-menu');
    const dropdownTogglejob = this.elementRef.nativeElement.querySelector(
      '.dropdown-togglesjob'
    );

    if (
      dropdownToggle &&
      !dropdownToggle.contains(target) &&
      dropdownMenu &&
      !dropdownMenu.contains(target)
    ) {
      this.isDropdownOpen = false;
      this.filteredOptions = [];
    } else if (
      dropdownTogglejob &&
      !dropdownTogglejob.contains(target) &&
      dropdownMenu &&
      !dropdownMenu.contains(target)
    ) {
      this.isDropdownOpenjob = false;
      this.filteredOptions = [];
    }
  }
  //onclick function to select the designation in the search dropdown
  Onclick(jobdValues: any) {
    this.jobRoleDetails = jobdValues;
    console.log(this.jobRoleDetails);
    if (this.jobRoleDetails == '') {
      this.disablebuttonfordesignation = true;
    } else {
      this.disablebuttonfordesignation = false;
    }
    let jobInfo = this.JobroleDetails.find((c) => c.jobRole1 == jobdValues);
    console.log(jobInfo);
    if (jobInfo) {
      const jobRole1Value = jobInfo.jobRole1;
      if (jobRole1Value === jobdValues) {
        this.disablebuttonfordesignation = true;
      } else {
        this.disablebuttonfordesignation = false;
      }
    }
    // else {
    //   console.log('Job role not found.');

    // }

    this.jobDesignation = JSON.parse(JSON.stringify(this.jobRoleDetails));
    if (jobInfo == undefined) {
      this.jobDesignation = null;
      // this.disablebuttonfordesignation=false
    }
  }

  onclickDesignation() {
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == this.prospectiveEmpData.authorityid
    );
    console.log(signatureAuthorityDetails);
    this.SignatureAuthorityValue = signatureAuthorityDetails;
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.prospectiveEmpData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.prospectiveEmpData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    } else if (
      signatureAuthorityDetails == undefined ||
      signatureAuthorityDetails == null
    ) {
      this.prospectiveEmpData.authorityName = '';
      this.authorityDesignation = '';
    }
  }

  validatePaste(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault(); // Cancel the paste event if the data is not numeric
    }
  }

  //get offer letter Authority list
  getAuthorityDetails() {
    let offertype = 'Offer Letter';
    
    this.subscription = this.http
      .getData(`SignaturesList?LetterType=${offertype}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.authorityDetails = data;
        },
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

  //to get offer letter template
  async getOfferTemplate() {
    this.offerLetterTemplate = await this.httpclient
      .get('assets/offer.docx', {
        responseType: 'arraybuffer',
      })
      .toPromise();
  }
  //coverting date time to the date formate
  formatDateForOfferIssedandExpiry(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  //checking function if it is new or existing
  onClickOfferCreate(checkValue: any) {
    if (checkValue === 'New') {
      this.disableFields = true;
      this.buttonValue = 'Generate Offer Letter';
      if (
        this.prospectiveEmpData.personalEmail != null ||
        this.jobRoleDetails != null ||
        this.prospectiveEmpData.title
      ) {
        window.location.reload();
      }
    } else if (checkValue === 'Existing') {
      this.disableFields = false;
      this.buttonValue = 'Regenerate Offer Letter';
      if (
        this.prospectiveEmpData.personalEmail != null ||
        this.jobRoleDetails != null ||
        this.prospectiveEmpData.title
      ) {
        window.location.reload();
      }
    } else {
      this.buttonValue = 'Generate Offer Letter';
    }
  }
  //function to reset the feilds
  resetInputFields() {
    this.prospectiveEmpData.personalEmail = '';
    this.prospectiveEmpData = {};
    this.jobRoleDetails = '';
    this.buttonValue = 'Generate Offer Letter';
    this.fusionEmpId = null;
    this.prospectiveEmpData.title = null;
  }
  onclickcheckempidnull(empidValue: any) {
    if (empidValue == '') {
      this.disablebuttonforemployeeid = true;
      this.isDropdownOpen = false;
    } else {
      this.disablebuttonforemployeeid = false;
      //this.isDropdownOpen=false;
    }
    this.fusionEmpId = empidValue;
    if (this.fusionEmpId) {
      this.onClickValidation(this.fusionEmpId);
    } else {
      this.resetInputFields();
    }
  }
  //to validate the email
  isValidEmail(email: string): boolean {
    // Here you can implement your email validation logic
    // For example, a simple check for presence of "@" and "."
    return email.includes('@') && email.includes('.com');
  }

  //employeeid validation to check we have the mail already exist or not
  onClickValidation(Empidvalue: any) {
    if (Empidvalue) {
      this.fusionEmpId = Empidvalue;
      this.subscription = this.http
        .getData(
          `OfferLetter/getEmployeeByEmailAddressAndStatus?EmpId=${Empidvalue}`
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
                this.prospectiveEmpData = data.checkofferletter;
                this.getEmployeeAddress(data.checkofferletter.empId);
                this.prospectiveEmpData.CreateOffer =
                  this.prospectiveEmpData.CreateOffer;
                if (this.prospectiveEmpData.offerIssuedDate) {
                  this.prospectiveEmpData.offerIssuedDate =
                    this.formatDateForOfferIssedandExpiry(
                      this.prospectiveEmpData.offerIssuedDate
                    );
                  console.log(this.prospectiveEmpData.offerIssuedDate);
                }
                if (this.prospectiveEmpData.offerExpiryDate) {
                  this.prospectiveEmpData.offerExpiryDate =
                    this.formatDateForOfferIssedandExpiry(
                      this.prospectiveEmpData.offerExpiryDate
                    );
                  console.log(this.prospectiveEmpData.offerExpiryDate);
                }
                if (this.prospectiveEmpData.dateOfJoining) {
                  this.prospectiveEmpData.dateOfJoining =
                    this.formatDateForOfferIssedandExpiry(
                      this.prospectiveEmpData.dateOfJoining
                    );
                  console.log(this.prospectiveEmpData.dateOfJoining);
                }
                if (!this.prospectiveEmpData.mobilePhoneCountryCode) {
                  this.prospectiveEmpData.mobilePhoneCountryCode =
                    'India (+91)';
                  console.log(this.prospectiveEmpData.mobilePhoneCountryCode);
                }
                if (!this.prospectiveEmpData.country) {
                  this.prospectiveEmpData.country = 'India';
                }
                this.jobDesignation = this.prospectiveEmpData.jobRole;
                this.jobRoleDetails = this.prospectiveEmpData.jobRole;

                this.prospectiveEmpData.isEmployeevalid = data.isEmployeevalid;
                console.log(this.prospectiveEmpData);

                console.log(this.buttonValue);

                if (this.prospectiveEmpData.approver) {
                  this.prospectiveEmpData.reportingmanagerId =
                    this.prospectiveEmpData.approver;
                }
                if (this.prospectiveEmpData.signatureAuthority) {
                  this.prospectiveEmpData.authorityid =
                    this.prospectiveEmpData.signatureAuthority;
                  this.onclickDesignation();
                }
                // if (this.prospectiveEmpData.mobilePhoneCountryCode) {
                //   this.countryvalues = this.countryCodes.find(
                //     (c: any) =>
                //       c.countryCodeId ==
                //       this.prospectiveEmpData.mobilePhoneCountryCode
                //   );
                //   this.prospectiveEmpData.mobilePhoneCountryCodewithname =
                //     this.countryvalues.countryName;
                // }
                // this.buttonValue = 'Regenerate Offer Letter';
                this.prospectiveEmpData.jobLocationName =
                  data.checkofferletter.workLocation;
                this.prospectiveEmpData.jobSubLocationName =
                  data.checkofferletter.subLocation;
                console.log(this.prospectiveEmpData.jobLocationName);
                console.log(this.prospectiveEmpData.jobSubLocationName);
                this.ctcCalculation();
                this.OnClickLocation();
                this.disablebuttonforemployeeid = true;
              }
            }
            else {
              this.disableFields = false; // disable fields
            }
          },
        });
    }

    //  else if(this.fusionEmpId===null){
    //   this.resetInputFields();
    //  }
  }
  //Function to generate offer letter
  onOfferLetterFormSubmitForGenerateDoc(f: FormGroup) {
    console.log(f);
    //const data =  this.prospectiveEmpData;
    if (this.prospectiveEmpData.isEmployeevalid === true) {
      this.updateOfferLetterFieldsDetails(f.value); //existing emp  offer lettr
    } else {
      this.postOfferLetterFieldsDetails(f.value); //new offer lettr
    }
  }

  //ctc Calculation in offer letter
  esicshouldbecometrue!: any;
  ctcCalculation() {
    console.log(this.prospectiveEmpData.amount);
    //CTC calculation stated
    let Employee = this.prospectiveEmpData;
    Employee.grossby = 12;
    Employee.grossSalary = Math.round(
      this.prospectiveEmpData.amount / Employee.grossby
    );
    console.log(Employee.grossby);
    console.log(Employee.grossSalary);

    //Calculation condition for pf contribution of an employee]
    console.log(this.prospectiveEmpData.pf);
    if (
      this.prospectiveEmpData.pf == true ||
      this.prospectiveEmpData.pf == false
    ) {
      switch (this.prospectiveEmpData.pf) {
        case true:
          if (this.prospectiveEmpData.esic == false) {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.719 / 100)
            );

            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);
          } else if (Employee.grossSalary >= 23195) {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.717 / 100)
            );

            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);
          } else if (Employee.grossSalary <= 23194) {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.519 / 100)
            );
            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
            console.log(Employee.pfContribution);
          } else {
            if (Employee.grossSalary <= 15000) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.519 / 100)
              );
              console.log(Employee.pfContribution);
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
              console.log(Employee.pfContribution);
            } else if (Employee.grossSalary <= 23194) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.519 / 100)
              );
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
              console.log(Employee.pfContribution);
            } else if (Employee.grossSalary >= 23195) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.717 / 100)
              );

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
    } else {
      Employee.pfContribution = 0;
    }
    //==============================================================================================================================
    //Calculation conditions for esic contribution of an employeer
    console.log(this.prospectiveEmpData.esic);
    if (this.prospectiveEmpData.esic.toString() == 'true') {
      let condition1 = Employee.grossSalary >= 23195;
      if (!condition1) {
        Employee.esicContribution = Math.round(
          Employee.grossSalary * (2.94 / 100)
        );
        console.log(Employee.esicContribution);
        this.prospectiveEmpData.esic = true;
      } else {
        Employee.esicContribution = 0;
        this.prospectiveEmpData.esic = false;

        console.log(Employee.esicContribution);
      }
    } else {
      Employee.esicContribution = 0;

      const Input = document.getElementById('esic') as HTMLInputElement;

      if (Input) {
        Input.value = 'false';
      }
      console.log(Employee.esicContribution);
    }

    //===================================================================================================================================

    //==============================================================================================================================
    //Calculation conditions for totalgrosssalary of an employee
    Employee.totalGrossSalary = Math.round(
      Employee.grossSalary - Employee.pfContribution - Employee.esicContribution
    );

    console.log(Employee.totalGrossSalary);
    //===============================================================================================================================
    //Calculation conditions for pt contrubution of an employee
    if (Employee.totalGrossSalary <= 15000) {
      Employee.professionalTax = 0;
      this.prospectiveEmpData.pt = false;
      console.log(Employee.professionalTax);
    } else if (
      Employee.totalGrossSalary >= 15001 &&
      Employee.totalGrossSalary <= 20000
    ) {
      Employee.professionalTax = 150;
      this.prospectiveEmpData.pt = true;
      console.log(Employee.professionalTax);
    } else if (Employee.totalGrossSalary >= 20001) {
      Employee.professionalTax = 200;
      console.log(Employee.professionalTax);
      this.prospectiveEmpData.pt = true;
    } else {
      Employee.professionalTax = 0;
      this.prospectiveEmpData.pt = false;
      console.log(Employee.professionalTax);
    }
    //==============================================================================================================================
    //Calculation conditions for esic contrubution of an employee
    if (this.prospectiveEmpData.esic == true) {
      if (Employee.totalGrossSalary <= 21000) {
        Employee.employeeEsi = Math.round(
          Employee.totalGrossSalary * (0.75 / 100)
        );
        console.log(Employee.employeeEsi);
        this.prospectiveEmpData.esic = true;
      } else {
        Employee.employeeEsi = 0;
        if (this.prospectiveEmpData.pf === undefined) {
          this.prospectiveEmpData.esic = true;
        }

        // else if (this.prospectiveEmpData.pf==true){
        //   this.prospectiveEmpData.esic = true;
        // }
        else {
          this.prospectiveEmpData.esic = false;
        }
      }
    } else {
      Employee.employeeEsi = 0;

      const Input = document.getElementById('esic') as HTMLInputElement;

      if (Input) {
        Input.value = 'false';
      }
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
  onVariablePayChange(isVariablePay: boolean): void {
    if (isVariablePay === false) {
      this.prospectiveEmpData.variablePayAmount = '0';
    }
  }
  //download document
  
  //function to post the data of the offer letter to the respective feilds
  postOfferLetterFieldsDetails(f: FormGroup) {
    const data = f.value;
    this.loading = true;
    let sdata = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      empstatus: 'Prospective',
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
      dateOfJoining: this.prospectiveEmpData.dateOfJoining,
      substatus: 'Offer Letter Generated',
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
              jobRole: this.jobRoleDetails,
              jobTypeId: '',
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
              variablePayAmount: data.variablePayAmount,
              isVariablePay: data.isVariablePay,
              status: 'Active',
              compensationcomments: null,
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
          }
        } else if (res.statusCode == 409) {
          this.dataFailureMsg(res.message);
          // f.resetForm();
          this.employeeForm.reset()
        } else {
          this.dataFailureMsg(res.message);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  //to fromat Date
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }
  //to format string date to actual date
  private formatDatebyDatestring(data: string) {
    let stringarray = data.split('/');
    console.log(
      new Date(
        `${parseInt(stringarray[2])}-${parseInt(stringarray[1])}-${parseInt(
          stringarray[0]
        )}`
      )
    );
    return new Date(
      `${parseInt(stringarray[2])}-${parseInt(stringarray[1])}-${parseInt(
        stringarray[0]
      )}`
    );
  }
  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Offer Letter/${empId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.documentUrl = data.path;
            this.postOfferDetails(empId, data.path);
            console.log(data);
          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');
        },
      });
  }
  //to post OfferLetter Details to the offerletter table
  postOfferDetails(emplId: number, docurl: string) {
    let loggedInUser = this.authService.getToken();

    let postOfferLetterDetails = {
      empId: emplId,
      offerSentDate: this.prospectiveEmpData.offerIssuedDate,
      offerSentStatus: 'Offer Generated',
      offerSentBy: loggedInUser.employeeId,
      documentUrl: docurl,
      isdeleted: false,
      status: 'Waiting For Approval',
      approvedDate: null,
      approvedBy: null,
      approver: null,
      comments: null,
      requestedDate: new Date(),
      offerExpiryDate: this.prospectiveEmpData.offerExpiryDate,
      authoritySignature: this.SignatureAuthorityValue.employeeId,
      addressType: this.addressType.toUpperCase(),
      note: this.prospectiveEmpData.note,
    };
    this.subscription = this.http
      .postdata('OfferLetter', postOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.emailToSendManager()
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  //function to updated the data
  updateOfferLetterFieldsDetails(f: NgForm) {
    const data = JSON.parse(JSON.stringify(this.prospectiveEmpData));
    this.loading = true;
    let sdata = {
      employeeId: this.prospectiveEmpData.empId,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      empstatus: 'Prospective',
      title: data.title,
      emailaddress: data.personalEmail,
      gender: data.gender,
      contactnumber: parseInt(data.phoneNumber),
      emergencyName: this.employeeaddress.emergencyName,
      emailId: this.employeeaddress.emailId,
      emergencyNumber: this.employeeaddress.emergencynumber,
      emergencyCode: this.employeeaddress.emergencycode,
      relationShip: this.employeeaddress.relationShip,
      emergencyName1: this.employeeaddress.emergencyName1,
      emergencyEmail1: this.employeeaddress.emergencyEmail1,
      emergencyNumber1: this.employeeaddress.emergencyNumber1,
      emergencyCode1: this.employeeaddress.emergencycode1,
      relationship1: this.employeeaddress.relationship1,
      empType: data.empType,
      durationOfTrainee: data.durationOfTrainee,
      mobilePhoneCountryCode: data.mobilePhoneCountryCode,
      fusionEmpId: data.fusionPlusEmpId,
      insurance: this.employeeaddress.insurance,
      generateOffer: true,
      pf: data.pf,
      esic: data.esic,
      dob: this.employeeaddress.dob,
      bloodGroup: this.employeeaddress.bloodGroup,
      trainingEndDate: data.trainingEndDate,
      dateOfJoining: data.dateOfJoining,
      substatus: 'Offer Letter Generated',
      password: this.employeeaddress.password,
    };
    if (
      this.buttonValue == 'Regenerate Offer Letter' &&
      this.employeeaddress.substatus != 'Offer Letter Rejected By Manager'
    ) {
      sdata.substatus = 'Offer Letter Regenerated';
    } else {
      sdata.substatus = 'Offer Letter Generated';
    }
    console.log(sdata);
    console.log(this.prospectiveEmpData.empId);
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', sdata)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.result = res;
          if (res.statusCode == 409) {
            this.dataFailureMsg(res.message);
          } else if (res.statusCode == 200) {
            this.UpdateFieldsToRespectiveTables();
            this.downLoadDocument(this.prospectiveEmpData);
          } else if (res.statusCode == 1002) {
            const acceptfield = window.confirm(res.message);
            if (acceptfield) {
              this.updateEmployeeData(sdata);
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

  updateEmployeeData(employeeData: any) {
    if (employeeData.substatus == 'Offer Letter Rejected By Manager') {
      employeeData.substatus = 'Offer Letter Generated';
      (employeeData.generateOffer = false),
        (employeeData.esic = this.prospectiveEmpData.esic),
        (employeeData.pf = this.prospectiveEmpData.pf);
      this.subscription = this.http
        .postdata('Employeedata/UPDATER', employeeData)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.result = res;
            if (res.statusCode == 409) {
              this.dataFailureMsg(res.message);
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.prospectiveEmpData);
            } else if (res.statusCode == 1002) {
              const acceptfield = window.confirm(res.message);
              if (acceptfield) {
                this.UpdateFieldsToRespectiveTables();
                this.downLoadDocument(this.prospectiveEmpData);
              }
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    } else {
      (employeeData.substatus = 'Offer Letter Regenerated'),
        (employeeData.generateOffer = false);
      this.subscription = this.http
        .postdata('Employeedata/UPDATER', employeeData)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.result = res;
            if (res.statusCode == 409) {
              this.dataFailureMsg(res.message);
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.prospectiveEmpData);
            } else if (res.statusCode == 1002) {
              const acceptfield = window.confirm(res.message);
              if (acceptfield) {
                this.UpdateFieldsToRespectiveTables();
                this.downLoadDocument(this.prospectiveEmpData);
              }
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    }
  }
  JobtypeDetails = [] as IJobtype[];
  jobtypeId: any;
  //function to get jobtype data
  getJobtype() {
    this.subscription = this.http.getData('Jobtype').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobtypeDetails = data as IJobtype[];
        let filteredData = this.JobtypeDetails.find(
          (item: any) => item?.jobType1?.toLowerCase() === 'contract'
        );
        console.log(filteredData);
        this.jobtypeId = filteredData?.sno;
      },
    });
  }
  //function to updated details to respective tables
  jobdetailsupdate!: any;
  UpdateFieldsToRespectiveTables() {
    let data = this.prospectiveEmpData;
    console.log(data);

    console.log(this.result);
    const jobdata = {
      id: data.jobId,
      employeeId: data.empId,
      effectiveDate: data.dateOfJoining,
      locationId: data.locationId,
      sublocationId: data.sublocationId,
      jobRole: data.jobRole,
      status: 'Active',
      subdeptId: data.subdepartmentId,
      createddate: data.jobCreatedate,
      gradeId: data.gradeId,
      reportsTo: data.reportsTo,
      shiftId: data.shiftId,
      jobTypeId: this.jobtypeId,
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
    } else {
      this.generatepostingtorepectivefields();
    }
  }
  generatepostingtorepectivefields() {
    let data = this.prospectiveEmpData;
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
      variablePayAmount: data.variablePayAmount,
      isVariablePay: data.isVariablePay,
      status: 'Active',
      compensationcomments: null,
    };
    console.log(Compensationdata);

    const employmentdata = {
      //id: data.employemnttypeId,
      empid: data.empId,
      jobType: 'Contract',
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
    let data = this.prospectiveEmpData;
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
      variablePayAmount: data.variablePayAmount,
      isVariablePay: data.isVariablePay,
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
  emailSendingforApprover(){
    if (this.prospectiveEmpData.isEmployeevalid === true) {
      this.offerletterUpload(this.generatingEmployeeId, this.generatedfile);
    } else {
      this.offerletterUpload(this.generatingEmployeeId, this.generatedfile);
    }
  }
  //function to send the email to employeee
  emailToSendManager() {
    this.loading = true;
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personName: `${this.prospectiveEmpData.firstName} ${this.prospectiveEmpData.middleName} ${this.prospectiveEmpData.lastName}`,
      personEmail: this.prospectiveEmpData.personalEmail,
      personRole: this.jobRoleDetails,
      employeeId: loggedInUser.employeeId,
      documentUrl: this.documentUrl,
      workLocation:
        this.prospectiveEmpData.jobLocationName +
        ', ' +
        this.prospectiveEmpData.jobSubLocationName,
      senderName: `${loggedInUser.firstName}  ${loggedInUser.middleName}  ${loggedInUser.lastName}`,

      senderEmail: loggedInUser.workEmail,
      approvedBy: null,
      approvedByName: null,
      firstName: null,
      middleName: null,
      lastName: null,
      comments: null,
    };
    if (loggedInUser.middleName) {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    if (this.prospectiveEmpData.middleName) {
      emaildetails.personName = `${this.prospectiveEmpData.firstName} ${this.prospectiveEmpData.middleName} ${this.prospectiveEmpData.lastName}`;
    } else {
      emaildetails.personName = `${this.prospectiveEmpData.firstName} ${this.prospectiveEmpData.lastName}`;
    }
    console.log(emaildetails);

    this.subscription = this.http
      .postdata(`CustomEmail/offerManagerEmail`, emaildetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
         
          this.Approvednotification();
          this.dataSuccessMsg('Email Sent Successfully');

          this.loading = false;
          // this.router.navigate(['/admin']);
        },
        error: (err: any) => {
          console.log(err);
          //this.router.navigate(['/admin']);
          this.dataFailureMsg('Email Sent Failed');
        },
        complete: () => {},
      });
    this.dataSuccessMsg('Email Sending.....');

    //this.router.navigate(['/admin']);
  }
  //function for Manger to approve notification
  Approvednotification() {
    const currentDate = new Date();
    this.prospectiveEmpData;
    console.log(this.prospectiveEmpData.empid);

    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Offer Letter Approve Request`,
      sentTo: this.prospectiveEmpData.OffersentbyEmailaddress,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName} ${
        loggedInUser?.middleName ?? ''
      } ${
        loggedInUser.lastName
      }  requested you for the approval of the offer letter of employee
         ${this.prospectiveEmpData?.firstName} ${
        this.prospectiveEmpData?.middleName ?? ''
      } ${this.prospectiveEmpData?.lastName} Offer Letter`,
      empId: loggedInUser.employeeId,
    };
    this.subscription = this.http
      .postdata(`Notification/Notify/Manager`, senddata)
      .subscribe({
        next: (data: any) => {
          console.log(data);

          this.router.navigate(['/admin']);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
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

  onOptionSelected(option: string, dropdownCategory: string) {
    this.islistedItem = true;
    this.optionsFound = true;
    if (dropdownCategory === 'mobilePhoneCountryCode') {
      this.prospectiveEmpData.mobilePhoneCountryCode = option;
    }
  }

  numbers(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
