import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from './welcome-letter.model';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-welcome-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, LettersheaderComponent, LetterFooterComponent, TranslateModule, NgbPopoverModule],
  templateUrl: './welcome-letter.component.html',
  styleUrl: './welcome-letter.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class WelcomeLetterComponent {
  subscription!: Subscription;
  bankloanLetterData = {} as any;
  bankLoanTemplate: any | string | ArrayBuffer | null = null;
  bankLoanFile!: File;
  employeeForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee!: IEmployeeDetails;
  selectedEmployeeJobDetails!: IEmployeeJobDetails;
  signatureAuthorityDetails: IEmployeeSignatures[] = [];
  selectedAuthority!: IEmployeeSignatures;
  employeeFullname!: string;
  herOrHimdata!: string;
  hisOrHerdata!: string;
  date!: string;
  jobErrorMessage!: string;
  spinnerLoader = false;
  authorityFullName!: string;

  constructor(
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getEmployees();
    this.getAuthorityDetails();
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      note: ['', [Validators.required, Validators.maxLength(250)]],
      authorityid: [null, Validators.required],
      jobValid: [false, Validators.requiredTrue]
    });
  }

  getEmployees() {
    const status = ['Active'];
    this.subscription = this.http.getData(`Employeedata/v1/Getallemployees?statuses=${status}`).subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getAuthorityDetails() {
    let offertype = 'Welcome Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.signatureAuthorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim()
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  onClickEmployee(event: any) {
    this.selectedEmployee = event.value;
    this.employeeFullname = `${this.selectedEmployee.firstName || ''} ${this.selectedEmployee.middleName || ''} ${this.selectedEmployee.lastName || ''}`;
    if (this.selectedEmployee.gender == 'Male') {
      this.hisOrHerdata = 'his'
      this.herOrHimdata = 'him'
    }
    else if (this.selectedEmployee.gender == 'Female') {
      this.hisOrHerdata = 'her'
      this.herOrHimdata = 'her'
    }
    else if (this.selectedEmployee.gender == 'Other') {
      this.hisOrHerdata = 'his/her'
      this.herOrHimdata = 'him/her'
    }
    this.getJobdetails(this.selectedEmployee.employeeId);
  }

  getJobdetails(employeeId: any) {
    this.subscription = this.http.getData(`JobDetails/${employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else if (!this.selectedEmployee.workEmail) {
          this.jobErrorMessage = 'Missing workEmail for this employee';
        }
        else {
          let res = data.reverse()[0];
          this.selectedEmployeeJobDetails = res;
          this.jobErrorMessage = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  onclickDesignation(event: any) {
    this.selectedAuthority = event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName
        ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
        : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
    }
  }

  async postBankLoanLetterFormSubmit(f: FormGroup) {
    this.spinnerLoader = true;
    const data = f.value;
    let fileName = '';
    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_WelcomeLetter.pdf`;
    } else {
      console.error('Employee first name or last name is missing');
      return;
    }
    data.dateofbankloan = this.formatDate(data.dateofbankloan);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        pdf.save(fileName);
        const blob = pdf.output('blob');
        let d: Date = new Date()
        this.bankLoanFile = new File([blob], fileName, { type: 'application/pdf', });
        this.uploadBankLoanLetter();
      });
    }
  }

  uploadBankLoanLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Welcome Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankLoanFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.emailToEmployee();
        }
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('file upload  is failed')
      },
    });
  }

  emailToEmployee() {
    const payload = {
      employeeId: this.selectedEmployee.employeeId
    }
    this.subscription = this.http.postdata(`CustomEmail/generatewelcomeemail/${this.selectedEmployee.employeeId}`, payload).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Welcome Letter Generated Successfully')
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err.error.message ? err.error.message : 'Failed to send Welcome Letter');
      },
      complete: () => {
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 2000)
        this.spinnerLoader = false;
        this.employeeForm.reset();
      }
    });
  }

  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}