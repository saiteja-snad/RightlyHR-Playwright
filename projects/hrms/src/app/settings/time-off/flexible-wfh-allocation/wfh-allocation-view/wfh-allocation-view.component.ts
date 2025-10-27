import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { IWfhAllocationViewModel } from './wfh-allocation-view-model';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { Paginator } from 'primeng/paginator';
@Component({
  selector: 'app-wfh-allocation-view',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    FormsModule,
    Paginator,
  ],
  templateUrl: './wfh-allocation-view.component.html',
  styleUrl: './wfh-allocation-view.component.scss',
})
export class WfhAllocationViewComponent implements OnInit, OnDestroy {
  getAllocationDetails$ = new BehaviorSubject<IWfhAllocationViewModel[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  isloading = false;
  searchValue: string | null = null;
  pageNumber = 1;
  pageSize = 10;
  hasPreviousPage!: Boolean;
  hasNextPage!: Boolean;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
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
    if (
      !this.searchValue ||
      this.searchValue == '' ||
      this.searchValue == null ||
      this.searchValue == undefined
    ) {
      this.searchValue = null;
    }
    let url = `FlexibleWfhAllocation/getAll?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;

    // Only add searchValue if it's not empty/null/undefined
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${encodeURIComponent(this.searchValue.trim())}`;
    }
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isloading = false;
          this.getAllocationDetails$.next(res.data.items || []);
          this.collectionSize = res.data.totalCount;
          this.hasNextPage = res.data.hasNextPage;
          this.hasPreviousPage = res.data.hasPreviousPage;
        },
        error: (err) => {
          this.isloading = false;
          this.getAllocationDetails$.next([]);
          console.error('Error fetching shifts:', err);
        },
      });
  }
  onPageSizeChange(pageSize: any) {
    this.pageSize = pageSize;
    this.getAllwfhallocations();
  }

  onPageChange(event: any) {
    this.first = event.first; // update the first record index
    this.rows = event.rows;
    this.pageNumber = event.pageCount;
    this.getAllwfhallocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
