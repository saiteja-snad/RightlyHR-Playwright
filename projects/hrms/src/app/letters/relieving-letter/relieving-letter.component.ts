import { CommonModule, formatDate } from '@angular/common';
import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { IEmployeeDetails, IEmployeeJobDetails, IEmployeeSignatures } from '../letters.modal';
@Component({
  selector: 'app-relieving-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, TranslateModule, LetterFooterComponent],
  templateUrl: './relieving-letter.component.html',
  styleUrl: './relieving-letter.component.scss'
})

export class RelievingLetterComponent {
  subscription!: Subscription;
  relievingTemplate: any | string | ArrayBuffer | null = null; 
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

  spinnerLoader= false;

  constructor(
    private router: Router, 
    private fb: FormBuilder, 
    private http: HttpService,
    private httpclient: HttpClient,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
  ) { }

  ngOnInit() {
    this.getRelievingTemplate();
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
    this.router.navigate(['/admin/dashboard'])
  }

  DateValidation() {
    const relievingDate = new Date(this.employeeForm.get('dateofRelieving')?.value);
    const joiningDate = new Date(this.selectedEmployeeJobDetails?.effectiveDate);

    if (relievingDate <= joiningDate) {
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

  async getRelievingTemplate() {
    this.relievingTemplate = await this.httpclient
      .get('assets/Relieving_Letter.docx', {
        responseType: 'arraybuffer',
      }).toPromise();
  }

  getAllInActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/InactiveEmployees').subscribe({
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
    let offertype = 'Releving Letter';
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
    if (this.selectedEmployee.lastworkingday && !this.selectedEmployee.lastworkingday) {
      this.selectedEmployee.lastworkingday = this.selectedEmployee.lastworkingday;
    }

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
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.reverse()[0];  
          this.selectedEmployeeJobDetails = res;
          console.log(this.selectedEmployeeJobDetails)
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

  async postRelievingLetterFormSubmit(f: FormGroup) {
    const data = f.value;
    let fileName = '';
    this.spinnerLoader= true;

    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_RelievingLetter.pdf`;
    } else {
      console.error('Employee first name or last name is missing');
      return; 
    }

    data.dateofRelieving = this.formatDate(data.dateofRelieving);
    data.dateOfJoining = this.formatDate(new Date(this.selectedEmployee.dateOfJoining));
    data.lastWorkingDay = this.formatDate(new Date(this.selectedEmployee.lastworkingday));

    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

        // const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_RelievingLetter.pdf`;

        pdf.save(fileName);
        const blob = pdf.output('blob');
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.RelievingFile = new File([blob], fileName,{type: 'application/pdf',});
        this.uploadRelievingLetter();
      });
    }
  }

  uploadRelievingLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Relieving Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.RelievingFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.conformationPopup.openSuccessModal('Relieving Letter Generated Successfully')
            this.relievingemail();
          }
        },
        error: (reason: any) => {
          this.spinnerLoader= false;
          this.conformationPopup.openErrorModal('File upload  is failed');
        },
        complete:()=>{
          this.spinnerLoader= false;
        }
      });
  }

  relievingemail() {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personEmail: this.selectedEmployee.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      firstName: this.selectedEmployee.firstName,
      lastName: this.selectedEmployee.lastName,
      middleName: this.selectedEmployee.middleName,
      role: this.selectedEmployeeJobDetails.jobRole,
      documentUrl: this.result.documentUrl,
      employeeId: this.selectedEmployee.employeeId,
    }
    if (loggedInUser.middleName) {

      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`

    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`

    }
    this.subscription = this.http.postdata(`CustomEmail/relievingLetter`, emaildetails).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Email Sent Successfully')
        setTimeout(()=>{
          this.navigateDashboard();
        }, 2000)
      },
      error: (err: any) => {
        this.spinnerLoader= false;
      },complete: ()=>{
        this.spinnerLoader= false;
      }

    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}