import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IAddress, IGender, IJobdetails, Ipersonal, ITitle } from '../../models/personal-details.model';
import { HttpService } from '../../http-services/http.service';
import { BnNgIdleService } from 'bn-ng-idle';
@Component({
  selector: 'app-personal-details',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class PersonalDetailsComponent implements OnInit {
  personalDetailsForm!: FormGroup;
  locationOptions = [{ name: 'Delhi' }, { name: 'Mumbai' }];
  subLocationOptions = [{ name: 'East' }, { name: 'West' }];
  designationOptions = [
    { id: 1, name: 'Manager' },
    { id: 2, name: 'Developer' },
  ];
  subscription!: Subscription;
  Gender = [] as IGender[];
  titleDetails = [] as ITitle[]
  prospectiveEmpData = {} as any;
  employeeData = {} as any;
  postAddress = {} as any;
  postPermanentAddress = {} as any;
  jobdetails = [] as any;
  isChecked: boolean = false;
  currentAddress = {} as IAddress;
  permanentAddress = {} as IAddress;
  identityDetails = {} as any;
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal, private readonly fb: FormBuilder,
    private http: HttpService, private bnIdle: BnNgIdleService) { }

  ngOnInit(): void {
    this.bnIdle.startWatching(1600).subscribe((isTimeOut: boolean) => {
      if (isTimeOut) {
        localStorage.removeItem('prospectiveusertoken')
        this.router.navigate(['/login'], { replaceUrl: true });
        this.bnIdle.stopTimer();
        location.reload();
      }
    })
    this.prospectiveEmpData = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.initializeloginForm();
    this.getprospectivempdata();
    this.getGender();
    this.getJobDetails();
    this.getTitle();
  }
  
  // Prospective Employee Data
  getprospectivempdata() {
    let employeeId = parseInt(this.prospectiveEmpData.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeData = data as Ipersonal;
        // if(this.employeeData.employeeAddresses.length>0){
        //   this.currentAddress = this.empdata.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == 'c')
        //   this.permanentAddress = this.empdata.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == 'p')
        //   // this.formattedPhoneNumber = this.formatPhoneNumber(this.empdata.contactnumber, this.empdata.mobilePhoneCountryCode)
        //   if(
        //     this.permanentAddress.addressLine1 == this.currentAddress?.addressLine1 &&
        //     this.permanentAddress.addressLine2 ==this.currentAddress?.addressLine2 &&
        //     this.permanentAddress.city == this.currentAddress?.city &&
        //     this.permanentAddress.state == this.currentAddress?.state &&
        //     this.permanentAddress.country == this.currentAddress?.country &&
        //     this.permanentAddress.zipCode == this.currentAddress?.zipCode
        //   )
        //   {
        //     this.sameAsPermanent = true;
        //   }
        // }else{
        //   this.intializingAddresses()
        // }
        console.log(this.currentAddress, this.permanentAddress);
        // if (this.employeeData.dob) {
        //   this.employeeData.dob = this.formatDate(this.empdata.dob);
        // }
        //  if (this.empdata.mobilePhoneCountryCode) {
        //   this.selectedValuecontactnumberCountryCodeInitial = this.getFormattedCountryCode(this.empdata.mobilePhoneCountryCode);
        // }
        this.employeeData = data;
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['login']);
        }
      }
    });
  }

  //function to get jobdetails
  getJobDetails() {
    let EmployeeId = parseInt(this.prospectiveEmpData.employeeId)
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        let reverdata = data.reverse()
        console.log(this.jobdetails.jobRole);
        this.jobdetails = reverdata[0] as IJobdetails[];
        console.log(this.jobdetails);
      }
    })
  }

  //function to get the gender details in the dropdown 
  getGender() {
    this.subscription = this.http.getData("PreonboardingGender").subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
        console.log(this.Gender);
      }
    })
  }

  //function to get the salutaion details in dropdown 
  getTitle() {
    this.subscription = this.http.getData("PreonboardingTitle").subscribe({
      next: (data: any) => {
        this.titleDetails = data as ITitle[]
        console.log(this.titleDetails);
      }
    })
  }

  initializeloginForm() {
    this.personalDetailsForm = this.fb.group({
      firstName: ['', Validators.required, Validators.pattern('^[A-Z][a-zA-Z\\s]{0,29}$')],
      middleName: ['', Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')],
      lastName: ['', Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')],
      gender: ['', Validators.required],
      salutation: ['', Validators.required],
      location: ['', Validators.required,Validators],
      subLocation: ['', Validators.required],
      designation: ['', Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      // Nested FormGroup for Current Address
      currentAddress: this.fb.group({
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipcode: ['', Validators.required],
      }),
      // Nested FormGroup for Permanent Address
      permanentAddress: this.fb.group({
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipcode: ['', Validators.required],
      }),
    });
  }

  // Copy Current Address to Permanent Address
  copyCurrentAddress(event: any) {
    if (event.target.checked) {
      this.personalDetailsForm.patchValue({
        permanentAddress: this.personalDetailsForm.value.currentAddress,
      });
    } else {
      this.personalDetailsForm.get('permanentAddress')?.reset();
    }
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
      return false;
    }
    return true;
  }

  // Submit Form
  onSubmit() {
    if (this.personalDetailsForm.valid) {
      console.log('Form Submitted:', this.personalDetailsForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  close() {
    this.modalService.dismissAll();
  }

  navigateDocumentUpload() {
    this.router.navigate(['/document']);
  }
}