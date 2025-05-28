import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAsset, IDepartment, IEmployeeAddress, IemployeeDetails, IEmployeeIdentity, IEmployeeJobInfo, IEmployeeProfile, IIssuelocation, IMake } from './appointment-letter-model';
import { filter, Subscription } from 'rxjs';
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
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-appointment-letter',
  imports: [CommonModule, LettersTabComponent, SelectModule, DateformatPipe, ReactiveFormsModule, LettersheaderComponent, LetterFooterComponent, TranslateModule, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})

export class AppointmentLetterComponent {
  moduleinfo : string = '';
  subscription!: Subscription; 
  appointmentLetterTemplate: any | string | ArrayBuffer | null = null;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  employeeForm!: FormGroup;
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
  isLoading = false;
  
  SelectDropDown = [
    { name: 'Current Address', code: 'C' },
    { name: 'Permanent Address', code: 'P' }
  ];

  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];


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
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();

    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }
  
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

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/admin/letters/appointment-letter': MODULE_INFOS.APPOINTMENT_LETTER_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IemployeeDetails[];
        this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.fusionEmpId ?? ''} - ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`, // Concatenate firstName, middleName, lastName
        }));
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

  onClickEmployee(event: any){
    console.log(event)
    this.selectedEmployee= event.value;
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ? this.selectedEmployee.middleName + ' ' : '') + this.selectedEmployee.lastName;
    const doj = this.formatDatewithDate(this.selectedEmployee.dateOfJoining);
    this.employeeForm.patchValue({
      dateOfJoining: doj
    });
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

  onclickDesignation(event: any) {
    this.selectedAuthority= event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName
        ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
        : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
    } 
  }

  private formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
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
      this.JoinDateValid = true; 
    }
  }
  
  async onAppointmentLetterSubmit(f: FormGroup) {
    console.log(f)
    this.spinnerLoader= true;
    const data = f.value;
    let fileName = '';
    
    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_AppointmentLetter_Unsigned.pdf`;
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

  sendEmployeeDetails() {
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.selectedEmployee).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
    });
  }

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

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}