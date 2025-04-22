import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-asset-history',
  imports: [CommonModule, TabsModule, RouterModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './asset-history.component.html',
  styleUrl: './asset-history.component.scss'
})
export class AssetHistoryComponent {
  assetId: any
  subscription!: Subscription
  assetstranstiontraser = new BehaviorSubject<any[]>([])
  assetstranstiondata = new BehaviorSubject<any[]>([])
  assetTransactions = new BehaviorSubject<any[]>([])
  navTabs = [
    { label: 'Asset Details', route: '/assets-management/view-assets-details/asset-data', },
    { label: 'Asset History', route: '/assets-management/view-assets-details/asset-history', },

  ];
  assetDetails: any;

  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,

  ) {

  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.assetId = params.get('id');
      if (this.assetId) {
        this.tranferasetdata(this.assetId)
        this.fetchAssetDetails(this.assetId);
        this.viewassetdata(this.assetId)
      }
    });
  }


  tranferasetdata(assetId: any) {
    this.subscription = this.http.getData(`AssetTransaction/transfer-history?assetId=${assetId}`)
      .subscribe({
        next: (res: any) => {

          this.assetstranstiontraser.next(res)
        },
        error: (errorMessage) => {
          console.log('Error fetching data:', errorMessage);
        }
      });
  }

  viewassetdata(assetId: any) {
    this.subscription = this.http.getData(`AssetTransaction?assetId=${assetId}`)
      .subscribe({
        next: (res: any) => {
          // Ensure that the response data matches the AssetTransaction type
          if (Array.isArray(res) && res.length > 0) {
            this.assetstranstiondata.next(res);
          }
        },
        error: (errorMessage) => {
          console.log('Error fetching data:', errorMessage);
        }
      });
  }


  fetchAssetDetails(assetId: any) {
    this.subscription = this.http.getData(`AssetMaster/${assetId}`)

      .subscribe({
        next: (data: any) => {

          this.assetDetails = data;

          if (data.transactions && data.transactions.length > 0) {
            this.assetTransactions.next(data.transactions);
          }

          if (data.transactions && data.transactions.length > 0) {
            const lastTransaction = data.transactions[data.transactions.length - 1]; // Get the last transaction
            this.assetTransactions.next(data.transactions);

            // Patch the form with the last transaction details

          }

        },
        error: (error) => {
          console.error('Error fetching asset details:', error);
        }
      });
  }
  
  ngOnDestroy(): void {
 
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }


}
