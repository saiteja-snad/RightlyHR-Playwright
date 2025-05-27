import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { NavigationEnd, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { filter, Subscription } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployee } from './probation.modal';
import { IEmployeeSignatures } from '../letters.modal';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
@Component({
  selector: 'app-probation-confirmation-letter',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, LetterFooterComponent, TranslateModule, ModuleInformationComponent],
  templateUrl: './probation-confirmation-letter.component.html',
  styleUrl: './probation-confirmation-letter.component.scss'
})

export class ProbationConfirmationLetterComponent {
  moduleinfo : string = '';
  subscription!: Subscription;
  probationemp : IEmployee[]=[];
  probationLetterData = {} as any;
  authorityDetails: IEmployeeSignatures[]=[];
  probationFile!: File;
  disableFieldsForApproval: boolean = false;
  loading: boolean = false;
  Status: any;
  probationConfirmationForm!: FormGroup;
  selectedEmployee: IEmployee | null = null;
  lastSelectedEmployeeId: number | null = null;
  
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];

  todayDate!: string;
  isdateofprobation: boolean = true;
  isdateofprobationIssued :boolean = true;
  enableBtn= false;
  spinnerLoader= false;
  releaseLoader= false;

  constructor(
    private http: HttpService, 
    private router: Router, 
    private fb: FormBuilder, 
    private openModalService:OpenModalService) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getProbationEmployees();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
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
      '/admin/letters/probation-confirmation-letter': MODULE_INFOS.PROBATION_CONFIRMATION_LETTER_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  DateValidation() {
    const issuedDateControl = this.probationConfirmationForm.get('issuedDate');
    const issuedDate = issuedDateControl?.value ? new Date(issuedDateControl.value) : null;
  
    const probationEndDate = this.selectedEmployee?.probationEndDate
      ? new Date(this.selectedEmployee.probationEndDate)
      : null;
  
    console.log('Issued Date:', issuedDate);
    console.log('Probation End Date:', probationEndDate);
  
    if (issuedDate && probationEndDate && issuedDate > probationEndDate) {
      this.isdateofprobationIssued = false;
    } else {
      this.isdateofprobationIssued = true;
    }
  }

  CheckDateValidation(){
    const effectiveDate = new Date(this.probationConfirmationForm.get('effectiveDate')?.value);
    const joiningDate = this.selectedEmployee?.dateOfJoining
      ? new Date(this.selectedEmployee.dateOfJoining)
      : null;
  
      const probationEndDate = this.selectedEmployee?.probationEndDate
    ? new Date(this.selectedEmployee.probationEndDate)
    : null;

    // Validate Effective Date after joining date
    if (joiningDate && effectiveDate < joiningDate) {
      this.jobErrorMessage = 'Effective Date must be after the employee joining date';
    } else {
      this.jobErrorMessage = '';
    }
    if (probationEndDate && effectiveDate > probationEndDate) {
      this.isdateofprobation = false;
    } else {
      this.isdateofprobation = true;
    }
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault();
  } 

  naviagte(){
    this.router.navigate(['/admin/probation-employees']);
  }

  initializeForm() {
    this.probationConfirmationForm = this.fb.group({
      employeeId: [null, Validators.required],
      issuedDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      Documenttype: [null, Validators.required],
      authorityid: [null, Validators.required],
      jobValid: [false, Validators.requiredTrue],
    });
  }

  //get employee ids for dropdown
  getProbationEmployees() {
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${"Probation"}`).subscribe({
      next: (data: any) => {
        this.probationemp = data.map((employee: any) => ({
          ...employee,
          fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));

        console.log(this.probationemp);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    })
  }

  onClickEmployee(event: any) {
  const newlySelectedEmployee = event?.value;
  if (!newlySelectedEmployee || typeof newlySelectedEmployee !== 'object') {
    return;
  }

  // If employee has changed, reset the dependent fields
  if (this.lastSelectedEmployeeId && this.lastSelectedEmployeeId !== newlySelectedEmployee.employeeId) {
    this.probationConfirmationForm.patchValue({
      issuedDate: null,
      effectiveDate: null,
      Documenttype: null,
      authorityid: null
    });

    ['issuedDate', 'effectiveDate', 'Documenttype', 'authorityid'].forEach(controlName => {
      const control = this.probationConfirmationForm.get(controlName);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.jobErrorMessage = '';
  }

  // Update tracking and continue normal processing
  this.lastSelectedEmployeeId = newlySelectedEmployee.employeeId;
  this.selectedEmployee = event.value;
  const empId = event.value.employeeId;
  this.getProbationRequest(empId);
  this.pathValuesFuction();
}

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Confirmation Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authoruty: any) => ({
          ...authoruty,
          fullName: `${authoruty.firstName} ${authoruty.middleName ? authoruty.middleName + ' ' : ''}${authoruty.lastName}`
        }));
      }
    })
  }

  //to fromat Date
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  async postProbationLetterFormSubmit() {
    this.spinnerLoader= true;
    this.loading = true;
    const data = await this.probationLetterData;
    data.dateofaddress = this.formatDate(data.dateofaddress);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    const pdfContent = document.getElementById('pdfContent1');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.middleName ?? ""}_${data.lastName ?? ""}_${new Date().getTime()}_ProbationConfirmationLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.probationFile = new File( [blob], fileName, { type: 'application/pdf', });
        this.uploadProbationLetter();
      });
    }
    this.openModalService.openSuccessModal("Probation Confirmation Letter Generated Successfully");
  }

  uploadProbationLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationFile).subscribe({
      next: (data: any) => {
        this.openModalService.openSuccessModal("Probation Confirmation Letter Generated Successfully");
        if (data) {
          this.postProbationDetails(data.path); 
        }
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
        this.openModalService.openErrorModal('file upload  is failed');
      },
      complete: () =>{
        this.enableBtn= true;
        this.spinnerLoader= false;
      }
    });
  }

  //function to get the probation request details
  getProbationDetails = {} as any;
  jobErrorMessage!: string;
  getProbationRequest(EmployeeId: number) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No probation details found for this employee.';
          this.probationConfirmationForm.get('jobValid')?.setValue(false);
        }else{
          this.getProbationDetails = data.find((ele: any) => {
            return (ele.status === 'Processed');
          });
          this.jobErrorMessage = '';
          this.probationConfirmationForm.get('jobValid')?.setValue(true);
        }
        
      }
    })
  }

  Documenturlresult: any;
  postProbationDetails(path:any) {
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
      documentURL : path,
      parentId : this.getProbationDetails.parentId,
      probationExtendCount : this.getProbationDetails.probationExtendCount,
      meta : this.getProbationDetails.meta,
      appliedDate : this.getProbationDetails.appliedDate,
      comments : this.getProbationDetails.comments
    }
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', payload).subscribe({
      next: (data: any) => {
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = true;
        this.loading = false;
        this.enableBtn= true;
        this.openModalService.openSuccessModal("Probation Extension Letter Generated Successfully");
        this.probationConfirmationemail();
      },
      error: (reason: any) => {
        this.spinnerLoader= false;
      },
      complete: () =>{
        this.spinnerLoader= false;
      }
    });
  }

  //function to patch the values in the form to the template
  pathValuesFuction() {
    const formValues = this.probationConfirmationForm.value;
    this.probationLetterData.firstName = formValues.employeeId?.firstName,
    this.probationLetterData.middleName = formValues.employeeId?.middleName,
    this.probationLetterData.lastName = formValues.employeeId?.lastName,
    this.probationLetterData.fusionEmpId = formValues.employeeId?.fusionEmpId,
    this.probationLetterData.jobRole = formValues.employeeId?.jobDetails?.jobRole,
    this.probationLetterData.department = formValues.employeeId?.departmentName,
    this.probationLetterData.workLocation = formValues.employeeId?.jobDetails?.subLocation+ ', '+formValues.employeeId?.jobDetails?.lopcation,
    this.probationLetterData.issuedDate = formValues.issuedDate,
    this.probationLetterData.effectiveDate = formValues.effectiveDate,
    this.probationLetterData.Copys = formValues.Documenttype;
    this.probationLetterData.authorityName = formValues.authorityid?.fullName,
    this.probationLetterData.authorityDesignation = formValues.authorityid?.designation,
    this.probationLetterData.employeeId = formValues.employeeId?.employeeId
  }

  //to post probation letter email Details to the offerletter table
  probationConfirmationemail() {
    this.releaseLoader= true;
    let pdata = {
      employeeId: this.probationLetterData.employeeId,
      documentUrl: this.Documenturlresult
    }
    this.subscription = this.http.postdata(`CustomEmail/ConfirmationofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        this.openModalService.openSuccessModal("Probation Confirmation Letter Sent Successfully");
        setTimeout(() =>{
          this.naviagte();
        }, 2000)
      },
      error: (err: any) => {
        this.releaseLoader= false;
      },
      complete: () =>{
        this.enableBtn= false;
        this.releaseLoader= false;
        this.probationConfirmationForm.reset();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}