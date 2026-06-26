import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { IAddress, IaddressemployeeDetails } from '../../../Interfaces/letters-model';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../../letters-builder-files/custom-fonts-vfs';
import { buildProbationExtensionLetterDoc } from '../../../letters-builder-files/probation-extension-letter.builder';
import { OpenModalService } from '../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-probation-extension-letter-acknowledgement',
  imports: [CommonModule, DateformatPipe, ConfirmationIconComponent, LetterFooterComponent, LettersheaderComponent],
  templateUrl: './probation-extension-letter-acknowledgement.component.html',
  styleUrl: './probation-extension-letter-acknowledgement.component.scss'
})

export class ProbationExtensionLetterAcknowledgementComponent implements OnInit, OnDestroy {
  @Input() letterdata: any;
  subscription!: Subscription;
  Employeeinfo = {} as any;
  employeeName: any
  probationExtensionLetterData = {} as any;

  constructor(private http: HttpService, config: NgbModalConfig, private modalService: NgbModal,
    private confirmation: OpenModalService) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.employeeName = `${this.Employeeinfo.firstName ?? ''} ${this.Employeeinfo.middleName ?? ''}
    ${this.Employeeinfo.lastName ?? ''}`;
    this.probationExtensionLetterData = this.Employeeinfo;
    this.Onclick(this.Employeeinfo.employeeId);
    this.getEmployeeId();
  }

  fusionEmpId: any;
  Onclick(employeeid: any) {
    this.fusionEmpId = employeeid;
    this.probationExtensionLetterData = {}
    this.probationExtensionLetterData = this.Employeeinfo;
    this.getProbationDetailsbyId();
    this.getProbationRequest(this.probationExtensionLetterData?.employeeId);
    this.getJobdetails();
    this.getEmployeeAddress(this.probationExtensionLetterData);
  }

  //get employee ids for dropdown
  employeeiddetails = [] as any;
  getEmployeeId() {
    this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${'Probation Extended'}`).subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IaddressemployeeDetails[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  probationDate: any;
  getProbationDetailsbyId() {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${this.Employeeinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          const probationData = data[0]; // Use first record
          this.probationExtensionLetterData = probationData;
          this.probationExtensionLetterData.probationmonths = this.convertDaysToMonths(
            probationData.probationEndDate,
            probationData.probationExtendedDate
          );
        }
        // this.probationDate = data[0].issuedDate;
        this.probationDate = this.letterdata.issuedDate;
        this.probationExtensionLetterData.docType = this.letterdata.docType;
        this.getAuthorityDetails();
      },
      error: (error) => {
        console.error('Error fetching probation details:', error);
      }
    });
  }

  //get offer letter Authority list
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  getAuthorityDetails() {
    let offertype = 'Probation Extension Letter'
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data
        if (this.letterdata.authoritySignature) {
          if (this.authorityDetails?.length > 0) {
            const signatureAuthorityDetails = this.authorityDetails.find(
              (c: any) => (c.employeeId == this.letterdata.authoritySignature)
            );
            if (signatureAuthorityDetails) {
              this.authorityDesignation = signatureAuthorityDetails.designation;
              this.probationExtensionLetterData.authorityName = `${signatureAuthorityDetails?.firstName ?? ''}
              ${signatureAuthorityDetails?.middleName ? signatureAuthorityDetails?.middleName : ''}
              ${signatureAuthorityDetails?.lastName ?? ''}`;
            }
          }
        }
      }
    })
  }

  //function to get the separation request details
  getProbationDetails = {} as any;
  getProbationRequest(EmployeeId: any) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${this.Employeeinfo?.employeeId}`).subscribe({
      next: (response: any) => {
        this.getProbationDetails = response.find((ele: any) => {
          return (ele.status?.toLowerCase() === 'extended');
        });
      }
    })
  }

  //get Job Details by empployeeid
  employeeJobDetails = {} as any;
  jobRole: any
  workLocation: any
  department: any
  getJobdetails() {
    this.subscription = this.http.getData(`JobDetails/Empname/${this.Employeeinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        const today = new Date();
        const pastEffectiveJobs = data.filter((job: any) =>
          new Date(job.effectiveDate) <= today
        );
        pastEffectiveJobs.sort((a: any, b: any) =>
          new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
        );
        const res = pastEffectiveJobs[0];
        this.employeeJobDetails = res;
        this.jobRole = res.jobRole;
        this.workLocation = `${res.locationName}, ${res.sublocationName}`;
        this.department = res.department
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //function to get the address
  employeeaddress = [] as any;
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value?.employeeId
    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${this.Employeeinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
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

  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
  }

  isLoading = false;
  probationletterFile!: File;
  isacknowledged = true;
  async onAppointmentLetterSubmit() {
    this.isLoading = true;
    const data = this.probationExtensionLetterData;

    const isSoftCopy = !!data.docType;

    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);
    const docDef = buildProbationExtensionLetterDoc({
      firstName: this.Employeeinfo.firstName,
      middleName: this.Employeeinfo.middleName,
      lastName: this.Employeeinfo.lastName,
      fusionEmpId: this.employeeaddress.fusionEmpId,
      jobRole: this.jobRole,
      department: this.department,
      workLocation: this.workLocation,
      issuedDate: this.probationDate,
      probationmonths: data.probationmonths,
      probationExtendedDate: data.probationExtendedDate,
      authorityName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeSignatureDate: new Date().toISOString(),
    });

    const blob: Blob = await pm.createPdf(docDef).getBlob();
    const firstName = this.Employeeinfo.firstName ?? '';
    const middleNamePart = this.Employeeinfo.middleName?.trim() ? `_${this.Employeeinfo.middleName}` : '';
    const lastNamePart = this.Employeeinfo.lastName?.trim() ? `_${this.Employeeinfo.lastName}` : '';
    const fileName = `${firstName}${middleNamePart}${lastNamePart}_${new Date().getTime()}_ProbationExtensionLetter_Signed.pdf`;
    this.probationletterFile = new File([blob], fileName, { type: 'application/pdf' });
    this.uploadAppointLetter();
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

  uploadAppointLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.Employeeinfo.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.probationletterFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.postacknowledgement(data.path);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  postacknowledgement(filePath: string) {
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.Employeeinfo.employeeId,
      signedDocUrl: filePath,
      candidateStatus: 'Acknowledged',
      // status: 'Acknowledged',
      generatedDate: this.letterdata.generatedDate,
      generatedBy: this.letterdata.generatedBy,
      issuedDate: this.letterdata.issuedDate,
    };
    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: (data: any) => {
        this.isacknowledged = true;
        this.isLoading = false;
        this.confirmation.openSuccessModal('Probation Extenstion Letter Acknowledged Successfully');
        setTimeout(() => {
          this.modalService.dismissAll();
          this.http.triggerRefresh();
        }, 2000)
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isacknowledged = false;
        this.isLoading = false;
        this.confirmation.openErrorModal(error.error.error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
