import { Component } from '@angular/core';
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

@Component({
  selector: 'app-published-holidays',
  imports: [CommonModule, RouterModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './published-holidays.component.html',
  styleUrl: './published-holidays.component.scss'
})

export class PublishedHolidaysComponent {
  subscription!: Subscription
  allHolidays = [] as any;
  loading = false;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private wizardNav: SetupWizardNavigationService, private wizardFormModal: SetupWizardFormModalService) { }

  ngOnInit() {
    this.getAllHolidays();
  }

  getAllHolidays() {
    this.loading = true;
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.allHolidays = data.filter((status: { status: string; }) => status.status === 'Published').reverse();
      }, error: (err: any) => {
        this.loading = false;
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
}