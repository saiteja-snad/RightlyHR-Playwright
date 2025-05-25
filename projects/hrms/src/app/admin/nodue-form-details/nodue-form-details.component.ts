import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Ipersonal } from '../../Interfaces/personal-modal';
import { OpenModalService } from '../../services/open-modal.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nodue-form-details',
  imports: [TranslateModule,CommonModule, DateformatPipe],
  templateUrl: './nodue-form-details.component.html',
  styleUrl: './nodue-form-details.component.scss'
}) 
export class NodueFormDetailsComponent implements OnInit,OnDestroy {
  subscription!:Subscription;
  empdata={} as Ipersonal;
  Status:any
  nodueclearancedetails=new BehaviorSubject<any[]>([]) ;
  jobdetails={} as any;
  authorityDetails={} as any;
  previousroute!:any;
  isLoading=false;
  constructor(private http:HttpService,private conformationPopup: OpenModalService,private modalService: NgbModal,private location: Location){
    effect(() => {
      if (this.http.tirggerCountSignal().employeeId) {
        console.log(this.http.tirggerCountSignal().employeeId);
        this.getEmployeeId(this.http.tirggerCountSignal().employeeId)
      }
    });
  }
  ngOnInit(): void {
 
  }
    //function to go back
    back(){
      this.modalService.dismissAll();
      this.location.back()
    }
    //function to get employee by id
    getEmployeeId(employeeId:number) {
      this.subscription = this.http
        .getData(`Employeedata/${employeeId}`)
        .subscribe({
          next: (data: any) => {
            this.empdata = data as Ipersonal;
            this.getNodueClearance();
            this.getJobDetails();
            this.getAuthorityDetails();
            this.getSeparationRequest();
          },
          error: (err: any) => {
            console.log(err);
            this.conformationPopup.openErrorModal('Insertion of data faild');
          },
        });
    }
     //get offer letter Authority list
     getAuthorityDetails() {
      let offertype = 'No Due Certificate';
      this.subscription = this.http
        .getData(`SignaturesList?LetterType=${offertype}`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.authorityDetails = data[0];
            console.log(this.authorityDetails);
            
          },
        });
    }
//function to get the 
  getNodueClearance(){
     let employeeId = parseInt(this.empdata.employeeId)
    this.subscription=this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
      next:(data:any)=>{
       // console.log(data);
        this.nodueclearancedetails.next(data.filter((ele:any)=>ele.status?.toLowerCase()=='approved'))
        console.log(this.nodueclearancedetails);      
      }
    })
  }
  getJobDetails() {
    let EmployeeId = parseInt(this.empdata.employeeId)
    console.log(EmployeeId);

    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.jobdetails = data[0];
      }
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
  }

//function to get the separation request details
getSeparationDetails={} as any;
getSeparationRequest(){
  let EmployeeId = parseInt(this.empdata.employeeId)
  this.subscription=this.http.getData(`SeparationRequests/getbyemployeeId?Id=${EmployeeId}`).subscribe({
    next:(response:any)=>{
      console.log(response);
      
      this.getSeparationDetails = response.find((ele: any) => {
        return (ele.status?.toLowerCase() === 'processed'|| ele.status?.toLowerCase() === 'early relieving processed' );
      });
        console.log(this.getSeparationDetails);
        
    }
  })


  
}
  formFile={} as any;
FormDownload() {
  this.isLoading=true;
  const pdfContent = document.getElementById('content');
  if (pdfContent) {
    html2canvas(pdfContent, { scale: 3 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      const fileName = `${this.empdata.firstName}_${this.empdata.middleName}_${this.empdata.lastName }_${new Date().getTime()}_No Due form.pdf`;
      pdf.save(fileName);
      const blob = pdf.output('blob');
      console.log(blob);

      // Creating form file to upload into Azure
      const file = new File([blob], fileName, {
        type: 'application/pdf',
      });
      console.log(file);
      this.formFile = file;
      this.nodueFormUpload(this.empdata.employeeId,this.formFile)
    });
  }
    
  
    // this.router.navigate(["/timeoffleaves/job"])

  }
  //to store file to the azure and return to the url
 nodueFormUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/No Due Form/${empId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          console.log(data.path)
        this.postsepartionDetails(data.path);

        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('file upload  is failed');
        },
      });
  }
    //to post OfferLetter Details to the offerletter table
    postsepartionDetails( docurl: string) {
        //  this.getSeparationDetails = this.getSeparationDetails || {};
         console.log(this.getSeparationDetails)
  this.getSeparationDetails.documentURL = docurl;
      this.subscription = this.http
        .postdata('SeparationRequests/FormSubmission', this.getSeparationDetails)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.isLoading=false;
            this.modalService.dismissAll();
            this.back();
            this.conformationPopup.openSuccessModal("No due clearance submitted successfully")
       
          },
          error: (reason: any) => {
            this.isLoading=false;
            console.log(reason);
          },
        });
    }
    ngOnDestroy(): void {
      // Clean up any subscriptions or resources
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}
