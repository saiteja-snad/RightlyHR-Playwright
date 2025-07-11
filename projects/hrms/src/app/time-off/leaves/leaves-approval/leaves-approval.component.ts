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
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
@Component({
  selector: 'app-leaves-approval',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe,
    NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './leaves-approval.component.html',
  styleUrl: './leaves-approval.component.scss'
})

export class LeavesApprovalComponent {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  selectempid = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  loading: boolean = false;
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
  selectedYear: any;

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService) { }

  ngOnInit(): void {
    // this.loggedinuser = this.authService.getToken();
    // this.empdata = this.loggedinuser;
    // this.getDataByLPID();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdTimeoff$.subscribe((id) => {
          if (id) {
            // Use the new employee ID here
            this.selectempid = id;
            this.getDataByEmpLPID();
          } else {
            this.loggedinuser = this.authService.getToken();
            this.empdata = this.loggedinuser;
            this.getDataByLPID();
          }
        });
      }
    });
  }

  getDataByLPID() {
    this.loading = true;
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Approved');
        } else {
          console.error("Invalid response format");
        }
        this.loading = false;
      },
      error: (reason: any) => {
        console.log(reason)
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getDataByEmpLPID() {
    this.loading = true;
    let empid = this.selectempid;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Approved');
        } else {
          console.error("Invalid response format");
        }
        this.loading = false;
      },
      error: (reason: any) => {
        console.log(reason)
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}