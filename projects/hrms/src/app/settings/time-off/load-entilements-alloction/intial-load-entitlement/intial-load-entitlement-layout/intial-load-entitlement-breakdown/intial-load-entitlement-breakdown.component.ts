import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { NoDataFoundComponent } from '../../../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-intial-load-entitlement-breakdown',
  imports: [CommonModule, ReactiveFormsModule, AccordionModule, NoDataFoundComponent],
  templateUrl: './intial-load-entitlement-breakdown.component.html',
  styleUrl: './intial-load-entitlement-breakdown.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class IntialLoadEntitlementBreakdownComponent implements OnInit, OnDestroy {
  carryforwarddata: any = {};
  leaveEntitlementBreakdown: any = null;
  /** Deep-frozen copy of the original API response — never mutated by user edits */
  private originalBreakdownData: any[] = [];
  categoryTables: Record<number, any> = {};
  categoryTablesOrdered: any[] = [];
  breakdownForm!: FormGroup;
  breakdownLoader = false;
  apiLoaded = false;
  isModified = false;
  selectedCatIdx = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private http: HttpService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.carryforwarddata = JSON.parse(localStorage.getItem('intialloadEntitlement') ?? '{}');
    this.loadBreakdown();
  }

  private loadBreakdown(): void {
    const { location, subLocation, shift, year } = this.carryforwarddata;
    const categoryIds: number[] = Array.isArray(this.carryforwarddata?.category_ids)
      ? this.carryforwarddata.category_ids.map((x: any) => Number(x)).filter((x: any) => Number.isFinite(x))
      : [];
    if (!shift?.id || !location?.id || !subLocation?.id || !year) return;

    // restore from cache only if scope matches
    const originalStored: any[] = Array.isArray(this.carryforwarddata?.originalBreakdownData)
      ? this.carryforwarddata.originalBreakdownData : [];
    if (originalStored.length > 0) {
      const editedBreakdown: any[] = Array.isArray(this.carryforwarddata?.breakdownData)
        ? this.carryforwarddata.breakdownData : [];
      this.originalBreakdownData = JSON.parse(JSON.stringify(originalStored));
      const displayData = editedBreakdown.length > 0 ? editedBreakdown : originalStored;
      this.leaveEntitlementBreakdown = { categories: displayData };
      this.categoryTables = this.buildCategoryTables(this.leaveEntitlementBreakdown);
      this.apiLoaded = true;
      return;
    }

    // no cache — call API fresh
    const payload: any = {
      year,
      location_id: location.id,
      sub_location_id: subLocation.id,
      shift_id: shift.id
    };
    if (categoryIds.length) payload.category_ids = categoryIds;
    this.breakdownLoader = true;
    this.http.postdata('OrgLeavesCategories/leave-entitlement-breakdown', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.leaveEntitlementBreakdown = res;
        this.originalBreakdownData = JSON.parse(JSON.stringify(Array.isArray(res?.categories) ? res.categories : []));
        this.breakdownLoader = false;
        this.apiLoaded = true;
        this.categoryTables = this.buildCategoryTables(res);
        this.persistToStorage(this.originalBreakdownData, this.originalBreakdownData);
        this.cdr.detectChanges();
      },
      error: () => {
        this.breakdownLoader = false;
        this.categoryTablesOrdered = [];
        this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
      }
    });
  }

  private buildCategoryTables(response: any): Record<number, any> {
    const frequencyType = response?.frequency_type ?? this.carryforwarddata?.frequencyType;
    const cycleHandling = response?.cycle_handling ?? this.carryforwarddata?.cycleHandling;
    const categories = Array.isArray(response?.categories) ? response.categories : [];
    const tables: Record<number, any> = {};

    for (const category of categories) {
      const categoryId = category?.category_id;
      if (!categoryId) continue;
      const catFrequencyType = category?.frequency_type ?? frequencyType;
      const catCycleHandling = category?.cycle_handling ?? this.carryforwarddata?.cycleHandling;
      const groups = Array.isArray(category?.groups) ? category.groups : [];

      // Build one column per group
      const columns = groups.map((group: any, index: number) => {
        const gradeNames = Array.isArray(group?.grades)
          ? Array.from(new Set<string>(group.grades.map((g: any) => g?.grade_name).filter(Boolean)))
          : [];
        const allowedDays = typeof group?.allowed_days === 'number' ? group.allowed_days
          : typeof group?.grades?.[0]?.allowed_days === 'number' ? group.grades[0].allowed_days : 0;
        return { columnId: index, gradeLabel: gradeNames.length > 0 ? gradeNames.join(', ') : '-', allowedDays };
      });

      // Collect all unique cycle numbers and their metadata from group[0]
      const cycleMetaByNo = new Map<number, any>();
      const cycleEntitlementsByNo = new Map<number, number[]>();

      groups.forEach((group: any, colIdx: number) => {
        const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
        for (const c of cycles) {
          const cycleNo = c?.cycle_no;
          if (cycleNo == null) continue;
          const start = c?.cycle_start ? new Date(c.cycle_start) : null;
          const end = c?.cycle_end ? new Date(c.cycle_end) : null;
          if (!cycleMetaByNo.has(cycleNo)) {
            cycleMetaByNo.set(cycleNo, { cycleNo, start, end, label: this.formatCycleLabel(catFrequencyType, cycleNo, start, end) });
          }
          if (!cycleEntitlementsByNo.has(cycleNo)) {
            cycleEntitlementsByNo.set(cycleNo, new Array(columns.length).fill(null));
          }
          cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
        }
      });

      const cycleRows = Array.from(cycleMetaByNo.values())
        .sort((a, b) => a.cycleNo - b.cycleNo)
        .map(cycle => ({
          ...cycle,
          entitlements: cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(columns.length).fill(null)
        }));

      tables[categoryId] = { categoryId, categoryName: category?.category_name ?? '-', frequencyType: catFrequencyType, cycleHandling: catCycleHandling, columns, cycles: cycleRows };
    }

    // use all categories returned by API — no filtering by categoryIds
    this.categoryTablesOrdered = Object.values(tables);
    console.log('[buildCategoryTables] categoryTablesOrdered:', this.categoryTablesOrdered.length, this.categoryTablesOrdered.map((t: any) => t.categoryName));
    this.buildBreakdownForm(this.categoryTablesOrdered);
    this.categoryTablesOrdered = [...this.categoryTablesOrdered];
    return tables;
  }

  private formatCycleLabel(frequencyType: string, cycleNo: number, start: Date | null, end: Date | null): string {
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    if (!start || !end) {
      if (frequencyType === 'MONTHLY') return `C${cycleNo}`;
      if (frequencyType === 'QUARTERLY') return `C${cycleNo}`;
      if (frequencyType === 'HALF_YEARLY') return `C${cycleNo}`;
      return cycleNo === 1 ? 'Year' : `Cycle ${cycleNo}`;
    }
    const range = `${formatDate(start)} - ${formatDate(end)}`;
    if (frequencyType === 'MONTHLY') return `C${cycleNo} (${range})`;
    if (frequencyType === 'QUARTERLY') return `C${cycleNo} (${range})`;
    if (frequencyType === 'HALF_YEARLY') return `C${cycleNo} (${range})`;
    if (frequencyType === 'YEARLY') return `Year (${range})`;
    return `Cycle ${cycleNo} (${range})`;
  }

  // ── Form accessors ────────────────────────────────────────────────────────

  getCellControlSafe(catIndex: number, cycleIndex: number, colKey: string): FormControl | null {
    try {
      const arr = this.breakdownForm.get('categories') as FormArray;
      if (!arr || arr.length <= catIndex) {
        console.log(`[getCellControlSafe] categories array not ready: arr.length=${arr?.length}, catIndex=${catIndex}`);
        return null;
      }
      const cycles = arr.at(catIndex).get('cycles') as FormArray;
      if (!cycles || cycles.length <= cycleIndex) {
        console.log(`[getCellControlSafe] cycles not ready: cycles.length=${cycles?.length}, cycleIndex=${cycleIndex}`);
        return null;
      }
      const ctrl = (cycles.at(cycleIndex) as FormGroup).get(colKey) as FormControl;
      if (!ctrl) console.log(`[getCellControlSafe] control not found: catIndex=${catIndex}, cycleIndex=${cycleIndex}, colKey=${colKey}`);
      return ctrl ?? null;
    } catch (e) {
      console.log('[getCellControlSafe] error:', e);
      return null;
    }
  }

  get selectedTable(): any {
    return this.categoryTablesOrdered?.[this.selectedCatIdx] ?? null;
  }

  get categoriesArray(): FormArray { return this.breakdownForm.get('categories') as FormArray; }
  getCategoryGroup(catIndex: number): FormGroup { return this.categoriesArray.at(catIndex) as FormGroup; }
  getCyclesArray(catIndex: number): FormArray { return this.categoriesArray.at(catIndex).get('cycles') as FormArray; }
  getCycleRow(catIndex: number, cycleIndex: number): FormGroup { return this.getCyclesArray(catIndex).at(cycleIndex) as FormGroup; }
  getCellControl(catIndex: number, cycleIndex: number, colKey: string): FormControl {
    try {
      return this.getCycleRow(catIndex, cycleIndex).get(colKey) as FormControl;
    } catch {
      return this.fb.control(null);
    }
  }

  getCellError(catIndex: number, cycleIndex: number, colKey: string): string | null {
    const ctrl = this.getCellControl(catIndex, cycleIndex, colKey);
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    if (ctrl?.errors?.['exceeded']) return ctrl.errors['exceeded'];
    return null;
  }

  getColumnTotal(catIndex: number, colIdx: number): number {
    const cyclesArray = this.getCyclesArray(catIndex);
    return cyclesArray.controls.reduce((sum, row) => {
      const v = Number((row as FormGroup).get(`col_${colIdx}`)?.value);
      return sum + (Number.isFinite(v) && v > 0 ? v : 0);
    }, 0);
  }

  isColumnValid(catIndex: number, colIdx: number): boolean {
    const table = this.categoryTablesOrdered[catIndex];
    if (!table) return true;
    return this.getColumnTotal(catIndex, colIdx) === table.columns[colIdx].allowedDays;
  }

  get hasAnyValidationError(): boolean { return this.breakdownForm.invalid; }

  // ── Reset ─────────────────────────────────────────────────────────────────

  /** Reset a single category accordion back to original API values */
  resetCategory(catIdx: number): void {
    const table = this.categoryTablesOrdered[catIdx];
    if (!table) return;

    const originalCat = this.originalBreakdownData.find(
      (c: any) => Number(c?.category_id ?? c?.categoryId ?? c?.id) === table.categoryId
    );
    if (!originalCat) return;

    // Rebuild entitlements from original
    const groups = Array.isArray(originalCat?.groups) ? originalCat.groups : [];
    const cycleEntitlementsByNo = new Map<number, number[]>();
    groups.forEach((group: any, colIdx: number) => {
      const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
      for (const c of cycles) {
        const cycleNo = c?.cycle_no;
        if (!cycleNo) continue;
        if (!cycleEntitlementsByNo.has(cycleNo)) cycleEntitlementsByNo.set(cycleNo, new Array(table.columns.length).fill(null));
        cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
      }
    });

    const cyclesArray = this.getCyclesArray(catIdx);
    table.cycles.forEach((cycle: any, cycleIdx: number) => {
      const entitlements = cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(table.columns.length).fill(null);
      const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
      table.columns.forEach((_: any, colIdx: number) => {
        rowGroup.get(`col_${colIdx}`)?.setValue(entitlements[colIdx], { emitEvent: false });
        cycle.entitlements[colIdx] = entitlements[colIdx];
      });
    });

    // Trigger validation update without re-triggering valueChanges sync loop
    cyclesArray.updateValueAndValidity();
    this.persistCurrentEditsToStorage();
    // check if all categories are back to original
    this.isModified = this.checkIfModified();
  }

  private checkIfModified(): boolean {
    return this.categoryTablesOrdered.some((table, catIdx) => {
      const originalCat = this.originalBreakdownData.find(
        (c: any) => Number(c?.category_id ?? c?.categoryId ?? c?.id) === table.categoryId
      );
      if (!originalCat) return false;
      const groups = Array.isArray(originalCat?.groups) ? originalCat.groups : [];
      const cycleEntitlementsByNo = new Map<number, number[]>();
      groups.forEach((group: any, colIdx: number) => {
        const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
        for (const c of cycles) {
          const cycleNo = c?.cycle_no;
          if (!cycleNo) continue;
          if (!cycleEntitlementsByNo.has(cycleNo)) cycleEntitlementsByNo.set(cycleNo, new Array(table.columns.length).fill(null));
          cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
        }
      });
      const cyclesArray = this.getCyclesArray(catIdx);
      return table.cycles.some((cycle: any, cycleIdx: number) => {
        const origEntitlements = cycleEntitlementsByNo.get(cycle.cycleNo) ?? [];
        const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
        return table.columns.some((_: any, colIdx: number) => {
          const currentVal = rowGroup.get(`col_${colIdx}`)?.value;
          return Number(currentVal) !== Number(origEntitlements[colIdx]);
        });
      });
    });
  }

  /** Reset all categories back to original API values */
  resetAll(): void {
    this.categoryTablesOrdered.forEach((_, idx) => this.resetCategory(idx));
  }

  // ── Validators ────────────────────────────────────────────────────────────

  private columnSumValidator(colKey: string, allowedDays: number) {
    return (cyclesArray: AbstractControl): ValidationErrors | null => {
      const fa = cyclesArray as FormArray;
      const values = fa.controls.map(row => {
        const v = Number((row as FormGroup).get(colKey)?.value);
        return Number.isFinite(v) && v > 0 ? v : 0;
      });
      const total = values.reduce((a, b) => a + b, 0);

      if (total > allowedDays) {
        // Per-cell exceeded errors removed — only column-level total badge shows the state
        // fa.controls.forEach((row, i) => { ... });
        return { columnExceeded: true };
      }

      // No per-cell exceeded errors to clear

      if (total < allowedDays) {
        return { columnShort: `Total must equal ${allowedDays}. Current: ${total}.` };
      }

      return null;
    };
  }

  private halfDayValidator(control: AbstractControl): ValidationErrors | null {
    const v = Number(control.value);
    if (control.value === null || control.value === '' || !Number.isFinite(v)) return null;
    if (v < 0) return { halfDay: 'Value cannot be negative.' };
    const rounded = Math.round(v * 2) / 2;
    if (rounded !== v) return { halfDay: 'Invalid value. Allowed: 0, 0.5, 1, 1.5... (nearest 0.5)' };
    return null;
  }

  // ── Form build & sync ─────────────────────────────────────────────────────

  private buildBreakdownForm(orderedTables: any[]): void {
    console.log('[buildBreakdownForm] building form for', orderedTables.length, 'tables');
    const categoriesArray = this.fb.array(
      orderedTables.map(table => {
        const colKeys = (table.columns as any[]).map((_: any, i: number) => `col_${i}`);
        const validators = colKeys.map((key: string, i: number) =>
          this.columnSumValidator(key, table.columns[i].allowedDays)
        );
        const cyclesArray = this.fb.array(
          (table.cycles as any[]).map(cycle => {
            const controls: Record<string, FormControl> = {};
            colKeys.forEach((key: string, i: number) => {
              controls[key] = this.fb.control(
                cycle.entitlements?.[i] ?? null,
                [Validators.min(0), this.halfDayValidator.bind(this)]
              );
            });
            return this.fb.group(controls);
          }),
          validators
        );
        return this.fb.group({ categoryId: [table.categoryId], cycles: cyclesArray });
      })
    );
    this.breakdownForm = this.fb.group({ categories: categoriesArray });
    console.log('[buildBreakdownForm] form built, categoriesArray.length:', (this.breakdownForm.get('categories') as FormArray).length);
    this.breakdownForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.syncBreakdownFromForm(orderedTables));
  }

  private syncBreakdownFromForm(orderedTables: any[]): void {
    this.categoriesArray.controls.forEach((catCtrl, catIdx) => {
      const table = orderedTables[catIdx];
      if (!table) return;
      const cyclesArray = catCtrl.get('cycles') as FormArray;
      cyclesArray.controls.forEach((rowCtrl, cycleIdx) => {
        const cycle = table.cycles[cycleIdx];
        if (!cycle) return;
        table.columns.forEach((_: any, colIdx: number) => {
          const val = (rowCtrl as FormGroup).get(`col_${colIdx}`)?.value;
          cycle.entitlements[colIdx] = val !== null && val !== '' ? Number(val) : null;
        });
      });
    });
    this.syncCategoryTablesToBreakdown(orderedTables);
    this.isModified = this.checkIfModified();
    this.persistCurrentEditsToStorage();
  }

  private syncCategoryTablesToBreakdown(orderedTables: any[]): void {
    const categories = Array.isArray(this.leaveEntitlementBreakdown?.categories) ? this.leaveEntitlementBreakdown.categories : [];
    for (const table of orderedTables) {
      const cat = categories.find((c: any) => c?.category_id === table.categoryId);
      if (!cat) continue;
      const groups = Array.isArray(cat?.groups) ? cat.groups : [];
      groups.forEach((group: any, colIdx: number) => {
        const groupCycles = Array.isArray(group?.cycles) ? group.cycles : [];
        for (const gc of groupCycles) {
          const cycleRow = table.cycles.find((c: any) => c.cycleNo === gc?.cycle_no);
          if (cycleRow) gc.entitlement = cycleRow.entitlements?.[colIdx] ?? null;
        }
      });
    }
  }

  /** Persists only user edits (breakdownData). Never touches originalBreakdownData. */
  private persistCurrentEditsToStorage(): void {
    const raw = localStorage.getItem('intialloadEntitlement');
    const stored = raw ? JSON.parse(raw) : {};
    const updated = {
      ...stored,
      breakdownData: Array.isArray(this.leaveEntitlementBreakdown?.categories)
        ? this.leaveEntitlementBreakdown.categories
        : (Array.isArray(stored?.breakdownData) ? stored.breakdownData : [])
    };
    localStorage.setItem('intialloadEntitlement', JSON.stringify(updated));
    this.carryforwarddata = updated;
  }

  /** Persists both original and edited breakdown — called only on fresh API fetch */
  private persistToStorage(originalCategories: any[], editedCategories: any[]): void {
    const raw = localStorage.getItem('intialloadEntitlement');
    const stored = raw ? JSON.parse(raw) : {};
    const updated = {
      ...stored,
      originalBreakdownData: originalCategories,
      breakdownData: editedCategories
    };
    localStorage.setItem('intialloadEntitlement', JSON.stringify(updated));
    this.carryforwarddata = updated;
  }

  // ── Template helpers ──────────────────────────────────────────────────────

  get selectedFieldSummary(): { label: string; value: string }[] {
    const d = this.carryforwarddata;
    const items: { label: string; value: string }[] = [];
    if (d?.year) items.push({ label: 'Year', value: d.year });
    if (d?.location?.jobLocationName) items.push({ label: 'Location', value: d.location.jobLocationName });
    if (d?.subLocation?.jobSubLocationName) items.push({ label: 'Sub Location', value: d.subLocation.jobSubLocationName });
    if (d?.shift?.shiftName) items.push({ label: 'Shift', value: d.shift.shiftName });
    if (d?.frequencyType) items.push({ label: 'Frequency', value: this.formatLabel(d.frequencyType) });
    if (d?.cycleHandling) items.push({ label: 'Cycle Handling', value: this.formatLabel(d.cycleHandling) });
    return items;
  }


 formatLabel(value: string): string {
    return value
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  onEntitlementKeydown(event: KeyboardEvent): void {
    const blocked = ['-', '+', 'e', 'E'];
    if (blocked.includes(event.key)) {
      event.preventDefault();
    }
  }

  onEntitlementBlur(catIdx: number, cycleIdx: number, colIdx: number): void {
    const ctrl = this.getCellControl(catIdx, cycleIdx, `col_${colIdx}`);
    const table = this.categoryTablesOrdered[catIdx];
    const allowedDays = table?.columns?.[colIdx]?.allowedDays ?? null;
    let val = Number(ctrl?.value);
    if (ctrl?.value === null || ctrl?.value === '' || isNaN(val) || val < 0) {
      ctrl?.setValue(0);
    } else if (allowedDays !== null && val > allowedDays) {
      ctrl?.setValue(allowedDays);
    }
  }

  stepUp(catIdx: number, cycleIdx: number, colIdx: number): void {
    const ctrl = this.getCellControl(catIdx, cycleIdx, `col_${colIdx}`);
    const current = Number(ctrl?.value) || 0;
    ctrl?.setValue(Math.round((current + 0.5) * 10) / 10);
  }

  stepDown(catIdx: number, cycleIdx: number, colIdx: number): void {
    const ctrl = this.getCellControl(catIdx, cycleIdx, `col_${colIdx}`);
    const current = Number(ctrl?.value) || 0;
    const next = Math.round((current - 0.5) * 10) / 10;
    ctrl?.setValue(next < 0 ? 0 : next);
  }

  back(): void {
    if (this.carryforwarddata?.flow === 'jobview' && this.carryforwarddata?.jobId) {
      this.route.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: this.carryforwarddata.jobId } });
      return;
    }
    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-create']);
  }

  next(): void {
    this.persistCurrentEditsToStorage();
    this.route.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-preview']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
