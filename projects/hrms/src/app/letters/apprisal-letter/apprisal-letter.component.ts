import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { IAuthority, IemployeeDetails, IJob } from '../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";

@Component({
  selector: 'app-apprisal-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent],
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
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Status: any;
  employeeForm!: FormGroup;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    // private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig,
    private modalService: NgbModal,private fb: FormBuilder
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  dataFailureMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.errorhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  DateValidation() {
    const dateofAppraisal = new Date(this.appraisalData.dateofAppraisal);
    const probationEndDate = new Date(this.appraisalData.probationEndDate);
    console.log(dateofAppraisal, probationEndDate);
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
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    console.log(this.Employeeinfo);
      this.employeeiddetails = this.employeeiddetails.map((emp: IemployeeDetails) => ({
          ...emp,
          fullName: `${emp.firstName} ${emp.middleName} ${emp.lastName}`, // Concatenate firstName, middleName, lastName
        }));
        this.authorityDetails = this.authorityDetails.map((authority: IAuthority) => ({
                  ...authority,
                  fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim(), // Concatenate and remove excess spaces
                }));
    this.initializeForm();
    this.getAppraisalTemplate();
    this.getEmployeeId();
    // this.getCompensationById;
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
    this.getDesignationwithGradeid();
  }

  //function for issed by
  getIssuedEmployeebyId() {
    this.employeedata =
      this.Employeeinfo.firstName + ' ' + this.Employeeinfo.lastName;
    console.log(this.employeedata);
  }

  //function for disabling the incorrect employeeid
  Onclickemployeeid(Value: any) {
    if (Value == '') {
      this.disablebuttonforemployeeid = true;
    } else {
      this.disablebuttonforemployeeid = false;
    }
  }

  // onVariablePayChange(isVariablePay: boolean): void {
  //   if (isVariablePay === false) {
  //     this.appraisalData.variablePayAmount = '0';
  //   }
  // }
  onVariablePayChange() {
    const isVariable = this.employeeForm.get('isVariablePay')?.value;
  
    if (isVariable === true) {
      this.employeeForm.get('variablePayAmount')?.enable();
      this.employeeForm.get('variablePayAmount')?.reset();
      this.appraisalData.variablePayAmount = this.employeeForm.get('variablePayAmount')?.value;
    } else {
      this.employeeForm.get('variablePayAmount')?.disable();
      this.employeeForm.get('variablePayAmount')?.setValue(0);
    }
  }

  gender: any;
  gender2: any;
  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.appraisalData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId.fusionEmpId
    );
    this.disablebuttonforemployeeid = true;
    this.getCompensationById(this.appraisalData);
    this.getJobdetails(this.appraisalData);
    console.log(this.appraisalData);
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
    console.log(authorityDesignationdata);
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
    console.log(this.authorityDesignation);
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
      console.log(this.authorityDesignation);
    }
  }
  onclickDesignation() {
    let signatureAuthorityDetails = this.authoritydetails.find(
      (c: any) => c.employeeId == this.appraisalData.variablePayAmount.employeeId
    );
    console.log(signatureAuthorityDetails);
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
        console.log(data);
        this.authoritydetails = data;
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim() // Concatenate first, middle, last name and trim any extra spaces
        }));
  
        console.log(this.authorityDetails);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
  //hostlister to close the dropdown when we Click out side the box
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: any) {
    const dropdownToggle = this.elementRef.nativeElement.querySelector('.dropdown-toggles');
    const dropdownMenu = this.elementRef.nativeElement.querySelector('.dropdown-menu');
    if (dropdownToggle && !dropdownToggle.contains(target) && dropdownMenu && !dropdownMenu.contains(target)) {
      this.isDropdownOpen = false;
      this.filteredOptions = [];
    }
  }
  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        let res = data.reverse()[0];
        this.employeeJobDetails = res;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = res.lopcation;
        console.log(Employee.jobRole);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  //formatedate with date
  private formatDatewithDate(date: Date): string | void {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
  }
  //get time
  // const date = new Date()
  private getTime(date?: Date) {
    return date != null ? new Date(date).getTime() : 0;
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
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(`Compensationdata/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          // console.log(data);
          let res = data.reverse()[0];
          this.employeeCompensationData = res;
          console.log(res);
          this.appraisalData.employeeId = res.employeeId;
          this.appraisalData.bonus = res.bonusAmountData;
          this.previusSalary = data[0];
          console.log(this.previusSalary);

          this.incrementSalary =
            res?.compensationamount - this.previusSalary.compensationamount;
          console.log(this.incrementSalary);
          this.employeeCompensationDetails = res;
          this.appraisalData.salary = res?.compensationamount;
          this.appraisalData.compeffectivedate = res.compeffectivedate;
          console.log(this.appraisalData);
          //CTC calculation stated
          Employee.grossby = 12;
          Employee.grossSalary = Math.round(
            res?.compensationamount / Employee.grossby
          );
          this.grossSalary = Employee.grossSalary;
          console.log(this.grossSalary);

          console.log(Employee.grossby);
          console.log(Employee.grossSalary);
          console.log(this.appraisalData);

          console.log(this.appraisalData.pf);
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
                  console.log(Employee.pfContribution);
                } else if (Employee.grossSalary >= 23195) {
                  Employee.pfContribution = Math.round(
                    Employee.grossSalary * (6.717 / 100)
                  );

                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);
                }

                else if (Employee.grossSalary <= 23195) {
                  Employee.pfContribution = Math.round(
                    Employee.grossSalary * (6.519 / 100)
                  );
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);
                } else {
                  Employee.pfContribution = Math.round(
                    Employee.grossSalary * (6.719 / 100)
                  );
                  console.log(Employee.pfContribution);
                }
                break;
              case false:
                Employee.pfContribution = 0;
                break;
              default:
            }
          } else {
            0;
            console.log(this.appraisalData.pf);
          }

          if (this.appraisalData.esic == true) {
            let condition1 = Employee.grossSalary >= 23195;
            if (!condition1) {
              Employee.esicContribution = Math.round(
                Employee.grossSalary * (2.94 / 100)
              );
              console.log(Employee.esicContribution);
            } else {
              Employee.esicContribution = 0;
              this.appraisalData.esic == false;
              console.log(Employee.esicContribution);
            }
          } else {
            Employee.esicContribution = 0;
            this.appraisalData.esic == false;
            console.log(Employee.esicContribution);
          }

          //=============================================================================================================
          //calcution for the totalgrosssalary
          Employee.totalGrossSalary = Math.round(
            Employee.grossSalary -
            Employee.pfContribution -
            Employee.esicContribution
          );
          console.log(Employee.totalGrossSalary);

          if (this.appraisalData == true) {
            if (Employee.totalGrossSalary <= 21000) {
              Employee.employeeEsi = Math.round(
                Employee.totalGrossSalary * (0.75 / 100)
              );
              console.log(Employee.employeeEsi);
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
            console.log(Employee.professionalTax);
          } else if (
            Employee.grossSalary > 15000 &&
            Employee.grossSalary < 21000
          ) {
            Employee.professionalTax = 150;
            console.log(Employee.professionalTax);
          } else if (Employee.grossSalary >= 21000) {
            Employee.professionalTax = 200;
            console.log(Employee.professionalTax);
          } else {
            Employee.professionalTax = 0;
            console.log(Employee.professionalTax);
          }

          // calculation for the basicsalary
          Employee.basicSalary = Math.round(
            Employee.totalGrossSalary * (60 / 100)
          );
          console.log(Employee.basicSalary);

          //calculation for the hraSalary
          Employee.hraSalary = Math.round(Employee.basicSalary * (40 / 100));
          console.log(Employee.hraSalary);

          //calculation for the educationAllowances taking as medical insurenc per month
          // Employee.educationAllowances = Math.round(Employee.totalGrossSalary * (2 / 100))
          // console.log(Employee.educationAllowances);
          Employee.educationAllowances = Math.round(558);
          console.log(Employee.educationAllowances);

          //calculation for the conveyance
          // Employee.Conveyance = Math.round(Employee.totalGrossSalary * (4 / 100))
          // console.log(Employee.Conveyance);

          //total deductions per month
          Employee.totalDeduction = Math.round(
            Employee.pfContribution +
            Employee.employeeEsi +
            Employee.professionalTax +
            Employee.educationAllowances
          );
          console.log(Employee.totalDeduction);

          //total net salary  per month
          Employee.netSalary = Math.round(
            Employee.totalGrossSalary - Employee.totalDeduction
          );
          console.log(Employee.netSalary);

          //calculation for the otherallowances
          Employee.otherAllowances = Math.round(
            Employee.totalGrossSalary * (16 / 100)
          );
          console.log(Employee.otherAllowances);

          //pfcontribution per annum
          Employee.pfPreAnuum = Math.round(
            Employee.pfContribution * Employee.grossby
          );
          console.log(Employee.pfPreAnuum);

          //totalGrossPerAnnum calculation
          Employee.totalGrossPerAnnum = Math.round(
            Employee.totalGrossSalary * Employee.grossby
          );
          console.log(Employee.totalGrossPerAnnum);

          //basicsalaryperannum
          Employee.basicPerannum = Math.round(
            Employee.basicSalary * Employee.grossby
          );
          console.log(Employee.basicPerannum);

          //HRA per annum
          Employee.hraPerAnnum = Math.round(
            Employee.hraSalary * Employee.grossby
          );
          console.log(Employee.hraPerAnnum);

          //esiper anuum
          Employee.esiPerAnnum = Math.round(
            Employee.esicContribution * Employee.grossby
          );
          console.log(Employee.esiPerAnnum);
          //esiper anuum for employee
          Employee.esiPerAnnumemployee = Math.round(
            Employee.employeeEsi * Employee.grossby
          );
          console.log(Employee.esiPerAnnumemployee);

          //educationper annum using for medical insurence
          Employee.educationallowancesPerAnnum = 12 * 558;
          console.log(Employee.educationallowancesPerAnnum);

          //conveyance per annum
          // Employee.conveyancePerAnnum = Math.round(Employee.Conveyance * Employee.grossby);
          // console.log(Employee.conveyancePerAnnum);

          //otherAllowancesper annum
          Employee.otherAllowancesPerAnnum = Math.round(
            Employee.otherAllowances * Employee.grossby
          );
          console.log(Employee.otherAllowancesPerAnnum);

          //professional per annum
          Employee.professionalPerAnnum = Math.round(
            Employee.professionalTax * Employee.grossby
          );
          console.log(Employee.professionalPerAnnum);

          //salary deductions per annum
          Employee.totalDeductionsPerAnnum = Math.round(
            Employee.pfPreAnuum +
            Employee.esiPerAnnumemployee +
            Employee.educationallowancesPerAnnum +
            Employee.professionalPerAnnum
          );
          console.log(Employee.totalDeductionsPerAnnum);

          //net salary per annum
          Employee.netSalaryPerAnnum = Math.round(
            Employee.totalGrossPerAnnum - Employee.totalDeductionsPerAnnum
          );
          console.log(Employee.netSalaryPerAnnum);
          //Ctc per annum
          Employee.ctcperannum = Math.round(
            Employee.totalGrossPerAnnum +
            Employee.pfPreAnuum +
            Employee.esiPerAnnum
          );
          console.log(Employee.ctcperannum);

          // console.log(Employee.salary);
        },
      });
  }
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiDetails = data;
          //this.employeeiddetails = data as IemployeeDetails[];
          this.employeeiddetails = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${
                employee.employeeId ? employee.employeeId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
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
    console.log(blob);
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
        console.log(data);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  updateCompensationDetails() {
    let data = this.employeeCompensationData;
    console.log(data);
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
        console.log(data);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //Update Employee details along with Appraisal details
  sendEmployeeDetails() {
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', this.appraisalData)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //to get appraisal letter template
  async getAppraisalTemplate() {
    this.appraisalTemplate = await this.httpclient
      .get('assets/Performance_Appraisal_Letter.docx', {
        responseType: 'arraybuffer',
      })
      .toPromise();
  }

  //to store file to the azure and return to the url
  // private appraisalletterUpload(empId: number, file: File) {
  //   let filePath = `/FusionDocuments/Employee Documents/appraisal Letter/${empId}`;
  //   this.subscription = this.http
  //     .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
  //     .subscribe({
  //       next: (data: any) => {
  //         if (data) {
  //           this.result.documentUrl = data.path;
  //           this.postAppraisalDetails(data.path);
  //           console.log(data);
  //         }
  //       },
  //       error: (reason: any) => {
  //         console.log(reason);
  //         alert('file upload  is failed');
  //       },
  //     });
  // }

  //to Upload Appraisal letter
  uploadAppraisalLetter() {
    let loggedInUser = this.authService.getToken();
    let filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.appraisalData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory',
      filePath,
      this.AppraisalFile
    )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.dataSuccessMsg('Appraisal Letter Generated Successfully');

            this.router.navigate(['/admin/active']);
            console.log(data);
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
          console.log(emaildetails);

          this.subscription = this.http.postdata(`CustomEmail/Appraisalletter`, emaildetails).subscribe({
            next: (data: any) => {
              console.log(data);
              this.dataSuccessMsg('Email Sent Successfully');

              location.reload();
            },
            error: (err: any) => {
              console.log(err);
            },
            complete: () => { },
          });
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');
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

  //to format string date to actual date
  private formatDatebyDatestring(data: string): moment.Moment {
    let stringarray = data.split('/');
    return moment(`${stringarray[2]}-${stringarray[1]}-${stringarray[0]}`, 'YYYY-MM-DD');
  }

  formatDates(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
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
  // updateOptionsFound(event: Event) {
  //   // If it's a checkbox or input, you might extract value like this
  //   const target = event.target as HTMLInputElement;
  //   this.optionsFound = target.checked; // or .value depending on context
  // }
  AllDesignationwithGradeId: any;
  getDesignationWithGradeIdDetails = [] as any;
  getDesignationwithGradeid() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        console.log(data);
        this.getDesignationWithGradeIdDetails = data;
      //   this.AllDesignationwithGradeId =
      //     this.getDesignationWithGradeIdDetails.map(
      //       (item: { designationName: any }) => item.designationName
      //     );
      // },
      
      this.AllDesignationwithGradeId = this.getDesignationWithGradeIdDetails.map(
        (item: { designationName: any }) => ({
          designationName: item.designationName,
          value: item.designationName
        })
      );
      
      console.log(" AllDesignationwithGradeId is:",this.AllDesignationwithGradeId);
    },
      error: (err: any) => { },
    });
  }

  isEditing: boolean = false;
  empdata = {} as any;
  gradeIdValue: any;
  getGradename: any;
  islistedItem: boolean = true;
  // isItemIntheList(isitem: boolean) {
  //   console.log(isitem);
  //   this.islistedItem = isitem;
  //   if (isitem == false) {
  //     this.gradeIdValue = {};
  //     this.getGradename = '';
  //     this.promotion = false;
  //     this.nopromotion = true;
  //   } else {
  //     this.promotion = true;
  //     this.nopromotion = false;
  //   }
  // }
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
          console.log(data);
          this.getGradename = data.gradeName;
          console.log(this.getGradename);
        },
        error: (err: any) => { },
      });
  }

  buttondisable: boolean = false;

  // onOptionSelected(option: string, dropdownCategory: string) {
  //   this.appraisalData.designation = option;
  //   if (!option) {
  //     this.buttondisable = false;
  //   } else {
  //     this.buttondisable = true;
  //   }
  //   this.islistedItem = true;
  //   this.optionsFound = true;
  //   if (dropdownCategory === 'JobRole') {
  //     this.selectedValueJobRoledrop = option;
  //     this.gradeIdValue = this.getDesignationWithGradeIdDetails.find(
  //       (ele: { designationName: string }) =>
  //         ele.designationName == this.selectedValueJobRoledrop
  //     );
  //     console.log(this.gradeIdValue.gradeId);
  //     this.getGradeNameById();
  //   } else if (dropdownCategory === 'reportingtoUpdate') {
  //     this.selectedValueReportstodropUpdate = option;
  //     const selectedName = this.selectedValueReportstodropUpdate;
  //     const selectedObject = this.allempdata.find(
  //       ({ firstName, lastName }) => `${firstName} ${lastName}` === selectedName
  //     );
  //     if (selectedObject) {
  //       this.selectedValueReportstoEmployeeIddropUpdate =
  //         selectedObject.employeeId;
  //       console.log(this.selectedValueReportstoEmployeeIddropUpdate); // 2
  //     } else {
  //       console.log('Selected name not found');
  //     }
  //   } else if (dropdownCategory === 'businessareaUpdate') {
  //     this.selectedValuebusinessdropUpdate = option;
  //   } else if (dropdownCategory === 'jobroleUpdate') {
  //     this.selectedValueJobRoledropUpdate = option;

  //     this.gradeIdValue = this.getDesignationWithGradeIdDetails.find(
  //       (ele: { designationName: string }) =>
  //         ele.designationName == this.selectedValueJobRoledropUpdate
  //     );

  //     this.getGradeNameById();
  //   } else if (dropdownCategory === 'employmenttype') {
  //     this.selectedValueemployeementtypedropUpdate = option;
  //   } else if (dropdownCategory === 'employmenttypeupdate') {
  //     this.selectedValueEmployementtypedropInitial = option;
  //   } else if (dropdownCategory === 'countryCode') {
  //     this.selectedValuecontactnumberCountrydropdown = option;
  //   } else if (dropdownCategory === 'countryCodeUpdate') {
  //     this.selectedValuecontactnumberCountryCodeInitial = option;
  //   }
  // }


  
  onOptionSelected(event: any, dropdownCategory: string) {
    console.log('selectedOption event:', event);
  
    // If event is an object with `designationName`, extract the string:
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
      console.log(this.gradeIdValue?.gradeId);
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
        console.log(this.selectedValueReportstoEmployeeIddropUpdate);
      } else {
        console.log('Selected name not found');
      }
    }
    // ...rest of the dropdownCategory logic (same as yours)
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
      JobRole:['', Validators.required],
      Documenttype: [null, Validators.required],
      bonus: [0],
      isVariablePay: [null, Validators.required],
      variablePayAmount: ['', Validators.required],
      authorityid: [null, Validators.required]
    })
  }

}
