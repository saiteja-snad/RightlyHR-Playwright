import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from './weekends.model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";

import { OpenModalService } from '../../../../services/open-modal.service';
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';
@Component({
   selector: 'app-pending-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent, SettingsUpdateIconComponent],
   templateUrl: './pending-weekends.component.html',
   styleUrl: './pending-weekends.component.scss'
})

export class PendingWeekendsComponent implements OnInit, OnDestroy {
   private readonly cdr = inject(ChangeDetectorRef);

   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();
   dataSubscription?: Subscription;
   loading = false;
   message: any;
   successModalRef: any;
   deleteModalRef: any;
    constructor(
      private router: Router,
      private http: HttpService,
      public rbac: RbacService,
        private confirmation: OpenModalService,
      private modalService: NgbModal,
      private wizardNav: SetupWizardNavigationService,
      private wizardFormModal: SetupWizardFormModalService
   ) { }

   ngOnInit(): void {
      this.getAllWeekend();
      this.http.refresh$.pipe(takeUntil(this.destroy$)).subscribe(() => this.getAllWeekend());
   }

   addWeekends() {
      if (this.wizardNav.isInsideWizardRoute()) {
         this.wizardFormModal.openWizardForm('add-weekends', { onClosed: () => this.getAllWeekend() });
         return;
      }
      this.router.navigate(['/settings/employee-fields/add-weekends']);
   }

   openUpdate(weekend: IWeekends){
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      if (this.wizardNav.isInsideWizardRoute()) {
         this.wizardFormModal.openWizardForm('update-weekends', { onClosed: () => this.getAllWeekend() });
         return;
      }
      this.router.navigate(['/settings/employee-fields/update-weekends']);
   }

   getAllWeekend() {
      this.dataSubscription?.unsubscribe();
      this.loading = true;
      this.dataSubscription = this.http.getData(`OrgWeekendHeader/getAll`).subscribe({
         next: (data: any) => {
            this.weekendsList = filterItemsByStatus(
              toArray(data),
              SETUP_WIZARD_STATUS_MODULES.weekends.pendingStatus
            );
            this.loading = false;
            this.cdr.markForCheck();
         },
          error: (error) => {
            this.loading = false;
            this.cdr.markForCheck();
            console.error('Error fetching weekends:', error);
         }

      })
   }

   getShiftNames(shift: any) {
      if (!shift?.orgWeekendItems?.length) {
         return null;
      }
      return shift.orgWeekendItems.map((item: any) => item.weekday).join(', ');
   }
  Weekenddata: any;
   DeleteWeekendyDailog(content: any, weekend: any) {
      this.Weekenddata = weekend;
      this.deleteModalRef = this.modalService.open(content, { centered: true });
   }
   onDelete(modal: any) {
      this.http.deleteData(`OrgWeekendHeader/${this.Weekenddata.id}`).subscribe({
         next: () => {
            // Remove from list after successful delete
            this.weekendsList = this.weekendsList.filter(item => item.id !== this.Weekenddata.id);

            // Close delete popup
            modal.close();
            this.http.triggerRefresh();

            // Open success popup
            this.confirmation.openSuccessModal('Weekend deleted successfully');
                this.getAllWeekend();

            setTimeout(() => {
               if (this.successModalRef) {
                  this.successModalRef.close();
               }
            }, 2000);
         },
         error: () => {
            modal.close();
            this.confirmation.openErrorModal('Failed to delete weekend.');
         }
      });
   }
   ngOnDestroy(): void {
      this.dataSubscription?.unsubscribe();
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
   }
}
