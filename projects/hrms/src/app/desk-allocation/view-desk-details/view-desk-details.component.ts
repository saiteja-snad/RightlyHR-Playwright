import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-view-desk-details',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule,],
  templateUrl: './view-desk-details.component.html',
  styleUrl: './view-desk-details.component.scss'
})

export class ViewDeskDetailsComponent {
  subscription!: Subscription;
  deskResponse: any
  navTabs = [
    { label: 'Desk Details', icon: '/desk-icon/details-icon.png', route: '/desk/view-desk/desk-data', },
    { label: 'Desk History', icon: '/desk-icon/History-icon.png', route: '/desk/view-desk/desk-history', },
  ];
  deskid: any

  constructor(private readonly http: HttpService, public readonly route: ActivatedRoute, public router: Router) { }

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
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  navigateassets() {
    this.router.navigate(['/desk/management/available-desks']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}