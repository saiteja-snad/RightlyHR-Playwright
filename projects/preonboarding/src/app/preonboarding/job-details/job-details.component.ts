import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../http-services/http.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-job-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})

export class JobDetailsComponent implements OnInit {
  subscription!: Subscription;
  currentStep = 1;
  prospectiveEmployeeData = {} as any;
  jobApplicationData: any;
  empdata = {} as any;
  substatus: any;
  offerstatus: any;
  documentRequestStatus: any;
  documentReviewStatus: any;
  offerletterrejected: any;
  documentsRejected: any;
  // progress bar 
  Inprogress = '/images/yellowcheck.png';
  completed = '/images/check.png';
  onboarding = '/images/hands.png';
  nextarrow = '/images/right-arrow.png';
  rejecteimg = '/images/rejected.png'
  documentsRequested = '/images/right-arrow.png';
  documentsReview = '/images/right-arrow.png';
  offerLetter = '/images/right-arrow.png';

  constructor(private router: Router, private http: HttpService) { }

  ngOnInit(): void {
    const storedStep = localStorage.getItem('currentStep');
    if (storedStep) {
      this.currentStep = parseInt(storedStep);
    }
    this.prospectiveEmployeeData = JSON.parse(localStorage.getItem('prospectiveemppersonaldata') || '{}');
    this.getJobApplicationDetails();
    this.getprospectivempdata();
  }

  getprospectivempdata() {
    let employeeId = parseInt(this.prospectiveEmployeeData.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.empdata = data
        this.substatus = this.empdata.substatus?.toLowerCase()
        console.log(this.substatus);
        const OfferLetter = ['offer letter generated', 'offer letter released', 'offer letter regenerated', 'offer letter accepted'];
        const DocumentsInReview = ['documents submitted', 'document in review' ,'documents verified'];
        const DocumentsRequeste = ['requested documents'];
        const offerRejectetd = ['offer letter rejected'];
        const documentsrejected = ['documents rejected']
        this.offerstatus = OfferLetter.some((value) =>
          this.substatus.includes(value)
        );
        this.documentReviewStatus = DocumentsInReview.some((value) =>
          this.substatus.includes(value)
        );
        this.documentRequestStatus = DocumentsRequeste.some((value) =>
          this.substatus.includes(value)
        );
        this.documentsRejected = documentsrejected.some((value) =>
          this.substatus.includes(value)
        );
        this.offerletterrejected = offerRejectetd.some((value) =>
          this.substatus.includes(value)
        );
        this.checkStatus();
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['']);
        }
      }
    });
  }

  getJobApplicationDetails() {
    let EmployeeId = this.prospectiveEmployeeData.employeeId;
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobApplicationData = data;
        console.log(this.jobApplicationData);
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    });
  }

  checkStatus() {
    if (this.offerstatus) {
      this.onboarding = this.onboarding;
      this.offerLetter = this.Inprogress;
      this.documentsRequested = this.completed;
      this.documentsReview = this.completed;
    } else if (this.documentRequestStatus) {
      this.offerLetter = this.nextarrow;
      this.documentsRequested = this.completed;
      this.documentsReview = this.nextarrow;
    } else if (this.documentReviewStatus) {
      this.offerLetter = this.nextarrow;
      this.documentsRequested = this.completed;
      this.documentsReview = this.Inprogress;
    }
    else if (this.documentsRejected) {
      this.offerLetter = this.nextarrow;
      this.documentsRequested = this.completed;
      this.documentsReview = this.Inprogress;
    }
    else if (this.offerletterrejected) {
      this.offerLetter = this.rejecteimg;
      this.documentsRequested = this.completed;
      this.documentsReview = this.completed;
      this.onboarding = this.Inprogress;
    }
  }
}