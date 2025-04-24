import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-letters-tab',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './letters-tab.component.html',
  styleUrl: './letters-tab.component.scss'
})

export class LettersTabComponent {
  navTabs = [
    { label: 'Offer Letter', link: '/admin/letters/offer-letter' },
    { label: 'Appointment Letter', link: '/admin/letters/appointment-letter' },
    { label: 'Intern Offer Letter', link: '/admin/letters/trainee-offer-letter' },
    { label: 'Intern Appointment Letter', link: '/admin/letters/trainee-appointment-letter' },
    { label: 'Welcome Letter', link: '/admin/letters/welcome-letter' }
  ];
}
