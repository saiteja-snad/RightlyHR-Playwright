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
import { DocumentViewIconComponent } from "../../../../icons/document-view-icon/document-view-icon.component";
import { SetupWizardNavigationService } from '../../../../setup-wizard/services/setup-wizard-navigation.service';
import { SetupWizardFormModalService } from '../../../../setup-wizard/services/setup-wizard-form-modal.service';
@Component({
  selector: 'app-published-leavecategory',
  imports: [CommonModule, TranslateModule, NoDataFoundComponent, FormsModule, DataLoaderContentComponent, DocumentViewIconComponent],
  templateUrl: './published-leavecategory.component.html',
  styleUrl: './published-leavecategory.component.scss'
})

export class PublishedLeavecategoryComponent {
  submissiondata: Iorgcategoryleaves[] = [];
  empdata = {} as any;
  subscription!: Subscription;
  loading = false;

  constructor(private http: HttpService, public rbac: RbacService, private router: Router, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHRUser') || '{}');
    this.getOrgLeavesCategories();
    this.http.refresh$.subscribe(() => this.getOrgLeavesCategories());
  }

  navigateToAddLeaveCategory() {
    if (this.wizardNav.isInsideWizardRoute()) {
      this.wizardFormModal.openWizardForm('add-leave-category', { onClosed: () => this.getOrgLeavesCategories() });
      return;
    }
    this.wizardNav.navigateToSettings(['/settings/timeoff-configurations/addleavecategory']);
  }

  getOrgLeavesCategories() {
    this.loading = true;
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (responseData: any) => {
        this.loading = false;
        this.submissiondata = responseData as Iorgcategoryleaves[];
        this.submissiondata = responseData.filter((x: any) => x.status === 'Published');
      },
      error: error => {
        this.loading = false;
        console.error(error);
      }
    });
  }

  navigateToViewLeaveCategory(details: any) {
    localStorage.setItem('viewleavecategory', JSON.stringify(details));
    this.wizardNav.navigateToSettings(['/settings/timeoff-configurations/viewleavecategory']);
  }

  navigateToCloneLeaveCategory(details: any) {
    localStorage.setItem('cloneleavecategory', JSON.stringify(details));
    this.wizardNav.navigateToSettings(['/settings/timeoff-configurations/cloneleavecategory']);
  }
}