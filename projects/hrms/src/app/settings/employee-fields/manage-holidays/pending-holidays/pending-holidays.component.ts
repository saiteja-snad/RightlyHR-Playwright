import { Component, ChangeDetectorRef, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';

@Component({
  selector: 'app-pending-holidays',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './pending-holidays.component.html',
  styleUrl: './pending-holidays.component.scss'
})

export class PendingHolidaysComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  subscription!: Subscription;
  refreshSubscription?: Subscription;
  allHolidays = [] as any;
loading = false;
 message: any;
  successModalRef: any;
  deleteModalRef: any;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private confirmation: OpenModalService, private modalService: NgbModal, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }


  ngOnInit() {
    this.getAllHolidays();
    this.refreshSubscription = this.http.refresh$.subscribe(() => this.getAllHolidays());
  }

  getAllHolidays() {
    this.subscription?.unsubscribe();
    this.loading = true;
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        this.allHolidays = filterItemsByStatus(
          toArray(data),
          SETUP_WIZARD_STATUS_MODULES.holidays.pendingStatus
        ).reverse();
        this.loading = false;
        this.cdr.markForCheck();
      }, error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    })
  }

  updateHoliday(holiday: any) {
    localStorage.setItem('updateholidays', JSON.stringify(holiday));
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('update-holidays', { onClosed: () => this.getAllHolidays() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/updateholidays']);
  }
 holidaydata: any;
 
  DeleteHolidayDailog(content: any, holiday: any) {
    this.holidaydata = holiday;
    this.deleteModalRef = this.modalService.open(content, { centered: true });
  }
   onDelete(modal: any) {
    this.http.deleteData(`orgHolidays/${this.holidaydata.id}`).subscribe({
      next: () => {
        // Remove from list after successful delete
        this.allHolidays = this.allHolidays.filter((item: { id: any; }) => item.id !== this.holidaydata.id);

        // Close delete popup
        modal.close();
        this.http.triggerRefresh();

        // Open success popup
        this.confirmation.openSuccessModal('Holiday deleted successfully');
        this.getAllHolidays();

        setTimeout(() => {
          if (this.successModalRef) {
            this.successModalRef.close();
          }
        }, 2000);
      },
      error: () => {
        modal.close();
        this.confirmation.openErrorModal('Failed to delete Holiday.');
      }
    });
  }
  nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-holidays', { onClosed: () => this.getAllHolidays() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }
}