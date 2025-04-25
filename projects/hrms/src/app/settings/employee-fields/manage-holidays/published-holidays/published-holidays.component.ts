import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-published-holidays',
  imports: [CommonModule, RouterModule, NoDataFoundComponent, TranslateModule],
  templateUrl: './published-holidays.component.html',
  styleUrl: './published-holidays.component.scss'
})
export class PublishedHolidaysComponent {



  subscription!: Subscription
  allHolidays = [] as any;

  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit() {
    this.getAllHolidays();
  }


  getAllHolidays() {
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allHolidays = data.filter(
          (status: { status: string; }) => status.status === 'Published'
        ).reverse();
        console.log(this.allHolidays);

      }, error: (err: any) => {
        console.error(err);
      }
    })
  }

  viewPublishedholiday(holiday: any) {
    localStorage.setItem('viewholidays', JSON.stringify(holiday));
    this.router.navigate(['/settings/employee-fields/viewholidays']);

  }

  nagvition() {
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }
}
