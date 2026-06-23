import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { IEmployee } from './probation.modal';
import { IEmployeeSignatures } from '../letters.modal';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../letters-builder-files/custom-fonts-vfs';
import { buildProbationConfirmationLetterDoc } from '../../letters-builder-files/probation-confirmation-letter.builder';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-probation-confirmation-letter',
  imports: [CommonModule, SelectModule, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './probation-confirmation-letter.component.html',
  styleUrl: './probation-confirmation-letter.component.scss'
})

export class ProbationConfirmationLetterComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  probationemp: IEmployee[] = [];
  probationLetterData = {} as any;
  authorityDetails: IEmployeeSignatures[] = [];
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
  isdateofprobationIssued: boolean = true;
  enableBtn = false;
  spinnerLoader = false;
  releaseLoader = false;
  Employeeinfo = {} as any;

  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private openModalService: OpenModalService) { }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.initializeForm();
    this.getProbationEmployees();
    this.getAuthorityDetails();
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }

  DateValidation() {
    const issuedDateControl = this.probationConfirmationForm.get('issuedDate');
    const issuedDate = issuedDateControl?.value ? new Date(issuedDateControl.value) : null;
    const probationEndDate = this.selectedEmployee?.probationEndDate ? new Date(this.selectedEmployee.probationEndDate) : null;
    if (issuedDate && probationEndDate && issuedDate > probationEndDate) {
      this.isdateofprobationIssued = false;
    } else {
      this.isdateofprobationIssued = true;
    }
  }

  CheckDateValidation() {
    const effectiveDate = new Date(this.probationConfirmationForm.get('effectiveDate')?.value);
    const joiningDate = this.selectedEmployee?.dateOfJoining ? new Date(this.selectedEmployee.dateOfJoining) : null;
    const probationStartDate = this.getProbationDetails?.probationStartDate ? new Date(this.getProbationDetails.probationStartDate) : null;
    const probationEndDate = this.selectedEmployee?.probationEndDate ? new Date(this.selectedEmployee.probationEndDate) : null;
    // Reset error messages
    this.jobErrorMessage = '';
    this.isdateofprobation = true;
    // Validation: Effective Date >= Joining Date
    if (joiningDate && effectiveDate < joiningDate) {
      this.jobErrorMessage = 'Effective Date must be after the employee joining date';
      return;
    }
    // Validation: Effective Date >= Probation Start Date
    if (probationStartDate && effectiveDate < probationStartDate) {
      this.jobErrorMessage = 'Effective Date must be after the probation start date';
      return;
    }
    // Validation: Effective Date <= Probation End Date
    if (probationEndDate && effectiveDate > probationEndDate) {
      this.isdateofprobation = false;
      return;
    }
    // All validations passed
    this.jobErrorMessage = '';
    this.isdateofprobation = true;
  }

  preventTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  naviagte() {
    this.router.navigate(['/employee-management/probation-employees']);
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
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${"Probation Confirmed"}`).subscribe({
      next: (data: any) => {
        this.probationemp = data.map((employee: any) => ({
          ...employee,
          fullName: `${employee.fusionEmpId ? employee.fusionEmpId + '-' : ''}${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''} ${employee.lastName}`.trim()
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
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
          fullName: `${authoruty.fusionEmpId ? authoruty.fusionEmpId + '-' : ''}${authoruty.firstName}${authoruty.middleName ? ' ' + authoruty.middleName : ''} ${authoruty.lastName}`.trim()
        })).sort((a: any, b: any) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
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
    this.spinnerLoader = true;
    this.loading = true;
    const fileName = `${this.probationLetterData.firstName}_${this.probationLetterData.lastName}_${Date.now()}_ProbationConfirmationLetter.pdf`;
    const isSoftCopy = this.probationConfirmationForm.get('Documenttype')?.value === true;
    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);

    const docDef = buildProbationConfirmationLetterDoc({
      firstName: this.probationLetterData.firstName || '',
      middleName: this.probationLetterData.middleName || '',
      lastName: this.probationLetterData.lastName || '',
      fusionEmpId: this.probationLetterData.fusionEmpId || '',
      jobRole: this.probationLetterData.jobRole || '',
      department: this.probationLetterData.department || '',
      workLocation: this.probationLetterData.workLocation || '',
      issuedDate: this.probationLetterData.issuedDate || '',
      effectiveDate: this.probationLetterData.effectiveDate || '',
      authorityName: this.probationLetterData.authorityName || '',
      authorityDesignation: this.probationLetterData.authorityDesignation || '',
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
      this.uploadProbationLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.loading = false;
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

  uploadProbationLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationFile).subscribe({
      next: (data: any) => {
        //this.openModalService.openSuccessModal("Probation confirmation letter generated successfully");
        if (data) {
          this.postProbationDetails(data.path);
        }
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
        this.openModalService.openErrorModal('file upload  is failed');
      },
      complete: () => {
        this.enableBtn = true;
        this.spinnerLoader = false;
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
        } else {
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
  postProbationDetails(path: any) {
    let payload = {
      probationId: this.getProbationDetails?.probationId,
      formId: this.getProbationDetails?.formId,
      employeeId: this.getProbationDetails?.employeeId,
      responseId: this.getProbationDetails?.responseId,
      probationStartDate: this.getProbationDetails?.probationStartDate,
      probationEndDate: this.getProbationDetails?.probationEndDate,
      probationExtendedDate: this.getProbationDetails?.probationExtendedDate,
      status: this.getProbationDetails?.status,
      createdBy: this.Employeeinfo?.employeeId,
      updatedBy: this.Employeeinfo?.employeeId,
      updatedAt: this.todayDate,
      probationDays: this.getProbationDetails?.probationDays,
      raisedBy: this.getProbationDetails?.raisedBy,
      documentURL: path,
      parentId: this.getProbationDetails?.parentId,
      probationExtendCount: this.getProbationDetails?.probationExtendCount,
      meta: this.getProbationDetails?.meta,
      appliedDate: this.getProbationDetails?.appliedDate,
      comments: this.getProbationDetails?.comments,
      candidateStatus: 'Generated',
      IssuedDate: this.probationConfirmationForm.get('issuedDate')?.value,
      AuthoritySignature: this.probationConfirmationForm.get('authorityid')?.value.employeeId,
      generatedDate: this.probationConfirmationForm.get('effectiveDate')?.value,
      generatedBy: this.Employeeinfo?.employeeId,
      DocType: this.probationConfirmationForm.get('Documenttype')?.value,
      letterType: 'Probation Confirmation Letter'
    }
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', payload).subscribe({
      next: (data: any) => {
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = true;
        this.loading = false;
        this.enableBtn = true;
        this.openModalService.openSuccessModal("Probation confirmation letter generated successfully");
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  //function to patch the values in the form to the template
  pathValuesFuction() {
    const formValues = this.probationConfirmationForm.value;
    const employee = formValues.employeeId;
    const jobDetails = employee?.jobDetails;
    const authority = formValues.authorityid;
    this.probationLetterData.firstName = employee?.firstName || '';
    this.probationLetterData.middleName = employee?.middleName || '';
    this.probationLetterData.lastName = employee?.lastName || '';
    this.probationLetterData.fusionEmpId = employee?.fusionEmpId || '';
    this.probationLetterData.jobRole = jobDetails?.jobRole || '';
    this.probationLetterData.department = employee?.departmentName || '';
    this.probationLetterData.workLocation = jobDetails?.subLocation && jobDetails?.lopcation
      ? `${jobDetails.subLocation}, ${jobDetails.lopcation}` : jobDetails?.subLocation || jobDetails?.lopcation || '';
    this.probationLetterData.issuedDate = formValues.issuedDate || '';
    this.probationLetterData.effectiveDate = formValues.effectiveDate || '';
    this.probationLetterData.Copys = formValues.Documenttype || '';
    this.probationLetterData.authorityName = authority ? [authority.firstName, authority.middleName, authority.lastName].filter(Boolean).join(' ') : '';
    this.probationLetterData.authorityDesignation = authority?.designation || '';
    this.probationLetterData.employeeId = employee?.employeeId || '';
  }

  //to post probation letter email Details to the offerletter table
  probationConfirmationemail() {
    this.releaseLoader = true;
    let pdata = {
      employeeId: this.probationLetterData.employeeId,
      documentUrl: this.Documenturlresult,
      generatedBy: this.Employeeinfo.employeeId,
      generatedDate: new Date().toISOString(),
    }
    this.subscription = this.http.postdata(`CustomEmail/ConfirmationofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        this.getProbationEmployees()
        this.openModalService.openSuccessModal("Email has been sent successfully");
        setTimeout(() => {
          this.naviagte();
        }, 2000)
      },
      error: (err: any) => {
        this.releaseLoader = false;
      },
      complete: () => {
        this.enableBtn = false;
        this.releaseLoader = false;
        this.probationConfirmationForm.reset();
        this.probationLetterData = {};
        this.selectedEmployee = null;
        this.getProbationDetails = {};
        this.lastSelectedEmployeeId = null;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}