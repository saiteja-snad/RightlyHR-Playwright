import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';

@Component({
  selector: 'app-on-behalf-of-wfh-cancellation',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule, InfoIconComponent],
  templateUrl: './on-behalf-of-wfh-cancellation.component.html',
  styleUrl: './on-behalf-of-wfh-cancellation.component.scss'
})
export class OnBehalfOfWhfCancellationComponent implements OnInit, OnDestroy {
  wfhData: ICompOff[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;

  constructor(
    private http: HttpService,
    public rbac: RbacService
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
      }else{
        this.wfhData = [];
      }
    })
  }

  getWFHRequests(employeId: number) {
    this.dataload = true;
    const year = new Date().getFullYear();
    this.http.getFilterOnBehalfWFHDataByID(employeId, year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.wfhData = response.filter(
          (element: { status: string }) => element.status.toLowerCase() === 'cancelled'
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
