import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IAddress, IJobDetails, Iofferletter } from '../../models/offer-letter.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { DateFormatPipe } from "../../pipes/date-format.pipe";
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../../../../hrms/src/app/letters-builder-files/custom-fonts-vfs';
import { buildOfferLetterDoc } from '../../../../../hrms/src/app/letters-builder-files/offer-letter.builder';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from '../../common-services/popup.service';
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../../../../hrms/src/app/letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule, DateFormatPipe, ReactiveFormsModule, DetailedStepProgressbarComponent],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.scss'
})

export class OfferLetterComponent implements OnInit {
  subscription!: Subscription;
  doxImageUrl!: any;
  prosempdata = {} as any;
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
  generatedfile = {} as any;
  employeeaddress = [] as any;
  loadingcircle: boolean = false;
  rejectForm!: FormGroup;
  @ViewChild('acceptpopup') acceptpopup: any;
  @ViewChild('rejectpopup') rejectpopup: any;
  updateempdata = {} as any;
  currentDate = moment();

  constructor(private router: Router, private http: HttpService, private modalService: NgbModal,
    private fb: FormBuilder, private confiramtionpopups: PopupService) { }

  ngOnInit(): void {
    const storedstep = 3;
    localStorage.setItem('currentStep', storedstep.toString());
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getOfferLetterDetails();
    this.getprospectivempdata();
    this.offeraccepteddata = localStorage.getItem("offeraccepteddata");
    this.offerLetterData = this.prosempdata;
    this.getJobDetails(this.prosempdata)
    this.getCompensationDetails(this.prosempdata);
    this.getEmployeeAddress();
    this.getAuthorityDetails();
    this.initializeRejectForm();
  }

