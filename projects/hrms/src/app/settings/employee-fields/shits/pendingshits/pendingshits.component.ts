import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { HttpService } from '../../../../services/http.service';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pendingshits',
  imports: [NoDataFoundComponent, CommonModule,TranslateModule,RouterModule],
  templateUrl: './pendingshits.component.html',
  styleUrl: './pendingshits.component.scss'
})
export class PendingshitsComponent {
  empinfo: any
  subscription!: Subscription;
  shiftsData: any[] = [];
  pendingsubmittedshifts:any;
  constructor(
    public router: Router,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }
  getShiftNames(shift: any) {
    return shift.orgShiftsItems.map((item: any) => item.shiftName).join(', ');
  }
  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = data;
       // this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
       this.pendingsubmittedshifts = data
  .filter((item: any) => item.status === "Pending for Submission")
  .map((item: any) => {
    return {
      ...item,
      shiftName: item.orgShiftsItems?.[0]?.shiftName || 'N/A' // fallback if missing
    };
  });

        console.log("pending",this.pendingsubmittedshifts);
      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }

  updateShift(id: any): void {
    this.router.navigate(['/settings/employee-fields/updateshifts', id]);
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
