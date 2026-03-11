
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'moment';

import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IAddress, IGender, ITitle } from '../../models/personal-details.model';
import { HttpService } from '../../http-services/http.service';
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { PopupService } from '../../common-services/popup.service';
import { Iofferletter, IJobDetails } from '../../models/offer-letter.model';
import { LettersheaderComponent } from "../../../../../hrms/src/app/shared/letters-shared-content/lettersheader/lettersheader.component";
import { DateformatPipe } from '../../../../../hrms/src/app/pipes/dateformat.pipe';
@Component({
  selector: 'app-nda-contractor-letter',
  imports: [CommonModule, TranslateModule, Select, NgxCountriesDropdownModule, ReactiveFormsModule, DateformatPipe, NgbPopoverModule, DetailedStepProgressbarComponent, DateFormatPipe, LettersheaderComponent],
  templateUrl: './nda-contractor-letter.component.html',
  styleUrl: './nda-contractor-letter.component.scss'
})
export class NdaContractorLetterComponent implements OnInit, OnDestroy{
  subscription!: Subscription;
  doxImageUrl!: any;
  prosempdata = {} as any;
  offeraccepteddata = {} as any;
  getofferdata = {} as any;
  rejectionReason = {} as any;
  offerDetails = {} as any;
  prospectiveemployees = {} as any;
  offerlettergenerated = {} as any;
  updatedndaLetterDetails = {} as any
  ndaLetterData = {} as any;
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
  employeeFullname:any;
  currentDate=moment();
  panDetails={} as any;
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal, private fb: FormBuilder, private confiramtionpopups: PopupService) { }

  ngOnInit(): void {
    const storedstep = 7;
    localStorage.setItem('currentStep', storedstep.toString());
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getndaLetterDetails();
    this.getprospectivempdata();
    this.offeraccepteddata = localStorage.getItem("offeraccepteddata");
    this.ndaLetterData = this.prosempdata;
    this.getJobDetails(this.prosempdata)
    this.getCompensationDetails(this.prosempdata);
    this.getEmployeeAddress();
    this.getAuthorityDetails();
    this.initializeRejectForm();
    this.getIdentityByEmpid(this.prosempdata.employeeId);
  }
  getIdentityByEmpid(employeeId: number) {
    this.subscription = this.http.getData(`PreonboardingIdentityTable/${employeeId}`).subscribe({
      next: (data: any) => {
        this.panDetails = data.filter((item: { identityType: string; }) => item.identityType === 'PAN');
      },
      error: (err: any) => {
        console.log(err);
      }
    })
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
      rejectReason: ['', [Validators.required,Validators.pattern(/^(?!\s).*$/)]],
    });
  }

  navigateNext() {
    this.router.navigate(['/review']);
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
    this.router.navigate(['/experience-details']);
  }

  //function to get address details 
  getEmployeeAddress() {
    let EmployeeId = this.prosempdata.employeeId;
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        this.employeeFullname=`${this.employeeaddress.firstName ??''} ${this.employeeaddress.middleName ??''} ${this.employeeaddress.lastName ??''}`
        this.getndaLetterDetails();
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //get offer letter Authority list
  authorityDetails = [] as any;
  getAuthorityDetails() {
    let offertype = 'NDA Letter';
    this.subscription = this.http.getData(`Preonboardingsignaturauthority?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data;
      },
    });
  }

  //function to get the offerletter details 
  address = {} as IAddress;
  getndaLetterDetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    this.subscription = this.http.getData(`PreonboardingNdaLetter/getbyEmpidNames/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getofferdata = data.data;
        this.getOfferDetailsByOfferId(parseInt(this.getofferdata.id))
        let url = this.getofferdata.documentUrl
        this.ndaLetterData.issueddate = this.getofferdata.ndaSentDate
        this.ndaLetterData.offerExpiryDate = this.getofferdata.offerExpiryDate
        this.ndaLetterData.note = this.getofferdata.note
         this.ndaLetterData.address=this.getofferdata.address;
        if (this.employeeaddress?.employeeAddresses?.length > 0) {
          this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == this.getofferdata.addressType.toLowerCase())
        }
        this.ndaLetterData.addressLine1 = this.address.addressLine1
        this.ndaLetterData.addressLine2 = this.address.addressLine2
        this.ndaLetterData.city = this.address.city
        this.ndaLetterData.state = this.address.state
        this.ndaLetterData.country = this.address.country
        this.ndaLetterData.zipCode = this.address.zipCode
        let signatureAuthorityDetails = this.authorityDetails.find(
          (c: any) => (c.employeeId == this.getofferdata.authoritySignature)
        );
        if (signatureAuthorityDetails) {
          this.authorityDesignation = signatureAuthorityDetails.designation;
          if (signatureAuthorityDetails.middleName) {
            this.ndaLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
          } else
            this.ndaLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
        }
        else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
          this.ndaLetterData.authorityName = ''
          this.authorityDesignation = ''
        }
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
  }
  submitRejectReason() {
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedndaLetterDetails)) as any;
    offerUpdateDetails.candidateComments = this.rejectionReason.comments;
    offerUpdateDetails.candidateStatus = "NDA Letter Rejected";
    this.updateOfferDetails(offerUpdateDetails);
    this.updateEmployeeDetails(this.updateempdata);
    this.loadingcircle = true;
  }

  updateOfferDetails(updatedData: Iofferletter) {
    updatedData.comments = this.rejectForm.get('rejectReason')?.value
    this.subscription = this.http.postData('PreonboardingNdaLetter/updateLetterDetails', updatedData).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.getndaLetterDetails();
        this.confiramtionpopups.openSuccess('Non-Disclosure Agreement letter rejected successfully');
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
    this.subscription = this.http.postData(`PreonboardingNdaLetter/updateLetterDetails`, emaildata).subscribe({
      next: (data: any) => {
        this.loadingcircle = false;
        this.modalService.dismissAll();
        this.getndaLetterDetails();
        this.confiramtionpopups.openSuccess('Non-Disclosure Agreement letter rejected successfully');
        
       
        
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
        Employee.frequency=res.frequency;
        Employee.variablePayAmount = res.variablePayAmount;
        //CTC calculation stated
        Employee.grossby = 12
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
        if (this.ndaLetterData.pf == true || this.ndaLetterData.pf == false) {
          switch (this.ndaLetterData.pf) {
            case true:
              if (this.ndaLetterData.esic == false) {
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
          this.ndaLetterData.esic = true;
        }
        else {
          Employee.esicContribution = 0
          this.ndaLetterData.esic = false;
        }
        if (Employee.grossSalary < 15000) {
          Employee.professionalTax = 0
          this.ndaLetterData.pt = false;
        }
        else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
          Employee.professionalTax = 150;
          this.ndaLetterData.pt = true
        }
        else if (Employee.grossSalary >= 21000) {
          Employee.professionalTax = 200;
          this.ndaLetterData.pt = true
        }
        else {
          Employee.professionalTax = 0;
          this.ndaLetterData.pt = false
        }
        //calcution for the totalgrosssalary
        Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
        //claculation for ESIC for employee
        // case true:
        if (Employee.totalGrossSalary <= 21000) {
          Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          this.ndaLetterData.esic = true
        }
        else {
          Employee.employeeEsi = 0
          this.ndaLetterData.esic = false
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
    this.updateempdata.substatus = "NDA Letter Rejected";
    this.subscription = this.http.postData("PreonboardingEmployeedata/UPDATER", empdata).subscribe({
      next: (respone) => { },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
    })
  }

  getOfferDetailsByOfferId(offerId: number) {
    this.subscription = this.http.getData(`PreonboardingNdaLetter/getById/${offerId}`).subscribe({
      next: (respone:any) => {
        if (respone) {
          this.updatedndaLetterDetails = respone.data;
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

  acceptoffer() {
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedndaLetterDetails)) as any;
    this.downLoadDocument(offerUpdateDetails);
    this.loadingcircle = true;
  }

  updateOfferDetailsforAccept(updatedData: any) {
    this.subscription = this.http.postData('PreonboardingNdaLetter/updateLetterDetails', updatedData).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.confiramtionpopups.openSuccess('Non-Disclosure Agreement letter accepted successfully');
        this.loadingcircle = false;
        this.getndaLetterDetails();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
    })
  }

  //download document
  async downLoadDocument(offerUpdateDetails: Iofferletter) {
    const data = this.ndaLetterData;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5']; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
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
      pdf.addImage(imageData.imgData, 'PNG', 0, 0, imgWidth, imageData.imgHeight, '', 'FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData, 'PNG', 0, 0, imgWidth, lastImageData.imgHeight, '', 'FAST');
    }
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_Non-DisclosureAgreementLeter_Signed.pdf`;
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, { type: 'application/pdf' });
    this.generatedfile = file;
    this.offerletterUpload(this.prosempdata.employeeId, this.generatedfile, offerUpdateDetails);
  }
  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File, offerUpdateDetails: any) {
    let filePath = `/FusionDocuments/Employee Documents/Non-Disclosure Agreement Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          offerUpdateDetails.documentUrl = data.path;
          offerUpdateDetails.candidateStatus = "NDA Letter Accepted";
          // offerUpdateDetails.comments = this.rejectForm.get('rejectReason')?.value
          this.updateOfferDetailsforAccept(offerUpdateDetails);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  downloadoffer() {
    const fileurl = this.updatedndaLetterDetails.documentUrl;
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', fileurl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = fileurl.split('/')[fileurl.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: (reason) => console.log(reason),
    });
  }

  blockNonAlphabetic(event: KeyboardEvent): void {
    const allowedChars = /[a-zA-Z\s]/;
    const inputChar = event.key;
    if (!allowedChars.test(inputChar)) {
      event.preventDefault(); // Prevents the character from being typed
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
