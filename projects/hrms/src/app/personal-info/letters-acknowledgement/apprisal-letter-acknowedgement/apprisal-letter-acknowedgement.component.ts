import { Component, ViewEncapsulation ,OnDestroy, OnInit, ViewChild, Input, } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-apprisal-letter-acknowedgement',
 imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, LettersheaderComponent, ConfirmationIconComponent],
  templateUrl: './apprisal-letter-acknowedgement.component.html',
  styleUrl: './apprisal-letter-acknowedgement.component.scss'
})
export class ApprisalLetterAcknowedgementComponent {
isacknowledged = true;
isLoading = false;
employeeForm!: FormGroup;
appraisalData = {} as any;
empdata = {} as any;
employeeName:any;
fusionEmpId: any;
employeeiddetails = [] as any;
subscription!: Subscription;
employeeCompensationDetails = [] as any;
grossSalary = {} as any;
employeeJobDetails = {} as any; 
AppointmentFile: File | undefined;
promotion: boolean = false;
nopromotion: boolean = true;
comments!: string;
Status!: string;
 spinnerLoader = false;
@ViewChild('successhide') private readonly successhide!: NgbModal;
@ViewChild('errorhide') private readonly errorhide!: NgbModal;
@Input() letterdata: any;
authorityDetails = [] as any;
authorityDesignation: any;
AppraisalFile!: File;
  previusSalary: any;
  incrementSalary: any;
result = {} as any;
  rejectForm!: FormGroup;
isLoadingreject = false;
  gender: any;
  gender2: any;
  jobErrorMessage: string = '';
  latestjobRole: any;
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private confirmationPopup: OpenModalService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,private fb: FormBuilder,
    public formsValidation: FormValidationsService,
    
  ) {  }


