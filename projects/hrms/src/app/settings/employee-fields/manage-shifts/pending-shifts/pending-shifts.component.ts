import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-pending-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule, NgbPopoverModule, DataLoaderContentComponent],
  templateUrl: './pending-shifts.component.html',
  styleUrl: './pending-shifts.component.scss'
})
export class PendingShiftsComponent {
  empinfo: any
  subscription!: Subscription;
  shiftsData: any[] = [];
  pendingsubmittedshifts: any;
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
        this.shiftsData = data;
        this.loading = false;
        // this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission")
          .map((item: any) => {
            return {
              ...item,
              shiftName: item.orgShiftsItems?.[0]?.shiftName || 'N/A' // fallback if missing
            };
          });
      }, error:(err)=> {
        this.loading = false;
        console.log("expensesheadererror", err)
      },
    });
  }

  updateShift(id: any): void {
    const shift = this.shiftsData.find((item : any) => item.id == id);
    localStorage.setItem('selectedShift', JSON.stringify(shift));
    this.router.navigate(['/settings/employee-fields/updateshifts', id]);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
