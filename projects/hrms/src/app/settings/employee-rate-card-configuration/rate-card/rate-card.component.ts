import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Paginator } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { IRateCardActiveViewModel } from './rate-card-model';
import { AddRateCardComponent } from '../add-rate-card/add-rate-card.component';
import { Router } from '@angular/router';
import { RateCardTabsComponent } from "../rate-card-tabs/rate-card-tabs.component";
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";

@Component({
  selector: 'app-rate-card',
  imports: [CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SelectModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    FormsModule,
    Paginator,
    NgbPopoverModule, RateCardTabsComponent, SettingsHeaderComponent],
  templateUrl: './rate-card.component.html',
  styleUrl: './rate-card.component.scss'
})
export class RateCardComponent implements OnInit , OnDestroy {
getActiveRateCardDetails$ = new BehaviorSubject<IRateCardActiveViewModel[]>([]);
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
  hours_history=[] as any;
  yearSelectionForm!: FormGroup;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  activeEmplist = [] as any;
  years: number[] = [];
  employeeId:number | null = null;
  records: IRateCardActiveViewModel[] = [];
  selectedId:number | null = null;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private modalService: NgbModal,
    public rbac: RbacService,
    public router: Router,
  ) {}

  ngOnInit(): void {
     // year selection values
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
     // Now initialize the form with the selectedYear
    this.yearSelectionForm = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    this.getAllEmployeeDetails();
    this.getAllRateCardDetails();
  }
  getExperienceFrom(item?: IRateCardActiveViewModel): number | string {
 if (!item?.experienceBands?.length) {
    return '-';
  }
  const band = item.experienceBands[0];
  return `${band.experienceFrom}-${band.experienceTo}`;
}
  // On year change
   onYearChange() {
    const selectedYear = this.yearSelectionForm.get('selectedYear')?.value;
    this.selectedYear = selectedYear;  // Update the local variable so template sees the change
    const employeeId = this.http.getCurrentEmployeeIdTimeoff();
    if (employeeId) {
      this.onCheckemployee(employeeId);
    } else {
      this.getAllRateCardDetails();
    }
  }
    openAdd() {
    this.router.navigate(['/settings/employee-rate-card/rate-card/rate-card-add']);
  }
 onCheckemployee(employeedId: any) {
    if (employeedId) {
      this.employeeId = employeedId;
    this.getAllRateCardDetails();
    } else {
      this.employeeId = null;
     this.getAllRateCardDetails();
    }
  }
  // get all employee details
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
  // get all wfh allocations
  getAllRateCardDetails(): void {
    this.isloading = true;
    if (
      !this.searchValue ||
      this.searchValue == '' ||
      this.searchValue == null ||
      this.searchValue == undefined
    ) {
      this.searchValue = null;
    }
    let url = `RateCard?status=active&page=${this.pageNumber}&pageSize=${this.pageSize}`;

    if (this.selectedYear) {
      url +=`&year=${this.selectedYear}`;};
    // Add employeeIds if available
    if (this.employeeId) {
      url += `&entityValues=${encodeURIComponent(this.employeeId)}`;
    }
    // Only add searchValue if it's not empty/null/undefined
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${encodeURIComponent(this.searchValue.trim())}`;
    }
    // let url =`RateCard?status=active`
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isloading = false;
          this.getActiveRateCardDetails$.next(res.data.items || []);
          this.collectionSize = res.data.totalCount;
          this.hasNextPage = res.data.hasNextPage;
          this.hasPreviousPage = res.data.hasPreviousPage;
        },
        error: (err) => {
          this.isloading = false;
          this.getActiveRateCardDetails$.next([]);
          console.error('Error fetching shifts:', err);
        },
      });
  }
  onPageSizeChange(pageSize: any) {
    this.pageNumber = 1; 
    this.first = 0;
    this.pageSize = pageSize;
    this.getAllRateCardDetails();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageNumber = event.page + 1; 
    this.getAllRateCardDetails();
  }
//get wfh allocation history
  getWfhallocationHistory(EmployeeId:any): void {
    let url = `FlexibleWfhAllocation/getWfhAllocationSummary?employeeId=${EmployeeId}`;
    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.hours_history = res.data || [];
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
      .putData(`FlexibleWorkhoursAllocation/update/${this.selectedId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          
          this.modal.openSuccessModal(`${res.data.entityValue.name} Work hours allocation has been Inactivated.`);
          this.getAllRateCardDetails();
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
      .putData(`FlexibleWorkhoursAllocation/update/${this.selectedId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          
          this.modal.openSuccessModal(`${res.data.entityValue.name} Work hours allocation has been activated`);
          this.getAllRateCardDetails();
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
