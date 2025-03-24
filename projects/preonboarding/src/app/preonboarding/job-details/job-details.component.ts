import { Component } from '@angular/core';
import { JobDetailsProgressbarComponent } from "../../shared/job-details-progressbar/job-details-progressbar.component";
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-job-details',
  imports: [CommonModule, JobDetailsProgressbarComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})

export class JobDetailsComponent {

}
