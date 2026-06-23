import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ICarryForward, ILeaveCategory } from '../../../flexible-leave-allocation/leave-allocation.model';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from "../../../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-load-entilements-map-categoery',
  imports: [CommonModule, Select, FormsModule, NoDataFoundComponent],
  templateUrl: './load-entilements-map-categoery.component.html',
  styleUrl: './load-entilements-map-categoery.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoadEntilementsMapCategoeryComponent implements OnInit, OnDestroy {
  carryforwarddata: any = {};
  empinfo: any = {};
  loading = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  shiftwisedata: any[] = [];
  nextYearData: ILeaveCategory[] = [];
  nextYear!: number;
  currentYear!: number;
  employeesList: any[] = [];

  constructor(public formValidations: FormValidationsService, private route: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}');
    this.currentYear = this.carryforwarddata?.year;
    this.getCarryForwardData(this.carryforwarddata);
    this.getdataforcarryforwardforplaylod(this.carryforwarddata);
    this.getshiftdatawise(this.carryforwarddata);
  }

  getCarryForwardData(carryforwarddata: ICarryForward) {
    this.nextYear = this.currentYear + 1;
    this.http.getData(`OrgLeavesCategories?locationId=${carryforwarddata.location.id}&subLocationId=${carryforwarddata.subLocation.id}&year=${this.nextYear}&status=Published&shiftId=${carryforwarddata.shift.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.nextYearData = res;
      }
    });
  }

  getshiftdatawise(carryforwarddata: ICarryForward) {
    this.loading = true;
    this.http.getData(`LeaveCarryForward/categories-by-shift?year=${carryforwarddata.year}&locationIds=${carryforwarddata.location.id}&subLocationIds=${carryforwarddata.subLocation.id}&shiftIds=${carryforwarddata.shift.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.shiftwisedata = res.data;
        // restore saved destination on back navigation
        const savedMapping: any[] = Array.isArray(this.carryforwarddata?.categoryMapping) ? this.carryforwarddata.categoryMapping : [];
        if (savedMapping.length > 0) {
          this.shiftwisedata.forEach((shift: any) => {
            (shift?.categories ?? []).forEach((cat: any) => {
              const match = savedMapping.find((m: any) => m.sourceId === cat.id);
              if (match) cat.selectedDestinationId = match.destinationId;
            });
          });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  getdataforcarryforwardforplaylod(carryforwarddata: ICarryForward) {
    this.http.getData(`Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata.location.id}&subLocationIds=${carryforwarddata.subLocation.id}&shiftIds=${carryforwarddata.shift.id}&year=${carryforwarddata.year}&excludeJobProcessedEmployees=true&employeeTypes=Permanent,Contract,Trainee`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { this.formatCarryList(res.data); }
    });
  }

  formatCarryList(data: any[]) {
    const grouped: any = {};
    data.forEach((item: any) => {
      if (!grouped[item.employeeId]) {
        grouped[item.employeeId] = { employeeId: item.employeeId, gradeId: item.jobGradeId, leaveEntries: [] };
      }
      grouped[item.employeeId].leaveEntries.push({
        leaveCategoryId: item.leaveCategoryId,
        actualCarryForward: item.actualCarryForward ?? 0
      });
    });
    this.employeesList = Object.values(grouped);
  }

  isAllValid(): boolean {
    const allCategories = this.shiftwisedata.flatMap((shift: any) => shift?.categories ?? []);
    return allCategories.length > 0 && allCategories.every((cat: any) => !!cat.selectedDestinationId);
  }

  submit() {
    const raw = localStorage.getItem('loadEntitlement');
    const stored = raw ? JSON.parse(raw) : {};
    const allCategories = this.shiftwisedata.flatMap((shift: any) => shift?.categories ?? []);
    stored.categoryMapping = allCategories.map((c: any) => {
      const dest = this.nextYearData.find((n: any) => n.id === c.selectedDestinationId) as any;
      const frequencyType = dest?.entitlementFrequency ?? 'YEARLY';
      const previousCycleHandling = frequencyType === 'YEARLY' ? null : (dest?.entitlementCycleHandling ?? null);
      return {
        sourceId: c.id,
        sourceName: c.name,
        sourceCode: c.categoryCode,
        destinationId: c.selectedDestinationId,
        destinationName: dest?.name ?? '',
        frequencyType,
        previousCycleHandling,
      };
    });
    // aggregate total actualCarryForward per sourceId
    const totalsMap: Record<number, number> = {};
    this.employeesList.forEach((emp: any) => {
      (emp.leaveEntries ?? []).forEach((entry: any) => {
        const sid = entry.leaveCategoryId;
        totalsMap[sid] = (totalsMap[sid] ?? 0) + (entry.actualCarryForward ?? 0);
      });
    });
    stored.categoryTotals = totalsMap;
    // auto-generate computedBreakdown from category entitlement config
    const year: number = (stored.year ?? new Date().getFullYear()) + 1;
    const destMap = new Map<number, { name: string; frequencyType: string; previousCycleHandling: string | null; total: number }>();
    for (const m of stored.categoryMapping) {
      if (!m.destinationId) continue;
      const sourceTotal = totalsMap[m.sourceId] ?? 0;
      if (destMap.has(m.destinationId)) {
        destMap.get(m.destinationId)!.total += sourceTotal;
      } else {
        destMap.set(m.destinationId, { name: m.destinationName, frequencyType: m.frequencyType, previousCycleHandling: m.previousCycleHandling, total: sourceTotal });
      }
    }
    stored.computedBreakdown = Array.from(destMap.entries()).map(([destId, v]) => ({
      key: `${destId}__${v.frequencyType}__${v.previousCycleHandling}`,
      destinationId: destId,
      targetCategoryName: v.name,
      frequencyType: v.frequencyType,
      previousCycleHandling: v.previousCycleHandling,
      total: v.total,
      cycles: this.generateCycles(v.total, v.frequencyType, year),
    }));
    localStorage.setItem('loadEntitlement', JSON.stringify(stored));
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-preview']);
  }

  private generateCycles(total: number, frequencyType: string, year: number): any[] {
    const CYCLE_COUNT: Record<string, number> = { MONTHLY: 12, QUARTERLY: 4, HALF_YEARLY: 2, YEARLY: 1 };
    const count = CYCLE_COUNT[frequencyType] ?? 1;
    const perCycle = Math.floor((total / count) * 2) / 2;
    const distributed = Math.round(perCycle * count * 100) / 100;
    const remainder = Math.round((total - distributed) * 100) / 100;
    const pad = (n: number) => String(n).padStart(2, '0');
    const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return Array.from({ length: count }, (_, i) => {
      const { start, end } = this.getCycleDates(frequencyType, year, i + 1);
      const value = i === count - 1 ? Math.round((perCycle + remainder) * 100) / 100 : perCycle;
      return { cycleNo: i + 1, label: this.formatCycleLabel(frequencyType, i + 1, start, end), cycleStart: toStr(start), cycleEnd: toStr(end), value };
    });
  }

  private getCycleDates(frequencyType: string, year: number, cycleNo: number): { start: Date; end: Date } {
    switch (frequencyType) {
      case 'MONTHLY': { const m = cycleNo - 1; return { start: new Date(year, m, 1), end: new Date(year, m + 1, 0) }; }
      case 'QUARTERLY': { const m = (cycleNo - 1) * 3; return { start: new Date(year, m, 1), end: new Date(year, m + 3, 0) }; }
      case 'HALF_YEARLY': { const m = (cycleNo - 1) * 6; return { start: new Date(year, m, 1), end: new Date(year, m + 6, 0) }; }
      default: return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    }
  }

  private formatCycleLabel(frequencyType: string, cycleNo: number, start: Date, end: Date): string {
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    const range = `${fmt(start)} - ${fmt(end)}`;
    switch (frequencyType) {
      case 'MONTHLY': return range;
      case 'QUARTERLY': return `Q${cycleNo} (${range})`;
      case 'HALF_YEARLY': return `H${cycleNo} (${range})`;
      case 'YEARLY': return `Year (${range})`;
      default: return `Cycle ${cycleNo} (${range})`;
    }
  }

  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-create']);
  }

  hexToRgba(hex: string, alpha = 1) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
