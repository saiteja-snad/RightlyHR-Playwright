import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { NgForm } from '@angular/forms';
import { IAddress, IDepartment, IemployeeDetails, IIssuelocation, IMake } from './appointment-letter-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-appointment-letter',
  imports: [CommonModule, LettersTabComponent, Select, DateformatPipe],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})

export class AppointmentLetterComponent {
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Full-Time' },
    { id: 2, name: 'Part-Time' },
    { id: 3, name: 'Contract' },
    { id: 4, name: 'Internship' }
  ];

  designation: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'HR Executive' },
    { id: 4, name: 'Data Analyst' }
  ];

  location: { id: number; name: string }[] = [
    { id: 1, name: 'New York' },
    { id: 2, name: 'Los Angeles' },
    { id: 3, name: 'Chicago' },
    { id: 4, name: 'Houston' }
  ];

  sublocation: { id: number; name: string; locationId: number }[] = [
    { id: 1, name: 'Brooklyn', locationId: 1 },
    { id: 2, name: 'Downtown', locationId: 1 },
    { id: 3, name: 'Hollywood', locationId: 2 },
    { id: 4, name: 'South Side', locationId: 3 }
  ];

  employees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mark Taylor' },
    { id: 4, name: 'Emily Johnson' }
  ];

  selectedEmployee: any;
  @ViewChild('success') success: any;

  // constructor(private router: Router, private modalService: NgbModal) { }

  // ngOnInit(): void {

  // }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  subscription!: Subscription;
  employeeiddetails = [] as any;
  employeeiddetailsauthorityName = [] as any;
  departmentDetails = [] as any;
  appointmentletter = {} as any;
  fusionEmployeeId: any
  makeDetails = [] as any;
  empinfo = {} as any;
  appointmentLetterTemplate: any | string | ArrayBuffer | null = null; //appoinment letter template
  employeeJobDetails = {} as any; //to store the values of jobDetails
  employeeCompensationDetails = {} as any; //to store the values of compensationDetails
  isvalidate = {} as any;
  DateValid: boolean = true;
  JoinDateValid: boolean = true;
  currentDate: Date = new Date();
  AppointmentFile!: File;
  issueLocationdata = [] as any;
  grossby = {} as any;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  activeemp = [] as any[];
  Active!: number;
  AssertTypeGet = [] as any;
  parentStyle = { 'width': '400px' };
  employeeIdNameDetails = [] as any;
  selectedValueInitially = ''
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  // employeeFusionId={}as any;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  EmployeeName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  employeeaddress = [] as any;
  SelectDropDown: any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Status: any;
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this._userAcessService.checkRouteAccess('Dashboard.view')
    this.appointmentletter.branchCode = null
    this.appointmentletter.department = null
    this.fusionEmployeeId = null
    this.appointmentletter.make = null
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    this.getEmployeeId();
    this.getDepartment();
    this.getMakeDropDown();
    this.getIssueLocation();
    this.getIssuedEmployeebyId();
    this.getAssertType();
    this.getAuthorityDetails();
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
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
  //function for assert type get
  getAssertType() {
    this.subscription = this.http.getData(`AssetType`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.AssertTypeGet = data;
      }
    })
  }
  //function for issedby
  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " + this.Employeeinfo.lastName
    console.log(this.employeedata);
  }
  Onclickemployeeid(Value: any) {
    console.log(Value);
    if (Value == "") {
      this.disablebuttonforemployeeid = true
    }
    else {
      this.disablebuttonforemployeeid = false
    }
    let employeeinfo = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == Value
    );
    console.log(employeeinfo);
    if (Value != employeeinfo && employeeinfo != undefined) {
      this.disablebuttonforemployeeid = false
    }

  }
  Onclick(fusionemployeeId: any) {
    this.fusionEmployeeId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.appointmentletter = {}
    this.appointmentletter = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
    );
    this.disablebuttonforemployeeid = true
    this.appointmentletter.dateOfJoining = this.formatDatewithDate(this.appointmentletter.dateOfJoining)
    this.appointmentletter.isVariablePay = this.appointmentletter.isVariablePay
    this.appointmentletter.variablePayAmount = this.appointmentletter.variablePayAmount
    this.getJobdetails(this.appointmentletter);
    this.getCompensationDetails(this.appointmentletter.employeeId);
    this.getEmployeeAddress(this.appointmentletter.employeeId)
    this.getIdentityByEmpid(this.appointmentletter.employeeId)
    console.log(this.appointmentletter);
    // this.appointmentletter=this.departmentDetails
    // console.log(this.departmentDetails);
  }

  // //function to get the pan nuber
  //get identity function
  panDetails: any
  getIdentityByEmpid(Value: any) {
    let EmployeeId = Value
    this.subscription = this.http.getData(`IdentityTable/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.panDetails = data.filter((item: { identityType: string; }) => item.identityType === 'PAN');
        console.log(this.panDetails);

      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }

  //function to get the address 
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value
    console.log(Value);

    console.log(EmployeeId);

    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeaddress = data as IAddress[];
      }
    })
  }
  //function to select the current address 
  address = {} as IAddress;
  onclickSelectAddress(Value: any) {
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value)

    }
    console.log(this.address);
    this.appointmentletter.addressLine1 = this.address.addressLine1
    this.appointmentletter.addressLine2 = this.address.addressLine2
    this.appointmentletter.city = this.address.city
    this.appointmentletter.state = this.address.state
    this.appointmentletter.country = this.address.country
    this.appointmentletter.pinCode = this.address.zipCode


  }
  //toggledropdown to open and close the dropdown list
  // toggleDropdown() {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  //   if (this.isDropdownOpen) {

  //   } else {
  //     this.filteredOptions = [];
  //   }
  // }
  toggleDropdown(dropcategory: any) {
    if (dropcategory == 'authority') {
      this.isDropdownOpenauthority = !this.isDropdownOpenauthority;
      if (this.isDropdownOpenauthority) {

      } else {
        this.filteredOptions = [];
      }
    }
    else if (dropcategory == 'empid') {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {

      } else {
        this.filteredOptions = [];
      }
    }

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
  authorityName: any
  onclickauthority(valueName: any) {
    this.authorityName = valueName
    if (this.authorityName == "") {
      this.disablebuttonforauthority = true
    }
    else {
      this.disablebuttonforauthority = false
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.lastName === valueName
    );
    console.log(authorityDesignationdata);
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName))
    console.log(this.authorityDesignation);
    if (this.authorityName) {

      if (this.authorityName === this.signatureAuthorityName) {
        this.disablebuttonforauthority = true
      }
      else {
        this.disablebuttonforauthority = false
      }
    }
    if (authorityDesignationdata == undefined) {
      this.authorityDesignation = null
      this.signatureAuthorityName = null
      console.log(this.authorityDesignation);
    }
  }
  //function to block the special charecterstics
  blockSpecialCharacters(event: KeyboardEvent) {
    const blockedCharacters = /[^a-zA-Z0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (blockedCharacters.test(inputChar)) {
      event.preventDefault(); // Block the input of the character 
    }
  }
  onclickDesignation() {
    //console.log(this.authorityDetails);
    //console.log(this.prospectiveEmpData.authorityid);

    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.appointmentletter.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.appointmentletter.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.appointmentletter.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
      this.appointmentletter.authorityName = ''
      this.authorityDesignation = ''
    }
  }
  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Appointment Letter'
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetails = data
      }
    })
  }
  private formatDatewithDate(date: Date): string | void {
    if (date) {

      return moment(date).format('YYYY-MM-DD');
    }

  }

  //function for the date validations
  Appointmentletterdatevalidation() {

    let date = this.appointmentletter.offerIssueddate
    console.log(date);
    let date2 = this.appointmentletter.appointmentdate
    console.log(date2);
    if (date >= date2) {
      this.DateValid = false
    }
    else {
      this.DateValid = true
    }

  }

  //function for the Joining date validation
  JoiningDateValidation() {
    let Joindate = this.appointmentletter.appointmentdate
    console.log(Joindate);
    let Joindate2 = this.appointmentletter.dateOfJoining
    console.log(Joindate2);
    if (Joindate >= Joindate2) {
      this.JoinDateValid = false
    }
    else {
      this.JoinDateValid = true
    }
  }


  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let res = data[0];
          this.employeeJobDetails = res;
          console.log(this.employeeJobDetails);

          Employee.jobRole = res.jobRole;

          Employee.workLocation = res.lopcation;
          Employee.subLocation = res.subLocation;
          console.log(Employee.workLocation);

          console.log(Employee.jobRole);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  //get Compensation Details by empployeeid

  getCompensationDetails(employeeId: any) {
    let Employee = employeeId
    console.log(Employee)
    this.subscription = this.http
      .getData(`Compensationdata/${Employee}`)
      .subscribe({
        next: (data: any) => {
          let res = data.reverse()[0];
          this.employeeCompensationDetails = res;
          console.log(this.employeeCompensationDetails)
          this.appointmentletter.variablePayAmount = res?.variablePayAmount
          this.appointmentletter.isVariablePay = res?.isVariablePay

          Employee.salary = res.compensationamount;
          console.log(Employee.salary);

          //CTC calculation stated
          Employee.grossby = 12
          Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
          //this.grossSalary = Employee.grossSalary
          console.log(Employee.grossby);
          console.log(Employee.grossSalary);
          console.log(this.appointmentletter);

          console.log(this.appointmentletter.pf);
          if (this.appointmentletter.pf == true || this.appointmentletter.pf == false) {
            switch (this.appointmentletter.pf) {

              case true:
                if (this.appointmentletter.esic == false) {
                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));

                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);

                }
                else if (Employee.grossSalary >= 23195) {

                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));


                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);

                }

                // else if (Employee.grossSalary >! 1800) {

                //   Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
                //   console.log(Employee.pfContribution);
                // }
                else if (Employee.grossSalary <= 23195) {

                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);

                }

                else {
                  if (Employee.grossSalary <= 15000) {
                    Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                    console.log(Employee.pfContribution);
                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                    console.log(Employee.pfContribution);
                  }
                  else if (Employee.grossSalary <= 23195) {

                    Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                    console.log(Employee.pfContribution);

                  }
                  else if (Employee.grossSalary >= 23195) {

                    Employee.pfContribution = Math.round((Employee.grossSalary * (6.717 / 100)));


                    if (Employee.pfContribution >= 1800) {
                      Employee.pfContribution = 1800;
                    }
                    console.log(Employee.pfContribution);

                  }
                }

                break;
              case false:
                Employee.pfContribution = 0;
                console.log(Employee.pfContribution);

                break;
              default:
            }

          }
          else {
            Employee.pfContribution = 0;
          }
          //=====================================================================================================================
          //claculation for ESIC Employeer
          // if (this.appointmentletter.esic == true || this.appointmentletter.esic == false) {
          // switch (this.appointmentletter.esic) {
          //   case true:
          if (this.appointmentletter.esic == true) {
            let condition1 = (Employee.grossSalary >= 23195)
            if (!condition1) {
              Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
              console.log(Employee.esicContribution);
              this.appointmentletter.esic = true
            }
            else {
              Employee.esicContribution = 0
              this.appointmentletter.esic = false
              console.log(Employee.esicContribution);
            }
          }
          else {
            Employee.esicContribution = 0
            this.appointmentletter.esic = false
            console.log(Employee.esicContribution);
          }

          //     break;
          //   case false:
          //     let condition2 = (Employee.grossSalary >= 23195)
          //     if (!condition2) {
          //       // Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
          //       // console.log(Employee.esicContribution);
          //       Employee.esicContribution = 0
          //       console.log(Employee.esicContribution);
          //     }
          //     else {
          //       Employee.esicContribution = 0
          //       console.log(Employee.esicContribution);

          //     }
          // //     Employee.employeeEsi = 0
          // // console.log(Employee.employeeEsi);
          //     break;
          //   default:
          // }
          // }
          // else {
          //   Employee.esicContribution = 0
          //   console.log(Employee.esicContribution);

          // }
          // ========================================================================================
          //condtitions for professionaltax calulation.
          // if (this.appointmentletter.pt == true) {
          // switch (this.appointmentletter.pt) {
          // case true:
          if (Employee.grossSalary < 15000) {
            Employee.professionalTax = 0
            this.appointmentletter.pt = false
            console.log(Employee.professionalTax);

          }
          else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
            Employee.professionalTax = 150;
            this.appointmentletter.pt = true
            console.log(Employee.professionalTax);

          }
          else if (Employee.grossSalary >= 21000) {
            Employee.professionalTax = 200;
            console.log(Employee.professionalTax);
            this.appointmentletter.pt = true

          }
          else {
            Employee.professionalTax = 0;
            this.appointmentletter.pt = false
            console.log(Employee.professionalTax);

          }
          //   break;
          // case false:
          //   Employee.professionalTax = 0;
          // }
          // }
          // else {
          //   Employee.professionalTax = 0;
          // }


          //calcution for the totalgrosssalary
          Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
          console.log(Employee.totalGrossSalary);
          //claculation for ESIC for employee

          // if (this.appointmentletter.esic == false || this.appointmentletter.esic == true) {
          //   console.log(this.appointmentletter.esic);

          //   switch (this.appointmentletter.esic) {

          // case true:
          if (this.appointmentletter.esic == true) {
            if (Employee.totalGrossSalary <= 21000) {

              Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
              console.log(Employee.employeeEsi);
              this.appointmentletter.esic = true
            }
            else {
              Employee.employeeEsi = 0
              this.appointmentletter.esic = false
            }
          }
          else {
            Employee.employeeEsi = 0
            this.appointmentletter.esic = false
          }

          //     break;
          //   case false:
          //     if (Employee.totalGrossSalary >= 23195) {
          //       Employee.employeeEsi = 0;
          //     }
          //     else if (Employee.totalGrossSalary <= 21000) {
          //       // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
          //       // console.log(Employee.employeeEsi);
          //       Employee.employeeEsi = 0
          //       console.log(Employee.employeeEsi);
          //     }
          //     else {
          //       Employee.employeeEsi = Math.round(Employee.totalGrossSalary * 2.94) / 100;
          //     }

          //     break;
          //   default:
          // }

          // }
          // else {
          //   Employee.employeeEsi = 0
          //   console.log(Employee.employeeEsi);

          // }

          //===========================================================================================================
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



        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //function to get make dropdown
  getMakeDropDown() {
    this.subscription = this.http.getData('Make').subscribe({
      next: (data: any) => {
        console.log(data);
        this.makeDetails = data as IMake[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  //function to get isssuelocation drop down
  getIssueLocation() {
    this.subscription = this.http.getData(`BranchLocation`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.issueLocationdata = data as IIssuelocation
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }
  //get employee ids for Active Employees Drop Dowm

  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IemployeeDetails[];
          console.log(this.employeeiddetails);
          this.employeeiddetailsauthorityName = data as IemployeeDetails[];
          //  this.EmployeeName=this.employeeiddetails.firstName+" "+this.employeeiddetails.lastName

        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }
  //function to get department dropdown
  getDepartment() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log(data);
        this.departmentDetails = data as IDepartment[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  //to fromat Date
  private formatDate(dateString: Date): string | void {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
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
  isLoading: boolean = false;
  async onAppointmentLetterSubmit(f: NgForm) {

    const data = this.appointmentletter;
    //data.dateOfJoining = this.formatDate(data.dateOfJoining);
    //data.appointmentdate = this.formatDate(data.appointmentdate);

    console.log(data);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();

    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5', 'pdfContent6', 'pdfContent7',
      'pdfContent8', 'pdfContent9', 'pdfContent10', 'pdfContent11', 'pdfContent12', 'pdfContent13']; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];
    this.isLoading = true;

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
      pdf.addImage(
        imageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        imageData.imgHeight,
        '',
        'FAST'
      );
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }

    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(
        lastImageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        lastImageData.imgHeight,
        '',
        'FAST'
      );
    }
    const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AppointmentLetter_Unsigned.pdf`;
    pdf.save(fileName);

    const blob = pdf.output('blob');
    console.log(blob);
    //creating form file to upload into AZure
    this.AppointmentFile = new File(
      [blob],
      fileName,
      {
        type: 'application/pdf',
      }
    );

    this.sendEmployeeDetails();
    // this.UpdateJobDetails();
    this.postAssetDetails();
    this.uploadAppointLetter();
    // this.updateEmployeedetails();
    //this.uploadAppointLetter();

  }

  //update pt esic in emploee details
  updateEmployeedetails() {
    let empdata = {
      // "pf": true,
      // "esic": true,
      pt: this.appointmentletter.pf,
      generateOffer: false

    }
    console.log(empdata);
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, empdata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //Update Employee details along with Appointment details
  sendEmployeeDetails() {
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', this.appointmentletter)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //to send JobDetails with Department
  UpdateJobDetails() {
    this.employeeJobDetails.department = this.appointmentletter.department;
    this.subscription = this.http
      .postdata('JobDetails/UPDATER', this.employeeJobDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //to Upload Appoinment letter
  uploadAppointLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Appointment Letter/${this.appointmentletter.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.AppointmentFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postAppointmentDetails(data.path);
            this.AppointmentLetterEmail(data.path);
            console.log(data);

          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');
        },
      });
  }

  //Post Appointment Details
  postAppointmentDetails(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let postAppDetails = {
      empid: this.appointmentletter.employeeId,
      appointmentSentDate: this.appointmentletter.appointmentdate,
      appointmentSentStatus: 'Document Sent',
      appointmentSentBy: loggedInUser.employeeId,
      documentUrl: docUrl,
    };
    console.log(postAppDetails);
    this.subscription = this.http
      .postdata('AppointmentLetter', postAppDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.dataSuccessMsg('Appointment Letter Generated Successfully')
          this.router.navigate(['/admin']);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }


  //appointment letter email
  AppointmentLetterEmail(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      senderEmail: loggedInUser.workEmail,
      personEmail: this.appointmentletter.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      personName: `${this.appointmentletter.firstName ?? ""} ${this.appointmentletter.middleName ?? ""} ${this.appointmentletter.lastName ?? ""}`,
      appointee: `${this.appointmentletter.firstName} ${this.appointmentletter.middleName} ${this.appointmentletter.lastName}`,
      role: this.appointmentletter.jobRole,
      department: this.appointmentletter.department,
      workLocation: this.appointmentletter.workLocation + ", " + this.appointmentletter.subLocation,
      documentUrl: docUrl,
      employeeId: this.appointmentletter.employeeId,
      dateOfJoining: this.appointmentletter.dateOfJoining,
      reportingManagerId: this.employeeJobDetails.reportsto,
      teamManagerId: this.employeeJobDetails.reportingmanagerId,
      reportingManagerName: `${this.employeeJobDetails.fName} ${this.employeeJobDetails.mName} ${this.employeeJobDetails.lName}`,
      teamManagerName: `${this.employeeJobDetails.firstName} ${this.employeeJobDetails.middleName} ${this.employeeJobDetails.lastName}`
    }

    if (loggedInUser.middleName) {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    } else {
      emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
      emaildetails.appointee = `${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    console.log(emaildetails);
    this.subscription = this.http.postdata(`CustomEmail/appointmentletter`, emaildetails).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dataSuccessMsg('Email Sent Successfully')
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //Post Asset Details
  postAssetDetails() {
    let postAssetDetails = {
      empid: this.appointmentletter.employeeId,
      assetType: this.appointmentletter.asserttype,
      maker: null,
      model: this.appointmentletter.model,
      serialNumber: this.appointmentletter.serial,
    };
    console.log(postAssetDetails);

    this.subscription = this.http
      .postdata('AssetTable', postAssetDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);


        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
