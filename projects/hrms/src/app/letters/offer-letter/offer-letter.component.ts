import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { IAddress, ICountry, IGender, IJobtype, IRole, ITitle } from '../../Interfaces/letters-model';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../services/open-modal.service';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { FormValidationService } from '../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule, TranslateModule, Select, NgxCountriesDropdownModule, ReactiveFormsModule,
    LettersheaderComponent, DateformatPipe, LetterFooterComponent, NgbPopoverModule],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.scss',
})

export class OfferLetterComponent implements OnInit, OnDestroy {
  currentDate = moment();
  isIssuedDateValid = true;
  isExpiryDateValid = true;
  isStartDateValid = true;
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
  addresFlag = false;
  generatedfile = {} as any; //variable to store generated file
  documentUrl = {} as any; //variable to store docurl path
  fusionEmpId: any;
  generatingEmployeeId: any;
  employeeiddetails = [] as any;
  employeeaddress = [] as any;
  permanentAddress = {} as IAddress;
  currentAddress = {} as IAddress;
  authorityDetails = [] as any;
  buttonValue: string = 'Generate Offer Letter'; //variable to change the button value
  SelectDropDown: any;
  loading = false;
  LocationDropDownData = [] as any;
  Locationdata = {} as any;
  subLocationsDropdown = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null;
  authorityDesignation!: string | null;
  addressType: any;
  SignatureAuthorityValue: any;
  countryvalues = {} as any;
  loadingCode = true;
  selectedCountryCode: any;
  countryCode = 'Country code'
  selectedCountryConfig = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true
  };
  employeeForm!: FormGroup;
  addressdata: { name: string, value: string }[] = [
    { name: 'Current Address', value: 'C' },
    { name: 'Permanent Address', value: 'P' },
  ];
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  esic: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  pfdata: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  variabledata: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  disableFieldsForApproval = true;
  @ViewChild('approveModal') approveModal: any;
  @ViewChild('approveModal1') approveModal1: any;
  confirmation_Msg: any;
  data_Storing = {} as any;
  ApprovalLoader = false;
  issuedDatevalidate: any;
  startDatevalidate: any;
  expiryDatevalidate: any;

  constructor(private router: Router, private modalService: NgbModal, private fb: FormBuilder, private http: HttpService,
    private authService: AuthService, private conformationPopup: OpenModalService, public formvalidators: FormValidationService
    // private _userAcessService: UserAccessService,
  ) { this.initializeForm(); }

  ngOnInit(): void {
    this.issuedDatevalidate = moment().format('YYYY-MM-DD');
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.initializeForm();
    this.getJobtype();
    this.getTitle();
    this.getgender();
    this.getCountry();
    this.getJobrole();
    this.getEmployeeId();
    this.getAllWorkLocation();
    this.getAuthorityDetails();
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
      esic: [null, Validators.required],
      pf: [null, Validators.required],
      amount: ['', [Validators.required, Validators.min(0), Validators.maxLength(10), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      isVariablePay: [null, Validators.required],
      variablePayAmount: [{ value: null, disabled: true }, [Validators.required, Validators.min(0), Validators.maxLength(10), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      locationId: [{ value: null, disabled: true }],
      JobSubLocationName: [{ value: null, disabled: true }],
      address: [{ value: null, disabled: true }],
      offerIssuedDate: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      Copys: [null],
      offerExpiryDate: ['', Validators.required],
      note: ['', [Validators.maxLength(250)]],
      authorityid: [null, Validators.required]
    },
      { validators: [this.offerExpiryDateValidator(), this.offerDateofjoiningDateValidator()] } // Add the custom validators here
    );
  }

  onclickCTC(Value: any) {
    this.prospectiveEmpData.amount = Value;
    this.ctcCalculation();
  }

  //download document
  async downLoadDocument(EmpValue: any) {
    const data = this.prospectiveEmpData;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5','pdfContent6']; // IDs of the content elements to be converted to PDF
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
    const fileName = `${data.firstName}_${data.middleName ?? ""}_${data.lastName ?? ""}_${new Date().getTime()}_OfferLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.generatedfile = file;
    this.generatingEmployeeId = this.prospectiveEmpData.empId;
    this.loading = false
    this.disableFieldsForApproval = false;
    this.conformationPopup.openSuccessModal('Offer letter generated successfully');
  }

  //function to validate the offer expiry date and offer issued date
  offerExpiryDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const issuedDate = control.get('offerIssuedDate')?.value;
      const expiryDate = control.get('offerExpiryDate')?.value;
      const dateOfJoiningDate = control.get('dateOfJoining')?.value;
      this.expiryDatevalidate = moment(dateOfJoiningDate).format('YYYY-MM-DD')
      if (!issuedDate || !expiryDate) {
        return null; // Don’t validate if one of the dates is missing
      }
      return new Date(expiryDate) < new Date(issuedDate) ? { offerDateInvalid: true } : null;
    };
  }

  //function to validate the offer expected start date and offer issued date
  offerDateofjoiningDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const issuedDate = control.get('offerIssuedDate')?.value;
      const dateOfJoiningDate = control.get('dateOfJoining')?.value;
      this.startDatevalidate = moment(issuedDate).format('YYYY-MM-DD')
      if (!issuedDate || !dateOfJoiningDate) {
        return null; // Don’t validate if one of the dates is missing
      }
      return new Date(dateOfJoiningDate) < new Date(issuedDate) ? { offerdateofjoiningDateInvalid: true } : null;
    };
  }

  //get employee ids for Prospective Employees Drop Dowm
  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/GetProspectiveAndVerified').subscribe({
      next: (data: any) => {
        //this.employeeiddetails = data as IemployeeDetails[];
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

  getEmployeeAddress(Value: any) {
    let EmployeeId = Value;
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        if (this.employeeaddress.substatus == 'Documents Verified' ||
          this.employeeaddress.substatus == 'Trainee Onboarded'
        ) {
          this.buttonValue = 'Generate Offer Letter';
        } else if (this.employeeaddress.substatus == 'Offer Letter Rejected' ||
          this.employeeaddress.substatus == 'Offer Letter Accepted' ||
          this.employeeaddress.substatus == 'Offer Letter Rejected By Manager'
        ) {
          this.buttonValue = 'Regenerate Offer Letter';
        }
      },
    });
  }

  onclickSelectAddress(Value: any) {
    this.addresFlag = true;
    this.addressType = Value.value;
    if (this.employeeaddress?.employeeAddresses.length > 0) {
      this.address = this.employeeaddress?.employeeAddresses.find(
        (address: IAddress) => address?.type?.toLowerCase() == Value?.value?.toLowerCase()
      );
    }
    this.prospectiveEmpData.addressLine1 = this.address?.addressLine1;
    this.prospectiveEmpData.addressLine2 = this.address?.addressLine2;
    this.prospectiveEmpData.city = this.address?.city;
    this.prospectiveEmpData.state = this.address?.state;
    this.prospectiveEmpData.country = this.address?.country;
    this.prospectiveEmpData.pinCode = this.address?.zipCode;
    this.employeeForm?.patchValue({
      addressLine1: this.address.addressLine1,
      addressLine2: this.address.addressLine2,
      city: this.address.city,
      state: this.address.state,
      country: this.address.country,
      pinCode: this.address.zipCode,
    })
  }

  //function for getAllWorkLocation
  getAllWorkLocation() {
    this.subscription = this.http.getData(`JobLocation`).subscribe({
      next: (data: any) => {
        this.LocationDropDownData = data.jobLocations;
      },
    });
  }

  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation}`).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //function to get the authority designation
  onclickDesignation() {
    let empId = this.employeeForm?.get('authorityid')?.value;
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == empId
    );
    this.SignatureAuthorityValue = signatureAuthorityDetails;
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      this.prospectiveEmpData.authorityName = signatureAuthorityDetails.fullName;
      this.prospectiveEmpData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
  }

  //function to get the authority values
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

  //function for get job roles
  getJobrole() {
    this.subscription = this.http.getData('JobRole').subscribe({
      next: (data: any) => {
        this.JobroleDetails = data as IRole[];
      },
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

  //coverting date time to the date formate
  formatDateForOfferIssedandExpiry(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  //function to reset the feilds
  resetInputFields() {
    this.employeeForm?.reset();
    this.prospectiveEmpData.personalEmail = '';
    this.prospectiveEmpData = {};
    this.jobRoleDetails = '';
    this.buttonValue = 'Generate Offer Letter';
    this.fusionEmpId = null;
    this.prospectiveEmpData.title = null;
  }

  //function to patch the values in the form to the template
  pathValuesFuction() {
    const formValues = this.employeeForm.value;
    this.prospectiveEmpData.offerIssuedDate = formValues.offerIssuedDate,
      this.prospectiveEmpData.dateOfJoining = formValues.dateOfJoining,
      this.prospectiveEmpData.Copys = formValues.Copys,
      this.prospectiveEmpData.offerExpiryDate = formValues.offerExpiryDate
    this.prospectiveEmpData.note = formValues.note
  }

  //employeeid validation to check we have the mail already exist or not
  onClickValidation(Empidvalue: any) {
    this.loadingCode = true;
    if (Empidvalue.value) {
      this.fusionEmpId = Empidvalue.value;
      this.subscription = this.http.getData(`OfferLetter/getEmployeeByEmailAddressAndStatus?EmpId=${Empidvalue.value}`).subscribe({
        next: (data: any) => {
          if (data.isEmployeevalid === true) {
            if (Empidvalue) {
              this.prospectiveEmpData = data.checkofferletter;
              this.employeeForm?.patchValue({
                personalEmail: this.prospectiveEmpData.personalEmail,
                title: this.prospectiveEmpData?.title,
                firstName: this.prospectiveEmpData?.firstName,
                middleName: this.prospectiveEmpData?.middleName,
                lastName: this.prospectiveEmpData?.lastName,
                gender: this.prospectiveEmpData?.gender,
                SelectDropDown: null,
                jobRoleDetails: this.prospectiveEmpData?.jobRole,
                esic: this.prospectiveEmpData?.esic,
                pf: this.prospectiveEmpData?.pf,
                amount: this.prospectiveEmpData?.amount,
                isVariablePay: this.prospectiveEmpData?.isVariablePay,
                variablePayAmount: this.prospectiveEmpData?.variablePayAmount,
                locationId: this.prospectiveEmpData?.locationId,
                JobSubLocationName: this.prospectiveEmpData?.sublocationId,
                address: this.prospectiveEmpData?.address,
                offerIssuedDate: this.formatDate(this.prospectiveEmpData?.offerIssuedDate),
                dateOfJoining: this.formatDate(this.prospectiveEmpData?.dateOfJoining),
                Copys: this.prospectiveEmpData?.copys,
                offerExpiryDate: this.formatDate(this.prospectiveEmpData?.offerExpiryDate),
                note: this.prospectiveEmpData?.note,
                authorityid: this.prospectiveEmpData?.signatureAuthority,
                phoneNumber: this.prospectiveEmpData?.phoneNumber
              })
              this.prospectiveEmpData.note = this.employeeForm?.get('note')?.value;
              this.selectedCountryCode = this.prospectiveEmpData?.contactNumberCountryFlag;
              this.loadingCode = false;
              this.getEmployeeAddress(data.checkofferletter.empId);
              if (this.prospectiveEmpData.approver) {
                this.prospectiveEmpData.reportingmanagerId = this.prospectiveEmpData.approver;
              }
              if (this.prospectiveEmpData.signatureAuthority) {
                this.onclickDesignation();
              }
              this.prospectiveEmpData.jobLocationName = data.checkofferletter.workLocation;
              this.prospectiveEmpData.jobSubLocationName = data.checkofferletter.subLocation;
              this.prospectiveEmpData.address= data.checkofferletter.address;
              this.getSubLocationByid(this.prospectiveEmpData?.locationId);
              if (this.prospectiveEmpData.amount) {
                this.ctcCalculation();
              }
              if (this.prospectiveEmpData.isVariablePay) {
                this.employeeForm.get('variablePayAmount')?.enable();
              }
            }
          }
        },
        error: (err: any) => {
          console.log(err);
          this.resetInputFields();
        },
      });
    }

    else {
      this.resetInputFields();
    }
  }

  //function to format the date
  formatDate(date: any) {
    return date?.split('T')[0];
  }

  //Function to generate offer letter
  onOfferLetterFormSubmitForGenerateDoc(f: FormGroup) {
    this.updateOfferLetterFieldsDetails(f.value);
  }

  //ctc Calculation in offer letter
  esicshouldbecometrue!: any;
  ctcCalculation() {
    this.prospectiveEmpData.pf = this.employeeForm?.get('pf')?.value;
    this.prospectiveEmpData.esic = this.employeeForm?.get('esic')?.value;
    //CTC calculation stated
    let Employee = this.prospectiveEmpData;
    Employee.grossby = 12;
    Employee.grossSalary = Math.round(
      this.prospectiveEmpData.amount / Employee.grossby
    );
    //Calculation condition for pf contribution of an employee]
    if (
      this.prospectiveEmpData.pf == true ||
      this.prospectiveEmpData.pf == false
    ) {
      switch (this.prospectiveEmpData.pf) {
        case true:
          if (this.prospectiveEmpData.esic.toString() == 'false') {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.719 / 100)
            );

            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
          } else if (Employee.grossSalary >= 23195) {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.717 / 100)
            );

            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
          } else if (Employee.grossSalary <= 23194) {
            Employee.pfContribution = Math.round(
              Employee.grossSalary * (6.519 / 100)
            );
            if (Employee.pfContribution >= 1800) {
              Employee.pfContribution = 1800;
            }
          } else {
            if (Employee.grossSalary <= 15000) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.519 / 100)
              );
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
            } else if (Employee.grossSalary <= 23194) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.519 / 100)
              );
              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
            } else if (Employee.grossSalary >= 23195) {
              Employee.pfContribution = Math.round(
                Employee.grossSalary * (6.717 / 100)
              );

              if (Employee.pfContribution >= 1800) {
                Employee.pfContribution = 1800;
              }
            }
          }

          break;
        case false:
          Employee.pfContribution = 0;

          break;
        default:
      }
    } else {
      Employee.pfContribution = 0;
    }
    //==============================================================================================================================
    //Calculation conditions for esic contribution of an employeer
    if (this.prospectiveEmpData?.esic?.toString() == 'true') {
      let condition1 = Employee.grossSalary >= 23195;
      if (!condition1) {
        Employee.esicContribution = Math.round(
          Employee.grossSalary * (2.94 / 100)
        );
        this.prospectiveEmpData.esic = true;
      } else {
        Employee.esicContribution = 0;
        this.prospectiveEmpData.esic = false;
      }
    } else {
      Employee.esicContribution = 0;

      // const Input = document.getElementById('esic') as HTMLInputElement;

      // if (Input) {
      //   Input.value = 'false';
      // }

      const esicControl = this.employeeForm?.get('esic');
      if (esicControl && esicControl.value !== false) {
        esicControl.setValue(false, { emitEvent: false });
      }


    }
    //===================================================================================================================================

    //==============================================================================================================================
    //Calculation conditions for totalgrosssalary of an employee
    Employee.totalGrossSalary = Math.round(
      Employee.grossSalary - Employee.pfContribution - Employee.esicContribution
    );

    //===============================================================================================================================
    //Calculation conditions for pt contrubution of an employee
    if (Employee.totalGrossSalary <= 15000) {
      Employee.professionalTax = 0;
      this.prospectiveEmpData.pt = false;
    } else if (
      Employee.totalGrossSalary >= 15001 &&
      Employee.totalGrossSalary <= 20000
    ) {
      Employee.professionalTax = 150;
      this.prospectiveEmpData.pt = true;
    } else if (Employee.totalGrossSalary >= 20001) {
      Employee.professionalTax = 200;
      this.prospectiveEmpData.pt = true;
    } else {
      Employee.professionalTax = 0;
      this.prospectiveEmpData.pt = false;
    }
    //==============================================================================================================================
    //Calculation conditions for esic contrubution of an employee
    if (this.prospectiveEmpData?.esic?.toString() == 'true') {
      if (Employee.totalGrossSalary <= 21000) {
        Employee.employeeEsi = Math.round(
          Employee.totalGrossSalary * (0.75 / 100)
        );
        this.prospectiveEmpData.esic = true;
      } else {
        Employee.employeeEsi = 0;
        if (this.prospectiveEmpData.pf === undefined) {
          this.prospectiveEmpData.esic = true;
        }
        else {
          this.prospectiveEmpData.esic = false;
        }
      }
    } else {
      Employee.employeeEsi = 0;
      // const Input = document.getElementById('esic') as HTMLInputElement;
      // if (Input) {
      //   Input.value = 'false';
      // }

      const esicControl = this.employeeForm?.get('esic');
      if (esicControl && esicControl.value !== false) {
        esicControl.setValue(false, { emitEvent: false });
      }

    }

    //==================================================================================================================================
    //===========================================================================================================
    // calculation for the basicsalary
    Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100));
    //calculation for the hraSalary
    Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
    //calculation for the educationAllowances
    Employee.educationAllowances = Math.round(
      Employee.totalGrossSalary * (2 / 100)
    );

    //calculation for the conveyance
    Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100));

    //total deductions per month
    Employee.totalDeduction = Math.round(
      Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax
    );
    //total net salary  per month
    Employee.netSalary = Math.round(
      Employee.totalGrossSalary - Employee.totalDeduction
    );
    //calculation for the otherallowances
    Employee.otherAllowances = Math.round(
      Employee.totalGrossSalary * (16 / 100)
    );
    //pfcontribution per annum
    Employee.pfPreAnuum = Math.round(
      Employee.pfContribution * Employee.grossby
    );
    //totalGrossPerAnnum calculation
    Employee.totalGrossPerAnnum = Math.round(
      Employee.totalGrossSalary * Employee.grossby
    );
    //basicsalaryperannum
    Employee.basicPerannum = Math.round(
      Employee.basicSalary * Employee.grossby
    );
    //HRA per annum
    Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
    //esiper anuum
    Employee.esiPerAnnum = Math.round(
      Employee.esicContribution * Employee.grossby
    );
    //esiper anuum for employee
    Employee.esiPerAnnumemployee = Math.round(
      Employee.employeeEsi * Employee.grossby
    );
    //educationper annum
    Employee.educationallowancesPerAnnum = Math.round(
      Employee.educationAllowances * Employee.grossby
    );
    //conveyance per annum
    Employee.conveyancePerAnnum = Math.round(
      Employee.Conveyance * Employee.grossby
    );
    //otherAllowancesper annum
    Employee.otherAllowancesPerAnnum = Math.round(
      Employee.otherAllowances * Employee.grossby
    );
    //professional per annum
    Employee.professionalPerAnnum = Math.round(
      Employee.professionalTax * Employee.grossby
    );
    //salary deductions per annum
    Employee.totalDeductionsPerAnnum = Math.round(
      Employee.pfPreAnuum +
      Employee.esiPerAnnumemployee +
      Employee.professionalPerAnnum
    );
    //net salary per annum
    Employee.netSalaryPerAnnum = Math.round(
      Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum
    );
    //Ctc per annum
    Employee.ctcperannum = Math.round(Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum);
  }

  onVariablePayChange(isVariablePay: any) {
    this.prospectiveEmpData.isVariablePay = isVariablePay.value;
    if (isVariablePay.value === false) {
      this.prospectiveEmpData.variablePayAmount = '';
      this.employeeForm.get('variablePayAmount')?.setValue(null);
      this.employeeForm.get('variablePayAmount')?.disable();
    }
    else if (isVariablePay.value === true) {
      this.employeeForm.get('variablePayAmount')?.enable();
      this.employeeForm.get('variablePayAmount')?.setValue(null);
    }
  }

  onVariablePayChangeAmount(Value: any) {
    this.prospectiveEmpData.variablePayAmount = Value;
  }

  //to store file to the azure and return to the url
  offerletterUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Offer Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          this.documentUrl = data.path;
          this.postOfferDetails(empId, data.path);
        }
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('file upload  is failed');
      },
    });
  }

  //to post OfferLetter Details to the offerletter table
  postOfferDetails(emplId: number, docurl: string) {
    let loggedInUser = this.authService.getToken();
    let postOfferLetterDetails = {
      empId: emplId,
      offerSentDate: this.employeeForm.get('offerIssuedDate')?.value,
      offerSentStatus: 'Offer Generated',
      offerSentBy: loggedInUser.employeeId,
      documentUrl: docurl,
      isdeleted: false,
      status: 'Waiting For Approval',
      approvedDate: null,
      approvedBy: null,
      approver: null,
      comments: null,
      requestedDate: moment(),
      offerExpiryDate: this.employeeForm.get('offerExpiryDate')?.value,
      authoritySignature: this.employeeForm.get('authorityid')?.value,
      addressType: this.addressType.toUpperCase(),
      note: this.employeeForm.get('note')?.value,
    };
    this.subscription = this.http.postdata('OfferLetter', postOfferLetterDetails).subscribe({
      next: (data: any) => {
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
    this.prospectiveEmpData.employeeId = this.prospectiveEmpData.empId,
      this.prospectiveEmpData.empstatus = 'Prospective',
      this.prospectiveEmpData.emailaddress = data.personalEmail,
      this.prospectiveEmpData.contactnumber = parseInt(data.phoneNumber),
      this.prospectiveEmpData.emailId = this.employeeaddress.emailId,
      this.prospectiveEmpData.fusionEmpId = data.fusionPlusEmpId,
      this.prospectiveEmpData.insurance = this.employeeaddress.insurance,
      this.prospectiveEmpData.generateOffer = true,
      this.prospectiveEmpData.pf = this.employeeForm.get('pf')?.value,
      this.prospectiveEmpData.esic = this.employeeForm.get('esic')?.value,
      this.prospectiveEmpData.dob = this.employeeaddress.dob,
      this.prospectiveEmpData.bloodGroup = this.employeeaddress.bloodGroup,
      this.prospectiveEmpData.trainingEndDate = data.trainingEndDate,
      this.prospectiveEmpData.dateOfJoining = this.employeeForm.get('dateOfJoining')?.value,
      this.prospectiveEmpData.substatus = 'Offer Letter Generated',
      this.prospectiveEmpData.password = this.employeeaddress.password
    this.prospectiveEmpData.reportsTo = this.prospectiveEmpData.reportsTo?.toString();
    this.prospectiveEmpData.note = this.employeeForm?.get('note')?.value ? this.employeeForm?.get('note')?.value : null;
    if (this.buttonValue == 'Regenerate Offer Letter' && this.employeeaddress.substatus != 'Offer Letter Rejected By Manager'
    ) {
      this.prospectiveEmpData.substatus = 'Offer Letter Regenerated';
    } else { this.prospectiveEmpData.substatus = 'Offer Letter Generated'; }
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.prospectiveEmpData).subscribe({
      next: (res: any) => {
        this.result = res;
        if (res.statusCode == 409) {
          this.conformationPopup.openErrorModal(res.message);
        } else if (res.statusCode == 200) {
          this.UpdateFieldsToRespectiveTables();
          this.downLoadDocument(this.prospectiveEmpData);
        } else if (res.statusCode == 1002) {
          this.confirmation_Msg = res.message;
          this.data_Storing = this.prospectiveEmpData;
          this.modalService.open(this.approveModal1, { centered: true, backdrop: 'static', keyboard: false });
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
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

  updateEmployeeData(employeeData: any) {
    if (employeeData.substatus == 'Offer Letter Rejected By Manager') {
      employeeData.substatus = 'Offer Letter Generated';
      (employeeData.generateOffer = false),
        (employeeData.esic = this.prospectiveEmpData.esic),
        (employeeData.pf = this.prospectiveEmpData.pf);
      this.subscription = this.http.postdata('Employeedata/UPDATER', employeeData).subscribe({
        next: (res: any) => {
          this.result = res;
          if (res.statusCode == 409) {
          } else if (res.statusCode == 200) {
            this.UpdateFieldsToRespectiveTables();
            this.downLoadDocument(this.prospectiveEmpData);
          } else if (res.statusCode == 1002) {
            this.confirmation_Msg = res.message;
            this.modalService.open(this.approveModal, {
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
            this.result = res;
            if (res.statusCode == 409) {
              this.conformationPopup.openErrorModal(res.message);
              this.employeeForm.reset();
            } else if (res.statusCode == 200) {
              this.UpdateFieldsToRespectiveTables();
              this.downLoadDocument(this.prospectiveEmpData);
            } else if (res.statusCode == 1002) {
              this.confirmation_Msg = res.message;
              this.modalService.open(this.approveModal, {
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

  confimationfuction(yes: any) {
    if (yes) {
      this.modalService.dismissAll();
      this.UpdateFieldsToRespectiveTables();
      this.downLoadDocument(this.prospectiveEmpData);
    }
  }

  JobtypeDetails = [] as IJobtype[];
  jobtypeId: any;
  //function to get jobtype data
  getJobtype() {
    this.subscription = this.http.getData('Jobtype').subscribe({
      next: (data: any) => {
        this.JobtypeDetails = data as IJobtype[];
        let filteredData = this.JobtypeDetails.find(
          (item: any) => item?.jobType1?.toLowerCase() === 'contract'
        );
        this.jobtypeId = filteredData?.sno;
      },
    });
  }

  //function to updated details to respective tables
  jobdetailsupdate!: any;
  UpdateFieldsToRespectiveTables() {
    let data = this.prospectiveEmpData;
    const jobdata = {
      id: data.jobId,
      employeeId: data.empId,
      effectiveDate: this.employeeForm.get('dateOfJoining')?.value,
      locationId: data.locationId,
      sublocationId: data.sublocationId,
      jobRole: data.jobRole,
      status: 'Active',
      subdeptId: data.subdepartmentId,
      createddate: data.jobCreatedate,
      gradeId: data.gradeId,
      reportsTo: parseInt(data.reportsTo),
      shiftId: data.shiftId,
      jobTypeId: this.jobtypeId,
    };
    this.subscription = this.http.postdata('JobDetails/UPDATER', jobdata).subscribe({
      next: (data: any) => {
      },
      error: (Reason) => console.log(Reason),
      complete: () => {
        if (this.buttonValue == 'Regenerate Offer Letter') {
          this.regenerateUpdate();
        } else {
          this.generatepostingtorepectivefields();
        }
      },
    });
  }

  //function to posting to respective fields data of job,compensation,employment
  generatepostingtorepectivefields() {
    let data = this.prospectiveEmpData;
    const Compensationdata = {
      employeeId: data.empId,
      compeffectivedate: data.dateOfJoining,
      overtimeeligibility: null,
      reason: null,
      comments: null,
      frequency: null,
      paytype: null,
      compensationamount: parseInt(data.amount),
      variablePayAmount: data.variablePayAmount,
      isVariablePay: this.employeeForm.get('isVariablePay')?.value,
      status: 'Active',
      compensationcomments: null,
    };
    const employmentdata = {
      empid: data.empId,
      jobType: 'Contract',
      empEffectiveDate: data.dateOfJoining,
      empComments: null,
      gradeId: null,
      isdeleted: 'Active',
    };
    this.subscription = this.http.postdata('Compensationdata', Compensationdata).subscribe({
      next: (data: any) => {
      },
      error: (Reason) => console.log(Reason),
    });
    this.subscription = this.http.postdata('Employementtype', employmentdata).subscribe({
      next: (data: any) => { },
      error: (Reason) => console.log(Reason),
    });
  }

  regenerateUpdate() {
    let data = this.prospectiveEmpData;
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
      next: (data: any) => {
      },
      error: (Reason) => console.log(Reason),
    });
    this.subscription = this.http.postdata('Employementtype/UPDATER', employmentdataupdate).subscribe({
      next: (data: any) => {
      },
      error: (Reason) => console.log(Reason),
    });
  }

  emailSendingforApprover() {
    if (this.prospectiveEmpData.isEmployeevalid === true) {
      this.offerletterUpload(this.generatingEmployeeId, this.generatedfile);
    } else {
      this.offerletterUpload(this.generatingEmployeeId, this.generatedfile);
    }
  }
  //function to send the email to employeee
  emailToSendManager() {
    this.ApprovalLoader = true;
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personName: `${this.prospectiveEmpData.firstName ?? ''} ${this.prospectiveEmpData.middleName ?? ''} ${this.prospectiveEmpData.lastName ?? ''}`,
      personEmail: this.prospectiveEmpData.personalEmail,
      personRole: this.jobRoleDetails,
      employeeId: loggedInUser.employeeId,
      documentUrl: this.documentUrl,
      workLocation: this.prospectiveEmpData.jobLocationName + ', ' + this.prospectiveEmpData.jobSubLocationName,
      senderName: `${loggedInUser.firstName ?? ''}  ${loggedInUser.middleName ?? ''}  ${loggedInUser.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
    };
    this.subscription = this.http.postdata(`CustomEmail/offerManagerEmail`, emaildetails).subscribe({
      next: (data: any) => {
        this.Approvednotification();
        this.conformationPopup.openSuccessModal('Request for approval sent successfully');
        this.ApprovalLoader = false;
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Email Sent Failed');
      },
      complete: () => { },
    });
  }

  //function for Manger to approve notification
  Approvednotification() {
    const currentDate = new Date();
    this.prospectiveEmpData;
    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Offer Letter Approve Request`,
      sentTo: this.prospectiveEmpData.OffersentbyEmailaddress,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName ?? ''} ${loggedInUser?.middleName ?? ''} ${loggedInUser.lastName ?? ''} 
      requested you for the approval of the offer letter of employee ${this.prospectiveEmpData?.firstName} ${this.prospectiveEmpData?.middleName ?? ''} 
      ${this.prospectiveEmpData?.lastName} Offer Letter`,
      empId: loggedInUser.employeeId,
    };
    this.subscription = this.http.postdata(`Notification/Notify/Manager`, senddata).subscribe({
      next: (data: any) => {
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}