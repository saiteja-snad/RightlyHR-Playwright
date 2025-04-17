import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pulished-shits',
  imports: [NoDataFoundComponent,CommonModule],
  templateUrl: './pulished-shits.component.html',
  styleUrl: './pulished-shits.component.scss'
})
export class PulishedShitsComponent {
  shiftsData: any[] = [];
  subscription: any;
  empinfo: any
  pendingsubmittedshifts: any = [];
  publishedshifts: any = [];
  viewClicked: boolean | undefined;
  constructor( public router:Router, private http: HttpService) { 



  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }

  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = data;
        this.publishedshifts = data.filter((item: any) => item.status === "Published");
        console.log(" this.publishedshifts", this.publishedshifts);
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");

      }, error(err) {
        console.log("expensesheadererror", err)
      },
    });
  }
  view(id:any) {
    this.router.navigate(['/settings/employee-fields/viewshifts',id]);
    // this.viewClicked = false;
  }
  cloneshiftsPolicy1(id: any): void {
    this.router.navigate(['/settings/employee-fields/cloneshifts',id]);
  }
  nagvition(){
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
}
