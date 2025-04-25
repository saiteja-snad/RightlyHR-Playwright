import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-trainee-approvals-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './trainee-approvals-tabs.component.html',
  styleUrl: './trainee-approvals-tabs.component.scss'
})

export class TraineeApprovalsTabsComponent {
  empinfo: any;
  pendingApprovalCount = {} as ApprovalStatusCount[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    { label: 'Trainee Details', link: '/time-off/pending-approvals/trainee-approvals' },
  ];

  constructor(public readonly router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
    this.getAllSeparationPendingApprovalsCount();
  }

  getAllSeparationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.traineeoffboardingModuleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        this.pendingApprovalCount = data.find(item => item.moduleId === moduleId) ? [data.find(item => item.moduleId === moduleId)!] : [];
        this.navTabs = [
          { label: 'Trainee Details', link: '/time-off/pending-approvals/trainee-approvals', count: this.pendingApprovalCount.at(0)?.forYou ?? 0 },
        ];
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
