import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-desk-history',
  imports: [CommonModule, RouterModule, TabsModule, DateformatPipe, NoDataFoundComponent, TranslateModule],
  templateUrl: './desk-history.component.html',
  styleUrl: './desk-history.component.scss'
})

export class DeskHistoryComponent {
  subscription!: Subscription;
  deskResponse: any;
  navTabs = [
    { label: 'Desk Details', route: '/desk/view-desk/desk-data', },
    { label: 'Desk History', route: '/desk/view-desk/desk-history', },
  ];
  deskid: any;
  transtiondesk = new BehaviorSubject<any[]>([]);
  inactivedesk = new BehaviorSubject<any[]>([]);

  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,
    public router: Router,) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.deskid = params.get('id');
      if (this.deskid) {
        this.viewdata(this.deskid);
      }
    });
  }

  viewdata(data: any) {
    this.subscription = this.http.getData(`DeskAllocationHeader/ById?id=${this.deskid}`).subscribe({
      next: (response: any) => {
        this.deskResponse = response;
        this.transtiondesk.next(response.items);
        this.inactivedesk.next(response.deskHistory)
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  navigateassets() {
    this.router.navigate(['/desk/management/all-desks']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
