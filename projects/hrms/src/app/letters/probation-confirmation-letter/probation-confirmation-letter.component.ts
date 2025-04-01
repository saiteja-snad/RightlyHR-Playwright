import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, IaddressemployeeDetails, IProbationEmployees } from '../../Interfaces/letters-model';
import { Subscription } from 'rxjs';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";

@Component({
  selector: 'app-probation-confirmation-letter',
  imports: [CommonModule, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule, DateformatPipe, LettersheaderComponent],
  templateUrl: './probation-confirmation-letter.component.html',
  styleUrl: './probation-confirmation-letter.component.scss'
})
export class ProbationConfirmationLetterComponent {
  employeementType: { name: string, value: boolean }[] = [
    // { name: 'Select', value: false },
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];

  designation: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'HR Executive' },
    { id: 4, name: 'Data Analyst' }
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
  employeeForm!: FormGroup;
  subscription!: Subscription;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority:boolean=false;
  employeeiddetails = [] as any;
  probationemp=[] as any;
  employeeJobDetails = {} as any;
  fusionEmpId: any;
  probationLetterData={} as any;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions=[] as any;
  authorityName:any;
  signatureAuthorityName!:string |null
  authorityDesignation!:string|null;
  authorityDetails=[] as any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  SelectDropDown: any;
  employeeaddress=[] as any;
  isdateofaddress: boolean = true;
  probationTemplate: any | string | ArrayBuffer | null = null; //probation letter template
  Employeeinfo={} as any;
  employeedata={} as any;
  probationFile!: File;
  isdateofprobation: boolean = true;
  SignatureAuthorityValue:any;
  disableFieldsForApproval:boolean=true;
  loading:boolean=false;
  todayDate!: string;
  Status:any;
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  constructor(
    private http: HttpService,
    // private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService:UserAccessService,
    private elementRef: ElementRef,
    private httpclient: HttpClient,
    config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
   }
   
   navigateDashboard() {
    this.router.navigate(['/admin/probation-employees'])
  }
   DateValidation() {
    if (this.probationLetterData.dateofprobation <= this.probationLetterData.probationEndDate) {
      this.isdateofprobation = false;
    } else {
      this.isdateofprobation = true;
    }
    console.log(this.probationLetterData.dateofprobation);
    console.log(this.probationLetterData.probationEndDate);
  }

   ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.initializeForm();
    this.getProbationEmployees();
    this.getEmployeeId();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
   }

   initializeForm() {
    this.employeeForm = this.fb.group({   
      fusionEmpId: ['', Validators.required],
      Documenttype: ['', Validators.required],
      issuedDate: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      authorityid: ['', Validators.required]

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

   getIssuedEmployeebyId(){
    this.employeedata=this.Employeeinfo.firstName+" "+this.Employeeinfo.lastName
    console.log(this.employeedata);

    }
//get employee ids for dropdown
getProbationEmployees(){
  this.subscription = this.http.getData(`ProbationFlow/getAllProbationEmployees?substatus=${"Probation Confirmed"}`).subscribe({
    next: (data:any) =>{
      console.log(data);
      this.probationemp = data as IProbationEmployees[]
      console.log(this.probationemp);
    },
    error: (reason: any) => {
      console.log(reason);
    },
  })
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
   
  //function to disable the submit button when we select the incorrect id 
  Onclickemployyeid(Value:any){
    console.log(Value);
    if(Value==""){
      this.disablebuttonforemployeeid=true
    }
    else{
      this.disablebuttonforemployeeid=false
    }
    let employeeinfo=this.probationemp.find(
      (c: any) => c.fusionEmpId == Value
    );
     console.log(employeeinfo);
     if(Value!=employeeinfo && employeeinfo!=undefined){
      this.disablebuttonforemployeeid=false
     }
  }

  Onclick(fusionemployeeId: any) {
    
    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.probationLetterData = {}
    this.probationLetterData = this.probationemp.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
    );
    this.disablebuttonforemployeeid=true
    this.getJobdetails(this.probationLetterData);
    this.getEmployeeAddress(this.probationLetterData)
    console.log(this.probationLetterData);
    this.getProbationRequest(this.probationLetterData.employeeId);
  }
    //function to get the address 
    getEmployeeAddress(Value:any) {
      let EmployeeId = Value.employeeId
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
  onclickSelectAddress(Value:any){
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
     if(this.employeeaddress.employeeAddresses.length>0){
           this.address = this.employeeaddress.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == Value)
            
          }
             console.log(this.address);
              this.probationLetterData.addressLine1=this.address.addressLine1
              this.probationLetterData.addressLine2=this.address.addressLine2
              this.probationLetterData.city=this.address.city
              this.probationLetterData.state=this.address.state
              this.probationLetterData.country=this.address.country
              this.probationLetterData.zipCode=this.address.zipCode
  
  
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
  //on click function for the authority name 
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
  if(authorityDesignationdata.middleName === null){
    this.signatureAuthorityName = JSON.parse(JSON.stringify(
      authorityDesignationdata?.firstName +' ' +authorityDesignationdata?.lastName
  ));
  }
  this.authorityDesignation = authorityDesignationdata?.designation;
  this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' +authorityDesignationdata?.middleName + authorityDesignationdata?.lastName))
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
      (c: any) => (c.employeeId == this.probationLetterData.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.probationLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.probationLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else{
      this.probationLetterData.authorityName =''
      this.authorityDesignation=''
    }
  }

  
  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Confirmation Letter';
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
//get employee ids for dropdown
getEmployeeId() {
  this.subscription = this.http
    .getData('Employeedata/ActiveEmployees')
    .subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeiddetails = data as IaddressemployeeDetails[];
       
        console.log(this.employeeiddetails);
      },
      error: (reason: any) => {

        console.log(reason);
      },
    });
}
//get jobdetails
getJobdetails(Employee: any) {
  this.subscription = this.http
    .getData(`JobDetails/Empname/${Employee.employeeId}`)
    .subscribe({
      next: (data: any) => {
        console.log(data);
        let res = data[0];
        this.employeeJobDetails = res;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = `${res.locationName}, ${res.sublocationName}`;
        Employee.department=res.department

        console.log(Employee.jobRole);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
}

async postProbationLetterFormSubmit(f: FormGroup) {
  this.loading=true;
  const data = await this.probationLetterData;
  data.dateofaddress = this.formatDate(data.dateofaddress);
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
      const fileName = `${data.firstName}_${data.middleName ??""}_${data.lastName??""}_${new Date().getTime()}_ProbationConfirmationLetter.pdf`;
      pdf.save(fileName);
      const blob = pdf.output('blob');
      console.log(blob);
          //creating form file to upload into AZure
    let d: Date = new Date()
    this.probationFile = new File(
      [blob],
      fileName,
      {
        type: 'application/pdf',
      }
    );
      this.uploadProbationLetter();
    });
  }

}
uploadProbationLetter() {
  let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationLetterData.employeeId}`;
  this.subscription = this.http
    .uploadFileWithQuery(
      'FileSystem/uploadfiletodirectory',
      filePath,
      this.probationFile
    
    )
    .subscribe({
      next: (data: any) => {
        if (data) {
          this.postProbationDetails(data.path)
          console.log(data);
       
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.dataFailureMsg('file upload  is failed');
      },
    });
}
//function to get the probation request details
getProbationDetails={} as any;
getProbationRequest(EmployeeId:number){
  this.subscription=this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
    next:(response:any)=>{
      console.log(response);
      
      this.getProbationDetails = response.find((ele: any) => {
        return (ele.status?.toLowerCase() === 'processed' );
      });
        console.log(this.getProbationDetails);
       
    }
  }) 
}
Documenturlresult:any;
postProbationDetails( docurl: string) {
  this.getProbationDetails.documentURL=docurl;
this.subscription = this.http
 .postdata('ProbationFlow/updateProbationActivationEmployees', this.getProbationDetails)
 .subscribe({
   next: (data: any) => {
     console.log(data);
      this.Documenturlresult=data.documentURL;
      this.disableFieldsForApproval=false;
      this.loading=false;
      this.dataSuccessMsg("Probation Extension Letter Generated Successfully")
      
   },
   error: (reason: any) => {
     console.log(reason);
   },
 });
}
//to post probation letter email Details to the offerletter table

probationConfirmationemail(){
  let pdata=
   {
    "employeeId": this.probationLetterData.employeeId,
    "documentUrl":this.Documenturlresult
      }
   this.subscription=this.http.postdata(`CustomEmail/ConfirmationofProbationPeriod`,pdata).subscribe({
    next:(data:any)=>{
      console.log(data);
      this.dataSuccessMsg("Probation Confirmation Letter Sent Successfully")
     
       this.router.navigate(['/admin/probationemployees']);
    },
    error:(err:any)=>{
      console.log(err);
      
    }
  })
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
