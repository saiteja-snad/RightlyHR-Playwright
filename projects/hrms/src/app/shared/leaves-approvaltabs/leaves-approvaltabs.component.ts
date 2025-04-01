import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaves-approvaltabs',
  imports: [RouterModule],
  templateUrl: './leaves-approvaltabs.component.html',
  styleUrl: './leaves-approvaltabs.component.scss'
})
export class LeavesApprovaltabsComponent {
    loggedinuser = {} as any;
    empdata = {} as any;
    subscription!: Subscription;
    lpdata = [] as Ilpid[];
    processedCount: any;
    waitingForApprovalCount: any;
    approvedCount: any;
    rejectedCount: any;


    constructor(public readonly router: Router,private http: HttpService, private authService: AuthService) {}


  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getDataByLPID();
  }
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getDataByLPID() {
    let empid = this.empdata.employeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        console.log(response);
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Waiting for Approval');
           this.waitingForApprovalCount = this.lpdata.length ?? 0;
          console.log("Processed Records Count:", this.processedCount);
          this.lpdata = response.filter(item => item.status === 'Approved');
           this.approvedCount = this.lpdata.length ?? 0;
          console.log("Processed Records Count:", this.approvedCount);
          this.lpdata = response.filter(item => item.status === 'Rejected');
           this.rejectedCount = this.lpdata.length ?? 0;
          console.log("Processed Records Count:", this.rejectedCount);
          this.lpdata = response.filter(item => item.status === 'Processed');
           this.processedCount = this.lpdata.length ?? 0;
          console.log("Processed Records Count:", this.processedCount);
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}
