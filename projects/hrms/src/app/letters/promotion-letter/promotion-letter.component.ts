import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";

@Component({
  selector: 'app-promotion-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent],
  templateUrl: './promotion-letter.component.html',
  styleUrl: './promotion-letter.component.scss'
})
export class PromotionLetterComponent {
  subscription!: Subscription;
  appraisalData = {} as any; 
  PromotionTemplate: any | string | ArrayBuffer | null = null; //appraisal letter template
  promotiondata = {} as any; //appraisal letter form object
  result = {} as any;
  fusionEmpId: any
  employeeiddetails = [] as any;
  employeeCompensationDetails = [] as any;
  PromotionFile!: File;
  isdateofpromotion: boolean = true;
  grossSalary = {} as any;
  employeedata = {} as any;
  Employeeinfo = {} as any;
  jobRole: any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority:boolean=false;
  employeeFusionId={}as any;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions=[] as any;
  authorityName:any;
  signatureAuthorityName!:string |null
  authorityDesignation!:string|null;
  authorityDetails=[] as any;
  authoritydetails=[] as any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  Status:any
  employeeForm!: FormGroup;
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  // employeementType = [{ name: 'Permanent' }, { name: 'Contract' }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    // private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

  }
  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }
  DateValidation() {
    const dateofpromotion = new Date(this.promotiondata.dateofpromotion);
    const probationEndDate = new Date(this.promotiondata.probationEndDate);
  
    if (dateofpromotion <= probationEndDate) {
      this.isdateofpromotion = false;
    } else {
      this.isdateofpromotion = true;
    }
    console.log(this.promotiondata.dateofpromotion);
    console.log(this.promotiondata.probationEndDate);
  }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    // this.getPromotionTemplate();
    this.initializeForm();
    this.getEmployeeId();
    this.getAuthorityDetails();
    this.getIssuedEmployeebyId();
  }

  initializeForm() {
    this.employeeForm = this.fb.group({   
      fusionEmpId: ['', Validators.required],
      dateofpromotion: ['', Validators.required],
      Documenttype: ['', Validators.required],
      note: ['',],
      authorityid: ['', Validators.required],
     })
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

  //function for issed by
  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName
    console.log(this.employeedata);
  }

  //function for disabling the incorrect employeeid
