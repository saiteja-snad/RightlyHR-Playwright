import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import moment from 'moment';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployee } from '../probation-confirmation-letter/probation.modal';
import { IEmployeeSignatures } from '../letters.modal';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildProbationExtensionLetterDoc } from '../../letters-builder-files/probation-extension-letter.builder';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-probation-extension-letter',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './probation-extension-letter.component.html',
  styleUrl: './probation-extension-letter.component.scss',
})

export class ProbationExtensionLetterComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  employeedetails: IEmployee[] = [];
  probationExtensionLetterData = {} as any;
  probationFile!: File;
  Employeeinfo = {} as any;
  authorityDetails: IEmployeeSignatures[] = [];
  disableFieldsForApproval: boolean = true;
  loading: boolean = false;
  Status: any;
  probationExtensionForm!: FormGroup;
  enableBtn = false;
  spinnerLoader = false;
  releaseLoader = false;
  documentType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  todayDate!: string;
  lastSelectedEmployeeId: number | null = null;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder,
    private openModalService: OpenModalService) { }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.initializeForm();
    this.getProbationEmployees();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  naviagte() {
    this.router.navigate(['/employee-management/probation-employees']);
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
          fullName: `${employee.fusionEmpId ? employee.fusionEmpId + '-' : ''} ${employee.firstName} 
          ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
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
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
      }
    })
  }

  onClickEmployee(event: any) {
    const newlySelectedEmployee = event?.value;
    if (!newlySelectedEmployee || typeof newlySelectedEmployee !== 'object') {
      return;
    }
    // Reset dependent fields if employee changes
    if (this.lastSelectedEmployeeId && this.lastSelectedEmployeeId !== newlySelectedEmployee.employeeId) {
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
      this.probationExtensionLetterData.workLocation = formValues.employeeId?.jobDetails?.subLocation + ', ' + formValues.employeeId?.jobDetails?.lopcation,
      this.probationExtensionLetterData.dateofprobationextension = formValues?.issuedDate,
      this.probationExtensionLetterData.Documenttype = formValues?.Documenttype;
    this.probationExtensionLetterData.authorityName = formValues.authorityid?.fullName,
      this.probationExtensionLetterData.authorityDesignation = formValues.authorityid?.designation,
      this.probationExtensionLetterData.employeeId = formValues.employeeId?.employeeId
  }

  async postProbationExtensionLetterFormSubmit() {
    this.spinnerLoader = true;
    const fileName = `${this.probationExtensionLetterData.firstName}_${this.probationExtensionLetterData.lastName}_${Date.now()}_ProbationExtensionLetter.pdf`;
    const isSoftCopy = this.probationExtensionForm.get('Documenttype')?.value === true;
    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);
    const docDef = buildProbationExtensionLetterDoc({
      firstName: this.probationExtensionLetterData.firstName || '',
      middleName: this.probationExtensionLetterData.middleName || '',
      lastName: this.probationExtensionLetterData.lastName || '',
      fusionEmpId: this.probationExtensionLetterData.fusionEmpId || '',
      jobRole: this.probationExtensionLetterData.jobRole || '',
      department: this.probationExtensionLetterData.department || '',
      workLocation: this.probationExtensionLetterData.workLocation || '',
      issuedDate: this.probationExtensionLetterData.dateofprobationextension || '',
      probationmonths: this.probationExtensionLetterData.probationmonths,
      probationExtendedDate: this.probationExtensionLetterData.probationExtendedDate || '',
      authorityName: this.probationExtensionLetterData.authorityName || '',
      authorityDesignation: this.probationExtensionLetterData.authorityDesignation || '',
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
      this.probationFile = new File([blob], fileName, { type: 'application/pdf' });
      this.uploadprobationextentionLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.openModalService.openErrorModal('Failed to generate letter');
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
          this.enableBtn = true;
          this.Documenturlresult = data.path;
          this.postProbationDetails(data.path);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.openModalService.openErrorModal('file upload is failed');
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  Documenturlresult: any;
  postProbationDetails(docurl: string) {
    let payload = {
      probationId: this.getProbationDetails.probationId,
      formId: this.getProbationDetails.formId,
      employeeId: this.getProbationDetails.employeeId,
      responseId: this.getProbationDetails.responseId,
      probationStartDate: this.getProbationDetails.probationStartDate,
      probationEndDate: this.getProbationDetails.probationEndDate,
      probationExtendedDate: this.getProbationDetails.probationExtendedDate,
      status: this.getProbationDetails.status,
      createdBy: this.Employeeinfo.employeeId,
      updatedBy: this.Employeeinfo.employeeId,
      updatedAt: this.todayDate,
      probationDays: this.getProbationDetails.probationDays,
      raisedBy: this.getProbationDetails.raisedBy,
      documentURL: docurl,
      parentId: this.getProbationDetails.parentId,
      probationExtendCount: this.getProbationDetails.probationExtendCount,
      meta: this.getProbationDetails.meta,
      appliedDate: this.getProbationDetails.appliedDate,
      comments: this.getProbationDetails.comments,
      candidateStatus: 'Generated',
      IssuedDate: this.probationExtensionForm.get('issuedDate')?.value,
      AuthoritySignature: this.probationExtensionForm.get('authorityid')?.value.employeeId,
      generatedDate: this.todayDate,
      generatedBy: this.Employeeinfo.employeeId,
      DocType: this.probationExtensionForm.get('Documenttype')?.value,
      letterType: 'Probation Extension Letter'
    }
    this.getProbationDetails.documentURL = docurl;
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', payload).subscribe({
      next: (data: any) => {
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = false;
        this.loading = false;
        this.openModalService.openSuccessModal('Probation extension letter generated successfully');
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
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
    this.releaseLoader = true;
    let pdata =
    {
      employeeId: this.probationExtensionLetterData.employeeId,
      documentUrl: this.Documenturlresult,
      generatedBy: this.Employeeinfo.employeeId,
      generatedDate: new Date().toISOString(),
    }
    this.subscription = this.http.postdata(`CustomEmail/ExtensionofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        this.openModalService.openSuccessModal("Email has been sent successfully");
        setTimeout(() => {
          this.naviagte();
        }, 3000)
      },
      error: (err: any) => {
        this.releaseLoader = false;
        this.openModalService.openErrorModal(err?.error?.message || 'Failed to send release email');
      },
      complete: () => {
        this.releaseLoader = false;
        this.probationExtensionForm.reset();
        this.probationExtensionLetterData = {};
        this.getProbationDetails = {};
        this.lastSelectedEmployeeId = null;
        this.enableBtn = false;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}