import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { CommonModule } from '@angular/common';
import { JobNameComponent } from "../../shared/job-name/job-name.component";

@Component({
  selector: 'app-application-submit',
  imports: [CommonModule, JobNameComponent],
  templateUrl: './application-submit.component.html',
  styleUrl: './application-submit.component.scss'
})
export class ApplicationSubmitComponent implements OnInit, OnDestroy {
  constructor(private router: Router,  private http: HttpService,) {}
  subscription!: Subscription;
  jobdetails = [] as any;
  prosempdata={} as any;
  ngOnInit() {
    this.prosempdata= JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.getJobDetails();
  }

  getJobDetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data); 
         let reverdata=data.reverse()
        console.log(this.jobdetails.jobRole);
        this.jobdetails = reverdata[0] as any;
        console.log(this.jobdetails);
      }
    })
  }


  navigatefirst() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
