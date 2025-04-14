import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IAddress, IJobDetails, Iofferletter } from '../../models/offer-letter.model';
import { of, Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import moment from 'moment';
import { DateFormatPipe } from "../../Pipes/date-format.pipe";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from '../../common-services/popup.service';
@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule, DateFormatPipe, ReactiveFormsModule],
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
  updateempdata={} as any;
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal, private fb: FormBuilder,private confiramtionpopups:PopupService) { }

  ngOnInit(): void {
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
        console.log(data);
        this.updateempdata=data
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
      rejectReason: ['', Validators.required],
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

  openAccept(){
    this.modalService.open(this.acceptpopup, { centered: true });
  }
  
  openReject(){
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
      },
    });
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
          this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == this.getofferdata.addressType.toLowerCase())
        }
        this.offerLetterData.addressLine1 = this.address.addressLine1
        this.offerLetterData.addressLine2 = this.address.addressLine2
        this.offerLetterData.city = this.address.city
        this.offerLetterData.state = this.address.state
        this.offerLetterData.country = this.address.country
        this.offerLetterData.zipCode = this.address.zipCode
        let signatureAuthorityDetails = this.authorityDetails.find(
          (c: any) => (c.employeeId == this.getofferdata.authoritySignature)
        );
        if (signatureAuthorityDetails) {
          this.authorityDesignation = signatureAuthorityDetails.designation;
          if (signatureAuthorityDetails.middleName) {
            this.offerLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
          } else
            this.offerLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
        }
        else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
          this.offerLetterData.authorityName = ''
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
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
    offerUpdateDetails.candidateComments = this.rejectionReason.comments;
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

  close() {
    const modalElement = document.getElementById('submittedreject');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
    this.router.navigate(['/login'])
  }

  closeModal(){
    this.modalService.dismissAll();
  }

  rejectEmailSubmit(Value: any) {
    let emaildata = {
      empId: this.prosempdata.employeeId,
      comments: Value.candidateComments,
    }
    this.subscription = this.http.postData(`PreonboardingEmail/EmployeeOfferRejection`, emaildata).subscribe({
      next: (data: any) => {
        console.log(data);
        this.loadingcircle = false;
      this.confiramtionpopups.openSuccess('Offer Letter Rejected Successfully');
      this.modalService.dismissAll();
      setTimeout(() => {
        this.router.navigate(['']);
      }, 300); // Adjust delay if needed
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
          this.offerLetterData.esic = true
        }
        else {
          Employee.employeeEsi = 0
          this.offerLetterData.esic = false
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
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * (10 / 100))
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
        console.log(respone);
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
        console.log(data);
        this.jobDeatils = data as IJobDetails[];
        let res = data[0];
        this.jobDeatils = res;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = res.lopcation;
        Employee.subLocation = res.subLocation;
      }
    })
  }

  okreload() {
    location.reload();
  }

  redirectToNextPage() {
    this.router.navigate(['preonboarding/education']);
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
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
    this.downLoadDocument(offerUpdateDetails);
    this.loadingcircle = true;
  }

  updateOfferDetailsforAccept(updatedData: Iofferletter) {
    this.subscription = this.http.postData('PreonboardingOfferLetter/UPDATE', updatedData).subscribe({
      next: (respone: any) => {
        console.log(respone);
        this.modalService.dismissAll();
          this.confiramtionpopups.openSuccess('Offer Letter Accepted Successfully');
          this.loadingcircle = false;
          this.getOfferLetterDetails();
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { },
    })
  }

  //download document
  async downLoadDocument(offerUpdateDetails: Iofferletter) {
    const data = this.offerLetterData;
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
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_OfferLetter_Signed.pdf`;
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.generatedfile = file;
    this.offerletterUpload(this.prosempdata.employeeId, this.generatedfile,offerUpdateDetails);
  }
  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File,offerUpdateDetails: Iofferletter) {
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
        alert('file upload  is failed');
      },
    });
  }

  downloadoffer() {
    const fileurl = this.updatedOfferLetterDetails.documentUrl;
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', fileurl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        console.log(fileName);
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