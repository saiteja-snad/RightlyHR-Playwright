import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { IAddress } from '../../../Interfaces/letters-model';
@Component({
  selector: 'app-promotion-letter-acknowedgement',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, ConfirmationIconComponent],
  templateUrl: './promotion-letter-acknowedgement.component.html',
  styleUrl: './promotion-letter-acknowedgement.component.scss'
})
export class PromotionLetterAcknowedgementComponent {
  promotiondata = {} as any;
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  Status: any;
  employeeForm!: FormGroup;
  Employeeinfo = {} as any;
  subscription!: Subscription;
  employeedata = {} as any;
  employeeiddetails = [] as any;
  employeeCompensationDetails = [] as any;
  empdata = {} as any;
  isacknowledged = true;
incrementSalary: any;
previusSalary:any
  spinnerLoader = false;
  isRejecting = false;
  rejectForm!: FormGroup;
  comments!: string;
  result = {} as any;
  grossSalary = {} as any;
  promotionDate: any;
  PromotionFile!: File;
    gender: any;
  gender2: any;
  AppraisalFile!: File;
    jobErrorMessage!: string;
  @Input() letterdata: any;
currentDate = new Date();
  constructor(
    private http: HttpService,
    private router: Router,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService,
  ) { }

  ngOnInit(): void {
    this.getEmployeeId();
    // this.getdatepromotion();
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.pattern(/^(?!\s).*/)]]
    });
    // this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    // console.log('Employee Info:', this.Employeeinfo);
    // this.Onclick(this.Employeeinfo.employeeId);
  }

  Onclick(employeeId: any) {
    console.log('Employee ID:', employeeId);
    this.promotiondata = {};
    this.promotiondata = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == this.Employeeinfo.fusionEmpId
    );
    this.promotiondata.dateOfJoining = this.formatDatewithDate(
      this.promotiondata.dateOfJoining
    );
    console.log(this.letterdata)
     if (this.letterdata) {
      this.promotiondata.addressType = this.letterdata.addressType;
      this.promotiondata.docType = this.letterdata.docType;
    }
    console.log('Promotion Data:', this.promotiondata);
    // this.getEmployeeId()
    this.getdatepromotion();
    this.getJobDetails(this.promotiondata);
    // this.getCompensationById(this.promotiondata);
    this.getCompensationByIdsalery(this.promotiondata);
    this.getIssuedEmployeebyId(this.promotiondata);
    this.getEmployeeAddress(this.promotiondata.employeeId);
    this.getAuthorityDetails();
     if (this.promotiondata.gender == 'Male') {
      return (this.gender = 'Mr.');
    } else {
      return (this.gender = 'Ms.');
    }
  
    //  this.onclickDesignation();
  }
   //function to get the address
    address = {} as IAddress;
    employeeaddress = [] as any;
    getEmployeeAddress(Value: any) {
      const EmployeeId = Value;
      this.subscription = this.http
        .getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.employeeaddress = data as IAddress[];
            console.log(this.promotiondata.addressType,this.employeeaddress?.employeeAddresses)
            if (this.employeeaddress?.employeeAddresses?.length > 0) {
              this.address = this.employeeaddress.employeeAddresses.find(
                (address: IAddress) =>
                  address.type.toLowerCase() ==
                  this.promotiondata.addressType.toLowerCase()
              );
              this.promotiondata.addressLine1 = this.address.addressLine1;
              this.promotiondata.addressLine2 = this.address.addressLine2;
              this.promotiondata.city = this.address.city;
              this.promotiondata.state = this.address.state;
              this.promotiondata.country = this.address.country;
              this.promotiondata.zipCode = this.address.zipCode;
            }
  
          },
        });
    }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  //get employee ids for dropdown
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data;
          this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUserData") || '{}');
          console.log('Employee Info:', this.Employeeinfo);
          this.Onclick(this.Employeeinfo.employeeId);
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }

  //function for issed by
  getIssuedEmployeebyId(Employee: any) {
    this.employeedata = Employee.firstName + " " + Employee.lastName
    console.log(this.employeedata);
  }

  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Salary Revision Letter'
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetails = data;
        console.log('Authority Details:', this.authorityDetails);
          if (this.letterdata.authoritySignature) {
          if (this.authorityDetails?.length > 0) {
            const signatureAuthorityDetails = this.authorityDetails.find(
              (c: any) => (c.employeeId == this.letterdata.authoritySignature)
            );
            console.log(signatureAuthorityDetails)
            this.authorityDesignation = signatureAuthorityDetails.designation;
            this.promotiondata.authorityName = `${signatureAuthorityDetails.firstName ?? ''} ${signatureAuthorityDetails.middleName ?? ''} ${signatureAuthorityDetails.lastName ?? ''}`;
          }
        }
      }
    })
  }
  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
  }
  //get jobdetails
  getjobrole:any;
  getJobDetails(Employee: any) {
    //let EmployeeId = parseInt(this.promotiondata.employeeId)
    //console.log(EmployeeId);

    this.subscription = this.http.getData(`JobDetails/Empname/${this.Employeeinfo.employeeId}`).subscribe({
      next: (data: any) => {
        console.log('Job Details:', data);
        ///let jobdetails = data.reverse();
        Employee.jobRole = data.reverse()[0].jobRole;
        this.getjobrole = Employee.jobRole;
        console.log('Job Role:', Employee.jobRole);
      }
    })
  }
     docType :any;
  //get date promotion
  getdatepromotion() {
   
   const letterType = 'Salary Revision Letter';
    //let EmployeeId = parseInt(this.promotiondata.employeeId)
    //console.log(EmployeeId);

    this.subscription = this.http.getData(`AppraisalLetter/getgeneratedappraisalpromotionletter?employeeId=${this.Employeeinfo.employeeId}&letterType=${encodeURIComponent(letterType)}`).subscribe({
      next: (data: any) => {
        console.log('date Details:', data);
        ///let jobdetails = data.reverse();
        this.promotionDate = data.issuedDate;
        this.docType = data.docType;

        console.log('Issued Date:', this.promotionDate);
      }
    })

  }
  //get compensation details by empid
  //get compensation details by empid
  getCompensationByIdsalery(Employee: any) {
    this.subscription = this.http
      .getData(`Compensationdata/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          if(!data || data.length == 0){
            this.jobErrorMessage = 'No Compensation details found for this employee.';
            this.employeeForm.get('jobValid')?.setValue(false);
          }else{
            let res = data[0];
            if (data.length > 1) {
              this.previusSalary = data[1];
              this.incrementSalary = res.compensationamount - this.previusSalary.compensationamount;
            } else {
              this.previusSalary = { compensationamount: 0 };
              this.incrementSalary = 0;
            }
            this.employeeCompensationDetails = res;
            this.promotiondata.salary = res.compensationamount;
            this.promotiondata.compeffectivedate = res.compeffectivedate;
            //CTC calculation stated
            Employee.grossby = 12;
            Employee.grossSalary = Math.round(
              res.compensationamount / Employee.grossby
            );
            this.grossSalary = Employee.grossSalary;
            if (this.promotiondata.pf == true || this.promotiondata.pf == false) {
              switch (this.promotiondata.pf) {
                case true:
                  if (this.promotiondata.esic == false) {
                    Employee.pfContribution = Math.round(Employee.grossSalary * (6.719 / 100));
                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                  } else if (Employee.grossSalary >= 23195) {
                    Employee.pfContribution = Math.round(Employee.grossSalary * (6.717 / 100));
                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                  }
                  else if (Employee.grossSalary <= 23195) {
                    Employee.pfContribution = Math.round(
                      Employee.grossSalary * (6.519 / 100)
                    );
                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                  } else {
                    Employee.pfContribution = Math.round(
                      Employee.grossSalary * (6.719 / 100)
                    );
                  }
                  break;
                case false:
                  Employee.pfContribution = 0;
                  break;
                default:
              }
            } else {
              0;
            }
          
            if (this.promotiondata.esic == true) {
              let condition1 = Employee.grossSalary >= 23195;
              if (!condition1) {
                Employee.esicContribution = Math.round(
                  Employee.grossSalary * (2.94 / 100)
                );
              } else {
                Employee.esicContribution = 0;
                this.promotiondata.esic == false;
              }
            } else {
              Employee.esicContribution = 0;
              this.promotiondata.esic == false;
            }
            
            //=============================================================================================================
            //calcution for the totalgrosssalary
            Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution);
            
            if (this.promotiondata == true) {
              if (Employee.totalGrossSalary <= 21000) {
                Employee.employeeEsi = Math.round(
                  Employee.totalGrossSalary * (0.75 / 100)
                );
              } else {
                Employee.employeeEsi = 0;
                this.promotiondata.esic == false;
              }
            } else {
              Employee.employeeEsi = 0;
              this.promotiondata.esic == false;
            }
  
            if (Employee.grossSalary < 15000) {
              Employee.professionalTax = 0;
            } else if (
              Employee.grossSalary > 15000 &&
              Employee.grossSalary < 21000
            ) {
              Employee.professionalTax = 150;
            } else if (Employee.grossSalary >= 21000) {
              Employee.professionalTax = 200;
            } else {
              Employee.professionalTax = 0;
            }
  
            // calculation for the basicsalary
            Employee.basicSalary = Math.round(
              Employee.totalGrossSalary * (60 / 100)
            );
  
            //calculation for the hraSalary
            Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
  
            //calculation for the educationAllowances taking as medical insurenc per month
            // Employee.educationAllowances = Math.round(Employee.totalGrossSalary * (2 / 100))
            Employee.educationAllowances = 0;
  
            //calculation for the conveyance
            // Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100))
  
            //total deductions per month
            Employee.totalDeduction = Math.round(
              Employee.pfContribution +
                Employee.employeeEsi +
                Employee.professionalTax +
                Employee.educationAllowances
            );
  
            //total net salary  per month
            Employee.netSalary = Math.round(
              Employee.totalGrossSalary - Employee.totalDeduction
            );
  
            //calculation for the otherallowances
            Employee.otherAllowances = Math.round(
              Employee.totalGrossSalary * (16 / 100)
            );
  
            //pfcontribution per annum
            Employee.pfPreAnuum = Math.round(
              Employee.pfContribution * Employee.grossby
            );
  
            //totalGrossPerAnnum calculation
            Employee.totalGrossPerAnnum = Math.round(
              Employee.totalGrossSalary * Employee.grossby
            );
  
            //basicsalaryperannum
            Employee.basicPerannum = Math.round(
              Employee.basicSalary * Employee.grossby
            );
  
            //HRA per annum
            Employee.hraPerAnnum = Math.round(
              Employee.hraSalary * Employee.grossby
            );
  
            //esiper anuum
            Employee.esiPerAnnum = Math.round(
              Employee.esicContribution * Employee.grossby
            );

            //esiper anuum for employee
            Employee.esiPerAnnumemployee = Math.round(
              Employee.employeeEsi * Employee.grossby
            );
  
            //educationper annum using for medical insurence
           // Employee.educationallowancesPerAnnum = 12 * 558;

            //conveyance per annum
            // Employee.conveyancePerAnnum = Math.round(Employee.Conveyance * Employee.grossby);
  
            //otherAllowancesper annum
            Employee.otherAllowancesPerAnnum = Math.round(
              Employee.otherAllowances * Employee.grossby
            );
  
            //professional per annum
            Employee.professionalPerAnnum = Math.round(
              Employee.professionalTax * Employee.grossby
            );
  
            //salary deductions per annum
            Employee.totalDeductionsPerAnnum = Math.round(
              Employee.pfPreAnuum + Employee.esiPerAnnumemployee + 
              //Employee.educationallowancesPerAnnum + 
              Employee.professionalPerAnnum
            );
  
            //net salary per annum
            Employee.netSalaryPerAnnum = Math.round(
              Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum
            );

            //Ctc per annum
            Employee.ctcperannum = Math.round(
              Employee.totalGrossPerAnnum + Employee.pfPreAnuum + 
              Employee.esiPerAnnum
            );
            this.jobErrorMessage = '';
            this.employeeForm.get('jobValid')?.setValue(true);
          }
          }
      });
  }
  // else if(signatureAuthorityDetails==undefined||signatureAuthorityDetails==null){
  //   this.promotiondata.authorityName =''
  //   this.authorityDesignation=''
  // }
  // }

  private formatDatewithDate(date: Date): string | void {
    if (date) {

      return moment(date).format('YYYY-MM-DD');
    }

  }

  // async postPromotionLetterFormSubmit() {
  //     const data = await this.promotiondata;
  //     console.log('data',data);
  //     this.isLoading = true;
  //     // data.dateofAppraisal = this.formatDate(data.dateofAppraisal);
  //     // data.compeffectivedate = this.formatDate(data.compeffectivedate);
  //     console.log(data);

  //     const pdfContent = document.getElementById('pdfContent');
  //     if (pdfContent) {
  //       html2canvas(pdfContent, { scale: 3 }).then(canvas => {
  //         const imgData = canvas.toDataURL('image/png');
  //         const pdf = new jsPDF('p', 'mm', 'a4');
  //         const imgWidth = pdf.internal.pageSize.getWidth();
  //         console.log(imgWidth);
  //         const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //         console.log(imgHeight)
  //         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
  //         const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_Promotion_Letter.pdf`;
  //         pdf.save(fileName);
  //         const blob = pdf.output('blob');
  //         console.log(blob);
  //         //creating form file to upload into AZure
  //         let d: Date = new Date()
  //         this.PromotionFile = new File(
  //           [blob],
  //           fileName,
  //           {
  //             type: 'application/pdf',
  //           }
  //         );
  //           this.uploadPromotionLetter();

  //       });
  //     }
  //   }
  // async postPromotionLetterFormSubmit() {

  //   this.spinnerLoader = true;
  //   // if (this.employeeForm.invalid) {
  //   //   this.employeeForm.markAllAsTouched();
  //   //   this.spinnerLoader = false;
  //   //   return;
  //   // }
    
  //   const data = await this.promotiondata;
  //   // data.dateofAppraisal = this.formatDate(data.dateofpromotion);
  //   // data.compeffectivedate = this.formatDate(data.compeffectivedate);
  //    const pdfContents = [
  //     'pdfContent1',
  //     'pdfContent2'
  //   ];
    
  //    for (const contentId of pdfContents) {
  //   const pdfContent = document.getElementById(contentId);
  //   if (pdfContent) {
  //     html2canvas(pdfContent, { scale: 3 }).then(canvas => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //       const imgWidth = pdf.internal.pageSize.getWidth();
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
  //       const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_SalaryRevisionLetter_Signed_Document.pdf`;
  //       pdf.save(fileName);
  //       const blob = pdf.output('blob');
  //       this.PromotionFile = new File([blob], fileName, { type: 'application/pdf' });
  //       //creating form file to upload into AZure
  //       let d: Date = new Date()
  //       this.PromotionFile = new File(
  //         [blob],
  //         fileName,
  //         {
  //           type: 'application/pdf',
  //         }
  //       );
  //       this.uploadPromotionLetter();
  //       // this.documentGenerated = true;
  //       // this.spinnerLoader = false;
  //       // this.conformationPopup.openSuccessModal("Promotion letter generated successfully");
  //       // Do NOT call uploadPromotionLetter() here!
  //     });
  //   }
  // }
  // }

  async postPromotionLetterFormSubmit() {
    this.spinnerLoader= true;
    const data = await this.promotiondata;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();
    // const pdfContent = document.getElementById('pdfContent');
    const pdfContent = ['pdfContent1', 'pdfContent2'];
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContent.length * imgHeight;
    const imagesData = [];
    // this.isLoading = true;
    for (const contentId of pdfContent) {
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
      pdf.addImage(imageData.imgData,'PNG',0,0,imgWidth,imageData.imgHeight,'','FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData,'PNG',0,0,imgWidth,lastImageData.imgHeight,'','FAST');
    }
    const fileName = `${data.firstName}_${
      data.lastName
    }_${new Date().getTime()}_SalaryRevisionLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    this.PromotionFile = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.uploadPromotionLetter();
  }
  //to format string date to actual date
  private formatDatebyDatestring(data: string) {
    let stringarray = data.split('/');
    console.log(
      new Date(
        `${parseInt(stringarray[2])}-${parseInt(stringarray[1])}-${parseInt(
          stringarray[0]
        )}`
      )
    );
    return new Date(
      `${parseInt(stringarray[2])}-${parseInt(stringarray[1])}-${parseInt(stringarray[0])
      }`
    );
  }

  uploadPromotionLetter() {
  //  const [day, month, year] = this.promotiondata.compeffectivedate.split('/');
  //   const compeffectivedate = new Date(`${year}-${month}-${day}`).toISOString();
    let filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.Employeeinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.PromotionFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.spinnerLoader = false;
            this.result.documentUrl = data.path;
            console.log(data);
          }
          let loggedInUser = this.authService.getToken();
          console.log(loggedInUser);
          // let emaildetails = {
          //   personEmail: this.promotiondata.workEmail,
          //   senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
          //   senderEmail: loggedInUser.workEmail,
          //   firstName: this.promotiondata.firstName,
          //   lastName: this.promotiondata.lastName,
          //   middleName: this.promotiondata.middleName,
          //   jobRole: this.promotiondata.jobRole,
          //   documentUrl: this.result.documentUrl,
          //   compeffectivedate: this.promotiondata.compeffectivedate,
          //   employeeId: this.promotiondata.employeeId,
          //   compensationamount: this.promotiondata.salary
          // }
          // if (loggedInUser.middleName) {
          //   emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
          // } else {
          //   emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
          // }
          // console.log(emaildetails);
          // this.subscription = this.http.postdata(`CustomEmail/Appraisalletter`, emaildetails).subscribe({
          //   next: (data: any) => {
          //     console.log(data);
          //     this.conformationPopup.openSuccessModal("Email Sent Successfully")
          //     this.router.navigate(['/employee-management/active-employees']);
          //   },
          //   error: (err: any) => {
          //     console.log(err);
          //   },
          //   complete: () => {
          //     this.spinnerLoader = false;
          //   }
          // })
           this.postPromotionlettersDetails(this.result.documentUrl);
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('file upload  is failed');
        },
      });
  }

  //to post Appraisal Letter Details
  postPromotionDetails(docurl: string) {
    let loggedInUser = this.authService.getToken();
    let postPromotionDetails = {
      empid: this.result.employeeId,
      promotionSentDate: this.formatDatebyDatestring(
        this.promotiondata.dateofPromotion
      ),
      promotionSentStatus: 'Promotion Generated',
      appraisalSentBy: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      documentUrl: docurl,
    };

  }
  postPromotionlettersDetails(filePath: string) {
    //this.isRejecting = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.Employeeinfo.employeeId,
      signedDocUrl: filePath,
      status: 'Released',
      // addressType: "string",
      authoritySignature: this.letterdata.authoritySignature,
      note: "",
      issuedDate:  this.letterdata.issuedDate,
      rejectedComments: this.rejectForm.get('comments')?.value || '',
      candidateStatus: 'Acknowledged',
      generatedBy: this.letterdata.generatedBy,
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          this.isRejecting = false;
          console.log(data);
          this.isacknowledged = true;
          this.isRejecting = false;
          this.modalService.dismissAll();
          this.http.triggerRefresh();
          this.conformationPopup.openSuccessModal('Salary Revision Letter Accepted Successfully');
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
        }
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
      // addressType: "string",
      authoritySignature: this.letterdata.authorityName,
      note: "",
      issuedDate:  this.letterdata.issuedDate,
      rejectedComments: this.rejectForm.get('comments')?.value || '',
      candidateStatus: 'Rejected',
      generatedBy: this.Employeeinfo.employeeId,
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          this.isRejecting = false;
          console.log(data);
          this.isacknowledged = true;
          this.isRejecting = false;
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

        }
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
