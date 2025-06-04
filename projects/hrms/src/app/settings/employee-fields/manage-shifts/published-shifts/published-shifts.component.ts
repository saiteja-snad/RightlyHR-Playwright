import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-published-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule],
  templateUrl: './published-shifts.component.html',
  styleUrl: './published-shifts.component.scss'
})

export class PublishedShiftsComponent {
  shiftsData: any[] = [];
  subscription: any;
  empinfo: any
  pendingsubmittedshifts: any = [];
  publishedshifts: any = [];
  publishedCount: any;
  viewClicked: boolean | undefined;

  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }

  getShiftNames(shift: any) {
    return shift.orgShiftsItems.map((item: any) => item.shiftName).join(', ');
  }

  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = data;
        this.publishedshifts = data.filter((item: any) => item.status === "Published");
        this.publishedCount = this.publishedshifts.length;
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }

view(id: any): void {
  const shift = this.shiftsData.find((item: any) => item.id == id);

  const transformedShift = {
    id: shift.id,
    year: shift.applicableyear,
    location: shift.locationId,
    subLocation: shift.subLocationId,
    status: shift.status,
    addedBy: shift.addedbyName,
    addedDate: shift.addedDate,
    shifts: shift.orgShiftsItems.map((item: any) => ({
      shiftCode: item.code,
      shiftName: item.shiftName,
      color: item.color,
      startTime: item.shiftStartTime,
      endTime: item.shiftEndTime,
      gracePeriod: item.allowedGracePeriod,
      latesAllowed: item.latesAllowed,
      breakTime: item.allowedBreakTime,
      halfDayMinHrs: item.halfDayMinHrs,
      fullDayMinHrs: item.fullDayMinHrs,
      description: item.shiftDescription
    }))
  };

  localStorage.setItem('viewShiftData', JSON.stringify(transformedShift));
  this.router.navigate(['/settings/employee-fields/viewshifts', id]);
}

  cloneshiftsPolicy1(id: any): void {
    const shift = this.shiftsData.find((item: any) => item.id == id);
     const transformedShift = {
    id: shift.id,
    year: shift.applicableyear,
    location: shift.locationId,
    subLocation: shift.subLocationId,
    shifts: shift.orgShiftsItems.map((item: any) => ({
      shiftCode: item.code,
      shiftName: item.shiftName,
      color: item.color,
      startTime: item.shiftStartTime,
      endTime: item.shiftEndTime,
      gracePeriod: item.allowedGracePeriod,
      latesAllowed: item.latesAllowed,
      breakTime: item.allowedBreakTime,
      halfDayMinHrs: item.halfDayMinHrs,
      fullDayMinHrs: item.fullDayMinHrs
    }))
  };
    localStorage.setItem('clonedShiftData', JSON.stringify(transformedShift));
    this.router.navigate(['/settings/employee-fields/cloneshifts', id]);
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}