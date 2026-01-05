import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

interface IFormSection {
  id: number;
  sectionName: string;
  sectionType: string;
  order: number;
  questions: IFormQuestion[];
}

interface IFormQuestion {
  id: number;
  question: string;
  type: string;
  questionWeightage: number;
  required: boolean;
  order: number;
  options: IFormOption[];
}

interface IFormOption {
  optionId: string;
  option: string;
  optionWeightage: number;
}

interface IFormDetails {
  formId: number;
  formName: string;
  moduleId: number;
  slug: string;
  ratingScaleRange: string;
  overAllRating: number;
  sectionDetails: IFormSection[];
}

@Component({
  selector: 'app-exit-feedback-form',
  imports: [CommonModule, TranslateModule, DataLoaderContentComponent],
  templateUrl: './exit-feedback-form.component.html',
  styleUrl: './exit-feedback-form.component.scss'
})
export class ExitFeedbackFormComponent implements OnInit, OnDestroy {
  
  formDetails = {} as IFormDetails;
  formSections: IFormSection[] = [];
  isDataLoaded = false;
  subscription!: Subscription;
  formData: any;

  constructor(
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit(): void {
    this.loadFormData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadFormData(): void {
    const data = localStorage.getItem('exitfeedbackformdata');
    if (data) {
      this.formData = JSON.parse(data);
      this.getFormDetails(this.formData.entity.empFormId);
    } else {
      // Fallback to hardcoded formId for testing
      this.getFormDetails(120);
    }
  }

  getFormDetails(formId: number): void {
    this.isDataLoaded = true;
    this.subscription = this.http
      .getData(`ExitFeedbackRequest/getFormResponseByFormId/${formId}`)
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.formDetails = response.data;
            this.formSections = response.data.sectionDetails || [];
          }
          this.isDataLoaded = false;
        },
        error: (err: any) => {
          console.error('Error loading form details:', err);
          this.isDataLoaded = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/myinfo/job/separation-details/exit-feedback-details']);
  }
}