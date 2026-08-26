import { Component, Input, } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { customVfs } from '../../../letters-builder-files/custom-fonts-vfs';
import { buildAppraisalLetterDoc } from '../../../letters-builder-files/appraisal-letter.builder';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { LettersheaderComponent } from "../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { fetchLetterAssets, setupLetterPdfMake } from '../../../letters-builder-files/letter-pdf.utils';
@Component({
  selector: 'app-apprisal-letter-acknowedgement',
  imports: [CommonModule, ReactiveFormsModule, DateformatPipe, TranslateModule, NgbPopoverModule, ConfirmationIconComponent, LetterFooterComponent, LettersheaderComponent],
  templateUrl: './apprisal-letter-acknowedgement.component.html',
  styleUrl: './apprisal-letter-acknowedgement.component.scss'
})

export class ApprisalLetterAcknowedgementComponent {
  isacknowledged = true;
  isLoading = false;
  employeeForm!: FormGroup;
  appraisalData = {} as any;
  empdata = {} as any;
  employeeName: any;
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
  currentDate = new Date();
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

  constructor(private http: HttpService, private confirmationPopup: OpenModalService, private modalService: NgbModal,
    private fb: FormBuilder, public formsValidation: FormValidationsService,) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUserData') || '{}');
    this.employeeName = `${this.empdata.firstName ?? ''} ${this.empdata.middleName ?? ''} ${this.empdata.lastName ?? ''}`;
    this.appraisalData = this.empdata;
    this.setPromotionFlag(this.letterdata?.isPromotion);
    this.getEmployeeId();
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.pattern(/^(?!\s).*/)]]
    });
    this.gender = this.appraisalData.gender === 'Male' ? 'Mr.' : 'Ms.';
  }

  clearRejectForm() {
    this.rejectForm.reset();
    this.modalService.dismissAll();
  }

  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    this.appraisalData = this.employeeiddetails.find((c: any) => c.employeeId == fusionemployeeId);
    this.getCompensationById(this.appraisalData)
    this.getJobdetails(this.appraisalData)
    this.getJobdetailsapprisal(this.appraisalData)
    this.getAppraisaldetails(this.appraisalData)
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data as IemployeeDetails[];
        this.Onclick(this.empdata.employeeId);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  private isTrue(value: unknown): boolean {
    return value === true || value === 1 || value === 'true' || value === 'True';
  }

  private setPromotionFlag(value: unknown): void {
    this.promotion = this.isTrue(value);
    this.nopromotion = !this.promotion;
    if (this.letterdata) {
      this.letterdata = { ...this.letterdata, isPromotion: this.promotion };
    }
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        const res = data.sort((a: any, b: any) => b.id - a.id);
        if (this.promotion) {
          this.latestjobRole = res[0]?.jobRole;
        }
        Employee.workLocation = res[0]?.lopcation;
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
        } else {
          let res = data[0];
          this.employeeJobDetails = res;
          Employee.jobRole = res.jobRole;
          Employee.workLocation = res.lopcation;
          this.jobErrorMessage = '';
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
    this.subscription = this.http.getData(`AppraisalLetter/getgeneratedappraisalpromotionletter?employeeId=${employeeId}&letterType=${encodeURIComponent(letterType)}`).subscribe({
      next: (data: any) => {
        this.appraisalData.Documenttype = data.docType;
        this.appraisalData.dateofAppraisal = data.issuedDate;
        this.appraisalData.note = data.note;
        this.setPromotionFlag(data.isPromotion);
        this.letterdata = {
          ...this.letterdata,
          isPromotion: this.promotion,
          newJobRole: this.promotion ? (data.newJobRole || this.letterdata?.newJobRole || '') : '',
        };
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
    this.subscription = this.http.getData(`SignaturesList?LetterType=${encodeURIComponent(letterType)}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data;
        // Find the matching authority by employeeId
        const matchedAuthority = data.find((auth: any) => auth.employeeId === authorityId);
        if (matchedAuthority) {
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
        this.appraisalData.reviewdate = res.nextCompReviewDate;
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
        if (this.appraisalData.pf == true || this.appraisalData.pf == false) {
          switch (this.appraisalData.pf) {
            case true:
              // if (Employee.grossSalary <= 15000) {
              //   Employee.pfContribution = Math.round((Employee.grossSalary * (Employee.grossby / 100)));
              //   if(Employee.pfContribution >= 1800) {
              //     Employee.pfContribution = 1800;
              //   }
              // }
              if (this.appraisalData.esic == false) {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
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
              // else if (Employee.grossSalary <= 1800) {
              //   Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
              //   if(Employee.pfContribution >= 1800) {
              //     Employee.pfContribution = 1800;
              //   }
              // }
              else if (Employee.grossSalary <= 23195) {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                if (Employee.pfContribution >= 1800) {
                  Employee.pfContribution = 1800;
                }
              }
              else {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
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
        }
        //claculation for ESIC employer
        // if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
        //   switch (this.appraisalData.esic) {
        //     case true:
        if (this.appraisalData.esic == true) {
          let condition1 = (Employee.grossSalary >= 23195)
          if (!condition1) {
            Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
          }
          else {
            Employee.esicContribution = 0;
            this.appraisalData.esic == false;
          }
        }
        else {
          Employee.esicContribution = 0;
          this.appraisalData.esic == false;
        }
        //     break;
        //     case false:
        //     let condition2=(Employee.grossSalary >= 23195)
        //     if (!condition2) {
        //       // Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
        //       Employee.esicContribution = 0
        //     }
        //     else{
        //       Employee.esicContribution=0
        //     }
        //     break;
        //   default:
        // }
        // }
        // else {
        //   Employee.esicContribution = 0
        // }
        //=============================================================================================================
        //calcution for the totalgrosssalary
        Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
        //====================================================================================================================
        //condtitions for professionaltax calulation.
        if (Employee.totalGrossSalary <= 15000) {
          Employee.professionalTax = 0
        }
        else if (Employee.totalGrossSalary >= 15001 && Employee.totalGrossSalary <= 20000) {
          Employee.professionalTax = 150;
        }
        else if (Employee.totalGrossSalary >= 20001) {
          Employee.professionalTax = 200;
        }
        else {
          Employee.professionalTax = 0;
        }
        //claculation for ESIC for employee
        // if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
        //   switch (this.appraisalData.esic) {
        //     case true:
        if (this.appraisalData.esic == false || this.appraisalData.esic == true) {
          switch (this.appraisalData.esic) {
            case true:
              if (Employee.totalGrossSalary <= 21000) {
                Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
              }
              else {
                Employee.employeeEsi = 0;
                this.appraisalData.esic == false;
              }
              break;
            case false:
              if (Employee.totalGrossSalary >= 23195) {
                Employee.employeeEsi = 0;
                this.appraisalData.esic == false;
              }
              else if (Employee.totalGrossSalary <= 21000) {
                // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
                Employee.employeeEsi = 0;
                this.appraisalData.esic == false;
              }
              else {
                Employee.employeeEsi = Math.round(Employee.totalGrossSalary * 2.94) / 100;
              }
              break;
            default:
          }
        }
        else {
          Employee.employeeEsi = 0;
        }
        //       break;
        //       case false:
        //         if (Employee.totalGrossSalary >= 23195) {
        //           Employee.employeeEsi= 0;
        //         }
        //         else if(Employee.totalGrossSalary <= 21000){
        //           // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
        //           Employee.employeeEsi = 0
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
        // }
        //=================================================================================================================
        //condtitions for professionaltax calulation.
        if (Employee.grossSalary < 15000) {
          Employee.professionalTax = 0;
        } else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
          Employee.professionalTax = 150;
        } else if (Employee.grossSalary >= 21000) {
          Employee.professionalTax = 200;
        } else {
          Employee.professionalTax = 0;
        }
        // calculation for the basicsalary
        Employee.basicSalary = Math.round(Employee.totalGrossSalary * (60 / 100));
        //calculation for the hraSalary
        Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
        //calculation for the educationAllowances taking as medical insurenc per month
        // Employee.educationAllowances = Math.round(Employee.totalGrossSalary * (2 / 100))
        Employee.educationAllowances = Math.round(0);
        //calculation for the conveyance
        // Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100))
        //total deductions per month
        Employee.totalDeduction = Math.round(Employee.pfContribution + Employee.employeeEsi +
          Employee.professionalTax //Employee.educationAllowances
        );
        //total net salary  per month
        Employee.netSalary = Math.round(Employee.totalGrossSalary - Employee.totalDeduction);
        //calculation for the otherallowances
        Employee.otherAllowances = Math.round(Employee.totalGrossSalary * (16 / 100));
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
        //educationper annum using for medical insurence
        Employee.educationallowancesPerAnnum = 12 * 0;
        //conveyance per annum
        // Employee.conveyancePerAnnum = Math.round(Employee.Conveyance * Employee.grossby);
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
  //   const pdfContent = document.getElementById('pdfContent');
  //   if (pdfContent) {
  //     html2canvas(pdfContent, { scale: 3}).then(canvas =>  {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //        const imgWidth = pdf.internal.pageSize.getWidth();
  //        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight,'','FAST');
  //       const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AppraisalLetter_Signed.pdf`;
  //       pdf.save(fileName);
  //       const blob = pdf.output('blob');
  //     //creating form file to upload into AZure
  //     let d: Date = new Date()
  //     this.AppraisalFile = new File([blob],fileName,
  //       { type: 'application/pdf', });
  //       this.uploadAppointLetter();
  //     });
  //   }
  // }

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

  async postAppraisalLetterFormSubmit() {
    this.spinnerLoader = true;
    const data = this.appraisalData;
    const isSoftCopy = true;

    const [assets, pm] = await Promise.all([
      fetchLetterAssets(isSoftCopy),
      setupLetterPdfMake(),
    ]);

    const docDef = buildAppraisalLetterDoc({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: this.gender,
      jobRole: data.jobRole ?? '',
      letterDate: data.dateofAppraisal,
      compEffectiveDate: data.compeffectivedate,
      totalCTC: (+(data.salary || 0)) + (+(data.variablePayAmount || 0)),
      isPromotion: this.promotion,
      newJobRole: this.promotion ? (this.letterdata?.newJobRole || this.latestjobRole || '') : '',
      reviewDate: data.reviewdate,
      variablePayAmount: data.variablePayAmount,
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
      educationAllowances: data.educationAllowances,
      educationallowancesPerAnnum: data.educationallowancesPerAnnum,
      totalDeduction: data.totalDeduction,
      totalDeductionsPerAnnum: data.totalDeductionsPerAnnum,
      netSalary: data.netSalary,
      netSalaryPerAnnum: data.netSalaryPerAnnum,
      esicContribution: data.esicContribution,
      esiPerAnnum: data.esiPerAnnum,
      grossSalary: data.grossSalary,
      salary: data.salary,
      authorityFullName: data.authorityName ?? '',
      authorityDesignation: this.authorityDesignation ?? '',
      useVerdanaFont: true,
      useAutographyFont: true,
      employeeSignatureDate: new Date().toISOString(),
       backgroundImageBase64: assets.backgroundImageBase64,
      headerLogoBase64: assets.headerLogoBase64,
    });

    const blob: Blob = await pm.createPdf(docDef).getBlob();
    const fileName = `${data.firstName}${data.middleName ? `_${data.middleName}` : ''}${data.lastName ? `_${data.lastName}` : ''}_${new Date().getTime()}_AppraisalLetter_Signed.pdf`;
    this.AppraisalFile = new File([blob], fileName, { type: 'application/pdf' });
    this.uploadAppointLetter();
  }

  uploadAppointLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.appraisalData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.AppraisalFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          this.postacknowledgement(data.path);
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
      generatedBy: this.letterdata.generatedBy,
      issuedDate: this.letterdata.issuedDate,
      signedDocUrl: filePath,
      status: 'Released',
      candidateStatus: 'Acknowledged',
    };
    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: (data: any) => {
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
        this.confirmationPopup.openErrorModal(error.error.message);
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  openpopup(content: any) {
    this.modalService.open(content, { centered: true });
  }

  postacknowledgementForReject() {
    this.isLoadingreject = true;
    const payload = {
      referenceId: this.letterdata.referenceId,
      letterType: this.letterdata.letterType,
      acknowledgeDate: moment().format('YYYY-MM-DD'),
      employeeId: this.empdata.employeeId,
      generatedBy: this.letterdata.generatedBy,
      IssuedDate: this.letterdata.issuedDate,
      // signedDocUrl: filePath,
      status: 'Released',
      candidateStatus: 'Rejected',
      rejectedComments: this.rejectForm.get('comments')?.value || '',
    };
    this.subscription = this.http.putData('LetterAcknowledgementDetails/updateAcknowledgement', payload).subscribe({
      next: (data: any) => {
        this.isacknowledged = true;
        this.isLoading = false;
        this.isLoadingreject = false;
        this.modalService.dismissAll();
        this.http.triggerRefresh();
        this.confirmationPopup.openSuccessModal('Appraisal Letter Rejected Successfully');
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.isacknowledged = false;
        this.isLoading = false;
        this.isLoadingreject = false;
        this.confirmationPopup.openErrorModal(error.error.message);
      },
    });
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
