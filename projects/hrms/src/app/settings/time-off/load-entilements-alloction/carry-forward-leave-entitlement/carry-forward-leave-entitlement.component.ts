import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { IJobsResponse } from '../../../../Interfaces/loadentitlementjob';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carry-forward-leave-entitlement',
  imports: [CommonModule, PaginatorModule, DataLoaderContentComponent, NoDataFoundComponent, FormsModule],
  templateUrl: './carry-forward-leave-entitlement.component.html',
  styleUrl: './carry-forward-leave-entitlement.component.scss'
})
export class CarryForwardLeaveEntitlementComponent {
  loading = false;
  searchQuery = ''
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  jobdata: IJobsResponse[] = []
  subscription!: Subscription;
  jobData: any[] = [];
  constructor(private http: HttpService,) { }

  ngOnInit(): void {
    this.getdatacarryforword()
  }

 onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getdatacarryforword();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getdatacarryforword();
  }

  getdatacarryforword() {
    let url = `LeaveEntitlementJobs?pageNumber=${this.page}&pageSize=${this.pageSize}`
    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobData = res.data;
        this.collectionSize = res.pagination.totalRecords;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
      },
    });

  }


}
