import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, ICountry, IEmployee, IGender, IJobtype, IRole, IServe, ITitle } from '../../Interfaces/letters-model';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersTabComponent } from '../../shared/letters-shared-content/letters-tab/letters-tab.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
@Component({
  selector: 'app-trainee-offer-letter',
  imports: [LettersTabComponent, CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, TranslateModule,
    NgxCountriesDropdownModule, LetterFooterComponent],
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
  disableFieldsForApproval = true; //variable to disable the fields for approval
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
  countryCode = 'Country code'
  selectedCountryCode: any;
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
  data_Storing = {} as any;
  confirmation_Msg: any;
  @ViewChild('approveModal1') approveModal1: any;
  Approvalloader = false;
 issuedDatevalidate:any;
 startDatevalidate:any;
 expiryDatevalidate:any;
  constructor(private http: HttpService, private modalService: NgbModal, private fb: FormBuilder, private router: Router,
    private authService: AuthService, private conformationPopup: OpenModalService,) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.issuedDatevalidate = moment().format('YYYY-MM-DD');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.traineeEmpData.mobilePhoneCountryCode = 'India (+91)';
    this.traineeEmpData.title = null;
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
      note: ['', [Validators.maxLength(250)]],
      authorityid: [null, Validators.required],
      reportingmanagerId: [null, Validators.required],
      documentType: ['', Validators.required],
      internshipperiod: [null, Validators.required],
    });
    this.employeeForm.get('internshipperiod')?.valueChanges.subscribe((value: string) => {
      this.calculateEndDate(value);
    });
  }

  onclickcheckempidnull(empidValue: any) {
    if (empidValue == "") {
      this.disablebuttonforemployeeid = true
    }
    else {
      this.disablebuttonforemployeeid = false
    }
    this.fusionEmpId = empidValue.value;
    if (this.fusionEmpId) {
      this.onClickValidation(this.fusionEmpId);
    } else {
      this.resetInputFields();
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

  onDateOfJoiningChange() {
    this.traineeEmpData.dateOfJoining = this.employeeForm.get('dateOfJoining')?.value;
        this.expiryDatevalidate = moment(this.traineeEmpData.dateOfJoining).format('YYYY-MM-DD');
    this.calculateEndDate(this.employeeForm.get('internshipperiod')?.value);
  }

  calculateEndDate(value: any) {
    if (this.employeeForm.get('dateOfJoining')?.value && value) {
      const doj = this.employeeForm.get('dateOfJoining')?.value;
      const startDate = moment(doj); // already a moment object
      const months = parseInt(value, 10);
      const endDate = startDate.clone().add(months, 'months'); // purely using moment
      this.traineeEmpData.endDate = endDate.format('YYYY-MM-DD'); // clean format
      // Now, calculate the duration in days
      const durationInDays = endDate.diff(startDate, 'days');
      this.traineeEmpData.durationOfTrainee = durationInDays; // save or use as needed
    }
  }
  getMonthsBetween(startDate: string, endDate: string): number {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'months', true); // 'true' gives exact months with decimals
  }

  getEmployeeIdforReporting() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeedetails = data;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllEmployeeDetails() {
    const satus = ['active'];
    this.subscription = this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`).subscribe({
      next: (response: any) => {
        if (response) {
          // this.getAllEmployeeInfo = response;
          this.getAllEmployeeInfo = response.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
              ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            };
          });
        }
      },
    });
  }

  //function to get reporting manager name
  selectReportingname(Value: any) {
    if (Value) {
      const details = this.getAllEmployeeInfo.find((ele: any) => ele.employeeId == Value);
      this.traineeEmpData.reportingmanagerName = `${details.firstName} ${details.middleName ? details.middleName + ' ' : ''}${details.lastName}`;
      this.traineeEmpData.reportingcontactnumber = details.workPhone;
      this.traineeEmpData.reportingworkemail = details.workEmail;
    } else {
      this.traineeEmpData.reportingmanagerName = null;
    }
  }

  //get employee ids for Trainee Employees Drop Dowm
  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/GetTraineeAndVerified').subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeiddetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
        this.serveDetails = data as IServe[];
        const filteredServeDetails = this.serveDetails.filter((serve: IServe) => {
          return serve.servingPeriodType === 'Trainee Duration Period';
        });
        this.singleValue = filteredServeDetails.length > 0 ? filteredServeDetails[0] : null;
      }
    });
  }

  //function for get job roles
  getJobrole() {
    this.subscription = this.http.getData('JobRole').subscribe({
      next: (data: any) => {
        this.JobroleDetails = data as IRole[];
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'Offer Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim() // Concatenate first, middle, last name and trim any extra spaces
        }));
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
      },
      error: (reason) => console.log(reason),
    });
  }

  //get method for title
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titleDetails = data as ITitle[];
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
    this.updateTraineeOfferLetterFieldsDetails(f); //new offer lettr
  }

  onclickDesignation(selectedAuthority: any) {
    if (!selectedAuthority) {
      this.traineeEmpData.authorityName = '';
      this.authorityDesignation = '';
      return;
    }
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == selectedAuthority.employeeId
    );
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
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
      return false;
    }
    return true;
  }

  getEmployeeAddress(Value: any) {
    let EmployeeId = Value;
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        if (this.employeeaddress.substatus == 'Documents Verified') {
          this.buttonValue = 'Generate Offer Letter';
        }
        else if (this.employeeaddress.substatus == 'Offer Letter Rejected' || this.employeeaddress.substatus == 'Offer Letter Accepted' || this.employeeaddress.substatus == 'Offer Letter Rejected By Manager') {
          this.buttonValue = 'Regenerate Offer Letter';
        }
      }
    })
  }

  //function to reset the feilds
  resetInputFields() {
    this.employeeForm.reset()
    this.traineeEmpData.personalEmail = '';
    this.traineeEmpData = {};
    this.jobRoleDetails = '';
    this.buttonValue = 'Generate Offer Letter';
  }

  //checking function if it is new or existing
  onClickOfferCreate(checkValue: any) {
    if (checkValue === 'New') {
      this.disableFields = true;
      this.buttonValue = 'Generate Offer Letter';
      if (this.traineeEmpData.personalEmail != null || this.jobRoleDetails != null || this.traineeEmpData.title) {
        window.location.reload();
      }
    } else if (checkValue === 'Existing') {
      this.disableFields = false;
      this.buttonValue = 'Regenerate Offer Letter';
      if (this.traineeEmpData.personalEmail != null || this.jobRoleDetails != null || this.traineeEmpData.title) {
        window.location.reload();
      }
    } else {
      this.buttonValue = 'Generate Offer Letter';
    }
  }

  formatDate(date: any) {
    return date?.split('T')[0];
  }

  patchForm(data: any) {
    this.employeeForm?.patchValue({
      personalEmail: data.personalEmail,
      title: this.titleDetails.find((x: any) => x.titlename === data.title),
      firstName: data?.firstName,
      middleName: data?.middleName,
      lastName: data?.lastName,
      gender: this.genderDetails.find((x: any) => x.genderName === data.gender),
      SelectDropDown: null,
      jobRoleDetails: data?.jobRole,
      esic: data?.esic,
      pf: data?.pf,
      amount: data?.amount,
      isVariablePay: data?.isVariablePay,
      variablePayAmount: data?.variablePayAmount,
      locationId: this.LocationDropDownData.find((x: any) => x.jobLocationName === data?.workLocation),
      JobSubLocationName: data?.sublocationId,
      offerSentDate: this.formatDate(data?.offerIssuedDate),
      dateOfJoining: this.formatDate(data?.dateOfJoining),
      offerExpiryDate: this.formatDate(data?.offerExpiryDate),
      Copys: data?.copys,
      trainingEndDate: this.formatDate(data.trainingEndDate),
      note: this.traineeEmpData?.note,
      authorityid: data?.authorityid,
      phoneNumber: data?.phoneNumber,
      reportingmanagerId: data?.reportsTo,
      internshipperiod:data?.internshipperiod
    })
    this.traineeEmpData.note = this.employeeForm.get('note')?.value;
  }

  loadingCode = false;
  onClickValidation(Empidvalue: any) {
    this.loadingCode = true;
    if (Empidvalue.value) {
      this.fusionEmpId = Empidvalue.value;
      this.subscription = this.http.getData(`OfferLetter/getEmployeeByEmailAddressAndStatus?EmpId=${Empidvalue.value}`).subscribe({
        next: (data: any) => {
          if (data.isEmployeevalid === true) {
            // const userConfirmed = window.confirm("Data already exists. Do you want to regenerate?");
            if (Empidvalue) {
              this.disableFields = false; // User clicked "OK," enable fields
              this.traineeEmpData = data.checkofferletter;
              this.selectedCountryCode = this.traineeEmpData?.contactnumbercountryflag;
              this.loadingCode = false;
              this.traineeEmpData.note = this.traineeEmpData.note;
              this.patchForm(this.traineeEmpData);
              this.getTraineeEmployeeAddress(data.checkofferletter.empId);
              this.traineeEmpData.CreateOffer = this.traineeEmpData.CreateOffer;
              if (this.traineeEmpData.offerIssueddate) {
                this.traineeEmpData.offerIssuedDate = this.formatDate(this.traineeEmpData.offerIssuedDate);
              }
              if (this.traineeEmpData.offerExpiryDate) {
                this.traineeEmpData.offerExpiryDate = this.formatDate(this.traineeEmpData.offerExpiryDate);
              }
              if (this.traineeEmpData.dateOfJoining) {
                this.traineeEmpData.dateOfJoining =
                  this.formatDate(this.traineeEmpData.dateOfJoining);
              }
              this.jobDesignation = this.traineeEmpData.jobRole;
              this.jobRoleDetails = this.traineeEmpData.jobRole;

              this.traineeEmpData.isEmployeevalid = data.isEmployeevalid;
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
              this.traineeEmpData.jobLocationName = data.checkofferletter.workLocation;
              this.traineeEmpData.jobSubLocationName = data.checkofferletter.subLocation;
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
    else {
      this.resetInputFields()
    }
  }

  isDataPopulated() {
    this.traineeEmpData.offerIssuedDate = this.employeeForm.get('offerSentDate')?.value;
    this.startDatevalidate = moment(this.traineeEmpData.offerIssuedDate).format('YYYY-MM-DD');
  }

  isDataPopulated1() {
    this.traineeEmpData.internshipperiod = this.employeeForm.get('internshipperiod')?.value.value;
  }

  //function to get sublocation by id
  getSubLocationByid(id: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${id}`).subscribe({
      next: (data: any) => {
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
        this.LocationDropDownData = data.jobLocations;
      },
    });
  }

  //function to get SubLocation
  OnClickLocation(id: any) {
    this.getSubLocationByid(id);
  }

  onclickCTC(Value: any) {
    this.traineeEmpData.amount = Value;
    // this.ctcCalculation();
  }

  //coverting date time to the date formate
  formatDateForOfferIssedandExpiry(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  //download document
  async downLoadDocument(EmpValue: any) {
    const data = this.traineeEmpData;
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
      pdf.addImage(imageData.imgData, 'PNG', 0, 0, imgWidth, imageData.imgHeight, '', 'FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData, 'PNG', 0, 0, imgWidth, lastImageData.imgHeight, '', 'FAST');
    }
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_TraineeOfferLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, { type: 'application/pdf', });
    this.generatedfile = file;
    this.generatingEmployeeId = EmpValue.employeeId;
    this.loading = false;
    this.conformationPopup.openSuccessModal('Trainee Offer Letter Generated Successfully');
  }


  traineeofferletterUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Trainee Offer Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          this.documentUrl = data.path;
          this.postTraineeOfferDetails(empId, data.path);
          //this.updateOfferDetails(data.path);
        }
      },
      error: (reason: any) => {
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
    this.subscription = this.http.postdata('TraineeOfferLetter', postTraineeOfferDetails).subscribe({
      next: (data: any) => {
        this.emailToSendManager();
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to updated the data
  updateTraineeOfferLetterFieldsDetails(f: FormGroup) {
    const data = JSON.parse(JSON.stringify(this.traineeEmpData));
    this.loading = true;
    this.traineeEmpData.employeeId = this.traineeEmpData.empId,
      this.traineeEmpData.firstName = data.firstName,
      this.traineeEmpData.lastName = data.lastName,
      this.traineeEmpData.middleName = data.middleName,
      this.traineeEmpData.empstatus = 'Trainee Prospective',
      this.traineeEmpData.emptype = 'Trainee',
      this.traineeEmpData.title = data.title,
      this.traineeEmpData.emailaddress = data.personalEmail,
      this.traineeEmpData.gender = data.gender,
      this.traineeEmpData.contactnumber = parseInt(data.phoneNumber),
      this.traineeEmpData.mobilePhoneCountryCode = data.mobilePhoneCountryCode,
      this.traineeEmpData.fusionEmpId = data.fusionPlusEmpId,
      this.traineeEmpData.durationOfTrainee = data.durationOfTrainee,
      this.traineeEmpData.generateOffer = true,
      this.traineeEmpData.pf = data.pf,
      this.traineeEmpData.esic = data.esic,
      this.traineeEmpData.dob = this.employeeaddress.dob,
      this.traineeEmpData.bloodGroup = this.employeeaddress.bloodGroup,
      this.traineeEmpData.insurance = this.employeeaddress.insurance,
      this.traineeEmpData.dateOfJoining = data.dateOfJoining,
      this.traineeEmpData.substatus = 'Offer Letter Generated',
      this.traineeEmpData.password = this.employeeaddress.password,
      this.traineeEmpData.trainingEndDate = this.traineeEmpData.endDate,
      this.traineeEmpData.reportsTo = this.traineeEmpData.reportingmanagerId?.toString()
    if (this.buttonValue == 'Regenerate Offer Letter' && this.employeeaddress.substatus != 'Offer Letter Rejected By Manager') {
      this.traineeEmpData.substatus = 'Offer Letter Regenerated';
    }
    else {
      this.traineeEmpData.substatus = 'Offer Letter Generated';
    }
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.traineeEmpData).subscribe({
      next: (res: any) => {
        this.result = res.employeeData;
        if (res.statusCode == 409) {
          this.conformationPopup.openErrorModal(res.message);
        } else if (res.statusCode == 200) {
           this.UpdateFieldsToRespectiveTables();
            setTimeout(() => {
           this.downLoadDocument(this.result);
           }, 3000); // wait 1 second (1000ms)
        } else if (res.statusCode == 1002) {
          this.confirmation_Msg = res.message;
          this.data_Storing = this.traineeEmpData;
          this.modalService.open(this.approveModal1, {
            centered: true,
            backdrop: 'static',
            keyboard: false
          });
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  confimationfuction(yes: any) {
    if (yes) {
      this.modalService.dismissAll();
      this.UpdateFieldsToRespectiveTables();
      this.downLoadDocument(this.traineeEmpData);
    }
  }

  confimationfuction1(yes: any) {
    if (yes) {
      this.modalService.dismissAll();
      this.updateEmployeeData(this.data_Storing);
    }
    else {
      this.employeeForm.reset();
    }
  }

  JobtypeDetails = [] as IJobtype[];
  jobtypeId: any;
  //function to get jobtype data
  getJobtype() {
    this.subscription = this.http.getData("Jobtype").subscribe({
      next: (data: any) => {
        this.JobtypeDetails = data as IJobtype[];
        let filteredData = this.JobtypeDetails.find((item: any) =>
          item?.jobType1?.toLowerCase() === 'trainee'
        )
        this.jobtypeId = filteredData?.sno
      }
    })
  }

  //function to updated details to respective tables
  jobdetailsupdate!: any;
  UpdateFieldsToRespectiveTables() {
    let data = this.traineeEmpData;
    const reportsto = this.employeeForm.get('reportingmanagerId')?.value
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
      reportsto: reportsto
    };
    // console.log(jobdata);
    this.subscription = this.http.postdata('JobDetails/UPDATER', jobdata).subscribe({
      next: (data: any) => {
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
    const employmentdata = {
      //id: data.employemnttypeId,
      empid: data.empId,
      jobType: 'Trainee',
      empEffectiveDate: data.dateOfJoining,
      empComments: null,
      gradeId: null,
      isdeleted: 'Active',
    };
    this.subscription = this.http.postdata('Compensationdata', Compensationdata).subscribe({
      next: (data: any) => {
        //alert("comp data successfully added")
      },
      error: (Reason) => console.log(Reason),
    });
    this.subscription = this.http.postdata('Employementtype', employmentdata).subscribe({
      next: (data: any) => {
        this.disableFieldsForApproval = false;
      },
      error: (Reason) => console.log(Reason),
    });
  }

  regenerateUpdate() {
    let data = this.traineeEmpData;
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
    const employmentdataupdate = {
      id: data.employemnttypeId,
      empid: data.empId,
      jobType: 'Contract',
      empEffectiveDate: data.dateOfJoining,
      empComments: null,
      gradeId: null,
      isdeleted: 'Active',
    };
    this.subscription = this.http.postdata('Compensationdata/UPDATER', Compensationdataupdate).subscribe({
      next: (data: any) => { },
      error: (Reason) => console.log(Reason),
    });
    this.subscription = this.http.postdata('Employementtype/UPDATER', employmentdataupdate).subscribe({
      next: (data: any) => {
        this.disableFieldsForApproval = false;
        // alert("Employementtype coming successfully");
        // this.router.navigate(['/admin']);
      },
      error: (Reason) => console.log(Reason),
    });
  }

  updateEmployeeData(employeeData: any) {
    if (employeeData.substatus == 'Offer Letter Rejected By Manager') {
      employeeData.substatus = 'Offer Letter Generated';
      (employeeData.generateOffer = false),
        (employeeData.esic = this.traineeEmpData.esic),
        (employeeData.pf = this.traineeEmpData.pf);
      this.subscription = this.http
        .postdata('Employeedata/UPDATER', employeeData)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.result = res;
            if (res.statusCode == 409) {
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.traineeEmpData);
            } else if (res.statusCode == 1002) {
              this.confirmation_Msg = res.message;
              this.modalService.open(this.approveModal1, {
                centered: true,
                backdrop: 'static',
                keyboard: false
              });
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
              this.conformationPopup.openErrorModal(res.message);
              this.employeeForm.reset();
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.traineeEmpData);
            } else if (res.statusCode == 1002) {
              this.confirmation_Msg = res.message;
              this.modalService.open(this.approveModal1, {
                centered: true,
                backdrop: 'static',
                keyboard: false
              });
            }
          },
          error: (err: any) => {
            console.log(err);
          },
        });
    }
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
    this.Approvalloader = true;
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personName: `${this.traineeEmpData.firstName} ${this.traineeEmpData.middleName} ${this.traineeEmpData.lastName}`,
      personEmail: this.traineeEmpData.personalEmail,
      personRole: this.jobRoleDetails,
      employeeId: loggedInUser.employeeId,
      documentUrl: this.documentUrl,
      workLocation: this.traineeEmpData.jobLocationName + ', ' + this.traineeEmpData.jobSubLocationName,
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
    this.subscription = this.http.postdata(`CustomEmail/offerManagerEmail`, emaildetails).subscribe({
      next: (data: any) => {
        //this.Approvednotification();
        if (data) {
          this.conformationPopup.openSuccessModal('Request For Approval Sent Successfully');
        }
        this.Approvalloader = false;
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 1000);
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Email sent failed');
        this.Approvalloader = false;
      },
      complete: () => { },
    });
  }

  //function to validate the offer expiry date and offer issued date
  updateEndDateValidity(): void {
    const offerExpiryDate = moment(this.employeeForm.get('offerExpiryDate')?.value);
    const offerIssuedDate = moment(this.employeeForm.get('offerSentDate')?.value);
    if(offerIssuedDate){
    this.expiryDatevalidate = moment(offerIssuedDate).format('YYYY-MM-DD');
    }
    if (offerExpiryDate && offerIssuedDate) {
      if (offerExpiryDate >= offerIssuedDate) {
        this.isExpiryDateValid = true;
      } else {
        this.isExpiryDateValid = false;
      }
    }
  }

  //function to validate the offer expected start date and offer issued date
  updateEndDateValidityForExpectedStartDate() {
    const dateOfJoining = new Date(this.traineeEmpData.dateOfJoining);
    const offerIssuedDate = new Date(this.traineeEmpData.offerIssuedDate);
    if (dateOfJoining < offerIssuedDate) {
      this.isStartDateValid = false;
    } else {
      this.isStartDateValid = true;
    }
  }

  updateEndDateValidityupdate(): void {
    const offerstartDate = moment(this.employeeForm.get('dateOfJoining')?.value);
    const offerExpiryDate = moment(this.employeeForm.get('offerExpiryDate')?.value);
    if (offerstartDate && offerExpiryDate) {
      if (offerstartDate.isAfter(offerExpiryDate)) {
        this.isStartDateValidofexpected = false;
      } else {
        this.isStartDateValidofexpected = true;
      }
    }
  }

  onclickSelectAddress(Value: any) {
    this.addresFlag = true;
    this.addressType = Value.value;
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) =>
        address?.type.toLowerCase() == Value?.value?.toLowerCase())
    }
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

  pathValuesFuction() {
    const formValues = this.employeeForm.value;
    this.traineeEmpData.note = formValues.note
  }

  trainingempadress: any
  getTraineeEmployeeAddress(Value: any) {
    let EmployeeId = Value;
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        this.trainingempadress = data.employeeAddresses[0];
        if (this.employeeaddress.substatus == 'Documents Verified') {
          this.buttonValue = 'Generate Offer Letter';
        }
        else if (this.employeeaddress.substatus == 'Offer Letter Rejected' || this.employeeaddress.substatus == 'Offer Letter Accepted'
           || this.employeeaddress.substatus == 'Offer Letter Rejected By Manager') {
          this.buttonValue = 'Regenerate Offer Letter';
        }
      }
    })
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  onclickDocumentType(Value: any) {
    this.traineeEmpData.documentType = Value.value;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}