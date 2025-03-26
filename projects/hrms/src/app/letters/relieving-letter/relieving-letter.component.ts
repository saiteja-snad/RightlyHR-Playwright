import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { IemployeeDetails } from '../offer-letter/offer-letter.model';
import { HttpService } from '../../services/http.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import moment from 'moment';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-relieving-letter',
  imports: [CommonModule,Select,ReactiveFormsModule,DateformatPipe],
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
  disablebuttonforemployeeid: boolean = false; //variable to disable the fields
  disablebuttonforauthority: boolean = true; //variable to disable the fields
  value: string = 'Generate Document';
  gender: any;
  gender2: any;
  gender3: any
  comparisioncheck: any;
  employeeForm!: FormGroup;
  @ViewChild('success') success: any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  employeementType: { name: string, value: boolean }[] = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  constructor(private router: Router, private modalService: NgbModal,private fb: FormBuilder,private http: HttpService,
    private httpclient: HttpClient,
    private authService: AuthService,
    // private _userAcessService: UserAccessService,
    private elementRef: ElementRef,
    config: NgbModalConfig,) { }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") || '{}');
    console.log(this.Employeeinfo);
    this.getEmployeeId();
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
      // dateofRelieving: ['', Validators.required],
      signatureAuthority: [null, Validators.required]
     });
  }
  DateValidation() {
    if (this.relievingLetterData.dateofRelieving <= this.relievingLetterData.dateOfJoining) {
      this.isdateofRelieving = false;
    } else {
      this.isdateofRelieving = true;
    }
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

  Onclick(fusionemployeeId: any) {
    this.fusionEmpId = fusionemployeeId;
    this.comparisioncheck = fusionemployeeId;
    console.log(fusionemployeeId);
    this.relievingLetterData = {}
    this.relievingLetterData = this.employeeiddetails.find(
      (c: any) => c.fusionEmpId == fusionemployeeId
    );
    this.disablebuttonforemployeeid = false
    this.getJobdetails(this.relievingLetterData);
    console.log(this.relievingLetterData);

    if (this.relievingLetterData.gender == 'Male') {
      return this.gender = "his", this.gender2 = 'he', this.gender3 = 'Mr.';
    } else {
      return this.gender = "her", this.gender2 = 'she', this.gender3 = 'Ms.';
    }
  }
  toggleDropdown(dropcategory: any) {
    if (dropcategory == 'empid') {
      this.isDropdownOpen = !this.isDropdownOpen;
      if (this.isDropdownOpen) {
            // this.isDropdownOpen=false;
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
      //console.log(this.authorityDetails);
      //console.log(this.prospectiveEmpData.authorityid);
  
      let signatureAuthorityDetails = this.authorityDetails.find(
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
      let offertype = 'Releving Letter'
      this.subscription = this.http.getData(`SignaturesList?LetterType=${offertype}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.authorityDetails = data
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
    getEmployeeId() {
      this.subscription = this.http
        .getData('Employeedata/InactiveEmployees')
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
    async postRelievingLetterFormSubmit(f: NgForm) {
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
          // this.relievingemail();
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
              this.dataSuccessMsg('Relieving Letter Generated Successfully')
             
              this.relievingemail();
              // this.router.navigate(['/admin/Inactive']);
              console.log(data);
            }
          },
          error: (reason: any) => {
            console.log(reason);
            //  this.relievingemail();
            this.dataFailureMsg('File upload  is failed');
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
          this.dataFailureMsg('Email Sent Successfully')
         
          this.router.navigate(['/admin/Inactive']);
        },
        error: (err: any) => {
          console.log(err);
  
  
        },
        complete: () => {
  
        }
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
}
