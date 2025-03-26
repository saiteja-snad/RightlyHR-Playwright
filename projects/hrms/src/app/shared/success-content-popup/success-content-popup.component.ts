import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-content-popup',
  imports: [CommonModule],
  templateUrl: './success-content-popup.component.html',
  styleUrl: './success-content-popup.component.scss'
})
export class SuccessContentPopupComponent {
  @Input() status!: string;
}
