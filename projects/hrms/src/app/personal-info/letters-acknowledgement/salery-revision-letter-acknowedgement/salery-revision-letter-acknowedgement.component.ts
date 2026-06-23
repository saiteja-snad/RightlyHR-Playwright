import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../../letters-builder-files/custom-fonts-vfs';
import { buildSalaryRevisionLetterDoc } from '../../../letters-builder-files/salary-revision-letter.builder';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { FormValidationsService } from '../../../services/form-validations.service';
import { IAddress } from '../../../Interfaces/letters-model';
import { fetchLetterAssets, setupLetterPdfMake } from '../../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-salery-revision-letter-acknowedgement',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, DateformatPipe, ConfirmationIconComponent],
  templateUrl: './salery-revision-letter-acknowedgement.component.html',
  styleUrl: './salery-revision-letter-acknowedgement.component.scss'
})

export class SaleryRevisionLetterAcknowedgementComponent implements OnInit, OnDestroy {
  employeeForm!: FormGroup;
  rejectForm!: FormGroup;
  appraisalData = {} as any;
  authorityDesignation: string | null = null;
  authorityDetails: any[] = [];
  Employeeinfo = {} as any;
  employeeiddetails: any[] = [];
  employeeCompensationDetails = {} as any;
  result = {} as any;
  isacknowledged = true;
  isRejecting = false;
  spinnerLoader = false;
  jobErrorMessage = '';
  currentDate = new Date().toISOString();
  address = {} as IAddress;
  employeeaddress = [] as any;
  gender: any;
  grossSalary: any;
  previusSalary: any;
  incrementSalary: any;
  getjobrole: any;
  promotionDate: any;
  docType: any;
  PromotionFile!: File;
  subscription!: Subscription;
  @Input() letterdata: any;

