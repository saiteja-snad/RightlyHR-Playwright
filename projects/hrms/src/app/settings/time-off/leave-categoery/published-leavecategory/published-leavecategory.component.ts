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
@Component({
  selector: 'app-published-leavecategory',
  imports: [CommonModule, TranslateModule, NoDataFoundComponent, FormsModule, DataLoaderContentComponent],
  templateUrl: './published-leavecategory.component.html',
  styleUrl: './published-leavecategory.component.scss'
})

export class PublishedLeavecategoryComponent {
  submissiondata: Iorgcategoryleaves[] = [];
  empdata = {} as any;
  subscription!: Subscription;
  loading = false;

  constructor(private http: HttpService, public rbac: RbacService, private router: Router) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHRUser') || '{}');
    this.getOrgLeavesCategories();
  }

  navigateToAddLeaveCategory() {
    this.router.navigate(['/settings/timeoff-configurations/addleavecategory']);
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
    this.router.navigate(['/settings/timeoff-configurations/viewleavecategory']);
  }

  navigateToCloneLeaveCategory(details: any) {
    localStorage.setItem('cloneleavecategory', JSON.stringify(details));
    this.router.navigate(['/settings/timeoff-configurations/cloneleavecategory']);
  }
}