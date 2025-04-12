import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { HttpService } from '../../../../services/http.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pendingshits',
  imports: [NoDataFoundComponent, CommonModule],
  templateUrl: './pendingshits.component.html',
  styleUrl: './pendingshits.component.scss'
})
export class PendingshitsComponent {
  empinfo: any
  subscription!: Subscription;
  shiftsData: any[] = [];
  constructor(
    public router: Router,
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }

  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = data;
      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }

  updateShift(id: any): void {
    this.router.navigate(['/settings/employee-fields/update-shift', id]);
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
