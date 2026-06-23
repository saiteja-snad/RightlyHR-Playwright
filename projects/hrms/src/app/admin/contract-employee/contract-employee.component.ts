import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Iprospective } from '../prospective-employees/Prospective-model';

@Component({
  selector: 'app-contract-employee',
  imports: [CommonModule, FormsModule, TranslateModule, TableModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './contract-employee.component.html',
  styleUrl: './contract-employee.component.scss'
})
export class ContractEmployeeComponent implements OnInit, OnDestroy {
  @ViewChild('contractEmployeesTable') contractEmployeesTable!: Table;
  moduleinfo: string = '';
  contract = [] as Iprospective[];
  originalContract = [] as Iprospective[]; // Store original unsorted data
  searchValue: any;
  subscription!: Subscription;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  loader = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe((selectedObj) => {
      this.empdata();
    });
  }

  empdata() {
    this.loader = true;
    const status='Prospective Contract'
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.contract = data;
        this.originalContract = [...this.contract];
        this.loader = false;
      },
      error: (reason: any) => {
        console.log(reason);
        this.loader = false;
      },
    });
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data;
      },
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    // this.router.navigate(['/personalinfo']);
    this.goToAccessibleRoute('/personalinfo')
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  getFilteredAndSortedEmployees(): Iprospective[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.contract;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.contract.filter((employee: Iprospective) => {
      const employeeId = employee.employeeId?.toString() || '';
      const employeeName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.toLowerCase().trim();
      const personalEmail = employee.emailaddress?.toLowerCase() || '';
      const contactNumber = employee.contactnumber?.toString() || '';
      const location = employee.jobDetails?.[0]?.lopcation?.toLowerCase() || '';
      const subLocation = employee.jobDetails?.[0]?.subLocation?.toLowerCase() || '';
      const designation = employee.jobDetails?.[0]?.jobRole?.toLowerCase() || '';
      const substatus = employee.substatus?.toLowerCase() || '';
      
      return employeeId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             personalEmail.includes(searchTerm) ||
             contactNumber.includes(searchTerm) ||
             location.includes(searchTerm) ||
             subLocation.includes(searchTerm) ||
             designation.includes(searchTerm) ||
             substatus.includes(searchTerm);
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
        this.contract = [...this.originalContract];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.contractEmployeesTable) {
          this.contractEmployeesTable.reset();
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
      if (['location', 'subLocation', 'designation'].includes(field)) {
        switch (field) {
          case 'location':
            val1 = a.jobDetails?.[0]?.lopcation;
            val2 = b.jobDetails?.[0]?.lopcation;
            break;
          case 'subLocation':
            val1 = a.jobDetails?.[0]?.subLocation;
            val2 = b.jobDetails?.[0]?.subLocation;
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
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle Employee ID sorting (numeric)
      if (field === 'employeeId') {
        const num1 = parseInt(String(val1), 10) || 0;
        const num2 = parseInt(String(val2), 10) || 0;
        return event.order * (num1 - num2);
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
      this.subscription.unsubscribe();
    }
  }
}
