import { Component } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { AuthService } from '../../../services/auth.service';
import { ICompensation, Icompensation, IFrequency, IOvertime, IPayType } from '../../../Interfaces/job-model';
import { BehaviorSubject, delay, map, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-compensation',
  imports: [CommonModule, ReactiveFormsModule, Select, NoDataFoundComponent, DateformatPipe],
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.scss'
})
export class CompensationComponent {
  subscription!: Subscription;
  compForm!: FormGroup;
  compupdateForm!: FormGroup
  overtimeDetails = [] as IOvertime[];
  joiningDate: any;
  paytypeDetails = [] as IPayType[];
  frequencyDetails = [] as IFrequency[];
  compensationdetails = new BehaviorSubject<any>([])
  compensationReason = [] as ICompensation[]

  empinfo: any
  selectedid: any;
  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public rbac: RbacService
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
  
    this.intizationFrom()
    this.intizationupdateFrom()
  this.getEmployeeId()
    this.getCompensationempid()
    this.getFrequency()
    this.getpaytype()
    this.getOvertime()
    this.getCompensationresondropdown()
  }
  intizationFrom() {
    this.compForm = this.fb.group({
      compeffectivedate: [null, Validators.required],
      reason: [null, Validators.required],
      paytype: [null, Validators.required],
      overtimeeligibility: [null, Validators.required],
      frequency: [null, Validators.required],
      compensationamount: [null, [Validators.required, Validators.pattern(/^(?!0+$)\d+(\.\d{1,2})?$/)]]
    });
  }


  intizationupdateFrom() {
    this.compupdateForm = this.fb.group({
      compeffectivedate: [null, [Validators.required]],
      reason: [null, Validators.required],
      paytype: [null, Validators.required],
      overtimeeligibility: [null, Validators.required],
      frequency: [null, Validators.required],
      compensationamount: [null, [Validators.required, Validators.pattern(/^(?!0+$)\d+(\.\d{1,2})?$/)]]
    });
  }
  
  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.joiningDate =this.formatDateToLocal(data.dateOfJoining)
        },
        error: (reason: any) =>
          console.error('Error fetching employee data:', reason),
      });
  }
  //function to get overtime dropdown
  getOvertime() {
    this.subscription = this.http.getData('Overtime').subscribe({
      next: (data: any) => {
        console.log(data);
        this.overtimeDetails = data as IOvertime[];
      },
    });
  }

  //function to get paytype dropdown
  getpaytype() {
    this.subscription = this.http.getData('PayType').subscribe({
      next: (data: any) => {
        console.log(data);
        this.paytypeDetails = data as IPayType[];
      },
    });
  }

  //function to get frequency dropdown
  getFrequency() {
    this.subscription = this.http.getData('Frequency').subscribe({
      next: (data: any) => {
        console.log(data);
        this.frequencyDetails = data as IFrequency[];
      },
    });
  }
  getCompensationresondropdown() {
    this.subscription = this.http.getData('CompensationReason').subscribe({
      next: (data: any) => {
        console.log(data);
        this.compensationReason = data as ICompensation[];
      },
    });
  }

  getCompensationempid() {
    let employeeId = parseInt(this.empinfo.employeeId);
    console.log(employeeId);
    this.subscription = this.http
      .getData(`Compensationdata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.compensationdetails.next(data)
        },
      })
  }

  // dateAfterJoiningAsyncValidator(joiningDate: Date): AsyncValidatorFn {
  //   return (control: AbstractControl) => {
  //     const selectedDate = new Date(control.value);
  //     if (!control.value) {
  //       return of(null); // No validation error if the field is empty
  //     }
  //     return of(selectedDate > joiningDate).pipe(
  //       delay(500), // Simulate async delay
  //       map((isValid: any) => (isValid ? null : { dateInvalid: true })) // Return validation error if invalid
  //     );
  //   };
  // }

  postcompensation(formdata: FormGroup) {
    const formattedEffectiveDate = formdata.value.compeffectivedate
      ? new Date(formdata.value.compeffectivedate).toISOString().split('T')[0]
      : null;
    const playload = {

      employeeId: this.empinfo.employeeId,
      compeffectivedate: formattedEffectiveDate,
      overtimeeligibility: formdata.value?.overtimeeligibility?.overtimeeligibility1,
      reason: formdata.value?.reason?.reason,
      frequency: formdata.value?.frequency?.frequency1,
      paytype: formdata.value?.paytype?.paytype1,
      compensationamount: this.compForm.get('compensationamount')?.value,
      status: "Active"

    }
    console.log(playload)
    this.subscription = this.http.postdata("Compensationdata", playload).subscribe({
      next: (data: any) => {
        console.log(data)
        this.compForm.reset()
    
        this.modalService.dismissAll()
        this.getCompensationempid()
        this.conformationPopup.openSuccessModal("Compensation added successfully")

      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal("Compensation added failed")

      },

    });

  }
  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  openModalupdate(content: any, data: any) {
    console.log(data)
    this.selectedid = data.id
    const effectiveDate = this.formatDateToLocal(data.compeffectivedate);
      
    this.compupdateForm.patchValue({
      compeffectivedate: effectiveDate,
      reason: data.reason || '',
      paytype: data.paytype || '',
      overtimeeligibility: data.overtimeeligibility || '',
      frequency: data.frequency || '',
      compensationamount: data.compensationamount?.toString() || ''
    })

    // Open the modal
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }


  updatecompensation(formdata: FormGroup) {
    const formattedEffectiveDate = formdata.value.compeffectivedate
      ? new Date(formdata.value.compeffectivedate).toISOString().split('T')[0]
      : null;
    const playload = {
      id: this.selectedid,
      employeeId: this.empinfo.employeeId,
      compeffectivedate: formattedEffectiveDate,
      overtimeeligibility: formdata.value?.overtimeeligibility,
      reason: formdata.value?.reason,
      frequency: formdata.value?.frequency,
      paytype: formdata.value?.paytype,
      compensationamount: this.compupdateForm.get('compensationamount')?.value,
      status: "Active"

    }
    console.log(playload)
    this.subscription = this.http.postdata("Compensationdata/UPDATER", playload).subscribe({
      next: (data: any) => {
        console.log(data)
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Compensation Updated successfully")
        this.getCompensationempid()

      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal("Compensation Updated failed")

      },

    });

  }

  opendeletModal(content: any, data: any) {
    this.selectedid = data


    // Open the modal
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });

  }
  compentiondelete() {
    const playload = {
      "status": "Void",
      "employeeId": this.empinfo.employeeId,
      "id": this.selectedid.id,
      "compeffectivedate": this.selectedid.compeffectivedate,
      "overtimeeligibility": this.selectedid.overtimeeligibility,
      "reason": this.selectedid.reason,
      "frequency": this.selectedid.frequency,
      "paytype": this.selectedid.paytype,
      "compensationamount": this.selectedid.compensationamount,

    }
    this.subscription = this.http.postdata("Compensationdata/UPDATER", playload).subscribe({
      next: (data: any) => {
        console.log(data)
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal("Compensation Deleted successfully")
        this.getCompensationempid()

      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal("Compensation Deleted failed")

      },

    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }




}
