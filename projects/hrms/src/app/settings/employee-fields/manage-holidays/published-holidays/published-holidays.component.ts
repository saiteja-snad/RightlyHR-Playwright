import { Component, ChangeDetectorRef, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';

@Component({
  selector: 'app-published-holidays',
  imports: [CommonModule, RouterModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './published-holidays.component.html',
  styleUrl: './published-holidays.component.scss'
})

export class PublishedHolidaysComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  subscription!: Subscription;
  refreshSubscription?: Subscription;
  allHolidays = [] as any;
  loading = false;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

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
          SETUP_WIZARD_STATUS_MODULES.holidays.publishedStatus
        ).reverse();
        this.loading = false;
        this.cdr.markForCheck();
      }, error: (err: any) => {
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      }
    })
  }

  viewPublishedholiday(holiday: any) {
    localStorage.setItem('updateholidays', JSON.stringify(holiday));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/viewholidays']);
  }

  navigateToCloneComponent(holiday: any) {
    localStorage.setItem('updateholidays', JSON.stringify(holiday));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/cloneholidays']);
  }

  nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-holidays', { onClosed: () => this.getAllHolidays() });
      return;
    }
    this.wizardNav.navigateToSettings(['/settings/employee-fields/addholidays']);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }
}