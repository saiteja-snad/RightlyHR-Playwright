import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { Iactive } from './active-model';
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
  selector: 'app-active-employees',
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule, TableModule, PaginatorModule,
    DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './active-employees.component.html',
  styleUrl: './active-employees.component.scss'
})

export class ActiveEmployeesComponent implements OnInit, OnDestroy {
  @ViewChild('activeEmployeesTable') activeEmployeesTable!: Table;
  subscription!: Subscription;
  Active = [] as Iactive[];
  filteredActive = [] as Iactive[];
  searchValue: any;
  emp = {} as any;
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
    this.getAllActiveEmployees(this.page, this.pageSize);
  }

  getAllActiveEmployees(pagenum: number, pagesize: number): void {
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
      status: 'Active'
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
    
    this.subscription = this.http.getpagentiontData('Employeedata/TraineeActiveEmployees/Paged', params).subscribe({
      next: (data: any) => {
        console.log('API Response:', data);
        
        // Handle different possible response formats
        if (data && typeof data === 'object') {
          // Check if it's a paginated response
          if (data.items && Array.isArray(data.items)) {
            // Standard pagination format: { items: [], totalCount: number }
            this.Active = data.items;
            this.collectionSize = data.totalCount || data.items.length;
          } else if (data.data && Array.isArray(data.data)) {
            // Alternative format: { data: [], total: number }
            this.Active = data.data;
            this.collectionSize = data.total || data.count || data.data.length;
          } else if (Array.isArray(data)) {
            // Direct array response (fallback to client-side pagination)
            console.log('API returned direct array, handling client-side pagination');
            this.loader = false;
            return;
          } else {
            // Unknown format
            console.error('Unknown API response format:', data);
            this.Active = [];
            this.collectionSize = 0;
          }
        } else if (Array.isArray(data)) {
          // Direct array response
          console.log('API returned direct array');
          this.loader = false;
          return;
        } else {
          console.error('Unexpected API response format:', data);
          this.Active = [];
          this.collectionSize = 0;
        }
        
        this.filteredActive = [...this.Active];
        console.log('Processed data - Active:', this.Active.length, 'Total:', this.collectionSize);
        
        // Restore sorting visual state if there's an active sort
        //this.restoreTableSortState();
        
        this.loader = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.loader = false;
        this.Active = [];
        this.filteredActive = [];
        this.collectionSize = 0;
      },
      complete: () => {
        this.loader = false;
      },
    });
  }
  

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
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

  getFilteredAndSortedEmployees(): Iactive[] {
    console.log('getFilteredAndSortedEmployees called, returning:', this.filteredActive.length, 'items');
    return this.filteredActive;
  }

  onSearchTextChange(): void {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search to avoid too many API calls
    this.searchTimeout = setTimeout(() => {
      this.getAllActiveEmployees(this.page, this.pageSize);
    }, 500); // 500ms delay
  }

  onSearchChange(): void {
    this.page = 1;
    this.first = 0;
    // Reset sorting when searching
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.activeEmployeesTable) {
      this.activeEmployeesTable.reset();
    }
    this.onSearchTextChange();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.page = 1;
    this.first = 0;
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.activeEmployeesTable) {
      this.activeEmployeesTable.reset();
    }
    this.getAllActiveEmployees(this.page, this.pageSize);
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    // Keep current sorting when changing pages
    this.getAllActiveEmployees(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    // Keep current sorting when changing page size
    this.getAllActiveEmployees(this.page, this.pageSize);
  }

  customSort(event: any): void {
    // const field = event.field;
    
    // // Track current sort state for the clicked field
    // if (this.currentUIField === field) {
    //   // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
    //   if (this.currentSortOrder === 1) {
    //     this.currentSortOrder = -1;
    //   } else if (this.currentSortOrder === -1) {
    //     this.currentSortField = '';
    //     this.currentUIField = '';
    //     this.currentSortOrder = 0;
    //     // Reset table sorting visually
    //     if (this.activeEmployeesTable) {
    //       this.activeEmployeesTable.sortField = '';
    //       this.activeEmployeesTable.sortOrder = 0;
    //       this.activeEmployeesTable.reset();
    //     }
    //     // Reload data without sorting
    //     this.getAllActiveEmployees(this.page, this.pageSize);
    //     return;
    //   } else {
    //     this.currentSortOrder = 1;
    //   }
    // } else {
    //   // New field clicked - start with ascending
    //   this.currentUIField = field;
    //   this.currentSortOrder = 1;
    // }

    // // Map frontend field names to backend field names if needed
    // const backendFieldMap: { [key: string]: string } = {
    //   'employeeName': 'firstName', // or whatever the backend expects
    //   'location': 'location',
    //   'subLocation': 'subLocation',
    //   'shiftName': 'shiftName',
    //   'designation': 'jobRole',
    //   'jobType': 'jobType',
    //   'fusionEmpId': 'fusionEmpId',
    //   'dateOfJoining': 'dateOfJoining',
    //   'workEmail': 'workEmail',
    //   'contactnumber': 'contactnumber'
    // };

    // // Use mapped field name for backend
    // this.currentSortField = backendFieldMap[field] || field;

    // // Update table visual state immediately
    // if (this.activeEmployeesTable) {
    //   this.activeEmployeesTable.sortField = this.currentUIField;
    //   this.activeEmployeesTable.sortOrder = this.currentSortOrder;
    // }

    // // Make API call with new sorting parameters
    // this.getAllActiveEmployees(this.page, this.pageSize);
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: Record<string, string> = {
      employeeName: 'firstName',
      location: 'location',
      subLocation: 'subLocation',
      shiftName: 'shiftName',
      designation: 'jobRole',
      jobType: 'jobType',
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
    if (this.currentSortOrder === -1) {
      // Currently descending, reset to original order
      this.Active = [...this.filteredActive];
      this.currentSortField = '';
      this.currentSortOrder = 0;
      if (this.activeEmployeesTable) {
        this.activeEmployeesTable.reset();
      }
      return;
    }



    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    this.getAllActiveEmployees(this.page, this.pageSize);
  }

  // Method to restore the visual sort state in PrimeNG table
  // private restoreTableSortState(): void {
  //   if (this.activeEmployeesTable && this.currentUIField && this.currentSortOrder !== 0) {
  //     // Use setTimeout to ensure the table is fully rendered
  //     setTimeout(() => {
  //       if (this.activeEmployeesTable) {
  //         // Set the sort field and order to restore visual arrows
  //         this.activeEmployeesTable.sortField = this.currentUIField;
  //         this.activeEmployeesTable.sortOrder = this.currentSortOrder;
          
  //         // Trigger change detection to update the UI
  //         this.cdr?.detectChanges();
  //       }
  //     }, 100); // Increased timeout to ensure DOM is ready
  //   }
  // }

  ngOnDestroy(): void { 
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}