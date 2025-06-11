import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-job-name',
  imports: [CommonModule, RouterModule],
  templateUrl: './job-name.component.html',
  styleUrl: './job-name.component.scss'
})

export class JobNameComponent {
  subscription!: Subscription;
  prosempdata = {} as any;
  jobdetails = [] as any;

  constructor(private http: HttpService,) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.getJobDetails();
  }

  //function to get jobdetails
  getJobDetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    // console.log(EmployeeId);
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        let reverdata = data.reverse();
        this.jobdetails = reverdata[0] as any;
      },
      error: (err: any) => {
        console.log(err);
      }
    })
  }
}