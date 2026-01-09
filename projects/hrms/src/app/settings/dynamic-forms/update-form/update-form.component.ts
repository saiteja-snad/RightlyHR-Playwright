import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray, ValidationErrors, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalConfig, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IDynamicForm, IRatingScale } from '../../../Interfaces/dynamic-forms.model';
import { HttpService } from '../../../services/http.service';
import { CommonModule, Location } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { IJob } from '../../../Interfaces/letters-model';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-update-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAccordionModule,
    DragDropModule,
    SelectModule,
    NgbPopoverModule,
    TranslateModule
  ],
  templateUrl: './update-form.component.html',
  styleUrl: './update-form.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class UpdateFormComponent implements OnInit, OnDestroy {
  updateForm!: FormGroup;
  formStatus = '';
  modules: any[] = environment.modules;
  questionTypes = [
    { value: 'text', label: 'Text' },
    { value: 'text area', label: 'Text Area' },
    { value: 'boolean', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Check Box' },
    { value: 'rating', label: 'Rating' }
  ];
  sectionTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'rating', label: 'Rating' }
  ];
  uniqueRatingScaleRanges: { minimum: number, maximum: number }[] = [];
  updateDetails = {} as IDynamicForm;
  @ViewChildren('sectionElement') sectionElements!: QueryList<ElementRef>;
  successMessage!: string;
  formId!: number;
  weightageArray: any[] = [];
  ratingScaleTypes!: IRatingScale[];
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  sectionDetails: any;
  filteredRatingScaleTypes: IRatingScale[] = [];
  showModuleField = false;
  ratingScaleTypeArray = [] as any;
  empinfo = {} as IJob;

  constructor(private fb: FormBuilder,
    private location: Location,
    private http: HttpService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private router: Router,
    private sharedModalService: OpenModalService,
     public formsValidations:FormValidationsService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateDetails.employeeId = this.empinfo.employeeId;
    this.updateForm = this.fb.group({
      formHeader: ['', [Validators.required, Validators.maxLength(255),this.formNameValidator()]],
      moduleId: ['', Validators.required],
      cutOffRating: [null],
      overAllRating: [null],
      formId: [null, Validators.required],
      createdBy: [null, Validators.required],
      ratingScaleRange: [null],
      updatedBy: [null, Validators.required],
      status: ['', Validators.required],
      meta: [''],
      sectionId: [null, Validators.required],
      formHeaderId: [null, Validators.required],
      sections: this.fb.array([this.createSection()])
    }, { validators: [this.atLeastOneSectionValidator(), this.atLeastOneQuestionInSectionValidator(), this.cutOffRatingLessThanOverallRating, this.weightageValidator()] });
    this.formId = history.state.formId;
    this.handleOptionWeightageValidation();
    this.updateFormDetails(this.formId)
    this.getAllRatingScaleTypes();
  }

  // Method to toggle validators based on moduleId
  toggleRatingValidators(moduleId: any): void {
    const cutOffRating = this.updateForm.get('cutOffRating');
    const overAllRating = this.updateForm.get('overAllRating');
    
    if (moduleId === 33) {
      // For moduleId 33, clear all validators
      cutOffRating?.clearValidators();
      overAllRating?.clearValidators();
    } else if (moduleId !== 24) {
      cutOffRating?.setValidators([Validators.required, Validators.min(1)]);
      overAllRating?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      cutOffRating?.clearValidators();
      overAllRating?.clearValidators();
    }
    
    cutOffRating?.updateValueAndValidity();
    overAllRating?.updateValueAndValidity();
  }

  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  weightageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const formGroup = control as FormGroup;
      const moduleId = formGroup.get('moduleId')?.value?.id;
      const overAllRating = formGroup.get('overAllRating')?.value;
      const sections = formGroup.get('sections') as FormArray;
      
      if (!sections || sections.length === 0) {
        return null;
      }
      
      // Skip validation for moduleId 33
      if (moduleId === 33) {
        return null;
      }
      
      if (moduleId === 20 || moduleId === '20') {
        const isValid = sections.controls.every(section => {
          const weightage = section.get('weightage')?.value || 0;
          return weightage <= overAllRating;
        });
        return isValid ? null : { weightageGreaterThanOverall: true };
      } else if (moduleId === '24' || moduleId === 24) {
        let errors: any = {};
        const totalWeightage = sections.controls.reduce((sum, section) => {
          const weightage = section.get('weightage')?.value || 0;
          return sum + weightage;
        }, 0);
        if (totalWeightage !== 100) {
          errors.weightageNotEqualTo100 = true;
        }
        sections.controls.forEach((section, index) => {
          const questions = section.get('questions')?.value || [];
          const sectionQuestionWeightage = questions.reduce((sum: any, question: { questionWeightage: any; }) => {
            return sum + (question.questionWeightage || 0);
          }, 0);
          if (sectionQuestionWeightage !== 100) {
            errors[`section${index}QuestionWeightageNotEqualTo100`] = true;
          }
        });
        return Object.keys(errors).length ? errors : null;
      }
      return null;
    };
  }

  formNameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
  
      if (!value) {
        return { whitespace: true }; // Empty or only spaces
      }
  
      // Check if value contains at least one letter or number
      if (!/[a-zA-Z0-9]/.test(value)) {
        return { onlySpecialChars: true }; // Only special characters
      }
  
      return null;
    };
  }

  atLeastOneQuestionInSectionValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const sections = (formGroup as FormGroup).get('sections') as FormArray;
      // Check if sections is valid and of the correct type
      if (!sections || !(sections instanceof FormArray)) {
        return { 'atLeastOneQuestionInSection': true };
      }
      let valid = true;
      // Explicitly type section as FormGroup
      sections.controls.forEach((section: AbstractControl) => {
        const sectionGroup = section as FormGroup;
        const questions = sectionGroup.get('questions') as FormArray;
        if (!questions || !(questions instanceof FormArray) || questions.length === 0) {
          valid = false;
        }
      });
      return valid ? null : { 'atLeastOneQuestionInSection': true };
    };
  }

  onModuleChange(module?: any): void {
    if (module?.id === 24) {
      // Clear validators and reset fields for module ID 24
      this.updateForm.get('overAllRating')?.clearValidators();
      this.updateForm.get('cutOffRating')?.clearValidators();
      this.updateForm.get('overAllRating')?.reset();
      this.updateForm.get('cutOffRating')?.reset();
    } else if (module?.id === 20) {
      this.updateForm.get('cutOffRating')?.setValidators([Validators.required]);
      this.updateForm.get('overAllRating')?.setValidators([Validators.required]);
    } else if (module?.id === 33) {
      this.clearModule33Validators();
    }
    // Update form validity
    this.updateForm.get('overAllRating')?.updateValueAndValidity();
    this.updateForm.get('cutOffRating')?.updateValueAndValidity();
  }

  private clearModule33Validators(): void {
    // Clear root-level validators
    this.updateForm.get('overAllRating')?.clearValidators();
    this.updateForm.get('cutOffRating')?.clearValidators();
    this.updateForm.get('ratingScaleRange')?.clearValidators();
    this.updateForm.get('overAllRating')?.reset();
    this.updateForm.get('cutOffRating')?.reset();
    this.updateForm.get('ratingScaleRange')?.reset();

    const sections = this.updateForm.get('sections') as FormArray;
    sections.controls.forEach(section => {
      section.get('sectionType')?.setValue('normal');
      section.get('weightage')?.clearValidators();
      section.get('weightage')?.reset();
      section.get('ratingScaleType')?.clearValidators();
      section.get('ratingScaleType')?.reset();

      const questions = section.get('questions') as FormArray;
      questions.controls.forEach(question => {
        question.get('questionWeightage')?.clearValidators();
        question.get('questionWeightage')?.reset();
        question.get('questionWeightage')?.updateValueAndValidity();
      });
      
      section.get('weightage')?.updateValueAndValidity();
      section.get('ratingScaleType')?.updateValueAndValidity();
    });
  }

  restrictToNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');  // Remove non-numeric characters
  }

  onDropSection(event: CdkDragDrop<string[]>) {
    const sections = this.updateForm.get('sections') as FormArray;
    moveItemInArray(sections.controls, event.previousIndex, event.currentIndex);
    sections.controls.forEach((section, index) => {
      section.get('order')?.setValue(index);
    });
  }

  onDropQuestion(event: CdkDragDrop<string[]>, sectionIndex: number) {
    const questions = this.getUpdateQuestions(sectionIndex);
    moveItemInArray(questions.controls, event.previousIndex, event.currentIndex);
    questions.controls.forEach((question, index) => {
      question.get('order')?.setValue(index);
    });
  }

  cutOffRatingLessThanOverallRating(group: AbstractControl): { [key: string]: boolean } | null {
    const overallRating = group.get('overAllRating')?.value;
    const cutOffRating = group.get('cutOffRating')?.value;
    if (cutOffRating !== null && overallRating !== null && cutOffRating > overallRating) {
      return { cutOffGreaterThanOverall: true };
    }
    return null;
  }

  toggleRequired(sectionIndex: number, questionIndex: number, event: Event) {
    const control = this.getUpdateQuestions(sectionIndex).at(questionIndex).get('question');
    if ((event.target as HTMLInputElement).checked) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }

  // Method to toggle edit mode
  editSection(sectionIndex: number) {
    const section = this.updateSections.at(sectionIndex) as FormGroup;
    section.get('isEditing')?.setValue(true); // Enable editing
  }

  // Method to finish editing and switch back to display mode
  finishEditingSection(sectionIndex: number) {
    const section = this.updateSections.at(sectionIndex) as FormGroup;
    section.get('isEditing')?.setValue(false); // Disable editing
  }

  calculateTotalQuestionWeightage(sectionIndex: number): number {
    const questions = this.getUpdateQuestions(sectionIndex).controls;
    return questions.reduce((total, question) => {
      const questionWeightage = question.get('questionWeightage')?.value || 0;
      return total + questionWeightage;
    }, 0);
  }

  setRatingScaleTypeValidator(section: FormGroup) {
    const ratingScaleTypeControl = section.get('ratingScaleType');
    if (section.get('type')?.value === 'rating') {
      ratingScaleTypeControl?.setValidators([Validators.required]);
    } else {
      ratingScaleTypeControl?.clearValidators();
    }
    ratingScaleTypeControl?.updateValueAndValidity();
  }

  onSectionTypeChange(section: any) {
    this.setRatingScaleTypeValidator(section);
    const sectionIndex = this.updateSections.controls.findIndex(s => s === section);
    this.updateQuestionTypes(sectionIndex);
    this.updateSections.get('ratingScaleType')?.setValue('');
    // Update question types based on the current section type
  }

  // Method to dynamically update the question type based on section type change
  updateQuestionTypes(sectionIndex: number) {
    const section = this.updateSections.at(sectionIndex) as FormGroup;
    const questions = this.getUpdateQuestions(sectionIndex);
    // Iterate through each question and update its validators based on section type
    questions.controls.forEach((question: any) => {
      const sectionType = section.get('sectionType')?.value;
      question.get('type')?.setValidators(sectionType === 'normal' ? [Validators.required] : []);
      // question.get('unitofmeasurement')?.setValidators(sectionType === 'rating' ? [Validators.required] : []);
      // question.get('target')?.setValidators(sectionType === 'rating' ? [Validators.required] : []);
      question.get('type')?.updateValueAndValidity();
      // question.get('unitofmeasurement')?.updateValueAndValidity();
      // question.get('target')?.updateValueAndValidity();
    });
  }

  validateTotalWeightage(sectionIndex: number): boolean {
    const sectionWeightage = this.updateSections.at(sectionIndex).get('weightage')?.value || 0;
    const totalQuestionWeightage = this.calculateTotalQuestionWeightage(sectionIndex);
    // Only show error when all question weightages have been entered
    const allQuestionsHaveWeightage = this.getUpdateQuestions(sectionIndex).controls.every(question => question.get('questionWeightage')?.value);
    return allQuestionsHaveWeightage && totalQuestionWeightage > sectionWeightage;
  }

  removeUpdateSection(index: number) {
    this.updateSections.removeAt(index);
    this.updateSectionOrders();
  }

  handleOptionWeightageValidation() {
    this.updateSections.controls.forEach((sectionGroup: any) => {
      const questions = sectionGroup.get('questions') as FormArray;
      questions.controls.forEach((questionGroup: any) => {
        const typeControl = questionGroup.get('type');
        const optionWeightageControl = questionGroup.get('optionWeightage');
        typeControl?.valueChanges.subscribe((value: string) => {
          if (value === 'text area') {
            // Add required and min validators
            optionWeightageControl?.setValidators([Validators.required, Validators.min(1)]);
          } else {
            // Remove all validators
            optionWeightageControl?.clearValidators();
          }
          // Update the value and validity to apply the new validators
          optionWeightageControl?.updateValueAndValidity();
        });
      });
    });
  }

  get updateSections(): FormArray {
    return this.updateForm.get('sections') as FormArray;
  }

  // Method to add a new section
  addUpdateSection() {
    const isModule33 = this.updateForm?.get('moduleId')?.value?.id === 33;
    const weightageValidators = isModule33 ? [] : [Validators.required, Validators.min(1)];
    
    const sectionGroup = this.fb.group({
      id: [null],
      sectionName: ['', [Validators.required, Validators.maxLength(255), this.formNameValidator()]],
      sectionType: [isModule33 ? 'normal' : '', Validators.required],
      ratingScaleType: [null, Validators.required],
      order: [0],
      weightage: [null, weightageValidators],
      questions: this.fb.array([this.createQuestion('')])
    });
    
    if (isModule33) {
      this.applyModule33ValidatorsToSection(sectionGroup);
    }
    
    this.updateSections.push(sectionGroup);
    this.updateSectionOrders();
    setTimeout(() => {
      this.scrollToLastSection();
    }, 0);
  }

  private applyModule33ValidatorsToSection(section: FormGroup): void {
    section.get('sectionType')?.setValue('normal');
    section.get('weightage')?.clearValidators();
    section.get('ratingScaleType')?.clearValidators();
    
    const questions = section.get('questions') as FormArray;
    questions.controls.forEach(question => {
      question.get('questionWeightage')?.clearValidators();
      question.get('questionWeightage')?.updateValueAndValidity();
    });
    
    section.get('weightage')?.updateValueAndValidity();
    section.get('ratingScaleType')?.updateValueAndValidity();
  }

  scrollToLastSection() {
    const lastSection = this.sectionElements.last; // Get the last section
    if (lastSection) {
      lastSection.nativeElement.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly to the last section
    }
  }

  // Method to create a new question form group
  createQuestion(sectionType: string): FormGroup {
    const isModule33 = this.updateForm?.get('moduleId')?.value?.id === 33;
    const typeValidators = sectionType === 'normal' ? [Validators.required] : [];
    const weightageValidators = isModule33 ? [] : [Validators.required, Validators.min(1)];
    
    const questionGroup = this.fb.group({
      id: [null],
      description: [''],
      type: ['', typeValidators],
      question: ['', [Validators.required, Validators.maxLength(1000)]],
      options: this.fb.array([]),
      order: [0],
      required: [false, Validators.required],
      questionWeightage: [null, weightageValidators],
    });
    
    questionGroup.get('type')?.valueChanges.subscribe((questionType: any) => {
      this.updateOptionsValidation(questionGroup, questionType);
    });
    return questionGroup;
  }

  selectType(type: any, sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    question.get('type')?.setValue(type.value);
    // Reset the options if the type is changed to checkbox or boolean
    if (type.value === 'checkbox' || type.value === 'boolean') {
      const optionsArray = question.get('options') as FormArray;
      // Clear existing options
      while (optionsArray.length) {
        optionsArray.removeAt(0);
      }
      // Add a default option
      this.addUpdateOption(sectionIndex, questionIndex);
    }
  }

  // Method to add a question to a section
  addUpdateQuestion(sectionIndex: number) {
    const questionGroup = this.createQuestion('');
    
    // Apply module 33 validators if needed
    if (this.updateForm?.get('moduleId')?.value?.id === 33) {
      questionGroup.get('questionWeightage')?.clearValidators();
      questionGroup.get('questionWeightage')?.updateValueAndValidity();
    }
    
    this.getUpdateQuestions(sectionIndex).push(questionGroup);
  }

  // Method to remove a question from a section
  removeUpdateQuestion(sectionIndex: number, questionIndex: number) {
    this.getUpdateQuestions(sectionIndex).removeAt(questionIndex);
  }

  // Method to get the questions FormArray for a section
  getUpdateQuestions(sectionIndex: number): FormArray {
    return this.updateSections.at(sectionIndex).get('questions') as FormArray;
  }

  addSection() {
    const newSection = this.createSection();
    newSection.patchValue({ order: this.updateSections.length }); // Set the order dynamically
    this.updateSections.push(newSection);
    this.updateSectionOrders(); // Update order for all sections
  }

  updateSectionOrders() {
    this.updateSections.controls.forEach((section, index) => {
      section.patchValue({ order: index }); // Set the order based on current index
    });
  }

  removeSection(index: number) {
    this.updateSections.removeAt(index);
    this.updateSectionOrders(); // Recalculate order after removal
  }

  // Method to add an option to a question
  addUpdateOption(sectionIndex: number, questionIndex: number) {
    const questionGroup = this.getUpdateQuestions(sectionIndex).at(questionIndex) as FormGroup;
    const optionsArray = questionGroup.get('options') as FormArray;
    const optionGroup = this.fb.group({
      optionId: [''],
      option: [''],
      isDefault: [false],
      optionWeightage: [null],
      createdBy: [''],
      updatedBy: [''],
      meta: ['']
    });
    optionsArray.push(optionGroup);
    // Apply validation based on the question type
    const questionType = questionGroup.get('type')?.value;
    this.updateOptionsValidation(questionGroup, questionType);
  }

  // Method to remove an option from a question
  removeUpdateOption(sectionIndex: number, questionIndex: number, optionIndex: number) {
    const optionsArray = this.getUpdateOptions(sectionIndex, questionIndex);
    optionsArray.removeAt(optionIndex);
  }

  // Method to get the options FormArray for a question
  getUpdateOptions(sectionIndex: number, questionIndex: number): FormArray {
    return this.getUpdateQuestions(sectionIndex).at(questionIndex).get('options') as FormArray;
  }

  // Method to update validation on options based on question type
  updateOptionsValidation(questionGroup: FormGroup, questionType: string) {
    const optionsArray = questionGroup.get('options') as FormArray;
    if (questionType !== 'text area') {
      optionsArray.controls.forEach((optionControl) => {
        optionControl.get('option')?.setValidators([Validators.required]);
        optionControl.get('option')?.updateValueAndValidity();
      });
    } else {
      optionsArray.controls.forEach((optionControl) => {
        optionControl.get('option')?.clearValidators();
        optionControl.get('option')?.updateValueAndValidity();
      });
    }
  }

  getRatingScaleOptions(ratingType: string | null): { scale: number; description: string }[] | null {
    // Check if ratingScaleTypes is available
    if (!this.ratingScaleTypes) {
      return null;
    }
    const selectedRatingType = this.ratingScaleTypes.find((scale) => scale.ratingType === ratingType);
    return selectedRatingType ? selectedRatingType.scales : null;
  }

  atLeastOneSectionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sections = control.get('sections') as FormArray;
      return sections && sections.length > 0 ? null : { noSections: true };
    };
  }

  atLeastOneQuestionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const questions = control.get('questions') as FormArray;
      return questions && questions.length > 0 ? null : { noQuestions: true };
    };
  }

  getQuestionTypeLabel(value: string) {
    const type = this.questionTypes.find(type => type.value === value);
    return type ? type.label : null;
  }

  getPopoverMessage(sectionIndex: number, questionIndex: number): string {
    const isRequired = this.getUpdateQuestions(sectionIndex).at(questionIndex).get('required')?.value;
    return isRequired ? 'Mark question as not required' : 'Mark question as required';
  }

  removeFormData() {
    this.modalService.dismissAll()
    this.updateForm.reset();
  }

  onRatingScaleRangeChange(event: any): void {
    const selectedValue = event.value; // This is an object: { minimum: number, maximum: number }
    if (selectedValue) {
      const { minimum: selectedMinimum, maximum: selectedMaximum } = selectedValue;
      // Reset ratingScaleType in each section
      const sectionsArray = this.updateForm.get('sections') as FormArray;
      sectionsArray.controls.forEach((section) => {
        const ratingScaleTypeControl = section.get('ratingScaleType') as FormControl;
        if (ratingScaleTypeControl) {
          ratingScaleTypeControl.setValue(null, { emitEvent: false });
        }
      });
      // Reset top-level ratingScaleType (if exists)
      const ratingScaleTypeControl = this.updateForm.get('ratingScaleType') as FormControl;
      if (ratingScaleTypeControl) {
        ratingScaleTypeControl.setValue(null, { emitEvent: false });
      }
      // Filter rating scale types
      this.filteredRatingScaleTypes = this.ratingScaleTypes.filter(
        (type) => type.minimumRatingScale === selectedMinimum && type.maximumRatingScale === selectedMaximum);
    } else {
      this.filteredRatingScaleTypes = [];
    }
  }

  createSection(): FormGroup {
    const isModule33 = this.updateForm?.get('moduleId')?.value?.id === 33;
    const weightageValidators = isModule33 ? [] : [Validators.required, Validators.min(1)];
    
    return this.fb.group({
      sectionName: ['', [Validators.required, Validators.maxLength(255), this.formNameValidator()]],
      sectionType: [isModule33 ? 'normal' : '', [Validators.required]],
      order: [0],
      ratingScaleType: [null],
      weightage: [null, weightageValidators],
      questions: this.fb.array([this.createQuestion('')])
    });
  }

  onRatingScaleTypeChange(event: Event): void {
    const selectedValue = (event?.target as HTMLSelectElement);
  }

  assignValuestoUpdateForm(data: any) {
    // Handle ratingScaleRange for moduleId 33 (might be null/undefined)
    let min = 0, max = 0;
    if (data.ratingScaleRange) {
      [min, max] = data.ratingScaleRange.split('-').map(Number);
    }
    
    this.updateForm.patchValue({
      formHeader: data.formName,
      formId: data.formId,
      moduleId: this.modules.find((module) => module.id === data.moduleId),
      createdBy: data.createdBy,
      updatedBy: this.updateDetails.employeeId,
      ratingScaleRange: data.ratingScaleRange ? this.uniqueRatingScaleRanges.find(
        (ratingScale) =>
          ratingScale.minimum === min && ratingScale.maximum === max
      ) : null,
      status: data.status,
      meta: data.meta,
      overAllRating: data.overAllRating || null,
      cutOffRating: data.cutOffRating || null,
      sectionId: data.sectionId,
      formHeaderId: data.formHeaderId,
    });
    
    // Set ratingScaleRange validator based on moduleId
    if (data.moduleId !== 33) {
      this.updateForm.get('ratingScaleRange')?.setValidators([Validators.required]);
    } else {
      this.updateForm.get('ratingScaleRange')?.clearValidators();
    }
    this.updateForm.get('ratingScaleRange')?.updateValueAndValidity();
    
    // Apply moduleId 33 handling after setting moduleId
    if (data.moduleId === 33) {
      this.clearModule33Validators();
    }
    
    // Handle filteredRatingScaleTypes for moduleId 33
    if (data.ratingScaleRange) {
      const [selectedMinimum, selectedMaximum] = data.ratingScaleRange.split('-').map(Number);
      this.filteredRatingScaleTypes = this.ratingScaleTypes?.filter((type) => type.minimumRatingScale === selectedMinimum &&
        type.maximumRatingScale === selectedMaximum) || [];
    } else {
      this.filteredRatingScaleTypes = [];
    }
    
    const sectionsArray = this.updateForm.get('sections') as FormArray;
    sectionsArray.clear();
    
    data.sectionDetails.forEach((section: any, sectionIndex: number) => {
      const questionsArray = this.fb.array<FormGroup>([]);
      section.questions.forEach((question: any) => {
        const optionsArray = this.fb.array<FormGroup>([]);
        if (Array.isArray(question.options)) {
          question.options.forEach((option: any) => {
            if (typeof option === 'object') {
              const optionGroup = this.fb.group({
                optionId: [option.optionId],
                option: [option.option],
                isDefault: [option.isDefault],
                optionWeightage: [option.optionWeightage.toString()],
                createdBy: [this.updateDetails.employeeId],
                updatedBy: [this.updateDetails.employeeId],
                meta: [option.meta]
              });
              optionsArray.push(optionGroup);
            }
          });
        }
        section.sectionItems.forEach((item: any) => {
          this.weightageArray.push(item.weightage);
        });
        
        const isModule33 = data.moduleId === 33;
        const questionWeightageValidators = isModule33 ? [] : [Validators.required, Validators.min(1)];
        
        const questionGroup = this.fb.group({
          id: [question.id],
          question: [question.question, [Validators.required, Validators.maxLength(1000)]],
          description: [question.description],
          type: [question.type],
          order: [question.order],
          required: [question.required],
          questionWeightage: [question.questionWeightage, questionWeightageValidators],
          createdBy: question.createdBy || this.updateDetails.createdBy,
          options: optionsArray,
        });
        
        if (section.sectionType === 'normal') {
          questionGroup.get('type')?.setValidators([Validators.required]);
        } else {
          questionGroup.get('type')?.clearValidators();
        }
        questionGroup.get('type')?.updateValueAndValidity();
        questionsArray.push(questionGroup);
      });
      
      let ratingScaleType = null;
      if (section.sectionType === 'rating' && section.questions.length > 0) {
        ratingScaleType = section.questions[0].type;
      }
      
      const isModule33 = data.moduleId === 33;
      const sectionWeightageValidators = isModule33 ? [] : [Validators.required, Validators.min(1)];
      
      const sectionGroup = this.fb.group({
        id: [section.id],
        order: [section.order],
        sectionName: [section.sectionName, [Validators.required, Validators.maxLength(255), this.formNameValidator()]],
        sectionType: section.sectionType,
        ratingScaleType: [ratingScaleType],
        weightage: [Number(this.weightageArray.at(this.weightageArray.length - 1)), sectionWeightageValidators],
        questions: questionsArray,
        createdBy: section.createdBy || this.updateDetails.createdBy,
      });
      
      if (section.sectionType === 'rating') {
        sectionGroup.get('ratingScaleType')?.setValidators([Validators.required]);
      } else {
        sectionGroup.get('ratingScaleType')?.clearValidators();
      }
      sectionsArray.push(sectionGroup);
    });
    
    // Debug form validity for moduleId 33
    if (data.moduleId === 33) {
      setTimeout(() => {
        this.checkFormValidity();
      }, 100);
    }
  }

  // Debug method to check form validity
  checkFormValidity() {
    console.log('Form valid:', this.updateForm.valid);
    console.log('Form errors:', this.updateForm.errors);
    
    Object.keys(this.updateForm.controls).forEach(key => {
      const control = this.updateForm.get(key);
      if (control && control.errors) {
        console.log(`${key} errors:`, control.errors);
      }
    });
    
    const sections = this.updateForm.get('sections') as FormArray;
    sections.controls.forEach((section, sIndex) => {
      if (section.errors) {
        console.log(`Section ${sIndex} errors:`, section.errors);
      }
      Object.keys(section.value).forEach(key => {
        const control = section.get(key);
        if (control && control.errors) {
          console.log(`Section ${sIndex} ${key} errors:`, control.errors);
        }
      });
      
      const questions = section.get('questions') as FormArray;
      questions.controls.forEach((question, qIndex) => {
        if (question.errors) {
          console.log(`Section ${sIndex} Question ${qIndex} errors:`, question.errors);
        }
        Object.keys(question.value).forEach(key => {
          const control = question.get(key);
          if (control && control.errors) {
            console.log(`Section ${sIndex} Question ${qIndex} ${key} errors:`, control.errors);
          }
        });
      });
    });
  }

  isDraftType = false;
  onSaveSubmit() {
    this.isDraftType = true;
    console.log(this.updateForm);
    
    if (this.updateForm.valid) {
      const selectedRange = this.updateForm.value.ratingScaleRange;
      this.updateDetails.ratingScaleRange = selectedRange ? `${selectedRange.minimum}-${selectedRange.maximum}` : null;
      this.updateDetails.formName = this.updateForm.value.formHeader;
      this.updateDetails.moduleId = Number(this.updateForm.value.moduleId.id);
      this.updateDetails.overAllRating = this.updateForm.value.overAllRating;
      this.updateDetails.cutOffRating = this.updateForm.value.cutOffRating;
      this.updateDetails.createdBy = this.updateForm.value.createdBy;
      this.updateDetails.updatedBy = this.updateDetails.employeeId;
      this.updateDetails.formId = this.updateForm.value.formId;
      this.updateDetails.sectionId = this.updateForm.value.sectionId;
      this.updateDetails.formHeaderId = this.updateForm.value.formHeaderId;
      this.updateDetails.status = "draft"
      this.updateDetails.sectionDetails = this.convertUpdateOptionsArray(this.updateForm.value.sections);
      this.http.postData(`Form/SubmitFormDetails`, this.updateDetails, { responseType: 'text' }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.openSuccessModal('draft');
          setTimeout(() => {
            if (this.formStatus === 'draft') {
              // Stay on the same page by reloading the current page
              // location.reload();
              this.router.navigate(['/settings/dynamic-forms/draft-forms'])
            } else {
              // Navigate to the forms tab for any other status
              this.router.navigate(['/settings/dynamic-forms/active-forms']);
            }
          }, 1000);
          this.isDraftType = false;
        }, error: (error) => {
          console.log(error);
        }
      });
    }
  }

  updateFormDetails(formId: number) {
    this.http.getData(`Form/getFormDetailsByFormId/${formId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.assignValuestoUpdateForm(data);
        // Set formStatus based on fetched data
        this.toggleRatingValidators(data.moduleId);
        this.formStatus = data.status;
      },
      error: (err) => console.error(err)
    });
  }

  onUpdate(formStatus: string) {
    if (this.updateForm.valid) {
      const selectedRange = this.updateForm.value.ratingScaleRange;
      this.updateDetails.ratingScaleRange = selectedRange ? `${selectedRange.minimum}-${selectedRange.maximum}` : null;
      this.updateDetails.formName = this.updateForm.value.formHeader;
      this.updateDetails.formId = this.updateForm.value.formId;
      this.updateDetails.sectionId = this.updateForm.value.sectionId;
      this.updateDetails.formHeaderId = this.updateForm.value.formHeaderId;
      this.updateDetails.createdBy = this.updateForm.value.createdBy
      this.updateDetails.updatedBy = this.updateDetails.employeeId;
      this.updateDetails.status = 'active'
      this.updateDetails.moduleId = Number(this.updateForm.value.moduleId.id);
      this.updateDetails.overAllRating = this.updateForm.value.overAllRating;
      this.updateDetails.cutOffRating = this.updateForm.value.cutOffRating;
      this.updateDetails.sectionDetails = this.convertUpdateOptionsArray(this.updateForm.value.sections);
      this.http.postData(`Form/SubmitFormDetails`, this.updateDetails, { responseType: 'text' }).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.openSuccessModal(formStatus);
          setTimeout(() => {
            if (this.formStatus === 'draft') {
              // Stay on the same page by reloading the current page
              // location.reload();
              this.router.navigate(['/settings/dynamic-forms/draft-forms'])
            } else {
              // Navigate to the forms tab for any other status
              this.router.navigate(['/settings/dynamic-forms/active-forms']);
            }
          }, 1000);
        }, error: (error) => {
          console.log(error);
          this.sharedModalService.openErrorModal(error.error);
        }
      });
    }
  }

  getAllRatingScaleTypes() {
    this.http.getData("Form/getallratings").subscribe({
      next: (data: any) => {
        this.ratingScaleTypes = data as IRatingScale[];
        this.uniqueRatingScaleRanges = [
          ...new Map(
            this.ratingScaleTypes.filter(type => type.minimumRatingScale != null && type.maximumRatingScale != null) // Ensure minimum and maximum are defined
              .map(type => [`${type.minimumRatingScale}-${type.maximumRatingScale}`,
              { minimum: type.minimumRatingScale!, maximum: type.maximumRatingScale! }]) // Use non-null assertion
          ).values()
        ];
      }
    })
  }

  validateInput(control: AbstractControl | null) {
    if (!control) return; // Ensure control exists
    let value = control.value || ''; // Ensure value is a string
    // Remove leading spaces
    value = value.replace(/^\s+/, '');
    // Prevent starting with special characters
    if (/^[^a-zA-Z0-9]/.test(value)) {
      value = value.replace(/^[^a-zA-Z0-9]+/, '');
    }
    control.setValue(value, { emitEvent: false });
    control.updateValueAndValidity()
  }


  convertUpdateOptionsArray(sections: any[]): any[] {
    const isModule33 = this.updateForm.get('moduleId')?.value?.id === 33;
    
    return sections.map(section => {
      const sectionObj: any = {
        sectionName: section.sectionName,
        sectionType: section.sectionType,
        status: 'Active',
        order: section.order,
        createdBy: this.updateDetails.employeeId,
        updatedBy: this.updateDetails.employeeId,
        questions: section.questions.map((question: any) => {
          const questionObj: any = {
            type: section.sectionType === 'rating' ? section.ratingScaleType : question.type,
            required: question.required,
            question: question.question,
            order: question.order,
            questionWeightage: isModule33 ? 0 : (question.questionWeightage || 0),
            status: 'Active',
            createdBy: this.updateDetails.employeeId,
            updatedBy: this.updateDetails.employeeId,
            options: question.options.map((option: any) => {
              const optionObj: any = {
                option: option.option,
                isDefault: false,
                optionWeightage: '0',
                createdBy: this.updateDetails.employeeId,
                updatedBy: this.updateDetails.employeeId,
                meta: ''
              };
              if (option.optionId) {
                optionObj.optionId = option.optionId;
              }
              return optionObj;
            })
          };
          
          if (question.id) {
            questionObj.id = question.id;
            questionObj.createdBy = question.createdBy
          }
          
          if (section.sectionType === 'rating') {
            const ratingScaleOptions = this.getRatingScaleOptions(section.ratingScaleType);
            if (ratingScaleOptions) {
              questionObj.options = ratingScaleOptions.map(scale => ({
                option: scale.description,
                isDefault: false,
                optionWeightage: scale.scale.toString(),
                createdBy: this.updateDetails.employeeId,
                updatedBy: this.updateDetails.employeeId,
                meta: ''
              }));
            }
          } else {
            questionObj.options = question.options.map((option: any) => ({
              option: option.option,
              isDefault: false,
              optionWeightage: '0',
              createdBy: this.updateDetails.employeeId,
              updatedBy: this.updateDetails.employeeId,
              meta: ''
            }));
          }
          return questionObj;
        }),
        sectionItems: [
          {
            weightage: isModule33 ? 0 : (section.weightage || 0),
            status: "Active",
            createdBy: this.updateDetails.employeeId,
            updatedBy: this.updateDetails.employeeId,
            meta: "Weightage"
          }
        ]
      };
      
      if (section.id) {
        sectionObj.id = section.id;
        sectionObj.createdBy = section.createdBy;
        sectionObj.sectionItems[0].sectionHeaderId = section.id;
        sectionObj.sectionItems[0].createdBy = section.createdBy;
      }

      return sectionObj;
    });
  }

  openModal(content: any, options: any = { size: 'xl', centered: true }) {
    this.modalService.open(content, options);
  }

  statusvalue!: string;
  statuscheck(value: string) {
    if (value?.toLowerCase() === 'active') {
      this.statusvalue = 'Update';
    } else {
      this.statusvalue = 'Submit';
    }
  }

  openSuccessModal(value: string) {
    // Check if formStatus is 'Draft' and set the success message
    if (value === 'update') {
      this.successMessage = 'Form updated successfully';
    } else if (value === 'submit') {
      this.successMessage = 'Form submitted successfully';
    }
    else if (value === 'draft') {
      this.successMessage = 'Form saved as draft';
    }
    this.sharedModalService.openSuccessModal(this.successMessage);
  }

  backToTableView() {
    this.location.back();
    this.modalService.dismissAll();
  }

  isFormInvalid(): boolean {
    return this.isAnySectionWithoutQuestions();
  }

  isAnySectionWithoutQuestions(): boolean {
    return this.updateSections.controls.some((section) => {
      const questions = (section.get('questions') as FormArray).controls;
      return questions.length === 0;
    });
  }

  updateSelectType(type: any, sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    const currentType = question.get('type')?.value;
    // Update question type
    question.get('type')?.setValue(type.value);
    if (type.value === 'text area') {
      // For 'text area', clear existing options and ensure one option with weightage
      this.clearOptions(sectionIndex, questionIndex);
      this.addOptionsForTextArea(sectionIndex, questionIndex);
    } else {
      // For other types, ensure existing options are preserved
      if (currentType === 'text area') {
        // Preserve weightage if it exists and it's being switched to another type
        this.preserveWeightageOnTypeChange(sectionIndex, questionIndex);
      }
    }
  }

  clearOptions(sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;
    // Clear options array
    options.clear();
  }

  addOptionsForTextArea(sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;
    // Add a default option if none exist
    if (options.length === 0) {
      options.push(this.fb.group({
        option: [''],
        optionWeightage: ['', [Validators.required, Validators.min(1)]]
      }));
    }
  }

  preserveWeightageOnTypeChange(sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;
    // Check existing options and if needed, transfer weightage to new options
    if (options.length > 0) {
      // Transfer weightage from existing options
      const weightages = options.controls.map(option => option.get('optionWeightage')?.value);
      // Clear current options
      this.clearOptions(sectionIndex, questionIndex);
      // Add new options for the new type, preserving weightage if applicable
      weightages.forEach(weightage => {
        options.push(this.fb.group({
          option: ['', [Validators.required, Validators.min(1)]],
          optionWeightage: [weightage, [Validators.required, Validators.min(1)]]
        }));
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}