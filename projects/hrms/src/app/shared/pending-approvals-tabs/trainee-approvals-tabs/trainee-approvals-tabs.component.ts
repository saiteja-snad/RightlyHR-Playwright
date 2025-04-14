import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { environment } from '../../../../environments/environment';
import { ApprovalStatusCount } from '../../../Interfaces/timoff-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-trainee-approvals-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './trainee-approvals-tabs.component.html',
  styleUrl: './trainee-approvals-tabs.component.scss'
})
export class TraineeApprovalsTabsComponent {
  empinfo: any;
  pendingApprovalCount = {} as ApprovalStatusCount[];
  destroy$: Subject<boolean> = new Subject<boolean>();
    
  navTabs: any[] = [
    { label: 'Intern Details', link: '/time-off/pending-approvals/trainee-approvals' },
    
  ];
  
  constructor(public readonly router: Router, private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
    this.getAllSeparationPendingApprovalsCount();
  }
  
   getAllSeparationPendingApprovalsCount() {
      const employeeId = parseInt(this.empinfo.employeeId);
      const moduleId = environment.traineeoffboardingModuleId;
    
      this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
        next: (data: ApprovalStatusCount[]) => {
          console.log(data);
          this.pendingApprovalCount = data.find(item => item.moduleId === moduleId) ? [data.find(item => item.moduleId === moduleId)!] : [];
        this.navTabs = [
          { label: 'Intern Details', link: '/time-off/pending-approvals/trainee-approvals', count: this.pendingApprovalCount.at(0)?.forYou ?? 0 },
          
    
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
