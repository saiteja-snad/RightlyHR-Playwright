import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { ICarryForward } from '../../../flexible-leave-allocation/leave-allocation.model';
import { DataLoaderContentComponent } from '../../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../../shared/no-data-found/no-data-found.component';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../../../services/open-modal.service';
interface EmployeeCycleBreakdown {
  destinationCategoryId: number;
  destinationCategoryName: string;
  frequencyType: string;
  previousCycleHandling: string;
  allowedDays: number;
  sourceCategories: { name: string; code: string; actualCarryForward: number }[];
  cycles: { cycleNo: number; label: string; cycleStart: string; cycleEnd: string; entitlement: number }[];
}
@Component({
  selector: 'app-load-entitlemetpreview',
  imports: [CommonModule, NoDataFoundComponent, DataLoaderContentComponent,
    Accordion, AccordionHeader, AccordionPanel, AccordionContent, TableModule, TranslateModule],
  templateUrl: './load-entitlemetpreview.component.html',
  styleUrl: './load-entitlemetpreview.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoadEntitlemetpreviewComponent implements OnInit, OnDestroy {
  carryforwarddata: any = {};
  loading = false;
  spinnerLoader = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo: any = {};
  leaveTypes: string[] = [];
  employeesList: any[] = [];
  // employee name click popup
  selectedEmployeeDetail: any[] = [];
  selectemployeename = '';
  selectedfusionEmpId = '';
  // total count click — cycle breakdown popup
  selectedEmployeeBreakdown: any = null;
  selectedEmployeeBreakdownView: EmployeeCycleBreakdown[] = [];
  // which breakdown row is expanded in viewmodal table 2
  expandedBreakdownIdx: number | null = null;
  toggleBreakdownRow(idx: number): void {
    this.expandedBreakdownIdx = this.expandedBreakdownIdx === idx ? null : idx;
  }
  @ViewChild('viewmodal', { static: true }) viewmodal!: TemplateRef<any>;
  @ViewChild('breakdownModal', { static: true }) breakdownModal!: TemplateRef<any>;
  // from localStorage
  private categoryMapping: any[] = [];
  private computedBreakdown: any[] = [];

  constructor(public formValidations: FormValidationsService, private modalService: NgbModal, private route: Router, 
    private http: HttpService, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}');
    this.categoryMapping = Array.isArray(this.carryforwarddata?.categoryMapping) ? this.carryforwarddata.categoryMapping : [];
    this.computedBreakdown = Array.isArray(this.carryforwarddata?.computedBreakdown) ? this.carryforwarddata.computedBreakdown : [];
    this.getdataforcarryforward(this.carryforwarddata);
  }

  // ── Load employees from report ────────────────────────────────────────────
  getdataforcarryforward(carryforwarddata: ICarryForward) {
    this.loading = true;
    this.http.getData(
      `Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata?.location?.id}&subLocationIds=${carryforwarddata?.subLocation?.id}&shiftIds=${carryforwarddata?.shift?.id}&year=${carryforwarddata?.year}&excludeJobProcessedEmployees=true&employeeTypes=Permanent,Contract,Trainee`
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.formatCarryList(res.data);
      },
      error: () => { this.loading = false; }
    });
  }

  formatCarryList(data: any[]) {
    this.leaveTypes = [...new Set(data.map((x: any) => x.leaveType))];
    const grouped: any = {};
    data.forEach((item: any) => {
      if (!grouped[item.employeeId]) {
        grouped[item.employeeId] = {
          employee: item.employeeName,
          employeeId: item.employeeId,
          fusionEmpId: item.fusionEmpId,
          gradeId: item.jobGradeId ?? 0,
          leaveEntries: []
        };
      }
      grouped[item.employeeId][item.leaveType] = item.actualCarryForward;
      grouped[item.employeeId].leaveEntries.push({
        leaveType: item.leaveType,
        leaveCategoryId: item.leaveCategoryId,
        entitled: item.entitled,
        availed: item.availed,
        balance: item.balance,
        maxCarryForward: item.maxCarryForward,
        actualCarryForward: item.actualCarryForward ?? 0,
        maxEncashment: item.maxEncashment,
        leaveEncashed: item.leaveEncashed,
        leaveLapsed: item.lapsedLeave
      });
    });
    this.employeesList = Object.values(grouped).map((emp: any) => ({
      ...emp,
      total: emp.leaveEntries.reduce((sum: number, e: any) => sum + (e.actualCarryForward || 0), 0)
    }));
  }

  // ── Employee name click — original detail popup ───────────────────────────
  openLeaveDetails(row: any) {
    this.selectemployeename = row.employee;
    this.selectedfusionEmpId = row.fusionEmpId;
    this.selectedEmployeeDetail = row.leaveEntries;
    this.expandedBreakdownIdx = null;
    // build breakdown summary for table 2
    this.selectedEmployeeBreakdownView = this.buildEmployeeBreakdown(row);
    this.modalService.open(this.viewmodal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  // compute per-entry cycle breakdown for the popup
  getEntryCycles(entry: any): { cycleNo: number; label: string; cycleStart: string; cycleEnd: string; entitlement: number }[] {
    const destId = this.getDestinationId(entry.leaveCategoryId);
    if (!destId) return [];
    const group = this.computedBreakdown.find((g: any) => g.destinationId === destId);
    if (!group) return [];
    return this.distributeAcrossCycles(entry.actualCarryForward ?? 0, group);
  }

  // ── Total count click — cycle breakdown popup ─────────────────────────────
  openBreakdown(row: any) {
    this.selectedEmployeeBreakdown = row;
    this.selectedEmployeeBreakdownView = this.buildEmployeeBreakdown(row);
    this.modalService.open(this.breakdownModal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  private buildEmployeeBreakdown(emp: any): EmployeeCycleBreakdown[] {
    // aggregate allowedDays per destinationId for this employee, track source entries
    const destTotals = new Map<number, number>();
    const destSources = new Map<number, { name: string; code: string; actualCarryForward: number }[]>();
    for (const entry of emp.leaveEntries) {
      const destId = this.getDestinationId(entry.leaveCategoryId);
      if (!destId) continue;
      destTotals.set(destId, (destTotals.get(destId) ?? 0) + (entry.actualCarryForward ?? 0));
      // find source name/code from categoryMapping
      const mapping = this.categoryMapping.find((m: any) => m.sourceId === entry.leaveCategoryId);
      if (!destSources.has(destId)) destSources.set(destId, []);
      destSources.get(destId)!.push({
        name: mapping?.sourceName ?? entry.leaveType,
        code: mapping?.sourceCode ?? '',
        actualCarryForward: entry.actualCarryForward ?? 0
      });
    }

    const result: EmployeeCycleBreakdown[] = [];
    for (const group of this.computedBreakdown) {
      const allowedDays = destTotals.get(group.destinationId) ?? 0;
      if (allowedDays === 0) continue;
      const cycles = this.distributeAcrossCycles(allowedDays, group);
      result.push({
        destinationCategoryId: group.destinationId,
        destinationCategoryName: group.targetCategoryName,
        frequencyType: group.frequencyType,
        previousCycleHandling: group.previousCycleHandling,
        allowedDays,
        sourceCategories: destSources.get(group.destinationId) ?? [],
        cycles
      });
    }
    return result;
  }

  // ── Core distribution logic ───────────────────────────────────────────────

  /**
   * Distributes `employeeTotal` across cycles using the same ratio as the
   * configured breakdown group. Rounds each cycle to nearest 0.5, remainder
   * goes to last cycle.
   */
  private distributeAcrossCycles(employeeTotal: number, group: any): 
  { cycleNo: number; label: string; cycleStart: string; cycleEnd: string; entitlement: number }[] {
    const configuredCycles: any[] = group.cycles ?? [];
    const count = configuredCycles.length;
    if (count === 0 || employeeTotal === 0) return [];
    const configuredTotal = group.total;
    const cycles = configuredCycles.map((c: any) => {
      const ratio = configuredTotal > 0 ? (c.value / configuredTotal) : (1 / count);
      const raw = employeeTotal * ratio;
      const rounded = Math.floor(raw * 2) / 2;
      return {
        cycleNo: c.cycleNo,
        label: c.label,
        cycleStart: this.toDateString(c.cycleStart),
        cycleEnd: this.toDateString(c.cycleEnd),
        entitlement: rounded
      };
    });
    const distributed = Math.round(cycles.reduce((s, c) => s + c.entitlement, 0) * 100) / 100;
    const remainder = Math.round((employeeTotal - distributed) * 100) / 100;
    if (remainder !== 0) {
      cycles[cycles.length - 1].entitlement =
        Math.round((cycles[cycles.length - 1].entitlement + remainder) * 100) / 100;
    }
    return cycles;
  }

  /** Converts any date value (Date object, ISO string, timestamp) to yyyy-MM-dd string safely */
  private toDateString(value: any): string {
    if (!value) return '';
    // already a plain date string yyyy-MM-dd
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // ISO string — take date portion directly to avoid timezone shift
    if (typeof value === 'string' && value.length >= 10) return value.slice(0, 10);
    // Date object
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    // use local date parts to avoid UTC shift
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private getDestinationId(sourceCategoryId: number): number | null {
    const mapping = this.categoryMapping.find((m: any) => m.sourceId === sourceCategoryId);
    return mapping?.destinationId ?? null;
  }

  // ── Build submit payload ──────────────────────────────────────────────────

  buildCarryForwardPayload() {
    const destinationYear = (this.carryforwarddata?.year ?? 0) + 1;
    return {
      jobType: 'CarryForward',
      year: destinationYear,
      locationId: this.carryforwarddata?.location?.id,
      subLocationId: this.carryforwarddata?.subLocation?.id,
      shiftId: this.carryforwarddata?.shift?.id,
      notes: '',
      initiatedBy: this.empinfo?.employeeId,
      requestPayload: {
        carryForwardMappings: this.categoryMapping
          .filter((m: any) => m.sourceId && m.destinationId)
          .map((m: any) => ({
            year: (this.carryforwarddata?.year ?? 0) + 1,
            sourceCategoryId: m.sourceId,
            destinationCategoryId: m.destinationId
          })),
        employees: this.employeesList.map(emp => {
          const destTotals = new Map<number, number>();
          for (const entry of emp.leaveEntries) {
            const destId = this.getDestinationId(entry.leaveCategoryId);
            if (!destId) continue;
            destTotals.set(destId, (destTotals.get(destId) ?? 0) + (entry.actualCarryForward ?? 0));
          }
          const entitlements = Array.from(destTotals.entries()).map(([destId, allowedDays]) => {
            const group = this.computedBreakdown.find((g: any) => g.destinationId === destId);
            if (!group || allowedDays === 0) return null;
            const cycles = this.distributeAcrossCycles(allowedDays, group).filter(c => c.entitlement > 0).map(c => ({
              cycle_no: c.cycleNo,
              cycle_start: c.cycleStart,
              cycle_end: c.cycleEnd,
              entitlement: c.entitlement
            }));
            return {
              categoryId: destId,
              policyId: null,
              frequencyType: group.frequencyType,
              cycleHandling: group.previousCycleHandling,
              allowedDays,
              cycles
            };
          }).filter(e => e !== null);
          return {
            employeeId: emp.employeeId,
            gradeId: emp.gradeId ?? 0,
            locationId: this.carryforwarddata?.location?.id,
            subLocationId: this.carryforwarddata?.subLocation?.id,
            shiftId: this.carryforwarddata?.shift?.id,
            entitlements
          };
        }).filter(emp => emp.entitlements.length > 0)
      }
    };
  }

  submit() {
    this.spinnerLoader = true;
    const body = this.buildCarryForwardPayload();
    this.http.postdata('LeaveEntitlementJobs/create-entitlement', body).subscribe({
      next: () => {
        this.spinnerLoader = false;
        this.conformationPopup.openSuccessModal('Carry forward entitlement job created successfully.');
        setTimeout(() => {
          this.route.navigate(['/settings/timeoff-configurations/load-entitlement/carry-forward']);
          localStorage.removeItem('loadEntitlement');
        }, 2000);
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Carry forward entitlement failed.');
      }
    });
  }

  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-breakdown']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}