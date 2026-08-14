import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DocumentViewIconComponent } from '../../../../icons/document-view-icon/document-view-icon.component';
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';

@Component({
  selector: 'app-published-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule, DataLoaderContentComponent, InfoIconComponent,NgbPopoverModule,DocumentViewIconComponent],
  templateUrl: './published-shifts.component.html',
  styleUrl: './published-shifts.component.scss'
})

export class PublishedShiftsComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  shiftsData: any[] = [];
  subscription?: Subscription;
  refreshSubscription?: Subscription;
  empinfo: any
  pendingsubmittedshifts: any[] = [];
  publishedshifts: any[] = [];
  publishedCount = 0;
  viewClicked: boolean | undefined;
  loading = false;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
    this.refreshSubscription = this.http.refresh$.subscribe(() => this.getShifts());
  }

  getShiftNames(shift: any) {
    if (!shift?.orgShiftsItems?.length) {
      return null;
    }
    return shift.orgShiftsItems.map((item: any) => item.shiftName).join(', ');
  }

  getShifts(): void {
    this.subscription?.unsubscribe();
    this.loading = true;
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = toArray(data);
        this.publishedshifts = filterItemsByStatus(
          this.shiftsData,
          SETUP_WIZARD_STATUS_MODULES.shifts.publishedStatus
        );
        this.publishedCount = this.publishedshifts.length;
        this.pendingsubmittedshifts = filterItemsByStatus(
          this.shiftsData,
          SETUP_WIZARD_STATUS_MODULES.shifts.pendingStatus
        );
        this.loading = false;
        this.cdr.markForCheck();
      }, error: (err) => {
        this.loading = false;
        this.cdr.markForCheck();
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
      description: item.shiftDescription,
      punchBeginBefore: item.punchBeginBefore || 0,
      punchEndAfter: item.punchEndAfter || 0
    }))
  };

  localStorage.setItem('viewShiftData', JSON.stringify(transformedShift));
  this.wizardNav.navigateToSettings(['/settings/employee-fields/viewshifts', id]);
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
      fullDayMinHrs: item.fullDayMinHrs,  
      punchBeginBefore: item.punchBeginBefore || 0,
      punchEndAfter: item.punchEndAfter || 0

    }))
  };
    localStorage.setItem('clonedShiftData', JSON.stringify(transformedShift));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/cloneshifts', id]);
  }

  nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-shifts', { onClosed: () => this.getShifts() });
      return;
    }
    this.wizardNav.navigateToSettings(['/settings/employee-fields/addshifts']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }
}