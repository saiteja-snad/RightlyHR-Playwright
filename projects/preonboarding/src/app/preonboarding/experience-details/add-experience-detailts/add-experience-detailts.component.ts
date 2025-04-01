import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-experience-detailts',
  imports: [CommonModule],
  templateUrl: './add-experience-detailts.component.html',
  styleUrl: './add-experience-detailts.component.scss'
})
export class AddExperienceDetailtsComponent {
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal) { }

  close() {
    this.modalService.dismissAll();
  }
}
