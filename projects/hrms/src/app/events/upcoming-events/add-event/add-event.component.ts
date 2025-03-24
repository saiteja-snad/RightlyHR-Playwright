import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-event',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})

export class AddEventComponent {
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal) { }

  close() {
    this.modalService.dismissAll();
  }
}