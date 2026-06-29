import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './Prospective-interns-modules';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { IServe } from '../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, FormsModule, TableModule, PaginatorModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})

export class ProspectiveInternsComponent implements OnInit, OnDestroy {
  @ViewChild('prospectiveInternsTable') prospectiveInternsTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  searchValue: any;
  Trainee = [] as ITrainee[];
  filteredTrainee = [] as ITrainee[];
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  Prospective = [] as any;
  JobroleDetails = [] as any;
  AllJobRoles: any;
  serveDetails = [] as IServe[];
  singleValue: IServe | null = null;
  gradeIdValue: any;
  selectedValueJobRoledrop: string = '';
  optionsFound: boolean = true;
  filteredTabs: any[] = [];
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

  buttondisable = false;
  disablebutton: boolean = false;
  initialLocationId: any;
  subLocationsDropdown = {} as any;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllProspectiveInterns(this.page, this.pageSize);
    this.getJobrole();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe(() => {
      this.getAllProspectiveInterns(this.page, this.pageSize);
    });
    this.getservingperiod();
  }

  getAllProspectiveInterns(pagenum: number, pagesize: number): void {
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
      status: 'Trainee Prospective'
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
            this.Trainee = data.items;
            this.collectionSize = data.totalCount || data.items.length;
            this.filteredTrainee = [...this.Trainee];
            console.log('Processed paginated data - Trainee:', this.Trainee.length, 'Total:', this.collectionSize);
          } else if (data.data && Array.isArray(data.data)) {
            // Alternative format: { data: [], total: number }
            this.Trainee = data.data;
            this.collectionSize = data.total || data.count || data.data.length;
            this.filteredTrainee = [...this.Trainee];
            console.log('Processed paginated data (alt format) - Trainee:', this.Trainee.length, 'Total:', this.collectionSize);
          } else {
            // Unknown format, fallback to original API
            console.log('Unknown paginated format, trying original API');
            return;
          }
        } else if (Array.isArray(data)) {
          // Direct array response from paginated endpoint (shouldn't happen but handle it)
          console.log('Paginated API returned direct array');
          return;
        } else {
          console.log('Unexpected paginated API response format, trying original API');
          return;
        }
        this.loader = false;
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Paginated API Error:', err);
        console.log('Fallback to original API due to error');
      }
    });
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data;
      },
    });
  }

  navigateDashboard() {
    this.router.navigate(['/letters/lettes-tabs'])
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

  filterByDuration(duration: string) {
    this.serveDetails = this.serveDetails.filter((item: any) => item.servingPeriodType === 'Trainee Duration Period');
  }

  getJobrole() {
    this.subscription = this.http.getData("DesignationGradeMapper").subscribe({
      next: (data: any) => {
        this.JobroleDetails = data;
        this.AllJobRoles = this.JobroleDetails.map((item: { designationName: any; }) => item.designationName)
      }
    });
  }

  getservingperiod() {
    this.subscription = this.http.getData("ServingPeriods").subscribe({
      next: (data: any) => {
        this.serveDetails = data as IServe[]
        const filteredServeDetails = this.serveDetails.filter((serve: IServe) => {
          return serve.servingPeriodType === 'Trainee Duration Period';
        });
        this.singleValue = filteredServeDetails.length > 0 ? filteredServeDetails[0] : null;
      }
    })
  }

  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
      }
    })
  }

  getFilteredAndSortedInterns(): ITrainee[] {
    return this.filteredTrainee;
  }

  onSearchChange(): void {
    this.page = 1;
    this.first = 0;
    // Reset sorting when searching
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.prospectiveInternsTable) {
      this.prospectiveInternsTable.sortField = '';
      this.prospectiveInternsTable.sortOrder = 0;
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
      this.getAllProspectiveInterns(this.page, this.pageSize);
    }, 500); // 500ms delay
  }

  clearSearch(): void {
    this.searchValue = '';
    this.page = 1;
    this.first = 0;
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.prospectiveInternsTable) {
      this.prospectiveInternsTable.sortField = '';
      this.prospectiveInternsTable.sortOrder = 0;
    }
    this.getAllProspectiveInterns(this.page, this.pageSize);
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    
    // Keep current sorting when changing pages for server-side pagination
    this.getAllProspectiveInterns(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    
    // Keep current sorting when changing page size for server-side pagination
    this.getAllProspectiveInterns(this.page, this.pageSize);
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      employeeName: 'firstName',
      employeeId: 'employeeId',
      dateOfJoining: 'dateOfJoining',
      emailaddress: 'emailaddress',
      contactnumber: 'contactnumber',
      location: 'location',
      subLocation: 'subLocation',
      designation: 'jobRole',
      durationOfTrainee: 'durationOfTrainee',
      substatus: 'substatus'
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
        if (this.prospectiveInternsTable) {
          this.prospectiveInternsTable.sortField = '';
          this.prospectiveInternsTable.sortOrder = 0;
        }
        this.getAllProspectiveInterns(this.page, this.pageSize);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    this.getAllProspectiveInterns(this.page, this.pageSize);
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