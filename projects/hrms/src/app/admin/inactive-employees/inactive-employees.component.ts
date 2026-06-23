import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iinactive } from './inactive-model';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-inactive-employees',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, TableModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-employees.component.html',
  styleUrl: './inactive-employees.component.scss'
})

export class InactiveEmployeesComponent implements OnInit, OnDestroy {
  @ViewChild('inactiveEmployeesTable') inactiveEmployeesTable!: Table;
  subscription!: Subscription;
  InActive = [] as Iinactive[];
  originalInActive = [] as Iinactive[]; // Store original unsorted data
  emp = {} as any;
  searchValue: any;
  loader = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata('Inactive');
  }

  //function for inactive employees
  empdata(status:any) {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.InActive = data as Iinactive[];
        this.originalInActive = [...this.InActive];
        this.loader = false;
      },
      error: (reason: any) => {
        console.log(reason);
        this.loader = false;
      }
    });
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

  getFilteredAndSortedEmployees(): Iinactive[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.InActive;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.InActive.filter((employee: Iinactive) => {
      const fusionEmpId = employee.fusionEmpId?.toLowerCase() || '';
      const employeeName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.toLowerCase().trim();
      const workEmail = employee.workEmail?.toLowerCase() || '';
      const contactNumber = employee.contactnumber?.toString() || '';
      const location = employee.jobDetails?.[0]?.lopcation?.toLowerCase() || '';
      const subLocation = employee.jobDetails?.[0]?.subLocation?.toLowerCase() || '';
      const shiftName = employee.jobDetails?.[0]?.shiftName?.toLowerCase() || '';
      const designation = employee.jobDetails?.[0]?.jobRole?.toLowerCase() || '';
      
      return fusionEmpId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             workEmail.includes(searchTerm) ||
             contactNumber.includes(searchTerm) ||
             location.includes(searchTerm) ||
             subLocation.includes(searchTerm) ||
             shiftName.includes(searchTerm) ||
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
        this.InActive = [...this.originalInActive];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.inactiveEmployeesTable) {
          this.inactiveEmployeesTable.reset();
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
      if (['location', 'subLocation', 'shiftName', 'designation'].includes(field)) {
        switch (field) {
          case 'location':
            val1 = a.jobDetails?.[0]?.lopcation;
            val2 = b.jobDetails?.[0]?.lopcation;
            break;
          case 'subLocation':
            val1 = a.jobDetails?.[0]?.subLocation;
            val2 = b.jobDetails?.[0]?.subLocation;
            break;
          case 'shiftName':
            val1 = a.jobDetails?.[0]?.shiftName;
            val2 = b.jobDetails?.[0]?.shiftName;
            break;
          case 'designation':
            val1 = a.jobDetails?.[0]?.jobRole;
            val2 = b.jobDetails?.[0]?.jobRole;
            break;
        }
      } else if (field === 'employeeName') {
        // Handle employee name sorting (combine first, middle, last name)
        val1 = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim();
        val2 = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim();
      } else if (field === 'dateOfJoining') {
        // Handle date sorting
        const date1 = new Date(a.dateOfJoining ?? 0).getTime();
        const date2 = new Date(b.dateOfJoining ?? 0).getTime();
        return event.order * (date1 - date2);
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

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}