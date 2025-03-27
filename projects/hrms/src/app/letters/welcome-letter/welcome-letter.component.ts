import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { DateformatPipe } from '../../pipes/dateformat.pipe';

@Component({
  selector: 'app-welcome-letter',
  imports: [CommonModule, LettersTabComponent, Select, ReactiveFormsModule],
  templateUrl: './welcome-letter.component.html',
  styleUrl: './welcome-letter.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class WelcomeLetterComponent {
  subscription!: Subscription;
  employeeiddetails = {} as any;
  bankloanLetterData = {} as any;
  fusionEmpId: any;
  employeeJobDetails = {} as any;
  bankLoanTemplate: any | string | ArrayBuffer | null = null; //bank loan letter template
  bankLoanFile!: File;
  isdateofbankloan: boolean = true;
  Employeeinfo={} as any;
  employeedata={} as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority:boolean=false;
  employeeForm!: FormGroup;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions=[] as any;
  herOrHimdata:any;
  hisOrHerdata:any;
  authorityName:any;
  signatureAuthorityName!:string |null
  authorityDesignation!:string|null;
  authorityDetails=[] as any;
  Status:any
  disablebuttonforemployeeid: boolean = false; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  loading: boolean = false;
  notemessage='';
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService:UserAccessService,
    private elementRef: ElementRef,private fb: FormBuilder,
    config: NgbModalConfig, private modalService: NgbModal
  ) { config.backdrop = 'static';
    config.keyboard = false;
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

  DateValidation(){
    if (this.bankloanLetterData.dateofbankloan <= this.bankloanLetterData.dateOfJoining) {
      this.isdateofbankloan = false;
    } else {
      this.isdateofbankloan = true;
    }
  }
  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    this.getEmployeeId();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }
  //get Welcome letter Authority list
 getAuthorityDetails() {
  const welcometype = 'Welcome Letter';
  this.subscription = this.http
  .getData(`SignaturesList?LetterType=${welcometype}`)
    .subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((employee: any) => {
          return {
            ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
            authorityName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            // selectedAllGroup: 'Group 1'
             // Concatenate first, middle (if present), and last name
          };
        });
      },
    });
}
  //function for issuedby
  getIssuedEmployeebyId(){
    this.employeedata=this.Employeeinfo.firstName+" "+this.Employeeinfo.lastName
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
  if(fusionemployeeId){
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.bankloanLetterData = {}
    this.bankloanLetterData = this.employeeiddetails.find(
      (c: any) => c.employeeId == fusionemployeeId
    );
    this.disablebuttonforemployeeid=true
    if(this.bankloanLetterData.workEmail){
      this.disablebuttonforemployeeid = false;
      this.notemessage='';
    }else{
      this.disablebuttonforemployeeid=true;
       this.notemessage='Note: Please add employee work email id before generating the letter'
    }
    console.log(this.bankloanLetterData.gender);
    if(this.bankloanLetterData.gender=='Male'){
      this.hisOrHerdata='his'
      this.herOrHimdata='him'
    }
    else if(this.bankloanLetterData.gender=='Female'){
      this.hisOrHerdata='her'
      this.herOrHimdata='her'
    }
   else if(this.bankloanLetterData.gender=='Other'){
    this.hisOrHerdata='his/her'
    this.herOrHimdata='him/her'
   }
    // this.getCompensationById(this.BankLoanLetterData)
    this.getJobdetails(this.bankloanLetterData);
    console.log(this.bankloanLetterData);
  }
   else{
    this.fusionEmpId=null;
    this.disablebuttonforemployeeid = false;
      this.notemessage='';
   }
    
    
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
//function to select authority name 
onclickauthority(ValueName:any){
  this.authorityName=ValueName
  console.log(this.authorityName);
  
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
  this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName + ' ' + authorityDesignationdata?.lastName))
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
    const signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.bankloanLetterData.authorityid)
    );
    console.log(signatureAuthorityDetails);
    this.bankloanLetterData.authorityName=signatureAuthorityDetails.authorityName;
    this.bankloanLetterData.designation=signatureAuthorityDetails.designation;
    this.bankloanLetterData.countrycode=signatureAuthorityDetails.countrycode;
    this.bankloanLetterData.workNumber=signatureAuthorityDetails.workNumber;
    this.bankloanLetterData.workEmail=signatureAuthorityDetails.workEmail
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
  //get employee ids for dropdown
  getEmployeeId() {
    const status = ['Active'];
    this.subscription = this.http
      .getData(`Employeedata/v1/Getallemployees?statuses=${status}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data.map((employee: any) => {
            return {
              ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
              fullName: `${
                employee.employeeId ? employee.employeeId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
              // selectedAllGroup: 'Group 1'
              // Concatenate first, middle (if present), and last name
            };
          });

          console.log(this.employeeiddetails);
        },
        error: (reason: any) => {

          console.log(reason);
        },
      });
  }
  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/${Employee.employeeId}`)
      .subscribe({
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


  async postBankLoanLetterFormSubmit(f: NgForm) {
    this.loading=true;
    const data = await this.bankloanLetterData;
    data.dateofbankloan = this.formatDate(data.dateofbankloan);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);

    console.log(data);

    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3}).then(canvas =>  {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
         const imgWidth = pdf.internal.pageSize.getWidth();
         console.log(imgWidth);
         const imgHeight = (canvas.height * imgWidth) / canvas.width;
         console.log(imgHeight)
         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight,'','FAST');
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_WelcomeLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        console.log(blob);
            //creating form file to upload into AZure
      let d: Date = new Date()
      this.bankLoanFile = new File(
        [blob],
        fileName,
        {
          type: 'application/pdf',
        }
      );
        this.uploadBankLoanLetter();
      });
    }
  }

  //to Upload Appraisal letter
  uploadBankLoanLetter() {
    const filePath =`/FusionDocuments/Employee Documents/Welcome Letters/${this.bankloanLetterData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.bankLoanFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.emailToEmployee();
          }
        },
        error: (reason: any) => {
          console.log(reason);
        this.dataFailureMsg('file upload  is failed');
        },
      });
  }

//function to send email to the employee
emailToEmployee(){
const payload={
  employeeId:this.bankloanLetterData.employeeId
}
  this.subscription=this.http.postdata(`CustomEmail/generatewelcomeemail/${this.bankloanLetterData.employeeId}`,payload).subscribe({
    next:(data:any)=>{
      console.log(data);
      this.dataSuccessMsg('Welcome Letter Generated Successfully')
      // this.toaster.success({
      //   detail: 'SUCCESS',
      //   summary: 'Bank Loan Letter Generated Successfully',
      //   duration: 5000,
      // });
      this.router.navigate(['/admin']);
    },
    error:(err:any)=>{
      console.log(err);
    },
    complete:()=>{
      this.loading=false;
    }
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
      `${parseInt(stringarray[2])}-${parseInt(stringarray[1])}-${parseInt(stringarray[0]) + 1
      }`
    );
  }
  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: [null, Validators.required],
      note: ['', [Validators.required, Validators.maxLength(250)]],
      authorityid: [null, Validators.required],
    });
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

