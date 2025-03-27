import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import { IAddress, IaddressemployeeDetails } from '../../Interfaces/letters-model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-probation-extension-letter',
  imports: [CommonModule, Select, CountryCodePhoneNumberComponent, ReactiveFormsModule, DateformatPipe],
  templateUrl: './probation-extension-letter.component.html',
  styleUrl: './probation-extension-letter.component.scss'
})
export class ProbationExtensionLetterComponent {
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
  employeeForm!: FormGroup;
  subscription!: Subscription;
  fusionEmpId: any;
  employeeiddetails = [] as any;
  probationExtensionLetterData = {} as any;
  employeeJobDetails = {} as any;
  addressTemplate: any | string | ArrayBuffer | null = null; //bank loan letter template
  probationFile!: File;
  isdateofextension: boolean = true;
  Employeeinfo = {} as any;
  employeedata = {} as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  // employeeFusionId={}as any;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  authorityName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  disablebuttonforemployeeid: boolean = true; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  SelectDropDown: any;
  employeeaddress = [] as any;
  disableFieldsForApproval: boolean = true;
  loading: boolean = false;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Status: any
  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    // private toaster: NgToastService,
    private router: Router,
    private authService: AuthService,
    // private _userAcessService:UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal,private fb: FormBuilder
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  initializeForm() {
    this.employeeForm = this.fb.group({

 
    })
  }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }
  navigateDashboard() {
    this.router.navigate(['/admin/probation-employees'])
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
    const probationExtensionDate = new Date(this.probationExtensionLetterData.dateofprobationextension);
    const joiningDate = new Date(this.probationExtensionLetterData.dateOfJoining);

    if (probationExtensionDate <= joiningDate) {
      this.isdateofextension = false;
    } else {
      this.isdateofextension = true;
    }
  }



  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    this.initializeForm();
    this.getEmployeeId();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }
  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName
    console.log(this.employeedata);

  }
  //function to disable the submit button when we select the incorrect id 
  Onclickemployyeid(Value: any) {
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

    this.fusionEmpId = fusionemployeeId;
    console.log(fusionemployeeId);
    this.probationExtensionLetterData = {}
    this.probationExtensionLetterData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
    );
    this.disablebuttonforemployeeid = true
    // this.getCompensationById(this.BankLoanLetterData)
    this.getJobdetails(this.probationExtensionLetterData);
    this.getEmployeeAddress(this.probationExtensionLetterData)
    console.log(this.probationExtensionLetterData);
    this.getProbationDetailsbyId(this.probationExtensionLetterData);
    this.getProbationRequest(this.probationExtensionLetterData.employeeId);
  }
  //funtion to get probation details
  getProbationDetailsbyId(Employee: any) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        let filteredData = data.filter((ele: any) => {
          return ele.status?.toLowerCase() == 'extended'
        })
        console.log(filteredData);
        filteredData.forEach((ele: any) => {
          Employee.probationExtendedDate = ele.probationExtendedDate
          Employee.probationmonths = this.convertDaysToMonths(ele.probationEndDate, ele.probationExtendedDate)
        });
        console.log(Employee.probationExtendedDate)
        console.log(Employee.probationmonths)
      }
    })
  }
  //funtion to get the months 
  convertDaysToMonths(probationEndDate: string, probationExtendedDate: string): string {
    // Assume an average month length of 30.44 days (which accounts for leap years)
    const endDate = moment(probationEndDate);
    const extendedDate = moment(probationExtendedDate);

    // Calculate the difference in days between the two dates
    const daysDifference = extendedDate.diff(endDate, 'days');

    // Assume an average month length of 30.44 days (which accounts for leap years)
    const averageDaysPerMonth = 365.25 / 12;

    // Convert days to months based on the average days per month
    let months = daysDifference / averageDaysPerMonth;
    if (months < 0) {
      months = 0;
    }
    // Round to 1 decimal place
    return months.toFixed(1);
  }
  //function to get the address 
  getEmployeeAddress(Value: any) {
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
  onclickSelectAddress(Value: any) {
    console.log(Value);
    console.log(this.employeeaddress.employeeAddresses);
    if (this.employeeaddress.employeeAddresses.length > 0) {
      this.address = this.employeeaddress.employeeAddresses.find((address: IAddress) => address.type.toLowerCase() == Value)

    }
    console.log(this.address);
    this.probationExtensionLetterData.addressLine1 = this.address.addressLine1
    this.probationExtensionLetterData.addressLine2 = this.address.addressLine2
    this.probationExtensionLetterData.city = this.address.city
    this.probationExtensionLetterData.state = this.address.state
    this.probationExtensionLetterData.country = this.address.country
    this.probationExtensionLetterData.zipCode = this.address.zipCode


  }
  //toggledropdown to open and close the dropdown list
  toggleDropdown(dropcategory: any) {
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
  onclickauthority(ValueName: any) {
    this.authorityName = ValueName
    if (this.authorityName == "") {
      this.disablebuttonforauthority = true
    }
    else {
      this.disablebuttonforauthority = false
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.middleName + ' ' + c.lastName === ValueName
    );
    console.log(authorityDesignationdata);
    if (authorityDesignationdata.middleName === null) {
      this.signatureAuthorityName = JSON.parse(JSON.stringify(
        authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName
      ));
    }
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName + authorityDesignationdata?.lastName))
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
  onclickDesignation() {
    //console.log(this.authorityDetails);
    //console.log(this.prospectiveEmpData.authorityid);

    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => (c.employeeId == this.probationExtensionLetterData.authorityid)
    );
    console.log(signatureAuthorityDetails);
    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;
      if (signatureAuthorityDetails.middleName) {
        this.probationExtensionLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
      } else
        this.probationExtensionLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    }
    else {
      this.probationExtensionLetterData.authorityName = ''
      this.authorityDesignation = ''
    }
  }
  //get offer letter Authority list 
  getAuthorityDetails() {
    let offertype = 'Probation Extension Letter';
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
      .getData(`ProbationFlow/getAllProbationEmployees?substatus=${'Probation Extended'}`)
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
  //get Job Details by empployeeid
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
          Employee.department = res.department

          console.log(Employee.jobRole);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  async postProbationExtensionLetterFormSubmit(f: NgForm) {
    const data = await this.probationExtensionLetterData;
    data.dateofaddress = this.formatDate(data.dateofaddress);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);

    console.log(data);

    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        console.log(imgWidth);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        console.log(imgHeight)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.middleName ?? ""}_${data.lastName ?? ""}_${new Date().getTime()}_ProbationExtensionLetter.pdf`;
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

        this.uploadprobationextentionLetter();

      });
    }


  }
  //function to get the separation request details
  getProbationDetails = {} as any;
  getProbationRequest(EmployeeId: any) {
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (response: any) => {
        console.log(response);

        this.getProbationDetails = response.find((ele: any) => {
          return (ele.status?.toLowerCase() === 'extended');
        });
        console.log(this.getProbationDetails);
      }
    })
  }
  uploadprobationextentionLetter() {
    let filePath = `/FusionDocuments/Employee Documents/Probation Documents/${this.probationExtensionLetterData.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.probationFile
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.postProbationDetails(data.path);
          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.dataFailureMsg('file upload  is failed');
        },
      });
  }
  Documenturlresult: any;
  postProbationDetails(docurl: string) {
    this.getProbationDetails.documentURL = docurl;
    this.subscription = this.http.postdata('ProbationFlow/updateProbationActivationEmployees', this.getProbationDetails).subscribe({
      next: (data: any) => {
        console.log(data);
        this.Documenturlresult = data.documentURL;
        this.disableFieldsForApproval = false;
        this.loading = false;
        this.dataSuccessMsg("Probation Extension Letter Generated Successfully")

      },
      error: (reason: any) => {
        console.log(reason);
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
  probationExtendeEmail() {
    let pdata =
    {
      "employeeId": this.probationExtensionLetterData.employeeId,
      "documentUrl": this.Documenturlresult

    }
    this.subscription = this.http.postdata(`CustomEmail/ExtensionofProbationPeriod`, pdata).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dataSuccessMsg(" Email Sent Successfully")

        this.router.navigate(['/admin/probationemployees']);
      },
      error: (err: any) => {
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
