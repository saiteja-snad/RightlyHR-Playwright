import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iinactive } from './inactive-model';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-inactive-employees',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, TableModule, PaginatorModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-employees.component.html',
  styleUrl: './inactive-employees.component.scss'
})

export class InactiveEmployeesComponent implements OnInit, OnDestroy {
  @ViewChild('inactiveEmployeesTable') inactiveEmployeesTable!: Table;
  subscription!: Subscription;
  InActive = [] as Iinactive[];
  filteredInActive = [] as Iinactive[];
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

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllInactiveEmployees(this.page, this.pageSize);
  }

  getAllInactiveEmployees(pagenum: number, pagesize: number): void {
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
      status: 'Inactive'
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
            this.InActive = data.items;
            this.collectionSize = data.totalCount || data.items.length;
            this.filteredInActive = [...this.InActive];
            console.log('Processed paginated data - InActive:', this.InActive.length, 'Total:', this.collectionSize);
          } else if (data.data && Array.isArray(data.data)) {
            // Alternative format: { data: [], total: number }
            this.InActive = data.data;
            this.collectionSize = data.total || data.count || data.data.length;
            this.filteredInActive = [...this.InActive];
            console.log('Processed paginated data (alt format) - InActive:', this.InActive.length, 'Total:', this.collectionSize);
          } else {
            // Unknown format, fallback to original API
            console.log('Unknown paginated format, trying original API');
            this.fallbackToOriginalAPI();
            return;
          }
        } else if (Array.isArray(data)) {
          // Direct array response from paginated endpoint (shouldn't happen but handle it)
          console.log('Paginated API returned direct array');
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
    // Fallback to original API if paginated fails
    const status = 'Inactive';
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.InActive = data as Iinactive[];
        this.filteredInActive = [...this.InActive];
        this.collectionSize = this.InActive.length;
        this.loader = false;
        console.log('Fallback API - Loaded:', this.InActive.length, 'records');
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
    return this.filteredInActive;
  }

  onSearchChange(): void {
    this.page = 1;
    this.first = 0;
    // Reset sorting when searching
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.inactiveEmployeesTable) {
      this.inactiveEmployeesTable.sortField = '';
      this.inactiveEmployeesTable.sortOrder = 0;
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
      this.getAllInactiveEmployees(this.page, this.pageSize);
    }, 500); // 500ms delay
  }

  clearSearch(): void {
    this.searchValue = '';
    this.page = 1;
    this.first = 0;
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.inactiveEmployeesTable) {
      this.inactiveEmployeesTable.sortField = '';
      this.inactiveEmployeesTable.sortOrder = 0;
    }
    this.getAllInactiveEmployees(this.page, this.pageSize);
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    
    // Keep current sorting when changing pages for server-side pagination
    this.getAllInactiveEmployees(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    
    // Keep current sorting when changing page size for server-side pagination
    this.getAllInactiveEmployees(this.page, this.pageSize);
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      employeeName: 'firstName',
      fusionEmpId: 'fusionEmpId',
      dateOfJoining: 'dateOfJoining',
      workEmail: 'workEmail',
      contactnumber: 'contactnumber',
      location: 'location',
      subLocation: 'subLocation',
      shiftName: 'shiftName',
      designation: 'jobRole'
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
        if (this.inactiveEmployeesTable) {
          this.inactiveEmployeesTable.sortField = '';
          this.inactiveEmployeesTable.sortOrder = 0;
        }
        this.getAllInactiveEmployees(this.page, this.pageSize);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    this.getAllInactiveEmployees(this.page, this.pageSize);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}