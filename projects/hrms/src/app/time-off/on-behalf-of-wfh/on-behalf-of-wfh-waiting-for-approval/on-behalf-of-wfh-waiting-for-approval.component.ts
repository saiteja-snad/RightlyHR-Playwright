import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';

@Component({
  selector: 'app-on-behalf-of-whf-waiting-for-approval',
  imports: [CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    InfoIconComponent],
  templateUrl: './on-behalf-of-wfh-waiting-for-approval.component.html',
  styleUrl: './on-behalf-of-wfh-waiting-for-approval.component.scss'
})
export class OnBehalfOfWhfWaitingForApprovalComponent implements OnInit, OnDestroy {
  wfhData: ICompOff[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    public formsValidation: FormValidationsService
  ) {
    effect(() => {
      if (this.http.onBehlafOfWFHSignal()) {
        this.http.onBehalfOfWFHSelectedEmp$.subscribe((empId: number) => {
          if (empId) {
            this.getWFHRequests(empId);
          }
        });
        this.http.onBehlafOfWFHSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.http.onBehalfOfWFHSelectedEmp$.subscribe((empId: number) => {
      if (empId) {
        this.getWFHRequests(empId);
      }
    })
  }

  getWFHRequests(employeId: number) {
    this.dataload = true;
    const year = new Date().getFullYear();
    this.http.getFilterOnBehalfWFHDataByID(employeId, year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfhData = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
      },
      error: (error) => {
        this.dataload = false;
        this.wfhData = [];
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
