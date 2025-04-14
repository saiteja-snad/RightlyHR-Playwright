import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IemployeeDetails } from '../../Interfaces/letters-model';
import { LettersheaderComponent } from "../../shared/lettersheader/lettersheader.component";
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-relieving-letter',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, LettersheaderComponent,TranslateModule],
  templateUrl: './relieving-letter.component.html',
  styleUrl: './relieving-letter.component.scss'
})
export class RelievingLetterComponent {
 
  selectedEmployee: any;
  subscription!: Subscription;
  employeeiddetails = [] as any;
  relievingLetterData = {} as any;
  relievingTemplate: any | string | ArrayBuffer | null = null; //relieving letter template
  fusionEmpId: any;
  employeeJobDetails = {} as any;
  result = {} as any;
  employeedata = {} as any;
  Employeeinfo = {} as any;
  RelievingFile!: File;
  isdateofRelieving: boolean = true;
  isDropdownOpen: boolean = false;
  isDropdownOpenauthority: boolean = false;
  showDropdown: boolean = false;
  isDisabled!: boolean;
  filteredOptions = [] as any;
  Status: any;
  authorityName: any;
  signatureAuthorityName!: string | null
  authorityDesignation!: string | null;
  authorityDetails = [] as any;
  authoritydetails = [] as any;
  disablebuttonforemployeeid: boolean = false; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  value: string = 'Generate Document';
  gender: any;
  gender2: any;
  gender3: any
  allinactiveemployes:any
  comparisioncheck: any;
  employeeForm!: FormGroup;

