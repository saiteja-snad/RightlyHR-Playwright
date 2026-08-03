import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';


@Component({
  selector: 'app-project-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TooltipModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    TableModule,
  ],
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  @ViewChild('projectTable') projectTable!: Table;
  loader = false;
  projectData: any[] = [];
  originalProjectData: any[] = []; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  showPhasePopup = false;
  selectedProject: any = null;
  employeeId: number | null = null;
  subscription!: Subscription

  // Year dropdown data
  availableYears: { label: string; value: number }[] = [];
  selectedYear: number = new Date().getFullYear();

  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.populateAvailableYears();
    this.getEmpInfoFromRoute();
  }

  populateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [
      { label: (currentYear - 1).toString(), value: currentYear - 1 },
      { label: currentYear.toString(), value: currentYear },
      { label: (currentYear + 1).toString(), value: currentYear + 1 },
    ];
  }

  formatStatus(status: string): string {
    if (!status) return '-';
    return status
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getEmpInfoFromRoute(): void {
    const currentUrl = this.router.url;
    let empInfo: any = null;

    if (currentUrl.startsWith('/personalinfo')) {
      empInfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    } else if (currentUrl.startsWith('/myinfo')) {
      empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    }

    if (empInfo && empInfo.employeeId) {
      this.employeeId = empInfo.employeeId;
      this.getProjectSummary();
    } else {
      console.warn('Employee ID not found in localStorage.');
    }
  }

  getProjectSummary(): void {
    if (!this.employeeId) return;
    this.loader = true;

    this.subscription = this.http
      .getData(
        `ProjectResource/resource-summary?year=${this.selectedYear}&employeeId=${this.employeeId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response?.success && response.data?.projects) {
            this.projectData = response.data.projects;
            this.originalProjectData = [...response.data.projects];
          } else {
            this.projectData = [];
            this.originalProjectData = [];
          }
          this.loader = false;
        },
        error: (err: any) => {
          console.error('Error fetching project summary:', err);
          this.projectData = [];
          this.originalProjectData = [];
          this.loader = false;
        },
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
        this.projectData = [...this.originalProjectData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.projectTable) {
          this.projectTable.reset();
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

      // Handle nested field paths and special cases
      if (field === 'projectCode') {
        val1 = a.meta?.graphData?.code;
        val2 = b.meta?.graphData?.code;
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle numeric fields
      if (['totalHours', 'loggedHours', 'pendingHours'].includes(field)) {
        const num1 = parseFloat(val1) || 0;
        const num2 = parseFloat(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  // Triggered when year dropdown changes
  onYearChange(): void {
    this.getProjectSummary();
  }

  openModal(content: any, data: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
    this.selectedProject = data;
  }

  openPhasePopup(project: any): void {
    this.selectedProject = project;
    this.showPhasePopup = true;
  }

  closePopup(): void {
    this.showPhasePopup = false;
    this.selectedProject = null;
  }

  getStatusClass(status: string): string {
    if (!status) return '';

    const normalized = status.toLowerCase();

    if (normalized === 'yet to start') return 'status-yet-to-start';
    if (normalized === 'in progress') return 'status-in-progress';
    if (normalized === 'extended') return 'status-extended';
    if (normalized === 'hold') return 'status-hold';
    if (normalized === 'completed') return 'status-completed';
    if (normalized === 'closed') return 'status-closed';

    return '';
  }

  convertDecimalToHours(decimalHours: number): string {
  if (decimalHours == null || isNaN(decimalHours)) return '-';

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  // handle case like 14.999 -> 15:00
  const adjustedHours = minutes === 60 ? hours + 1 : hours;
  const adjustedMinutes = minutes === 60 ? 0 : minutes;

  // return in HH:mm format
  return `${adjustedHours}:${adjustedMinutes.toString().padStart(2, '0')}`;
}

shouldShowTooltip(element: HTMLElement): boolean {
  if (!element) return false;
  return element.offsetWidth < element.scrollWidth;
}





    ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
