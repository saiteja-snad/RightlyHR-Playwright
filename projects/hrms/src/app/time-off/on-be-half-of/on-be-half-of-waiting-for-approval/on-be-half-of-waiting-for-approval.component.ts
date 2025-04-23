import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  empdata = {} as any;
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

  constructor(private http: HttpService, private authService: AuthService,) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('onbehalfof') || '{}');
    this.getDataByLPID();
  }

  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        console.log(response);
        if (Array.isArray(response)) {
          this.waitingForApprovalLeaves = response.filter(item => item.status === 'Waiting for Approval');
          let pendingCount = this.waitingForApprovalLeaves.length;
          console.log("Pending Records Count:", pendingCount);
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}
