import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { IWfhAllocationViewModel } from './wfh-allocation-view-model';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-wfh-allocation-view',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent
],
  templateUrl: './wfh-allocation-view.component.html',
  styleUrl: './wfh-allocation-view.component.scss',
})
export class WfhAllocationViewComponent implements OnInit, OnDestroy {
  getAllocationDetails$ = new BehaviorSubject<IWfhAllocationViewModel[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  isloading = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.getAllwfhallocations();
  }
  // get all wfh allocations
  getAllwfhallocations(): void {
    this.isloading = true;
    this.http
      .getData(`FlexibleWfhAllocation/getAll`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isloading= false;
          this.getAllocationDetails$.next( res.data ||[]);
        },
        error: (err) => {
          this.isloading= false;
          this.getAllocationDetails$.next([]);
          console.error('Error fetching shifts:', err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
