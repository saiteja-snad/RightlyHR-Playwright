import { Component } from '@angular/core';
import { ICarryForward, ILeaveCategory } from '../../../flexible-leave-allocation/leave-allocation.model';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-load-entilements-map-categoery',
  imports: [CommonModule, Select, FormsModule],
  templateUrl: './load-entilements-map-categoery.component.html',
  styleUrl: './load-entilements-map-categoery.component.scss'
})

export class LoadEntilementsMapCategoeryComponent {
  carryforwarddata: any = {}
  empinfo: any = {};
  loading: boolean = false
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentYearData: ILeaveCategory[] = [];
  nextYearData: ILeaveCategory[] = [];
  currentYear = 0;
  nextYear = 0;
  leaveTypes: string[] = [];
  employeesList: any[] = [];

  constructor(public formValidations: FormValidationsService, private route: Router,
    private http: HttpService, public formValidation: FormValidationsService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}')
    this.getCarryForwardData(this.carryforwarddata)
    this.getdataforcarryforwardforplaylod(this.carryforwarddata)
  }

  getCarryForwardData(carryforwarddata: ICarryForward) {
    this.loading = true;
    this.currentYear = carryforwarddata.year;    // example 2025
    this.nextYear = this.currentYear + 1;
    const req1 = this.getDataByYear(carryforwarddata, this.currentYear);
    const req2 = this.getDataByYear(carryforwarddata, this.nextYear);
    forkJoin([req1, req2]).pipe(takeUntil(this.destroy$)).subscribe({
      next: ([current, next]) => {
        this.loading = false;
        this.currentYearData = (current as ILeaveCategory[]).filter(x => x.encashAllowedType || x.carryForwardAllowed)
        this.nextYearData = (next as ILeaveCategory[]).filter(x => x.encashAllowedType || x.carryForwardAllowed);
      },
      error: _ => (this.loading = false)
    });
  }

  private getDataByYear(carryforwarddata: ICarryForward, year: number) {
    return this.http.getData(`OrgLeavesCategories?locationId=${carryforwarddata.location.id}&subLocationId=${carryforwarddata.subLocation.id}&year=${year}&status=Published&shiftId=${carryforwarddata.shift.id}`);
  }

  getdataforcarryforwardforplaylod(carryforwarddata: ICarryForward) {
    this.http.getData(`Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata.location.id}
    &subLocationIds=${carryforwarddata.subLocation.id}
    &shiftIds=${carryforwarddata.shift.id}
    &year=${carryforwarddata.year}&excludeJobProcessedEmployees=true`
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const data = res.data;
          this.formatCarryList(data);
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  formatCarryList(data: any[]) {
    this.leaveTypes = [...new Set(data.map(x => x.leaveType))];
    const grouped: any = {};
    data.forEach(item => {
      if (!grouped[item.employeeId]) {
        grouped[item.employeeId] = {
          employee: item.employeeName,
          employeeId: item.employeeId,
          gradeId: item.jobGradeId,
          leaveEntries: []
        };
      }
      grouped[item.employeeId][item.leaveType] = item.maxCarryForward;
      grouped[item.employeeId].leaveEntries.push({
        leaveType: item.leaveType,
        entitled: item.entitled,
        availed: item.availed,
        balance: item.balance,
        maxCarryForward: item.maxCarryForward,
        actualCarryForward: item.actualCarryForward,
        maxEncashment: item.maxEncashment,
        leaveEncashed: item.leaveEncashed,
        leaveLapsed: item.leaveLapsed,
        leaveCategoryId: item.leaveCategoryId,
        selectedDestinationId: item.leaveCategoryId
      });
    });
    this.employeesList = Object.values(grouped);
  }

  buildCarryForwardPayload() {
    const categoryMap = new Map(this.currentYearData.map(x => [x.id, x.selectedDestinationId]));
    const payload = {
      jobType: "CarryForward",
      year: this.nextYear,
      locationId: this.carryforwarddata.location.id,
      subLocationId: this.carryforwarddata.subLocation.id,
      shiftId: this.carryforwarddata.shift.id,
      notes: '',
      requestPayload: {
        employees: this.employeesList.map(emp => ({
          employeeId: emp.employeeId,
          gradeId: emp.gradeId ?? 0,
          entitlementsData: emp.leaveEntries.filter((x: { actualCarryForward: number; }) => x.actualCarryForward > 0).map((x:
            { leaveCategoryId: any; actualCarryForward: any; }) => ({
              sourceCategoryId: x.leaveCategoryId,
              destinationCategoryId: categoryMap.get(x.leaveCategoryId),
              sourceYear: this.carryforwarddata.year,
              destinationYear: this.nextYear,
              noOfDays: x.actualCarryForward
            })),

        }))
      },
      initiatedBy: this.empinfo.employeeId
    };
    return payload;
  }

  submit() {
    const body = this.buildCarryForwardPayload();
    this.http.postdata('LeaveEntitlementJobs/create-carry-forward', body).subscribe({
      next: (res: any) => {
        localStorage.setItem('carryForwardJobId', res?.data?.jobId.toString());
        this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-execution'])
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-preview'])
  }

  navigationtofinal() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-execution'])
  }

  getAvailableOptions(currentItem: any) {
    const selectedIds = this.currentYearData.filter(x => x.selectedDestinationId && x.id !== currentItem.id).map(x => x.selectedDestinationId);
    return this.nextYearData.filter(x => !selectedIds.includes(x.id));
  }

  hexToRgba(hex: string, alpha: number = 1) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  isAllDropdownsSelected(): boolean {
    return this.currentYearData.length > 0 && this.currentYearData.every(item => item.selectedDestinationId);
  }
}