import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LeaveEntitlementSideBarComponent } from "../../../shared/leave-entitlement-side-bar/leave-entitlement-side-bar.component";
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

@Component({
  selector: 'app-load-entilements-alloction',
  imports: [RouterModule, CommonModule, PaginatorModule, FormsModule,NgbPopoverModule, LeaveEntitlementSideBarComponent, DataLoaderContentComponent, NoDataFoundComponent, InfoIconComponent],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss'
})
export class LoadEntilementsAlloctionComponent {
  loading = false;
  subscription!: Subscription;
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
  jobid: any;
  jobSummary: any = {};
  employees: any[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const jobid = params['id'];
      if (jobid) {
        this.jobid = jobid;
        this.getdatacarryforword();
      }
    });
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
    let url = `LeaveEntitlementJobs/${this.jobid}/details?pageNumber=${this.page}&pageSize=${this.pageSize}`
    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobSummary = res.data.jobSummary;
        this.employees = res.data.employees;
        this.collectionSize = res.pagination.totalRecords;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.loading = false
        this.employees = [];
      },
    });

  }


}
