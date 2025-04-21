import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-desk-details',
  imports: [TabsModule,RouterModule,CommonModule],
  templateUrl: './view-desk-details.component.html',
  styleUrl: './view-desk-details.component.scss'
})
export class ViewDeskDetailsComponent {
  subscription!: Subscription;
  deskResponse: any
  navTabs = [
    { label: 'Desk Details', route: '/desk/view-desk/desk-data', },
    { label: 'Desk History', route: '/desk/view-desk/desk-history', },

  ];
  deskid: any

  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,

  ) {

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
    console.log(data); // Log the incoming data for debugging

    this.subscription = this.http.getData(`DeskAllocationHeader/ById?id=${this.deskid}`).subscribe({
      next: (response: any) => {
        this.deskResponse = response;

    
     

      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }


}
