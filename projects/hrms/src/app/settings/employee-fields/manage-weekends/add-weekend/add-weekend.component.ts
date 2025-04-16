import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-add-weekend',
  imports: [CommonModule,Select],
  templateUrl: './add-weekend.component.html',
  styleUrl: './add-weekend.component.scss'
})

export class AddWeekendComponent {
  constructor(private router: Router) {

  }

  navigate() {
    this.router.navigate(['/settings/employee-fields/manage-weekends']);
  }
}