import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ProgressService } from '../../common-services/progress.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEducationDetailsComponent } from './add-education-details/add-education-details.component';

@Component({
  selector: 'app-education-details',
  imports: [CommonModule],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})
export class EducationDetailsComponent {
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
