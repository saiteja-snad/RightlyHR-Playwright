import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LeaveApproval } from '../../Interfaces/pendingapprovalsmodel';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { environment } from '../../../environments/environment';

interface NavLink {
  label: string;
  route: string;
  moduleId: number;
  count?: number; // <-- add this
}


@Component({
  selector: 'app-pending-approvals-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-approvals-tabs.component.html',
  styleUrl: './pending-approvals-tabs.component.scss',
})
export class PendingApprovalsTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  countEmp: any;
  countRole: any;
  navLinks: NavLink[] = [
    {
      label: 'Time-Off',
      route: '/time-off/pending-approvals/time-off-request',
      moduleId: environment.leavesModuleId,
    },
    { label: 'WFH', route: '/time-off/pending-approvals/wfh', moduleId: environment.wfhModuleId },
    { label: 'Comp-Off', route: '/time-off/pending-approvals/comp-off', moduleId: environment.compoffModuleId },
    { label: 'Permissions', route: '/time-off/pending-approvals/permissions', moduleId: environment.permissionsModuleId },
    {
      label: 'Attendance Regularization',
      route: '/time-off/pending-approvals/attendance-request',
      moduleId: environment.attendanceRegularizationModuleId,
    },
    {
      label: 'Separation Requests',
      route: '/time-off/pending-approvals/separation-request',
      moduleId: environment.SeparationrequestmoduleId,
    },
    {
      label: 'Recall Requests',
      route: '/time-off/pending-approvals/recall-request',
      moduleId: environment.RecallrequestmoduleId,
    },
    { label: 'Trainee Details', route: '/time-off/pending-approvals/trainee',moduleId: environment.traineeoffboardingModuleId },
    {
      label: 'No Due Clearance Requests',
      route: '/time-off/pending-approvals/nodue-request',
      moduleId: environment.nodueModuleId,
    },
    {
      label: 'Claims and Expenses',
      route: '/time-off/pending-approvals/claimsandexpenses-request',
      moduleId: environment.expensesModuleId,
    },
    {
      label: 'Probation Details',
      route: '/time-off/pending-approvals/probation-request',
      moduleId: environment.ProbationrequestmoduleId,
    },
  ];
  constructor(
    public readonly router: Router,
    private http: HttpService,
    private modalService: NgbModal
  ) {}

  isActive(router: string): boolean {
    return this.router.isActive(router, true);
  }
  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    // this.getAllPendingApprovalsEMP();
    // this.getAllPendingApprovalsROLE();
    this.getAllPendingApprovalsCount();
  }
  getAllPendingApprovalsEMP() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=EMP`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.leavesEmp = response.data as LeaveApproval[];
          this.countEmp = this.leavesEmp.length ?? 0;
          console.log(this.leavesEmp);
        },
        error: (reason) => console.log(reason),
      });
  }

  getAllPendingApprovalsROLE() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.leavesRole = response.data as LeaveApproval[];
          this.countRole = this.leavesRole.length ?? 0;
          console.log(this.leavesRole);
        },
        error: (reason) => console.log(reason),
      });
  }
  onclickseparation() {
    this.http.tirggerPendingApprovalCountSignal.update((status) => ({
      ...status,
      separation: true,
    }));
  }

  getAllPendingApprovalsCount() {
    const employeeId = parseInt(this.LOGIN.employeeId);
    this.http.getAllPendingApprovalsCount(undefined, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const countMap = new Map<number, number>();
        data.forEach(item => countMap.set(item.moduleId, item.totalCount));
  
        // Update navLinks with count
        this.navLinks = this.navLinks.map(link => ({
          ...link,
          count: countMap.get(link.moduleId) || 0
        }));
  
        // this.pendingApprovalCount.set(data);
        // console.log(this.navLinks);
        
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }
  

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
