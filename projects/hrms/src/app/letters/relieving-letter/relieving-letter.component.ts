import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from '../letters.modal';
import { environment } from '../../../environments/environment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildRelievingLetterDoc } from '../../letters-builder-files/relieving-letter.builder';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
@Component({
  selector: 'app-relieving-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './relieving-letter.component.html',
  styleUrl: './relieving-letter.component.scss',
})

export class RelievingLetterComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  result = {} as any;
  RelievingFile!: File;
  gender: any;
  gender2: any;
  gender3: any
  employeeForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee!: IEmployeeDetails;
  signatureAuthorityDetails: IEmployeeSignatures[] = [];
  selectedAuthority!: IEmployeeSignatures;
  selectedEmployeeJobDetails!: IEmployeeJobDetails;
  employeeFullname!: string;
  jobErrorMessage!: string;
  authorityFullName!: string;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];
  spinnerLoader = false;

  constructor(private router: Router, private fb: FormBuilder, private http: HttpService, 
    private authService: AuthService, private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.initializeForm();
    this.getAllInActiveEmployees();
    this.getAuthorityDetails();
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      employee: ['', Validators.required],
      documentType: ['', Validators.required],
      dateofRelieving: ['', Validators.required],
      signatureAuthority: ['', Validators.required],
      lastWorkingDate: [''],
      jobValid: [false, Validators.requiredTrue]
    });
  }

  navigateDashboard() {
    this.router.navigate(['/employee-management/active/employees'])
  }

  DateValidation() {
    const relievingDate = new Date(this.employeeForm.get('dateofRelieving')?.value);
    const joiningDate = new Date(this.selectedEmployeeJobDetails?.effectiveDate);
    if (relievingDate <= joiningDate) {
      this.jobErrorMessage = 'Relieving issued date must be after the employee joining date.';
      this.employeeForm.get('jobValid')?.setValue(false);
    } else {
      this.jobErrorMessage = '';
      this.employeeForm.get('jobValid')?.setValue(true);
    }
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  getAllInActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/InactiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        }).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'Relieving Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.signatureAuthorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName ? authority.middleName + ' ' : ''}${authority.lastName}`
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  onClickEmployee(event: any) {
    this.selectedEmployee = event.value;
    this.getEmployeeStatusChanges();
    const isContractorProspective = this.selectedEmployee.empType?.toLowerCase() === 'contract' && 
    this.selectedEmployee.empstatus?.toLowerCase() === 'prospective contract';
    if (isContractorProspective) {
      this.employeeForm.get('lastWorkingDate')?.setValidators([Validators.required]);
    } else {
      this.employeeForm.get('lastWorkingDate')?.clearValidators();
      if (this.selectedEmployee.lastworkingday) {
        this.selectedEmployee.lastworkingday = this.selectedEmployee.lastworkingday;
      }
    }
    this.employeeForm.get('lastWorkingDate')?.updateValueAndValidity();
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ?? '') + ' ' + this.selectedEmployee.lastName;
    if (this.selectedEmployee.gender === 'Male') {
      this.gender = "his";
      this.gender2 = 'he';
      this.gender3 = 'Mr.';
    } else {
      this.gender = "her";
      this.gender2 = 'she';
      this.gender3 = 'Ms.';
    }
    this.getJobdetails(this.selectedEmployee.employeeId);
  }

  getJobdetails(employeeId: any) {
    this.subscription = this.http.getData(`JobDetails/${employeeId}`).subscribe({
      next: (data: any) => {
        let latestJob: any;
        if (this.selectedEmployee.empType?.toLowerCase() === 'contract' && this.selectedEmployee.empstatus.toLowerCase() === 'prospective contract') {
          const validRecords = data.filter((d: { effectiveDate: any; }) => !!d.effectiveDate);
          latestJob = validRecords[0];
        }
        else {
          const today = new Date(this.selectedEmployee.lastworkingday);
          latestJob = data?.filter((job: { effectiveDate: any; }) => new Date(job.effectiveDate) <= today).sort(
            (a: { effectiveDate: any; }, b: { effectiveDate: any; }) => new Date(b.effectiveDate).getTime() 
            - new Date(a.effectiveDate).getTime())[0];
        }
        if (latestJob) {
          this.selectedEmployeeJobDetails = latestJob;
          this.jobErrorMessage = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        } else {
          this.jobErrorMessage = 'No active job role found for today or earlier.';
          this.employeeForm.get('jobValid')?.setValue(false);
        }
      },
      error: (reason: any) => console.error(reason),
    });
  }

  onclickDesignation(event: any) {
    this.selectedAuthority = event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}` : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
    }
  }
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  async postRelievingLetterFormSubmit(f: FormGroup) {
    this.spinnerLoader = true;
    if (!this.selectedEmployee?.firstName || !this.selectedEmployee?.lastName) {
      this.spinnerLoader = false;
      return;
    }
    const fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${Date.now()}_RelievingLetter.pdf`;
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
    const docDef = buildRelievingLetterDoc({
      firstName: this.selectedEmployee.firstName,
      middleName: this.selectedEmployee.middleName || '',
      lastName: this.selectedEmployee.lastName,
      gender: this.gender,
      gender2: this.gender2,
      gender3: this.gender3,
      jobRole: this.selectedEmployeeJobDetails?.jobRole || '',
      dateOfJoining: this.selectedEmployee.dateOfJoining ? new Date(this.selectedEmployee.dateOfJoining).toISOString() : '',
      lastWorkingDay: this.getLastWorkingDate() ? new Date(this.getLastWorkingDate()).toISOString() : '',
      issuedDate: f.value.dateofRelieving,
      authorityFullName: this.authorityFullName || '',
      authorityDesignation: this.selectedAuthority?.designation || '',
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
      this.RelievingFile = new File([blob], fileName, { type: 'application/pdf' });
      this.uploadRelievingLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.conformationPopup.openErrorModal('Failed to generate letter');
    }
  }

  private fetchImageAsBase64(url: string): Promise<string> {
    return fetch(url).then(res => res.blob()).then(blob => new Promise<string>((resolve, reject) => {
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

  uploadRelievingLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Relieving Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.RelievingFile).subscribe({
      next: (data: any) => {
        this.spinnerLoader = false;
        if (data?.path) {
          this.result.documentUrl = data.path;
        }
        this.conformationPopup.openSuccessModal('Relieving letter generated successfully');
        if (this.employeeStatus != null) {
          this.updateEmployeeStatus();
          this.updateEmployeeData();
        }
        this.relievingemail();
      },
      error: (_reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload is failed');
      }
    });
  }

  relievingemail() {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personEmail: this.selectedEmployee.emailaddress,
      senderName: loggedInUser.middleName
        ? `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
        : `${loggedInUser.firstName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      firstName: this.selectedEmployee.firstName,
      lastName: this.selectedEmployee.lastName,
      middleName: this.selectedEmployee.middleName,
      role: this.selectedEmployeeJobDetails.jobRole,
      documentUrl: this.result.documentUrl,
      employeeId: this.selectedEmployee.employeeId,
    };
    this.subscription = this.http.postdata(`CustomEmail/relievingLetter`, emaildetails).subscribe({
      next: (_data: any) => {
        this.conformationPopup.openSuccessModal('Email has been sent successfully');
        this.resetForm();
      },
      error: (_err: any) => {
        this.spinnerLoader = false;
        this.resetForm();
      }
    });
  }

  private resetForm() {
    this.initializeForm();
    this.employeeFullname = '';
    this.selectedEmployee = null!;
    this.selectedEmployeeJobDetails = null!;
    this.selectedAuthority = null!;
    this.authorityFullName = '';
    this.gender = null;
    this.gender2 = null;
    this.gender3 = null;
    this.jobErrorMessage = '';
  }

  employeeStatus: any;
  getEmployeeStatusChanges() {
    this.subscription = this.http.getData(`EmployeeChangeHistory/GetByEmployeeId/${this.selectedEmployee.employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeStatus = data.data.find((statusChange: any) =>
          statusChange.oldValue.toLowerCase() === 'active' &&
          statusChange.newValue.toLowerCase() === 'prospective contract' &&
          statusChange.moduleId == environment.contractEmployeeConversionModuleId
        );
      }
    });
  }

  updateEmployeeStatus() {
    if (!this.employeeStatus) return;
    const payload = {
      employeeId: this.selectedEmployee.employeeId,
      id: this.employeeStatus.id,
      columnName: 'subSubstatus',
      meta: JSON.stringify({
        status: 'Relieving Letter Generated'
      })
    };
    this.subscription = this.http.postdata(`EmployeeChangeHistory/Update`, payload).subscribe({
      next: (data: any) => console.log('Status updated successfully', data),
      error: (err: any) => console.error('Error updating status:', err)
    });
  }

  isContractorProspective(): boolean {
    return this.selectedEmployee?.empType?.toLowerCase() === 'contract' && 
    this.selectedEmployee?.empstatus?.toLowerCase() === 'prospective contract';
  }

  getLastWorkingDate(): string {
    if (this.isContractorProspective()) {
      return this.employeeForm.get('lastWorkingDate')?.value;
    }
    return this.selectedEmployee?.lastworkingday;
  }

  updateEmployeeData(){
    this.selectedEmployee.lastworkingday = this.employeeForm.get('lastWorkingDate')?.value? 
    this.employeeForm.get('lastWorkingDate')?.value : this.selectedEmployee.lastworkingday;
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.selectedEmployee).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}