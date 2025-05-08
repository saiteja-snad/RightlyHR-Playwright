import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { IJob } from '../../Interfaces/letters-model';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
@Component({
  selector: 'app-apprisal-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent, TranslateModule, LetterFooterComponent],
  templateUrl: './apprisal-letter.component.html',
  styleUrl: './apprisal-letter.component.scss'
})

export class ApprisalLetterComponent {
  allempdata = [] as IJob[];
  subscription!: Subscription;
  appraisalTemplate: any | string | ArrayBuffer | null = null; //appraisal letter template
  appraisalData = {} as any; //appraisal letter form object
  result = {} as any;
  fusionEmpId: any;
  employeeiddetails = [] as any;
  employeeiDetails = [] as any;
  employeeCompensationDetails = [] as any;
  AppraisalFile!: File;
  isdateofAppraisal: boolean = true;
  isNextApprisal: boolean = true;
  grossSalary = {} as any;
  employeedata = {} as any;
  Employeeinfo = {} as any;
  employeeJobDetails = {} as any; //to store the values of jobDetails
  employeeCompensationData = {} as any; //to store the values of CompDetails
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  employeeFusionId = {} as any;
  showDropdown: boolean = false;
  authoritydetails = [] as any;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null;
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  options: string[] = ['Option 1', 'Option 2', 'Option 3'];
  selectedValueJobRoledrop: string = ''; //to post the data
  selectedValueJobRoledropUpdate: string = ''; //to post the data
  selectedValueemployeementtypedropUpdate: string = '';
  selectedValueJobRoledropUpdateInitial: string = ''; //to post the data
  selectedValueDepartmentdrop: string = ''; //to post the data
  selectedValuebusinessdrop: string = ''; //to post the data
  selectedValuebusinessdropUpdate: string = ''; //to post the data
  selectedValuebusinessdropUpdateInitial: string = ''; //to post the data
  selectedValueReportstodrop: string = ''; //to post the data
  selectedValueReportstodropUpdate: string = ''; //to post the data
  selectedValueReportstodropUpdateInitial!: string; //to post the data
  selectedValueReportstoEmployeeIddrop!: number; //to sent reporting member id
  selectedValueReportstoEmployeeIddropUpdate!: number; //to sent reporting member id
  selectedValueReportstoEmployeeIddropUpdateInitial!: number; //to sent reporting member id
  selectedValueUpdateSubLocation = {} as string;
  selectedValueEmployementtypedropInitial: string = ''; //to post the data
  selectedValueExperiencedropUpdateInitial: string = ''; //to post the data
  selectedValueJobRoleExpirencedropUpdate: string = '';
  selectedValueCountryCodedropUpdate: string = '';
  selectedValuecontactnumberCountrydropdown: string = ''; //previously setected value
  selectedValuecontactnumberCountryCodeInitial: string = '';
  optionsFound: boolean = true;
  promotion: boolean = false;
  nopromotion: boolean = true;
  currentDate: Date = new Date();
  Status: any;
  employeeForm!: FormGroup;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  variablePayOptions: { name: string, value: boolean }[]  = [
    { name: 'Yes', value: true },
    { name: 'No', value: false }
  ];
  
