import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IAddress, IJobDetails, Iofferletter } from '../../models/offer-letter.model';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../http-services/http.service';
import { Router } from '@angular/router';
import moment from 'moment';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../../../../hrms/src/app/letters-builder-files/custom-fonts-vfs';
import { buildTraineeOfferLetterDoc } from '../../../../../hrms/src/app/letters-builder-files/trainee-offer-letter.builder';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../../../../hrms/src/app/pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { PopupService } from '../../common-services/popup.service';
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
@Component({
  selector: 'app-trainee-offerletter',
  imports: [DateformatPipe, ReactiveFormsModule, CommonModule, DetailedStepProgressbarComponent],
  templateUrl: './trainee-offerletter.component.html',
  styleUrl: './trainee-offerletter.component.scss'
})

export class TraineeOfferletterComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  doxImageUrl!: any;
  prosempdata = {} as any;
  traineeEmpData = {} as any;
  offeraccepteddata = {} as any;
  getofferdata = {} as any;
  rejectionReason = {} as Iofferletter;
  offerDetails = {} as any;
  prospectiveemployees = {} as any;
  offerlettergenerated = {} as any;
  updatedOfferLetterDetails = {} as Iofferletter
  offerLetterData = {} as any;
  authorityDesignation!: string | null;
  jobDesignation!: string | null;
  jobDeatils = [] as any;
  employeeCompensationDetails = [] as any;
  generatedfile = {} as any; //variable to store generated file
  employeeaddress = [] as any;
  loadingcircle: boolean = false;
  currentDate = new Date();
  rejectForm!: FormGroup;
  @ViewChild('acceptpopup') acceptpopup: any;
  @ViewChild('rejectpopup') rejectpopup: any;
  stipendApplicablecheck: boolean | undefined = undefined;
  stipendAmountmonthly!: number;

  constructor(private http: HttpService, private router: Router, config: NgbModalConfig, private modalService: NgbModal,
    private fb: FormBuilder, private openPopup: PopupService,) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    const storedstep = 3;
    localStorage.setItem('currentStep', storedstep.toString());
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getOfferLetterDetails();
    this.offeraccepteddata = localStorage.getItem("offeraccepteddata");
    this.traineeEmpData = this.prosempdata
    this.getJobDetails(this.prosempdata)
    this.getCompensationDetails(this.prosempdata);
    this.getEmployeeAddress();
    this.getAuthorityDetails();
    this.initializeRejectForm();
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      rejectReason: ['', Validators.required],
    });
  }

  openAccept() {
    this.modalService.open(this.acceptpopup, { centered: true });
  }

  openReject() {
    this.modalService.open(this.rejectpopup, { centered: true });
  }

  //function to navigate to the previous page
  navigatePrevious() {
    this.router.navigate(['/document']);
  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data
  }

  navigateNext() {
    this.router.navigate(['/education-details']);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  async acceptoffer() {
    this.loadingcircle = true;
    try {
      let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
      offerUpdateDetails.candidateStatus = "Offer Letter Accepted";
      await this.downLoadDocument(offerUpdateDetails);
    } catch (err) {
      console.error(err);
      this.loadingcircle = false;
    }
  }

  updateOfferDetailsforAccept(updatedData: Iofferletter) {
    this.subscription = this.http.postData('PreOnboardingTraineeOfferLetter/UPDATE', updatedData).subscribe({
      next: (respone: any) => {
        this.getOfferLetterDetails();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
      },
    })
  }

  //function to get address details
  getEmployeeAddress() {
    let EmployeeId = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        this.getOfferLetterDetails()
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getCompensationDetails(Employee: any) {
    this.subscription = this.http.getData(`PreonboardingCompensation/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let res = data.reverse()[0];
        this.employeeCompensationDetails = res;
        this.traineeEmpData.salary = Employee.salary = res?.compensationamount;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getJobDetails(Employee: any) {
    let EmployeeId = Employee.employeeId
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobDeatils = data as IJobDetails[];
        let res = data[0];
        this.jobDeatils = res;
        this.traineeEmpData.reportingmanagerName = `${res?.fName} ${res?.mName ?? ''} ${res?.lName}`;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = res.lopcation;
        Employee.subLocation = res.subLocation;
        this.getaddress(this.jobDeatils?.locationId, this.jobDeatils?.subLocationId);
      }
    })
  }

  getaddress(locationId: number, sublocationId: number) {
    this.subscription = this.http.getData(`PreonboardingJobDetails/GetbyJobLocationSubLocationId?joblocid=${locationId}&sublocid=${sublocationId}`).subscribe({
      next: (data: any) => {
        this.traineeEmpData.address = data?.address;
      }
    })
  }

  //get offer letter Authority list
  authorityDetails = [] as any;
  getAuthorityDetails() {
    let offertype = 'Offer Letter';
    this.subscription = this.http.getData(`Preonboardingsignaturauthority?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data;
        if (this.getofferdata?.authoritySignature) {
          const auth = this.authorityDetails.find((c: any) => c.employeeId == this.getofferdata.authoritySignature);
          if (auth) {
            this.authorityDesignation = auth.designation;
            this.traineeEmpData.authorityName = auth.middleName
              ? `${auth.firstName} ${auth.middleName ?? ''} ${auth.lastName}`
              : `${auth.firstName} ${auth.lastName}`;
          }
        }
      },
    });
  }

  //function to get the offerletter details
  address = {} as IAddress;
  getOfferLetterDetails() {
    let EmployeeId = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/getbyEmpidNames/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getofferdata = data;
        this.getOfferDetailsByOfferId(parseInt(this.getofferdata.id))
        let url = this.getofferdata.documentUrl
        this.stipendAmountmonthly = this.getofferdata?.stipendAmount;
        const stipendRaw = this.getofferdata?.stipendApplicable;
        if (stipendRaw !== null && stipendRaw !== undefined) {
          this.stipendApplicablecheck = stipendRaw === true || stipendRaw === 1 ||
            (typeof stipendRaw === 'string' && ['true', 'yes', '1'].includes(stipendRaw.trim().toLowerCase()));
        }
        this.traineeEmpData.offerSentDate = this.getofferdata.offerSentDate
        this.traineeEmpData.offerExpiryDate = this.getofferdata.offerExpiryDate
        this.traineeEmpData.note = this.getofferdata.note
        this.traineeEmpData.dateOfJoining = this.getofferdata.offerStartDate || this.traineeEmpData.dateOfJoining;
        const rawEndDate = this.getofferdata.trainingEndDate || this.getofferdata.offertrainingEndDate;
        if (rawEndDate) {
          this.traineeEmpData.trainingEndDate = rawEndDate;
        } else if (this.getofferdata.durationOfTraining && this.traineeEmpData.dateOfJoining) {
          this.traineeEmpData.trainingEndDate = moment(this.traineeEmpData.dateOfJoining).add(this.getofferdata.durationOfTraining, 'days').format('YYYY-MM-DD');
        }
        if (this.employeeaddress?.employeeAddresses?.length > 0) {
          this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) =>
            address.type.toLowerCase() == this.getofferdata.addressType.toLowerCase())
        }
        this.traineeEmpData.addressLine1 = this.address.addressLine1
        this.traineeEmpData.addressLine2 = this.address.addressLine2
        this.traineeEmpData.city = this.address.city
        this.traineeEmpData.state = this.address.state
        this.traineeEmpData.country = this.address.country
        this.traineeEmpData.zipCode = this.address.zipCode
        let signatureAuthorityDetails = this.authorityDetails.find(
          (c: any) => (c.employeeId == this.getofferdata.authoritySignature)
        );
        if (signatureAuthorityDetails) {
          this.authorityDesignation = signatureAuthorityDetails.designation;
          if (signatureAuthorityDetails.middleName) {
            this.traineeEmpData.authorityName = `${signatureAuthorityDetails.firstName}
            ${signatureAuthorityDetails.middleName ?? ''} ${signatureAuthorityDetails.lastName}`;
          } else
            this.traineeEmpData.authorityName = `${signatureAuthorityDetails.firstName}
            ${signatureAuthorityDetails.lastName}`;
        }
        else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
          this.traineeEmpData.authorityName = '';
          this.authorityDesignation = '';
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getTrainingDurationInMonths(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months += endDate.getMonth() - startDate.getMonth();
    // If end day is before start day, reduce by 1
    if (endDate.getDate() < startDate.getDate()) {
      months--;
    }
    return months >= 0 ? months : 0;
  }

  getOfferDetailsByOfferId(offerId: number) {
    this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/getbyid/${offerId}`).subscribe({
      next: (respone: any) => {
        if (respone) {
          this.updatedOfferLetterDetails = respone as Iofferletter;
          if (this.stipendApplicablecheck === undefined) {
            const raw = respone?.stipendApplicable;
            if (raw !== null && raw !== undefined) {
              this.stipendApplicablecheck = raw === true || raw === 1 ||
                (typeof raw === 'string' && ['true', 'yes', '1'].includes(raw.trim().toLowerCase()));
            }
          }
          if (!this.stipendAmountmonthly && respone?.stipendAmount != null) {
            this.stipendAmountmonthly = respone.stipendAmount;
          }
        }
      },
      error: (reason: any) => {
        // this.dataFailureMsg("Something went wrong")
        this.openPopup.openSuccess("Something went wrong");
      },
      complete: () => {
      }
    })
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

  //download document
  async downLoadDocument(offerUpdateDetails: Iofferletter) {
    const data = this.traineeEmpData;
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    // Resolve authority at generation time to avoid race condition with getAuthorityDetails()
    const signatureAuth = this.authorityDetails.find(
      (c: any) => c.employeeId == this.getofferdata.authoritySignature
    );
    if (signatureAuth) {
      this.authorityDesignation = signatureAuth.designation;
      data.authorityName = signatureAuth.middleName
        ? `${signatureAuth.firstName} ${signatureAuth.middleName} ${signatureAuth.lastName}`
        : `${signatureAuth.firstName} ${signatureAuth.lastName}`;
    }

    const [backgroundImageBase64, verdanaItalic, verdanaSemiBold] = await Promise.all([
      this.fetchImageAsBase64('/images/snad-new-letter-bg.png'),
      this.getFileBase64('/fonts/Verdana Italic.ttf'),
      this.getFileBase64('/fonts/verdana-pro-semi-bold.ttf'),
    ]);

    const pm = (pdfMake as any).default ?? pdfMake;
    const mergedVfs: Record<string, string> = { ...customVfs };
    if (verdanaItalic)   mergedVfs['VerdanaItalic.ttf']   = verdanaItalic;
    if (verdanaSemiBold) mergedVfs['VerdanaSemiBold.ttf'] = verdanaSemiBold;
    pm.addVirtualFileSystem(mergedVfs);
    pm.setFonts({
      VERDANA: { normal: 'VerdanaNow.ttf', bold: 'VerdanaNowBold.ttf', italics: verdanaItalic ? 'VerdanaItalic.ttf' : 'VerdanaNow.ttf', bolditalics: 'VerdanaNowBold.ttf' },
      VERDANABOLD: { normal: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', bold: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', italics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf', bolditalics: verdanaSemiBold ? 'VerdanaSemiBold.ttf' : 'VerdanaNowBold.ttf' },
      Autography: { normal: 'Autography.otf', bold: 'Autography.otf', italics: 'Autography.otf', bolditalics: 'Autography.otf' },
    });

    const startDate = this.getofferdata.offerStartDate || this.traineeEmpData.dateOfJoining;
    const rawEnd = this.getofferdata.trainingEndDate || this.getofferdata.offertrainingEndDate;
    const endDate = rawEnd || this.traineeEmpData.trainingEndDate
      || (startDate && this.getofferdata.durationOfTraining
          ? moment(startDate).add(this.getofferdata.durationOfTraining, 'days').format('YYYY-MM-DD')
          : undefined);
    const internshipperiod = this.getofferdata.durationOfTraining
      || (startDate && endDate ? this.getTrainingDurationInMonths(new Date(startDate), new Date(endDate)) : 0);

    const docDef = buildTraineeOfferLetterDoc({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      country: data.country,
      pinCode: data.zipCode,
      offerIssuedDate: data.offerSentDate,
      dateOfJoining: startDate,
      endDate: endDate,
      internshipperiod,
      reportingmanagerName: data.reportingmanagerName,
      officeAddress: data.address,
      stipendApplicable: this.stipendApplicablecheck ?? false,
      monthlyAmount: this.stipendAmountmonthly,
      annualCTC: data.salary,
      note: data.note,
      authorityName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeFullName: fullName,
      backgroundImageBase64,
    });

    const blob: Blob = await pm.createPdf(docDef).getBlob();
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_TraineeOfferLetter_Signed.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    this.generatedfile = file;
    this.offerletterUpload(this.prosempdata.employeeId, this.generatedfile, offerUpdateDetails);
  }

  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File, offerUpdateDetails: Iofferletter) {
    let filePath = `/FusionDocuments/Employee Documents/Trainee Offer Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          this.updatedOfferLetterDetails.documentUrl = data.path;
          offerUpdateDetails.documentUrl = data.path;
          this.loadingcircle = false;
          localStorage.setItem('offerletterurl', data.path);
          this.getOfferLetterDetails();
          this.modalService.dismissAll();
          setTimeout(() => {
            this.openPopup.openSuccess("Offer letter accepted successfully");
            this.updateOfferDetailsforAccept(offerUpdateDetails);
          }, 3000);
          this.loadingcircle = false;
          //this.updateOfferDetails(data.path);
        }
      },
      error: (reason: any) => {
        this.openPopup.openError("Something went wrong");
      },
    });
  }

  downloadoffer() {
    const fileurl = this.updatedOfferLetterDetails.documentURL ?? '';
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', fileurl).subscribe({
      next: (res: any) => {
        const blob: Blob = res.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileurl.substring(fileurl.lastIndexOf('/') + 1);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (reason) => console.log(reason),
    });
  }

  submitRejectReason(form: FormGroup) {
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
    offerUpdateDetails.candidateComments = this.rejectionReason.comments;
    offerUpdateDetails.candidateStatus = "Offer Letter Rejected";
    this.updateOfferDetails(offerUpdateDetails);
    this.prosempdata.substatus = "Offer Letter Rejected";
    this.updateEmployeeDetails(this.prosempdata);
    this.loadingcircle = true;
    form.reset();
  }

  updateOfferDetails(updatedData: Iofferletter) {
    this.subscription = this.http.postData('PreOnboardingTraineeOfferLetter/UPDATE', updatedData).subscribe({
      next: (respone: any) => {
        this.rejectEmailSubmit(respone);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
      },
    })
  }

  updateEmployeeDetails(empdata: any) {
    this.subscription = this.http.postData("PreonboardingEmployeedata/UPDATER", empdata).subscribe({
      next: (respone) => { },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
      },
    })
  }

  Status!: string;
  rejectEmailSubmit(Value: any) {
    let emaildata = {
      empId: this.prosempdata.employeeId,
      comments: Value.candidateComments
    }
    this.subscription = this.http.postData(`PreonboardingEmail/EmployeeOfferRejection`, emaildata).subscribe({
      next: (data: any) => {
        this.loadingcircle = false;
        this.modalService.dismissAll();
        this.getOfferLetterDetails();
        this.openPopup.openSuccess("Offer letter rejected successfully");
      },
      error: (err: any) => {
        console.log(err);
        this.openPopup.openError("Email Sent Failed");
      }
    })
  }

  blockLeadingSpace(event: KeyboardEvent, inputValue: string): void {
    if (event.key === ' ' && inputValue.length === 0) {
      event.preventDefault(); // Block space if it's the first character
    }
  }

  close() {
    this.openPopup.openSuccess("Accepted successfully")
    this.router.navigate(['/login'])
  }

  navigatefirst() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
