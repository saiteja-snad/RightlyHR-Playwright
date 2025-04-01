import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProgressService {
  // Define step-wise states
  private steps: string[] = ['1', '2', '3', '4', '5'];
  private currentIndex = 0;

  // BehaviorSubject to emit the current step
  private stepSubject = new BehaviorSubject<string>(this.steps[this.currentIndex]);

  // Observable to subscribe to step changes
  step$ = this.stepSubject.asObservable();

  // Move to the next step
  nextStep() {
    this.currentIndex = (this.currentIndex + 1) % this.steps.length;
    this.stepSubject.next(this.steps[this.currentIndex]);
  }

  // Reset to the first step
  resetStep() {
    this.currentIndex = 0;
    this.stepSubject.next(this.steps[this.currentIndex]);
  }

  // Set a specific step (optional)
  setStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentIndex = index;
      this.stepSubject.next(this.steps[this.currentIndex]);
    }
  }
}