import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-manage-shifts-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './manage-shifts-tabs.component.html',
  styleUrl: './manage-shifts-tabs.component.scss'
})
export class ManageShiftsTabsComponent {
  publishedshifts: any = [];
  publishedCount =0;
  pendingsubmittedshifts:any=[];
  pendingCount=0;
  subscription: any;
  navLinks: { label: string; route: string; }[] | undefined;
  constructor( public router:Router, private http: HttpService) {}
  ngOnInit(): void {
    this.getShifts();
  }

  
  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
      
        this.publishedshifts = data.filter((item: any) => item.status === "Published");
        this.publishedCount = this.publishedshifts.length;
        console.log(" this.publishedshifts", this.publishedshifts);
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
        this.pendingCount = this.pendingsubmittedshifts.length;
        this.navLinks = [
          { label: `Pending For Submit [${this.pendingCount}]`, route: '/settings/employee-fields/manage-shifts/pending-for-submit' },
          { label: `Published shifts [${this.publishedCount}]`, route: '/settings/employee-fields/manage-shifts/published-shifts' },
        ];
      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }
}
