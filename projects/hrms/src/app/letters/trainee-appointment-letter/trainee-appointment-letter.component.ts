import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, IDepartment, IemployeeDetails, IIssuelocation, IMake } from '../appointment-letter/appointment-letter-model';
import moment from 'moment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-trainee-appointment-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent, TranslateModule ,NgbPopoverModule],
  templateUrl: './trainee-appointment-letter.component.html',
  styleUrl: './trainee-appointment-letter.component.scss'
})

export class TraineeAppointmentLetterComponent {
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];
  SelectDropDown: { name: string, code: string }[] = [
    { name: 'Current Address', code: 'c' },
    { name: 'Permanent Address', code: 'p' },
  ];
  subscription!: Subscription;
  employeeiddetails = [] as any;
  traineeAppointmentletterData = {} as any;
  AppointmentFile!: File;
  fusionEmployeeId: any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  filteredOptions = [] as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  isDisabled!: boolean;
  employeeJobDetails = {} as any; //to store the values of jobDetails
  employeeCompensationDetails = {} as any; //to store the values of compensationDetails
  employeeaddress = [] as any;
  // SelectDropDown: any;
  departmentDetails = [] as any;
  issueLocationdata = [] as any;
  AssertTypeGet = [] as any;
  authorityDetails = [] as any;
  authorityDesignation!: string | null;
  employeeiddetailsauthorityName = [] as any;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  makeDetails = [] as any;
  Status: any
  employeeForm!: FormGroup;
  addressFlag = false;
  address = {} as IAddress;
  todayDate!: string;
  spinnerLoader= false;
  constructor(private http: HttpService, private router: Router, private authService: AuthService, private fb: FormBuilder,
    private conformationPopup: OpenModalService,) {
  }

  ngOnInit(): void {
    this.traineeAppointmentletterData.make = null;
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.initializeForm();
    this.getEmployeeId();
    this.getDepartment();
    this.getMakeDropDown();
    this.getIssueLocation();
    this.getIssuedEmployeebyId();
    this.getAssertType();
    this.getAuthorityDetails();
    this.employeeForm.get('dateOfJoining')?.valueChanges.subscribe((date: string) => {
      this.traineeAppointmentletterData.dateOfJoining = date;
    });
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      // fullName: ['', Validators.required],
      appointmentdate: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      department: ['', Validators.required],
      branchCode: ['', Validators.required],
      // Documenttype: ['', Validators.required],
      asserttype: ['', Validators.required],
      // note: ['', Validators.required],
      model: ['', Validators.required],
      serial: ['', Validators.required],
      signatureAuthority: ['', Validators.required],
      documentType: ['', Validators.required],
    });
  }

  //function for assert type get
  getAssertType() {
    this.subscription = this.http.getData(`AssetType`).subscribe({
      next: (data: any) => {
        this.AssertTypeGet = data;
      }
    })
  }

  //function for issedby
  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " + this.Employeeinfo.lastName
  }

  Onclickemployeeid(Value: any) {
    this.traineeAppointmentletterData.branchCode = null;
    if (Value == "") {
      this.disablebuttonforemployeeid = true;
    }
    else {
      this.disablebuttonforemployeeid = false;
    }
    let employeeinfo = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == Value
    );
    if (Value != employeeinfo && employeeinfo != undefined) {
      this.disablebuttonforemployeeid = false
    }
  }

  onDataClick(value: any) {
    this.traineeAppointmentletterData.appointmentdate = value;
  }

  onclickDocumentType(Value: any) {
    this.traineeAppointmentletterData.documentType = Value.value;
  }

  Onclick(fusionemployeeId: any) {
    if(fusionemployeeId.value){
      this.fusionEmployeeId = fusionemployeeId.value;
      this.traineeAppointmentletterData = {}
      this.traineeAppointmentletterData = this.employeeiddetails.find(
        (c: any) => c.employeeId == fusionemployeeId.value
      );
      this.disablebuttonforemployeeid = true
      this.employeeForm.patchValue({
        fusionEmpId: this.traineeAppointmentletterData.employeeId,
        appointmentdate: this.traineeAppointmentletterData.appointmentdate,
        dateOfJoining: this.formatDatewithDate(this.traineeAppointmentletterData.dateOfJoining),
        department: this.traineeAppointmentletterData.department,
        branchCode: this.traineeAppointmentletterData.branchCode,
        Documenttype: this.traineeAppointmentletterData.documentType,
        asserttype: this.traineeAppointmentletterData.assetType,
        note: this.traineeAppointmentletterData.note,
        model: this.traineeAppointmentletterData.model,
        serial: this.traineeAppointmentletterData.serialNumber,
        signatureAuthority: this.traineeAppointmentletterData.authorityName,
      });
      console.log(this.employeeForm)
      console.log(this.traineeAppointmentletterData);
      this.getJobdetails(this.traineeAppointmentletterData);
      this.getCompensationDetails(this.traineeAppointmentletterData);
      this.getEmployeeAddress(this.traineeAppointmentletterData.employeeId);
      this.getOfferdetails(this.traineeAppointmentletterData.employeeId);
    }
    else{
      this.employeeForm.reset();
      this.traineeAppointmentletterData = {};
    }
 
  }
  
