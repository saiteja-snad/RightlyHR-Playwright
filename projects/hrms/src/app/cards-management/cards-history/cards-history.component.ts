import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cards-history',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule, DateformatPipe,NgbPopoverModule, NoDataFoundComponent, InfoIconComponent],
  templateUrl: './cards-history.component.html',
  styleUrl: './cards-history.component.scss'
})
export class CardsHistoryComponent implements OnInit,OnDestroy {
 subscription!: Subscription;
  cardHistoryResponse =[] as any;
  navTabs = [
    { label: 'Card History', icon: '/cards-icons/Allocated.png', route: '/card-management/card-history', },
  ];
  cardid: any

  constructor(private readonly http: HttpService, public readonly route: ActivatedRoute, public router: Router) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.cardid = params.get('id');
      if (this.cardid) {
        this.viewdata(this.cardid);
      }
    });
  }

  viewdata(cardId: any) {
    this.subscription = this.http.getData(`CardAllocation?cardId=${cardId}`).subscribe({
      next: (response: any) => {
        this.cardHistoryResponse = response.data.allocations;
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
