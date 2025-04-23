import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-desk',
  imports: [CommonModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './desk.component.html',
  styleUrl: './desk.component.scss'
})
export class DeskComponent {
  empinfo: any;
  subscription!:Subscription
  deskdata = new BehaviorSubject<any>([]);
  constructor( private http: HttpService, ) { }
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getdesk();
   
  }

  getdesk() {
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`DeskAllocationItem/Employeeid?employeeid=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.deskdata.next(data);
          console.log(this.deskdata.value);
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

}
