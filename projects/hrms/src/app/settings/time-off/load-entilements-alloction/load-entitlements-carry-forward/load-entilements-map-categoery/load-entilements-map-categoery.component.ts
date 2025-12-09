import { Component } from '@angular/core';
import { ICarryForward, ILeaveCategory } from '../../../flexible-leave-allocation/leave-allocation.model';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../services/http.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { OpenModalService } from '../../../../../services/open-modal.service';
import { FormBuilder, FormsModule } from '@angular/forms';
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

  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal,
    private route: Router, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '')
    console.log(this.carryforwarddata)

    this.getCarryForwardData(this.carryforwarddata)
    this.getdataforcarryforwardforplaylod(this.carryforwarddata)
  }


  getCarryForwardData(carryforwarddata: ICarryForward) {
    this.loading = true;
    this.currentYear = carryforwarddata.year;    // example 2025
    this.nextYear = this.currentYear + 1;
    const req1 = this.getDataByYear(carryforwarddata,
      this.currentYear);
    const req2 = this.getDataByYear(carryforwarddata, this.nextYear);

    forkJoin([req1, req2])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([current, next]) => {
          this.loading = false;
          this.currentYearData = (current as ILeaveCategory[])
            .filter(x => x.encashAllowedType || x.carryForwardAllowed)
           
          this.nextYearData = (next as ILeaveCategory[])
            .filter(x => x.encashAllowedType || x.carryForwardAllowed);
        },
        error: _ => (this.loading = false)
      });
  }


  private getDataByYear(carryforwarddata: ICarryForward, year: number) {
    return this.http.getData(
      `OrgLeavesCategories?locationId=${carryforwarddata.location.id}&subLocationId=${carryforwarddata.subLocation.id}&year=${year}&status=Published&shiftId=${carryforwarddata.shift.id}`
    );
  }


  getdataforcarryforwardforplaylod(carryforwarddata: ICarryForward) {
    this.http.getData(
      `Reports/LeaveCarryForwardReport?locationIds=${carryforwarddata.location.id}
    &subLocationIds=${carryforwarddata.subLocation.id}
    &shiftIds=${carryforwarddata.shift.id}
    &year=${carryforwarddata.year}`
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
          leaveEntries: []   // 👈 store whole list people
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
    console.log(this.employeesList);

  }

  buildCarryForwardPayload() {
    const categoryMap = new Map(this.currentYearData.map(x => [x.id, x.selectedDestinationId]));

    const payload = {
      jobType: "CarryForward",
      year: this.carryforwarddata.year,
      locationId: this.carryforwarddata.location.id,
      subLocationId: this.carryforwarddata.subLocation.id,
      shiftId: this.carryforwarddata.shift.id,
      notes: '',

      requestPayload: {
        employees: this.employeesList.map(emp => ({
          employeeId: emp.employeeId,
          gradeId: emp.gradeId ?? 0,

          entitlementsData: emp.leaveEntries
            .filter((x: { actualCarryForward: number; }) => x.actualCarryForward > 0)
            .map((x: { leaveCategoryId: any; actualCarryForward: any; }) => ({
              sourceCategoryId: x.leaveCategoryId,
              destinationCategoryId: categoryMap.get(x.leaveCategoryId) || x.leaveCategoryId,
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

    this.http.postdata('LeaveEntitlementJobs/create-carry-forward', body)
      .subscribe({
        next: (res) => {
          console.log('success', res);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-preview'])
  }

  navigationtofinal() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-execution'])
  }

  getAvailableOptions(currentItem: any) {
    const selectedIds = this.currentYearData
      .filter(x => x.selectedDestinationId && x.id !== currentItem.id)
      .map(x => x.selectedDestinationId);
    return this.nextYearData.filter(x => !selectedIds.includes(x.id));
  }
}
