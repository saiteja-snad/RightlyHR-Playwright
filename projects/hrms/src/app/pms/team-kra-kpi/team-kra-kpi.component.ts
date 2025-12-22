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
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';


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
  loading = true;
  searchText = '';

    moduleinfo = '';

page = 1;
rows = 10;           // default page size
first = 0;           // for PrimeNG paginator
collectionSize = 0;  // total records from API

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
     private router: Router
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
    const currentEmployeeId = this.empdata?.employeeId;
    const statuses = ['Active', 'Trainee Active'];

    this.http.getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`).subscribe((res: any) => {
      const employees = res as any[];
      this.activeEmplist = employees
        .filter(emp => emp.employeeId !== currentEmployeeId)
        .map(employee => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.middleName ?? ''} ${employee.lastName ?? ''}`.trim(),
          value: employee.employeeId
        }));
    });
  }

  loadMyTeamEmployees() {
    const employeeId = this.empdata?.employeeId;

    this.http.getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`).subscribe((response: any) => {
      const myTeam = (response as any[]).filter((e: any) => e.isAccess);
      this.myTeamEmployees = myTeam.map(emp => {
        const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
        const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
        return { ...emp, fullName };
      }).sort((a: any, b: any) =>
        a.firstName.localeCompare(b.firstName, 'en', { sensitivity: 'base' })
      );
    });
  }

onEmployeeChange(employeeId: any) {
  this.selectedEmployeeId = employeeId || null;

  this.page = 1;
  this.first = 0;
  this.searchText = '';

  // If cleared → load ALL employees
  if (!this.selectedEmployeeId) {
    this.loadTeamKpiData();
  } else {
    this.loadTeamKpiData(this.selectedEmployeeId);
  }
}


 loadTeamKpiData(employeeId?: number  ) {
  this.loading = true;

  const params: any = {
    pageNumber: this.page,
    pageSize: this.rows,
    ...(this.searchText && { search: this.searchText })
  };

  if (employeeId) {
  params.employeeId = employeeId;
}

  if (this.subscription) {
    this.subscription.unsubscribe();
  }

  this.subscription = this.http
    .getDataIncludeParams('Kpi/getTeamMembersAssignKpiKra', params)
    .subscribe((response: any) => {
      this.teamKpiData = response?.data || [];
      this.collectionSize = response?.pagination?.totalRecords || 0;
      this.loading = false;
    }, (err) => {
      console.error('Error loading team KRA/KPI data', err);
      this.teamKpiData = [];
      this.collectionSize = 0;
      this.loading = false;
    });
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




  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
