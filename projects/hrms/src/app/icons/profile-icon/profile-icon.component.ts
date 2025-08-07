import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-icon',
  imports: [CommonModule],
  templateUrl: './profile-icon.component.html',
  styleUrl: './profile-icon.component.scss'
})
export class ProfileIconComponent {
  @Input() iconWidth: string = '25';
  @Input() iconHeight: string = '25';
}