import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";

@Component({
  selector: 'app-assets',
  imports: [CommonModule, NoDataFoundComponent, DateformatPipe],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.scss'
})
export class AssetsComponent {
  empinfo: any;
  subscription!:Subscription
  assestesdata = new BehaviorSubject<any[]>([]);
  constructor( private http: HttpService, ) { }
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getassets();
   
  }
  getassets() {
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`AssetTransaction?employeeId=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.assestesdata.next(data);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
}
