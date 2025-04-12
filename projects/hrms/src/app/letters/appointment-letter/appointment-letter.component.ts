import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAddress, IDepartment, IemployeeDetails, IIssuelocation, IMake } from './appointment-letter-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { IAuthority } from '../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";
import { OpenModalService } from '../../services/open-modal.service';
@Component({
  selector: 'app-appointment-letter',
  imports: [CommonModule, LettersTabComponent, Select, DateformatPipe, ReactiveFormsModule, LettersheaderComponent],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})

export class AppointmentLetterComponent {
  selectedEmployee: any;
  subscription!: Subscription;
  employeeiddetails = [] as any;
  employeeiddetailsauthorityName = [] as any;
  departmentDetails = [] as any;
  appointmentletter = {} as any;
  fusionEmployeeId: any
  makeDetails = [] as any;
  empinfo = {} as any;
  appointmentLetterTemplate: any | string | ArrayBuffer | null = null; 
  employeeJobDetails = {} as any; 
  employeeCompensationDetails = {} as any; 
  isvalidate = {} as any;
  DateValid: boolean = true;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  issueLocationdata = [] as any;
  grossby = {} as any;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  activeemp = [] as any[];
  Active!: number;
  AssertTypeGet = [] as any;
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
  authorityDetails = [] as any;
  disablebuttonforemployeeid: boolean = true; 
  disablebuttonforauthority: boolean = true;
  employeeaddress = [] as any;
  panDetails: any;
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
  // @ViewChild('success') success: any;
  // @ViewChild('successhide') private readonly successhide!: NgbModal;
  // @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  // @HostListener('document:click', ['$event.target'])
  
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private router: Router,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
    private elementRef: ElementRef,private fb: FormBuilder, 
    config: NgbModalConfig, private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getEmployeeId();
    this.getDepartment();
    this.getMakeDropDown();
    this.getIssueLocation();
    this.getIssuedEmployeebyId();
    this.getAssertType();
    this.getAuthorityDetails();
    this.appointmentletter.branchCode = null
    this.appointmentletter.department = null
    this.fusionEmployeeId = null
    this.appointmentletter.make = null
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    console.log(this.Employeeinfo); 
  }
  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmployeeId: ['', Validators.required],
      fullName: ['', Validators.required],
      appointmentdate: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      department: ['', Validators.required],
      branchCode: ['', Validators.required],
      documentType: ['', Validators.required],
      notes: ['',],
      authorityid: ['', Validators.required]
    });
  }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  
  getAssertType() {
    this.subscription = this.http.getData(`AssetType`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.AssertTypeGet = data;
      }
    })
  }
  

  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " + this.Employeeinfo.lastName
    console.log(this.employeedata);
  }


  Onclickemployeeid(Value: any) {
    console.log(Value);
    if (Value == "") {
      this.disablebuttonforemployeeid = true
    }
    else {
      this.disablebuttonforemployeeid = false
    }
    let employeeinfo = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == Value
    );
    console.log(employeeinfo);
    if (Value != employeeinfo && employeeinfo != undefined) {
      this.disablebuttonforemployeeid = false
    }

  }


  Onclick(fusionemployeeId: any) {
    this.fusionEmployeeId = fusionemployeeId.value;
    console.log(fusionemployeeId);
    this.appointmentletter = {}
    this.appointmentletter = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId.value
    );
    this.disablebuttonforemployeeid = true
    this.appointmentletter.dateOfJoining = this.formatDatewithDate(this.appointmentletter.dateOfJoining)
    this.appointmentletter.isVariablePay = this.appointmentletter.isVariablePay
    this.appointmentletter.variablePayAmount = this.appointmentletter.variablePayAmount
    this.getJobdetails(this.appointmentletter);
    this.getEmployeeAddress(this.appointmentletter.employeeId)
    this.getIdentityByEmpid(this.appointmentletter.employeeId)
    console.log(this.appointmentletter);

  }


  
  getIdentityByEmpid(Value: any) {
    let EmployeeId = Value
    this.subscription = this.http.getData(`IdentityTable/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.panDetails = data.filter((item: { identityType: string; }) => item.identityType === 'PAN');
        console.log(this.panDetails);

      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }
  onclickDocumentType(Value: any) {
    console.log(Value);
    this.appointmentletter.documentType = Value.value
    console.log(this.appointmentletter.documentType);
  }
  onclickSignature(Value: any) {
    console.log(Value);
    this.appointmentletter.documentType = Value.value
    console.log(this.appointmentletter.documentType);
  }

  
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value
    console.log(Value);

    console.log(EmployeeId);

    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeaddress = data as IAddress[];
      }
    })
  }

  
  
  onclickSelectAddress(Value: any) {
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value.value.toLowerCase())

    }
    console.log(this.address);
    this.appointmentletter.addressLine1 = this.address.addressLine1
    this.appointmentletter.addressLine2 = this.address.addressLine2
    this.appointmentletter.city = this.address.city
    this.appointmentletter.state = this.address.state
    this.appointmentletter.country = this.address.country
    this.appointmentletter.pinCode = this.address.zipCode


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
      this.disablebuttonforauthority = true
    }
    else {
      this.disablebuttonforauthority = false
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.lastName === valueName
    );
    console.log(authorityDesignationdata);
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName))
    console.log(this.authorityDesignation);
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
      console.log(this.authorityDesignation);
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
  onclickDesignation(data:any) {
      this.appointmentletter.authorityName = data.value.firstName + ' ' + data.value.middleName + ' ' + data.value.lastName;
      this.authorityDesignation = data.value.designation;
    
  }
  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Appointment Letter';
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
  private formatDatewithDate(date: Date): string | void {
    if (date) {

      return moment(date).format('YYYY-MM-DD');
    }

  }

  //function for the date validations
  Appointmentletterdatevalidation() {

    let date = this.appointmentletter.offerIssueddate
    console.log(date);
    let date2 = this.appointmentletter.appointmentSentDate
    console.log(date2);
    if (date >= date2) {
      this.DateValid = false
    }
    else {
      this.DateValid = true
    }

  }
  onDataClick(value: any) {
    this.appointmentletter.appointmentdate = value;
    console.log(this.appointmentletter.appointmentdate);
    
  }
  //function for the Joining date validation
  JoiningDateValidation() {
    let Joindate = this.appointmentletter.appointmentdate
    console.log(Joindate);
    let Joindate2 = this.appointmentletter.dateOfJoining
    console.log(Joindate2);
    if (Joindate >= Joindate2) {
      this.JoinDateValid = false
    }
    else {
      this.JoinDateValid = true
    }
  }


  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let res = data[0];
          this.employeeJobDetails = res;
          console.log(this.employeeJobDetails);

          Employee.jobRole = res?.jobRole;

          Employee.workLocation = res.lopcation;
          Employee.subLocation = res.subLocation;
          console.log(Employee.workLocation);

          console.log(Employee.jobRole);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  

  getMakeDropDown() {
    this.subscription = this.http.getData('Make').subscribe({
      next: (data: any) => {
        console.log(data);
        this.makeDetails = data as IMake[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }


  getIssueLocation() {
    this.subscription = this.http.getData(`BranchLocation`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.issueLocationdata = data as IIssuelocation
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }
  

  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IemployeeDetails[];
          
          console.log(this.employeeiddetails);
          this.employeeiddetailsauthorityName = data as IemployeeDetails[];
       
          this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
            ...emp,
            fullName: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`, // Concatenate firstName, middleName, lastName
          }));
          this.authorityDetails = this.authorityDetails.map((authority: IAuthority) => ({
            ...authority,
            fullName: `${authority.firstName ?? ''} ${authority.middleName ?? ''} ${authority.lastName ?? ''}`.trim(), // Concatenate and remove excess spaces
          }));
  
      console.log(this.employeeiddetails);
        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }


  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data as IDepartment[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  isLoading: boolean = false;
  async onAppointmentLetterSubmit() {
    const data = this.appointmentletter;
    console.log(data);
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
    const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AppointmentLetter_Unsigned.pdf`;
    pdf.save(fileName);

    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    this.AppointmentFile = new File(
      [blob],
      fileName,
      {
        type: 'application/pdf',
      }
    );

    this.sendEmployeeDetails();
    this.postAssetDetails();
    this.uploadAppointLetter();

  }


  updateEmployeedetails() {
    let empdata = {
     
      pt: this.appointmentletter.pf,
      generateOffer: false

    }
    console.log(empdata);
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, empdata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  
  sendEmployeeDetails() {
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', this.appointmentletter)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

 
  UpdateJobDetails() {
    this.employeeJobDetails.department = this.appointmentletter.department;
    this.subscription = this.http
      .postdata('JobDetails/UPDATER', this.employeeJobDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  
  uploadAppointLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Appointment Letter/${this.appointmentletter.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.AppointmentFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postAppointmentDetails(data.path);
            this.AppointmentLetterEmail(data.path);
            console.log(data);

          }
        },
        error: (reason: any) => {
          console.log(reason);
          // this.dataFailureMsg('file upload  is failed');
          this.conformationPopup.openErrorModal('File upload  is failed')
        },
      });
  }

  //Post Appointment Details
  postAppointmentDetails(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let postAppDetails = {
      empid: this.appointmentletter.employeeId,
      appointmentSentDate: this.appointmentletter.appointmentdate,
      appointmentSentStatus: 'Document Sent',
      appointmentSentBy: loggedInUser.employeeId,
      documentUrl: docUrl,
    };
    console.log(postAppDetails);
    this.subscription = this.http
      .postdata('AppointmentLetter', postAppDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          //this.dataSuccessMsg('Appointment Letter Generated Successfully');
          this.conformationPopup.openSuccessModal('Appointment Letter Generated Successfully')
          this.router.navigate(['/admin']);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }


  //appointment letter email
  AppointmentLetterEmail(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      senderEmail: loggedInUser.workEmail,
      personEmail: this.appointmentletter.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      personName: `${this.appointmentletter.firstName ?? ""} ${this.appointmentletter.middleName ?? ""} ${this.appointmentletter.lastName ?? ""}`,
      appointee: `${this.appointmentletter.firstName} ${this.appointmentletter.middleName} ${this.appointmentletter.lastName}`,
      role: this.appointmentletter.jobRole,
      department: this.appointmentletter.department,
      workLocation: this.appointmentletter.workLocation + ", " + this.appointmentletter.subLocation,
      documentUrl: docUrl,
      employeeId: this.appointmentletter.employeeId,
      dateOfJoining: this.appointmentletter.dateOfJoining,
      reportingManagerId: this.employeeJobDetails.reportsto,
      teamManagerId: this.employeeJobDetails.reportingmanagerId,
      reportingManagerName: `${this.employeeJobDetails.fName} ${this.employeeJobDetails.mName} ${this.employeeJobDetails.lName}`,
      teamManagerName: `${this.employeeJobDetails.firstName} ${this.employeeJobDetails.middleName} ${this.employeeJobDetails.lastName}`
    }

    if (loggedInUser.middleName) {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    console.log(emaildetails);
    this.subscription = this.http.postdata(`CustomEmail/appointmentletter`, emaildetails).subscribe({
      next: (data: any) => {
        console.log(data);
        this.conformationPopup.openSuccessModal('Email Sent Successfully');
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //Post Asset Details
  postAssetDetails() {
    let postAssetDetails = {
      empid: this.appointmentletter.employeeId,
      assetType: this.appointmentletter.asserttype,
      maker: null,
      model: this.appointmentletter.model,
      serialNumber: this.appointmentletter.serial,
    };
    console.log(postAssetDetails);

    this.subscription = this.http
      .postdata('AssetTable', postAssetDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);


        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
