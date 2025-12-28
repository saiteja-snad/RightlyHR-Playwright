import { Overall } from './../../Interfaces/timesheetsummary';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { TemplateRef } from '@angular/core';


interface TeamKpiResponse {
  success: boolean;
  data: Array<{
    employeedata: any;
    kras: Array<{
      kra: any;
      kpis: any[];
      kpisCount: number;
    }>;
    krasCount: number;
  }>;
}

@Component({
  selector: 'app-team-kra-kpi',
  standalone: true,
  imports: [
    KraKpiManagementLayoutComponent,
    TranslateModule,
    CommonModule,
    ModuleInfoIconComponent,
    Select,
    DataLoaderContentComponent,
    NoDataFoundComponent,
    FormsModule,
    PaginatorModule,
    AccordionModule,
    TableModule,
    InfoIconComponent,
    ModuleInfoIconComponent,
    NgbPopoverModule,
    ModuleInformationComponent
  ],
  templateUrl: './team-kra-kpi.component.html',
  styleUrl: './team-kra-kpi.component.scss'
})
export class TeamKraKpiComponent implements OnInit, OnDestroy {
  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  empdata: any = {};
  selectedEmployeeId: number | null = null;
  teamKpiData: any[] = [];
  groupedEmployeeData: any[] = []; // New property for grouped data
  loading = true;
  searchText = '';

  // Review cycle filter properties
  reviewCycleOptions: { label: string; value: string }[] = [];
  selectedReviewCycleId: string | null = null;
  empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  // Offcanvas properties
  selectedKra: any;
  kpiList: any[] = [];

  moduleinfo = '';

  page = 1;
  rows = 10;
  first = 0;
  collectionSize = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  private subscription!: Subscription;

  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router,
    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // Load dropdowns based on correct PMS permissions
    if (this.rbac.allowedToAccess('All Employees (KRA).view')) {
      this.loadAllActiveEmployees();
    }
    if (this.rbac.allowedToAccess('My Team (KRA).view')) {
      this.loadMyTeamEmployees();
    }

    // Load review cycles
    this.loadReviewCycles();

    // Default: load data for current logged-in user
    this.loadTeamKpiData();
    this.updateModuleInfo();
  }

    updateModuleInfo() {
    const url = this.router.url;
    this.moduleinfo = url.includes('/pms/kpi-kra/team')
      ? MODULE_INFOS.PMS_TEAM_KRA_KPI_LIST_MODULE_INFO
      : '';
  }

  goToEmployeeKraKpi(employeeId: number): void {
  this.router.navigate([
    '/pms/kpi-kra/employee-kra-kpi-view',
    employeeId
  ]);
}


  loadAllActiveEmployees() {
    const employeeId = this.empinfo?.employeeId;

    this.http
      .getData(
        `v2/Employeedata/GetReporteesAndTeamMembersReportees/${employeeId}`
      )
      .subscribe((res: any) => {
        this.activeEmplist = (res || [])
          .filter((e: any) => e.employeeId !== this.empinfo?.employeeId)
          .map((e: any) => ({
            label: `${e.fusionEmpId ?? ''} - ${e.firstName ?? ''} ${
              e.lastName ?? ''
            }`.trim(),
            value: e.employeeId,
          }));
      });
  }


  loadMyTeamEmployees(): void {
    const employeeId = this.empinfo?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((res: any) => {
        this.myTeamEmployees = (res || [])
          .filter((e: any) => e.isAccess)
          .map((emp: any) => {
            const fusion = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            return {
              ...emp,
              fullName: `${fusion}${emp.firstName ?? ''} ${
                emp.middleName ?? ''
              } ${emp.lastName ?? ''}`.trim(),
            };
          });
      });
  }

