import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-popup',
  imports: [CommonModule],
  templateUrl: './error-popup.component.html',
  styleUrl: './error-popup.component.scss'
})
export class ErrorPopupComponent {
  @Input() status!: string;

  constructor(private offcanvas: NgbOffcanvas) { }

  ngOnInit(): void {

  }
}
