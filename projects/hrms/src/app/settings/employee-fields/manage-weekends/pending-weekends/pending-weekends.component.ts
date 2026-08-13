import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
@Component({
   selector: 'app-pending-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent, SettingsUpdateIconComponent],
   templateUrl: './pending-weekends.component.html',
   styleUrl: './pending-weekends.component.scss'
})

export class PendingWeekendsComponent implements OnInit, OnDestroy {
   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();
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
      this.loading = true;
      this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
         next: (data: any) => {
            this.loading = false;
            this.weekendsList = data.filter((item: any) => item.status === 'Pending for submission');
         },
          error: (error) => {
            this.loading = false;
            console.error('Error fetching weekends:', error);
         }

      })
   }

   getShiftNames(shift: any) {
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
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
   }
}
