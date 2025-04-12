import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Ipersonal } from '../../../interfaces/personal-modal';

@Component({
  selector: 'app-onboarding-documents',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding-documents.component.html',
  styleUrl: './onboarding-documents.component.scss'
})
export class OnboardingDocumentsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  comments!: any;
  postreason!: any;
  onboardingdocForm!: FormGroup
  
  constructor(private modalService: NgbModal, private authService: AuthService,private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');

  }
  reRequestEmail() {
    let loggedInUser = this.authService.getToken();
    let pdata = {
      empId: this.empinfo.employeeId,
      // userName: Value.emailaddress,
      // password: Value.password,
      // personEmail: this.postProspectiveEmpDetails.personalEmail,
      // personName: this.postProspectiveEmpDetails.firstName+" "+this.postProspectiveEmpDetails.lastName,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      status: this.postreason,
      comments: this.comments,
      // jobRole: this.selectedValueJobRoledrop,
    };
    if (loggedInUser.middleName) {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      pdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.subscription = this.http
      .postdata(`CustomEmail/RerequestDocuments`, pdata)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Email Sent Successfully');
        },
        error: (err: any) => {
          console.log(err);
        },
      });
   
  }
  initializeFamilyDetailsupdateForm(): void {
    this.onboardingdocForm = this.fb.group({
      memberNameupdate: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      dateOfBirthupdate: ['', Validators.required],
      relationShipIdupdate: ['', Validators.required],
      isDependentupdate: [null],
    });
  }
}
