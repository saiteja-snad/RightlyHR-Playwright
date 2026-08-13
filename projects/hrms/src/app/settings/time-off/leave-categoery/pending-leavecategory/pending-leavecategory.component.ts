import { Component } from '@angular/core';
import { Iorgcategoryleaves } from '../../../../Interfaces/timoff-model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
@Component({
  selector: 'app-pending-leavecategory',
  imports: [CommonModule, TranslateModule, NoDataFoundComponent, FormsModule, DataLoaderContentComponent],
  templateUrl: './pending-leavecategory.component.html',
  styleUrl: './pending-leavecategory.component.scss'
})

export class PendingLeavecategoryComponent {
  submissiondata: Iorgcategoryleaves[] = [];
  empdata = {} as any;
  loading = false;
  subscription!: Subscription;
  
  constructor(private http: HttpService, public rbac: RbacService, private router: Router, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHRUser') || '{}');
    this.getOrgLeavesCategories();
  }

  navigateToAddLeaveCategory() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-leave-category', { onClosed: () => this.getOrgLeavesCategories() });
      return;
    }
    this.router.navigate(['/settings/timeoff-configurations/addleavecategory']);
  }

  getOrgLeavesCategories() {
    this.loading = true;
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (responseData: any) => {
        this.submissiondata = responseData as Iorgcategoryleaves[];
        this.submissiondata = responseData.filter((x: any) => x.status === 'Pending for submission');
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.loading = false;
      },
      complete: () => {
        console.log('Request completed');
        this.loading = false;
      }
    });
  }

  navigateToUpdateLeaveCategory(leave: any) {
    localStorage.setItem('updateleavecategory', JSON.stringify(leave));
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('update-leave-category', { onClosed: () => this.getOrgLeavesCategories() });
      return;
    }
    this.router.navigate(['/settings/timeoff-configurations/updateleavecategory']);
  }
}