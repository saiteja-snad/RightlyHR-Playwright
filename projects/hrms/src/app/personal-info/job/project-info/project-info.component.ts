import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DropdownModule } from 'primeng/dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TooltipModule } from 'primeng/tooltip';


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
  ],
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
})
export class ProjectInfoComponent implements OnInit {
  loading = false;
  projectData: any[] = [];
  showPhasePopup = false;
  selectedProject: any = null;
  employeeId: number | null = null;

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
    this.loading = true;

    this.http
      .getData(
        `ProjectResource/resource-summary?year=${this.selectedYear}&employeeId=${this.employeeId}`
      )
      .subscribe({
        next: (response: any) => {
          if (response?.success && response.data?.projects) {
            this.projectData = response.data.projects;
          } else {
            this.projectData = [];
          }
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error fetching project summary:', err);
          this.projectData = [];
          this.loading = false;
        },
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

}
