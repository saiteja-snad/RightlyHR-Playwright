import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { IAddress, IaddressemployeeDetails } from '../../../Interfaces/letters-model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { OpenModalService } from '../../../services/open-modal.service';
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { CommonModule } from '@angular/common';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";

@Component({
  selector: 'app-probation-extension-letter-acknowledgement',
  imports: [LettersheaderComponent, CommonModule, DateformatPipe, LetterFooterComponent],
  templateUrl: './probation-extension-letter-acknowledgement.component.html',
  styleUrl: './probation-extension-letter-acknowledgement.component.scss'
})
export class ProbationExtensionLetterAcknowledgementComponent implements OnInit, OnDestroy {
  @Input() letterdata: any;
  subscription!: Subscription;

  constructor(
    private http: HttpService,
    private router: Router,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private confirmation: OpenModalService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  Employeeinfo = {} as any;
  employeeName: any
  probationExtensionLetterData = {} as any;

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    console.log(this.Employeeinfo);
    this.employeeName = `${this.Employeeinfo.firstName ?? ''} ${this.Employeeinfo.middleName ?? ''
      } ${this.Employeeinfo.lastName ?? ''}`;
    this.probationExtensionLetterData = this.Employeeinfo;
    this.Onclick(this.Employeeinfo.employeeId);
    this.getEmployeeId();
  }

  fusionEmpId: any;
  Onclick(employeeid: any) {
    this.fusionEmpId = employeeid;
    console.log(employeeid);
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
    this.subscription = this.http
      .getData(`ProbationFlow/getAllProbationEmployees?substatus=${'Probation Extended'}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IaddressemployeeDetails[];
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }


  probationDate: any;
  getProbationDetailsbyId() {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${this.Employeeinfo?.employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);

          if (data && data.length > 0) {
            const probationData = data[0]; // Use first record

            this.probationExtensionLetterData = probationData;
            this.probationExtensionLetterData.probationmonths = this.convertDaysToMonths(
              probationData.probationEndDate,
              probationData.probationExtendedDate
            );
          }
          // this.probationDate = data[0].issuedDate;
          this.probationDate= this.letterdata.issuedDate;
          this.probationExtensionLetterData.docType = this.letterdata.docType;
          console.log('Issued Date:', this.probationDate);
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
        console.log(data);
        this.authorityDetails = data
        if (this.letterdata.authoritySignature) {
          if (this.authorityDetails?.length > 0) {
            const signatureAuthorityDetails = this.authorityDetails.find(
              (c: any) => (c.employeeId == this.letterdata.authoritySignature)
            );
            console.log(signatureAuthorityDetails)
            if (signatureAuthorityDetails) {
              this.authorityDesignation = signatureAuthorityDetails.designation;
              this.probationExtensionLetterData.authorityName = `${signatureAuthorityDetails?.firstName ?? ''} ${signatureAuthorityDetails?.middleName ? signatureAuthorityDetails?.middleName : ''} ${signatureAuthorityDetails?.lastName ?? ''}`;
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
        console.log(response);

        this.getProbationDetails = response.find((ele: any) => {
          return (ele.status?.toLowerCase() === 'extended');
        });
        console.log(this.getProbationDetails);
      }
    })
  }

  //get Job Details by empployeeid
  employeeJobDetails = {} as any;
  jobRole: any
  workLocation: any
  department: any
  getJobdetails() {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${this.Employeeinfo?.employeeId}`)
      .subscribe({
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

          console.log(this.jobRole);
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
    console.log(Value);

    console.log(EmployeeId);

    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${this.Employeeinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
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
    console.log(data);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();

    const pdfContents = [
      'pdfContent',

    ]; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    this.isLoading = true;

    for (const contentId of pdfContents) {
      const pdfContent = document.getElementById(contentId);
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        imagesData.push({ imgData, imgHeight });
      }
    }

    // Add all images to the PDF except for the last one
    for (let i = 0; i < imagesData.length - 1; i++) {
      const imageData = imagesData[i];
      pdf.addImage(
        imageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        imageData.imgHeight,
        '',
        'FAST'
      );
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }

    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(
        lastImageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        lastImageData.imgHeight,
        '',
        'FAST'
      );
    }

    // const fileName = `${data.firstName}${data.middleName ? `_${data.middleName}` : ''}${data.lastName ? `_${data.lastName}` : ''}_${new Date().getTime()}_ProbationExtensionLetter.pdf`;
    // pdf.save(fileName);
    const middleNamePart = data.middleName && data.middleName.trim() !== '' ? `_${data.middleName}` : '';
    const lastNamePart = data.lastName && data.lastName.trim() !== '' ? `_${data.lastName}` : '';
    const fileName = `${data.firstName}${middleNamePart}${lastNamePart}_${new Date().getTime()}_ProbationExtensionLetterSigned.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    this.probationletterFile = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.uploadAppointLetter();
  }


  uploadAppointLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.Employeeinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.probationletterFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postacknowledgement(data.path);
            console.log(data);
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
      generatedBy: this.Employeeinfo.employeeId,
      issuedDate: this.letterdata.issuedDate,
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          console.log(data);
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