  employeementType: { name: string, value: boolean }[] = [
    { name: 'Soft Copy', value: true },
    { name: 'Hard Copy', value: false }
  ];
  constructor(private router: Router,private fb: FormBuilder,private http: HttpService,
    private httpclient: HttpClient,
    private authService: AuthService,
private conformationPopup: OpenModalService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    
    this.initializeForm();
    this.getEmployeeInactive();
    this.getRelievingTemplate();
    this.getIssuedEmployeebyId();
    this.getAuthorityDetails();
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  initializeForm() {
    this.employeeForm = this.fb.group({ 
      searchEmployee: [null, Validators.required],
      documentType: [null, Validators.required],
      dateofRelieving: ['', Validators.required],
      signatureAuthority: [null, Validators.required]
     });
  }
  // DateValidation() {
  //   if (this.relievingLetterData.dateofRelieving <= this.relievingLetterData.dateOfJoining) {
  //     this.isdateofRelieving = false;
  //   } else {
  //     this.isdateofRelieving = true;
  //   }
  // }

  DateValidation() {
    const relievingDate = new Date(this.relievingLetterData.dateofRelieving);
    const joiningDate = new Date(this.relievingLetterData.dateOfJoining);
  
    this.isdateofRelieving = relievingDate > joiningDate;
  
    // Force Angular to show error immediately
    this.employeeForm.get('dateofRelieving')?.markAsTouched();
  }

  getIssuedEmployeebyId() {
    this.employeedata = this.Employeeinfo.firstName + " " + this.Employeeinfo.middleName + " " + this.Employeeinfo.lastName
    console.log(this.employeedata);
  }
  SelectDropDown: any;
  resetInputFields() {
    if (this.SelectDropDown === 'New') {
      this.relievingLetterData.dateofRelieving = ''; 
      this.relievingLetterData = '';
      this.value = 'Generate Document'; 
    }
  }
  valueExists(value: string): boolean {
    return this.employeeiddetails.some((item: any) => item.fusionEmpId === value);
  }
  //function for disabling the incorrect employeeid
  Onclickemployeeid(Value: any) {
    console.log(Value);
    if (Value === '') {
      this.disablebuttonforemployeeid = false;
    } else {
      this.disablebuttonforemployeeid = !this.valueExists(Value);
    }

    this.gender2 = '';
    this.gender3 = '';
    this.gender = '';
    this.relievingLetterData = [];
  }
  Onclick(event: any) {
    const selectedEmployee = event.value; 
    const employeeId = selectedEmployee?.id; 
    
    this.fusionEmpId = employeeId; 
    console.log('Selected employee:', selectedEmployee);
    this.relievingLetterData = {};
    this.relievingLetterData = this.employeeiddetails.find(
      (c: any) => c.employeeId  == event.value.id
    );
 
    this.getJobdetails(this.relievingLetterData);
    console.log(this.relievingLetterData);
    if (this.relievingLetterData.gender == 'Male') {
      return this.gender = "his", this.gender2 = 'he', this.gender3 = 'Mr.';
    } else {
      return this.gender = "her",this.gender2 = 'she', this.gender3 = 'Ms.';
    }
  
   
  }


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
      this.authorityDesignation = authorityDesignationdata?.designation;
      this.signatureAuthorityName = JSON.parse(JSON.stringify(authorityDesignationdata?.firstName + ' ' + authorityDesignationdata?.middleName + ' ' + authorityDesignationdata?.lastName))
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
      let signatureAuthorityDetails = this.authoritydetails.find(
        (c: any) => (c.employeeId == this.relievingLetterData.authorityid)
      );
      console.log(signatureAuthorityDetails);
      if (signatureAuthorityDetails) {
        this.authorityDesignation = signatureAuthorityDetails.designation;
        if (signatureAuthorityDetails.middleName) {
          this.relievingLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.middleName} ${signatureAuthorityDetails.lastName}`;
        } else
          this.relievingLetterData.authorityName = `${signatureAuthorityDetails.firstName} ${signatureAuthorityDetails.lastName}`;
      }
      else if (signatureAuthorityDetails == undefined || signatureAuthorityDetails == null) {
        this.relievingLetterData.authorityName = ''
        this.authorityDesignation = ''
      }
    }

    //get offer letter Authority list 
    getAuthorityDetails() {
      let offertype = 'Releving Letter';
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

    //get employee ids for dropdown
    getEmployeeInactive() {
      this.subscription = this.http.getData('Employeedata/InactiveEmployees').subscribe({
        next: (data: any) => {
          console.log('API Response:', data);
          this.employeeiddetails = data;
    
          this.allinactiveemployes = data.map((employee: any) => ({
            id: employee.employeeId,
            employee: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.lastName ?? ''}`,
          }));
    
          console.log('Dropdown Options:', this.allinactiveemployes);
        },
        error: (reason: any) => {
          console.log('API Error:', reason);
        },
      });
    }

    async postRelievingLetterFormSubmit(f: FormGroup) {
      if (this.employeeForm.invalid) {
        // Mark all fields as touched so validation messages appear
        this.employeeForm.markAllAsTouched();
        return;
      }
      const data = await this.relievingLetterData;
      data.dateofRelieving = data.dateofRelieving;
      data.dateOfJoining = data.dateOfJoining;
      data.lastworkingday = data.lastworkingday;
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
          const fileName = `${data.firstName}_${data.lastName}_${new Date().getTime()}_RelievingLetter.pdf`;
          pdf.save(fileName);
          const blob = pdf.output('blob');
          console.log(blob);
          //creating form file to upload into AZure
          let d: Date = new Date()
          this.RelievingFile = new File(
            [blob],
            fileName,
            {
              type: 'application/pdf',
            }
          );
           this.relievingemail();
          this.uploadRelievingLetter();
        });
      }
    }

    //to get appraisal letter template
    async getRelievingTemplate() {
      this.relievingTemplate = await this.httpclient
        .get('assets/Relieving_Letter.docx', {
          responseType: 'arraybuffer',
        })
        .toPromise();
    }
  
    //to Upload Appraisal letter
    uploadRelievingLetter() {
  
      let filePath = `/FusionDocuments/Employee Documents/Relieving Letters/${this.relievingLetterData.employeeId}`;
      this.subscription = this.http
        .uploadFileWithQuery(
          'FileSystem/uploadfiletodirectory',
          filePath,
          this.RelievingFile
        )
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.result.documentUrl = data.path;
              this.conformationPopup.openSuccessModal('Relieving Letter Generated Successfully')
             
              this.relievingemail();
              // this.router.navigate(['/admin/Inactive']);
              console.log(data);
            }
          },
          error: (reason: any) => {
            console.log(reason);
            //  this.relievingemail();
            this.conformationPopup.openErrorModal('File upload  is failed');
          },
        });
    }

    //function to send the relieving letter email
    relievingemail() {
      let loggedInUser = this.authService.getToken();
      let emaildetails = {
        personEmail: this.relievingLetterData.emailaddress,
        senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
        senderEmail: loggedInUser.workEmail,
        firstName: this.relievingLetterData.firstName,
        lastName: this.relievingLetterData.lastName,
        middleName: this.relievingLetterData.middleName,
        role: this.relievingLetterData.jobRole,
        documentUrl: this.result.documentUrl,
        employeeId: this.relievingLetterData.employeeId,
      }
      if (loggedInUser.middleName) {
  
        emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
  
      } else {
        emaildetails.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
  
      }
      console.log(emaildetails);
  
      this.subscription = this.http.postdata(`CustomEmail/relievingLetter`, emaildetails).subscribe({
        next: (data: any) => {
          console.log(data);
          this.conformationPopup.openSuccessModal('Email Sent Successfully')
         
          this.router.navigate(['/admin/inactive-employees']);
        },
        error: (err: any) => {
          console.log(err);
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

    closeDropdown() {
      this.isDropdownOpen = false;
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
