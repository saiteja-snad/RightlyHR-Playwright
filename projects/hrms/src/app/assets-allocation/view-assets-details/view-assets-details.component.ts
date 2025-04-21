import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-assets-details',
  imports: [CommonModule, TabsModule, RouterModule],
  templateUrl: './view-assets-details.component.html',
  styleUrl: './view-assets-details.component.scss'
})
export class ViewAssetsDetailsComponent {
  assetId: any;
  assetDetails: any
  subscription!: Subscription;
  navTabs = [
    { label: 'Asset Details', route: '/assets-management/view-assets-details/asset-data', },
    { label: 'Asset History', route: '/assets-management/view-assets-details/asset-history', },

  ];
  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,

  ) {

  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.assetId = params.get('id');
      if (this.assetId) {
        this.fetchAssetDetails(this.assetId);
      }
    });
  }


  fetchAssetDetails(assetId: any) {
    this.subscription = this.http.getData(`AssetMaster/${assetId}`)
      .subscribe({
        next: (data: any) => {
          this.assetDetails = data;
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
