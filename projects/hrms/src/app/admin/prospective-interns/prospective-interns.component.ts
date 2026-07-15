import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './Prospective-interns-modules';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { IServe } from '../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, FormsModule, TableModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})

export class ProspectiveInternsComponent implements OnInit, OnDestroy {
  @ViewChild('prospectiveInternsTable') prospectiveInternsTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  searchValue: any;
  Trainee = [] as ITrainee[];
  originalTrainee = [] as ITrainee[]; // Store original unsorted data
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

  buttondisable = false;
  disablebutton: boolean = false;
  initialLocationId: any;
  subLocationsDropdown = {} as any;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
    this.getJobrole();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe((selectedObj) => {
      this.empdata();
    });
    this.getservingperiod();
  }

  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        this.Trainee = data as ITrainee[];
        this.originalTrainee = [...this.Trainee];
        this.loader = false;
      },
      error: (reason: any) => {
        console.log(reason);
        this.loader = false;
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
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.Trainee;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.Trainee.filter((intern: ITrainee) => {
      const employeeId = intern.employeeId?.toString() || '';
      const employeeName = `${intern.firstName || ''} ${intern.middleName || ''} ${intern.lastName || ''}`.toLowerCase().trim();
      const personalEmail = intern.emailaddress?.toLowerCase() || '';
      const contactNumber = intern.contactnumber?.toString() || '';
      const location = intern.jobDetails?.[0]?.lopcation?.toLowerCase() || '';
      const subLocation = intern.jobDetails?.[0]?.subLocation?.toLowerCase() || '';
      const designation = intern.jobDetails?.[0]?.jobRole?.toLowerCase() || '';
      const substatus = intern.substatus?.toLowerCase() || '';
      
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
        this.Trainee = [...this.originalTrainee];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.prospectiveInternsTable) {
          this.prospectiveInternsTable.reset();
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