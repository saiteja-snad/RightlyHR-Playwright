import { Component } from '@angular/core';
import { ICarryForward } from '../../../flexible-leave-allocation/leave-allocation.model';
import { FormValidationsService } from '../../../../../services/form-validations.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../services/http.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { OpenModalService } from '../../../../../services/open-modal.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';


export interface ILeaveCategory {
  id: number;
  applicableYear: number;
  locationID: number;
  subLocation: number;
  shiftId: number;
  type: number;
  name: string;

  locationName: string;
  subLocationName: string;
  shiftName: string;
  categoryColor: string;
  categoryCode: string;

  noticeperiodAllowedType: boolean;
  noticePeriodAllowedValue: number;

  allowedHalfDay: boolean;
  allowedGender: number;
  allowedMaritalStatus: number;

  excludeWeekends: boolean;
  excludeHolidays: boolean;

  futureDatesAllowed: boolean;
  futureDatesAllowedDays: number;

  pastDateAllowed: boolean;
  pastDatesAllowedDays: number;

  carryForwardAllowed: boolean;
  carryForwardAllowedType: boolean;
  carryForwardAllowedValue: number;

  encashAllowedType: boolean;
  encashAllowedValue: number;

  validity: number;
  status: string;

  addedBy: number;
  addedDate: string;
  lastModifiedBy: number;
  lastModifiedDate: string;

  parentId: number;
  isDefault: boolean;

  isProbationAllowed: boolean;
  probationDays: number;

  isApplicableProRataLeave: boolean;
  isOptionalHoliday: boolean;

  leaveTypeId: number;

  // optional fields in some records
  probationFrequencyType?: string;
}


@Component({
  selector: 'app-load-entilements-map-categoery',
  imports: [CommonModule, Select],
  templateUrl: './load-entilements-map-categoery.component.html',
  styleUrl: './load-entilements-map-categoery.component.scss'
})
export class LoadEntilementsMapCategoeryComponent {
  carryforwarddata: any = {}
  loading: boolean = false
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentYearData: ILeaveCategory[] = [];
  nextYearData: ILeaveCategory[] = [];
  currentYear = 0;
  nextYear = 0;

  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal,
    private route: Router, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService) { }


  ngOnInit(): void {
    this.carryforwarddata = JSON.parse(localStorage.getItem('loadEntitlement') ?? '')
    console.log(this.carryforwarddata)

    this.getCarryForwardData(this.carryforwarddata)
  }

  leaveTypes: string[] = [];


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
          this.currentYearData = current as ILeaveCategory[];
          this.nextYearData = next as ILeaveCategory[];
        },
        error: _ => (this.loading = false)
      });
  }


  private getDataByYear(carryforwarddata: ICarryForward, year: number) {
    return this.http.getData(
      `OrgLeavesCategories?locationId=${carryforwarddata.location.id}&subLocationId=${carryforwarddata.subLocation.id}&year=${year}&status=Published&shiftId=${carryforwarddata.shift.id}`
    );
  }

  navigationtoback() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-map-categoery'])
  }

  navigationtofinal() {
    this.route.navigate(['/settings/timeoff-configurations/load-entitlements/load-entitlement-execution'])
  }
}
