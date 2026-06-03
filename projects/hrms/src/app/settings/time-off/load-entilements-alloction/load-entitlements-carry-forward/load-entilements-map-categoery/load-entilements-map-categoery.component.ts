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
    stored.categoryMapping = allCategories.map((c: any) => ({
      sourceId: c.id,
      sourceName: c.name,
      sourceCode: c.categoryCode,
      destinationId: c.selectedDestinationId,
      destinationName: this.nextYearData.find((n: any) => n.id === c.selectedDestinationId)?.name ?? '',
    }));
    // aggregate total actualCarryForward per sourceId
    const totalsMap: Record<number, number> = {};
    this.employeesList.forEach((emp: any) => {
      (emp.leaveEntries ?? []).forEach((entry: any) => {
        const sid = entry.leaveCategoryId;
        totalsMap[sid] = (totalsMap[sid] ?? 0) + (entry.actualCarryForward ?? 0);
      });
    });
    stored.categoryTotals = totalsMap;
    // clear any previously configured breakdown when re-submitting map
    stored.computedBreakdown = [];
    localStorage.setItem('loadEntitlement', JSON.stringify(stored));
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-breakdown']);
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
