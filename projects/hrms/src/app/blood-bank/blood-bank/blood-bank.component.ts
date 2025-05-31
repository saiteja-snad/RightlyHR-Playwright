import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-blood-bank',
  imports: [CommonModule],
  templateUrl: './blood-bank.component.html',
  styleUrl: './blood-bank.component.scss'
})
export class BloodBankComponent {
bloodBankData = [
  {
    bloodGroup: 'AB',
    name: 'vamsi',
    email: 'ssharanya.mandalajisnaddevelopers.com'
  },
  // Add more objects as needed
  {
    bloodGroup: 'O+',
    name: 'Rahul',
    email: 'rahul@example.com'
  }
];
}
