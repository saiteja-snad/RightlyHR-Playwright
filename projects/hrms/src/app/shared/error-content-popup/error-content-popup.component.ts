import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-content-popup',
  imports: [CommonModule],
  templateUrl: './error-content-popup.component.html',
  styleUrl: './error-content-popup.component.scss'
})
export class ErrorContentPopupComponent {
  @Input() status!: string;
}
