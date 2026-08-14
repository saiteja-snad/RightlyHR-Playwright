import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { RbacService } from '../../../../services/rbac.service';
import { IPolicy } from '../pending-policies/policies.model';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { DocumentViewIconComponent } from "../../../../icons/document-view-icon/document-view-icon.component";
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
import { SETUP_WIZARD_STATUS_MODULES } from '../../../../setup-wizard/models/setup-wizard-status-modules.constants';
import { filterItemsByStatus, toArray } from '../../../../setup-wizard/utils/setup-wizard-status-filter.util';

@Component({
  selector: 'app-published-policies',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, NgbPopoverModule, DataLoaderContentComponent, DocumentViewIconComponent],
  templateUrl: './published-policies.component.html',
  styleUrl: './published-policies.component.scss'
})
export class PublishedPoliciesComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  
  subscription!: Subscription
  refreshSubscription?: Subscription;
  allPolicies: IPolicy[] = [];
  loading = false;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }
  
  ngOnInit(): void {
    this.getAllPolicies();
    this.refreshSubscription = this.http.refresh$.subscribe(() => this.getAllPolicies());
  }
  
  nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-policies', { onClosed: () => this.getAllPolicies() });
      return;
    }
    this.wizardNav.navigateToSettings(['/settings/employee-fields/addpolices']);
  }

  updateNavigation(policy: any) {
    localStorage.setItem('updatepolicies', JSON.stringify(policy));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/updatepolices']);
  }

  getAllPolicies() {
  this.subscription?.unsubscribe();
  this.loading = true;
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        this.allPolicies = filterItemsByStatus(
          toArray(data),
          SETUP_WIZARD_STATUS_MODULES.policies.publishedStatus
        );
        this.loading = false;
        this.cdr.markForCheck();
      }, error: (err: any) => {
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    })

  }
  clonePolicy1(id: any) {
    localStorage.setItem('updatepolicies', JSON.stringify(id));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/clonepolices']);
  }

  viewPublishedPolicy(holiday: any) {
    console.log('updatepolicies',holiday);
    localStorage.setItem('updatepolicies', JSON.stringify(holiday));
    this.wizardNav.navigateToSettings(['/settings/employee-fields/viewpolices']);
    
  }

  getPolicyNames(policy: any) {
    return policy.shiftName || '';
 }

 ngOnDestroy(): void {
  this.subscription?.unsubscribe();
  this.refreshSubscription?.unsubscribe();
 }
}