  jobErrorMessage!: string;
  spinnerLoader= false;

  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private conformationPopup: OpenModalService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,private fb: FormBuilder
  ) {  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  DateValidation() {
    const dateofAppraisal = new Date(this.appraisalData.dateofAppraisal);
    const probationEndDate = new Date(this.appraisalData.probationEndDate);
    if (dateofAppraisal <= probationEndDate) {
      this.isdateofAppraisal = false;
    } else {
      this.isdateofAppraisal = true;
    }
  }

  DateValidation2() {
    const reviewdate = new Date(this.appraisalData.reviewdate);
    const probationEndDate = new Date(this.appraisalData.probationEndDate);
    if (reviewdate <= probationEndDate) {
      this.isNextApprisal = false;
    } else {
      this.isNextApprisal = true;
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAppraisalTemplate();
    this.getEmployeeId();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
    this.getDesignationwithGradeid();
    this.employeeForm.get('variablePayAmount')?.disable();
    // this.employeeForm.get('variablePayAmount')?.setValue(0);
    // this.appraisalData.variablePayAmount = '0';
  }

  //function for issed by
  getIssuedEmployeebyId() {
    this.employeedata =
      this.Employeeinfo.firstName + ' ' + this.Employeeinfo.lastName;
  }

  //function for disabling the incorrect employeeid
  Onclickemployeeid(Value: any) {
    if (Value == '') {
      this.disablebuttonforemployeeid = true;
    } else {
      this.disablebuttonforemployeeid = false;
    }
  }

  onVariablePayChange() {
    const isVariable = this.employeeForm.get('isVariablePay')?.value;
    if (isVariable === true) {
      this.employeeForm.get('variablePayAmount')?.enable();
      this.employeeForm.get('variablePayAmount')?.reset();
      this.appraisalData.variablePayAmount = this.employeeForm.get('variablePayAmount')?.value;
    } else {
      this.employeeForm.get('variablePayAmount')?.disable();
      // this.employeeForm.get('variablePayAmount')?.setValue(0);
      // this.appraisalData.variablePayAmount = '0';
    }
  }

  gender: any;
  gender2: any;
  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    this.appraisalData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId.fusionEmpId
    );
    this.disablebuttonforemployeeid = true;
    this.getCompensationById(this.appraisalData);
    this.getJobdetails(this.appraisalData);
    if (this.appraisalData.gender == 'Male') {
      return (this.gender = 'Mr.');
    } else {
      return (this.gender = 'Ms.');
    }
  }

  //toggledropdown to open and close the dropdown list
  toggleDropdown(dropcategory: any) {
    if (dropcategory == 'empid') {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
      } else {
        this.filteredOptions = [];
      }
    } else if (dropcategory == 'authority') {
      this.isDropdownOpenauthority = !this.isDropdownOpenauthority;
      if (this.isDropdownOpenauthority) {
      } else {
        this.filteredOptions = [];
      }
    }
  }

  //function to select authority name
  onclickauthority(ValueName: any) {
    this.authorityName = ValueName;
    if (this.authorityName == '') {
      this.disablebuttonforauthority = true;
    } else {
      this.disablebuttonforauthority = false;
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.middleName + ' ' + c.lastName === ValueName
    );
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(
      JSON.stringify(
        authorityDesignationdata?.firstName +
        ' ' +
        authorityDesignationdata?.middleName +
        ' ' +
        authorityDesignationdata?.lastName
      )
    );
    if (this.authorityName) {
      if (this.authorityName === this.signatureAuthorityName) {
        this.disablebuttonforauthority = true;
      } else {
        this.disablebuttonforauthority = false;
      }
    }
    if (authorityDesignationdata == undefined) {
      this.authorityDesignation = null;
      this.signatureAuthorityName = null;
    }
  }
  onclickDesignation() {
    let signatureAuthorityDetails = this.authoritydetails.find(
      (c: any) => c.employeeId == this.appraisalData.authorityid
    );
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.appraisalData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.appraisalData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    } else if (
      signatureAuthorityDetails == undefined ||
      signatureAuthorityDetails == null
    ) {
      this.appraisalData.authorityName = '';
      this.authorityDesignation = '';
    }
  }

  //get offer letter Authority list
  getAuthorityDetails() {
    let offertype = 'Appraisal Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authoritydetails = data;
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim() // Concatenate first, middle, last name and trim any extra spaces
        }));
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
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

  sanitizeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.appraisalData.bonus = input.value ? parseInt(input.value, 10) : null;
  }

  previusSalary: any;
  incrementSalary: any;

  //get compensation details by empid
  getCompensationById(Employee: any) {
    let EmployeeId = this.appraisalData.employeeId;
    this.subscription = this.http
      .getData(`Compensationdata/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          if(!data || data.length == 0){
            this.jobErrorMessage = 'No Compensation details found for this employee.';
            this.employeeForm.get('jobValid')?.setValue(false);
          }else{
            let res = data.reverse()[0];
          this.employeeCompensationData = res;
          this.appraisalData.employeeId = res.employeeId;
          this.appraisalData.bonus = res.bonusAmountData;
          this.previusSalary = data[0];
          this.incrementSalary = res?.compensationamount - this.previusSalary.compensationamount;
          this.employeeCompensationDetails = res;
          this.appraisalData.salary = res?.compensationamount;
          this.appraisalData.compeffectivedate = res.compeffectivedate;
          //CTC calculation stated
          Employee.grossby = 12;
          Employee.grossSalary = Math.round(res?.compensationamount / Employee.grossby);
          this.grossSalary = Employee.grossSalary;
          if (this.appraisalData.pf == true || this.appraisalData.pf == false) {
            switch (this.appraisalData.pf) {
              case true:
                if (this.appraisalData.esic == false) {
                  Employee.pfContribution = Math.round(
                    Employee.grossSalary * (6.719 / 100)
                  );
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                } else if (Employee.grossSalary >= 23195) {
                  Employee.pfContribution = Math.round(
                    Employee.grossSalary * (6.717 / 100)
                  );
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
          if (this.appraisalData.esic == true) {
            let condition1 = Employee.grossSalary >= 23195;
            if (!condition1) {
              Employee.esicContribution = Math.round(
                Employee.grossSalary * (2.94 / 100)
              );
            } else {
              Employee.esicContribution = 0;
              this.appraisalData.esic == false;
            }
          } else {
            Employee.esicContribution = 0;
            this.appraisalData.esic == false;
          }

          //=============================================================================================================
          //calcution for the totalgrosssalary
          Employee.totalGrossSalary = Math.round(
            Employee.grossSalary -
            Employee.pfContribution -
            Employee.esicContribution
          );

          if (this.appraisalData == true) {
            if (Employee.totalGrossSalary <= 21000) {
              Employee.employeeEsi = Math.round(
                Employee.totalGrossSalary * (0.75 / 100)
              );
            } else {
              Employee.employeeEsi = 0;
              this.appraisalData.esic == false;
            }
          } else {
            Employee.employeeEsi = 0;
            this.appraisalData.esic == false;
          }


          //=================================================================================================================

          //condtitions for professionaltax calulation.
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
          Employee.educationAllowances = Math.round(558);

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
          Employee.educationallowancesPerAnnum = 12 * 558;

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
            Employee.pfPreAnuum +
            Employee.esiPerAnnumemployee +
            Employee.educationallowancesPerAnnum +
            Employee.professionalPerAnnum
          );

          //net salary per annum
          Employee.netSalaryPerAnnum = Math.round(
            Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum
          );
          //Ctc per annum
          Employee.ctcperannum = Math.round(
            Employee.totalGrossPerAnnum +
            Employee.pfPreAnuum +
            Employee.esiPerAnnum
          );
        }
      }
          
      });
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiDetails = data;
        this.employeeiddetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  async postAppraisalLetterFormSubmit(f: FormGroup) {
    this.spinnerLoader= true;
    if (this.employeeForm.invalid) {
      // Mark all fields as touched so validation messages appear
      this.employeeForm.markAllAsTouched();
      return;
    }
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
    this.uploadAppraisalLetter();
    this.updateJobDetails();
    this.updateCompensationDetails();
  }

  updateJobDetails() {
    let data = this.employeeJobDetails;
    this.appraisalData.status = 'Active';
    const jobdata = {
      employeeId: data.employeeId,
      effectiveDate: new Date(),
      locationid: data.locationid,
      sublocationid: data.sublocationid,
      jobRole: this.appraisalData.designation,
      status: 'Active',
      subdeptId: data.subdeptId,
      createddate: data.createddate,
      gradeId: data.gradeId,
      reportsto: data.reportsto,
      shiftId: data.shiftId,
      jobTypeId: data.jobTypeId,
      lopcation: data.lopcation,
      bussinessArea: data.bussinessArea,
      updateddate: data.updateddate,
    };
    this.subscription = this.http.postdata('JobDetails', jobdata).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  updateCompensationDetails() {
    let data = this.employeeCompensationData;
    const Compensationdataupdate = {
      id: data.id,
      employeeId: data.employeeId,
      compeffectivedate: data.compeffectivedate,
      overtimeeligibility: data.overtimeeligibility,
      reason: data.reason,
      frequency: data.frequency,
      paytype: data.paytype,
      compensationamount: this.appraisalData.salary,
      variablePayAmount: this.appraisalData.variablePayAmount,
      isVariablePay: this.appraisalData.isVariablePay,
      status: 'Active',
      compensationcomments: data.compensationcomments,
      bonusAmountData: this.appraisalData.bonus,
      nextCompReviewDate: this.appraisalData.reviewdate,
    };
    this.subscription = this.http.postdata('Compensationdata/UPDATER', Compensationdataupdate).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //Update Employee details along with Appraisal details
  sendEmployeeDetails() {
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.appraisalData).subscribe({
      next: (data: any) => {
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //to get appraisal letter template
  async getAppraisalTemplate() {
    this.appraisalTemplate = await this.httpclient.get('assets/Performance_Appraisal_Letter.docx', {
      responseType: 'arraybuffer',
    })
      .toPromise();
  }

  //to Upload Appraisal letter
  uploadAppraisalLetter() {
    let loggedInUser = this.authService.getToken();
    let filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.appraisalData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory',
      filePath,
      this.AppraisalFile
    ).subscribe({
      next: (data: any) => {
        if (data) {
          this.result.documentUrl = data.path;
          // this.dataSuccessMsg('Appraisal Letter Generated Successfully');
          this.conformationPopup.openSuccessModal('Appraisal Letter Generated Successfully');
          // this.router.navigate(['/admin/active']);
        }
        let emaildetails = {
          personEmail: this.appraisalData.workEmail,
          senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
          senderEmail: loggedInUser.workEmail,
          firstName: this.appraisalData.firstName,
          lastName: this.appraisalData.lastName,
          middleName: this.appraisalData.middleName,
          personRole: this.appraisalData.jobRole,
          documentUrl: this.result.documentUrl,
          compeffectivedate: this.employeeCompensationData.compeffectivedate,
          employeeId: this.appraisalData.employeeId,
          compensationamount: this.appraisalData.salary,
        };
        if (loggedInUser.middleName) {
          emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
        } else {
          emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
        }

        this.subscription = this.http.postdata(`CustomEmail/Appraisalletter`, emaildetails).subscribe({
          next: (data: any) => {
            this.conformationPopup.openSuccessModal('Email Sent Successfully');
            setTimeout(() => {
              this.navigateDashboard();
            }, 2000)
          },
          error: (err: any) => {
            this.spinnerLoader = false;
            console.log(err);
          },
          complete: () => {
            this.spinnerLoader = false;
          },
        });
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
    });
  }

  //to fromat Date
  private formatDate(dateString: Date): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  }

  formatDates(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
      return false;
    }
    return true;
  }

  numbers(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  checkaccess(rba: string): boolean {
    let access = JSON.parse(localStorage.getItem('fusionroleClaims') || '{}');
    if (access.includes(rba)) return true;
    else return false;
  }

  updateOptionsFound(found: boolean) {
    this.optionsFound = found;
  }
 
  AllDesignationwithGradeId: any;
  getDesignationWithGradeIdDetails = [] as any;
  getDesignationwithGradeid() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        this.getDesignationWithGradeIdDetails = data;
      
      this.AllDesignationwithGradeId = this.getDesignationWithGradeIdDetails.map(
        (item: { designationName: any }) => ({
          designationName: item.designationName,
          value: item.designationName
        })
      );
     },
      error: (err: any) => { },
    });
  }

  isEditing: boolean = false;
  empdata = {} as any;
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
  
  //function to get the grade name for the designation
  getGradeNameById() {
    let GradeId = this.gradeIdValue.gradeId;
    this.subscription = this.http.getData(`GradeTable/getbyid/${GradeId}`)
      .subscribe({
        next: (data: any) => {
          this.getGradename = data.gradeName;
        },
        error: (err: any) => { },
      });
  }

  buttondisable: boolean = false;
  onOptionSelected(event: any, dropdownCategory: string) {
    let option = '';
    if (typeof event === 'string') {
      option = event;
    } else if (event?.designationName) {
      option = event.designationName;
    } else {
      option = event?.target?.value ?? '';
    }
    this.appraisalData.designation = option;
    this.buttondisable = !!option;
    this.islistedItem = true;
    this.optionsFound = true;
    if (dropdownCategory === 'JobRole') {
      this.selectedValueJobRoledrop = option;
      this.gradeIdValue = this.getDesignationWithGradeIdDetails.find(
        (ele: { designationName: string }) =>
          ele.designationName === this.selectedValueJobRoledrop
      );
      this.getGradeNameById();
    } else if (dropdownCategory === 'reportingtoUpdate') {
      this.selectedValueReportstodropUpdate = option;
      const selectedName = this.selectedValueReportstodropUpdate;
      const selectedObject = this.allempdata.find(
        ({ firstName, lastName }) => `${firstName} ${lastName}` === selectedName
      );
      if (selectedObject) {
        this.selectedValueReportstoEmployeeIddropUpdate =
          selectedObject.employeeId;
      }
    }
  }
  
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }

  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      dateofAppraisal: ['', Validators.required],
      reviewdate: ['', Validators.required],
      JobRole:[''],
      Documenttype: [null, Validators.required],
      bonus: [''],
      authorityid: [null, Validators.required],
      isVariablePay: [null, Validators.required],
      variablePayAmount: ['', Validators.required],
      jobValid: [false, Validators.requiredTrue]
    })
  }
}