  constructor(private http: HttpService, private conformationPopup: OpenModalService, 
    private modalService: NgbModal, private fb: FormBuilder, public formsValidation: FormValidationsService) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      jobValid: [false, Validators.requiredTrue]
    });
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.pattern(/^(?!\s).*/)]],
    });
    this.getEmployeeId();
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data;
        this.Employeeinfo = JSON.parse(localStorage.getItem('rightlyHrUserData') || '{}');
        this.Onclick(this.Employeeinfo.employeeId);
      },
      error: (err: any) => console.log(err),
    });
  }

  Onclick(employeeId: any) {
    this.appraisalData = this.employeeiddetails.find((c: any) => c.employeeId == employeeId) ?? {};
    this.gender = this.appraisalData.gender === 'Male' ? 'Mr.' : 'Ms.';
    if (this.letterdata) {
      this.appraisalData.addressType = this.letterdata.addressType;
      this.appraisalData.docType = this.letterdata.docType;
    }
    this.getCompensationById(this.appraisalData);
    this.getJobdetails(this.appraisalData);
    this.getdatepromotion();
    this.getAuthorityDetails();
    this.getEmployeeAddress(this.appraisalData.employeeId);
  }

  getEmployeeAddress(employeeId: any) {
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data;
        if (this.employeeaddress?.employeeAddresses?.length > 0 && this.appraisalData.addressType) {
          this.address = this.employeeaddress.employeeAddresses.find(
            (a: IAddress) => a.type?.toLowerCase() == this.appraisalData.addressType?.toLowerCase()
          );
          if (this.address) {
            this.appraisalData.addressLine1 = this.address.addressLine1;
            this.appraisalData.addressLine2 = this.address.addressLine2;
            this.appraisalData.city = this.address.city;
            this.appraisalData.state = this.address.state;
            this.appraisalData.zipCode = this.address.zipCode;
          }
        }
      },
    });
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No job details found for this employee.';
          this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          const res = data.reverse()[0];
          Employee.jobRole = res.jobRole;
          this.getjobrole = res.jobRole;
          this.jobErrorMessage = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
      },
      error: (err: any) => console.log(err),
    });
  }

  getAuthorityDetails() {
    const offertype = 'Salary Revision Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data ?? [];
        if (this.letterdata?.authoritySignature && this.authorityDetails.length > 0) {
          const match = this.authorityDetails.find(
            (c: any) => c.employeeId == this.letterdata.authoritySignature
          );
          if (match) {
            this.authorityDesignation = match.designation;
            this.appraisalData.authorityName = [match.firstName, match.middleName, match.lastName]
              .filter(Boolean).join(' ');
          }
        }
      },
    });
  }

  getdatepromotion() {
    const letterType = 'Salary Revision Letter';
    this.subscription = this.http.getData(
      `AppraisalLetter/getgeneratedappraisalpromotionletter?employeeId=${this.Employeeinfo.employeeId}&letterType=${encodeURIComponent(letterType)}`
    ).subscribe({
      next: (data: any) => {
        this.promotionDate = data.issuedDate;
        this.docType = data.docType;
        this.appraisalData.dateofAppraisal = data.issuedDate;
        this.appraisalData.docType = data.docType;
      },
    });
  }

  getCompensationById(Employee: any) {
    this.subscription = this.http.getData(`Compensationdata/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No Compensation details found for this employee.';
          return;
        }
        const sorted = data.sort((a: any, b: any) =>
          new Date(b.compeffectivedate).getTime() - new Date(a.compeffectivedate).getTime()
        );
        const res = sorted[0];

        this.previusSalary = data.length > 1 ? sorted[1] : { compensationamount: 0 };
        this.incrementSalary = res.compensationamount - this.previusSalary.compensationamount;
        this.employeeCompensationDetails = res;

        Employee.salary = res.compensationamount;
        Employee.compeffectivedate = res.compeffectivedate;
        Employee.variablePayAmount = res.variablePayAmount ?? null;

        Employee.grossby = 12;
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby);
        this.grossSalary = Employee.grossSalary;

        Employee.pfContribution = 0;
        Employee.esicContribution = 0;
        Employee.employeeEsi = 0;

        if (Employee.grossSalary < 15000) Employee.professionalTax = 0;
        else if (Employee.grossSalary < 21000) Employee.professionalTax = 150;
        else Employee.professionalTax = 200;

        Employee.totalGrossSalary = Employee.grossSalary;
        Employee.basicSalary = Math.round(Employee.totalGrossSalary * 0.6);
        Employee.hraSalary = Math.round(Employee.basicSalary * 0.4);
        Employee.educationAllowances = 0;
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * 0.16);
        Employee.totalDeduction = Math.round(Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax);
        Employee.netSalary = Math.round(Employee.totalGrossSalary - Employee.totalDeduction);

        Employee.pfPreAnuum = 0;
        Employee.totalGrossPerAnnum = Math.round(Employee.totalGrossSalary * Employee.grossby);
        Employee.basicPerannum = Math.round(Employee.basicSalary * Employee.grossby);
        Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
        Employee.esiPerAnnum = 0;
        Employee.esiPerAnnumemployee = 0;
        Employee.educationallowancesPerAnnum = 0;
        Employee.otherAllowancesPerAnnum = Math.round(Employee.otherAllowances * Employee.grossby);
        Employee.professionalPerAnnum = Math.round(Employee.professionalTax * Employee.grossby);
        Employee.totalDeductionsPerAnnum = Math.round(
          Employee.pfPreAnuum + Employee.esiPerAnnumemployee + Employee.professionalPerAnnum
        );
        Employee.netSalaryPerAnnum = Math.round(Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum);
        Employee.ctcperannum = Math.round(Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum);
      },
      error: (err: any) => console.log(err),
    });
  }

  async postAppraisalLetterFormSubmit() {
    this.spinnerLoader = true;
    const data = this.appraisalData;

       const isSoftCopy = !!data.docType;

    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);

    const docDef = buildSalaryRevisionLetterDoc({
      firstName: data.firstName ?? this.Employeeinfo.firstName,
      middleName: data.middleName ?? this.Employeeinfo.middleName,
      lastName: data.lastName ?? this.Employeeinfo.lastName,
      gender: this.gender,
      jobRole: data.jobRole ?? this.getjobrole ?? '',
      letterDate: this.promotionDate,
      compEffectiveDate: data.compeffectivedate,
      totalCTC: (data.salary || 0) + (data.variablePayAmount || 0),
      variablePayAmount: data.variablePayAmount,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      basicSalary: data.basicSalary,
      basicPerannum: data.basicPerannum,
      hraSalary: data.hraSalary,
      hraPerAnnum: data.hraPerAnnum,
      otherAllowances: data.otherAllowances,
      otherAllowancesPerAnnum: data.otherAllowancesPerAnnum,
      totalGrossSalary: data.totalGrossSalary,
      totalGrossPerAnnum: data.totalGrossPerAnnum,
      pfContribution: data.pfContribution,
      pfPreAnuum: data.pfPreAnuum,
      employeeEsi: data.employeeEsi,
      esiPerAnnumemployee: data.esiPerAnnumemployee,
      professionalTax: data.professionalTax,
      professionalPerAnnum: data.professionalPerAnnum,
      educationAllowances: data.educationAllowances,
      educationallowancesPerAnnum: data.educationallowancesPerAnnum,
      totalDeduction: data.totalDeduction,
      totalDeductionsPerAnnum: data.totalDeductionsPerAnnum,
      netSalary: data.netSalary,
      netSalaryPerAnnum: data.netSalaryPerAnnum,
      esicContribution: data.esicContribution,
      esiPerAnnum: data.esiPerAnnum,
      grossSalary: data.grossSalary ?? this.grossSalary,
      salary: data.salary,
      authorityFullName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeSignatureDate: new Date().toISOString(),
    });

    try {
      const blob: Blob = await pm.createPdf(docDef).getBlob();
      const firstName = data.firstName ?? this.Employeeinfo.firstName;
      const middleName = data.middleName ?? this.Employeeinfo.middleName;
      const lastName = data.lastName ?? this.Employeeinfo.lastName;
      const fileName = `${firstName}${middleName ? `_${middleName}` : ''}_${lastName}_${new Date().getTime()}_SalaryRevisionLetter_Signed.pdf`;
      this.PromotionFile = new File([blob], fileName, { type: 'application/pdf' });
      this.uploadPromotionLetter();
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.spinnerLoader = false;
      this.conformationPopup.openErrorModal('Failed to generate Salary Revision Letter');
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

  uploadPromotionLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Salary Revision Letters/${this.Employeeinfo.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.PromotionFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          this.result.documentUrl = data.path;
          this.postPromotionlettersDetails(this.result.documentUrl);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('File upload failed');
      },
    });
  }

  postPromotionlettersDetails(filePath: string) {
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.Employeeinfo.employeeId,
      signedDocUrl: filePath,
      status: 'Released',
      authoritySignature: this.letterdata.authoritySignature,
      note: '',
      issuedDate: this.letterdata.issuedDate,
      rejectedComments: this.rejectForm.get('comments')?.value || '',
      candidateStatus: 'Acknowledged',
      generatedBy: this.letterdata.generatedBy,
    };
    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: () => {
        this.isRejecting = false;
        this.isacknowledged = true;
        this.modalService.dismissAll();
        this.http.triggerRefresh();
        this.conformationPopup.openSuccessModal('Salary Revision Letter Acknowledged Successfully');
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isacknowledged = false;
        this.isRejecting = false;
        this.conformationPopup.openErrorModal(error.error.message);
      },
      complete: () => {
        this.isacknowledged = false;
        this.isRejecting = false;
      },
    });
  }

  postPromotionLetter() {
    this.spinnerLoader = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.Employeeinfo.employeeId,
      signedDocUrl: '',
      status: 'Released',
      authoritySignature: this.letterdata.authoritySignature,
      note: '',
      issuedDate: this.letterdata.issuedDate,
      rejectedComments: this.rejectForm.get('comments')?.value || '',
      candidateStatus: 'Rejected',
      generatedBy: this.letterdata.generatedBy,
    };
    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: () => {
        this.isRejecting = false;
        this.isacknowledged = true;
        this.modalService.dismissAll();
        this.http.triggerRefresh();
        this.conformationPopup.openSuccessModal('Salary Revision Letter Rejected Successfully');
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isacknowledged = false;
        this.isRejecting = false;
        this.conformationPopup.openErrorModal(error.error.message);
      },
      complete: () => {
        this.spinnerLoader = false;
      },
    });
  }

  clearRejectForm() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
