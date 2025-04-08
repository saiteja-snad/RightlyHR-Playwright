import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IRehiredata, ITermination } from '../../../Interfaces/job-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-offboarding-details',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offboarding-details.component.html',
  styleUrl: './offboarding-details.component.scss'
})
export class OffboardingDetailsComponent {
  buttons = false;
  isEditing: boolean = false;
  offboardingForm!: FormGroup
  empinfo: any
  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  subscription!: Subscription
  rehireDetails: IRehiredata[] = [];
  terminationDetails: ITermination[] = [];
  showButtons() {
    this.buttons = !this.buttons
  }

  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService) { }
  ngOnInit() {
    this.getRehire();
    this.getTermination();
    this.initializeForm();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
  }

  initializeForm(): void {
    this.offboardingForm = this.fb.group({
      exitReason: [{ value: '', disabled: true }],
      eligibleForRehire: [{ value: '', disabled: true }],
      relievingType: [{ value: '', disabled: true }],
      lastWorkingDay: [{ value: '', disabled: true }]
    });
  }

  //function to get rehire dropdown
  getRehire() {
    this.subscription = this.http.getData('Eligibleforrehire').subscribe({
      next: (data: any) => {
        console.log(data);
        this.rehireDetails = data as IRehiredata[];
      },
    });
  }

  disableForm(): void {
    this.isEditing = false;
    this.buttons = false;
    this.offboardingForm.reset();

    this.offboardingForm.disable();
  }

  enableForm(): void {
    this.isEditing = true;
    this.buttons = true;
    this.offboardingForm.enable();
  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    console.log(this.empinfo);

    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.previousEmpData = JSON.parse(JSON.stringify(data));
        this.empdata = data as Ipersonal;

        // Format dates
        this.empdata.lastworkingday = this.formatDate(this.empdata.lastworkingday);
        this.empdata.dateOfJoining = this.formatDate(this.empdata.dateOfJoining);
        this.empdata.probationEndDate = this.formatDate(this.empdata.probationEndDate);
        this.empdata.offerIssueddate = this.formatDate(this.empdata.offerIssueddate);

        console.log(this.empdata);

        // Patch the form with the fetched data
        this.offboardingForm.patchValue({
          exitReason: this.empdata.termreasonoffboard || '', // Replace with the correct property if different
          eligibleForRehire: this.empdata.eligibleforrehire || '', // Replace with the correct property if different
          relievingType: this.empdata.separationType || '', // Replace with the correct property if different
          lastWorkingDay: this.empdata.lastworkingday || '' // Replace with the correct property if different
        });

        
      },
      error: (err: any) => {
        console.log(err);

      }
    });
  }
  //function to get termination dropdown
  getTermination() {
    this.subscription = this.http.getData('TerminationReason').subscribe({
      next: (data: any) => {
        console.log(data);
        this.terminationDetails = data as ITermination[];
      },
    });
  }
}
