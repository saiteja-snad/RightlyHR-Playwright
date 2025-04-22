import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-detailed-step-progressbar',
  imports: [CommonModule],
  templateUrl: './detailed-step-progressbar.component.html',
  styleUrl: './detailed-step-progressbar.component.scss'
})

export class DetailedStepProgressbarComponent {
  currentStep = 1;
  currentStepp = 1;
  a = false;
  b = true;
  prosempdata = {} as any;
  steps = [
    { id: 1, name: 'Personal Details' },
    { id: 2, name: 'Onboarding Documents' },
    { id: 3, name: 'Offer Letter' },
    { id: 4, name: 'Education' },
    { id: 5, name: 'Emergency Details'},
    { id: 6, name: 'Experience' },
    { id: 7, name: 'Review' },
  ];
  step2 = [
    { id: 1, name: 'Personal Details' },
    { id: 2, name: 'Onboarding Documents' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const storedStep = localStorage.getItem('currentStep');
    if (storedStep) {
      this.currentStep = parseInt(storedStep);
      this.currentStepp = parseInt(storedStep);
    }
    this.prosempdata = JSON.parse(
      localStorage.getItem('prospectiveemppersonaldata') || '{}'
    );
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }
}