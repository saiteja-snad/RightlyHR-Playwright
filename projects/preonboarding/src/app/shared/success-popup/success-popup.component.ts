import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-success-popup',
  imports: [CommonModule],
  templateUrl: './success-popup.component.html',
  styleUrl: './success-popup.component.scss'
})
export class SuccessPopupComponent {
  @Input() status!: string;

  constructor(private offcanvas: NgbOffcanvas) { }

  ngOnInit(): void {

  }
}