onEmployeeChange(employeeId: number | null): void {
  this.selectedEmployeeId = employeeId ?? null;
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}


 loadTeamKpiData(employeeId?: number) {
  this.loading = true;

  const params: any = {
    pageNumber: this.page,
    pageSize: this.rows,
    ...(this.searchText && { search: this.searchText }),
    managerEmployeeId: this.empinfo?.employeeId,
  };

  if (employeeId) {
    params.employeeId = employeeId;
  }

  if (this.selectedReviewCycleId) {
    params.reviewCycleId = this.selectedReviewCycleId;
  }

  if (this.subscription) {
    this.subscription.unsubscribe();
  }

  this.subscription = this.http
    .getDataIncludeParams('Kpi/getTeamMembersAssignKpiKra', params)
    .subscribe((response: any) => {
      this.teamKpiData = response?.data || [];
      this.collectionSize = response?.pagination?.totalRecords || 0;
      this.groupEmployeeData(); // Group data for accordions
      this.loading = false;
    }, (err) => {
      console.error('Error loading team KRA/KPI data', err);
      this.teamKpiData = [];
      this.groupedEmployeeData = [];
      this.collectionSize = 0;
      this.loading = false;
    });
}

// New method to group employees by employeeId
private groupEmployeeData(): void {
  const employeeMap = new Map<number, any>();

  this.teamKpiData.forEach(item => {
    const employeeId = item.employeedata.employeeId;
    const employeeName = `${item.employeedata.firstName || ''} ${item.employeedata.middleName || ''} ${item.employeedata.lastName || ''}`.trim();
    const fusionId = item.employeedata.fusionEmpId;

    if (!employeeMap.has(employeeId)) {
      employeeMap.set(employeeId, {
        employeeId: employeeId,
        employeeName: employeeName,
        fusionId: fusionId,
        employeedata: item.employeedata,
        allKras: []
      });
    }

    // Process all review cycles and their KRAs
    if (item.reviewCycles && item.reviewCycles.length > 0) {
      item.reviewCycles.forEach((reviewCycleItem: any) => {
        if (reviewCycleItem.kras && reviewCycleItem.kras.length > 0) {
          reviewCycleItem.kras.forEach((kraItem: any) => {
            const kraData = {
              kraId: kraItem.kra?.kraId,
              kraName: kraItem.kra?.kraName,
              reviewCycleName: reviewCycleItem.reviewCycle?.reviewCycleName || 'N/A',
              kpisCount: kraItem.kpisCount || 0,
              effectiveDate: kraItem.kra?.effectiveDate,
              targetDate: kraItem.kra?.targetDate,
              kraStatus: kraItem.kra?.kpis?.overallStatus,
              kraWeightage: kraItem.kpis?.length > 0 ? kraItem.kpis[0].assignedKraWeightage : kraItem.kra?.weightageValue,
              kpis: kraItem.kpis || [],
              progress: this.calculateKraProgress(kraItem.kpis || []),
              overallStatus: kraItem.kpis?.length > 0 ? kraItem.kpis[0].overallStatus : kraItem.kra?.overallStatus,
              kraRating: this.calculateKraRating({
                kpis: kraItem.kpis || [],
                individualWeightage: kraItem.kpis?.length > 0 ? kraItem.kpis[0].assignedKraWeightage : kraItem.kra?.weightageValue
              })
            };

            employeeMap.get(employeeId)?.allKras.push(kraData);
          });
        }
      });
    }
  });

  this.groupedEmployeeData = Array.from(employeeMap.values());
}

onSearchTextChange() {
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}



onPageChange(event: any) {
  this.page = event.page + 1;
  this.rows = event.rows;
  this.first = event.first;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}


onPageSizeChange(newSize: number) {
  this.rows = newSize;
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}

// Helper method to get total KRAs count for an employee
getTotalKrasCount(allKras: any[]): number {
  return allKras?.length || 0;
}

// Helper method to get status class for badges
getStatusClass(status: string): string {
  switch (status) {
    case 'Active':
    case 'Initiated':
      return 'bg-success';
    case 'Created':
      return 'bg-secondary';
    case 'Completed':
      return 'bg-primary';
    case 'On Hold':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
}

openKpiCanvas(content: TemplateRef<any>, kra: any): void {
  this.selectedKra = kra;
  this.loadKpisForKra(kra);

  setTimeout(() => {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      panelClass: 'custom-kpi-canvas',
    });
  }, 150);
}

