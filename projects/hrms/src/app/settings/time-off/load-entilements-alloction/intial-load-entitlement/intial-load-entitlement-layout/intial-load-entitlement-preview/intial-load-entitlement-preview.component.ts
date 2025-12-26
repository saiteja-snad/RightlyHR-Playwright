import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../../services/http.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { NoDataFoundComponent } from "../../../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from "primeng/table";
@Component({
  selector: 'app-intial-load-entitlement-preview',
  imports: [CommonModule, NoDataFoundComponent, DataLoaderContentComponent, TranslateModule, FormsModule, TableModule],
  templateUrl: './intial-load-entitlement-preview.component.html',
  styleUrl: './intial-load-entitlement-preview.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class IntialLoadEntitlementPreviewComponent implements OnInit, OnDestroy {
  empinfo: any = {};
  carryforwarddata: any = {}
  loading: boolean = false;
  searchQuery = '';
  private searchSubject = new Subject<string>();
  @ViewChild('conformation', { static: true }) conformation!: TemplateRef<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  gradeAssignments: { status: any; data: any[]; } | null = null;
  policymapping: { status: any; data: any[]; } | null = null;
  duplicatecheck: { status: any; data: any[]; } | null = null;
  isGradeAssignmentSuccess = false;
  failedGradeEmployees: any[] = [];
  selectedEmployees: any[] = [];

  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService,
    private route: Router, private http: HttpService, private offcanvasService: NgbOffcanvas) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    this.getdataforcarryforward(this.carryforwarddata);
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchQuery = value;
        this.getdataforcarryforward(this.carryforwarddata);
      });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  getdataforcarryforward(carryforwarddata: any) {
    this.loading = true;
    this.http.getData(
      `Employeedata/employees/with-leave-categories?locationIds=${carryforwarddata?.location?.id}
      &subLocationIds=${carryforwarddata?.subLocation?.id}
      &shiftIds=${carryforwarddata?.shift?.id}
      &year=${carryforwarddata?.year}&categoryIds=${carryforwarddata?.categoryIds}&excludeJobProcessedEmployees=true&searchTerm=${this.searchQuery}`
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data?.employees?.length > 0) {
          this.mapEmployees(res?.data?.employees);
        }
        else {
          this.employeesTableData = []
        }
        this.gradeAssignments = res?.data?.gradeAssignments;
        this.policymapping = res?.data?.policyMapping;
        this.duplicatecheck = res?.data?.duplicateCheck;
        // Optional helpers
        this.isGradeAssignmentSuccess = res?.gradeAssignments?.status === 'success';
        this.failedGradeEmployees = res?.gradeAssignments?.data || [];
      },
      error: () => {
        this.loading = false;
        this.employeesTableData = []
      }
    });
  }

  leaveHeaders: any[] = [];
  employeesTableData: any[] = [];
  leaveEntries: any[] = []
  selectAll: boolean = false;
  mapEmployees(employees: any[]) {
    const headerMap = new Map<string, any>();

    this.employeesTableData = employees.map(emp => {
      const leaveValues: any = {};
      const leaveEntries: any[] = [];
      let totalLeaveEntitlement = 0; // ✅ total accumulator

      emp.leaveCategories
        // ✅ ONLY valid leave categories
        // .filter((lc: any) => lc.isValid === true)
        .forEach((lc: any) => {

          const category = lc?.orgLeaveCategories;
          const code = category?.categoryCode;
          const categoryId = lc?.categoryId;
          // dynamic column values
          // leaveValues[code] = lc?.allowedDays;
          leaveValues[categoryId] = {
            allowedDays: lc?.allowedDays,
            isAlreadyEntitled: lc?.isAlreadyEntitled,
            color: lc?.color,
            categoryCode: code
          };
          // payload entries
          leaveEntries.push({
            leaveCategoryId: lc.categoryId,
            categoryCode: code,
            allowedDays: lc.allowedDays,
            isValid: lc.isValid,
            isAlreadyEntitled: lc.isAlreadyEntitled,
            color: lc.color

          });

          totalLeaveEntitlement += lc?.allowedDays || 0;

          // dynamic headers
          if (!headerMap.has(categoryId)) {
            headerMap.set(categoryId, {
              categoryId,
              code,
              name: category?.name,
              color: category?.categoryColor
            });
          }
        });

      return {
        employeeId: emp.employeeId,
        gradeId: emp.gradeId,
        employeeName: `${emp.firstName}  ${emp.middleName ?? ''} ${emp.lastName}`,
        joinedDate: emp.dateOfJoining,
        location: emp.locationName,
        sublocationName: emp.sublocationName,
        shift: emp.shiftName,
        grade: emp.gradeName,
        isValid: emp.isValid,
        selected: false,
        reason: emp.reason,
        color: emp.color,
        leaveValues,
        leaveEntries,
        totalLeaveEntitlement
      };
    });

    this.leaveHeaders = Array.from(headerMap.values());
    console.log("leaves", this.leaveHeaders);

  }


  buildCarryForwardPayload() {


    // 🔹 If user selected employees → use selected
    // 🔹 Else → use full table data
    const sourceEmployees =
      this.selectedEmployees && this.selectedEmployees.length > 0
        ? this.selectedEmployees
        : this.employeesTableData;


    return {
      jobType: 'InitialLoad',
      year: this.carryforwarddata?.year,
      locationId: this.carryforwarddata?.location?.id,
      subLocationId: this.carryforwarddata?.subLocation?.id,
      shiftId: this.carryforwarddata?.shift?.id,
      notes: '',
      initiatedBy: this.empinfo?.employeeId,

      requestPayload: {
        employees: sourceEmployees
          // ✅ only valid employees
          .filter(emp => emp?.isValid === true)
          .map(emp => ({
            employeeId: emp?.employeeId,
            gradeId: emp?.gradeId,

            entitlementsData: (emp.leaveEntries || [])
              // ✅ only valid + allowedDays > 0
              .filter((x: { isValid: boolean; isAlreadyEntitled: boolean; allowedDays: number; }) => x.isValid == true && x.isAlreadyEntitled == false && x.allowedDays > 0)


              .map((x: { leaveCategoryId: any; allowedDays: any; }) => ({
                leaveCategoryId: x?.leaveCategoryId,
                noOfDays: x?.allowedDays
              }))
          }))
          // ✅ remove employees without entitlements
          .filter(emp => emp.entitlementsData.length > 0)
      }
    };
  }


  canSubmit(): boolean {
    return this.policymapping?.status !== 'failed'
      && this.gradeAssignments?.status !== 'failed';
  }

  submit() {
    if (!this.canSubmit()) {
      this.modalService.open(this.conformation, { centered: true, backdrop: 'static', keyboard: false });
      return;
    }
    const body = this.buildCarryForwardPayload();
    this.http.postdata('LeaveEntitlementJobs/create-initial-load', body).subscribe({
      next: (res: any) => {
        localStorage.setItem('carryForwardJobId', res?.data?.jobId.toString());
        this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-execution'])
      },
      error: (err) => {
        console.error(err);
        this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  skipped() {
    const body = this.buildCarryForwardPayload();
    this.http.postdata('LeaveEntitlementJobs/create-initial-load', body).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        localStorage.setItem('carryForwardJobId', res?.data?.jobId.toString());
        this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-execution'])
      },
      error: (err) => {
        console.error(err);
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal(err.error.message);

      }
    });
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  toggleSelectAll() {
    this.employeesTableData.forEach(emp => emp.selected = this.selectAll);
  }

  back() {
    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-create'])
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}