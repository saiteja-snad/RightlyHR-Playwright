import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';

@Component({
  selector: 'app-remote-approved',
  imports: [  CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent],
  templateUrl: './remote-approved.component.html',
  styleUrl: './remote-approved.component.scss'
})
export class RemoteApprovedComponent implements OnInit,OnDestroy{
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvedRemotes: ICompOff[] = [];
  remoteLogin = [] as any;
  approvedRemotesCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    public rbac: RbacService,
  ) {
         // Signal reaction for employee switch
         effect(() =>{
          if (this.http.tirggerCountSignal().remote) {
            this.getRemoteRequests();
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              remote: false,
            }));
          }
    
      })
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    console.log(this.empinfo);
    this.getRemoteRequests();
  }

  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getRemoteRequests() {
    let empId = this.empinfo.employeeId;
    console.log(empId);
    this.http
      .getData(`AttendanceRequests/getbyempid/${empId}?requestedCategory=11`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.remoteLogin = response;
          this.approvedRemotes = this.remoteLogin.filter(
            (element: { status: string }) => element.status === 'Approved'
          );
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
