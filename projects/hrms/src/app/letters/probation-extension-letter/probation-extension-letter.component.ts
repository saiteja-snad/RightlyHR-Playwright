import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployee } from '../probation-confirmation-letter/probation.modal';
import { IEmployeeSignatures } from '../letters.modal';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-probation-extension-letter',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent, TranslateModule, NgbPopoverModule],
  templateUrl: './probation-extension-letter.component.html',
  styleUrl: './probation-extension-letter.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProbationExtensionLetterComponent {
  moduleinfo : string = '';
  subscription!: Subscription;
  employeedetails :IEmployee[]=[];
  probationExtensionLetterData = {} as any;
  probationFile!: File;
  Employeeinfo = {} as any;
  authorityDetails: IEmployeeSignatures[]=[];
  disableFieldsForApproval: boolean = true;
  loading: boolean = false;
  Status: any;
  probationExtensionForm!: FormGroup;
  enableBtn= false;
  spinnerLoader= false;
  releaseLoader= false;
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  todayDate!: string;
  lastSelectedEmployeeId: number | null = null;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private openModalService: OpenModalService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getProbationEmployees();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  naviagte(){
    this.router.navigate(['/admin/probation-employees']);
  }

  initializeForm() {
    this.probationExtensionForm = this.fb.group({
      employeeId: [null, Validators.required],
      issuedDate: [null, Validators.required],
      Documenttype: [null, Validators.required],
      authorityid: [null, Validators.required],
    });
  }

  //funtion to get probation details
  getProbationDetailsbyId(Employee: any) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let filteredData = data.filter((ele: any) => {
          return ele.status?.toLowerCase() == 'extended'
        })
        filteredData.forEach((ele: any) => {
          Employee.probationExtendedDate = ele.probationExtendedDate
          Employee.probationmonths = this.convertDaysToMonths(ele.probationEndDate, ele.probationExtendedDate)
        });
      }
    })
  }

  //funtion to get the months 
  convertDaysToMonths(probationEndDate: string, probationExtendedDate: string): string {
    // Assume an average month length of 30.44 days (which accounts for leap years)
    const endDate = moment(probationEndDate);
    const extendedDate = moment(probationExtendedDate);
    // Calculate the difference in days between the two dates
    const daysDifference = extendedDate.diff(endDate, 'days');
    // Assume an average month length of 30.44 days (which accounts for leap years)
    const averageDaysPerMonth = 365.25 / 12;
    // Convert days to months based on the average days per month
    let months = daysDifference / averageDaysPerMonth;
    if (months < 0) {
      months = 0;
    }
    // Round to 1 decimal place
    return months.toFixed(1);
  }

  //get employees
  getProbationEmployees() {
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${'Probation Extended'}`).subscribe({
      next: (data: any) => {
        this.employeedetails = data.map((employee: any) => ({
          ...employee,
          fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    })
  }

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Extension Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authoruty: any) => ({
          ...authoruty,
          fullName: `${authoruty.firstName} ${authoruty.middleName ? authoruty.middleName + ' ' : ''}${authoruty.lastName}`
        }));
      }
    })
  }

  onClickEmployee(event: any){
    const newlySelectedEmployee = event?.value;
    if (!newlySelectedEmployee || typeof newlySelectedEmployee !== 'object') {
      return;
    }
    // Reset dependent fields if employee changes
    if (
      this.lastSelectedEmployeeId &&
      this.lastSelectedEmployeeId !== newlySelectedEmployee.employeeId
    ) {
      this.probationExtensionForm.patchValue({
        issuedDate: null,
        Documenttype: null,
        authorityid: null,
      });

      ['issuedDate', 'Documenttype', 'authorityid'].forEach((controlName) => {
        const control = this.probationExtensionForm.get(controlName);
        control?.markAsPristine();
        control?.markAsUntouched();
        control?.updateValueAndValidity();
      });
    }

    this.lastSelectedEmployeeId = newlySelectedEmployee.employeeId;

    const empId = event.value.employeeId;
    this.getProbationRequest(empId);
    this.pathValuesFuction();
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault();
  } 

  //function to patch the values in the form to the template
  pathValuesFuction() {
    const formValues = this.probationExtensionForm.value;
    this.probationExtensionLetterData.firstName = formValues.employeeId?.firstName,
    this.probationExtensionLetterData.middleName = formValues.employeeId?.middleName,
    this.probationExtensionLetterData.lastName = formValues.employeeId?.lastName,
    this.probationExtensionLetterData.fusionEmpId = formValues.employeeId?.fusionEmpId,
    this.probationExtensionLetterData.jobRole = formValues.employeeId?.jobDetails?.jobRole,
    this.probationExtensionLetterData.department = formValues.employeeId?.departmentName,
    this.probationExtensionLetterData.workLocation = formValues.employeeId?.jobDetails?.subLocation+ ', '+formValues.employeeId?.jobDetails?.lopcation,
    this.probationExtensionLetterData.dateofprobationextension = formValues?.issuedDate,
    this.probationExtensionLetterData.Documenttype = formValues?.Documenttype;
    this.probationExtensionLetterData.authorityName = formValues.authorityid?.fullName,
    this.probationExtensionLetterData.authorityDesignation = formValues.authorityid?.designation,
    this.probationExtensionLetterData.employeeId = formValues.employeeId?.employeeId
  }

  async postProbationExtensionLetterFormSubmit() {
    this.spinnerLoader= true;
    const data = await this.probationExtensionLetterData;
    data.dateofaddress = this.formatDate(data.dateofaddress);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.middleName ?? ""}_${data.lastName ?? ""}_${new Date().getTime()}_ProbationExtensionLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        let d: Date = new Date()
        this.probationFile = new File(
          [blob], fileName, {
          type: 'application/pdf',
        }
        );
        this.uploadprobationextentionLetter();
      });
    }
    this.openModalService.openSuccessModal('Probation Extension Letter Generated Successfully');
  }

  //function to get the separation request details
  getProbationDetails = {} as any;
  getProbationRequest(EmployeeId: any) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (response: any) => {
        this.getProbationDetails = response.find((ele: any) => {
          return (ele.status?.toLowerCase() === 'extended');
        });
        this.probationExtensionLetterData.probationExtendedDate = this.getProbationDetails.probationExtendedDate
        this.probationExtensionLetterData.probationmonths = this.convertDaysToMonths(this.getProbationDetails.probationEndDate,
           this.getProbationDetails.probationExtendedDate)
      }
    })
  }

  uploadprobationextentionLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationExtensionLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.enableBtn= true;
          this.postProbationDetails(data.path);
          // this.openModalService.openSuccessModal('Probation Extension Letter Generated Successfully');
        }
        
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
        this.openModalService.openErrorModal('file upload is failed');
      },
      complete: () =>{
        this.spinnerLoader= false;
      }
    });
  }

  Documenturlresult: any;
  postProbationDetails(docurl: string) {
    debugger
    let payload = {
      probationId : this.getProbationDetails.probationId,
      formId : this.getProbationDetails.formId,
      employeeId : this.getProbationDetails.employeeId,
      responseId : this.getProbationDetails.responseId,
      probationStartDate : this.getProbationDetails.probationStartDate,
      probationEndDate : this.getProbationDetails.probationEndDate,
      probationExtendedDate : this.getProbationDetails.probationExtendedDate,
      status : this.getProbationDetails.status,
      createdBy : this.getProbationDetails.createdBy,
      updatedBy : this.getProbationDetails.updatedBy,
      probationDays : this.getProbationDetails.probationDays,
      raisedBy : this.getProbationDetails.raisedBy,
      documentURL : docurl,
      parentId : this.getProbationDetails.parentId,
      probationExtendCount : this.getProbationDetails.probationExtendCount,
      meta : this.getProbationDetails.meta,
      appliedDate : this.getProbationDetails.appliedDate,
      comments : this.getProbationDetails.comments
    }
    this.getProbationDetails.documentURL = docurl;
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', payload).subscribe({
      next: (data: any) => {
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = false;
        this.loading = false;
        this.openModalService.openSuccessModal('Probation Extension Letter Generated Successfully');
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
      complete: () =>{
        this.spinnerLoader= false;
      }
    });
  }

  //to fromat Date
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  probationExtendeEmail() {
    this.releaseLoader= true;
    let pdata =
    {
      employeeId: this.probationExtensionLetterData.employeeId,
      documentUrl: this.Documenturlresult
    }
    this.subscription = this.http.postdata(`CustomEmail/ExtensionofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        this.openModalService.openSuccessModal("Email Sent Successfully");
        setTimeout(() =>{
          this.naviagte();
        }, 2000)
      },
      error: (err: any) => {
        this.releaseLoader= false;
      },
      complete: ()=>{
        this.releaseLoader= false;
        this.probationExtensionForm.reset();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}