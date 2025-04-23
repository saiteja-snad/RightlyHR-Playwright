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
    { id: 5, name: 'Emergency Details' },
    { id: 6, name: 'Experience' },
    { id: 7, name: 'Review' },
    { id: 8, name: 'Appointment Letter' },
  ];

  step2 = [
    { id: 1, name: 'Personal Details' },
    { id: 2, name: 'Onboarding Documents' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedStep = localStorage.getItem('currentStep');
    if (storedStep) {
      this.currentStep = Math.min(parseInt(storedStep), this.visibleSteps.length);
    }

    this.prosempdata = JSON.parse(
      localStorage.getItem('prospectiveemppersonaldata') || '{}'
    );

    if (this.prosempdata.substatus == 'Requested Documents' || this.prosempdata.substatus == 'Documents Submitted' ||
      this.prosempdata.substatus == 'Documents Rejected' || this.prosempdata.substatus == 'Documents Verified' || this.prosempdata.substatus == 'Documents Accepted' || this.prosempdata.substatus.toLowerCase() === 'offer letter accepted') {
      if (storedStep) {
        this.currentStep = parseInt(storedStep);
        this.currentStepp = parseInt(storedStep);
      }
      this.prosempdata = JSON.parse(
        localStorage.getItem('prospectiveemppersonaldata') || '{}'
      );
    }
  }

  // Getter to reorder steps dynamically based on substatus
  get reorderedSteps() {
    if (['appointment letter generated', 'appointment letter regenerated'].includes(this.prosempdata.substatus?.toLowerCase())) {
      const stepsCopy = [...this.steps];
      const reviewIndex = stepsCopy.findIndex(step => step.name === 'Review');
      const appointmentIndex = stepsCopy.findIndex(step => step.name === 'Appointment Letter');
      if (reviewIndex !== -1 && appointmentIndex !== -1) {
        // Swap the steps
        [stepsCopy[reviewIndex], stepsCopy[appointmentIndex]] = [stepsCopy[appointmentIndex], stepsCopy[reviewIndex]];
      }
      return stepsCopy;
    }
    return this.steps;
  }

  // Getter to filter visible steps based on conditions
  get visibleSteps() {
    return this.reorderedSteps.filter(step =>
      !(this.prosempdata.substatus?.toLowerCase() === 'offer letter released' && step.id === 8)
    );
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
  }
}