import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
import { Iinactivetrainee } from '../inactive-interns/inactive-trainee-mod';

@Component({
  selector: 'app-inactive-contract-employees',
  imports: [CommonModule, TranslateModule, FormsModule, TableModule, PaginatorModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-contract-employees.component.html',
  styleUrl: './inactive-contract-employees.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InactiveContractEmployeesComponent implements OnInit, OnDestroy {
  @ViewChild('inactiveContractEmployeesTable') inactiveContractEmployeesTable!: Table;
  subscription!: Subscription;
  InActiveTrainee = [] as Iinactivetrainee[];
  filteredInActiveTrainee = [] as Iinactivetrainee[];
  emp = {} as any;
  searchValue: any;
  loader = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string = ''; // Track the UI field name for visual state
  
  // Pagination properties
  page = 1;
  pageSize = 50;
  rows = 50;
  totalRecords = 0;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];

  // Search debounce
  private searchTimeout: any;

  constructor(private router: Router, private http: HttpService, private accessNav: AccessNavigationService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllInactiveContractEmployees(this.page, this.pageSize);
  }

  getAllInactiveContractEmployees(pagenum: number, pagesize: number): void {
    // Prevent multiple simultaneous API calls
    if (this.loader) {
      return;
    }

    // First, try the paginated endpoint
    const params: { 
      page: number; 
      pageSize: number; 
      status: string; 
      searchTerm?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {
      page: pagenum,
      pageSize: pagesize,
      status: 'Inactive Contract'
    };

    if (this.searchValue && this.searchValue.trim()) {
      params.searchTerm = this.searchValue.trim();
    }

    // Add sorting parameters
    if (this.currentSortField && this.currentSortOrder !== 0) {
      params.sortBy = this.currentSortField;
      params.sortOrder = this.currentSortOrder === 1 ? 'asc' : 'desc';
    }

    console.log('API Call Parameters:', params);
    this.loader = true;
    
    // Unsubscribe from previous subscription if it exists
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Try paginated endpoint first, fallback to original if needed
    this.subscription = this.http.getpagentiontData('Employeedata/TraineeActiveEmployees/Paged', params).subscribe({
      next: (data: any) => {
        console.log('Paginated API Response:', data);
        
        // Handle different possible response formats
        if (data && typeof data === 'object') {
          // Check if it's a paginated response
          if (data.items && Array.isArray(data.items)) {
            // Standard pagination format: { items: [], totalCount: number }
            this.InActiveTrainee = data.items;
            this.collectionSize = data.totalCount || data.items.length;
            this.filteredInActiveTrainee = [...this.InActiveTrainee];
            console.log('Processed paginated data - InActiveTrainee:', this.InActiveTrainee.length, 'Total:', this.collectionSize);
          } else if (data.data && Array.isArray(data.data)) {
            // Alternative format: { data: [], total: number }
            this.InActiveTrainee = data.data;
            this.collectionSize = data.total || data.count || data.data.length;
            this.filteredInActiveTrainee = [...this.InActiveTrainee];
            console.log('Processed paginated data (alt format) - InActiveTrainee:', this.InActiveTrainee.length, 'Total:', this.collectionSize);
          } else {
            // Unknown format, fallback to original API
            console.log('Unknown paginated format, trying original API');
            this.fallbackToOriginalAPI();
            return;
          }
        } else if (Array.isArray(data)) {
          // Direct array response from paginated endpoint (shouldn't happen but handle it)
          console.log('Paginated API returned direct array, trying original API');
          this.fallbackToOriginalAPI();
          return;
        } else {
          console.log('Unexpected paginated API response format, trying original API');
          this.fallbackToOriginalAPI();
          return;
        }
        
        this.loader = false;
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Paginated API Error:', err);
        console.log('Fallback to original API due to error');
        this.fallbackToOriginalAPI();
      }
    });
  }

  private fallbackToOriginalAPI(): void {
    console.log('Using original API endpoint');
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/Inactive Contract`).subscribe({
      next: (data: any) => {
        this.InActiveTrainee = data as Iinactivetrainee[];
        this.filteredInActiveTrainee = [...this.InActiveTrainee];
        this.collectionSize = this.InActiveTrainee.length;
        
        // Apply client-side search if search value exists
        if (this.searchValue && this.searchValue.trim()) {
          this.filteredInActiveTrainee = this.clientSideFilter(this.InActiveTrainee);
        }
        
        // Apply client-side sorting if sort is active
        if (this.currentSortField && this.currentSortOrder !== 0) {
          this.filteredInActiveTrainee = this.clientSideSort(this.filteredInActiveTrainee);
        }
        
        this.loader = false;
        this.cdr.detectChanges();
      },
      error: (reason: any) => {
        console.log(reason);
        this.loader = false;
        this.cdr.detectChanges();
      }
    });
  }

  private clientSideFilter(employees: Iinactivetrainee[]): Iinactivetrainee[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return employees;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return employees.filter((employee: Iinactivetrainee) => {
      const fusionEmpId = employee.fusionEmpId?.toLowerCase() || '';
      const employeeName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.toLowerCase().trim();
      const workEmail = employee.workEmail?.toLowerCase() || '';
      const personalEmail = employee.emailaddress?.toLowerCase() || '';
      const contactNumber = employee.contactnumber?.toString() || '';
      const location = employee.jobDetails?.[0]?.lopcation?.toLowerCase() || '';
      const subLocation = employee.jobDetails?.[0]?.subLocation?.toLowerCase() || '';
      const shiftName = employee.jobDetails?.[0]?.shiftName?.toLowerCase() || '';
      const designation = employee.jobDetails?.[0]?.jobRole?.toLowerCase() || '';
      
      return fusionEmpId.includes(searchTerm) ||
             employeeName.includes(searchTerm) ||
             workEmail.includes(searchTerm) ||
             personalEmail.includes(searchTerm) ||
             contactNumber.includes(searchTerm) ||
             location.includes(searchTerm) ||
             subLocation.includes(searchTerm) ||
             shiftName.includes(searchTerm) ||
             designation.includes(searchTerm);
    });
  }

  private clientSideSort(employees: Iinactivetrainee[]): Iinactivetrainee[] {
    return employees.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle nested job details fields
      if (['location', 'subLocation', 'shiftName', 'designation'].includes(this.currentSortField)) {
        switch (this.currentSortField) {
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
      } else if (this.currentSortField === 'firstName') {
        // Handle employee name sorting (combine first, middle, last name)
        val1 = `${a.firstName || ''} ${a.middleName || ''} ${a.lastName || ''}`.trim();
        val2 = `${b.firstName || ''} ${b.middleName || ''} ${b.lastName || ''}`.trim();
      } else if (this.currentSortField === 'dateOfJoining') {
        // Handle date sorting
        const date1 = new Date(a.dateOfJoining ?? 0).getTime();
        const date2 = new Date(b.dateOfJoining ?? 0).getTime();
        return this.currentSortOrder * (date1 - date2);
      } else {
        // Handle direct fields
        val1 = a[this.currentSortField];
        val2 = b[this.currentSortField];
      }

      // Handle Employee ID sorting (alphanumeric)
      if (this.currentSortField === 'fusionEmpId') {
        return this.currentSortOrder * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle contact number sorting (numeric)
      if (this.currentSortField === 'contactnumber') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return this.currentSortOrder * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return this.currentSortOrder * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  getFilteredAndSortedEmployees(): Iinactivetrainee[] {
    return this.filteredInActiveTrainee;
  }

  onSearchChange(): void {
    this.page = 1;
    this.first = 0;
    // Reset sorting when searching
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.inactiveContractEmployeesTable) {
      this.inactiveContractEmployeesTable.sortField = '';
      this.inactiveContractEmployeesTable.sortOrder = 0;
    }
    this.onSearchTextChange();
  }

  onSearchTextChange(): void {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search to avoid too many API calls
    this.searchTimeout = setTimeout(() => {
      this.getAllInactiveContractEmployees(this.page, this.pageSize);
    }, 500); // 500ms delay
  }

  clearSearch(): void {
    this.searchValue = '';
    this.page = 1;
    this.first = 0;
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.inactiveContractEmployeesTable) {
      this.inactiveContractEmployeesTable.sortField = '';
      this.inactiveContractEmployeesTable.sortOrder = 0;
    }
    this.getAllInactiveContractEmployees(this.page, this.pageSize);
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    
    // Keep current sorting when changing pages for server-side pagination
    this.getAllInactiveContractEmployees(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    
    // Keep current sorting when changing page size for server-side pagination
    this.getAllInactiveContractEmployees(this.page, this.pageSize);
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      employeeName: 'firstName',
      location: 'location',
      subLocation: 'subLocation',
      shiftName: 'shiftName',
      designation: 'jobRole',
      fusionEmpId: 'fusionEmpId',
      dateOfJoining: 'dateOfJoining',
      workEmail: 'workEmail',
      contactnumber: 'contactnumber'
    };

    const nextSortField = backendFieldMap[field] || field;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    // Prevent duplicate API calls
    if (
      this.currentSortField === nextSortField &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    // Handle the three-state sorting: none → asc → desc → none
    if (this.currentUIField === field) {
      // Same field clicked - cycle through states
      if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentUIField = '';
        this.currentSortOrder = 0;
        if (this.inactiveContractEmployeesTable) {
          this.inactiveContractEmployeesTable.sortField = '';
          this.inactiveContractEmployeesTable.sortOrder = 0;
        }
        this.getAllInactiveContractEmployees(this.page, this.pageSize);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    this.getAllInactiveContractEmployees(this.page, this.pageSize);
  }
}
