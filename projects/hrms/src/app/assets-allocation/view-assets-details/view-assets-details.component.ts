import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-assets-details',
  imports: [CommonModule, TabsModule, RouterModule,TranslateModule],
  templateUrl: './view-assets-details.component.html',
  styleUrl: './view-assets-details.component.scss'
})
export class ViewAssetsDetailsComponent {
  assetId: any;
  assetDetails: any
  subscription!: Subscription;
  navTabs = [
    { label: 'Asset Management', route: '/assets-management/view-assets-details/asset-data', },
    { label: 'Asset History', route: '/assets-management/view-assets-details/asset-history', },

  ];
  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,
    public router: Router, 
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
  navigateassets(){
    this.router.navigate(['/assets-management/all-assets']);
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
