import { Component, computed, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import {
  SETUP_WIZARD_STATUS_MODULES,
  SetupWizardStatusModuleKey,
  SetupWizardStatusTabConfig,
  SetupWizardStatusTabId
} from '../../models/setup-wizard-status-modules.constants';
import { PendingShiftsComponent } from '../../../settings/employee-fields/manage-shifts/pending-shifts/pending-shifts.component';
import { PublishedShiftsComponent } from '../../../settings/employee-fields/manage-shifts/published-shifts/published-shifts.component';
import { PendingHolidaysComponent } from '../../../settings/employee-fields/manage-holidays/pending-holidays/pending-holidays.component';
import { PublishedHolidaysComponent } from '../../../settings/employee-fields/manage-holidays/published-holidays/published-holidays.component';
import { PendingWeekendsComponent } from '../../../settings/employee-fields/manage-weekends/pending-weekends/pending-weekends.component';
import { PublishedWeekendsComponent } from '../../../settings/employee-fields/manage-weekends/published-weekends/published-weekends.component';
import { PendingPoliciesComponent } from '../../../settings/employee-fields/manage-policies/pending-policies/pending-policies.component';
import { PublishedPoliciesComponent } from '../../../settings/employee-fields/manage-policies/published-policies/published-policies.component';
import { PendingLeavecategoryComponent } from '../../../settings/time-off/leave-categoery/pending-leavecategory/pending-leavecategory.component';
import { PublishedLeavecategoryComponent } from '../../../settings/time-off/leave-categoery/published-leavecategory/published-leavecategory.component';

@Component({
  selector: 'app-setup-wizard-status-section',
  imports: [
    CommonModule,
    PendingShiftsComponent,
    PublishedShiftsComponent,
    PendingHolidaysComponent,
    PublishedHolidaysComponent,
    PendingWeekendsComponent,
    PublishedWeekendsComponent,
    PendingPoliciesComponent,
    PublishedPoliciesComponent,
    PendingLeavecategoryComponent,
    PublishedLeavecategoryComponent
  ],
  templateUrl: './setup-wizard-status-section.component.html',
  styleUrl: './setup-wizard-status-section.component.scss'
})
export class SetupWizardStatusSectionComponent implements OnInit, OnDestroy {
  readonly moduleKey = input.required<SetupWizardStatusModuleKey>();

  private readonly http = inject(HttpService);
  readonly rbac = inject(RbacService);

  private subscription?: Subscription;

  readonly activeTab = signal<SetupWizardStatusTabId>('pending');
  readonly pendingCount = signal(0);
  readonly publishedCount = signal(0);

  readonly moduleConfig = computed(() => SETUP_WIZARD_STATUS_MODULES[this.moduleKey()]);

  readonly visibleTabs = computed(() =>
    this.moduleConfig().tabs.filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    )
  );

  ngOnInit(): void {
    this.loadCounts();
    this.setDefaultTab();
  }

  setActiveTab(tabId: SetupWizardStatusTabId): void {
    this.activeTab.set(tabId);
    this.loadCounts();
  }

  tabCount(tab: SetupWizardStatusTabConfig): number {
    return tab.id === 'pending' ? this.pendingCount() : this.publishedCount();
  }

  private setDefaultTab(): void {
    const tabs = this.visibleTabs();
    if (tabs.length === 0) {
      return;
    }

    const current = this.activeTab();
    if (!tabs.some(tab => tab.id === current)) {
      this.activeTab.set(tabs[0].id);
    }
  }

  private loadCounts(): void {
    const config = this.moduleConfig();

    this.subscription?.unsubscribe();
    this.subscription = this.http.getData(config.apiUrl).subscribe({
      next: (data: any) => {
        const items = Array.isArray(data) ? data : [];
        this.pendingCount.set(
          items.filter(item => item.status === config.pendingStatus).length
        );
        this.publishedCount.set(
          items.filter(item => item.status === config.publishedStatus).length
        );
      },
      error: () => {
        this.pendingCount.set(0);
        this.publishedCount.set(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
