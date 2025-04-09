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
@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, RouterModule, NgxDocViewerModule, DateFormatPipe],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  constructor(
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute,
    //private _userAcessService: UserAccessService,
  private modalService: NgbModal,
    private authService: AuthService,
    private location: Location
  ) {}

  isCheckedoffer: boolean = false;
 

  prosempdata = {} as any;
  eduDetails: any;
  experiance: any;
  empDetails: any;
  DocImageUrl!: any;
  DocViewURL!: any;
  candidatesatus:any;
  candidateDocUrl:any;
  loadingcircle:boolean=false
 

  ngOnInit(): void {
    const storedstep = 6;
    localStorage.setItem('currentStep', storedstep.toString());
    this.candidateDocUrl=localStorage.getItem('offerletterurl')
    this.prosempdata = JSON.parse(
      localStorage.getItem('prospectiveemppersonaldata') || '{}'
    );
    console.log(this.prosempdata.employeeId);
    
    this.getpersonalDetails();
    this.getEducationaDetails();
    this.getExpericanceDetails();
    this.getofferdetails();
    this.getJobApplicationDetails();
    this.getTraineeofferdetails();
  }
  //function to go previous page
  navigatePrevious() {
    this.router.navigate(['/experience-details']);
  }

  openconformatioModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
  onSelectDownload(file:any){
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile',file).subscribe({
      next:(res:any)=>{
       let blob:Blob = res.body as Blob;
        let a = document.createElement('a')
        a.href =window.URL.createObjectURL(blob)
        let filename=file.split('/')[file.split('/').length -1];
        a.download=filename
        a.click()
  
      },
      error:reason=>console.log(reason)
    })
  
  }
 



  getEducationaDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    //console.log(employeeId);

    this.subscription = this.http
      .getData(`PreonboardingEducation/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.eduDetails = data;
          //console.log(this.eduDetails);
        },
        error: (reason: any) => console.log(reason),
      });
  }

  getExpericanceDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    // let employeeId = '3367';
    this.subscription = this.http
      .getData(`PreonboardingExperience/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.experiance = data;
         // console.log(this.experiance);
        },
        error: (reason: any) => console.log(reason),
      });
  }

  getpersonalDetails() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    // let employeeId = '3367';
    this.subscription = this.http
      .getData(`PreonboardingEmployeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
         // console.log(data);
          this.empDetails = data;
        },
        error:(err:any)=>{
          console.log(err);
          if(err.status=401){
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
    this.DocImageUrl=null
    // Log pdfUrl to console
    console.log(`PDF URL: ${this.DocViewURL}`);
  }

  appliccationData: any;
  getJobApplicationDetails() {
    let EmployeeId = this.prosempdata.employeeId;
    this.subscription = this.http
      .getData(`PreonboardingJobDetails/Empname/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
         // console.log(data);
          
          this.appliccationData = data;
          console.log(this.appliccationData);
        },
        error: (error: any) => {
          console.log(error);
          
        }
      });
  }



  submitReviw() {
    const empdata = {
      "empId": this.prosempdata.employeeId,
    };
  this.subscription = this.http.postData('PreonboardingEmail/ReviewFormSubmit', empdata).subscribe({
      next: (data: any) => {
       // console.log(data);
        this.loadingcircle=true
        this.modalService.dismissAll()
        this.router.navigate(['/application-submited']);
      }
    })
  }

  //function to get the offerletter detailsbyid
  offerletterDetails={} as any;
  getofferdetails(){
    let EmpId=this.prosempdata.employeeId
    this.subscription = this.http.getData(`PreonboardingOfferLetter/${EmpId}`).subscribe({
      next: (data: any) => {
       // console.log(data);
        this.offerletterDetails=data
        if(this.offerletterDetails.candidateStatus =='Offer Letter Accepted'){
          this.isCheckedoffer = true;
          this.candidatesatus='Offer Letter Accepted'
        }
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })
  }
    //function to get the offerletter detailsbyid
    traineeofferletterDetails={} as any;
    getTraineeofferdetails(){
      let offerId=this.prosempdata.employeeId
      console.log(offerId)
      this.subscription = this.http.getData(`PreOnboardingTraineeOfferLetter/${offerId}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.traineeofferletterDetails=data
          if(this.traineeofferletterDetails.candidateStatus =='Offer Letter Accepted'){
            this.isCheckedoffer = true;
            this.candidatesatus='Offer Letter Accepted'
          }
        },
        error:(err:any)=>{
          console.log(err);
          
        }
      })
    }
//function to update the offer letter details
Updateofferdetails(){
  
  
  let updatedata={
    id: this.offerletterDetails.id,
    empId:this.prosempdata.employeeId,
    offerSentDate: this.offerletterDetails.offerSentDate,
    offerSentStatus: this.offerletterDetails.offerSentStatus,
    offerSentBy: this.offerletterDetails.offerSentBy,
    documentUrl:  this.candidateDocUrl,
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
  this.subscription = this.http.postData(`PreonboardingOfferLetter/UPDATE`,updatedata).subscribe({
    next: (data: any) => {
      //console.log(data);
      this.loadingcircle=true
        this.submitReviw();
     
    },
    error:(err:any)=>{
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
