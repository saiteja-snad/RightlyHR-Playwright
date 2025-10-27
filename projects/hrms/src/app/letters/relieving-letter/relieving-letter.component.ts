import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-relieving-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, TranslateModule, LetterFooterComponent],
  templateUrl: './relieving-letter.component.html',
  styleUrl: './relieving-letter.component.scss',

})

export class RelievingLetterComponent implements OnInit, OnDestroy {
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
  spinnerLoader = false;

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
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
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
          latestJob = data?.filter((job: { effectiveDate: any; }) => new Date(job.effectiveDate) <= today)
            .sort((a: { effectiveDate: any; }, b: { effectiveDate: any; }) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
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
      this.authorityFullName = this.selectedAuthority.middleName ? `${this.selectedAuthority.firstName} ${this.selectedAuthority.middleName}
       ${this.selectedAuthority.lastName}` : `${this.selectedAuthority.firstName} ${this.selectedAuthority.lastName}`;
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
    this.spinnerLoader = true;
    if (this.selectedEmployee && this.selectedEmployee.firstName && this.selectedEmployee.lastName) {
      fileName = `${this.selectedEmployee.firstName}_${this.selectedEmployee.lastName}_${new Date().getTime()}_RelievingLetter.pdf`;
    } else {
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
        pdf.save(fileName);
        const blob = pdf.output('blob');
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.RelievingFile = new File([blob], fileName, { type: 'application/pdf', });
        this.uploadRelievingLetter();
      });
    }
  }

  uploadRelievingLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Relieving Letters/${this.selectedEmployee.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.RelievingFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          this.conformationPopup.openSuccessModal('Relieving letter generated successfully');
          if (this.employeeStatus != null) {
            this.updateEmployeeStatus();
            this.updateEmployeeData();
          }
          this.relievingemail();
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload  is failed');
      },
      complete: () => {
        this.spinnerLoader = false;
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
        this.conformationPopup.openSuccessModal('Email has been sent successfully')
        setTimeout(() => {
          this.navigateDashboard();
        }, 2000)
      },
      error: (err: any) => {
        this.spinnerLoader = false;
      }, complete: () => {
        this.spinnerLoader = false;
      }
    })
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
    this.selectedEmployee.lastworkingday = this.employeeForm.get('lastWorkingDate')?.value? this.employeeForm.get('lastWorkingDate')?.value : 
                                                      this.selectedEmployee.lastworkingday;
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