import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICarryForward, ILeaveCategory } from '../../../flexible-leave-allocation/leave-allocation.model';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { HttpService } from '../../../../../services/http.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../../../services/open-modal.service';
@Component({
  selector: 'app-load-entilements-map-categoery',
  imports: [CommonModule, Select, FormsModule],
  templateUrl: './load-entilements-map-categoery.component.html',
  styleUrl: './load-entilements-map-categoery.component.scss'
})

export class LoadEntilementsMapCategoeryComponent implements OnInit, OnDestroy {
  carryforwarddata: any = {}
  empinfo: any = {};
  loading: boolean = false
  destroy$: Subject<boolean> = new Subject<boolean>();

  shiftwisedata: any[] = [];
  nextYearData: ILeaveCategory[] = [];
  nextYear!: number;
  currentYear!: number;
  leaveTypes: string[] = [];
  employeesList: any[] = [];

  constructor(public formValidations: FormValidationsService, private route: Router,
    private http: HttpService, public formValidation: FormValidationsService, private conformationPopup: OpenModalService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.currentYear = new Date().getFullYear();
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '{}')
    this.getCarryForwardData(this.carryforwarddata)
    this.getdataforcarryforwardforplaylod(this.carryforwarddata)
    this.getshiftdatawise(this.carryforwarddata)
  }

  getCarryForwardData(carryforwarddata: ICarryForward) {
    this.loading = true;
    this.nextYear = this.currentYear + 1;
    this.http
      .getData(
        `OrgLeavesCategories?locationId=${carryforwarddata.location.id}&subLocationId=${carryforwarddata.subLocation.id}&year=${this.nextYear}&status=Published&shiftId=${carryforwarddata.shift.id}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          this.nextYearData = res.filter(
            (x: { encashAllowedType: any; carryForwardAllowed: any; }) => x.encashAllowedType || x.carryForwardAllowed
          );
        },
        error: () => {
          this.loading = false;
        }
      });
  }


 
  getshiftdatawise(carryforwarddata: ICarryForward) {
    this.http.getData(`LeaveCarryForward/categories-by-shift?year=${carryforwarddata.year}&locationIds=${carryforwarddata.location.id}&subLocationIds=${carryforwarddata.subLocation.id}&shiftIds=${carryforwarddata.shift.id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          console.log(res.data);
          this.shiftwisedata = res.data;


        },
        error: () => {
          this.loading = false;
        }
      });
  }

  getdataforcarryforwardforplaylod(carryforwarddata: ICarryForward) {
    this.http.getData(`Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata.location.id}
    &subLocationIds=${carryforwarddata.subLocation.id}
    &shiftIds=${carryforwarddata.shift.id}
    &year=${carryforwarddata.year}&excludeJobProcessedEmployees=true&employeeTypes=Permanent,Contract,Trainee`
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
    const allCategories = this.shiftwisedata.flatMap(shift => shift.categories);
    const categoryMap = new Map(allCategories.map((category: { id: any; selectedDestinationId: any; }) => [category.id, category.selectedDestinationId]));
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
          entitlementsData: emp.leaveEntries.map((x:
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
        this.conformationPopup.openErrorModal(err.error.message || "Carry Forward Entilement Failed");

      }
    });
  }

  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-preview'])
  }

  navigationtofinal() {
    this.route.navigate(['/settings/timeoff-configurations/leave-entitlements/load-entitlement-execution'])
  }



  hexToRgba(hex: string, alpha: number = 1) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  isAllDropdownsSelected(): boolean {
    const allCategories = this.shiftwisedata.flatMap(shift => shift.categories);
    return allCategories.length > 0 && allCategories.every(category => category.selectedDestinationId);
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}