import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IDynamicForm, IRatingScale } from '../../../Interfaces/dynamic-forms.model';
import { HttpService } from '../../../services/http.service';
import { CommonModule,Location } from '@angular/common';

@Component({
  selector: 'app-view-form',
  imports: [CommonModule],
  templateUrl: './view-form.component.html',
  styleUrl: './view-form.component.scss',
})
export class ViewFormComponent implements OnInit, OnDestroy {
  viewForm!: FormGroup;
  viewDetails = {} as IDynamicForm;
  formId!: number;
  destroy$: Subject<boolean> = new Subject<boolean>();
  weightageArray: any[] = [];
  newweightageArray: any[] = [];
  ratingScaleTypes!: IRatingScale[];
  questionTypes = [
    { value: 'text', label: 'Text' },
    { value: 'text area', label: 'Text Area' },
    { value: 'boolean', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Check Box' },
    { value: 'rating', label: 'Rating' },
  ];
  sectionTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'rating', label: 'Rating' },
  ];

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private http: HttpService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private router: Router,
    private route: ActivatedRoute
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    const data = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.viewDetails.employeeId = data.employeeId;
    this.viewForm = this.fb.group({
      formHeader: ['', [Validators.required, Validators.maxLength(100)]],
      moduleId: ['', Validators.required],
      cutOffRating: [null, [Validators.required, Validators.min(1)]],
      overAllRating: [null, [Validators.required, Validators.min(1)]],
      formId: [null, Validators.required],
      createdBy: [null, Validators.required],
      updatedBy: [null, Validators.required],
      status: ['', Validators.required],
      meta: [''],
      sectionId: [null, Validators.required],
      formHeaderId: [null, Validators.required],
      sections: this.fb.array([]), // Sections FormArray
    });

    this.formId = history.state.formId;

    this.viewFormDetails(this.formId);
  }

  // form.component.ts
  getRatingScaleOptions(
    ratingType: string
  ): { scale: number; description: string }[] | null {
    // Check if ratingScaleTypes is available
    if (!this.ratingScaleTypes) {
      return null;
    }

    const selectedRatingType = this.ratingScaleTypes.find(
      (scale) => scale.ratingType === ratingType
    );
    return selectedRatingType ? selectedRatingType.scales : null;
  }

  getAllRatingScaleTypes() {
    this.http
      .getData('Form/getallratings')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.ratingScaleTypes = data as IRatingScale[];
        },
      });
  }

  viewFormDetails(formId: number) {
    this.http
      .getData(`Form/getFormDetailsByFormId/${formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Patch values for the top-level form controls
          this.viewForm.patchValue({
            formHeader: data.formName,
            moduleId: data.moduleId,
            cutOffRating: data.cutOffRating,
            overAllRating: data.overAllRating,
          });

          // Clear existing sections if any
          this.viewSections.clear();

          // Populate sections and questions dynamically
          data.sectionDetails.forEach((section: any) => {
            // Create FormArray for questions
            const questionsArray = this.fb.array<FormGroup>([]);

            section.questions.forEach((question: any) => {
              // Create FormArray for options
              const optionsArray = this.fb.array<FormGroup>([]);

              question.options.forEach((option: any) => {
                const optionGroup = this.fb.group({
                  option: [option.option],
                });
                optionsArray.push(optionGroup);
              });

              // Create FormGroup for each question
              const questionGroup = this.fb.group({
                id: [question.id],
                required: [question.required],
                question: [question.question, Validators.required],
                type: [question.type, Validators.required],
                options: optionsArray,
              });

              questionsArray.push(questionGroup);
            });

            section.sectionItems.forEach((item: any) => {
              this.newweightageArray.push(item.weightage);
            });

            // Create FormGroup for each section
            const sectionGroup = this.fb.group({
              id: [section.id],
              sectionName: [section.sectionName, Validators.required],
              weightage: this.newweightageArray.at(
                this.weightageArray.length - 1
              ),
              sectionType: [section.sectionType],
              order: [section.order],
              questions: questionsArray,
            });

            this.viewSections.push(sectionGroup);
          });
        },
        error: (err) => console.error(err),
      });
  }

  get viewSections(): FormArray {
    return this.viewForm.get('sections') as FormArray;
  }

  removeViewSection(index: number) {
    this.viewSections.removeAt(index);
  }

  getViewQuestions(sectionIndex: number): FormArray {
    return this.viewSections.at(sectionIndex).get('questions') as FormArray;
  }

  removeViewQuestion(sectionIndex: number, questionIndex: number) {
    this.getViewQuestions(sectionIndex).removeAt(questionIndex);
  }

  getViewOptions(sectionIndex: number, questionIndex: number): FormArray {
    return this.getViewQuestions(sectionIndex)
      .at(questionIndex)
      .get('options') as FormArray;
  }

  removeCreateOption(
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number
  ) {
    this.getViewOptions(sectionIndex, questionIndex).removeAt(optionIndex);
  }

  getViewOptionControl(
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number
  ): FormControl {
    return this.getViewOptions(sectionIndex, questionIndex)
      .at(optionIndex)
      .get('option') as FormControl;
  }

  backToTableView() {
    this.location.back();
    this.modalService.dismissAll();
  }

  openModal(content: any, options: any = { size: 'lm', centered: true }) {
    this.modalService.open(content, options);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}