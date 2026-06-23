import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { OpenModalService } from '../../services/open-modal.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildTraineeRelievingLetterDoc } from '../../letters-builder-files/trainee-relieving-letter.builder';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from '../letters.modal';
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { DateformatPipe } from '../../pipes/dateformat.pipe';
@Component({
  selector: 'app-trainee-relieving-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './trainee-relieving-letter.component.html',
  styleUrl: './trainee-relieving-letter.component.scss'
})

export class TraineeRelievingLetterComponent implements OnInit, OnDestroy {
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
  managerDetails: any = null;
  employeeFullname!: string;
  getAllEmployeeInfo = [] as any;
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
      jobValid: [false, Validators.requiredTrue]
    });
  }

  navigateDashboard() {
    this.router.navigate(['/employee-management/inactive/employees'])
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

  getEmployeeId() {
    const status = ['Trainee Inactive'];
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
      next: (data: any) => {
        this.employeeDetails = data as IEmployeeDetails[];
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            // Concatenate first, middle (if present), and last name
          };
        }).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllInActiveEmployees() {
    const status = 'Trainee Inactive';
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'Trainee Completion Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.signatureAuthorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName ? authority.middleName + ' ' : ''}${authority.lastName}`
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  onClickEmployee(event: any) {
    this.managerDetails = null;
    this.selectedEmployee = event.value;
    if (this.selectedEmployee.lastworkingday && !this.selectedEmployee.lastworkingday) {
      this.selectedEmployee.lastworkingday = this.selectedEmployee.lastworkingday;
    }
    this.employeeFullname = this.selectedEmployee.firstName + ' ' + (this.selectedEmployee.middleName ?? '') + ' ' + this.selectedEmployee.lastName;
    if (this.selectedEmployee?.gender === 'Male') {
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
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.reverse()[0];
          this.selectedEmployeeJobDetails = res;
          // Pass reportsto to getAllEmployeeDetails
          this.getAllEmployeeDetails(res.reportsto);
          this.jobErrorMessage = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAllEmployeeDetails(managerId?: number) {
    const satus = ['active'];
    this.subscription = this.http.getData(`Employeedata/Getallemployees?statuses=${satus}`).subscribe({
      next: (response: any) => {
        if (response) {
          this.getAllEmployeeInfo = response.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
              ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            };
          });
          // Find manager details if managerId is provided
          if (managerId) {
            this.managerDetails = this.getAllEmployeeInfo.find((emp: any) => emp.employeeId === managerId) || null;
          }
        }
      },
    });
  }

  onclickDesignation(event: any) {
    this.selectedAuthority = event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName ?
        `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
        : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
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
      console.error('Employee first name or last name is missing');
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
    const docDef = buildTraineeRelievingLetterDoc({
      firstName: this.selectedEmployee.firstName,
      middleName: this.selectedEmployee.middleName || undefined,
      lastName: this.selectedEmployee.lastName,
      gender3: this.gender3 || 'Mr.',
      jobRole: this.selectedEmployeeJobDetails?.jobRole || '',
      managerTitle: this.managerDetails?.gender === 'Female' ? 'Ms.' : 'Mr.',
      managerFirstName: this.managerDetails?.firstName || undefined,
      managerMiddleName: this.managerDetails?.middleName || undefined,
      managerLastName: this.managerDetails?.lastName || undefined,
      dateOfJoining: this.selectedEmployee.dateOfJoining ? String(this.selectedEmployee.dateOfJoining) : '',
      lastWorkingDay: this.selectedEmployee.lastworkingday ? String(this.selectedEmployee.lastworkingday) : '',
      issuedDate: f.value.dateofRelieving || '',
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
      this.conformationPopup.openErrorModal('Failed to generate Trainee Relieving Letter');
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
        this.conformationPopup.openSuccessModal('Trainee relieving letter generated successfully');
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
    this.managerDetails = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}