import { Component, ElementRef, model, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IAddress, IDepartment, IemployeeDetails, IIssuelocation, IMake } from '../appointment-letter/appointment-letter-model';
import moment from 'moment';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { LettersTabComponent } from '../../shared/letters-tab/letters-tab.component';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { IAuthority } from '../../Interfaces/letters-model';

@Component({
  selector: 'app-trainee-appointment-letter',
  imports: [CommonModule, LettersTabComponent, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule, DateformatPipe],
  templateUrl: './trainee-appointment-letter.component.html',
  styleUrl: './trainee-appointment-letter.component.scss'
})
export class TraineeAppointmentLetterComponent {
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
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
  addressdata: { name: string, value: string }[] = [
    { name: 'Current Address', value: 'C' },
    { name: 'Permanent Address', value: 'P' },
  ];
  subscription!: Subscription;
  employeeiddetails = [] as any;
  traineeAppointmentletterData = {} as any;
  AppointmentFile!: File;
  fusionEmployeeId: any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  filteredOptions=[] as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  isDisabled!: boolean;
  employeeJobDetails = {} as any; //to store the values of jobDetails
  employeeCompensationDetails = {} as any; //to store the values of compensationDetails
  employeeaddress=[] as any;
  SelectDropDown: any;
  departmentDetails = [] as any;
  issueLocationdata = [] as any;
  AssertTypeGet = [] as any;
  authorityDetails=[] as any;
  authorityDesignation!:string|null;
  employeeiddetailsauthorityName = [] as any;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  makeDetails = [] as any;
  Status:any
  employeeForm!: FormGroup;
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  constructor(
    private http: HttpService,
    // private httpclient: HttpClient,
    // private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder,
  ) { 
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.traineeAppointmentletterData.branchCode = null
    this.traineeAppointmentletterData.department = null
    this.fusionEmployeeId = null
    this.traineeAppointmentletterData.make = null
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
  this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " +this.Employeeinfo.lastName
  console.log(this.employeedata);
}
Onclickemployeeid(Value:any){
  this.traineeAppointmentletterData.branchCode = null
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
  this.fusionEmployeeId = fusionemployeeId;
   console.log(fusionemployeeId);
   this.traineeAppointmentletterData = {}
   this.traineeAppointmentletterData = this.employeeiddetails.find(
     (c: any) => c.fusionEmpId == fusionemployeeId
   );
   this.disablebuttonforemployeeid=true
   this.traineeAppointmentletterData.dateOfJoining = this.formatDatewithDate(this.traineeAppointmentletterData.dateOfJoining)

   console.log(this.traineeAppointmentletterData);
   this.getJobdetails(this.traineeAppointmentletterData);
   this.getCompensationDetails(this.traineeAppointmentletterData);
   this.getEmployeeAddress(this.traineeAppointmentletterData.employeeId)
 }
 initializeForm() {
  this.employeeForm = this.fb.group({
    fusionEmpId: ['', Validators.required],
    appointmentdate: ['', Validators.required],
    SelectDropDown: ['', Validators.required],
    dateOfJoining: ['', Validators.required],
    department: ['', Validators.required],
    branchCode: ['', Validators.required],
    Documenttype: ['', Validators.required],
    asserttype:['',Validators.required],
    note: ['', Validators.required],
    model: ['', Validators.required],
    serial: ['', Validators.required],
    signatureAuthority: ['', Validators.required]
  });
}
 //function to get the address 
 getEmployeeAddress(Value:any) {
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
navigateDashboard() {
  this.router.navigate(['/admin/dashboard'])
}
addressFlag= false;

  address = {} as IAddress;
  onclickSelectAddress(Value: any) {
    this.addressFlag= true;
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value)

    }
    console.log(this.address);
    this.traineeAppointmentletterData.addressLine1 = this.address.addressLine1
    this.traineeAppointmentletterData.addressLine2 = this.address.addressLine2
    this.traineeAppointmentletterData.city = this.address.city
    this.traineeAppointmentletterData.state = this.address.state
    this.traineeAppointmentletterData.country = this.address.country
    this.traineeAppointmentletterData.zipCode = this.address.zipCode


  }
  toggleDropdown(dropcategory: any) {
    this.traineeAppointmentletterData.branchCode=null
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
  //function to block the special charecterstics
 blockSpecialCharacters(event: KeyboardEvent) {
  const blockedCharacters =/[^a-zA-Z0-9]/;    
   const inputChar = String.fromCharCode(event.charCode);    
    if (blockedCharacters.test(inputChar)) {       
      event.preventDefault(); // Block the input of the character 
   }
}

   //function to select the current address 
   onclickDesignation(){
    //console.log(this.authorityDetails);
    //console.log(this.prospectiveEmpData.authorityid);
  
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.traineeAppointmentletterData.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.traineeAppointmentletterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.traineeAppointmentletterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else if(signatureAuthorityDetails==undefined||signatureAuthorityDetails==null){
      this.traineeAppointmentletterData.authorityName =''
      this.authorityDesignation=''
    }
  }
  //get offer letter Authority list 
getAuthorityDetails(){
  let offertype = 'Appointment Letter';
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
private formatDatewithDate(date: Date): string | void {
  if (date) {

    return moment(date).format('YYYY-MM-DD');
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
        Employee.subLocation=res.subLocation;
        console.log(Employee.workLocation);

        console.log(Employee.jobRole);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });

  }
   //get Compensation Details by empployeeid

   getCompensationDetails(Employee: any) {
    this.subscription = this.http
      .getData(`Compensationdata/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          let res = data.reverse()[0];
          this.employeeCompensationDetails = res;
          Employee.salary = res.compensationamount;
          console.log(Employee.salary);

          //CTC calculation stated
          Employee.grossby = 12
          Employee.grossSalary = Math.round(res.compensationamount / Employee.grossby)
          //this.grossSalary = Employee.grossSalary
          console.log(Employee.grossby);
          console.log(Employee.grossSalary);
          console.log(this.traineeAppointmentletterData);

          console.log(this.traineeAppointmentletterData.pf);
          if (this.traineeAppointmentletterData.pf == true || this.traineeAppointmentletterData.pf == false) {
            switch (this.traineeAppointmentletterData.pf) {

              case true:
                    if(this.traineeAppointmentletterData.esic==false){
                      Employee.pfContribution = Math.round((Employee.grossSalary * (6.719 / 100)));

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
                else if (Employee.grossSalary <= 23195) {

                  Employee.pfContribution = Math.round((Employee.grossSalary * (6.519 / 100)));
                  if (Employee.pfContribution >= 1800) {
                    Employee.pfContribution = 1800;
                  }
                  console.log(Employee.pfContribution);

                }

                else {
                  if(Employee.grossSalary<=15000){
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
                  else  if (Employee.grossSalary >= 23195) {

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
         
            if(this.traineeAppointmentletterData.esic==true){
              let condition1 = (Employee.grossSalary >= 23195)
              if (!condition1) {
                Employee.esicContribution = Math.round(Employee.grossSalary * (2.94 / 100));
                console.log(Employee.esicContribution);
                this.traineeAppointmentletterData.esic=true
              }
              else {
                Employee.esicContribution = 0
                this.traineeAppointmentletterData.esic=false
                console.log(Employee.esicContribution);
              }
            }
            else{
              Employee.esicContribution = 0
                this.traineeAppointmentletterData.esic=false
                console.log(Employee.esicContribution);
            }
               
           
                if (Employee.grossSalary < 15000) {
                  Employee.professionalTax = 0
                  this.traineeAppointmentletterData.pt=false
                  console.log(Employee.professionalTax);

                }
                else if (Employee.grossSalary > 15000 && Employee.grossSalary < 21000) {
                  Employee.professionalTax = 150;
                  this.traineeAppointmentletterData.pt=true
                  console.log(Employee.professionalTax);

                }
                else if (Employee.grossSalary >= 21000) {
                  Employee.professionalTax = 200;
                  console.log(Employee.professionalTax);
                  this.traineeAppointmentletterData.pt=true

                }
                else {
                  Employee.professionalTax = 0;
                  this.traineeAppointmentletterData.pt=false
                  console.log(Employee.professionalTax);

                }
            

          //calcution for the totalgrosssalary
          Employee.totalGrossSalary = Math.round(Employee.grossSalary - Employee.pfContribution - Employee.esicContribution)
          console.log(Employee.totalGrossSalary);
          //claculation for ESIC for employee


              // case true:
              if(this.traineeAppointmentletterData.esic==true){
                if (Employee.totalGrossSalary <= 21000) {

                  Employee.employeeEsi = Math.round(Employee.totalGrossSalary * (0.75 / 100));
                  console.log(Employee.employeeEsi);
                  this.traineeAppointmentletterData.esic=true
                }
                else {
                  Employee.employeeEsi = 0
                  this.traineeAppointmentletterData.esic=false
                }
              }
              else{
                Employee.employeeEsi = 0
                this.traineeAppointmentletterData.esic=false
              }
              
            
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
  .getData('TraineeOfferLetter/traineeActiveEmployees')
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
  isLoading: boolean = false;
  async onTraineeAppointmentLetterSubmit(f: NgForm) {

    const data = this.traineeAppointmentletterData;
    //data.dateOfJoining = this.formatDate(data.dateOfJoining);
    //data.appointmentdate = this.formatDate(data.appointmentdate);

    console.log(data);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();

    const pdfContents = ['pdfContent1', 'pdfContent2', 'pdfContent3', 'pdfContent4', 'pdfContent5', 'pdfContent6', 'pdfContent7',
      'pdfContent8', 'pdfContent9']; // Add more content IDs if needed
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


    const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_TraineeAppointmentLetter_Unsigned.pdf`;
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
   this.postAssetDetails();
    this.uploadAppointLetter();
  

  }
  //Update Employee details along with Appointment details
 sendEmployeeDetails() {
  this.traineeAppointmentletterData.empStatus = 'Trainee Active'
  this.traineeAppointmentletterData.emptype = 'Trainee '
  this.traineeAppointmentletterData.branchCode=this.traineeAppointmentletterData.branchCode
   this.subscription = this.http
     .postdata('Employeedata/UPDATER', this.traineeAppointmentletterData)
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
    this.employeeJobDetails.department = this.traineeAppointmentletterData.department;
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
    
    //Post Appointment Details
    postAppointmentDetails(docUrl: string) {
      let loggedInUser = this.authService.getToken();
  
      let postAppDetails = {
        employeeId: this.traineeAppointmentletterData.employeeId,
        appointmentsentDate:this.traineeAppointmentletterData.appointmentdate,
        appointmentSentStatus: 'Document Sent',
        appointmentSentBy:loggedInUser.employeeId,
        
        documentURL: docUrl,
        isDeleted:false,
      };
      console.log(postAppDetails);
      
      this.subscription = this.http
        .postdata('TraineeAppointmentLetter', postAppDetails)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            //this.AppointmentLetterEmail(docUrl)
            this.dataSuccessMsg('Appointment Letter Generated Successfully')
            // this.toaster.success({
            //   detail: 'SUCCESS',
            //   summary: 'Appointment Letter Generated Successfully',
            //   duration: 5000,
            // });
  
  
            this.router.navigate(['/admin']);
          },
          error: (reason: any) => {
            console.log(reason);
          },
        });
  
    }
  
    //to Upload Appoinment letter
    uploadAppointLetter() {
      let filePath = `/FusionDocuments/Employee Documents/Trainee Appointment Letter/${this.traineeAppointmentletterData.employeeId}`;
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
            this.dataFailureMsg('File upload Failed')
           
          },
        });
    }
    
 //appointment letter email
  AppointmentLetterEmail(docUrl: string) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      senderEmail: loggedInUser.workEmail,
      personEmail: this.traineeAppointmentletterData.emailaddress,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      appointee: `${this.traineeAppointmentletterData.firstName } ${this.traineeAppointmentletterData.middleName} ${this.traineeAppointmentletterData.middleName}`,
      role: this.traineeAppointmentletterData.jobRole,
      department: this.traineeAppointmentletterData.department,
      workLocation: this.traineeAppointmentletterData.workLocation+", "+this.traineeAppointmentletterData.subLocation,
      documentUrl: docUrl,
      employeeId: this.traineeAppointmentletterData.employeeId,
      dateOfJoining:this.traineeAppointmentletterData.dateOfJoining

    }
    if(loggedInUser.middleName){

      emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emaildetails.appointee= `${this.traineeAppointmentletterData.firstName} ${this.traineeAppointmentletterData.middleName} ${this.traineeAppointmentletterData.lastName}`
    }else{
      emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.lastName}`
      emaildetails.appointee= `${this.traineeAppointmentletterData.firstName} ${this.traineeAppointmentletterData.lastName}`
    }
    console.log(emaildetails);
   

    this.subscription = this.http.postdata(`CustomEmail/appointmentletter`, emaildetails).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dataSuccessMsg('Email Sent Successfully')
        // this.toaster.success({
        //   detail: 'SUCCESS',
        //   summary: 'Email Sent Successfully',
        //   duration: 5000,

        // });
        //this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        console.log(err);
        //this.router.navigate(['/admin']);

      }
    })
    

  }
    //Post Asset Details
    postAssetDetails() {
      let postAssetDetails = {
        empid: this.traineeAppointmentletterData.employeeId,
        assetType: this.traineeAppointmentletterData.asserttype,
        maker: null,
        model: this.traineeAppointmentletterData.model,
        serialNumber: this.traineeAppointmentletterData.serial,
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
   ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
