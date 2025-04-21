import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { IAddress, IJobDetails, Iofferletter } from '../../models/offer-letter.model';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../http-services/http.service';
import { Router } from '@angular/router';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../../../../hrms/src/app/Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { PopupService } from '../../common-services/popup.service';
@Component({
  selector: 'app-trainee-offerletter',
  imports: [DateformatPipe, ReactiveFormsModule, CommonModule],
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

  acceptoffer() {
    const offeraccept = "Offer Letter Accepted";
    let offerUpdateDetails = JSON.parse(JSON.stringify(this.updatedOfferLetterDetails)) as Iofferletter;
    offerUpdateDetails.candidateStatus = "Offer Letter Accepted";
    this.updateOfferDetailsforAccept(offerUpdateDetails);
    this.downLoadDocument();
    this.loadingcircle = true;
  }

  updateOfferDetailsforAccept(updatedData: Iofferletter) {
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
        this.traineeEmpData.salary = Employee.salary = res.compensationamount;
        //CTC calculation stated
        Employee.grossby = 12;
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby);
        //this.grossSalary = Employee.grossSalary
        if (this.traineeEmpData.pf == true || this.traineeEmpData.pf == false) {
          switch (this.traineeEmpData.pf) {
            case true:
              if (this.traineeEmpData.esic == false) {
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
        let condition1 = (Employee.grossSalary >= 23195)
        if (!condition1) {
          Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
          this.traineeEmpData.esic = true;
        }
        else {
          Employee.esicContribution = 0;
          this.traineeEmpData.esic = false;
        }
        if (Employee.grossSalary < 15000) {
          Employee.professionalTax = 0;
          this.traineeEmpData.pt = false;
        }
        else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
          Employee.professionalTax = 150;
          this.traineeEmpData.pt = true;
        }
        else if (Employee.grossSalary >= 21000) {
          Employee.professionalTax = 200;
          this.traineeEmpData.pt = true;
        }
        else {
          Employee.professionalTax = 0;
          this.traineeEmpData.pt = false;
        }
        //calcution for the totalgrosssalary
        Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
        if (Employee.totalGrossSalary <= 21000) {
          Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          this.traineeEmpData.esic = true;
        }
        else {
          Employee.employeeEsi = 0;
          this.traineeEmpData.esic = false;
        }
        //===========================================================================================================
        // calculation for the basicsalary
        Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100));
        //calculation for the hraSalary
        Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
        //calculation for the educationAllowances
        Employee.educationAllowances = Math.round(Employee.totalGrossSalary * (2 / 100));
        //calculation for the conveyance
        Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100));
        //total deductions per month
        Employee.totalDeduction = Math.round(Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax);
        //total net salary  per month
        Employee.netSalary = Math.round(Employee.totalGrossSalary - Employee.totalDeduction);
        //calculation for the otherallowances
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * (10 / 100));
        //pfcontribution per annum
        Employee.pfPreAnuum = Math.round(Employee.pfContribution * Employee.grossby);
        //totalGrossPerAnnum calculation
        Employee.totalGrossPerAnnum = Math.round(Employee.totalGrossSalary * Employee.grossby);
        //basicsalaryperannum
        Employee.basicPerannum = Math.round(Employee.basicSalary * Employee.grossby);
        //HRA per annum
        Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
        //esiper anuum
        Employee.esiPerAnnum = Math.round(Employee.esicContribution * Employee.grossby);
        //esiper anuum for employee
        Employee.esiPerAnnumemployee = Math.round(Employee.employeeEsi * Employee.grossby);
        //educationper annum
        Employee.educationallowancesPerAnnum = Math.round(Employee.educationAllowances * Employee.grossby)
        //conveyance per annum
        Employee.conveyancePerAnnum = Math.round(Employee.Conveyance * Employee.grossby);
        //otherAllowancesper annum
        Employee.otherAllowancesPerAnnum = Math.round(Employee.otherAllowances * Employee.grossby);
        //professional per annum
        Employee.professionalPerAnnum = Math.round(Employee.professionalTax * Employee.grossby);
        //salary deductions per annum
        Employee.totalDeductionsPerAnnum = Math.round(Employee.pfPreAnuum + Employee.esiPerAnnumemployee + Employee.professionalPerAnnum);
        //net salary per annum
        Employee.netSalaryPerAnnum = Math.round(Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum);
        //Ctc per annum
        Employee.ctcperannum = Math.round(Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum);
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
    this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/getbyEmpidNames/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getofferdata = data
        this.getOfferDetailsByOfferId(parseInt(this.getofferdata.id))
        let url = this.getofferdata.documentUrl
        this.traineeEmpData.offerSentDate = this.getofferdata.offerSentDate
        this.traineeEmpData.offerExpiryDate = this.getofferdata.offerExpiryDate
        this.traineeEmpData.note = this.getofferdata.note
        if (this.employeeaddress.employeeAddresses.length > 0) {
          this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == this.getofferdata.addressType.toLowerCase())
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
            this.traineeEmpData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
          } else
            this.traineeEmpData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
        }
        else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
          this.traineeEmpData.authorityName = ''
          this.authorityDesignation = ''
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  getOfferDetailsByOfferId(offerId: number) {
    this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/getbyid/${offerId}`).subscribe({
      next: (respone) => {
        if (respone) {
          this.updatedOfferLetterDetails = respone as Iofferletter
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

  //download document
  async downLoadDocument() {
    const data = this.traineeEmpData;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    const pdfContents = ['pdfContent1,pdfContent2']; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    // this.isLoading = true;
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
    const fileName = `${data.firstName}_${data.middleName ?? ''}_${data.lastName ?? ''}_${new Date().getTime()}_TraineeOfferLetter_Signed.pdf`;
    //pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    let d: Date = new Date();
    const file = new File([blob], fileName, {
      type: 'application/pdf',
    });
    // this.uploadAddressLetter();
    this.generatedfile = file;
    this.offerletterUpload(this.prosempdata.employeeId, this.generatedfile);
    // });
    // }
  }

  //to store file to the azure and return to the url
  private offerletterUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Trainee Offer Letter/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          localStorage.setItem('offerletterurl', data.path);
          this.openPopup.openSuccess("Accepted Successfully");
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
    const fileurl = localStorage.getItem('offerletterurl') || '';
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
        this.openPopup.openSuccess("Email Sent Successfully");
        location.reload();
      },
      error: (err: any) => {
        console.log(err);
        this.openPopup.openError("Email Sent Failed");
      }
    })
  }

  blockNonAlphabetic(event: KeyboardEvent): void {
    const allowedChars = /[a-zA-Z\s]/;
    const inputChar = event.key;
    if (!allowedChars.test(inputChar)) {
      event.preventDefault(); // Prevents the character from being typed
    }
  }

  close() {
    this.openPopup.openSuccess("Accepted Successfully")
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