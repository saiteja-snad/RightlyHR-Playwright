import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressService } from '../../common-services/progress.service';
import { AddEducationDetailsComponent } from '../education-details/add-education-details/add-education-details.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-experience-details',
  imports: [CommonModule],
  templateUrl: './experience-details.component.html',
  styleUrl: './experience-details.component.scss'
})
export class ExperienceDetailsComponent {
  @ViewChild('uploadPopup') uploadPopup: any;
   placeHolder = false;

   constructor(private router: Router, private modalService: NgbModal,private ProgressServices: ProgressService) { }

   ngOnInit(): void {

   }
 
   openEducation() {
     this.modalService.open(AddEducationDetailsComponent, { centered: true, backdrop: 'static', size:'lg' });
   }
 
   navigateDashboard() {
     this.router.navigate(['/admin/dashboard'])
   }
 
   close(){
     this.modalService.dismissAll();
   }
}
