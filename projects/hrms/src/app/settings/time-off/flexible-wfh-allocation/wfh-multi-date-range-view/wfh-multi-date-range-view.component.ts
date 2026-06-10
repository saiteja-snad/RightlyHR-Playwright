import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IWfhAllocationViewModel } from '../wfh-allocation-view/wfh-allocation-view-model';
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { Paginator } from 'primeng/paginator';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-wfh-multi-date-range-view',
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
    InfoIconComponent,
    NgbPopoverModule
],
  templateUrl: './wfh-multi-date-range-view.component.html',
  styleUrl: './wfh-multi-date-range-view.component.scss',
})
export class WfhMultiDateRangeViewComponent implements OnInit, OnDestroy {
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
  wfh_history=[] as any;
  yearSelectionForm!: FormGroup;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  activeEmplist = [] as any;
  years: number[] = [];
  employeeId:number | null = null;
  records: IWfhAllocationViewModel[] = [];
  selectedId:number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.rbac.allowedToAccess('Allow Multi Date Range History Tab.view')) {
      this.router.navigate(['/unauthorized']);
      return;
    }
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear;
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    this.yearSelectionForm = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    this.getAllEmployeeDetails();
    this.getAllwfhallocations();
  }

  openHistoryPopup(content: any, Details: IWfhAllocationViewModel): void {
    this.getWfhallocationHistory(Details.employeeId.id);
    this.modalService.open(content, { centered: true,size:'xl', backdrop: 'static', keyboard: false });
  }

  onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear;
    const employeeId = this.http.getCurrentEmployeeIdTimeoff();
    if (employeeId) {
      this.onCheckemployee(employeeId);
    } else {
      this.getAllwfhallocations();
    }
  }

  onCheckemployee(employeedId: any) {
    if (employeedId) {
      this.employeeId = employeedId;
      this.getAllwfhallocations();
    } else {
      this.employeeId = null;
      this.getAllwfhallocations();
    }
  }

  getAllEmployeeDetails() {
    const status = ['Active', 'Trainee Active', 'Active Contract'];
    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${status}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res: any) => {
        this.activeEmplist = res.map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''}  ${employee.middleName ?? ''} ${employee.lastName ?? ''}`,
          value: employee.employeeId
        }));
      },
    });
  }

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
    let url = `WfhDateRangeAllocation/GetAll?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;

    if (this.selectedYear) {
      url +=`&year=${this.selectedYear}`;};
    if (this.employeeId) {
      url += `&employeeIds=${encodeURIComponent(this.employeeId)}`;
    }
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
    this.pageNumber = 1;
    this.first = 0;
    this.pageSize = pageSize;
    this.getAllwfhallocations();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageNumber = event.page + 1;
    this.getAllwfhallocations();
  }

  getWfhallocationHistory(EmployeeId:any): void {
    let url = `WfhDateRangeAllocation/getWfhAllocationSummary?employeeId=${EmployeeId}`;
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.wfh_history = res.data || [];
        },
        error: (err) => {
          console.error('Error fetching shifts:', err);
        },
      });
  }

  onClick(data:any,content: any) {
    this.selectedId=data.id;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  InactiveWFHAllocation() {
    const payload = {
      status: 'Inactive',
    };
    this.http
      .putData(`WfhDateRangeAllocation/update/${this.selectedId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.getAllwfhallocations();
          this.modal.openSuccessModal(`Multi-date range inactivated successfully`);
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          this.modal.openErrorModal(
            err.error.message
              ? err.error.message
              : 'Failed to allocate WFH. Please try again later'
          );
        },
        complete: () => {
        },
      });
  }

  activeWFHAllocation() {
    const payload = {
      status: 'Active',
    };
    this.http
      .putData(`WfhDateRangeAllocation/update/${this.selectedId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.getAllwfhallocations();
          this.modal.openSuccessModal(`Multi-date range activated successfully`);
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          this.modal.openErrorModal(
            err.error.message
              ? err.error.message
              : 'Failed to allocate WFH. Please try again later'
          );
        },
        complete: () => {
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
