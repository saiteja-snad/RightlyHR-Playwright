import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IemployeeDetails } from '../../Interfaces/letters-model';


@Component({
  selector: 'app-bank-loan-letter',
  imports: [CommonModule,Select, CountryCodePhoneNumberComponent,ReactiveFormsModule,DateformatPipe],
  templateUrl: './bank-loan-letter.component.html',
  styleUrl: './bank-loan-letter.component.scss'
})
export class BankLoanLetterComponent {
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
  //employeeFusionId={}as any;
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
  employeeForm!: FormGroup;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  employees = [{ name: 'John Doe', id: 1 }, { name: 'Jane Smith', id: 2 }];
  // employeementType = [{ name: 'Permanent' }, { name: 'Contract' }];
  location = [{ name: 'New York' }, { name: 'Los Angeles' }];
  sublocation = [{ name: 'Branch 1' }, { name: 'Branch 2' }];
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    // private toaster: NgToastService,
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

DateValidation() {
  const dateofbankloan = new Date(this.bankloanLetterData.dateofbankloan);
  const joiningDate = new Date(this.bankloanLetterData.dateOfJoining);

  if (dateofbankloan <= joiningDate) {
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
    this.getBankLoanTemplate();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }
  initializeForm() {
    this.employeeForm = this.fb.group({
      searchEmployee: ['', Validators.required],
      documentType: ['', Validators.required],
      dateofbankloan: ['', Validators.required],
      signatureAuthority: ['', Validators.required]
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
  
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.bankloanLetterData = {}
    this.bankloanLetterData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
    );
    this.disablebuttonforemployeeid=true
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
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.bankloanLetterData.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.bankloanLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.bankloanLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else if(signatureAuthorityDetails==undefined||signatureAuthorityDetails==null){
      this.bankloanLetterData.authorityName =''
      this.authorityDesignation=''
    }
  }
//get offer letter Authority list 
getAuthorityDetails(){
  let offertype='Bank Loan Letter'
  this.subscription=this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
    next:(data:any)=>{
      console.log(data);
      this.authorityDetails=data
    }
  })
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
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeeiddetails = data as IemployeeDetails[];

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
  //to get BankLoan letter template
  async getBankLoanTemplate() {
    this.bankLoanTemplate = await this.httpclient
      .get('assets/Bank_Loan_Letter.docx', {
        responseType: 'arraybuffer',
      })
      .toPromise();
  }
  
  async postBankLoanLetterFormSubmit(f: NgForm) {
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
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_BankLoanLetter.pdf`;
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
    let filePath =`/FusionDocuments/Employee Documents/BankLoan Letters/${this.bankloanLetterData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.bankLoanFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.dataSuccessMsg('Bank Loan Letter Generated Successfully')
            this.router.navigate(['/admin/active']);
            console.log(data);
          }
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
  closeDropdown() {
    this.isDropdownOpen = false;
}
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
