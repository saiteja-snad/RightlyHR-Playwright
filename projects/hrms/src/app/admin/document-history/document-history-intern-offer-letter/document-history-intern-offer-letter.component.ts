import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IOfferLetterDetails } from '../../../Interfaces/documentsHistory';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { OfferletterdashboardpipePipe } from '../../../Pipes/offerletterdashboardpipe.pipe';



@Component({
  selector: 'app-document-history-intern-offer-letter',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DateformatPipe, FormsModule, OfferletterdashboardpipePipe],
  templateUrl: './document-history-intern-offer-letter.component.html',
  styleUrl: './document-history-intern-offer-letter.component.scss'
})
export class DocumentHistoryInternOfferLetterComponent {
  subscription!: Subscription;
  searchValue: any;
  rejectDocument!: FormGroup;
  traineeofferletters = [] as IOfferLetterDetails[];
  loginuserdata = {} as any;
  selectedValuesOfOffer = {} as any;
  employeedata = {} as any;

  
  constructor(
    private router: Router, 
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private authService: AuthService, 
    private conformationPopup: OpenModalService
  ) 
  {

    this.initializeForm();

  }


  ngOnInit(): void {

    this.loginuserdata = this.authService.getToken()
    this.initializeForm();
    this.getTraineeOfferLetters();
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  initializeForm() {
    this.rejectDocument = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  getTraineeOfferLetters() {
    this.subscription = this.http.getData('TraineeOfferLetter/getAllNames/approverNames').subscribe({
      next: (data: any) => {
        console.log(data);
        this.traineeofferletters = data;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  onSelectDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          // console.log(fileName);

          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }

  releaseTraineeOfferLetter(Values: any) {
    let loggedInUser = this.authService.getToken();
   // console.log(loggedInUser);
    let updateTraineeOfferLetterDetails = {
      id: Values.id,
      employeeId: Values.empId,
      offerSentDate: Values.offerSentDate,
      offerSentStatus: Values.offerSentStatus,
      offerSentBy: Values.offerSentBy,
      documentUrl: Values.documentUrl,
      isdeleted: false,
      status: "Released",
      approvedDate: new Date(),
      approvedBy: loggedInUser.employeeId,
      approver: Values.approver,
      comments: null,
      requestedDate: null,
      offerExpiryDate:Values.offerExpiryDate,
      offerStartDate:Values.offerStartDate,
      authoritySignature: Values.authoritySignature,
      addressType: Values.addressType,
      note:Values.note,
      durationOfTraining:Values.offerdurationOfTraining,
    };
    this.subscription = this.http
      .postdata('TraineeOfferLetter/UPDATE', updateTraineeOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.conformationPopup.openSuccessModal('Trainee Offer Released Successfully');
          this.getTraineeOfferLetters();
          this.employeeEmailTrainee(Values)
          if (data) {
          }
         
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Released Failed');
        },
      });
  }

  updateTraineeOfferDetails(Values: any) {
   
     let loggedInUser = this.authService.getToken();
    
     let updateTraineeOfferLetterDetails = {
       id: Values.id,
       employeeId: Values.empId,
       offerSentDate: Values.offerSentDate,
       offerSentStatus: Values.offerSentStatus,
       offerSentBy: Values.offerSentBy,
       documentUrl: Values.documentUrl,
       isdeleted: false,
       status: "Approved",
       approvedDate: new Date(),
       approvedBy: loggedInUser.employeeId,
       approver: Values.approver,
       comments: '',
       requestedDate: '2024-02-20',
       offerExpiryDate:Values.offerExpiryDate,
       offerStartDate:Values.offerStartDate,
       authoritySignature: Values.authoritySignature,
       addressType: Values.addressType,
       note:Values.note,
       durationOfTraining:Values.offerdurationOfTraining,
     };
    // console.log(updateTraineeOfferLetterDetails);
 
     this.subscription = this.http
       .postdata('TraineeOfferLetter/UPDATE', updateTraineeOfferLetterDetails)
       .subscribe({
         next: (data: any) => {
           console.log(data);
           this.conformationPopup.openSuccessModal('Trainee Offer Approved Successfully');
           this.getTraineeOfferLetters();
           this.ApproveEmailTrainee(Values)
           if (data) {
           }
          
         },
         error: (reason: any) => {
           console.log(reason);
           this.conformationPopup.openErrorModal('Update Failed');
         },
       });
   }

   ApproveEmailTrainee(personValues: any) {
    let datas = personValues
   // console.log(datas);

    let loggedInUser = this.authService.getToken();
    let emailData = {
      personName: datas.offerSentByName,
      personEmail: datas.offerSentByEmail,
      personRole: datas.jobRole,
      employeeId: datas.offerSentBy,
      documentUrl: personValues.documentUrl,
      workLocation: datas.workLocation,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName}  ${loggedInUser.lastName}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: loggedInUser.employeeId,
      approvedByName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      firstName: datas.employeeName,
      //lastName:loggedInUser.lastName,
      comments: null
    }
    if(loggedInUser.middleName){

      emailData.senderName =`${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
      emailData.approvedByName= `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    }else{
      emailData.senderName =`${loggedInUser.firstName} ${loggedInUser.lastName}`
      emailData.approvedByName= `${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    console.log(emailData);

    this.subscription = this.http.postdata(`CustomEmail/offerApproval`, emailData).subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.conformationPopup.openSuccessModal('Email Sent Successfully');
        }, 3000);
        this.getTraineeOfferLetters();
        this.ApprovedTaineenotification(datas);
        if (data) {
        }
      }
    })

  }

  ApprovedTaineenotification(personname: any) {
    const currentDate = new Date();
    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Trainee Offer Letter Approval`,
      sentTo: personname.offerSentByEmail,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName} ${loggedInUser?.middleName ?? ''} ${loggedInUser?.lastName} Approved 
         ${personname.employeeName} Trainee Offer Letter`,
      empId: personname.offerSentByName
    }
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        console.log(data);

        this.getTraineeOfferLetters();
  
      },
      error:(err:any)=>{
        console.log(err);
        
      }
    })
  }


  employeeEmailTrainee(Values:any) {
    
    let loggedInUser = this.authService.getToken();
    console.log(loggedInUser.middleName);
    
    let emaildetails = {
      personEmail:Values.emailaddress,
      senderEmail:loggedInUser.workEmail,
      senderName:"",
      personName:Values.employeeName,
      personRole:Values.jobRole,
      employeeId:Values.empId,
      documentUrl:Values.documentUrl,
      workLocation:Values.workLocation,
      offerStartDat:Values.offerStartDate,
      offerExpiryDate:Values.offerExpiryDate
    }
    if(loggedInUser.middleName){
  
      emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    }else{
      emaildetails.senderName =`${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    console.log(emaildetails);
  
    this.subscription = this.http.postdata(`CustomEmail/offerletter`, emaildetails).subscribe({
      next: (data: any) => {
        setTimeout(() => {
          this.conformationPopup.openSuccessModal('Email Sent Successfully');
        }, 3000);
        if (data) {
          this.getTraineeOfferLetters();
        }
      },
      error: (err: any) => {
        console.log(err);
  
      }
    })
  }

  //function to get the data of selected
  SelectData(value: any) {
    this.selectedValuesOfOffer = value
    console.log(this.selectedValuesOfOffer);
    this.getEmployeeId(value.empId)
  }
  //function to get the employee details based on the employee id
  getEmployeeId(Values: any) {

    let employeeId = Values
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeedata = data

      },
      error: reason => console.log(reason)
    });
  }
  //post reason to offerletter table 
  PostReasonandUpdateTraineeOfferDetails() {
    
    let loggedInUser = this.authService.getToken();
    console.log(loggedInUser);
    let updateOfferLetterDetails = {
      id: this.selectedValuesOfOffer.id,
      employeeId: this.selectedValuesOfOffer.empId,
      offerSentDate: this.selectedValuesOfOffer.offerSentDate,
      offerSentStatus: "Obsolete",
      offerSentBy: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      isdeleted: false,
      status: "Rejected",
      approvedDate: this.selectedValuesOfOffer.approvedDate,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approver: this.selectedValuesOfOffer.approver,
      comments: this.rejectDocument.value.reason,
      requestedDate: null,
      offerExpiryDate:this.selectedValuesOfOffer.offerExpiryDate,
      offerStartDate:this.selectedValuesOfOffer.offerStartDate,
      authoritySignature: this.selectedValuesOfOffer.authoritySignature,
      addressType: this.selectedValuesOfOffer.addressType,
      note:this.selectedValuesOfOffer.note,
      durationOfTraining:this.selectedValuesOfOffer.offerdurationOfTraining,
    };
    console.log(updateOfferLetterDetails);

    this.subscription = this.http
      .postdata('TraineeOfferLetter/UPDATE', updateOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.rejectDocument.reset();
          this.modalService.dismissAll();
          this.updatetraineeemployeestatus(data)
          this.rejectTraineeEmail();
          //this.RejectTraineenotification();
          this.getTraineeOfferLetters();
          
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //function to update the employee substatus
  updatetraineeemployeestatus(Value:any){
    console.log(Value.employeeId);
    
      this.employeedata.employeeId=Value.employeeId,
      this.employeedata.empstatus= 'Trainee Prospective'
      this.employeedata.substatus="Offer Letter Rejected By Manager"
      this.subscription=this.http.postdata('Employeedata/UPDATER',this.employeedata).subscribe({
         next:(data:any)=>{
          console.log(data);
          
         }
      })
    }

  //Function for Reject Email
  rejectTraineeEmail() {
    let loggedInUser = this.authService.getToken();
    let emaildate = {
      personName: this.selectedValuesOfOffer.offerSentByName,
      personEmail: this.selectedValuesOfOffer.offerSentByEmail,
      personRole: this.selectedValuesOfOffer.jobRole,
      employeeId: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      workLocation: this.selectedValuesOfOffer.workLocation,
      senderName: `${loggedInUser?.firstName ?? ''} ${loggedInUser?.middleName ?? ''} ${loggedInUser?.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approvedByName: this.selectedValuesOfOffer.approvedByName,
      firstName: this.selectedValuesOfOffer.employeeName,
      // lastName: string,
      comments: this.rejectDocument.value.reason
    }
    console.log(emaildate);
    
    this.subscription = this.http.postdata(`CustomEmail/OfferRejection`, emaildate).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data) {
          setTimeout(() => {
            this.conformationPopup.openSuccessModal('Email Sent Successfully');
          }, 3000);
          this.getTraineeOfferLetters();
        }
        
      },
      error: (err: any) => {
        console.log(err);
        this.conformationPopup.openErrorModal('Email Sent Failed');
      }
    })

  }

  //function for reject notification
  Rejectnotification() {
    const currentDate = new Date();

    const loggedInUser = this.authService.getToken();
    const senddata = {
      message: `Offer Letter Rejected`,
      sentTo: this.selectedValuesOfOffer.workEmail,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName} ${loggedInUser.middleName ?? ''} ${loggedInUser?.lastName} Rejected 
           ${this.selectedValuesOfOffer.employeeName} Offer Letter`,
      empId: this.selectedValuesOfOffer.offerSentBy
    }
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        console.log(data);
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
