import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-on-be-half-of-approval-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './on-be-half-of-approval-tabs.component.html',
  styleUrl: './on-be-half-of-approval-tabs.component.scss'
})

export class OnBeHalfOfApprovalTabsComponent {
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  cadidateEmployeeId!:number
  processedCount: any;
  waitingForApprovalCount: any;
  approvedCount: any;
  rejectedCount: any;
  navLinks: any[] = [
    { label: 'Waiting For Approval', route: 'waiting-for-approval', },
    { label: 'Approved', route: 'approved', },
    { label: 'Processed', route: 'processed', },
    { label: 'Rejected', route: 'rejected', },
    { label: 'Cancelled', route: 'cancel', }
  ];

  constructor(
    public readonly router: Router, 
    private http: HttpService, 
    private authService: AuthService,

  ) { 

    // Signal reaction for employee switch
    effect(() => {
      if (this.http.trigger()) {   
        this.cadidateEmployeeId = parseInt(localStorage.getItem('onbehalfof') as string) ;
        if (this.cadidateEmployeeId  != null ) {
          this.getDataByLPID();
        } 
        // this.http.resetTriggerSignal();
      }
    });

  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    // this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
   
   
  }

  getDataByLPID() {
    
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}`).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          // Count based on status
          const waiting = response.filter(item => item.status === 'Waiting for Approval');
          const approved = response.filter(item => item.status === 'Approved');
          const rejected = response.filter(item => item.status === 'Rejected');
          const processed = response.filter(item => item.status === 'Processed');
          // Set counts
          this.navLinks = [
            { label: 'Waiting For Approval', route: 'waiting-for-approval', count: waiting.length },
            { label: 'Approved', route: 'approved', count: approved.length },
            { label: 'Processed', route: 'processed', count: processed.length },
            { label: 'Rejected', route: 'rejected', count: rejected.length }
          ];
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}