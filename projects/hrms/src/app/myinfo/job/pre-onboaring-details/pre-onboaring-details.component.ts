import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-pre-onboaring-details',
  imports: [CommonModule],
  templateUrl: './pre-onboaring-details.component.html',
  styleUrl: './pre-onboaring-details.component.scss'
})
export class PreOnboaringDetailsComponent {
  buttons= false;
  showButtons() {
    this.buttons = !this.buttons
  }
}
