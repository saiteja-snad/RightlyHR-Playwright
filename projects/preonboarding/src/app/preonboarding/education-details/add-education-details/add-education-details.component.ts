import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-education-details',
  imports: [CommonModule],
  templateUrl: './add-education-details.component.html',
  styleUrl: './add-education-details.component.scss'
})
export class AddEducationDetailsComponent {
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal) { }

  close() {
    this.modalService.dismissAll();
  }
}
