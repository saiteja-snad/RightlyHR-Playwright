import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import {  FormsModule } from '@angular/forms';
import {  NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-premissions-waiting-for-approval',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent],
  templateUrl: './premissions-waiting-for-approval.component.html',
  styleUrl: './premissions-waiting-for-approval.component.scss'
})
export class PremissionsWaitingForApprovalComponent  implements OnInit,OnDestroy {
 

  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  permissions = [] as any;
  waitingForApprovalPerimisions: RegularizationRequest [] = [] as RegularizationRequest[];
  dataload =  false;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  constructor(
    private http: HttpService,
    public rbac: RbacService,
  ) {
    effect(() => {
      if (this.http.permissionTriggerSignal()) {
        this.getDataPermissions();
        this.http.permissionTriggerSignal.set(false);
      }
    });
  }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getDataPermissions()
  }
  onRowsChange() {
    this.first = 0;

  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;

  }

  getDataPermissions() {
    let empId = this.empinfo.employeeId;
    this.dataload =  true;
    this.http.getData(`RegularizationRequests/${empId}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        this.permissions = response as RegularizationRequest[];
        this.waitingForApprovalPerimisions = this.permissions.filter((element: { status: string }) => element.status === 'Waiting for Approval');
        this.dataload =  false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.permissions = [];
        this.dataload =  false; // Set to empty array on error
      },
    });
  }



  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}