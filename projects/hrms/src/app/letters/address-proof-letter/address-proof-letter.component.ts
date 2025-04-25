import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { IAddress, IemployeeDetails } from '../appointment-letter/appointment-letter-model';
import { IAuthority } from '../../Interfaces/letters-model';
import { LetterFooterComponent } from "../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { LettersheaderComponent } from "../../shared/letters-shared-content/lettersheader/lettersheader.component";
@Component({
  selector: 'app-address-proof-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LetterFooterComponent, LettersheaderComponent],
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
  employeeiddetails = [] as any;
  addressLetterData = {} as any;
  employeeJobDetails = {} as any;
  addressTemplate: any | string | ArrayBuffer | null = null; //bank loan letter template
  addressFile!: File;
  isdateofaddress: boolean = true;
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
  Status: any;
  address = {} as IAddress;
  addressFlag = false;
  addressErrorMessage = ''; 
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  @ViewChild('success') success: any;

  constructor(
    private http: HttpService,
    private httpclient: HttpClient,
    private router: Router,
    // private _userAcessService:UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig, private modalService: NgbModal, private fb: FormBuilder,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
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

    this.addressdata = this.employeeaddress?.employeeAddresses && Array.isArray(this.employeeaddress.employeeAddresses)
      ? this.employeeaddress.employeeAddresses.map((addr: { type: string }) => ({
        label: addr.type === 'C' ? 'Current Address' : 'Permanent Address',
        value: addr.type
      })): [];
  }

  addressOptions = [
    { label: 'Current Address', value: 'C' },
    { label: 'Permanent Address', value: 'P' }
  ];

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
      zipCode: [''],
      authorityName: [''],                    
      authorityDesignation: ['']
    });

    // this.employeeForm.valueChanges.subscribe(()=>{
    //   this.addressErrorMessage='';
    // })
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

  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName
  }

  //function to disable the submit button when we select the incorrect id 
  Onclickemployyeid(Value: any) {
    if (Value == "") {
      this.disablebuttonforemployeeid = true
    }
    else {
      this.disablebuttonforemployeeid = false
    }
    let employeeinfo = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == Value
    );
    if (Value != employeeinfo && employeeinfo != undefined) {
      this.disablebuttonforemployeeid = false
    }

  }

  Onclick(selectedEmployee: any) {
    if (!selectedEmployee || typeof selectedEmployee !== 'object') {
      return;
    }

    if (!selectedEmployee.hasOwnProperty('employeeId')) {
      return;
    }

    this.fusionEmpId = selectedEmployee.employeeId;
    this.addressLetterData = {};

    this.addressLetterData = this.employeeiddetails.find(
      (c: any) => c.employeeId === this.fusionEmpId
    );

    if (!this.addressLetterData) {
      return;
    }

    let selectedAddress = this.addressLetterData.address || {};
    if (!selectedAddress || Object.keys(selectedAddress).length === 0) {
     console.log('No address found for the selected type.');
    }

    this.employeeForm.patchValue({
      employeeId: this.addressLetterData.employeeId || '',
      firstName: this.addressLetterData.firstName || '',
      middleName: this.addressLetterData.middleName || '',
      lastName: this.addressLetterData.lastName || '',
      jobRole: 'Fetching...',
      dateOfJoining: this.addressLetterData.dateOfJoining || '',
      authorityDesignation: this.addressLetterData.authorityDesignation || '',
      authorityName: this.addressLetterData.authorityName || '',
      addressLine1: selectedAddress?.addressLine1 || '',
      addressLine2: selectedAddress?.addressLine2 || '',
      city: selectedAddress?.city || '',
      state: selectedAddress?.state || '',
      country: selectedAddress?.country || '',
      zipCode: selectedAddress?.zipCode || ''
    });

    if (this.addressLetterData.employeeId) {
      this.getEmployeeAddress(this.addressLetterData);
      this.getJobdetails(this.addressLetterData);
    }
    this.disablebuttonforemployeeid = true;
  }

  //function to get the address 
  getEmployeeAddress(Value: any) {
    let EmployeeId = Value.employeeId;

    this.subscription = this.http.getData(`Employeedata/getProspectiveEmployeedata/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.employeeaddress = data as IAddress[];
        const address = data.employeeAddresses
        if (!address || address.length === 0) {
          this.addressErrorMessage = 'No address found for the selected employee.';
        } else {
          this.addressErrorMessage = '';
        }
      }
    })
  }

  //function to select the current address 
  onclickSelectAddress(event: any) {
    const selectedValue = event.value.value;

    const selectedAddress = this.employeeaddress?.employeeAddresses?.find(
      (addr: { type: string }) => addr.type.toLocaleLowerCase() === selectedValue.toLocaleLowerCase()
    );

    if (selectedAddress) {

      this.employeeForm.patchValue({
        addressLine1: selectedAddress.addressLine1 || '',
        addressLine2: selectedAddress.addressLine2 || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        country: selectedAddress.country || '',
        zipCode: selectedAddress.zipCode || '',
      });

      this.addressFlag = true;
    } else {
      this.addressFlag = false;
      this.addressErrorMessage = 'No address found for the selected type.';
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
    if (authorityDesignationdata.middleName === null) {
      this.signatureAuthorityName = JSON.parse(JSON.stringify(
        authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.lastName
      ));
    }
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName + authorityDesignationdata?.lastName))
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
    }
  }
  onclickDesignation(selectedAuthority: any) {

    if (!selectedAuthority) {
      this.addressLetterData.authorityName = '';
      this.authorityDesignation = '';
      return;
    }

    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == selectedAuthority.employeeId
    );

    if (signatureAuthorityDetails) {
      this.authorityDesignation = signatureAuthorityDetails.designation;

      // 🔹 Construct full name correctly
      this.addressLetterData.authorityName = signatureAuthorityDetails.middleName
        ? `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`
        : `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
    } else {
      this.addressLetterData.authorityName = '';
      this.authorityDesignation = '';
    }
  }

  getAuthorityDetails() {
    let offertype = 'Address Proof Letter';
    this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
      next: (data: any) => {
        this.authorityDetails = data.map((authority: any) => ({
          ...authority,
          fullName: `${authority.firstName} ${authority.middleName} ${authority.lastName}`.trim() // Concatenate first, middle, last name and trim any extra spaces
        }));
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
          this.employeeiddetails = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
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
    if (!Employee || !Employee.employeeId) {
      console.warn("Invalid employee for job details:", Employee);
      return;
    }

    this.subscription = this.http
      .getData(`JobDetails/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {

          if (data && data.length > 0) {
            let res = data.reverse()[0]; 
            this.employeeJobDetails = res;

            Employee.jobRole = res.jobRole;
            Employee.workLocation = res.location; 

            // ✅ Update form field dynamically
            this.employeeForm.patchValue({
              jobRole: Employee.jobRole || 'Not Available',
            });
          } else {
            console.warn("No job details found for employeeId:", Employee.employeeId);
            this.employeeForm.patchValue({
              jobRole: 'Not Available', 
            });
          }
        },
        error: (reason: any) => {
          console.error("Error fetching job details:", reason);
          this.employeeForm.patchValue({
            jobRole: 'Not Available', // Handle API failure
          });
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


    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_AddressProofLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
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
            this.dataSuccessMsg('Address Proof Letter Generated Successfully')
            this.router.navigate(['/admin/active']);
          }
        },
        error: (reason: any) => {
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
