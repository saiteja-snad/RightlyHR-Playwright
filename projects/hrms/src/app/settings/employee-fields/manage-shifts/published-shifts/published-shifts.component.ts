import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-published-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './published-shifts.component.html',
  styleUrl: './published-shifts.component.scss'
})

export class PublishedShiftsComponent {
  shiftsData: any[] = [];
  subscription: any;
  empinfo: any
  pendingsubmittedshifts: any = [];
  publishedshifts: any = [];
  publishedCount: any;
  viewClicked: boolean | undefined;
  loading = false;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }

  getShiftNames(shift: any) {
    return shift.orgShiftsItems.map((item: any) => item.shiftName).join(', ');
  }

  getShifts(): void {
    this.loading = true;
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.shiftsData = data;
        this.publishedshifts = data.filter((item: any) => item.status === "Published");
        this.publishedCount = this.publishedshifts.length;
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
      }, error: (err) => {
        this.loading = false;
        console.log("expensesheadererror", err)
      },
    });
  }

  view(id: any) {
    this.router.navigate(['/settings/employee-fields/viewshifts', id]);
  }

  cloneshiftsPolicy1(id: any): void {
    this.router.navigate(['/settings/employee-fields/cloneshifts', id]);
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}