import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { NewUserInvitationTabsComponent } from "../../../shared/new-user-invitation-tabs/new-user-invitation-tabs.component";
import { Subscription } from 'rxjs';
import { Iactive } from '../../active-employees/active-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-active-new-user-invitation',
  imports: [CommonModule, Select, NewUserInvitationTabsComponent],
  templateUrl: './active-new-user-invitation.component.html',
  styleUrl: './active-new-user-invitation.component.scss'
})
export class ActiveNewUserInvitationComponent {
  Activeemployeedata = [] as Iactive[];
  subscription!: Subscription;
  inviteeEmployeeID: number | null = null;
  selectedEmployee: any;
  getName = [] as any;

  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal,private http: HttpService,private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.getActiveEmployeeData()
  }
  getActiveEmployeeData() {
    // this.isLoading=true
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
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

  activeInviteEmployee() {
    if (this.inviteeEmployeeID && this.getName) {
      let loggedInUser: Iactive = JSON.parse(
        localStorage.getItem('rightlyHrUser') || '{}'
      );

      let reqBody = {
        invitedBy: loggedInUser.employeeId,
        invitee: this.inviteeEmployeeID,
      };
      // API call to send email with the link for prospective user Invitation
      //this.isLoading=true
      this.subscription = this.http.postdata('InviteUser', reqBody).subscribe({
        next: (response) => {
          console.log(response);
          this.conformationPopup.openSuccessModal('Invite new user added successfully');
          //f.resetForm()
          // this.isSubmitDisabled = false;
          // this.isCheckBoxChecked = false;
          // this.inviteeEmployeeID = null;
      
        },
        error: (err) => {
          console.log(err);
          this.conformationPopup.openErrorModal('Invite new user add failed');
          
         // this.isLoading=false
          // f.resetForm()
          // this.isSubmitDisabled = false;
          // this.isCheckBoxChecked = false;
          this.inviteeEmployeeID = null;
        },
        complete: () => {
          // f.resetForm();
          // this.isLoading=false
          // this.getActiveEmployeeData();
          // this.isSubmitDisabled = false;
          // this.isCheckBoxChecked = false;
          this.inviteeEmployeeID = null;
        },
      });
    }
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