ngOnInit(): void {
  this.empdata = JSON.parse(localStorage.getItem('rightlyHrUserData') || '{}');
  this.employeeName=`${this.empdata.firstName ??''} ${this.empdata.middleName ??''} ${this.empdata.lastName??''}`;
  this.appraisalData = this.empdata;
  this.getEmployeeId();
   this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.pattern(/^(?!\s).*/)]]
    });
  
}
 clearRejectForm() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }
Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    this.appraisalData = this.employeeiddetails.find(
      (c: any) => c.employeeId == fusionemployeeId
    );
    console.log(this.appraisalData)
    this.getCompensationById(this.appraisalData)
     this.getJobdetails(this.appraisalData)
    this.getJobdetailsapprisal(this.appraisalData)
    this.getAppraisaldetails(this.appraisalData)
}

  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IemployeeDetails[];
          this.Onclick(this.empdata.employeeId);
          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }

      getJobdetails(Employee: any) {
      this.subscription = this.http
        .getData(`JobDetails/Empname/${Employee.employeeId}`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            let res = data;
            this.employeeJobDetails = res[0];
            this.latestjobRole = this.employeeJobDetails.jobRole;

            Employee.workLocation = res.lopcation;
  
            console.log(Employee.jobRole);
          },
          error: (reason: any) => {
            console.log(reason);
          },
        });
    }
  //get Job Details by empployeeid
  getJobdetailsapprisal(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        if (!data || data.length === 0) {
          this.jobErrorMessage = 'No job details found for this employee.';
           this.employeeForm.get('jobValid')?.setValue(false);
        } else {
          let res = data.reverse()[0];
          this.employeeJobDetails = res;
          Employee.jobRole = res.jobRole;
          Employee.workLocation = res.lopcation;
          this.jobErrorMessage = '';
          this.employeeForm.get('jobValid')?.setValue(true);
        }
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

getAppraisaldetails(Employee: any) {
  const employeeId = Employee.employeeId;
  const letterType = 'Appraisal Letter';

  this.subscription = this.http
    .getData(`AppraisalLetter/getgeneratedappraisalpromotionletter?employeeId=${employeeId}&letterType=${encodeURIComponent(letterType)}`)
    .subscribe({
      next: (data: any) => {
        console.log('Appraisal Letter:', data);
        this.appraisalData.Documenttype = data.docType;
        this.appraisalData.dateofAppraisal = data.issuedDate;
         this.appraisalData.note = data.note;

        const authorityId = data.authoritySignature;

        // Now get all authority signatures and find the matching one
        this.getAuthorityDetails(authorityId);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
}
  

  isEditing: boolean = false;
  gradeIdValue: any;
  getGradename: any;
  islistedItem: boolean = true;
 isItemIntheList(event: Event) {
    const target = event.target as HTMLInputElement;
    const isitem = target.checked ?? false; // or target.value === 'true'
    this.islistedItem = isitem;
    if (!isitem) {
      this.gradeIdValue = {};
      this.getGradename = '';
      this.promotion = false;
      this.nopromotion = true;
    } else {
      this.promotion = true;
      this.nopromotion = false;
    }
  }
  
getAuthorityDetails(authorityId: number) {
  const letterType = 'Appraisal Letter';

  this.subscription = this.http
    .getData(`SignaturesList?LetterType=${encodeURIComponent(letterType)}`)
    .subscribe({
      next: (data: any) => {
        console.log('All Authority Details:', data);
        this.authorityDetails = data;

        // Find the matching authority by employeeId
        const matchedAuthority = data.find((auth: any) => auth.employeeId === authorityId);

        if (matchedAuthority) {
          console.log('Matched Authority:', matchedAuthority);

          // Assign designation
          this.authorityDesignation = matchedAuthority.designation;

          // Construct full authority name
          if (matchedAuthority.middleName) {
            this.appraisalData.authorityName = `${matchedAuthority.firstName} ${matchedAuthority.middleName} ${matchedAuthority.lastName}`;
          } else {
            this.appraisalData.authorityName = `${matchedAuthority.firstName} ${matchedAuthority.lastName}`;
          }
        } else {
          // No match found, clear values
          console.warn(`Authority with employeeId ${authorityId} not found.`);
          this.appraisalData.authorityName = '';
          this.authorityDesignation = '';
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch authority list:', err);
        this.appraisalData.authorityName = '';
        this.authorityDesignation = '';
      }
    });
}


    getCompensationById(Employee: any) {
    // let EmployeeId = this.appraisalData.employeeId
    this.subscription = this.http.getData(`Compensationdata/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        // console.log(data);
        let res = data[0];
        console.log(data);

        // let sortedresponse = data.sort((a: any, b: any) => {
        //   // if (this.getTime(a.compeffectivedate) < this.getTime(b.compeffectivedate)) {
        //   //   return -1;
        //   // }
        //   // if (this.getTime(a.compeffectivedate) > this.getTime(a.compeffectivedate)) {
        //   //   return 1;
        //   // }

        //   // names must be equal
        //   // return a.compeffectivedate-b.compeffectivedate
        //   return a.compeffectivedate.localeCompare(b.compeffectivedate);

        // })
        // console.log(sortedresponse);
        this.employeeCompensationDetails = res;
        this.appraisalData.salary = res.compensationamount
        this.appraisalData.compeffectivedate = res.compeffectivedate
        console.log(this.appraisalData);
        this.appraisalData.variablePayAmount = res.variablePayAmount ? res.variablePayAmount : null;
          this.appraisalData.isVariablePay = res.isVariablePay ? res.isVariablePay : false;
          // this.employeeForm.patchValue({
          //   isVariablePay: res.isVariablePay ? res.isVariablePay : false,
          //   variablePayAmount: res.variablePayAmount ? res.variablePayAmount : null,
          //   reviewdate: this.formatDate(res.nextCompReviewDate),
            
          // });
        //CTC calculation stated
        Employee.grossby = 12
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
        this.grossSalary = Employee.grossSalary
        console.log(this.grossSalary);
       
        console.log(Employee.grossby);
        console.log(Employee.grossSalary);
        console.log(this.appraisalData);

        console.log(this.appraisalData.pf);
        if (this.appraisalData.pf == true || this.appraisalData.pf == false) {
          switch (this.appraisalData.pf) {

            case true:
              // if (Employee.grossSalary <= 15000) {

              //   Employee.pfContribution = Math.round((Employee.grossSalary * (Employee.grossby / 100)));
              //   if(Employee.pfContribution >= 1800)
              //   {
              //     Employee.pfContribution = 1800;

              //   }
              //   console.log(Employee.pfContribution);
              // }
                   if(this.appraisalData.esic==false){
                      Employee.pfContribution = Math.round((Employee.grossSalary * (6.719/ 100)));

                      if (Employee.pfContribution >= 1800) {
                        Employee.pfContribution = 1800;
                      }
                      console.log(Employee.pfContribution);
                    }
                   else  if (Employee.grossSalary >= 23195) {

                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));

                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);

                }
              // else if (Employee.grossSalary <= 1800) {

              //   Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
              //   if(Employee.pfContribution >= 1800)
              //   {
              //     Employee.pfContribution = 1800;

              //   }
              //   console.log(Employee.pfContribution);
              // }
              else if (Employee.grossSalary <= 23195) {

                Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                if(Employee.pfContribution >= 1800)
                {
                  Employee.pfContribution = 1800;

                }
                console.log(Employee.pfContribution);
              }
              else {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.719/100)));
                console.log(Employee.pfContribution);

              }
              break;
            case false:
              Employee.pfContribution = 0;
              break;
            default:
          }
        }
        else {
          0
          console.log(this.appraisalData.pf);

        }


 //claculation for ESIC employer

        // if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
        //   console.log(this.appraisalData.esic);

        //   switch (this.appraisalData.esic) {

        //     case true:
                     if(this.appraisalData.esic==true){
                      let condition1=(Employee.grossSalary >= 23195)
                      if (!condition1) {
                        Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
                        console.log(Employee.esicContribution);
                      }
                      else{
                        Employee.esicContribution=0
                        this.appraisalData.esic==false
                        console.log(Employee.esicContribution);
        
                      }
                        }
                        else{
                          Employee.esicContribution=0
                          this.appraisalData.esic==false
                          console.log(Employee.esicContribution);
                        }
             

          //     break;
          //     case false:

          //     let condition2=(Employee.grossSalary >= 23195)
          //     if (!condition2) {
          //       // Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
          //       // console.log(Employee.esicContribution);
          //       Employee.esicContribution = 0
          //         console.log(Employee.esicContribution);
          //     }
          //     else{
          //       Employee.esicContribution=0
          //       console.log(Employee.esicContribution);

          //     }
          //     break;
          //   default:
          // }

        // }
        // else {
        //   Employee.esicContribution = 0
        //   console.log(Employee.esicContribution);

        // }

        //=============================================================================================================
           //calcution for the totalgrosssalary
           Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
           console.log(Employee.totalGrossSalary);
       //====================================================================================================================
           //condtitions for professionaltax calulation.
        if (Employee.totalGrossSalary <= 15000) {
          Employee.professionalTax = 0
          console.log(Employee.professionalTax);

        }
        else if (Employee.totalGrossSalary >= 15001 && Employee.totalGrossSalary <= 20000) {
          Employee.professionalTax = 150;
          console.log(Employee.professionalTax);

        }
        else if (Employee.totalGrossSalary >= 20001) {
          Employee.professionalTax = 200;
          console.log(Employee.professionalTax);

        }
        else {
          Employee.professionalTax = 0;
          console.log(Employee.professionalTax);

        }    
  //claculation for ESIC for employee

  // if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
  //   console.log(this.appraisalData.esic);

  //   switch (this.appraisalData.esic) {

  //     case true:
  if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
    console.log(this.appraisalData.esic);
    switch (this.appraisalData.esic) {
      case true:
        if (Employee.totalGrossSalary <= 21000) {
          Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          console.log(Employee.employeeEsi);
        }
        else {
          Employee.employeeEsi = 0
          this.appraisalData.esic == false
        }
        break;
      case false:
        if (Employee.totalGrossSalary >= 23195) {
          Employee.employeeEsi = 0;
          this.appraisalData.esic == false
        }
        else if (Employee.totalGrossSalary <= 21000) {
          // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          // console.log(Employee.employeeEsi);
          Employee.employeeEsi = 0
          this.appraisalData.esic == false
            console.log(Employee.employeeEsi);
        }
        else {
          Employee.employeeEsi = Math.round(Employee.totalGrossSalary * 2.94) / 100;
        }
        break;
      default:
    }

  }
  else {
    Employee.employeeEsi = 0
    console.log(Employee.employeeEsi);
  }
      
  //       break;
  //       case false:
  //         if (Employee.totalGrossSalary >= 23195) {
  //           Employee.employeeEsi= 0;
  //         }
  //         else if(Employee.totalGrossSalary <= 21000){
  //           // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
  //           // console.log(Employee.employeeEsi);
  //           Employee.employeeEsi = 0
  //                 console.log(Employee.employeeEsi);
  //         }
  //          else {
  //           Employee.employeeEsi=Math.round(Employee.totalGrossSalary * 2.94) / 100;
  //         }
  //       break;
  //     default:
  //   }

  // }
  // else {
  //   Employee.employeeEsi = 0
  //   console.log(Employee.employeeEsi);

  // }
  //=================================================================================================================
        // calculation for the basicsalary
        Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100))
        console.log(Employee.basicSalary);

        //calculation for the hraSalary
        Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100))
        console.log(Employee.hraSalary);

        //calculation for the educationAllowances
        Employee.educationAllowances = Math.round(Employee.totalGrossSalary * (2 / 100))
        console.log(Employee.educationAllowances);

        //calculation for the conveyance
        Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100))
        console.log(Employee.Conveyance);

        //total deductions per month
        Employee.totalDeduction = Math.round(Employee.pfContribution + Employee.employeeEsi + Employee.professionalTax)
        console.log(Employee.totalDeduction);

        //total net salary  per month
        Employee.netSalary = Math.round(Employee.totalGrossSalary - Employee.totalDeduction);
        console.log(Employee.netSalary);

        //calculation for the otherallowances
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * (10 / 100))
        console.log(Employee.otherAllowances);

        //pfcontribution per annum
        Employee.pfPreAnuum = Math.round(Employee.pfContribution * Employee.grossby)
        console.log(Employee.pfPreAnuum);


        //totalGrossPerAnnum calculation
        Employee.totalGrossPerAnnum = Math.round(Employee.totalGrossSalary * Employee.grossby)
        console.log(Employee.totalGrossPerAnnum);

        //basicsalaryperannum
        Employee.basicPerannum = Math.round(Employee.basicSalary * Employee.grossby)
        console.log(Employee.basicPerannum);

        //HRA per annum
        Employee.hraPerAnnum = Math.round(Employee.hraSalary * Employee.grossby);
        console.log(Employee.hraPerAnnum);

        //esiper anuum
        Employee.esiPerAnnum = Math.round(Employee.esicContribution * Employee.grossby);
        console.log(Employee.esiPerAnnum);
         //esiper anuum for employee
         Employee.esiPerAnnumemployee = Math.round(Employee.employeeEsi * Employee.grossby);
         console.log(Employee.esiPerAnnumemployee);

        //educationper annum
        Employee.educationallowancesPerAnnum = Math.round(Employee.educationAllowances * Employee.grossby)
        console.log(Employee.educationallowancesPerAnnum);
        //conveyance per annum
        Employee.conveyancePerAnnum = Math.round(Employee.Conveyance * Employee.grossby);
        console.log(Employee.conveyancePerAnnum);

        //otherAllowancesper annum
        Employee.otherAllowancesPerAnnum = Math.round(Employee.otherAllowances * Employee.grossby);
        console.log(Employee.otherAllowancesPerAnnum);

        //professional per annum
        Employee.professionalPerAnnum = Math.round(Employee.professionalTax * Employee.grossby);
        console.log(Employee.professionalPerAnnum);

        //salary deductions per annum
        Employee.totalDeductionsPerAnnum = Math.round(Employee.pfPreAnuum + Employee.esiPerAnnumemployee + Employee.professionalPerAnnum);
        console.log(Employee.totalDeductionsPerAnnum);

        //net salary per annum
        Employee.netSalaryPerAnnum = Math.round(Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum);
        console.log(Employee.netSalaryPerAnnum);
        //Ctc per annum
        Employee.ctcperannum = Math.round(Employee.totalGrossPerAnnum + Employee.pfPreAnuum + Employee.esiPerAnnum)
        console.log(Employee.ctcperannum);



        // console.log(Employee.salary);
      }
    })
  }

    private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  // async postAppraisalLetterFormSubmit() {
  //   const data = await this.appraisalData;
  //   // data.dateofAppraisal = this.formatDate(data.dateofAppraisal);
  //   // data.compeffectivedate = data.compeffectivedate;
  //   //console.log(data);
  //   const pdfContent = document.getElementById('pdfContent');
  //   if (pdfContent) {
  //     html2canvas(pdfContent, { scale: 3}).then(canvas =>  {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //        const imgWidth = pdf.internal.pageSize.getWidth();
  //        console.log(imgWidth);
  //        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //        console.log(imgHeight)
  //        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight,'','FAST');
  //       const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AppraisalLetter_Signed.pdf`;
  //       pdf.save(fileName);
  //       const blob = pdf.output('blob');
  //       console.log(blob);
  //           //creating form file to upload into AZure
  //     let d: Date = new Date()
  //     this.AppraisalFile = new File(
  //       [blob],
  //       fileName,
  //       {
  //         type: 'application/pdf',
  //       }
  //     );
  //       this.uploadAppointLetter();
  //     });
  //   }
  // }

 async postAppraisalLetterFormSubmit() {
    this.spinnerLoader= true;
    // if (this.employeeForm.invalid) {
    //   // Mark all fields as touched so validation messages appear
    //   this.employeeForm.markAllAsTouched();
    //   return;
    // }
    const data = await this.appraisalData;
    data.dateofAppraisal = this.formatDate(data.dateofAppraisal);
    data.compeffectivedate = this.formatDate(data.compeffectivedate);
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
      pdf.addImage(imageData.imgData, 'PNG', 0, 0, imgWidth, imageData.imgHeight, '', 'FAST');
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }
    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(lastImageData.imgData, 'PNG', 0, 0, imgWidth, lastImageData.imgHeight, '', 'FAST');
    }
    const fileName = `${data.firstName}_${data.lastName
      }_${new Date().getTime()}_AppraisalLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    //creating form file to upload into AZure
    this.AppraisalFile = new File([blob], fileName, {
      type: 'application/pdf',
    });
    // this.documentGenerated = true; // <-- Add this line
    // this.spinnerLoader = false;
    // this.conformationPopup.openSuccessModal('Appraisal letter generated successfully');
    this.uploadAppointLetter();
    // this.updateJobDetails();
    // this.updateCompensationDetails();
  }

   uploadAppointLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.appraisalData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.AppraisalFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
             this.spinnerLoader = false;
            this.postacknowledgement(data.path);
            console.log(data);
          }
        },
        error: (reason: any) => {
          console.log(reason);
        },
         complete: () => {
              this.spinnerLoader = false;
            }
      });
  }
  postacknowledgement(filePath: string) {
    this.isLoading = true;
     this.spinnerLoader = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.empdata.employeeId,
      generatedBy: this.empdata.employeeId,
      issuedDate:  this.letterdata.issuedDate,
      signedDocUrl: filePath,
      status: 'Released',
      candidateStatus: 'Acknowledged',
    };
    this.subscription = this.http
      .putData('LetterAcknowledgementDetails/updateAcknowledgement', payload)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.isacknowledged = true;
          this.isLoading = false;
           this.modalService.dismissAll();
          this.http.triggerRefresh();
           this.confirmationPopup.openSuccessModal('Appraisal Letter Accepted Successfully');
          
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.isacknowledged = false;
          this.isLoading = false;
          this.dataFailureMsg(error.error.message);
        },
        complete: () => {

          this.spinnerLoader = false;

        }
      });
  }

      openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

      dataSuccessMsg(msg:string){
    this.Status = msg;
          this.openmodel(this.successhide);
          setTimeout(() => {
            this.modalService.dismissAll();
          }, 2000);

  }

  dataFailureMsg(msg:string){
    this.Status = msg;
          this.openmodel(this.errorhide);
          setTimeout(() => {
            this.modalService.dismissAll();
          }, 2000);
  }

  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
   }

  postacknowledgementForReject(){
    this.isLoadingreject=true;
     const payload={ 
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId:this.empdata.employeeId,
      generatedBy: this.empdata.employeeId,
      issuedDate:  this.letterdata.issuedDate,
      // signedDocUrl: filePath,
      status: 'Released',
      candidateStatus: 'Rejected',
      rejectedComments: this.rejectForm.get('comments')?.value || ''
    };
    this.subscription=this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isacknowledged = true;
        this.isLoading = false;
        this.isLoadingreject=false;
         this.modalService.dismissAll();
         this.http.triggerRefresh();
        this.confirmationPopup.openSuccessModal('Appraisal Letter Rejected Successfully');
       
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isacknowledged = false;
        this.isLoading = false;
        this.isLoadingreject=false;
        this.dataFailureMsg(error.error.message);
      },
    });  
  }
  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
