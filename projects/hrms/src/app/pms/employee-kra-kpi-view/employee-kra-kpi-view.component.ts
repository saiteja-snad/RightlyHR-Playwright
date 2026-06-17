import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Select } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import {
  NgbPaginationModule,
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';

@Component({
  selector: 'app-employee-kra-kpi-view',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    ModuleInfoIconComponent,
    Select,
    AccordionModule,
    TableModule,
    DataLoaderContentComponent,
    NoDataFoundComponent,
    FormsModule,
    PaginatorModule,
    InfoIconComponent,
    NgbPopoverModule,
  ],
  templateUrl: './employee-kra-kpi-view.component.html',
  styleUrl: './employee-kra-kpi-view.component.scss',
})
export class EmployeeKraKpiViewComponent implements OnInit, OnDestroy {
  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  empdata: any = {};
  selectedEmployeeId: number | null = null;
  teamKpiData: any[] = [];
  currentEmployeeName: string = '';
  loading = true;
  activeAccordionIndex: number | null = null;
  searchText = '';
  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];

  private subscription!: Subscription;

  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // Fix: Use correct PMS permissions
    // if (this.rbac.allowedToAccess('All Employees (Expenses).view')) {
    //   this.loadAllActiveEmployees();
    // }
    // if (this.rbac.allowedToAccess('My Team (Expenses).view')) {
    //   this.loadMyTeamEmployees();
    // }

    // Listen to route params
    this.route.paramMap.subscribe((params) => {
      let employeeId = Number(params.get('employeeId'));

      // If no param or invalid, use current user
      if (!employeeId || isNaN(employeeId)) {
        employeeId = this.empdata?.employeeId;
      }

      if (!employeeId) {
        console.error('No employee ID available');
        return;
      }

      this.selectedEmployeeId = employeeId;
      this.loadSpecificEmployeeData(employeeId);
    });
  }

  loadAllActiveEmployees() {
    const currentEmployeeId = this.empdata?.employeeId;
    const statuses = ['Active', 'Trainee Active'];

    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe((res: any) => {
        const employees = res as any[];
        this.activeEmplist = employees
          .filter((emp) => emp.employeeId !== currentEmployeeId)
          .map((employee) => ({
            label: `${employee.fusionEmpId ?? ''} - ${
              employee.firstName ?? ''
            } ${employee.middleName ?? ''} ${employee.lastName ?? ''}`.trim(),
            value: employee.employeeId,
          }));
      });
  }

  loadMyTeamEmployees() {
    const employeeId = this.empdata?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((response: any) => {
        const myTeam = (response as any[]).filter((e: any) => e.isAccess);
        this.myTeamEmployees = myTeam
          .map((emp) => {
            const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            const fullName = `${fusionPart}${emp.firstName ?? ''} ${
              emp.middleName ? emp.middleName + ' ' : ''
            }${emp.lastName ?? ''}`.trim();
            return { ...emp, fullName };
          })
          .sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', {
              sensitivity: 'base',
            })
          );
      });
  }

  onEmployeeChange(employeeId: number | null | undefined) {
    const targetId = employeeId ?? this.empdata?.employeeId;

    if (!targetId) {
      console.error('No valid employee ID to load');
      return;
    }

    this.selectedEmployeeId = targetId;
    this.page = 1;
    this.first = 0;
    this.searchText = ''; // optional: clear search when switching employee
    this.loadSpecificEmployeeData(targetId);
  }
  loadSpecificEmployeeData(employeeId: number) {
    this.loading = true;

    const params: any = {
      employeeId,
      pageNumber: this.page,
      pageSize: this.rows,
      ...(this.searchText && { search: this.searchText }),
    };

    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = this.http
      .getDataIncludeParams('Kpi/getTeamMembersAssignKpiKra', params)
      .subscribe(
        (response: any) => {
          this.teamKpiData = response?.data || [];
          this.collectionSize = response?.pagination?.totalRecords || 0;

          // Update header with employee name
          if (this.teamKpiData.length > 0) {
            const emp = this.teamKpiData[0].employeedata;

            this.currentEmployeeName = [
              emp.firstName,
              emp.middleName,
              emp.lastName,
            ]
              .filter((name) => !!name && name.trim() !== '')
              .join(' ');
          } else {
            this.currentEmployeeName = 'Employee KRA/KPI';
          }

          this.loading = false;
        },
        (err) => {
          console.error('Error loading KRA/KPI data', err);
          this.teamKpiData = [];
          this.collectionSize = 0;
          this.currentEmployeeName = 'Employee KRA/KPI';
          this.loading = false;
        }
      );
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-success';
      case 'on hold':
        return 'text-warning';
      case 'inactive':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }

  getProgressClass(progress: number): string {
    if (progress >= 70) return 'bg-success';
    if (progress >= 30) return 'bg-warning';
    return 'bg-danger';
  }

  getKpiProgress(kpi: any): number {
    // Placeholder — adjust based on actual progress logic if available
    return Math.floor(Math.random() * 100); // Replace with real logic later
  }

  onSearchTextChange(): void {
    this.page = 1;
    this.first = 0;
    this.loadSpecificEmployeeData(
      this.selectedEmployeeId || this.empdata?.employeeId
    );
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadSpecificEmployeeData(
      this.selectedEmployeeId || this.empdata?.employeeId
    );
  }

  onPageSizeChange(newSize: number) {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.loadSpecificEmployeeData(
      this.selectedEmployeeId || this.empdata?.employeeId
    );
  }

  navigateTeamKRAKPI() {
    this.router.navigate(['/pms/kpi-kra/team']);
  }


getEffectiveKpiWeightage(kpi: any): number {
  if (!kpi) {
    return 0;
  }

  if (kpi.assignedStatus === 'Approved') {
    return Number(kpi.assignedApproverWeightage || 0);
  }


  if (kpi.assignedStatus === 'Rejected') {
    return Number(kpi.assignedApproverWeightage || 0);
  }

  if (kpi.assignedStatus === 'Waiting for Approval') {
    return Number(kpi.assignedWeightage || 0);
  }

  return Number(kpi.assignedWeightage || 0);
}


  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
