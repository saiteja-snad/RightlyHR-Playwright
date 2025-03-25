import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressService } from '../../common-services/progress.service';

@Component({
  selector: 'app-onboarding-documents',
  imports: [CommonModule],
  templateUrl: './onboarding-documents.component.html',
  styleUrl: './onboarding-documents.component.scss'
})
export class OnboardingDocumentsComponent {
  currentStep: string = '';
  @ViewChild('uploadPopup') uploadPopup: any;

  constructor(private router: Router, private modalService: NgbModal,private ProgressServices: ProgressService) { }

  ngOnInit(): void {
    this.ProgressServices.step$.subscribe((step) => {
      this.currentStep = '1';
    });
  }

  openUpload() {
    this.modalService.open(this.uploadPopup, { centered: true, backdrop: 'static' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  close(){
    this.modalService.dismissAll();
  }
}