import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-assets',
  imports: [CommonModule, NoDataFoundComponent, DateformatPipe, DataLoaderContentComponent],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent implements OnInit,OnDestroy{
  empinfo: any;
  subscription!:Subscription
  loading=false
  assestesdata = new BehaviorSubject<any[]>([]);
  constructor( private http: HttpService, ) { }
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getassets();
   
  }
  getassets() {
    this.loading=true
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`AssetTransaction?employeeId=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.loading=false
          this.assestesdata.next(data);
        },
        error: (err: any) => {
          
          this.loading=false
        },
      });
  }
 
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
