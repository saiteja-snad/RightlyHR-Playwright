import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal,} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from './bank-loan.model';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-bank-loan-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent, TranslateModule],
  templateUrl: './bank-loan-letter.component.html',
  styleUrl: './bank-loan-letter.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class BankLoanLetterComponent {
  subscription!: Subscription;
  bankLoanTemplate: any | string | ArrayBuffer | null = null; 
  bankLoanFile!: File;
  isdateofbankloan: boolean = true;
  employeeForm!: FormGroup;

  employeeDetails : IEmployeeDetails[]=[];
  selectedEmployeeJobDetails!: IEmployeeJobDetails;
  signatureAuthorityDetails: IEmployeeSignatures[]=[];

  selectedEmployee!: IEmployeeDetails;
  selectedAuthority!: IEmployeeSignatures;
  employeeFullname!: string;
  herOrHimdata!: string;
  hisOrHerdata!: string;
  date!: string;
  jobErrorMessage!: string;
  spinnerLoader= false;
  authorityFullName!: string;
  dateValidationErrorMessage: string = ''; 

  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];

  constructor(
    private http: HttpService, 
    private httpclient: HttpClient, 
    private router: Router,
    private fb: FormBuilder,
    private modal: OpenModalService
  )  { }

  ngOnInit() {
    this.initializeForm();
    this.getBankLoanTemplate();
    this.getAllActiveEmployees();
    this.getAuthorityDetails();  
  }

  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      Documenttype: ['', Validators.required],
      dateofbankloan: ['', Validators.required],
      authorityid: ['', Validators.required]
    });

    this.employeeForm.get('dateofbankloan')?.valueChanges.subscribe((newDate) => {
      this.DateValidation();
    });
  }

  async getBankLoanTemplate() {
    this.bankLoanTemplate = await this.httpclient.get('assets/Bank_Loan_Letter.docx', 
      { responseType: 'arraybuffer' }).toPromise();
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
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
    let offertype = 'Bank Loan Letter';
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

  onClickEmployee(event: any){
    this.selectedEmployee= event.value;

    this.employeeFullname = this.selectedEmployee.firstName + ' ' + this.selectedEmployee.middleName + ' ' + this.selectedEmployee.lastName;

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
        } else {
          let res = data.reverse()[0];  
          this.selectedEmployeeJobDetails = res;
          this.jobErrorMessage = '';
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
      this.isdateofbankloan = false;
      this.dateValidationErrorMessage = 'Bank loan date must be after the employee joining date.';
    } else {
      this.isdateofbankloan = true;
      this.dateValidationErrorMessage = '';  
    }
  }

  onclickDesignation(event: any) {
    this.selectedAuthority= event.value;
    if (this.selectedAuthority) {
      this.authorityFullName = this.selectedAuthority.middleName
        ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName} ${this.selectedAuthority.lastName}`
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
  
  async postBankLoanLetterFormSubmit(f: FormGroup) {
    this. spinnerLoader= true;
    const data = f.value;
    let fileName = '';
    
    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_BankLoanLetter.pdf`;
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
        this.bankLoanFile = new File([blob], fileName, { type: 'application/pdf' });
  
        this.uploadBankLoanLetter();
      });
    }
  }
  
  uploadBankLoanLetter() {
    let filePath = `/FusionDocuments/Employee Documents/BankLoan Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankLoanFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.modal.openSuccessModal('Bank Loan Letter Generated Successfully');
        }
      },
      error: (err: any) => {
        this.spinnerLoader= false;
        this.modal.openErrorModal(err.error.message? err.error.message: 'Failed to upload Bank Loan Letter');
      },
      complete: () => {
        setTimeout(() => {
          this.router.navigate(['/admin/active-employees']);
        }, 2000)
        this.spinnerLoader= false;
        this.employeeForm.reset();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
