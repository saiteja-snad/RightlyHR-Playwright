import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { IGender, IMarital, ITitle } from '../../../Interfaces/personal-modal';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  subscription!: Subscription
  emsployedata: any
  empinfo: any;
  showMarriageDateField: boolean = false;
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' }
  ];
  dateofbirth:any
  salutationValidationcheck: boolean = false
  Gender: IGender[] = [];
  titledetails: ITitle[] = [];
  Maritaldetails: IMarital[] = [];
  buttons = false
  changeingdob:any
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef, private fb: FormBuilder, public formValidation: FormValidationService,
    private conformationPopup: OpenModalService, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo)
    this.initializeForm();
    this.getEmployeeId();
    this.getGender()
    this.getMaritaldetails()
    this.getTitle()
    this.basicInfoForm.disable();
    this.basicInfoForm.get('salutation')?.valueChanges.subscribe(() => {
      this.onsalutationvalidation();
    });

    this.basicInfoForm.get('gender')?.valueChanges.subscribe(() => {
      this.onsalutationvalidation();
    });
    this.basicInfoForm.get('dob')?.valueChanges.subscribe((data) => {
      console.log(data)
      this.emsployedata.dob=null
      this.changeingdob=data
    });

  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({

      fusionEmpId: [{ value: null, disabled: true }, [Validators.required]],
      salutation: [null, Validators.required],
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,30}$')]],
      middleName: [null, [Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      gender: [null, Validators.required],
      dob: [null, [Validators.required, this.validateAge.bind(this)]],
      bloodGroup: [null, Validators.required],
      maritalStatus: [null, Validators.required],
      marriageDate: [null],
    });
  }
  validateAge(control: AbstractControl): { [key: string]: boolean } | null {
    const dob = control.value;
    if (dob) {
      const currentDate = new Date();
      const birthDate = new Date(dob);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18 || age > 75) {
        return { invalidAge: true }; // Return an error object if age is invalid
      }
    }
    return null; // Return null if validation passes
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.emsployedata = data;
        this.dateofbirth =this.formatDateToLocal(this.emsployedata.dob)
        this.patchForm(data);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  
  getdateofbirth(): string | null {
    const startDateValue = this.formatDateToLocal(this.emsployedata.dob) || this.formatDateToLocal(this.changeingdob);
    console.log(startDateValue);
    
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null; 
  }


 // Helper method to format a date to 'YYYY-MM-DD'
 formatDateToLocal(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

  patchForm(data: any): void {
    this.basicInfoForm.patchValue({
      employeeId: data.employeeId,
      fusionEmpId: data.fusionEmpId,
      salutation: data.title,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
      dob: this.formatDateToLocal(data.dob) || null,
      marriageDate: this.formatDateToLocal(data.marriedDate) || null,
      bloodGroup: this.bloodGroups.find((item: any) => item.name === data.bloodGroup),
      maritalStatus: this.Maritaldetails.find(((item: any) => item.maritalstatus1 === data.maritalStatus)),
    });
    console.log('datapatch', this.basicInfoForm.value);

  }

  updateBasicInfo(): void {
    const formValue = this.basicInfoForm.value;
    console.log(formValue);

    const updatePayload = {
      ...this.emsployedata,
      employeeId: this.empinfo.employeeId,
      title: formValue.salutation,
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      gender: formValue.gender,
      dob: formValue.dob,
      bloodGroup: formValue.bloodGroup?.name,
      maritalStatus: formValue.maritalStatus?.maritalstatus1,
      marriageDate: formValue.marriageDate,
      empStatus: 'Active',
    };
    console.log(updatePayload);

    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          if (data.statusCode === 200) {
            this.conformationPopup.openSuccessModal('Basic Information Updated Successfully',);
            this.getEmployeeId();
            this.basicInfoForm.disable();
            this.buttons = !this.buttons;
            this.http.setBasicDetails();

          } else if (data.statusCode === 409) {
            this.conformationPopup.openErrorModal(data.message,);
            this.patchForm(this.emsployedata);
          }

        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Basic Info update failed')


        },
      });
  }
  // Get the gender details from the API
  getGender() {
    this.subscription = this.http.getData('gender').subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
      },
    });
  }
  // Get the title details from the API
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titledetails = data as ITitle[];
      },
    });
  }
  // Get the marital status details from the API
  getMaritaldetails() {
    this.subscription = this.http.getData('Maritalstatus').subscribe({
      next: (data: any) => {
        this.Maritaldetails = data as IMarital[];
      },
    });
  }

  showButtons(): void {
    this.buttons = !this.buttons;
  
    if (this.buttons) {
      // Enable the form when the user clicks "Edit"
   
      this.basicInfoForm.enable();
      this.basicInfoForm.get('fusionEmpId')?.disable();

    } else {
      this.basicInfoForm.get('fusionEmpId')?.disable();
      this.basicInfoForm.disable();
      this.basicInfoForm.reset();
      this.getEmployeeId();
    }
  }
// Function to open the modal for confirmation
  changemaritalstatus(): void {
    const maritalStatus = this.basicInfoForm.get('maritalStatus')?.value?.maritalstatus1 === 'Married'  || this.emsployedata?.maritalStatus === 'Married';
  
    if (maritalStatus) {
      // Add the required validator to the marriageDate field
      this.basicInfoForm.get('marriageDate')?.setValidators([Validators.required]);
    } else {
      // Clear the validators if marital status is not "Married"
      this.basicInfoForm.get('marriageDate')?.clearValidators();
      this.basicInfoForm.get('marriageDate')?.setValue(null); // Reset the marriage date field
    }
  
    // Update the validation state of the marriageDate field
    this.basicInfoForm.get('marriageDate')?.updateValueAndValidity();
  }

  onsalutationvalidation(): void {
    const gender = this.basicInfoForm.get('gender')?.value;
    const title = this.basicInfoForm.get('salutation')?.value;

    const genderLower = typeof gender === 'string' ? gender.toLowerCase() : '';
    const titleLower = typeof title === 'string' ? title.toLowerCase() : '';

    if (
      (genderLower === 'male' && titleLower === 'mr.') ||
      (genderLower === 'female' && ['ms.', 'miss.', 'mrs.'].includes(titleLower)) ||
      ((genderLower === 'other' || genderLower === 'others') && (titleLower === 'other' || titleLower === 'others')) ||
      ((genderLower === 'male' || genderLower === 'female') && (titleLower == null || titleLower === ''))
    ) {
      this.salutationValidationcheck = false; // Valid combination
    } else {
      this.salutationValidationcheck = true; // Invalid combination
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
