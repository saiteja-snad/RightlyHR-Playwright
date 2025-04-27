import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Select, SelectModule } from 'primeng/select';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAddress, IAsset, IDepartment, IEmployeeAddress, IemployeeDetails, IEmployeeIdentity, IEmployeeJobInfo, IEmployeeProfile, IIssuelocation, IMake } from './appointment-letter-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersTabComponent } from '../../shared/letters-shared-content/letters-tab/letters-tab.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployeeSignatures } from '../letters.modal';
@Component({
  selector: 'app-appointment-letter',
  imports: [CommonModule, LettersTabComponent, SelectModule, DateformatPipe, ReactiveFormsModule, LettersheaderComponent, LetterFooterComponent, TranslateModule],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})

export class AppointmentLetterComponent {
  // selectedEmployee: any;
  subscription!: Subscription;
  employeeiddetailsauthorityName = [] as any;
 
  appointmentletter = {} as any;
  fusionEmployeeId: any
  makeDetails = [] as any;
  empinfo = {} as any;
  appointmentLetterTemplate: any | string | ArrayBuffer | null = null;
 
  employeeCompensationDetails = {} as any;
  isvalidate = {} as any;
  DateValid: boolean = true;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  grossby = {} as any;
  // Employeeinfo = {} as any;
  employeedata = {} as any;
  activeemp = [] as any[];
  Active!: number;

  parentStyle = { 'width': '400px' };
  employeeIdNameDetails = [] as any;
  selectedValueInitially = ''
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  authorityName: any
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  EmployeeName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;

  disablebuttonforemployeeid: boolean = true;
  disablebuttonforauthority: boolean = true;


  address = {} as IAddress;
  Status: any;
  employeeForm!: FormGroup;

