import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from '../pending-weekends/weekends.model';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DocumentViewIconComponent } from "../../../../icons/document-view-icon/document-view-icon.component";
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';
@Component({
   selector: 'app-published-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent, DocumentViewIconComponent],
   templateUrl: './published-weekends.component.html',
   styleUrl: './published-weekends.component.scss'
})

export class PublishedWeekendsComponent {
   private readonly cdr = inject(ChangeDetectorRef);

   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();
   dataSubscription?: Subscription;
   loading = false;

   constructor(private router: Router, private http: HttpService, public rbac: RbacService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

   ngOnInit(): void {
      this.getAllWeekend();
      this.http.refresh$.pipe(takeUntil(this.destroy$)).subscribe(() => this.getAllWeekend());
   }

   getAllWeekend() {
      this.dataSubscription?.unsubscribe();
      this.loading = true;
      this.dataSubscription = this.http.getData(`OrgWeekendHeader/getAll`).subscribe({
         next: (data: any) => {
            this.weekendsList = filterItemsByStatus(
              toArray(data),
              SETUP_WIZARD_STATUS_MODULES.weekends.publishedStatus
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

   addWeekends() {
      if (this.wizardNav.isInsideWizardRoute()) {
         this.wizardFormModal.openWizardForm('add-weekends', { onClosed: () => this.getAllWeekend() });
         return;
      }
      this.wizardNav.navigateToSettings(['/settings/employee-fields/add-weekends']);
   }

   navigateToClone(weekend: IWeekends) {
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      this.wizardNav.navigateToSettings(['/settings/employee-fields/clone-weekends']);
   }

   navigateToView(weekend: IWeekends) {
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      this.wizardNav.navigateToSettings(['/settings/employee-fields/view-weekends']);
   }

   getShiftNames(shift: any) {
      if (!shift?.orgWeekendItems?.length) {
         return null;
      }
      return shift.orgWeekendItems.map((item: any) => item.weekday).join(', ');
   }

   ngOnDestroy(): void {
      this.dataSubscription?.unsubscribe();
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
   }
}