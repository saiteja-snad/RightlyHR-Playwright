import { CommonModule } from '@angular/common';
import { Component, computed, effect, Signal, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { SignalsService } from '../../../../services/signals.service';

@Component({
  selector: 'app-trainee-approvals-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './trainee-approvals-tabs.component.html',
  styleUrl: './trainee-approvals-tabs.component.scss'
})

export class TraineeApprovalsTabsComponent {
  empinfo: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId=environment.traineeoffboardingModuleId
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'Trainee Details', link: '/time-off/pending-approvals/trainee-approvals', count:data?.forYou ?? 0,permission: { feature: 'Trainee Details', action: 'view' }}
    ];
  });
  // navTabs: any[] = [
  //   { label: 'Trainee Details', link: '/time-off/pending-approvals/trainee-approvals' },
  // ];

  constructor(public readonly router: Router, private http: HttpService,private signalService:SignalsService) { 
    effect(() => {
      if (this.signalService.traineeDetailsTriggerSignal()) {
        this.getAllTraineePendingApprovalsCount();
       this.signalService.traineeDetailsTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
    this.getAllTraineePendingApprovalsCount();
  }

  getAllTraineePendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.traineeoffboardingModuleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const filtered = data.filter(item => item.moduleId === moduleId);
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
