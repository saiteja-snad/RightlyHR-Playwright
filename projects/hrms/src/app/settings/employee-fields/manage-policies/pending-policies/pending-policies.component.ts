import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder} from '@angular/forms';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RbacService } from '../../../../services/rbac.service';
import { IPolicy } from './policies.model';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../../services/open-modal.service';
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';


@Component({
  selector: 'app-pending-policies',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, NgbPopoverModule, DataLoaderContentComponent],
  templateUrl: './pending-policies.component.html',
  styleUrl: './pending-policies.component.scss'
})
export class PendingPoliciesComponent implements OnInit, OnDestroy {

  subscription!: Subscription
  allPolicies: IPolicy[] = [];
  loading = false;
 message: any;
  successModalRef: any;
  deleteModalRef: any;
  constructor(public router: Router, private http: HttpService, private modalService: NgbModal, private fb: FormBuilder, public rbac: RbacService, private confirmation: OpenModalService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }
  ngOnInit(): void {
    this.getAllPolicies();
  }
  
  nagvition() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-policies', { onClosed: () => this.getAllPolicies() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }

  updateNavigation(policy: any) {
    localStorage.setItem('updatepolicies', JSON.stringify(policy));
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('update-policies', { onClosed: () => this.getAllPolicies() });
      return;
    }
    this.router.navigate(['/settings/employee-fields/updatepolices']);
  }
  Message: any;
  policedata: any;
  
  DeletePolicyDailog(content: any, policy: any) {
    this.policedata = policy;
    this.deleteModalRef = this.modalService.open(content, { centered: true });
  }
  onDelete(modal: any) {
    this.http.deleteData(`orgPolicies/${this.policedata.id}`).subscribe({
      next: () => {
        // Remove from list after successful delete
        this.allPolicies = this.allPolicies.filter(item => item.id !== this.policedata.id);

        // Close delete popup
        modal.close();
        this.http.triggerRefresh();
        // Open success popup
        this.confirmation.openSuccessModal('Policy deleted successfully');
        this.getAllPolicies();

        setTimeout(() => {
          if (this.successModalRef) {
            this.successModalRef.close();
          }
        }, 2000);
      },
      error: () => {
        modal.close();
        this.confirmation.openErrorModal('Failed to delete Policy.');
      }
    });
  }
  getAllPolicies() {
  this.loading = true;
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.allPolicies = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        );
        console.log(this.allPolicies);
      }, error: (err: any) => {
        this.loading = false;
        console.error(err);
      }
    })

  }

  getPolicyNames(policy: any) {
    return policy.shiftName || '';
 }

 ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
 }
}
