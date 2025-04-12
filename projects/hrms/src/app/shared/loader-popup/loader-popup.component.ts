import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader-popup',
  imports: [CommonModule],
  templateUrl: './loader-popup.component.html',
  styleUrl: './loader-popup.component.scss'
})
export class LoaderPopupComponent {
  @Input() status!: string;
}
