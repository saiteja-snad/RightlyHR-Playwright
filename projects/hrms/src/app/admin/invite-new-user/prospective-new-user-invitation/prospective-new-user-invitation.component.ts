import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { NewUserInvitationTabsComponent } from "../../../shared/new-user-invitation-tabs/new-user-invitation-tabs.component";
import { Iactive } from '../../active-employees/active-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-prospective-new-user-invitation',
  imports: [CommonModule, Select, NewUserInvitationTabsComponent,ReactiveFormsModule, TranslateModule],
  templateUrl: './prospective-new-user-invitation.component.html',
  styleUrl: './prospective-new-user-invitation.component.scss'
})
export class ProspectiveNewUserInvitationComponent {
  inviteActiveEmployeeForm!: FormGroup;
  isCheckBoxChecked = false;
  isSubmitDisabled = false;
  Activeemployeedata = [] as Iactive[];
  subscription!: Subscription;
  getName: any = {};
  inviteeEmployeeID: any;
  spinnerLoader : boolean = false;
  isSelectedEmployee : boolean = false;

  constructor(private fb: FormBuilder,private router: Router,private conformationPopup: OpenModalService,private http: HttpService) {}

  ngOnInit(): void {
    this.inviteActiveEmployeeForm = this.fb.group({
      EmployeeID: [null, Validators.required],
      fullname: [{ value: '', disabled: true }, Validators.required],
      agreement: [false, Validators.requiredTrue]
    });
    this.getActiveEmployeeData();
  }

  onChangePropesctiveEmployess(event: any): void {
    this.isSelectedEmployee = true;
    const selectedId = event.value;
    const selected = this.Activeemployeedata.find((e: any) => e.employeeId == selectedId);
    if (selected) {
      this.getName = selected;
      this.isSubmitDisabled = true;
      this.inviteeEmployeeID = selected.employeeId;
      console.log(this.getName);
      
      this.inviteActiveEmployeeForm.patchValue({
        fullname: selected.firstName + ' ' + selected.middleName +' '+ selected.lastName,
      });
    }
  }

  onCheckValue(): void {
    this.isCheckBoxChecked = !this.isCheckBoxChecked;
  }

  getActiveEmployeeData() {
    this.subscription = this.http
      .getData('Employeedata/TraineeActiveEmployees/Trainee%20Active')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.Activeemployeedata = data as Iactive[];
        },
        error: (reason: any) => {
          console.log(reason);

        },
        complete: () => {
        }
      });
  }
  
  activeInviteEmployee(): void {
    this.spinnerLoader = true;
    if (this.inviteeEmployeeID && this.getName) {
      let loggedInUser: Iactive = JSON.parse(
        localStorage.getItem('rightlyHrUser') || '{}'
      );
      let reqBody = {
        invitedBy: loggedInUser.employeeId,
        invitee: this.inviteeEmployeeID,
      };
      this.subscription = this.http.postdata('InviteUser', reqBody).subscribe({
        next: (response: any) => {
          console.log(response);
          this.conformationPopup.openSuccessModal('Invite New User provided successfully');
          this.isSubmitDisabled = false;
          this.isCheckBoxChecked = false;
          this.inviteeEmployeeID = null;
          this.isSelectedEmployee = false;
          this.inviteActiveEmployeeForm.reset();
          this.getName = {};
          
      
        },
        error: (err: any) => {
          console.log(err);
          this.isSubmitDisabled = false;
          this.isCheckBoxChecked = true;
          this.inviteeEmployeeID = null;
          this.spinnerLoader = false;
          this.conformationPopup.openErrorModal('Please update work email for this employee');
        },
        complete: () => {
          this.getActiveEmployeeData();
          this.spinnerLoader = false;
          this.isSubmitDisabled = false;
          this.isCheckBoxChecked = false;
          this.inviteeEmployeeID = null;
          this.isSelectedEmployee = false;
          this.inviteActiveEmployeeForm.reset();
          this.getName = {};
        },
      });
    }
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
