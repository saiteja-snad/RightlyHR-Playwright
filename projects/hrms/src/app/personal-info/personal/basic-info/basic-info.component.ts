import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { IGender, IMarital, ITitle } from '../../../Interfaces/personal-modal';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IJob } from '../../../Interfaces/letters-model';

@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  subscription!: Subscription
  empinfo = {} as IJob;
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
  Gender: IGender[] = [];
  titledetails: ITitle[] = [];
  Maritaldetails: IMarital[] = [];
  empyployeedata = {} as any;
  buttons = false

  constructor(private modalService: NgbModal, private fb: FormBuilder, public formValidation: FormValidationService, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeForm();
    this.getEmployeeId();
    this.getGender()
    this.getMaritaldetails()
    this.getTitle()
    this.basicInfoForm.disable();
  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: [null, Validators.required],
      salutation: [null, Validators.required],
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      middleName: [null, [Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      gender: [null, Validators.required],
      dob: [null, [Validators.required, this.validateAge.bind(this)]],
      bloodGroup: [null],
      maritalStatus: [null, Validators.required],
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
        this.empyployeedata = data;
        this.patchForm(data);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  patchForm(data: any): void {
    console.log('data', data)
    this.basicInfoForm.patchValue({
      employeeId: data.fusionEmpId,
      fusionEmpId: data.fusionEmpId,
      salutation: this.titledetails.find((item: any) => item.titlename === data.title),
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
      dob: this.formatDateToLocal(data.dob),
      bloodGroup: this.bloodGroups.find((item: any) => item.name === data.bloodGroup),
      maritalStatus: this.Maritaldetails.find(((item: any) => item.maritalstatus1 === data.maritalStatus)) || data.maritalStatus,
    });
    console.log('datapatch', this.basicInfoForm.value);



  }

  updateBasicInfo(): void {
    const formValue = this.basicInfoForm.value;
    console.log(formValue);


    const updatePayload = {
      ...this.empyployeedata,
      employeeId: this.empinfo.employeeId,
      title: formValue.salutation?.titlename,
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      gender: formValue.gender,
      dob: formValue.dob,
      bloodGroup: formValue.bloodGroup?.name,
      maritalStatus: formValue.maritalStatus?.maritalstatus1,
      empStatus: 'Active',
    };

    console.log(updatePayload);

    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          if (data.statusCode === 200) {
            // Success case
            this.conformationPopup.openSuccessModal('Basic Information Updated Successfully');
            this.getEmployeeId();
            this.basicInfoForm.disable();
            console.log('Data updated successfully:', data);
            this.buttons = !this.buttons;
            this.modalService.dismissAll();
          } else if (data.statusCode === 409) {
      
            console.log('Conflict:', data.message);
            this.conformationPopup.openErrorModal(data.message );
            this.patchForm(this.empyployeedata); 
          }
        },
        error: (reason: any) => {

          console.log(reason);
          this.conformationPopup.openErrorModal('Basic Info update failed')
        },
      });
  }

  getGender() {
    this.subscription = this.http.getData('gender').subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
      },
    });
  }

  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titledetails = data as ITitle[];
      },
    });
  }

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
      this.basicInfoForm.enable();


    } else {
      this.basicInfoForm.disable();
      this.basicInfoForm.reset();
      this.getEmployeeId();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}