import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { IAddress, IemployeeDetails } from '../appointment-letter/appointment-letter-model';
import { IaddressemployeeDetails, IAuthority } from '../../Interfaces/letters-model';

@Component({
  selector: 'app-address-proof-letter',
  imports: [CommonModule,Select, CountryCodePhoneNumberComponent,ReactiveFormsModule,DateformatPipe],
  templateUrl: './address-proof-letter.component.html',
  styleUrl: './address-proof-letter.component.scss'
})
export class AddressProofLetterComponent {
  addressdata: { name: string, value: string }[] = [
    { name: 'Current Address', value: 'C' },
    { name: 'Permanent Address', value: 'P' },
  ];
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false },
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
  employeeForm!: FormGroup;
  selectedEmployee: any;
  subscription!: Subscription;
  fusionEmpId: any;
  employeeiddetails=[] as any;
  addressLetterData={} as any;
  employeeJobDetails = {} as any;
  addressTemplate: any | string | ArrayBuffer | null = null; //bank loan letter template
  addressFile!: File;
  isdateofaddress: boolean = true;
  Employeeinfo={} as any;
  employeedata={} as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority:boolean=false;
  // employeeFusionId={}as any;
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
  Status:any;
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  @ViewChild('success') success: any;

  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService:UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder, 
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
   }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
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
    this.getEmployeeId();
    this.getAddressTemplate();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/active-employees'])
  }
  initializeForm() {
    this.employeeForm = this.fb.group({
      fusionEmpId: ['', Validators.required],
      Documenttype: ['', Validators.required],
      SelectDropDown: ['', Validators.required],
      authorityid: ['', Validators.required],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      jobRole: [''],
      dateOfJoining: [null],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
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
  getIssuedEmployeebyId(){
    this.employeedata=this.Employeeinfo.firstName+" "+this.Employeeinfo.lastName
    console.log(this.employeedata);

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
      let employeeinfo=this.employeeiddetails.find(
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
    
      // Reset the addressLetterData to empty or default values
      this.addressLetterData = {};
      
      // Find the selected employee from the employeeiddetails array
      this.addressLetterData = this.employeeiddetails.find(
        (c: any) => c.fusionEmpId == fusionemployeeId
      );
      
      // Ensure the form is updated with the employee data
      this.employeeForm.patchValue({
        fusionEmpId: this.addressLetterData.fusionEmpId,
        firstName: this.addressLetterData.firstName,
        middleName: this.addressLetterData.middleName,
        lastName: this.addressLetterData.lastName,
        jobRole: this.addressLetterData.jobRole,
        dateOfJoining: this.addressLetterData.dateOfJoining,
        authorityDesignation:this.addressLetterData.authorityDesignation,
        authorityName:this.addressLetterData.authorityName,
      });
    
      // Fetch additional details like job and address if necessary
      this.getJobdetails(this.addressLetterData);
      this.getEmployeeAddress(this.addressLetterData);
    
      this.disablebuttonforemployeeid = true;
      console.log(this.addressLetterData);
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
  addressFlag = false;
  onclickSelectAddress(Value:any){
    this.addressFlag= true;
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
     if(this.employeeaddress.employeeAddresses.length>0){
           this.address = this.employeeaddress.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == Value) 
          }
             console.log(this.address);
              this.addressLetterData.addressLine1=this.address.addressLine1
              this.addressLetterData.addressLine2=this.address.addressLine2
              this.addressLetterData.city=this.address.city
              this.addressLetterData.state=this.address.state
              this.addressLetterData.country=this.address.country
              this.addressLetterData.zipCode=this.address.zipCode
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
    (c: any) => (c.employeeId == this.addressLetterData.authorityid)
  );
  console.log(signatureAuthorityDetails);
  if (signatureAuthorityDetails) {
    this.authorityDesignation = signatureAuthorityDetails.designation;
    if (signatureAuthorityDetails.middleName) {
      this.addressLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
    } else
      this.addressLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
  }
  else{
    this.addressLetterData.authorityName =''
    this.authorityDesignation=''
  }
}
//get offer letter Authority list 
// getAuthorityDetails(){
//   let offertype='Address Proof Letter'
//   this.subscription=this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
//     next:(data:any)=>{
//       console.log(data);
//       this.authorityDetails=data
//     }
//   })
// }
getAuthorityDetails() {
  let offertype = 'Address Proof Letter';
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
  //to get address letter template
  async getAddressTemplate() {
    this.addressTemplate = await this.httpclient
      .get('assets/Address_Proof_letter.docx', {
        responseType: 'arraybuffer',
      })
      .toPromise();
  }

  async postAddressLetterFormSubmit(f: FormGroup) {
    const data = await this.addressLetterData;
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
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AddressProofLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        console.log(blob);
            //creating form file to upload into AZure
      let d: Date = new Date()
      this.addressFile = new File(
        [blob],
        fileName,
        {
          type: 'application/pdf',
        }
      );

        this.uploadAddressLetter();
        
      });
    }
  }

  uploadAddressLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Address Proof Letters/${this.addressLetterData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.addressFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            
            console.log(data);
            this.dataSuccessMsg('Address Proof Letter Generated Successfully')
            this.router.navigate(['/admin/active']);
          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');        },
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