  SelectDropDown = [
    { name: 'Current Address', code: 'C' },
    { name: 'Permanent Address', code: 'P' }
  ];

  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];

  spinnerLoader= false;
  employeeiddetails: IemployeeDetails[]=[];
  departmentDetails: IDepartment[]=[];
  branchLocations:IIssuelocation[]=[];
  authorityDetails: IEmployeeSignatures[]=[];
  panDetails: IEmployeeIdentity[]=[];
  assestDetails: IAsset[]=[];

  employeeJobDetails: IEmployeeJobInfo | undefined;
  employeeaddress!: IEmployeeProfile;

  selectedEmployee!: IemployeeDetails;

  employeeFullname!: string;
  errorMsg!: string;
  todayDate!: string;
  selectedAuthority: IEmployeeSignatures | undefined;
  authorityFullName!: string;

  constructor(
    private http: HttpService, 
    private router: Router, 
    private authService: AuthService,
    private conformationPopup: OpenModalService, 
    private fb: FormBuilder ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getAllActiveEmployees();
    this.getAllDepartments();
    this.getAllBranchLocations();
    this.getAssertType();
    this.getAuthorityDetails();

    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    // this.getMakeDropDown();
    // this.getIssuedEmployeebyId();
    // this.getAssertType();
    // this.appointmentletter.branchCode = null
    // this.appointmentletter.department = null
    // this.fusionEmployeeId = null
    // this.appointmentletter.make = null
    // this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
  }

  // getAssertType() {
  //   this.subscription = this.http.getData(`AssetType`).subscribe({
  //     next: (data: any) => {
  //       this.AssertTypeGet = data;
  //     }
  //   })
  // }

  // getIssuedEmployeebyId() {
  //   this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " + this.Employeeinfo.lastName
  // }

  // Onclickemployeeid(Value: any) {
  //   if (Value == "") {
  //     this.disablebuttonforemployeeid = true;
  //   }
  //   else {
  //     this.disablebuttonforemployeeid = false;
  //   }
  //   let employeeinfo = this.employeeiddetails.find(
  //     (c: any) => c.fusionEmpId == Value
  //   );
  //   console.log(employeeinfo);
  //   if (Value != employeeinfo && employeeinfo != undefined) {
  //     this.disablebuttonforemployeeid = false;
  //   }
  // }




  onclickDocumentType(Value: any) {
    this.appointmentletter.documentType = Value.value;
  }

  onclickSignature(Value: any) {
    this.appointmentletter.documentType = Value.value;
  }

  toggleDropdown(dropcategory: any) {
    if (dropcategory == 'authority') {
      this.isDropdownOpenauthority = !this.isDropdownOpenauthority;
      if (this.isDropdownOpenauthority) {
      } else {
        this.filteredOptions = [];
      }
    }
    else if (dropcategory == 'empid') {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
      } else {
        this.filteredOptions = [];
      }
    }
  }

  onclickauthority(valueName: any) {
    this.authorityName = valueName
    if (this.authorityName == "") {
      this.disablebuttonforauthority = true;
    }
    else {
      this.disablebuttonforauthority = false;
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.lastName === valueName
    );
    this.authorityDesignation = authorityDesignationdata?.designation ?? null;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName))
    if (this.authorityName) {
      if (this.authorityName === this.signatureAuthorityName) {
        this.disablebuttonforauthority = true
      }
      else {
        this.disablebuttonforauthority = false
      }
    }
    if (authorityDesignationdata == undefined) {
      this.authorityDesignation = null
      this.signatureAuthorityName = null
    }
  }

  //function to block the special charecterstics
  blockSpecialCharacters(event: KeyboardEvent) {
    const blockedCharacters = /[^a-zA-Z0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (blockedCharacters.test(inputChar)) {
      event.preventDefault(); // Block the input of the character 
    }
  }

  // onclickDesignation(data: any) {
  //   this.appointmentletter.authorityName = data.value.firstName + ' ' + data.value.middleName + ' ' + data.value.lastName;
  //   this.authorityDesignation = data.value.designation;
  // }

 
  onclickDesignation(event: any) {
    this.selectedAuthority= event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName
        ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
        : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
    } 
  }

  //get offer letter Authority list 


  private formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }

  //function for the date validations
  Appointmentletterdatevalidation() {
    let date = this.appointmentletter.offerIssueddate;
    let date2 = this.appointmentletter.appointmentSentDate;
    if (date >= date2) {
      this.DateValid = false;
    }
    else {
      this.DateValid = true;
    }
  }

  // onDataClick(value: any) {
  //   this.appointmentletter.appointmentdate = value;
  // }

  //function for the Joining date validation
  // JoiningDateValidation() {
  //   let Joindate = this.appointmentletter.appointmentdate;
  //   let Joindate2 = this.appointmentletter.dateOfJoining;
  //   if (Joindate >= Joindate2) {
  //     this.JoinDateValid = false;
  //   }
  //   else {
  //     this.JoinDateValid = true;
  //   }
  // }

  //get Job Details by empployeeid

  // getMakeDropDown() {
  //   this.subscription = this.http.getData('Make').subscribe({
  //     next: (data: any) => {
  //       this.makeDetails = data as IMake[];
  //     },
  //     error: (reason: any) => {
  //       console.log(reason);
  //     },
  //   });
  // }






  isLoading: boolean = false;
  async onAppointmentLetterSubmit(f: FormGroup) {
    console.log(f)
    this.spinnerLoader= true;
    const data = f.value;
    let fileName = '';
    
    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_BankLoanLetter.pdf`;
    } else {
      console.error('Employee first name or last name is missing');
      return; 
    }

    // const data = this.appointmentletter;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5', 'pdfContent6', 'pdfContent7',
      'pdfContent8', 'pdfContent9', 'pdfContent10', 'pdfContent11', 'pdfContent12', 'pdfContent13'];

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    this.isLoading = true;

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
      pdf.addImage(imageData.imgData,'PNG',0,0,imgWidth,imageData.imgHeight,'','FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData,'PNG',0,0,imgWidth,lastImageData.imgHeight,'','FAST');
    }
    // const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AppointmentLetter_Unsigned.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    this.AppointmentFile = new File([blob],fileName,{type: 'application/pdf',});
    this.sendEmployeeDetails();
    this.postAssetDetails();
    this.uploadAppointLetter();
  }

  // updateEmployeedetails() {
  //   let empdata = {
  //     pt: this.appointmentletter.pf,
  //     generateOffer: false
  //   }
  //   this.subscription = this.http.postdata(`Employeedata/UPDATER`, empdata).subscribe({
  //     next: (data: any) => { },
  //     error: (err: any) => {
  //       console.log(err);
  //     }
  //   })
  // }

  sendEmployeeDetails() {
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.selectedEmployee).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
        console.log(reason);
      },
    });
  }

  // UpdateJobDetails() {
  //   this.employeeJobDetails.department = this.appointmentletter.department;
  //   this.subscription = this.http.postdata('JobDetails/UPDATER', this.employeeJobDetails).subscribe({
  //     next: (data: any) => {
  //     },
  //     error: (reason: any) => {
  //       console.log(reason);
  //     },
  //   });
  // }

  uploadAppointLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Appointment Letter/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.AppointmentFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.postAppointmentDetails(data.path);
          this.AppointmentLetterEmail(data.path);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
        this.conformationPopup.openErrorModal('File upload  is failed')
      },
      complete: ()=>{
        this.spinnerLoader= false;
      }
    });
  }

  //Post Appointment Details
  postAppointmentDetails(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let postAppDetails = {
      empid: this.selectedEmployee.employeeId,
      appointmentSentDate: this.employeeForm.get('appointmentdate')?.value,
      appointmentSentStatus: 'Document Sent',
      appointmentSentBy: loggedInUser.employeeId,
      documentUrl: docUrl,
    };
    this.subscription = this.http.postdata('AppointmentLetter', postAppDetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Appointment Letter Generated Successfully')
        setTimeout(()=>{
          this.navigateDashboard();
        }, 2000);
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
      complete: ()=>{
        this.spinnerLoader= false;
      }
    });
  }

  //appointment letter email
  AppointmentLetterEmail(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      senderEmail: loggedInUser.workEmail,
      personEmail: this.selectedEmployee.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      personName: `${this.selectedEmployee.firstName ?? ""} ${this.selectedEmployee.middleName ?? ""} ${this.selectedEmployee.lastName ?? ""}`,
      appointee: `${this.selectedEmployee.firstName} ${this.selectedEmployee.middleName} ${this.selectedEmployee.lastName}`,
      role: this.employeeJobDetails?.jobRole ?? '',
      department: this.employeeForm.get('department')?.value.departmentName,
      workLocation: (this.employeeJobDetails?.workLocation ?? '') + ", " + (this.employeeJobDetails?.subLocation ?? ''),
      documentUrl: docUrl,
      employeeId: this.selectedEmployee.employeeId,
      dateOfJoining: this.selectedEmployee.dateOfJoining,
      reportingManagerId: this.employeeJobDetails?.reportsto,
      teamManagerId: this.employeeJobDetails?.reportingmanagerId,
      reportingManagerName: `${this.employeeJobDetails?.fName} ${this.employeeJobDetails?.mName} ${this.employeeJobDetails?.lName}`,
      teamManagerName: `${this.employeeJobDetails?.firstName} ${this.employeeJobDetails?.middleName} ${this.employeeJobDetails?.lastName}`
    }
    if (loggedInUser.middleName) {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    this.subscription = this.http.postdata(`CustomEmail/appointmentletter`, emaildetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Email Sent Successfully');
      },
      error: (err: any) => {
        this.spinnerLoader= false;
      },
      complete: ()=>{
        this.spinnerLoader= false;
      }
    })
  }

  //Post Asset Details
  postAssetDetails() {
    const formData= this.employeeForm.value;
    let postAssetDetails = {
      empid: this.selectedEmployee.employeeId,
      assetType: formData.assertType.assetType1,
      maker: null,
      model: formData.model,
      serialNumber:formData.serial,
    };
    this.subscription = this.http.postdata('AssetTable', postAssetDetails).subscribe({
      next: (data: any) => { },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
    });
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // New Impl

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmployeeId: ['', Validators.required],
      appointmentdate: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      department: ['', Validators.required],
      branchCode: ['', Validators.required],
      documentType: ['', Validators.required],
      assertType: ['', Validators.required],
      model: ['', Validators.required],
      serial: ['', Validators.required],
      notes: ['',],
      authorityid: ['', Validators.required],
      jobValid: [false, Validators.requiredTrue],

      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      pinCode: ['']
    });

    this.employeeForm.get('dateOfJoining')?.valueChanges.subscribe(() => {
      this.JoiningDateValidation();
    });
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IemployeeDetails[];
        // this.employeeiddetailsauthorityName = data as IemployeeDetails[];
        this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`, // Concatenate firstName, middleName, lastName
        }));
        
        // this.authorityDetails = this.authorityDetails.map((authority: IAuthority) => ({
        //   ...authority,
        //   fullName: `${authority.firstName ?? ''} ${authority.middleName ?? ''} ${authority.lastName ?? ''}`.trim(), // Concatenate and remove excess spaces
        // }));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllDepartments() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllBranchLocations() {
    this.subscription = this.http.getData(`BranchLocation`).subscribe({
      next: (data: any) => {
        this.branchLocations = data as IIssuelocation[];
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getAuthorityDetails() {
    let offertype = 'Appointment Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim()
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
  
  getAssertType() {
    this.subscription = this.http.getData(`AssetType`).subscribe({
      next: (data: any) => {
        this.assestDetails = data;
      }
    })
  }

  // Onclick(fusionemployeeId: any) {
  //   this.fusionEmployeeId = fusionemployeeId.value.employeeId;
  //   this.appointmentletter = {}
  //   this.appointmentletter = this.employeeiddetails.find(
  //     (c: any) => c.fusionEmpId == fusionemployeeId.value
  //   );
  //   this.disablebuttonforemployeeid = true
  //   this.appointmentletter.dateOfJoining = this.formatDatewithDate(this.appointmentletter?.dateOfJoining)
  //   this.appointmentletter.isVariablePay = this.appointmentletter.isVariablePay
  //   this.appointmentletter.variablePayAmount = this.appointmentletter.variablePayAmount
  //   this.getJobdetails(this.appointmentletter);
  //   this.getEmployeeAddress(this.appointmentletter.employeeId)
  //   this.getIdentityByEmpid(this.appointmentletter.employeeId)
  // }

  onClickEmployee(event: any){
    console.log(event)
    this.selectedEmployee= event.value;
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ? this.selectedEmployee.middleName + ' ' : '') + this.selectedEmployee.lastName;
    this.getJobdetails(this.selectedEmployee.employeeId);
    this.getEmployeeAddress(this.selectedEmployee.employeeId);
    this.getIdentityByEmpid(this.selectedEmployee.employeeId);
    this.getOfferLetterDetails(this.selectedEmployee.employeeId);
  }

  getJobdetails(employeeId: number) {
    this.subscription = this.http.getData(`JobDetails/Empname/${employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.errorMsg = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.reverse()[0];  
          this.employeeJobDetails = res;
          this.errorMsg = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
        // let res = data.reverse()[0];  
        // this.employeeJobDetails = res;
        // Employee.jobRole = res?.jobRole;
        // Employee.workLocation = res.lopcation;
        // Employee.subLocation = res.subLocation;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  
  getEmployeeAddress(employeeId: number) {
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IEmployeeProfile;
      }
    })
  }

  getIdentityByEmpid(employeeId: number) {
    this.subscription = this.http.getData(`IdentityTable/${employeeId}`).subscribe({
      next: (data: any) => {
        this.panDetails = data.filter((item: { identityType: string; }) => item.identityType === 'PAN');
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  offerDetails!: any;
  getOfferLetterDetails(employeeId: number) {
    this.subscription = this.http.getData(`OfferLetter/getbyEmpidNames/${employeeId}`).subscribe({
      next: (data: any) => {
        this.offerDetails = data;
        const today = moment();
        this.todayDate = today.toISOString().split('T')[0];
      }
    })
  }

  onclickSelectAddress(Value: any) {
    const selectedAddress = this.employeeaddress.employeeAddresses.find(
      (address: IEmployeeAddress) => address.type.toLowerCase() === Value.value.toLowerCase()
    );
  
    if (selectedAddress) {
      this.employeeForm.patchValue({
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        pinCode: selectedAddress.zipCode
      });
    }
  }

  JoiningDateValidation() {
    const appointmentDate = this.employeeForm.get('appointmentdate')?.value;
    const dateOfJoining = this.employeeForm.get('dateOfJoining')?.value;
  
    if (appointmentDate && dateOfJoining) {
      const appDate = new Date(appointmentDate);
      const joinDate = new Date(dateOfJoining);
      this.JoinDateValid = joinDate > appDate;
    } else {
      this.JoinDateValid = true; // Don't show error if one of the fields is empty
    }
  }
  
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}