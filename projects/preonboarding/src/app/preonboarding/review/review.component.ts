import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpService } from '../../http-services/http.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../http-services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common'

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatPipe } from "../../pipes/date-format.pipe";
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
import { Ipersonal } from '../../models/personal-details.model';
import { ConfirmationIconComponent } from "../../../../../hrms/src/app/icons/confirmation-icon/confirmation-icon.component";
import { DocumentViewIconComponent } from "../../../../../hrms/src/app/icons/document-view-icon/document-view-icon.component";
@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RouterModule, NgxDocViewerModule, DateFormatPipe, DetailedStepProgressbarComponent, ConfirmationIconComponent, DocumentViewIconComponent],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  isCheckedoffer: boolean = false;
  isCheckedndcletter: boolean = false;
  prosempdata = {} as any;
  eduDetails: any;
  experiance: any;
  empDetails: any;
  DocImageUrl!: any;
  DocViewURL!: any;
  candidatesatus: any;
  candidateDocUrl: any;
  loadingcircle: boolean = false;
  constructor(private http: HttpService, private router: Router, private modalService: NgbModal, private location: Location) { }

  ngOnInit(): void {
    const currentstage = localStorage.getItem('currentStep') ?? "0";
    console.log(currentstage)
    if (parseInt(currentstage) > 6) {
      const storedstep = 8;
      localStorage.setItem('currentStep', storedstep.toString());
    } else {
      const storedstep = 6;
      localStorage.setItem('currentStep', storedstep.toString());
    }
    this.candidateDocUrl = localStorage.getItem('offerletterurl')
    this.prosempdata = JSON.parse(localStorage.getItem('prospectiveemppersonaldata') || '{}');
    this.getpersonalDetails();
    this.getEducationaDetails();
    this.getExpericanceDetails();
    this.getofferdetails();
    this.getJobApplicationDetails();
    this.getTraineeofferdetails();
    this.getndaofferdetails();
  }
  //function to go previous page
  navigatePrevious() {
    this.router.navigate(['/experience-details']);
  }
  navigatePreviousndcletter() {
    this.router.navigate(['/nda-contractor-letter']);
  }
  openconformatioModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename
        a.click()
      },
      error: reason => console.log(reason)
    })
  }

  getEducationaDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingEducation/${employeeId}`).subscribe({
      next: (data: any) => {
        this.eduDetails = data;
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getExpericanceDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingExperience/${employeeId}`).subscribe({
      next: (data: any) => {
        this.experiance = data;
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getpersonalDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empDetails = data;
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    });
  }

  //function to view the doc
  onViewClick(url: string) {
    const isImage = url.match(/\.(jpg|jpeg|png)$/i);
    const isPDF = url.toLowerCase().endsWith('pdf');
    if (isImage) {
      // Generate absolute URL for image
      this.handleImage(url);
    } else if (isPDF) {
      // Generate absolute URL for PDF
      this.handlePDF(url);
    } else {
      // Handle other document types
      console.log(`Unsupported file type: ${url}`);
    }
  }

  private handleImage(url: string) {
    const baseUrl = this.location.normalize('/');
    const imageUrl = `${baseUrl}${url}`;
    this.DocImageUrl = `${environment.viewUrl}${imageUrl}`;
    this.DocViewURL = null;
    console.log(`Image URL: ${this.DocImageUrl}`);
  }

  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = this.location.normalize('/');
    const pdfUrl = `${baseUrl}${url}`;
    this.DocViewURL = `${environment.viewUrl}${pdfUrl}`;
    this.DocImageUrl = null
    // Log pdfUrl to console
    console.log(`PDF URL: ${this.DocViewURL}`);
  }

  applicationData: any[] = [];
  getJobApplicationDetails() {
    const EmployeeId = this.prosempdata.employeeId;

    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const latestRecord = data.reduce((latest, current) => {
            return current.id > latest.id ? current : latest;
          });

          this.applicationData = [latestRecord];
        } else {
          this.applicationData = [];
          console.log('No job application details found.');
        }
      },
      error: (error: any) => {
        console.error('Error fetching job application details:', error);
      }
    });
  }

  submitReviw() {
    if (this.empDetails.substatus === 'NDA Letter Rejected') {
      const empdata = {
        "employeeId": this.prosempdata.employeeId,
        "comments": "Rejected"
      };
      this.subscription = this.http.postData('PreonboardingEmail/NdaLetterNotAccepted', empdata).subscribe({
        next: (data: any) => {
          this.loadingcircle = true;
          this.modalService.dismissAll();
          this.router.navigate(['/application-submited']);
        }
      })
    }
    if (this.empDetails.substatus === 'NDA Letter Released') {
      const empdata = {
        "employeeId": this.prosempdata.employeeId,
        "approvedBy": this.ndaletterDetails.ndaSentBy
      };
      this.subscription = this.http.postData('PreonboardingEmail/NdaLetterAccepted', empdata).subscribe({
        next: (data: any) => {
          this.loadingcircle = true;
          this.modalService.dismissAll();
          this.router.navigate(['/application-submited']);
        }
      })
    }
    else {
      const empdata = {
        "empId": this.prosempdata.employeeId,
      };
      this.subscription = this.http.postData('PreonboardingEmail/ReviewFormSubmit', empdata).subscribe({
        next: (data: any) => {
          this.loadingcircle = true;
          this.modalService.dismissAll();
          this.router.navigate(['/application-submited']);
        }
      })
    }
  }

  submitReviwForNda() {
    const empdata = {
      "empId": this.prosempdata.employeeId,
      "approvedBy": this.ndaletterDetails.ndaSentBy
    };
    this.subscription = this.http.postData('PreonboardingEmail/NdaLetterAccepted', empdata).subscribe({
      next: (data: any) => {
        this.loadingcircle = true;
        this.modalService.dismissAll();
        this.router.navigate(['/application-submited']);
      }
    })
  }

  //function to get the offerletter detailsbyid
  offerletterDetails = {} as any;
  getofferdetails() {
    let EmpId = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingOfferLetter/${EmpId}`).subscribe({
      next: (data: any) => {
        this.offerletterDetails = data;
        if (this.offerletterDetails.candidateStatus == 'Offer Letter Accepted') {
          this.isCheckedoffer = true;
          this.candidatesatus = 'Offer Letter Accepted';
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  //function to get the offerletter detailsbyid
  ndaletterDetails = {} as any;
  getndaofferdetails() {
    let EmpId = this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingNdaLetter/${EmpId}`).subscribe({
      next: (data: any) => {
        this.ndaletterDetails = data.data;
        if (this.ndaletterDetails.candidateStatus == 'NDA Letter Accepted') {
          this.isCheckedndcletter = true;
          this.candidatesatus = 'NDA Letter Accepted';
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
  //function to get the offerletter detailsbyid
  traineeofferletterDetails = {} as any;
  getTraineeofferdetails() {
    let offerId = this.prosempdata.employeeId;
    this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/${offerId}`).subscribe({
      next: (data: any) => {
        this.traineeofferletterDetails = data;
        if (this.traineeofferletterDetails.candidateStatus == 'Offer Letter Accepted') {
          this.isCheckedoffer = true;
          this.candidatesatus = 'Offer Letter Accepted';
        }
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  //function to update the offer letter details
  Updateofferdetails() {
    let updatedata = {
      id: this.offerletterDetails.id,
      empId: this.prosempdata.employeeId,
      offerSentDate: this.offerletterDetails.offerSentDate,
      offerSentStatus: this.offerletterDetails.offerSentStatus,
      offerSentBy: this.offerletterDetails.offerSentBy,
      documentUrl: this.candidateDocUrl,
      isdeleted: this.offerletterDetails.isdeleted,
      status: this.offerletterDetails.status,
      approvedDate: this.offerletterDetails.approvedDate,
      approvedBy: this.offerletterDetails.approvedBy,
      approver: this.offerletterDetails.approver,
      comments: this.offerletterDetails.comments,
      offerExpiryDate: this.offerletterDetails.offerExpiryDate,
      offerStartDate: this.offerletterDetails.offerStartDate,
      candidateStatus: this.candidatesatus,
      requestedDate: this.offerletterDetails.requestedDate,
      authoritySignature: this.offerletterDetails.authoritySignature,
      addressType: this.offerletterDetails.addressType,
    }
    this.subscription = this.http.postData(`PreonboardingOfferLetter/UPDATE`, updatedata).subscribe({
      next: (data: any) => {
        this.loadingcircle = true;
        if (this.prosempdata.substatus === 'NDA Letter Released') {
          this.submitReviwForNda();
        }
        else {
          this.submitReviw();
        }

      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}