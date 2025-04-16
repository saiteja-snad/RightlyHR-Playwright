import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-on-be-half-of-approval-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './on-be-half-of-approval-tabs.component.html',
  styleUrl: './on-be-half-of-approval-tabs.component.scss'
})
export class OnBeHalfOfApprovalTabsComponent {
  loggedinuser = {} as any;
      empdata = {} as any;
      subscription!: Subscription;
      lpdata = [] as Ilpid[];
      processedCount: any;
      waitingForApprovalCount: any;
      approvedCount: any;
      rejectedCount: any;
      statusTabs: any[] = [
        { label: 'Waiting For Approval', link: 'waiting-for-approval', },
        { label: 'Approved', link: 'approved', },
        { label: 'Processed', link: 'processed', },
        { label: 'Rejected', link: 'rejected', }
      ];
  constructor(public readonly router: Router,private http: HttpService, private authService: AuthService) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    // this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.empdata = JSON.parse(localStorage.getItem('onbehalfof') || '{}');
    this.getDataByLPID();
  }

  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          // Count based on status
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');

          // Set counts
          this.statusTabs = [
            { label: 'Waiting For Approval', link: 'waiting-for-approval', count: waiting.length },
            { label: 'Approved', link: 'approved', count: approved.length },
            { label: 'Processed', link: 'processed', count: processed.length },
            { label: 'Rejected', link: 'rejected', count: rejected.length }
          ];
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }

}
