import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cards-history',
  imports: [TabsModule, RouterModule, CommonModule, TranslateModule, DateformatPipe,NgbPopoverModule, NoDataFoundComponent, InfoIconComponent, TableModule],
  templateUrl: './cards-history.component.html',
  styleUrl: './cards-history.component.scss'
})
export class CardsHistoryComponent implements OnInit,OnDestroy {
 @ViewChild('cardsHistoryTable') cardsHistoryTable!: Table;
 subscription!: Subscription;
  cardHistoryResponse =[] as any;
  originalCardHistory = [] as any; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
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
        this.originalCardHistory = [...this.cardHistoryResponse];
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  navigateassets() {
    this.router.navigate(['/desk/management/available-desks']);
  }

  getFilteredAndSortedCardHistory(): any[] {
    return this.cardHistoryResponse;
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.cardHistoryResponse = [...this.originalCardHistory];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.cardsHistoryTable) {
          this.cardsHistoryTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle nested fields
      if (field === 'cardNumber') {
        val1 = a.card?.cardNumberMasked;
        val2 = b.card?.cardNumberMasked;
      } else if (field === 'cardType') {
        val1 = a.card?.cardType;
        val2 = b.card?.cardType;
      } else if (field === 'employeeName') {
        val1 = a.employee?.name;
        val2 = b.employee?.name;
      } else if (field === 'assignedByName') {
        val1 = a.assignedBy?.name;
        val2 = b.assignedBy?.name;
      } else if (field === 'allocatedDate' || field === 'releasedDate') {
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
