import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Ilpid } from '../../../Interfaces/timoff-model';
@Component({
  selector: 'app-on-be-half-of-waiting-for-approval',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './on-be-half-of-waiting-for-approval.component.html',
  styleUrl: './on-be-half-of-waiting-for-approval.component.scss'
})

export class OnBeHalfOfWaitingForApprovalComponent {
  loggedinuser = {} as any;
  cadidateEmployeeId!:number;
  subscription!: Subscription;
  waitingForApprovalLeaves: any = [];
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  lpdata = [] as Ilpid[];
  waitingforapprovalCount = 0;
  
  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService,) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.trigger()) {   
        this.cadidateEmployeeId = parseInt(localStorage.getItem('onbehalfof') as string) ;
        if (this.cadidateEmployeeId  != null ) {
          this.getDataByLPID();
        } 
        this.http.resetTriggerSignal();
      }
    });
   }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.cadidateEmployeeId =parseInt(localStorage.getItem('onbehalfof') as string) ;
    if(this.cadidateEmployeeId){
      this.getDataByLPID();

    }
  }

  getDataByLPID() {
   
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}`).subscribe({
      next: (response: any) => {
        console.log(response);
        if (Array.isArray(response)) {
          this.waitingForApprovalLeaves = response.filter(item => item.status === 'Waiting for Approval');
         
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}
