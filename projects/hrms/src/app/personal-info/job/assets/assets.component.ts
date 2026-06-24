import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-assets',
  imports: [CommonModule, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent,TranslateModule, TableModule],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit, OnDestroy {
  @ViewChild('assetsTable') assetsTable!: Table;
  empinfo: any;
  subscription!: Subscription
  loading = false
  assestesdata = new BehaviorSubject<any[]>([]);
  originalAssetsData = [] as any[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private http: HttpService,
    private router: Router,
  ) { }
  
  ngOnInit() {
    this.getEmpInfoFromRoute();

  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getassets();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getassets();
    }
  }
  getassets() {
    this.loading = true
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`AssetTransaction?employeeId=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.loading = false
          this.assestesdata.next(data);
          this.originalAssetsData = [...data];
        },
        error: (err: any) => {
          this.loading = false
          console.log(err);
        },
      });
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
        this.assestesdata.next([...this.originalAssetsData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.assetsTable) {
          this.assetsTable.reset();
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

      // Handle nested asset master fields
      if (['assetCategory', 'assetSubCategory', 'assetModel', 'serialNumber'].includes(field)) {
        switch (field) {
          case 'assetCategory':
            val1 = a.assetMaster?.[0]?.assetCategory;
            val2 = b.assetMaster?.[0]?.assetCategory;
            break;
          case 'assetSubCategory':
            val1 = a.assetMaster?.[0]?.assetSubCategory;
            val2 = b.assetMaster?.[0]?.assetSubCategory;
            break;
          case 'assetModel':
            val1 = a.assetMaster?.[0]?.assetModel;
            val2 = b.assetMaster?.[0]?.assetModel;
            break;
          case 'serialNumber':
            val1 = a.assetMaster?.[0]?.serialNumber;
            val2 = b.assetMaster?.[0]?.serialNumber;
            break;
        }
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle date fields
      if (['allocatedDate', 'returnDate'].includes(field)) {
        if (!val1 && !val2) return 0;
        if (!val1) return event.order * 1; // null dates go to end
        if (!val2) return event.order * -1;
        
        const date1 = new Date(val1);
        const date2 = new Date(val2);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle Asset ID sorting (alphanumeric)
      if (field === 'assetIdName') {
        return event.order * String(val1 ?? '').localeCompare(
          String(val2 ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        );
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

