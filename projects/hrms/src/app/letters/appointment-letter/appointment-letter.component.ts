import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAsset, IDepartment, IEmployeeAddress, IemployeeDetails, IEmployeeIdentity, IEmployeeJobInfo, IEmployeeProfile, IIssuelocation, IMake } from './appointment-letter-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildAppointmentLetterDoc } from '../../letters-builder-files/appointment-letter-pdf.builder';
import moment from 'moment';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployeeSignatures } from '../letters.modal';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IAssertsType } from '../../Interfaces/job-model';
import { SignalsService } from '../../services/signals.service';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
@Component({
  selector: 'app-appointment-letter',
  imports: [CommonModule, SelectModule, DateformatPipe, ReactiveFormsModule, TranslateModule, NgbPopoverModule, LetterFooterComponent, LettersheaderComponent],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})

export class AppointmentLetterComponent implements OnInit,OnDestroy {
 subscription!: Subscription;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  employeeForm!: FormGroup;
  spinnerLoader = false;
  employeeiddetails: IemployeeDetails[] = [];
  departmentDetails: IDepartment[] = [];
  branchLocations: IIssuelocation[] = [];
  authorityDetails: IEmployeeSignatures[] = [];
  panDetails: IEmployeeIdentity[] = [];
  assestDetails: IAsset[] = [];
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
    private signalService: SignalsService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllActiveEmployees();
    this.getAllDepartments();
    this.getAllBranchLocations();
    this.getAssertType();
    this.getAuthorityDetails();
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
        this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.fusionEmpId ? emp.fusionEmpId + ' -' :''} ${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''}`, // Concatenate firstName, middleName, lastName
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? '')); 
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

  onClickEmployee(event: any) {
    console.log(event)
    this.selectedEmployee = event.value;
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ? this.selectedEmployee.middleName + ' ' : '') + this.selectedEmployee.lastName;
    const doj = this.formatDatewithDate(this.selectedEmployee.dateOfJoining);
    this.employeeForm.patchValue({
      dateOfJoining: doj
    });
    this.getJobdetails(this.selectedEmployee.employeeId);
    this.getEmployeeAddress(this.selectedEmployee.employeeId);
    this.getIdentityByEmpid(this.selectedEmployee.employeeId);
    this.getOfferLetterDetails(this.selectedEmployee.employeeId);
    this.getAssestTypeByEmployeeId(this.selectedEmployee.employeeId);
  }

  assesttypegetdetails = [] as IAssertsType[];
  appointmentletter = {} as any;
  //function to get assest type by employeeid
  getAssestTypeByEmployeeId(EmployeeId: number) {
    this.subscription = this.http
      .getData(`AssetTable/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          this.assesttypegetdetails = data as IAssertsType[];
          if (this.assesttypegetdetails?.length > 0) {
            this.appointmentletter.asserttype = data[0].assetType;
            this.appointmentletter.model = data[0].model;
            this.appointmentletter.serial = data[0].serialNumber;
          }

        },
      });
  }

  getJobdetails(employeeId: number) {
    this.subscription = this.http.getData(`JobDetails/Empname/${employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.errorMsg = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.sort((a: any, b: any) => b.effectiveDate - a.effectiveDate)[0];
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
        this.appointmentletter = data;
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
    this.selectedAuthority = event.value;
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

      this.appointmentletter.addressLine1 = selectedAddress.addressLine1;
      this.appointmentletter.addressLine2 = selectedAddress.addressLine2;
      this.appointmentletter.city = selectedAddress.city;
      this.appointmentletter.state = selectedAddress.state;
      this.appointmentletter.country = selectedAddress.country;
      this.appointmentletter.zipCode = selectedAddress.zipCode;
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
    this.spinnerLoader = true;

    if (!this.selectedEmployee?.firstName || !this.selectedEmployee?.lastName) {
      console.error('Employee first name or last name is missing');
      this.spinnerLoader = false;
      return;
    }

    const fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${Date.now()}_AppointmentLetter_Unsigned.pdf`;
    const isSoftCopy = f.value.documentType?.value === true;

    const [backgroundImageBase64, verdanaItalic, verdanaSemiBold] = await Promise.all([
      isSoftCopy ? this.fetchImageAsBase64('/images/snad-new-letter-bg.png') : Promise.resolve(undefined as string | undefined),
      this.getFileBase64('/fonts/Verdana Italic.ttf'),
      this.getFileBase64('/fonts/verdana-pro-semi-bold.ttf'),
    ]);

    const pm = (pdfMake as any).default ?? pdfMake;
    const mergedVfs: Record<string, string> = { ...customVfs };
    if (verdanaItalic)   mergedVfs['VerdanaItalic.ttf']   = verdanaItalic;
    if (verdanaSemiBold) mergedVfs['VerdanaSemiBold.ttf'] = verdanaSemiBold;
    pm.addVirtualFileSystem(mergedVfs);
    pm.setFonts({
      VERDANA: { normal: 'VerdanaNow.ttf', bold: 'VerdanaNowBold.ttf', italics: verdanaItalic ? 'VerdanaItalic.ttf' : 'VerdanaNow.ttf', bolditalics: 'VerdanaNowBold.ttf' },
      VERDANABOLD: { normal: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', bold: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', italics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', bolditalics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf' },
      Autography: { normal: 'Autography.otf', bold: 'Autography.otf', italics: 'Autography.otf', bolditalics: 'Autography.otf' },
    });

    const docDef = buildAppointmentLetterDoc({
      employeeFullname: this.employeeFullname,
      appointmentDate: f.value.appointmentdate,
      addressLine1: this.appointmentletter.addressLine1 || '',
      addressLine2: this.appointmentletter.addressLine2 || '',
      city: this.appointmentletter.city || '',
      state: this.appointmentletter.state || '',
      country: this.appointmentletter.country || '',
      pinCode: this.appointmentletter.zipCode || '',
      jobRole: this.employeeJobDetails?.jobRole || '',
      authorityFullName: this.authorityFullName || '',
      authorityDesignation: this.selectedAuthority?.designation || '',
      panNumber: this.panDetails?.[0]?.identityNumber || '',
      dateOfJoining: f.value.dateOfJoining || '',
      backgroundImageBase64,
      useVerdanaFont: true,
      useAutographyFont: true,
    });

    try {
      const blob: Blob = await pm.createPdf(docDef).getBlob();

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);

      this.AppointmentFile = new File([blob], fileName, { type: 'application/pdf' });
      this.sendEmployeeDetails();
      this.uploadAppointLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.conformationPopup.openErrorModal('Failed to generate Appointment Letter');
    }
  }

  private fetchImageAsBase64(url: string): Promise<string> {
    return fetch(url)
      .then(res => res.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

  private async getFileBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch {
      return null;
    }
  }

  sendEmployeeDetails() {
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.selectedEmployee).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
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
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload  is failed')
      },
      complete: () => { }
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
      status: 'Generated',
      addressType: this.employeeForm.get('SelectDropDown')?.value,
      note: this.employeeForm.get('notes')?.value,
      authoritySignature: this.selectedAuthority?.employeeId,
      docType: this.employeeForm.get('documentType')?.value.value,
      issuedDate: moment(this.employeeForm.get('appointmentdate')?.value).format(
        'YYYY-MM-DD'
      ),
      jobId: this.employeeJobDetails?.id,
    };
    this.http.postdata('AppointmentLetter', postAppDetails).subscribe({
      next: () => { 
        this.signalService.AppointmentLetterNavCountSignal.set(true);
      },
      error: () => { 
        this.signalService.AppointmentLetterNavCountSignal.set(true);
      },
      complete: () => {
          this.signalService.AppointmentLetterNavCountSignal.set(true);
        },
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
      teamManagerName: `${this.employeeJobDetails?.firstName} ${this.employeeJobDetails?.middleName} ${this.employeeJobDetails?.lastName}`,
      generatedBy:loggedInUser.employeeId,
      generatedDate: new Date().toISOString(),
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
        this.resetForm();
        this.spinnerLoader = false;
        this.conformationPopup.openSuccessModal('Email has been sent successfully');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        this.resetForm();
        this.spinnerLoader = false;
      },
    })
  }

  //Post Asset Details
  assertdata = {} as any;
  postAssetDetails() {
    const formData = this.employeeForm.value;
    let postAssetDetails = {
      empid: this.selectedEmployee.employeeId,
      assetType: formData.assertType.assetType1,
      maker: null,
      model: formData.model,
      serialNumber: formData.serial,
    };
    this.subscription = this.http.postdata('AssetTable', postAssetDetails).subscribe({
      next: (data: any) => {
        this.assertdata = data;
        this.spinnerLoader= false;
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
    });
  }

  private resetForm() {
    this.initializeForm();
    this.employeeFullname = '';
    this.selectedEmployee = null!;
    this.employeeJobDetails = undefined;
    this.employeeaddress = null!;
    this.selectedAuthority = undefined;
    this.authorityFullName = '';
    this.panDetails = [];
    this.appointmentletter = {};
    this.assesttypegetdetails = [];
    this.offerDetails = null;
    this.errorMsg = '';
  }

  navigateDashboard() {
    this.router.navigate(['/employee-management/all-employees'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}