getOfferdetails(Value: any) {
  this.subscription = this.http.getData(`TraineeOfferLetter/getbyEmpidNames/${Value}`).subscribe({
    next: (data: any) => {
      this.traineeAppointmentletterData.offerIssueddate = data.offerSentDate;
      console.log(this.traineeAppointmentletterData.offerIssueddate);
    const today = moment(this.traineeAppointmentletterData.offerIssueddate);
    this.todayDate = today.toISOString().split('T')[0];
    }
  })
}


  //function to get the address 
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value;
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
      }
    })
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  onclickSelectAddress(Value: any) {
    this.addressFlag = true;
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value.value)
    }
    this.traineeAppointmentletterData.addressLine1 = this.address.addressLine1;
    this.traineeAppointmentletterData.addressLine2 = this.address.addressLine2;
    this.traineeAppointmentletterData.city = this.address.city;
    this.traineeAppointmentletterData.state = this.address.state;
    this.traineeAppointmentletterData.country = this.address.country;
    this.traineeAppointmentletterData.zipCode = this.address.zipCode;
  }

  toggleDropdown(dropcategory: any) {
    this.traineeAppointmentletterData.branchCode = null
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

  //function to block the special charecterstics
  blockSpecialCharacters(event: KeyboardEvent) {
    const blockedCharacters = /[^a-zA-Z0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (blockedCharacters.test(inputChar)) {
      event.preventDefault(); // Block the input of the character 
    }
  }

  //function to select the current address 
  onclickDesignation(data: any) {
    this.traineeAppointmentletterData.authorityName = data.value.firstName + ' ' + data.value.middleName + ' ' + data.value.lastName;
    this.authorityDesignation = data.value.designation;
    console.log(this.employeeForm)
  }

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Trainee Appointment Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName ? authority.middleName + ' ' : ''}${authority.lastName}` // Concatenate first, middle, last name and trim any extra spaces
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  private formatDatewithDate(date: any): string | null {
    if (!date) return null;
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // format: YYYY-MM-DD
  }
  
  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let res = data[0];
        this.employeeJobDetails = res;
        Employee.jobRole = res?.jobRole;
        Employee.workLocation = res?.lopcation;
        Employee.subLocation = res?.subLocation;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //get Compensation Details by empployeeid
  getCompensationDetails(Employee: any) {
    this.subscription = this.http.getData(`Compensationdata/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let res = data.reverse()[0];
        this.employeeCompensationDetails = res;
        Employee.salary = res.compensationamount;
        Employee.salaryType = res.compensationType;
        Employee.salaryMode = res.compensationMode;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to get make dropdown
  getMakeDropDown() {
    this.subscription = this.http.getData('Make').subscribe({
      next: (data: any) => {
        this.makeDetails = data as IMake[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to get isssuelocation drop down
  getIssueLocation() {
    this.subscription = this.http.getData(`BranchLocation`).subscribe({
      next: (data: any) => {
        this.issueLocationdata = data as IIssuelocation
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //get employee ids for Active Employees Drop Dowm
  getEmployeeId() {
    this.subscription = this.http.getData('TraineeOfferLetter/traineeActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IemployeeDetails[];
        this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`,
        }));
        //  this.EmployeeName=this.employeeiddetails.firstName+" "+this.employeeiddetails.lastName
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to get department dropdown
  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentDetails = data as IDepartment[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  isLoading: boolean = false;
  async onTraineeAppointmentLetterSubmit() {
    this.spinnerLoader= true;
    const data = this.traineeAppointmentletterData;
    //data.dateOfJoining = this.formatDate(data.dateOfJoining);
    //data.appointmentdate = this.formatDate(data.appointmentdate);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5', 'pdfContent6', 'pdfContent7',
      'pdfContent8', 'pdfContent9', 'pdfContent10', 'pdfContent11']; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
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
    const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_TraineeAppointmentLetter_Unsigned.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    this.AppointmentFile = new File([blob],fileName,{type: 'application/pdf',});
    this.sendEmployeeDetails();
    this.postAssetDetails();
    this.uploadAppointLetter();
  }

  //Update Employee details along with Appointment details
  sendEmployeeDetails() {
    this.traineeAppointmentletterData.empStatus = 'Trainee Active'
    this.traineeAppointmentletterData.emptype = 'Trainee '
    this.traineeAppointmentletterData.branchCode = this.traineeAppointmentletterData.branchCode
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.traineeAppointmentletterData).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
       this.spinnerLoader= false;
      },
    });
  }

  //to send JobDetails with Department
  UpdateJobDetails() {
    this.employeeJobDetails.department = this.traineeAppointmentletterData.department;
    this.subscription = this.http.postdata('JobDetails/UPDATER', this.employeeJobDetails).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //Post Appointment Details
  postAppointmentDetails(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let postAppDetails = {
      employeeId: this.traineeAppointmentletterData.employeeId,
      appointmentsentDate: this.traineeAppointmentletterData.appointmentdate,
      appointmentSentStatus: 'Document Sent',
      appointmentSentBy: loggedInUser.employeeId,
      documentURL: docUrl,
      isDeleted: false,
    };
    this.subscription = this.http.postdata('TraineeAppointmentLetter', postAppDetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Appointment Letter Generated Successfully')
        this.router.navigate(['/admin/dashboard']);
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
    });
  }

  //to Upload Appoinment letter
  uploadAppointLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Trainee Appointment Letter/${this.traineeAppointmentletterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.AppointmentFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.postAppointmentDetails(data.path);
          this.AppointmentLetterEmail(data.path);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
        this.conformationPopup.openErrorModal('File upload Failed');
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
      personEmail: this.traineeAppointmentletterData.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      appointee: `${this.traineeAppointmentletterData.firstName} ${this.traineeAppointmentletterData.middleName} ${this.traineeAppointmentletterData.middleName}`,
      role: this.traineeAppointmentletterData.jobRole,
      department: this.traineeAppointmentletterData.department,
      workLocation: this.traineeAppointmentletterData.workLocation + ", " + this.traineeAppointmentletterData.subLocation,
      documentUrl: docUrl,
      employeeId: this.traineeAppointmentletterData.employeeId,
      dateOfJoining: this.traineeAppointmentletterData.dateOfJoining
    }
    if (loggedInUser.middleName) {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${this.traineeAppointmentletterData.firstName} ${this.traineeAppointmentletterData.middleName} ${this.traineeAppointmentletterData.lastName}`
    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${this.traineeAppointmentletterData.firstName} ${this.traineeAppointmentletterData.lastName}`
    }
    this.subscription = this.http.postdata(`CustomEmail/appointmentletter`, emaildetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Email Sent Successfully')
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //Post Asset Details
  postAssetDetails() {
    let postAssetDetails = {
      empid: this.traineeAppointmentletterData.employeeId,
      assetType: this.traineeAppointmentletterData.asserttype,
      maker: null,
      model: this.traineeAppointmentletterData.model,
      serialNumber: this.traineeAppointmentletterData.serial,
    };
    this.subscription = this.http.postdata('AssetTable', postAssetDetails).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  onDepartmentChange(selectedDepartment: any) {
    this.traineeAppointmentletterData.department = selectedDepartment?.departmentName || '';
  }

  onAssetChange(selectedAsset: any) {
    this.traineeAppointmentletterData.asserttype = selectedAsset?.assetType1 || '';
  }

  onModelChange(): void {
    const modelControl = this.employeeForm.get('model');
    this.traineeAppointmentletterData.model = modelControl?.value || '';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}