closeKpiCanvas(): void {
  this.offcanvasService.dismiss();
}

loadKpisForKra(kra: any): void {
  this.kpiList = [];

  if (kra?.kpis && kra.kpis.length > 0) {
    this.kpiList = kra.kpis.map((kpi: any) => ({
      kpiId: kpi.kpiId,
      kpiName: kpi.kpiName,
      assignedKpiWeightage: kpi.assignedKpiWeightage,
      targetValue: kpi.targetValue,
      targetType: kpi.targetType,
      targetDate: kpi.targetDate,
      assignedApproverRating: kpi.assignedApproverRating,
      assignedStatus: kpi.assignedStatus,
      assignedApproverRejectedComments: kpi.assignedApproverRejectedComments || ''
    }));
  }
}

getApproverStatusClass(status: string | null | undefined): string {
  switch (status) {
    case 'Approved':
    case 'Active':
      return 'status-active';
    case 'Rejected':
      return 'status-onhold';
    case 'Waiting for Approval':
    case 'Pending':
    case null:
    case undefined:
      return 'status-waiting';
    default:
      return 'bg-secondary';
  }
}

calculateKraProgress(kpis: any[]): number {
  if (!kpis || kpis.length === 0) {
    return 0;
  }

  const totalKpis = kpis.length;
  let committedSum = 0;

  kpis.forEach((kp: any) => {
    let weightage = 0;

    if (kp.assignedStatus === 'Approved') {
      weightage = Number(kp.assignedApproverWeightage ?? kp.assignedWeightage ?? 0);
    } else if (kp.assignedStatus === 'Waiting for Approval') {
      weightage = Number(kp.assignedWeightage ?? 0);
    }

    committedSum += weightage;
  });

  if (totalKpis === 0) return 0;

  const averageProgress = committedSum / totalKpis;
  return Math.round(Math.min(100, Math.max(0, averageProgress)));
}

getProgressClass(value: number): string {
  if (value >= 70) return 'bg-success';
  if (value >= 30) return 'bg-warning';
  return 'bg-danger';
}

getKraStatusClass(status: string) {
  switch (status) {
    case 'Inprogress':
      return 'status-waiting';
    case 'Completed':
      return 'status-active';
    case 'Overdue':
      return 'status-onhold';
    default:
      return '';
  }
}

calculateKraRating(assignment: any): number {
  if (!assignment.kpis || assignment.kpis.length === 0) {
    return 0;
  }

  let weightedKpiSum = 0;

  assignment.kpis.forEach((kpi: any) => {
    const rating = Number(kpi.assignedApproverRating) || 0;
    const kpiWeight = Number(kpi.assignedKpiWeightage) || 0;

    weightedKpiSum += rating * (kpiWeight / 100);
  });

  // Multiply by KRA weightage to get final KRA rating
  const kraWeight = Number(assignment.individualWeightage) || 0;
  const kraRating = weightedKpiSum * (kraWeight / 100);

  return kraRating;
}

getKraRating(kra: any): string {
  const rating = this.calculateKraRating({
    kpis: kra.kpis || [],
    individualWeightage: kra.kraWeightage
  });
  return rating > 0 ? rating.toFixed(1) : '-';
}

loadReviewCycles(): void {
  this.http.getData('reviewCycleHeader/getallnames').subscribe({
    next: (res: any) => {
      if (Array.isArray(res)) {
        this.reviewCycleOptions = res.map((item: any) => ({
          label: item.reviewCycleName,
          value: item.id,
        }));
      } else {
        this.reviewCycleOptions = [];
      }
    },
    error: (err) => {
      console.error('Failed to load review cycles', err);
      this.reviewCycleOptions = [];
    },
  });
}

onReviewCycleChange(reviewCycleId: string | null) {
  this.selectedReviewCycleId = reviewCycleId;
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData(this.selectedEmployeeId || undefined);
}

clearAllFilters() {
  this.selectedEmployeeId = null;
  this.selectedReviewCycleId = null;
  this.searchText = '';
  this.page = 1;
  this.first = 0;
  this.loadTeamKpiData();
}




  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
