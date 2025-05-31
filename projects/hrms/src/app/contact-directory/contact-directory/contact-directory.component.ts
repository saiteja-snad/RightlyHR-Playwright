import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-directory',
  imports: [CommonModule],
  templateUrl: './contact-directory.component.html',
  styleUrl: './contact-directory.component.scss'
})
export class ContactDirectoryComponent {
contacts = [
  {
    name: 'Srisharanya Mandaloji',
    email: 'ssharanya.mandalaji@snadevelopers.com',
    phone: '+91 9988776655',
    img: 'assets/profile1.png'
  },
  // ...more contacts
];
}
