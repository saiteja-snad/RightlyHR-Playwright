import { Component, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../services/open-modal.service';
import { LetterFooterComponent } from '../../shared/letters-shared-content/letter-footer/letter-footer.component';
import { LettersTabComponent } from '../../shared/letters-shared-content/letters-tab/letters-tab.component';
import { LettersheaderComponent } from '../../shared/letters-shared-content/lettersheader/lettersheader.component';
@Component({
  selector: 'app-welcome-letter',
  imports: [CommonModule, LettersTabComponent, Select, ReactiveFormsModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './welcome-letter.component.html',
  styleUrl: './welcome-letter.component.scss',
  encapsulation: ViewEncapsulation.None
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
  Employeeinfo = {} as any;
  employeedata = {} as any;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  employeeForm!: FormGroup;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  herOrHimdata: any;
  hisOrHerdata: any;
  authorityName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  Status: any
  disablebuttonforemployeeid: boolean = false; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  loading: boolean = false;
  notemessage = '';

  constructor(private http: HttpService, private router: Router, private elementRef: ElementRef, private fb: FormBuilder,
     private conformationPopup: OpenModalService) {
  }

  DateValidation() {
    if (this.bankloanLetterData.dateofbankloan <= this.bankloanLetterData.dateOfJoining) {
      this.isdateofbankloan = false;
    } else {
      this.isdateofbankloan = true;
    }
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    this.initializeForm();
    this.getEmployeeId();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
    this.employeeForm.get('note')?.valueChanges.subscribe((value: string) => {
      // Update the bankloanLetterData.note when the note value changes
      this.bankloanLetterData.note = value;
    });
  }

  //get Welcome letter Authority list
  getAuthorityDetails() {
    let offertype = 'Welcome Letter';
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

  //function for issuedby
  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName;
  }

  //function for disabling the incorrect employeeid
  Onclickemployeeid(Value: any) {
    if (Value == "") {
      this.disablebuttonforemployeeid = true;
    }
    else {
      this.disablebuttonforemployeeid = false;
    }
  }

  employeeFullname: any;
  Onclick(event: any) {
    const selectedEmployee = event.value;
    this.employeeFullname = selectedEmployee.firstName + ' ' + selectedEmployee.middleName + ' ' + selectedEmployee.lastName;
    if (selectedEmployee.fusionemployeeId) {
      this.fusionEmpId = selectedEmployee.fusionemployeeId;
      this.bankloanLetterData = {}
      this.bankloanLetterData = this.employeeiddetails.find(
        (c: any) => c.employeeId === this.fusionEmpId
      );
      this.disablebuttonforemployeeid = true
      if (this.bankloanLetterData.workEmail) {
        this.disablebuttonforemployeeid = false;
        this.notemessage = '';
      } else {
        this.disablebuttonforemployeeid = true;
        this.notemessage = 'Note: Please add employee work email id before generating the letter'
      }
      console.log(this.bankloanLetterData.gender);
      if (this.bankloanLetterData.gender == 'Male') {
        this.hisOrHerdata = 'his'
        this.herOrHimdata = 'him'
      }
      else if (this.bankloanLetterData.gender == 'Female') {
        this.hisOrHerdata = 'her'
        this.herOrHimdata = 'her'
      }
      else if (this.bankloanLetterData.gender == 'Other') {
        this.hisOrHerdata = 'his/her'
        this.herOrHimdata = 'him/her'
      }
      // this.getCompensationById(this.BankLoanLetterData)
      this.getJobdetails(this.bankloanLetterData);
    }
    else {
      this.fusionEmpId = null;
      this.disablebuttonforemployeeid = false;
      this.notemessage = '';
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

  //function to select authority name 
  onclickauthority(ValueName: any) {
    this.authorityName = ValueName
    if (this.authorityName == "") {
      this.disablebuttonforauthority = true;
    }
    else {
      this.disablebuttonforauthority = false;
    }
    let authorityDesignationdata = this.authorityDetails.find(
      (c: any) =>
        c.firstName + ' ' + c.middleName + ' ' + c.lastName === ValueName
    );
    this.authorityDesignation = authorityDesignationdata?.designation;
    this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName + ' ' + authorityDesignationdata?.lastName))
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
      this.bankloanLetterData.authorityName = '';
      this.bankloanLetterData.designation = ''; // Ensure this is also cleared
      this.bankloanLetterData.workEmail = ''; // Ensure this is also cleared
      return;
    }
    let signatureAuthorityDetails = this.authorityDetails.find(
      (c: any) => c.employeeId == selectedAuthority.employeeId
    );
    if (signatureAuthorityDetails) {
      // 🔹 Construct full name correctly
      this.bankloanLetterData.authorityName = signatureAuthorityDetails.middleName
        ? `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`
        : `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
      this.bankloanLetterData.designation = signatureAuthorityDetails.designation;
      this.bankloanLetterData.workEmail = signatureAuthorityDetails.workEmail;
    } else {
      this.bankloanLetterData.authorityName = '';
      this.bankloanLetterData.designation = '';
      this.bankloanLetterData.workEmail = '';
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

  //get employee ids for dropdown
  getEmployeeId() {
    const status = ['Active'];
    this.subscription = this.http.getData(`Employeedata/v1/Getallemployees?statuses=${status}`).subscribe({
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
    this.subscription = this.http.getData(`JobDetails/${Employee.employeeId}`).subscribe({
      next: (data: any) => {
        let res = data.reverse()[0];
        this.employeeJobDetails = res;
        Employee.jobRole = res.jobRole;
        Employee.workLocation = res.lopcation;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  async postBankLoanLetterFormSubmit(f: FormGroup) {
    this.loading = true;
    const data = await this.bankloanLetterData;
    data.dateofbankloan = this.formatDate(data.dateofbankloan);
    data.dateOfJoining = this.formatDate(data.dateOfJoining);
    const pdfContent = document.getElementById('pdfContent');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_WelcomeLetter.pdf`;
        pdf.save(fileName);
        const blob = pdf.output('blob');
        //creating form file to upload into AZure
        let d: Date = new Date()
        this.bankLoanFile = new File([blob],fileName,{type: 'application/pdf',});
        this.uploadBankLoanLetter();
      });
    }
  }

  //to Upload Appraisal letter
  uploadBankLoanLetter() {
    const filePath = `/FusionDocuments/Employee Documents/Welcome Letters/${this.bankloanLetterData.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankLoanFile).subscribe({
      next: (data: any) => {
        if (data) {
          this.emailToEmployee();
        }
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('file upload  is failed')
      },
    });
  }

  //function to send email to the employee
  emailToEmployee() {
    const payload = {
      employeeId: this.bankloanLetterData.employeeId
    }
    this.subscription = this.http.postdata(`CustomEmail/generatewelcomeemail/${this.bankloanLetterData.employeeId}`, payload).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Welcome Letter Generated Successfully')
        this.router.navigate(['/admin']);
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        this.loading = false;
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