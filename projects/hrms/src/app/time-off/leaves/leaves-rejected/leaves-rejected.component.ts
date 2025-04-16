import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-leaves-rejected',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './leaves-rejected.component.html',
  styleUrl: './leaves-rejected.component.scss'
})
export class LeavesRejectedComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
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

  constructor(
    private http: HttpService, 
    private authService: AuthService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getDataByLPID();
  }
  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        console.log(response);
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Rejected');
          let pendingCount = this.lpdata.length;
          console.log("Pending Records Count:", pendingCount);
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}
