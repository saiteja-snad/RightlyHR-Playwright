import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";

import { OpenModalService } from '../../../../services/open-modal.service';
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';

@Component({
  selector: 'app-pending-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule, NgbPopoverModule, DataLoaderContentComponent, InfoIconComponent, SettingsUpdateIconComponent],
  templateUrl: './pending-shifts.component.html',
  styleUrl: './pending-shifts.component.scss'
})
export class PendingShiftsComponent implements OnInit, OnDestroy {

  private readonly cdr = inject(ChangeDetectorRef);

  empinfo: any
  subscription!: Subscription;
  refreshSubscription?: Subscription;
  shiftsData: any[] = [];
  pendingsubmittedshifts: any[] = [];
  loading = false;
  successModalRef: any;
  deleteModalRef: any;
   constructor(public router: Router, private http: HttpService, public rbac: RbacService,private confirmation: OpenModalService,
  private modalService: NgbModal, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

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
        this.pendingsubmittedshifts = filterItemsByStatus(
          this.shiftsData,
          SETUP_WIZARD_STATUS_MODULES.shifts.pendingStatus
        ).map((item: any) => ({
          ...item,
          shiftName: item.orgShiftsItems?.[0]?.shiftName || 'N/A'
        }));
        this.loading = false;
        this.cdr.markForCheck();
      }, error:(err)=> {
        this.loading = false;
        this.cdr.markForCheck();
        console.log("expensesheadererror", err)
      },
    });
  }

  updateShift(id: any): void {
    const shift = this.shiftsData.find((item : any) => item.id == id);
    localStorage.setItem('selectedShift', JSON.stringify(shift));
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('update-shifts', { onClosed: () => this.getShifts() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/updateshifts', id]);
  }
  shiftsddata:any
   DeleteShiftDailog(content: any, shift: any) {
      this.shiftsddata = shift;
      this.deleteModalRef = this.modalService.open(content, { centered: true });
   }
   onDelete(modal: any) {
      this.http.deleteData(`OrgShifts/${this.shiftsddata.id}`).subscribe({
         next: () => {
            // Remove from list after successful delete
            this.shiftsData = this.shiftsData.filter(item => item.id !== this.shiftsddata.id);

            // Close delete popup
            modal.close();
                 this.http.triggerRefresh();
                    
            // Open success popup
            this.confirmation.openSuccessModal('Shift deleted successfully');
             this.getShifts();
             
            setTimeout(() => {
               if (this.successModalRef) {
                  this.successModalRef.close();
                      
               }
            }, 2000);
         },
         error: () => {
            modal.close();
            this.confirmation.openErrorModal('Failed to delete Shifts.');
         }
      });
   }
   nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-shifts', { onClosed: () => this.getShifts() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }
}
