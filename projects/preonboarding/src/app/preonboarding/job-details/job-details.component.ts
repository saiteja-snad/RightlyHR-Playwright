import { Component } from '@angular/core';
import { JobDetailsProgressbarComponent } from "../../shared/job-details-progressbar/job-details-progressbar.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-job-details',
  imports: [CommonModule, JobDetailsProgressbarComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})

export class JobDetailsComponent {
  constructor(private router: Router) {

  }

  navigatePersonal(){
    this.router.navigate(['/personal-details']);
  }
}