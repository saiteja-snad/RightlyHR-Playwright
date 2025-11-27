import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-desk',
  imports: [CommonModule, DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './desk.component.html',
  styleUrl: './desk.component.scss'
})
export class DeskComponent implements OnInit, OnDestroy {
  empinfo: any;
  subscription!: Subscription
  loading = false
  deskdata = new BehaviorSubject<any>([]);
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
      this.getdesk();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getdesk();
    }
  }
  getdesk() {
    this.loading = true
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`DeskAllocationItem/Employeeid?employeeid=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.loading = false
          this.deskdata.next(data);
        },
        error: (err: any) => {
          this.loading = false
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
