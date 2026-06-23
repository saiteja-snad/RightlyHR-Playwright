import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { IProbationEmployees } from './probation-emp-module';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-probation-employees',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, TableModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './probation-employees.component.html',
  styleUrl: './probation-employees.component.scss'
})

export class ProbationEmployeesComponent implements OnInit, OnDestroy {
  @ViewChild('probationEmployeesTable') probationEmployeesTable!: Table;
  moduleinfo: string = '';
  searchValue: any;
  subscription!: Subscription
  probationemp = [] as any
  originalProbationEmp = [] as IProbationEmployees[]; // Store original unsorted data
  emp = {} as any;
  empinfo = {} as IProbationEmployees;
  StatusMsg: any;
  probationDuration: any;
  loader = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.getProbationEmployees();
  }

  getProbationEmployees() {
    this.loader = true;
    this.subscription = this.http.getData(`ProbationFlow/getProbationEmployeesStatus`).subscribe({
      next: (data: any) => {
        this.probationemp = data as IProbationEmployees[]
        this.originalProbationEmp = [...this.probationemp];
        this.probationemp.probationEndDate = this.formatDate(this.probationemp.probationEndDate);
        this.loader = false;
      }
    })
  }



  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    // this.router.navigate(['/personalinfo']);
    this.goToAccessibleRoute('/personalinfo');
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  formatDate(data: any): any {
    if (data) {
      // return moment(data).format('YYYY-MM-DD');
    }
    return data
  }

  navigateDashboard() {
    this.router.navigate(['/letters/lettes-tabs'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getFilteredAndSortedEmployees(): IProbationEmployees[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.probationemp;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.probationemp.filter((employee: IProbationEmployees) => {
      const fusionEmpId = employee.fusionEmpId?.toLowerCase() || '';
      const employeeName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.toLowerCase().trim();
      const workEmail = employee.workEmail?.toLowerCase() || '';
      const contactNumber = employee.contactnumber?.toString() || '';
      const designation = employee.jobDetails?.jobRole?.toLowerCase() || '';
      
      return fusionEmpId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             workEmail.includes(searchTerm) ||
             contactNumber.includes(searchTerm) ||
             designation.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.probationemp = [...this.originalProbationEmp];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.probationEmployeesTable) {
          this.probationEmployeesTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle nested job details fields
      if (field === 'designation') {
        val1 = a.jobDetails?.jobRole;
        val2 = b.jobDetails?.jobRole;
      } else if (field === 'employeeName') {
        // Handle employee name sorting (combine first, middle, last name)
        val1 = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim();
        val2 = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim();
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle Employee ID sorting (alphanumeric)
      if (field === 'fusionEmpId') {
        return event.order * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle contact number sorting (numeric)
      if (field === 'contactnumber') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      // Handle date sorting
      if (['dateOfJoining', 'probationEndDate', 'probationExtendedDate'].includes(field)) {
        const date1 = new Date(val1 ?? 0).getTime();
        const date2 = new Date(val2 ?? 0).getTime();
        return event.order * (date1 - date2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
}