Onclickemployeeid(Value:any){
  if(Value==""){
    this.disablebuttonforemployeeid=true
  }
  else{
    this.disablebuttonforemployeeid=false
  }
}

  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.promotiondata = {}
    this.promotiondata = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId.fusionEmpId
    );
   this.disablebuttonforemployeeid=true
    this.getCompensationById(this.promotiondata);
    this.getJobDetails(this.promotiondata)


    console.log(this.promotiondata);
  }
  //get jobdetails
  getJobDetails(Employee:any){
    let EmployeeId = parseInt(this.promotiondata.employeeId)
    console.log(EmployeeId);

    this.subscription = this.http.getData(`JobDetails/Empname/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        ///let jobdetails = data.reverse();
        Employee.jobRole = data[0].jobRole
        console.log(Employee.jobRole);
      }
    })
  }
  //toggledropdown to open and close the dropdown list
toggleDropdown(dropcategory:any) {
  if (dropcategory == 'empid') {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {

    } else {
      this.filteredOptions = [];
    }
  }
  else if (dropcategory == 'authority') {
    this.isDropdownOpenauthority = !this.isDropdownOpenauthority;
    if (this.isDropdownOpenauthority) {

    } else {
      this.filteredOptions = [];
    }
  }
}
onclickauthority(ValueName:any){
  this.authorityName=ValueName
  if(this.authorityName==""){
    this.disablebuttonforauthority=true
  }
  else{
    this.disablebuttonforauthority=false
  }
  let authorityDesignationdata = this.authorityDetails.find(
    (c: any) => 
    c.firstName+' '+c.middleName+' '+c.lastName === ValueName
  ); 
  console.log(authorityDesignationdata);
  this.authorityDesignation = authorityDesignationdata?.designation;
  this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' '+authorityDesignationdata?.middleName+' ' + authorityDesignationdata?.lastName))
  console.log(this.authorityDesignation);
  if (this.authorityName) {
   
    if( this.authorityName===this.signatureAuthorityName){
      this.disablebuttonforauthority=true
    }
    else{
      this.disablebuttonforauthority=false
    }
   } 
  if(authorityDesignationdata==undefined){
    this.authorityDesignation =null
    this.signatureAuthorityName= null
    console.log(this.authorityDesignation);
  }
  }
  onclickDesignation(){
    //console.log(this.authorityDetails);
    //console.log(this.prospectiveEmpData.authorityid);
  
    let signatureAuthorityDetails = this.authoritydetails.find(
      (c: any) => (c.employeeId == this.promotiondata.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.promotiondata.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.promotiondata.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else if(signatureAuthorityDetails==undefined||signatureAuthorityDetails==null){
      this.promotiondata.authorityName =''
      this.authorityDesignation=''
    }
  }
  //get offer letter Authority list 

getAuthorityDetails() {
  let offertype = 'Promotion Letter';
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
  //get compensation details by empid
  getCompensationById(Employee: any) {
    // let EmployeeId = this.promotiondata.employeeId
    this.subscription = this.http.getData(`Compensationdata/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let res = data.reverse()[0];
        console.log(data);
        this.employeeCompensationDetails = res;
        Employee.salary = res.compensationamount
        console.log(Employee.salary);
        
        Employee.compeffectivedate = res.compeffectivedate
        console.log(Employee.compeffectivedate);

        console.log(this.promotiondata);
        Employee.grossby = 12
        Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
        this.grossSalary = Employee.grossSalary
        console.log(this.grossSalary);
        console.log(Employee.grossby);
        console.log(Employee.grossSalary);
        console.log(this.promotiondata);
        console.log(this.promotiondata.pf);
        if (this.promotiondata.pf == true || this.promotiondata.pf == false) {
          switch (this.promotiondata.pf) {
            case true:
              if(this.promotiondata.esic==false){
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
              else {
                Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));
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
          console.log(this.promotiondata.pf);
        }
        //claculation for ESIC employer

        if (this.promotiondata.esic == false || this.promotiondata.esic == true) {
          console.log(this.promotiondata.esic);
          switch (this.promotiondata.esic) {
            case true:
              let condition1 = (Employee.grossSalary >= 23195)
              if (!condition1) {
                Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
                console.log(Employee.esicContribution);
              }
              else {
                Employee.esicContribution = 0
                console.log(Employee.esicContribution);
              }
              break;
            case false:
              let condition2 = (Employee.grossSalary >= 23195)
              if (!condition2) {
                // Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
                // console.log(Employee.esicContribution);
                Employee.esicContribution = 0
                this.promotiondata.esic == false
                console.log(Employee.esicContribution);
              }
              else {
                Employee.esicContribution = 0
                this.promotiondata.esic == false
                console.log(Employee.esicContribution);
              }
              break;
            default:
          }

        }
        else {
          Employee.esicContribution = 0
          console.log(Employee.esicContribution);
        }
         //calcution for the totalgrosssalary
        Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
        console.log(Employee.totalGrossSalary);
        //claculation for ESIC for employee
        if (this.promotiondata.esic == false || this.promotiondata.esic == true) {
          console.log(this.promotiondata.esic);
          switch (this.promotiondata.esic) {
            case true:
              if (Employee.totalGrossSalary <= 21000) {
                Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
                console.log(Employee.employeeEsi);
              }
              else {
                Employee.employeeEsi = 0
                this.promotiondata.esic == false
              }
              break;
            case false:
              if (Employee.totalGrossSalary >= 23195) {
                Employee.employeeEsi = 0;
                this.promotiondata.esic == false
              }
              else if (Employee.totalGrossSalary <= 21000) {
                // Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
                // console.log(Employee.employeeEsi);
                Employee.employeeEsi = 0
                this.promotiondata.esic == false
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
      }
    })
  }


  //get employee ids for dropdown
  getEmployeeId() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data;

          console.log(this.employeeiddetails);
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

  async postPromotionLetterFormSubmit(f: FormGroup) {
    const data = await this.promotiondata;
    console.log(data);

    data.dateofAppraisal = this.formatDate(data.dateofpromotion);
    data.compeffectivedate = this.formatDate(data.compeffectivedate);
    console.log(data);

    const pdfContent = document.getElementById('pdfContent1');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        console.log(imgWidth);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        console.log(imgHeight)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_Promotion_Letter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        console.log(blob);
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.PromotionFile = new File(
          [blob],
          fileName,
          {
            type: 'application/pdf',
          }
        );
        this.uploadPromotionLetter();
      });
    }
  }

  //Update Employee details along with Appraisal details
  sendEmployeeDetails() {
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', this.promotiondata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  uploadPromotionLetter() {

    let filePath = `/FusionDocuments/Employee Documents/Appraisal Letters/${this.promotiondata.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.PromotionFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.result.documentUrl = data.path;
            this.dataSuccessMsg("Promotion Letter Generated Successfully")
            
            console.log(data);
          }
          let loggedInUser = this.authService.getToken();
          console.log(loggedInUser);

          let emaildetails={
            personEmail:this.promotiondata.workEmail,
            senderName:`${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
            senderEmail:loggedInUser.workEmail,
            firstName:this.promotiondata.firstName,
            lastName:this.promotiondata.lastName,
            middleName:this.promotiondata.middleName,
            jobRole:this.promotiondata.jobRole,
            documentUrl:this.result.documentUrl,
            // compeffectivedate:this.formatDatebyDatestring(this.promotiondata.compeffectivedate),
            compeffectivedate: `${
              this.promotiondata.compeffectivedate ?? 'N/A'
            }`,
            employeeId:this.promotiondata.employeeId,
            compensationamount:this.promotiondata.salary
          }

          if(loggedInUser.middleName){

            emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
            
          }else{
            emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.lastName}`
           
          }
          console.log(emaildetails);

          this.subscription=this.http.postdata(`CustomEmail/Promotionletter`,emaildetails).subscribe({
            next:(data:any)=>{
              console.log(data);
              this.dataSuccessMsg("Email Sent Successfully")
              this.router.navigate(['/admin/active']);
            },
            error:(err:any)=>{
              console.log(err);


            },
            complete:()=>{

            }
          })
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');
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
  //to fromat Date
  private formatDate(dateString: Date): string {
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
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
