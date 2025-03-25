import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProgressService } from '../../common-services/progress.service';

@Component({
  selector: 'app-detailed-step-progressbar',
  imports: [CommonModule],
  templateUrl: './detailed-step-progressbar.component.html',
  styleUrl: './detailed-step-progressbar.component.scss'
})
export class DetailedStepProgressbarComponent {
 currentStep: string = '';
  constructor(private ProgressServices: ProgressService) {

  }

  ngOnInit(): void {
    this.ProgressServices.step$.subscribe((step) => {
      this.currentStep = step;
    });
  }

}
