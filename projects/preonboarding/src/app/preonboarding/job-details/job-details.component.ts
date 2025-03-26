import { Component } from '@angular/core';
import { JobDetailsProgressbarComponent } from "../../shared/job-details-progressbar/job-details-progressbar.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SuccessPopupComponent } from '../../shared/success-popup/success-popup.component';
import { ErrorPopupComponent } from '../../shared/error-popup/error-popup.component';
@Component({
  selector: 'app-job-details',
  imports: [CommonModule, JobDetailsProgressbarComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})

export class JobDetailsComponent {
  constructor(private router: Router,private modalService: NgbModal) {

  }

  navigatePersonal(){
    this.router.navigate(['/personal-details']);
  }

  openPopup(){
      const modal = this.modalService.open(ErrorPopupComponent, { centered: true, backdrop: 'static' });
      modal.componentInstance.status = 'Job successfully!'
  }
}