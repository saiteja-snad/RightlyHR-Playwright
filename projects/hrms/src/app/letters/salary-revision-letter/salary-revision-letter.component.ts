import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';

import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { IemployeeDetails } from '../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";

@Component({
  selector: 'app-salary-revision-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent],
  templateUrl: './salary-revision-letter.component.html',
  styleUrl: './salary-revision-letter.component.scss'
})
export class SalaryRevisionLetterComponent {
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
  ];
  subscription!: Subscription;
  appraisalTemplate: any | string | ArrayBuffer | null = null; //appraisal letter template
  appraisalData = {} as any; //appraisal letter form object
  result = {} as any;
  fusionEmpId: any;
  employeeiddetails = [] as any;
  employeeCompensationDetails = [] as any;
  AppraisalFile!: File;
  isdateofAppraisal: boolean = true;
  grossSalary = {} as any;
  employeedata = {} as any;
  Employeeinfo = {} as any;
  employeeJobDetails = {} as any; //to store the values of jobDetails
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  employeeFusionId = {} as any;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null;
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  Status: any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  employeeForm!: FormGroup;
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  // employeementType = [{ name: 'Permanent' }, { name: 'Contract' }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];
  constructor( private http: HttpService, private httpclient: HttpClient, 
    // private toaster: NgToastService,
     private router: Router, 
    private authService: AuthService,
    //  private _userAcessService: UserAccessService,
      private elementRef: ElementRef,private fb: FormBuilder,
    config: NgbModalConfig, private modalService: NgbModal) {
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
    if (dateofAppraisal <= probationEndDate) {
      this.isdateofAppraisal = false;
    } else {
      this.isdateofAppraisal = true;
    }
    console.log(this.appraisalData.dateofaddress);
    console.log(this.appraisalData.probationEndDate);
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.Employeeinfo = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    console.log(this.Employeeinfo);
    this.initializeForm();
    this.getAppraisalTemplate();
    this.getEmployeeId();
    this.getCompensationById;
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }
  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      dateofAppraisal: ['', Validators.required],
      Documenttype: ['', Validators.required],
      authorityid: ['', Validators.required]
     });
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

  gender: any;
  gender2: any;
  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.appraisalData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
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
      JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName +
         ' ' + authorityDesignationdata?.lastName)
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
    //console.log(this.authorityDetails);
    //console.log(this.prospectiveEmpData.authorityid);

    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == this.appraisalData.authorityid
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

  getAuthorityDetails() {
    let offertype = 'Appraisal Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
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

  previusSalary: any;
  incrementSalary: any;
  //get compensation details by empid
  getCompensationById(Employee: any) {
    // let EmployeeId = this.appraisalData.employeeId
    this.subscription = this.http
      .getData(`Compensationdata/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          // console.log(data);
          let res = data.reverse()[0];
          console.log(res);
          this.previusSalary = data[1];
          console.log(this.previusSalary);
          this.incrementSalary = res.compensationamount - this.previusSalary.compensationamount;
          console.log(this.incrementSalary);
        
          this.employeeCompensationDetails = res;
          this.appraisalData.salary = res.compensationamount;
          this.appraisalData.compeffectivedate = res.compeffectivedate;
          console.log(this.appraisalData);
          //CTC calculation stated
          Employee.grossby = 12;
          Employee.grossSalary = Math.round(
            res.compensationamount / Employee.grossby
          );
          this.grossSalary = Employee.grossSalary;
          if (this.appraisalData.pf == true || this.appraisalData.pf == false) {
            switch (this.appraisalData.pf) {
              case true:
            
                if (this.appraisalData.esic == false) {
                  Employee.pfContribution = Math.round(Employee.grossSalary * (6.719 / 100));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);
                } else if (Employee.grossSalary >= 23195) {
                  Employee.pfContribution = Math.round(Employee.grossSalary * (6.717 / 100));
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
          Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution);
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
  async postAppraisalLetterFormSubmit(f: NgForm) {
    const data = await this.appraisalData;
    data.dateofAppraisal = this.formatDate(data.dateofAppraisal);
    data.compeffectivedate = this.formatDate(data.compeffectivedate);
    console.log(data);
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
    }_${new Date().getTime()}_AppraisalLetter.pdf`;
    pdf.save(fileName);
    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    this.AppraisalFile = new File([blob], fileName, {
      type: 'application/pdf',
    });
    this.uploadAppraisalLetter();
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


  //to Upload Appraisal letter
  uploadAppraisalLetter() {
    let loggedInUser = this.authService.getToken();
    let filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.appraisalData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.AppraisalFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.dataSuccessMsg(
              'Salary revision Letter Generated Successfully'
            );
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
            compeffectivedate: `${
              this.appraisalData.compeffectivedate ?? 'N/A'
            }`,
            employeeId: this.appraisalData.employeeId,
            compensationamount: this.appraisalData.salary,
          };
          if (loggedInUser.middleName) {
            emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
          } else {
            emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
          }
          console.log(emaildetails);

          this.subscription = this.http
            .postdata(`CustomEmail/Appraisalletter`, emaildetails)
            .subscribe({
              next: (data: any) => {
                console.log(data);
                this.dataSuccessMsg('Email Sent Successfully');
              },
              error: (err: any) => {
                console.log(err);
              },
              complete: () => {},
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
    return moment(`${stringarray[2]}-${stringarray[1]}-${stringarray[0]}`,'YYYY-MM-DD');
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

  closeDropdown() {
    this.isDropdownOpen = false;
  }
  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
