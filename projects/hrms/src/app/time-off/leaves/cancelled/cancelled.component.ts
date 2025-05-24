import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-cancelled',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './cancelled.component.html',
  styleUrl: './cancelled.component.scss'
})
export class CancelledComponent implements OnInit,OnDestroy{
 totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  selectempid = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
   // this.getDataByLPID();
    this.http.selectedEmployeeIdTimeoff$.subscribe((id) => {
      if (id) {
        // Use the new employee ID here
        this.selectempid = id;
        console.log('Updated employee ID:', id);
        // Example: this.loadEmployeeDetails(id);
        this.getDataByLPID();
      }
    });
  }

  getDataByLPID() {
    let empid =  this.selectempid || this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Cancelled');
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
    ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
