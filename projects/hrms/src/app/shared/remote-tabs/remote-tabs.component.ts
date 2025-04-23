import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../Interfaces/letters-model';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-remote-tabs',
  imports: [RouterModule,CommonModule,TabsModule],
  templateUrl: './remote-tabs.component.html',
  styleUrl: './remote-tabs.component.scss'
})
export class RemoteTabsComponent {
  compOff = [] as any;
  rejectedremoteRequestsCount = 0;
  waitingForApprovalremoteCount = 0;
  approvedremoteRequestsCount = 0;
  processedremoteRequestsCount = 0;

  navTabs: any[] = [
    { label: 'Waiting For Approval', link: 'waiting-for-approval', count:this.waitingForApprovalremoteCount },
    { label: 'Approved', link: 'approved', count: this.approvedremoteRequestsCount },
    { label: 'Processed', link: 'processed', count: this.processedremoteRequestsCount },
    { label: 'Rejected', link: 'rejected', count: this.rejectedremoteRequestsCount },
   
  ];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public readonly router: Router, private http: HttpService) {
    effect(() => {
      if (this.http.tirggerCountSignal().remote) {
        this.getremoteRequest();
      this.http
        .tirggerCountSignal
        .update((status) => ({ ...status, remote: false }));
      }

 
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getremoteRequest();
  }


  getremoteRequest() {
    let empId = this.empinfo.employeeId;
    console.log(empId);
    this.http
      .getData(`AttendanceRequests/getbyempid/${empId}?requestedCategory=11`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.compOff = response;
          this.waitingForApprovalremoteCount = this.compOff.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          ).length;
          this.approvedremoteRequestsCount = this.compOff.filter(
            (element: { status: string }) => element.status === 'Approved'
          ).length;
          this.rejectedremoteRequestsCount = this.compOff.filter(
            (element: { status: string }) => element.status === 'Rejected'
          ).length;
          this.processedremoteRequestsCount = this.compOff.filter(
            (element: { status: string }) => element.status === 'Processed'
          ).length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.compOff = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
