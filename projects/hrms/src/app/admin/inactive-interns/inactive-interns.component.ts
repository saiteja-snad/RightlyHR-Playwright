import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { Iinactivetrainee } from './inactive-trainee-mod';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-inactive-interns',
  imports: [CommonModule, TranslateModule, FormsModule, TableModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-interns.component.html',
  styleUrl: './inactive-interns.component.scss'
})

export class InactiveInternsComponent implements OnInit, OnDestroy {
  @ViewChild('inactiveInternsTable') inactiveInternsTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  InActiveTrainee = [] as Iinactivetrainee[];
  originalInActiveTrainee = [] as Iinactivetrainee[]; // Store original unsorted data
  emp = {} as any;
  searchValue: any;
  loader = false;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private router: Router, private http: HttpService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata('Trainee Inactive');
  }

  //function for inactive employees
  empdata(status: string) {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.InActiveTrainee = data as Iinactivetrainee[];
        this.originalInActiveTrainee = [...this.InActiveTrainee];
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

  getFilteredAndSortedInterns(): Iinactivetrainee[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.InActiveTrainee;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.InActiveTrainee.filter((intern: Iinactivetrainee) => {
      const fusionEmpId = intern.fusionEmpId?.toLowerCase() || '';
      const employeeName = `${intern.firstName || ''} ${intern.middleName || ''} ${intern.lastName || ''}`.toLowerCase().trim();
      const workEmail = intern.workEmail?.toLowerCase() || '';
      const personalEmail = intern.emailaddress?.toLowerCase() || '';
      const contactNumber = intern.contactnumber?.toString() || '';
      const location = intern.jobDetails?.[0]?.lopcation?.toLowerCase() || '';
      const subLocation = intern.jobDetails?.[0]?.subLocation?.toLowerCase() || '';
      const shiftName = intern.jobDetails?.[0]?.shiftName?.toLowerCase() || '';
      const designation = intern.jobDetails?.[0]?.jobRole?.toLowerCase() || '';
      
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
        this.InActiveTrainee = [...this.originalInActiveTrainee];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.inactiveInternsTable) {
          this.inactiveInternsTable.reset();
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
      this.subscription.unsubscribe();
    }
  }
}