  // Prospective Employee Data
  getprospectivempdata() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.updateempdata = data;
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['']);
        }
      }
    });
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      rejectReason: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/)]],
    });
  }

  navigateNext() {
    this.router.navigate(['/education-details']);
  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
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

  //function to get address details
  getEmployeeAddress() {
    let EmployeeId = this.prosempdata.employeeId;
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        this.getOfferLetterDetails();
      },
      error: (err: any) => {
        console.log(err);
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
          this.resolveAuthority();
        }
      },
    });
  }

  resolveAuthority() {
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.getofferdata.authoritySignature)
    );
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.offerLetterData.authorityName = `${signatureAuthorityDetails.firstName}
        ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else {
        this.offerLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
      }
    }
  }

  //function to get the offerletter details
  address = {} as IAddress;
  getOfferLetterDetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    this.subscription = this.http.getData(`PreonboardingOfferLetter/getbyEmpidNames/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getofferdata = data;
        this.getOfferDetailsByOfferId(parseInt(this.getofferdata.id))
        let url = this.getofferdata.documentUrl
        this.offerLetterData.offerSentDate = this.getofferdata.offerSentDate
        this.offerLetterData.offerExpiryDate = this.getofferdata.offerExpiryDate
        this.offerLetterData.note = this.getofferdata.note
        if (this.employeeaddress?.employeeAddresses?.length > 0) {
          this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() ==
          this.getofferdata.addressType.toLowerCase())
        }
        this.offerLetterData.addressLine1 = this.address.addressLine1
        this.offerLetterData.addressLine2 = this.address.addressLine2
        this.offerLetterData.city = this.address.city
        this.offerLetterData.state = this.address.state
        this.offerLetterData.country = this.address.country
        this.offerLetterData.zipCode = this.address.zipCode
        this.resolveAuthority();
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  submitRejectReason() {
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
    offerUpdateDetails.candidateComments = this.rejectForm.get('rejectReason')?.value;
    offerUpdateDetails.candidateStatus = "Offer Letter Rejected";
    this.updateOfferDetails(offerUpdateDetails);
    this.updateEmployeeDetails(this.updateempdata);
    this.loadingcircle = true;
  }

  updateOfferDetails(updatedData: Iofferletter) {
    this.subscription = this.http.postData('PreonboardingOfferLetter/UPDATE', updatedData).subscribe({
      next: (respone: any) => {
        this.rejectEmailSubmit(respone);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
    })
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  rejectEmailSubmit(Value: any) {
    let emaildata = {
      empId: this.prosempdata.employeeId,
      comments: Value.candidateComments,
    }
    this.subscription = this.http.postData(`PreonboardingEmail/EmployeeOfferRejection`, emaildata).subscribe({
      next: (data: any) => {
        this.loadingcircle = false;
        this.modalService.dismissAll();
        this.getOfferLetterDetails();
        this.confiramtionpopups.openSuccess('Offer letter rejected successfully');
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
        Employee.salary = res.compensationamount;
        Employee.variablePayAmount = res.variablePayAmount;
        //CTC calculation stated
        Employee.grossby = 12
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
        if (this.offerLetterData.pf == true || this.offerLetterData.pf == false) {
          switch (this.offerLetterData.pf) {
            case true:
              if (this.offerLetterData.esic == false) {
                if (Employee.grossSalary <= 15000) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
                else if (Employee.grossSalary >= 23195) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
                else if (Employee.grossSalary <= 23195) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
                else if (Employee.grossSalary <= 15000) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
              }
              else if (Employee.grossSalary >= 23195) {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));
                if (Employee.pfContribution >= 1800) {
                  Employee.pfContribution = 1800;
                }
              }
              else if (Employee.grossSalary <= 23195) {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                if (Employee.pfContribution >= 1800) {
                  Employee.pfContribution = 1800;
                }
              }
              else {
                if (Employee.grossSalary <= 15000) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
                else if (Employee.grossSalary <= 23195) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
                else if (Employee.grossSalary >= 23195) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                }
              }
              break;
            case false:
              Employee.pfContribution = 0;
              break;
            default:
          }
        }
        else {
          Employee.pfContribution = 0;
        }
        //=====================================================================================================================
        let condition1 = (Employee.grossSalary >= 23195)
        if (!condition1) {
          Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
          this.offerLetterData.esic = true;
        }
        else {
          Employee.esicContribution = 0
          this.offerLetterData.esic = false;
        }
        if (Employee.grossSalary < 15000) {
          Employee.professionalTax = 0
          this.offerLetterData.pt = false;
        }
        else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
          Employee.professionalTax = 150;
          this.offerLetterData.pt = true
        }
        else if (Employee.grossSalary >= 21000) {
          Employee.professionalTax = 200;
          this.offerLetterData.pt = true
        }
        else {
          Employee.professionalTax = 0;
          this.offerLetterData.pt = false
        }
        //calcution for the totalgrosssalary
        Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
        //claculation for ESIC for employee
        // case true:
        if (Employee.totalGrossSalary <= 21000) {
          Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          this.offerLetterData.esic = true;
        }
        else {
          Employee.employeeEsi = 0;
          this.offerLetterData.esic = false;
        }
        //===========================================================================================================
        // calculation for the basicsalary
        Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100))
        //calculation for the hraSalary
        Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100))
        //total deductions per month
        Employee.totalDeduction = Math.round(Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax)
        //total net salary  per month
        Employee.netSalary = Math.round(Employee.totalGrossSalary - Employee.totalDeduction);
        //calculation for the otherallowances
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * (16 / 100))
        //pfcontribution per annum
        Employee.pfPreAnuum = Math.round(Employee.pfContribution * Employee.grossby)
        //totalGrossPerAnnum calculation
        Employee.totalGrossPerAnnum = Math.round(Employee.totalGrossSalary * Employee.grossby)
        //basicsalaryperannum
        Employee.basicPerannum = Math.round(Employee.basicSalary * Employee.grossby)
        //HRA per annum
        Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
        //esiper anuum
        Employee.esiPerAnnum = Math.round(Employee.esicContribution * Employee.grossby);
        //esiper anuum for employee
        Employee.esiPerAnnumemployee = Math.round(Employee.employeeEsi * Employee.grossby);
        //otherAllowancesper annum
        Employee.otherAllowancesPerAnnum = Math.round(Employee.otherAllowances * Employee.grossby);
        //professional per annum
        Employee.professionalPerAnnum = Math.round(Employee.professionalTax * Employee.grossby);
        //salary deductions per annum
        Employee.totalDeductionsPerAnnum = Math.round(Employee.pfPreAnuum + Employee.esiPerAnnumemployee + Employee.professionalPerAnnum);
        //net salary per annum
        Employee.netSalaryPerAnnum = Math.round(Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum);
        //Ctc per annum
        Employee.ctcperannum = Math.round(Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum)
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  updateEmployeeDetails(empdata: any) {
    this.updateempdata.substatus = "Offer Letter Rejected";
    this.subscription = this.http.postData("PreonboardingEmployeedata/UPDATER", empdata).subscribe({
      next: (respone) => { },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
    })
  }

  getOfferDetailsByOfferId(offerId: number) {
    this.subscription = this.http.getData(`PreonboardingOfferLetter/getbyid/${offerId}`).subscribe({
      next: (respone) => {
        if (respone) {
          this.updatedOfferLetterDetails = respone as Iofferletter;
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
      complete: () => { }
    })
  }

  getJobDetails(Employee: any) {
    let EmployeeId = Employee.employeeId;
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobDeatils = data as IJobDetails[];
        let res = data[0];
        this.jobDeatils = res;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = res.lopcation;
        Employee.subLocation = res.subLocation;
        this.getaddress(this.jobDeatils.locationId, this.jobDeatils.subLocationId);
      }
    })
  }

  redirectToNextPage() {
    this.router.navigate(['preonboarding/education']);
  }

  navigatefirst() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  Loading: boolean = false;
  onViewClick() {
    this.Loading = true;
    setTimeout(() => {
      this.Loading = false;
    }, 1000);
  }

  onImageLoad() {
    this.Loading = false;
  }

  async acceptoffer() {
    this.loadingcircle = true;
    try {
      let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
      await this.downLoadDocument(offerUpdateDetails);
    } catch (err) {
      console.error(err);
      this.loadingcircle = false;
    }
  }

  updateOfferDetailsforAccept(updatedData: Iofferletter) {
    this.subscription = this.http.postData('PreonboardingOfferLetter/UPDATE', updatedData).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.confiramtionpopups.openSuccess('Offer letter accepted successfully');
        this.loadingcircle = false;
        this.getOfferLetterDetails();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
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
    const data = this.offerLetterData;
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');

    const isSoftCopy = true;

    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);

    const docDef = buildOfferLetterDoc({
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
      dateOfJoining: data.dateOfJoining,
      offerExpiryDate: data.offerExpiryDate,
      jobRole: data.jobRole ?? '',
      workAddress: data.address ?? '',
      amount: data.salary,
      variablePayAmount: data.variablePayAmount,
      authorityName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      note: data.note,
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
      totalDeduction: data.totalDeduction,
      totalDeductionsPerAnnum: data.totalDeductionsPerAnnum,
      netSalary: data.netSalary,
      netSalaryPerAnnum: data.netSalaryPerAnnum,
      grossSalary: data.grossSalary,
      esicContribution: data.esicContribution,
      esiPerAnnum: data.esiPerAnnum,
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeFullName: fullName,
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
    });

    const blob: Blob = await pm.createPdf(docDef).getBlob();
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_OfferLetter_Signed.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    this.generatedfile = file;
    this.offerletterUpload(this.prosempdata.employeeId, this.generatedfile, offerUpdateDetails);
  }

  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File, offerUpdateDetails: Iofferletter) {
    let filePath = `/FusionDocuments/Employee Documents/Offer Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          offerUpdateDetails.documentUrl = data.path;
          offerUpdateDetails.candidateStatus = "Offer Letter Accepted";
          this.updateOfferDetailsforAccept(offerUpdateDetails);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  async downloadoffer() {
    const data = this.offerLetterData;
    const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
    const isSoftCopy = true;

    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);
    const docDef = buildOfferLetterDoc({
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
      dateOfJoining: data.dateOfJoining,
      offerExpiryDate: data.offerExpiryDate,
      jobRole: data.jobRole ?? '',
      workAddress: data.address ?? '',
      amount: data.salary,
      variablePayAmount: data.variablePayAmount,
      authorityName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      note: data.note,
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
      totalDeduction: data.totalDeduction,
      totalDeductionsPerAnnum: data.totalDeductionsPerAnnum,
      netSalary: data.netSalary,
      netSalaryPerAnnum: data.netSalaryPerAnnum,
      grossSalary: data.grossSalary,
      esicContribution: data.esicContribution,
      esiPerAnnum: data.esiPerAnnum,
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeFullName: fullName,
      backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
    });
    const blob: Blob = await pm.createPdf(docDef).getBlob();
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_OfferLetter.pdf`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  blockNonAlphabetic(event: KeyboardEvent): void {
    const allowedChars = /[a-zA-Z\s]/;
    const inputChar = event.key;
    if (!allowedChars.test(inputChar)) {
      event.preventDefault(); // Prevents the character from being typed
    }
  }

  getaddress(locationId: number, sublocationId: number) {
    this.subscription = this.http.getData(`PreonboardingJobDetails/GetbyJobLocationSubLocationId?joblocid=${locationId}&sublocid=${sublocationId}`).subscribe({
      next: (data: any) => {
        this.offerLetterData.address = data.address;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
