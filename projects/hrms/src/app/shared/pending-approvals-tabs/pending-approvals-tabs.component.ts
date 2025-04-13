import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { LeaveApproval } from '../../Interfaces/pendingapprovalsmodel';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { environment } from '../../../environments/environment';

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
  navLinks = [
    {
      label: 'Time-Off',
      route: '/time-off/pending-approvals/time-off-request',
      moduleId: 1,
    },
    { label: 'WFH', route: '/time-off/pending-approvals/wfh', moduleId: 2 },
    { label: 'Comp-Off', route: '/time-off/pending-approvals/comp-off', moduleId: 3 },
    { label: 'Permissions', route: '/time-off/pending-approvals/permissions', moduleId: 18 },
    {
      label: 'Attendance Regularization',
      route: '/time-off/pending-approvals/attendance-request',
      moduleId: 4,
    },
    {
      label: 'Separation Requests',
      route: '/time-off/pending-approvals/separation-request',
      moduleId: 5,
    },
    {
      label: 'Recall Requests',
      route: '/time-off/pending-approvals/recall-request',
      moduleId: 6,
    },
    { label: 'Trainee Details', route: '/time-off/pending-approvals/trainee',moduleId: 7 },
    {
      label: 'No Due Clearance Requests',
      route: '/time-off/pending-approvals/nodue-request',
      moduleId: 8,
    },
    {
      label: 'Claims and Expenses',
      route: '/time-off/pending-approvals/claimsandexpenses-request',
      moduleId: 19,
    },
    {
      label: 'Probation Details',
      route: '/time-off/pending-approvals/probation-request',
      moduleId: 9,
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
    this.http.getAllPendingApprovalsCount(undefined,employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);
        const filtered = data;
        this.pendingApprovalCount.set(filtered);
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
