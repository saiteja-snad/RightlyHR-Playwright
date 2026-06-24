import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../../shared/no-data-found/no-data-found.component';

interface CycleRow { cycleNo: number; label: string; value: number; cycleStart: string; cycleEnd: string; }

interface BreakdownGroup {
  key: string;
  destinationId: number;
  targetCategoryName: string;
  frequencyType: string;
  previousCycleHandling: string;
  total: number;
  cycles: CycleRow[];
}

@Component({
  selector: 'app-load-entitlement-breakdown',
  imports: [CommonModule, ReactiveFormsModule, NoDataFoundComponent],
  templateUrl: './load-entitlement-breakdown.component.html',
  styleUrl: './load-entitlement-breakdown.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoadEntitlementBreakdownComponent implements OnInit, OnDestroy {
  carryforwarddata: any = {};
  availableTargetCategories: { id: number; name: string; total: number }[] = [];
  breakdownGroups: BreakdownGroup[] = [];
  private originalGroups: BreakdownGroup[] = [];
  dirtyGroups = new Set<number>();
  selectedGroupIdx = 0;
  breakdownForm!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly CYCLE_COUNT: Record<string, number> = {
    MONTHLY: 12, QUARTERLY: 4, HALF_YEARLY: 2, YEARLY: 1
  };

  constructor(private fb: FormBuilder, private route: Router) {
    this.breakdownForm = this.fb.group({ groups: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}');
    this.buildAvailableCategories();
    const hasSaved = Array.isArray(this.carryforwarddata?.computedBreakdown) && this.carryforwarddata.computedBreakdown.length > 0;
    if (hasSaved) {
      this.restoreSavedBreakdown();
    } else {
      this.autoInitBreakdown();
    }
  }

  // ── Build available target categories from mapping ────────────────────────
  private buildAvailableCategories(): void {
    const categoryMapping: any[] = Array.isArray(this.carryforwarddata?.categoryMapping)
      ? this.carryforwarddata.categoryMapping : [];
    const categoryTotals: Record<number, number> = this.carryforwarddata?.categoryTotals ?? {};
    // aggregate total per destinationId
    const destMap = new Map<number, { name: string; total: number }>();
    for (const m of categoryMapping) {
      if (!m.destinationId) continue;
      const sourceTotal = categoryTotals[m.sourceId] ?? 0;
      if (destMap.has(m.destinationId)) {
        destMap.get(m.destinationId)!.total += sourceTotal;
      } else {
        destMap.set(m.destinationId, { name: m.destinationName ?? `Category ${m.destinationId}`, total: sourceTotal });
      }
    }
    this.availableTargetCategories = Array.from(destMap.entries()).map(([id, v]) => ({ id, ...v }));
  }

  // ── Restore saved breakdown on back navigation ────────────────────────────
  private restoreSavedBreakdown(): void {
    const saved: any[] = Array.isArray(this.carryforwarddata?.computedBreakdown)
      ? this.carryforwarddata.computedBreakdown : [];
    if (!saved.length) return;
    const year: number = (this.carryforwarddata?.year ?? new Date().getFullYear()) + 1;
    this.breakdownGroups = saved.map(g => ({
      key: g.key,
      destinationId: g.destinationId,
      targetCategoryName: g.targetCategoryName,
      frequencyType: g.frequencyType,
      previousCycleHandling: g.previousCycleHandling,
      total: g.total,
      cycles: this.generateCycles(g.total, g.frequencyType, year, g.cycles),
    }));
    this.originalGroups = JSON.parse(JSON.stringify(this.breakdownGroups));
    this.rebuildForm();
  }

  // ── Auto-init breakdown from published category data ─────────────────────
  private autoInitBreakdown(): void {
    const nextYearData: any[] = Array.isArray(this.carryforwarddata?.nextYearData) ? this.carryforwarddata.nextYearData : [];
    const year: number = (this.carryforwarddata?.year ?? new Date().getFullYear()) + 1;
    this.breakdownGroups = this.availableTargetCategories.map(cat => {
      const published = nextYearData.find((n: any) => n.id === cat.id);
      const frequencyType = published?.entitlementFrequency ?? 'YEARLY';
      const previousCycleHandling = published?.entitlementCycleHandling ?? 'FROZEN';
      const key = `${cat.id}__${frequencyType}__${previousCycleHandling}`;
      return {
        key,
        destinationId: cat.id,
        targetCategoryName: cat.name,
        frequencyType,
        previousCycleHandling,
        total: cat.total,
        cycles: this.generateCycles(cat.total, frequencyType, year),
      };
    });
    this.originalGroups = JSON.parse(JSON.stringify(this.breakdownGroups));
    this.rebuildForm();
    this.persistToStorage();
  }

  // ── Cycle generation ──────────────────────────────────────────────────────
  private generateCycles(total: number, frequencyType: string, year: number, savedCycles?: any[]): CycleRow[] {
    const count = this.CYCLE_COUNT[frequencyType] ?? 1;
    const raw = total / count;
    const perCycle = Math.floor(raw * 2) / 2;
    const distributed = Math.round(perCycle * count * 100) / 100;
    const remainder = Math.round((total - distributed) * 100) / 100;
    return Array.from({ length: count }, (_, i) => {
      const { start, end } = this.getCycleDates(frequencyType, year, i + 1);
      const defaultValue = i === count - 1 ? Math.round((perCycle + remainder) * 100) / 100 : perCycle;
      const value = savedCycles?.[i]?.value ?? defaultValue;
      return {
        cycleNo: i + 1,
        label: this.formatCycleLabel(frequencyType, i + 1, start, end),
        cycleStart: this.dateToString(start),
        cycleEnd: this.dateToString(end),
        value
      };
    });
  }

  private dateToString(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private getCycleDates(frequencyType: string, year: number, cycleNo: number): { start: Date; end: Date } {
    switch (frequencyType) {
      case 'MONTHLY': {
        const m = cycleNo - 1;
        return { start: new Date(year, m, 1), end: new Date(year, m + 1, 0) };
      }
      case 'QUARTERLY': {
        const m = (cycleNo - 1) * 3;
        return { start: new Date(year, m, 1), end: new Date(year, m + 3, 0) };
      }
      case 'HALF_YEARLY': {
        const m = (cycleNo - 1) * 6;
        return { start: new Date(year, m, 1), end: new Date(year, m + 6, 0) };
      }
      default:
        return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
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

  // ── Form ──────────────────────────────────────────────────────────────────
  private rebuildForm(): void {
    const groupsArray = this.fb.array(
      this.breakdownGroups.map(group =>
        this.fb.group({
          key: [group.key],
          cycles: this.fb.array(
            group.cycles.map(c =>
              this.fb.group({ value: this.fb.control(c.value, [Validators.min(0), this.halfDayValidator.bind(this)]) })
            ),
            [this.columnSumValidator('value', group.total)]
          )
        })
      )
    );
    this.breakdownForm = this.fb.group({ groups: groupsArray });
    this.breakdownForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.syncFromForm());
  }

  private syncFromForm(): void {
    this.groupsArray.controls.forEach((grpCtrl, grpIdx) => {
      const group = this.breakdownGroups[grpIdx];
      if (!group) return;
      const original = this.originalGroups[grpIdx];
      (grpCtrl.get('cycles') as FormArray).controls.forEach((rowCtrl, cycleIdx) => {
        const val = (rowCtrl as FormGroup).get('value')?.value;
        const newVal = val !== null && val !== '' ? Number(val) : 0;
        group.cycles[cycleIdx].value = newVal;
        // mark dirty if value differs from original
        if (original && Math.round(newVal * 100) !== Math.round((original.cycles[cycleIdx]?.value ?? 0) * 100)) {
          this.dirtyGroups.add(grpIdx);
        }
      });
    });
    this.persistToStorage();
  }

  // ── Form accessors ────────────────────────────────────────────────────────
  get groupsArray(): FormArray { return this.breakdownForm.get('groups') as FormArray; }
  getCyclesArray(grpIdx: number): FormArray { return this.groupsArray.at(grpIdx).get('cycles') as FormArray; }

  getCellError(grpIdx: number, cycleIdx: number): string | null {
    const ctrl = (this.getCyclesArray(grpIdx).at(cycleIdx) as FormGroup).get('value') as FormControl;
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    if (ctrl?.errors?.['exceeded']) return ctrl.errors['exceeded'];
    return null;
  }

  getGroupTotal(grpIdx: number): number {
    return Math.round(
      this.getCyclesArray(grpIdx).controls.reduce((sum, row) => {
        const v = Number((row as FormGroup).get('value')?.value);
        return sum + (Number.isFinite(v) && v > 0 ? v : 0);
      }, 0) * 100
    ) / 100;
  }

  isGroupValid(grpIdx: number): boolean {
    const group = this.breakdownGroups[grpIdx];
    return !!group && Math.round(this.getGroupTotal(grpIdx) * 100) === Math.round(group.total * 100);
  }

  get hasAnyValidationError(): boolean { return this.breakdownForm.invalid; }

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetGroup(grpIdx: number): void {
    const original = this.originalGroups[grpIdx];
    if (!original) return;
    const cyclesArray = this.getCyclesArray(grpIdx);
    original.cycles.forEach((cycle, i) => {
      cyclesArray.at(i).get('value')?.setValue(cycle.value, { emitEvent: false });
      this.breakdownGroups[grpIdx].cycles[i].value = cycle.value;
    });
    cyclesArray.updateValueAndValidity();
    this.dirtyGroups.delete(grpIdx);
    this.persistToStorage();
  }

  resetAll(): void { this.breakdownGroups.forEach((_, i) => this.resetGroup(i)); }

  get isAnyGroupDirty(): boolean { return this.dirtyGroups.size > 0; }

  formatLabel(value: string): string {
    if (!value) return '';
    return value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  // ── Validators ────────────────────────────────────────────────────────────
  private columnSumValidator(controlKey: string, allowedTotal: number) {
    return (cyclesArray: AbstractControl): ValidationErrors | null => {
      const fa = cyclesArray as FormArray;
      const values = fa.controls.map(row => {
        const v = Number((row as FormGroup).get(controlKey)?.value);
        return Number.isFinite(v) && v > 0 ? v : 0;
      });
      const total = Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
      const allowed = Math.round(allowedTotal * 100) / 100;

      if (total > allowed) {
        fa.controls.forEach((row, i) => {
          const ctrl = (row as FormGroup).get(controlKey) as FormControl;
          if (!ctrl) return;
          const otherSum = values.reduce((a, b, idx) => idx !== i ? a + b : a, 0);
          const remaining = Math.floor(Math.max(allowed - otherSum, 0) * 2) / 2;
          if (values[i] > allowed - otherSum) {
            ctrl.setErrors({ exceeded: `Total cannot exceed ${allowed}. Remaining: ${remaining}.` });
          } else {
            if (!ctrl.errors?.['halfDay']) ctrl.setErrors(null);
          }
        });
        return { columnExceeded: true };
      }
      fa.controls.forEach(row => {
        const ctrl = (row as FormGroup).get(controlKey) as FormControl;
        if (ctrl?.errors?.['exceeded']) ctrl.setErrors(null);
      });
      if (total < allowed) return { columnShort: `Total must equal ${allowed}. Current: ${total}.` };
      return null;
    };
  }

  private halfDayValidator(control: AbstractControl): ValidationErrors | null {
    const v = Number(control.value);
    if (control.value === null || control.value === '' || !Number.isFinite(v)) return null;
    if (v < 0) return { halfDay: 'Value cannot be negative.' };
    if (Math.round(v * 2) / 2 !== v) return { halfDay: 'Only multiples of 0.5 allowed (0, 0.5, 1, 1.5...)' };
    return null;
  }

  // ── Storage ───────────────────────────────────────────────────────────────
  private persistToStorage(): void {
    const raw = localStorage.getItem('loadEntitlement');
    const stored = raw ? JSON.parse(raw) : {};
    stored.computedBreakdown = this.breakdownGroups;
    localStorage.setItem('loadEntitlement', JSON.stringify(stored));
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement')!);
  }

  // ── Template helpers ──────────────────────────────────────────────────────
  get selectedFieldSummary(): { label: string; value: string }[] {
    const d = this.carryforwarddata;
    const items: { label: string; value: string }[] = [];
    if (d?.year) items.push({ label: 'Source Year', value: d.year });
    if (d?.year) items.push({ label: 'Destination Year', value: d.year + 1 });
    if (d?.location?.jobLocationName) items.push({ label: 'Location', value: d.location.jobLocationName });
    if (d?.subLocation?.jobSubLocationName) items.push({ label: 'Sub Location', value: d.subLocation.jobSubLocationName });
    if (d?.shift?.shiftName) items.push({ label: 'Shift', value: d.shift.shiftName });
    return items;
  }

  get canProceed(): boolean {
    return this.availableTargetCategories.length > 0
      && this.breakdownGroups.length === this.availableTargetCategories.length
      && !this.hasAnyValidationError;
  }

  back(): void {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-map-categoery']);
  }

  next(): void {
    this.persistToStorage();
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-preview']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}