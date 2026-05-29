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
import { Accordion, AccordionHeader, AccordionPanel, AccordionContent } from "primeng/accordion";
@Component({
  selector: 'app-intial-load-entitlement-preview',
  imports: [CommonModule, NoDataFoundComponent, DataLoaderContentComponent, TranslateModule, FormsModule, TableModule, Accordion, AccordionHeader, AccordionPanel, AccordionContent],
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
  spinnerLoader= false;
  get loadCategoriesCount(): number {
    const breakdownData = Array.isArray(this.carryforwarddata?.breakdownData) ? this.carryforwarddata.breakdownData : [];
    return breakdownData
      .map((c: any) => c?.category_id ?? c?.categoryId ?? c?.id)
      .filter((id: any) => !!id).length;
  }
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
    const locationId = carryforwarddata?.location?.id;
    const subLocationId = carryforwarddata?.subLocation?.id;
    const shiftId = carryforwarddata?.shift?.id;
    const year = carryforwarddata?.year;
    const breakdownData = Array.isArray(carryforwarddata?.breakdownData) ? carryforwarddata.breakdownData : [];

    if (!locationId || !subLocationId || !shiftId || !year) {
      this.loading = false;
      this.employeesTableData = [];
      return;
    }

    // derive category_ids from breakdownData returned by the breakdown API
    const categoryIds = breakdownData
      .map((c: any) => c?.category_id ?? c?.categoryId ?? c?.id)
      .filter((id: any) => !!id);

    if (categoryIds.length === 0) {
      this.loading = false;
      this.employeesTableData = [];
      return;
    }

    const payload = {
      location_ids: [locationId],
      sub_location_ids: [subLocationId],
      shift_ids: [shiftId],
      year: year,
      category_ids: categoryIds,
      exclude_job_processed_employees: true,
      search_term: this.searchQuery || '',
      breakdown_data: this.buildOptimizedBreakdown(breakdownData)
    };

    this.http.getEmployeesWithBreakdown(payload).pipe(takeUntil(this.destroy$)).subscribe({
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

  private buildOptimizedBreakdown(categories: any[]): any[] {
    const formatDate = (value: any) => {
      if (!value) return null;
      if (typeof value === 'string') {
        // Avoid timezone shifting: take the date portion as-is.
        // Examples:
        //  - "2026-01-01T00:00:00" -> "2026-01-01"
        //  - "2026-01-01" -> "2026-01-01"
        return value.length >= 10 ? value.slice(0, 10) : null;
      }
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return d.toISOString().slice(0, 10);
    };

    const result: any[] = [];
    for (const cat of categories) {
      const categoryId = cat?.category_id ?? cat?.categoryId ?? cat?.id;
      if (!categoryId) continue;

      const gradeToCycles = new Map<number, Map<number, any>>();
      const gradeToPolicyId = new Map<number, number | null>();
      const groups = Array.isArray(cat?.groups) ? cat.groups : [];
      for (const group of groups) {
        const grades = Array.isArray(group?.grades) ? group.grades : [];
        const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
        for (const grade of grades) {
          const gradeId = grade?.grade_id ?? grade?.gradeId ?? grade?.id;
          if (!gradeId) continue;

          const policyId =
            typeof grade?.policy_id === 'number'
              ? grade.policy_id
              : typeof grade?.policyId === 'number'
                ? grade.policyId
                : null;
          if (!gradeToPolicyId.has(gradeId)) {
            gradeToPolicyId.set(gradeId, policyId);
          } else {
            const existing = gradeToPolicyId.get(gradeId);
            if (existing !== null && policyId !== null && existing !== policyId) {
              console.warn(
                '[Entitlement Breakdown] Conflicting policy_id for same grade_id',
                { category_id: categoryId, grade_id: gradeId, existing_policy_id: existing, new_policy_id: policyId }
              );
            }
            if (existing === null && policyId !== null) {
              gradeToPolicyId.set(gradeId, policyId);
            }
          }

          if (!gradeToCycles.has(gradeId)) {
            gradeToCycles.set(gradeId, new Map<number, any>());
          }
          const cycleMap = gradeToCycles.get(gradeId)!;

          for (const c of cycles) {
            const cycleNo = c?.cycle_no ?? c?.cycleNo;
            if (!cycleNo) continue;
            cycleMap.set(cycleNo, {
              cycle_no: cycleNo,
              cycle_start: formatDate(c?.cycle_start ?? c?.cycleStart),
              cycle_end: formatDate(c?.cycle_end ?? c?.cycleEnd),
              entitlement: typeof c?.entitlement === 'number' ? c.entitlement : null,
            });
          }
        }
      }

      const grades = Array.from(gradeToCycles.entries())
        .sort(([a], [b]) => a - b)
        .map(([gradeId, cycleMap]) => ({
          grade_id: gradeId,
          policy_id: gradeToPolicyId.get(gradeId) ?? null,
          cycles: Array.from(cycleMap.values()).sort((a, b) => a.cycle_no - b.cycle_no),
        }));

      result.push({
        category_id: categoryId,
        grades,
      });
    }

    return result;
  }

  leaveHeaders: any[] = [];
  employeesTableData: any[] = [];
  leaveEntries: any[] = []
  selectAll: boolean = false;
  selectedEmployeeBreakdown: any = null;
  selectedEmployeeBreakdownView: Array<{ categoryId: number; categoryName: string; total: number; cycles: Array<{ cycle_no: number; cycle_start: string | null; cycle_end: string | null; entitlement: number }> }> = [];
  @ViewChild('breakdownModal', { static: true }) breakdownModal!: TemplateRef<any>;
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
        fusionEmpId: emp.fusionEmpId,
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
        totalLeaveEntitlement,
        leaveBreakdown: emp.leave_breakdown || emp.leaveBreakdown || []
      };
    });

    this.leaveHeaders = Array.from(headerMap.values());
    console.log("leaves", this.leaveHeaders);

  }

  openBreakdown(emp: any) {
    this.selectedEmployeeBreakdown = emp;
    this.selectedEmployeeBreakdownView = this.normalizeEmployeeBreakdown(emp);
    this.modalService.open(this.breakdownModal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  private normalizeEmployeeBreakdown(emp: any): Array<{ categoryId: number; categoryName: string; total: number; cycles: Array<{ cycle_no: number; cycle_start: string | null; cycle_end: string | null; entitlement: number }> }> {
    const breakdown = Array.isArray(emp?.leaveBreakdown) ? emp.leaveBreakdown : Array.isArray(emp?.leave_breakdown) ? emp.leave_breakdown : [];
    const byCategory: Array<{ categoryId: number; categoryName: string; total: number; cycles: Array<{ cycle_no: number; cycle_start: string | null; cycle_end: string | null; entitlement: number }> }> = [];
    for (const cat of breakdown) {
      const categoryId = cat?.category_id ?? cat?.categoryId ?? cat?.id;
      if (!categoryId) continue;
      const categoryName = this.getCategoryName(categoryId);
      const cycleMap = new Map<number, { cycle_no: number; cycle_start: string | null; cycle_end: string | null; entitlement: number }>();
      const grades = Array.isArray(cat?.grades) ? cat.grades : [];
      for (const g of grades) {
        const cycles = Array.isArray(g?.cycles) ? g.cycles : [];
        for (const c of cycles) {
          const no = c?.cycle_no ?? c?.cycleNo;
          if (!no) continue;
          const start = c?.cycle_start ?? c?.cycleStart ?? null;
          const end = c?.cycle_end ?? c?.cycleEnd ?? null;
          const ent = typeof c?.entitlement === 'number' ? c.entitlement : 0;
          const existing = cycleMap.get(no);
          if (existing) {
            existing.entitlement += ent;
          } else {
            cycleMap.set(no, { cycle_no: no, cycle_start: start, cycle_end: end, entitlement: ent });
          }
        }
      }
      // Support direct category-level cycles (no grades array)
      if (grades.length === 0) {
        const directCycles = Array.isArray(cat?.cycles) ? cat.cycles : [];
        for (const c of directCycles) {
          const no = c?.cycle_no ?? c?.cycleNo;
          if (!no) continue;
          const start = c?.cycle_start ?? c?.cycleStart ?? null;
          const end = c?.cycle_end ?? c?.cycleEnd ?? null;
          const ent = typeof c?.entitlement === 'number' ? c.entitlement : 0;
          const existing = cycleMap.get(no);
          if (existing) {
            existing.entitlement += ent;
          } else {
            cycleMap.set(no, { cycle_no: no, cycle_start: start, cycle_end: end, entitlement: ent });
          }
        }
      }
      const cycles = Array.from(cycleMap.values()).sort((a, b) => a.cycle_no - b.cycle_no);
      const total = cycles.reduce((sum, c) => sum + (c.entitlement || 0), 0);
      if (cycles.length === 0 || total === 0) continue;
      byCategory.push({ categoryId, categoryName, total, cycles });
    }
    return byCategory;
  }

  private getCategoryName(categoryId: number): string {
    const header = this.leaveHeaders.find(h => h?.categoryId === categoryId);
    return header?.name ?? `Category ${categoryId}`;
  }

  private resolvePolicyId(categoryId: any, gradeId: any): number | null {
    const cid = Number(categoryId);
    const gid = Number(gradeId);
    if (!Number.isFinite(cid) || !Number.isFinite(gid)) return null;

    const breakdownData = Array.isArray(this.carryforwarddata?.breakdownData) ? this.carryforwarddata.breakdownData : [];
    const catNode = breakdownData.find((b: any) => Number(b?.category_id ?? b?.categoryId ?? b?.id) === cid);
    if (catNode) {
      const groups = Array.isArray(catNode?.groups) ? catNode.groups : [];
      for (const group of groups) {
        const grades = Array.isArray(group?.grades) ? group.grades : [];
        for (const g of grades) {
          const gId = Number(g?.grade_id ?? g?.gradeId ?? g?.id);
          if (gId !== gid) continue;
          const p = g?.policy_id ?? g?.policyId;
          if (Number.isFinite(Number(p))) return Number(p);
        }
      }

      const directGrades = Array.isArray(catNode?.grades) ? catNode.grades : [];
      for (const g of directGrades) {
        const gId = Number(g?.grade_id ?? g?.gradeId ?? g?.id);
        if (gId !== gid) continue;
        const p = g?.policy_id ?? g?.policyId;
        if (Number.isFinite(Number(p))) return Number(p);
      }
    }

    const pm = this.policymapping?.data;
    if (Array.isArray(pm)) {
      const match = pm.find((x: any) =>
        Number(x?.categoryId ?? x?.category_id ?? x?.leaveCategoryId ?? x?.leave_category_id) === cid
        && Number(x?.gradeId ?? x?.grade_id) === gid
      );
      if (match) {
        const p = match?.policyId ?? match?.policy_id;
        if (Number.isFinite(Number(p))) return Number(p);
      }
    }

    return null;
  }


  buildCarryForwardPayload() {


    // 🔹 If user selected employees → use selected
    // 🔹 Else → use full table data
    const sourceEmployees =
      this.selectedEmployees && this.selectedEmployees.length > 0
        ? this.selectedEmployees
        : this.employeesTableData;


    const frequencyType = this.carryforwarddata?.frequencyType ?? null;
    const cycleHandling = this.carryforwarddata?.cycleHandling ?? null;

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
          .filter(emp => emp?.isValid === true)
          .map(emp => ({
            employeeId: emp?.employeeId,
            gradeId: emp?.gradeId,
            locationId: this.carryforwarddata?.location?.id,
            subLocationId: this.carryforwarddata?.subLocation?.id,
            shiftId: this.carryforwarddata?.shift?.id,

            entitlements: (emp.leaveEntries || [])
              .filter((x: any) => x.isValid === true && x.isAlreadyEntitled === false && x.allowedDays > 0)
              .map((x: any) => {
                const categoryId = x?.leaveCategoryId;
                const allowedDays = x?.allowedDays;

                const breakdown = Array.isArray(emp?.leaveBreakdown)
                  ? emp.leaveBreakdown
                  : Array.isArray(emp?.leave_breakdown)
                    ? emp.leave_breakdown
                    : [];

                const catBreakdown = breakdown.find((b: any) => (b?.category_id ?? b?.categoryId ?? b?.id) === categoryId);
                const grades = Array.isArray(catBreakdown?.grades) ? catBreakdown.grades : [];
                const gradeId = emp?.gradeId;
                const gradeNode =
                  (gradeId && grades.length > 0
                    ? grades.find((g: any) => (g?.grade_id ?? g?.gradeId ?? g?.id) === gradeId)
                    : null) ?? (grades.length > 0 ? grades[0] : null);

                const policyId = this.resolvePolicyId(categoryId, gradeId) ?? gradeNode?.policy_id ?? gradeNode?.policyId ?? null;
                const rawCycles = Array.isArray(gradeNode?.cycles)
                  ? gradeNode.cycles
                  : Array.isArray(catBreakdown?.cycles)
                    ? catBreakdown.cycles
                    : [];

                const cycles = rawCycles
                  .map((c: any) => ({
                    cycle_no: c?.cycle_no ?? c?.cycleNo,
                    cycle_start: c?.cycle_start ?? c?.cycleStart ?? null,
                    cycle_end: c?.cycle_end ?? c?.cycleEnd ?? null,
                    entitlement: typeof c?.entitlement === 'number' ? c.entitlement : Number.isFinite(Number(c?.entitlement)) ? Number(c.entitlement) : null,
                  }))
                  .filter((c: any) => c?.cycle_no !== null && c?.cycle_no !== undefined);

                return {
                  categoryId,
                  policyId,
                  frequencyType: (() => {
                    const bd = Array.isArray(this.carryforwarddata?.breakdownData) ? this.carryforwarddata.breakdownData : [];
                    const catNode = bd.find((b: any) => Number(b?.category_id ?? b?.categoryId ?? b?.id) === Number(categoryId));
                    return catNode?.frequency_type ?? catNode?.frequencyType ?? this.carryforwarddata?.frequencyType ?? null;
                  })(),
                  cycleHandling: (() => {
                    const bd = Array.isArray(this.carryforwarddata?.breakdownData) ? this.carryforwarddata.breakdownData : [];
                    const catNode = bd.find((b: any) => Number(b?.category_id ?? b?.categoryId ?? b?.id) === Number(categoryId));
                    return catNode?.cycle_handling ?? catNode?.cycleHandling ?? this.carryforwarddata?.cycleHandling ?? null;
                  })(),
                  allowedDays,
                  cycles: cycles.length > 0 ? cycles : [{ cycle_no: 1, cycle_start: null, cycle_end: null, entitlement: allowedDays }]
                };
              })
          }))
          .filter(emp => emp.entitlements.length > 0)
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
    this.spinnerLoader= true;
    const body: any = this.buildCarryForwardPayload();
    if (this.carryforwarddata?.jobId) body.jobId = this.carryforwarddata.jobId;
    const isExistingJob = !!this.carryforwarddata?.jobId;
    this.http.postdata('LeaveEntitlementJobs/create-entitlement', body).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        // localStorage.setItem('carryForwardJobId', res?.data?.jobId.toString());
        // this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-execution']);
        this.spinnerLoader= false;
        this.conformationPopup.openSuccessModal(isExistingJob ? 'Categories loaded successfully.' : 'Initial load entitlement job created successfully.');
        setTimeout(() => {
          if (isExistingJob) {
            this.route.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: this.carryforwarddata.jobId } });
          } else {
            this.route.navigate(['/settings/timeoff-configurations/load-entitlement/initial-load-entitlements']);
          }
          localStorage.removeItem('intialloadEntitlement');
        }, 2000);
      
      },
      error: (err) => {
        this.spinnerLoader= false;
        this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  skipped() {
    const body: any = this.buildCarryForwardPayload();
    if (this.carryforwarddata?.jobId) body.jobId = this.carryforwarddata.jobId;
    const isExistingJob = !!this.carryforwarddata?.jobId;
    this.http.postdata('LeaveEntitlementJobs/create-entitlement', body).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(isExistingJob ? 'Categories loaded successfully.' : 'Initial load entitlement job created successfully.');
        setTimeout(() => {
          if (isExistingJob) {
            this.route.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: this.carryforwarddata.jobId } });
          } else {
            this.route.navigate(['/settings/timeoff-configurations/load-entitlement/initial-load-entitlements']);
          }
          localStorage.removeItem('intialloadEntitlement');
        }, 2000);
        // localStorage.setItem('carryForwardJobId', res?.data?.jobId.toString());
        // this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-execution'])
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
    if (this.carryforwarddata?.flow === 'jobview' && this.carryforwarddata?.jobId) {
      this.route.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: this.carryforwarddata.jobId } });
      return;
    }
    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-breakdown'])
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
