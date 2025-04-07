import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { IJob } from '../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { SearchfilterPipe } from "../../pipes/searchfilter.pipe";
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-onboarding-request',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, SearchfilterPipe],
  templateUrl: './onboarding-request.component.html',
  styleUrl: './onboarding-request.component.scss'
})
export class OnboardingRequestComponent {
  dynamicData = [] as any;
  empinfo = {} as IJob;
  subscription!: Subscription;
  onboardDuration:any;
  searchValue:any;
  StatusMsg : any;
  selecteddata:any;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  authService: any;

  constructor(private modalService: NgbModal,private http: HttpService,private conformationPopup: OpenModalService) 
  { }
  ngOnInit(): void {
    
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getOnboardrequest();
    this.getonboardPeriodData();
  }
  onRowsChange() {
    this.first = 0;

  }
  getOnboardrequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchyTrainees/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.dynamicData = data; 
        this.getonboardPeriodData();
      },
      error: (error: any) => {
        console.error('Error fetching onboard request data:', error);
      }
    });
  }
  getonboardPeriodData(){
    this.subscription=this.http.getData(`ServingPeriods`).subscribe({
       next:(res:any)=>{
        console.log(res);
       
        let durationValue=res.find((ele:any)=>{
          return ele.servingPeriodType?.toLocaleLowerCase()=='button before onboard'
        })
        console.log(durationValue);
        this.onboardDuration=durationValue.duration


       }
    })
   }

   isTrainingEndDateComplete(trainingEndDate: string): boolean {
    if (trainingEndDate) {
      const endDate = new Date(trainingEndDate);
      const buttonEnabledDate = new Date(endDate);
      buttonEnabledDate.setDate(endDate.getDate() - parseInt(this.onboardDuration));
      const currentDate = new Date();
      const isComplete = currentDate >= buttonEnabledDate && currentDate <= endDate;
      return isComplete;
    }
    return false;
  }

  
   shouldShowButton(trainingEndDate: string): boolean {
    const shouldShow = (this.isTrainingEndDateComplete(trainingEndDate)) ;
    return shouldShow;
  }
  shouldShowButtonWhenExtended(trainingEndDate: string, status: string, empID: number, extendedDate: string): boolean {
    
    let filterdata = this.dynamicData.filter((item: any) => item.employeeid === empID && item.status === 'Extended');
    
    filterdata.sort((a: any, b: any) => new Date(b.extendedDate).getTime() - new Date(a.extendedDate).getTime());

    const mostRecentExtended = filterdata.find((item: any) => item.status === 'Extended');
    const shouldShow = mostRecentExtended && mostRecentExtended.extendedDate === extendedDate;
    const isProcessed = this.dynamicData.some((item: any) => item.employeeid === empID && item.status === 'Processed' );
    const isApproved = this.dynamicData.some((item: any) => item.employeeid === empID &&  item.status === 'Approved' );
    const isWaiting = this.dynamicData.some((item: any) => item.employeeid === empID && item.status === 'Waiting for Approval' );
    return shouldShow && !isProcessed && !isApproved && !isWaiting;
}
requestForOnboard(Value:any) {
  const employeeId = parseInt(this.empinfo.employeeId);
  const currentDate = new Date().toISOString(); 
  const requestBody = {
    employeeid: Value.employeeid,
    requestedById: this.authService.getToken().employeeId,
    trainingStartDate: Value.emptrainingStartDate,
    trainingEndDate: Value.emptrainingEndDate,
    extendedDate: null,
    updatedDate: null,
    createdDate: null,
    requestedDate: currentDate, 
    status: 'Waiting for Approval',
    comments: null,
    feedbackComments: null
  };

  // Send the POST request
  this.http.postdata('onboardRequest', requestBody).subscribe({
    next: (response: any) => {
      

      const modalElement = document.getElementById('successhide');
      this.conformationPopup.openSuccessModal('Updated Successfully');
      // if (modalElement) {
      //   modalElement.classList.add('show');
      //   modalElement.style.display = 'block';
      //   this.StatusMsg = 'Onboard Request submitted successfully'
      // }
     

    },
    error: (error: any) => {
      // alert(error.error.message);
          const modalElement = document.getElementById('errorhide');
          this.conformationPopup.openErrorModal('Updated Successfully');
          // if (modalElement) {
          //   modalElement.classList.add('show');
          //   modalElement.style.display = 'block';
          //   this.StatusMsg = error.error.message;
          // }
      // setTimeout(function () {
      //   location.reload();
      // }, 2000);


   //   window.location.reload();
    }
  });
}
fustiontostorefeedback(data:any){
  this.selecteddata=data;
}

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
}
