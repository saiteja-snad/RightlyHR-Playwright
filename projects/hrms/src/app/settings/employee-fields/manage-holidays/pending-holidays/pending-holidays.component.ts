import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pending-holidays',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule],
  templateUrl: './pending-holidays.component.html',
  styleUrl: './pending-holidays.component.scss'
})
export class PendingHolidaysComponent {

  subscription!: Subscription
  allHolidays = [] as any;

  constructor(public router: Router, private http: HttpService) { }

  ngOnInit() {
    this.getAllHolidays();
  }

  getAllHolidays() {
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allHolidays = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        ).reverse();
        console.log(this.allHolidays);

      }, error: (err: any) => {
        console.error(err);
      }
    })
  }

  updateHoliday(holiday: any) {
    localStorage.setItem('updateholidays', JSON.stringify(holiday));
    this.router.navigate(['/settings/employee-fields/updateholidays'])
  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
