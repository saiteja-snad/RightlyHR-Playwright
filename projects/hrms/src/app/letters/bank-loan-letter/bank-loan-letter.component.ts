import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from './bank-loan.model';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { buildBankLoanLetterDoc } from '../../letters-builder-files/bank-loan-letter.builder';
import { fetchLetterAssets, setupLetterPdfMake } from '../../letters-builder-files/letter-pdf.utils';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
@Component({
  selector: 'app-bank-loan-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, LetterFooterComponent, LettersheaderComponent],
  templateUrl: './bank-loan-letter.component.html',
  styleUrl: './bank-loan-letter.component.scss',
})

export class BankLoanLetterComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  bankLoanFile!: File;
  isdateofbankloan: boolean = true;
  employeeForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployeeJobDetails!: IEmployeeJobDetails;
  signatureAuthorityDetails: IEmployeeSignatures[] = [];
  selectedEmployee!: IEmployeeDetails;
  selectedAuthority!: IEmployeeSignatures;
  employeeFullname!: string;
  herOrHimdata!: string;
  hisOrHerdata!: string;
  date!: string;
  jobErrorMessage!: string;
  spinnerLoader = false;
  authorityFullName!: string;
  dateValidationErrorMessage: string = '';
  employeementType: { name: string; value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private modal: OpenModalService) { }

  ngOnInit() {
    this.initializeForm();
    this.getAllActiveEmployees();
    this.getAuthorityDetails();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/active-employees']);
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      Documenttype: ['', Validators.required],
      dateofbankloan: ['', Validators.required],
      authorityid: ['', Validators.required],
      jobValid: [false, Validators.requiredTrue],
    });
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : '' }${employee.firstName}
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
    let offertype = 'Bank Loan Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.signatureAuthorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName ? authority.middleName + ' ' : ''}${authority.lastName}`
        }));
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }

  onClickEmployee(event: any) {
    this.selectedEmployee = event.value;
    this.employeeFullname = this.selectedEmployee.firstName + (this.selectedEmployee.middleName ? ' ' +
    this.selectedEmployee.middleName : '') + ' ' + this.selectedEmployee.lastName;
    if (this.selectedEmployee.gender == 'Male') {
      this.hisOrHerdata = 'his';
      this.herOrHimdata = 'him';
    } else if (this.selectedEmployee.gender == 'Female') {
      this.hisOrHerdata = 'her';
      this.herOrHimdata = 'her';
    } else if (this.selectedEmployee.gender == 'Other') {
      this.hisOrHerdata = 'his/her';
      this.herOrHimdata = 'him/her';
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
          let res = data.sort((a: any, b: any) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
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

  DateValidation() {
    const dateofbankloan = new Date(this.employeeForm.get('dateofbankloan')?.value);
    const joiningDate = new Date(this.selectedEmployeeJobDetails.effectiveDate);
    if (dateofbankloan <= joiningDate) {
      this.jobErrorMessage = 'Bank loan date must be after the employee joining date.';
      this.employeeForm.get('jobValid')?.setValue(false);
    } else {
      this.jobErrorMessage = '';
      this.employeeForm.get('jobValid')?.setValue(true);
    }
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault();
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
    if (!this.selectedEmployee?.firstName || !this.selectedEmployee?.lastName) {
      console.error('Employee first name or last name is missing');
      this.spinnerLoader = false;
      return;
    }
    const fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${Date.now()}_BankLoanLetter.pdf`;
    const isSoftCopy = f.value.Documenttype?.value === true;
    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);
    const docDef = buildBankLoanLetterDoc({
      employeeFullname: this.employeeFullname,
      jobRole: this.selectedEmployeeJobDetails?.jobRole || '',
      effectiveDate: this.selectedEmployeeJobDetails?.effectiveDate || '',
      hisOrHer: this.hisOrHerdata || 'his/her',
      himOrHer: this.herOrHimdata || 'him/her',
      letterDate: f.value.dateofbankloan,
      authorityFullName: this.authorityFullName || '',
      authorityDesignation: this.selectedAuthority?.designation || '',
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
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
      this.bankLoanFile = new File([blob], fileName, { type: 'application/pdf' });
      this.uploadBankLoanLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.modal.openErrorModal('Failed to generate Bank Loan Letter');
    }
  }

  uploadBankLoanLetter() {
    let filePath = `/FusionDocuments/Employee Documents/BankLoan Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankLoanFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          this.modal.openSuccessModal('Bank loan letter generated successfully');
        }
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.modal.openErrorModal(err.error.message ? err.error.message : 'Failed to upload Bank Loan Letter');
      },
      complete: () => {
        this.spinnerLoader = false;
        this.employeeForm.reset();
        this.employeeFullname = '';
        this.selectedEmployee = null!;
        this.selectedEmployeeJobDetails = null!;
        this.selectedAuthority = null!;
        this.authorityFullName = '';
        this.hisOrHerdata = '';
        this.herOrHimdata = '';
        this.jobErrorMessage = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}