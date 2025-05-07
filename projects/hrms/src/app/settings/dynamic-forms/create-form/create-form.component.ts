import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalConfig, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../../../services/http.service';
import { IDynamicForm, IRatingScale } from '../../../Interfaces/dynamic-forms.model';
import { CommonModule, Location } from '@angular/common';
import { IJob } from '../../../Interfaces/letters-model';
import { SelectModule } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-create-form',
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
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class CreateFormComponent implements OnInit, OnDestroy {
  isSubmitted = false;
  createForm!: FormGroup;
  dynamicForm = {} as IDynamicForm;
  modules: any[] = environment.modules;
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  @ViewChild('navigateToTable') navigateToTable!: TemplateRef<any>;
  successMessage = '';
  destroy$: Subject<boolean> = new Subject<boolean>();
  isDraftType = false;
  uniqueRatingScaleRanges: { minimum: number; maximum: number }[] = [];
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
  empinfo = {} as IJob;
  Validators: any;
  ratingScaleTypes!: IRatingScale[];
  filteredRatingScaleTypes: IRatingScale[] = [];

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private http: HttpService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private route: Router,
    private sharedModalService: OpenModalService,
    public formsValidations:FormValidationsService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.dynamicForm.employeeId = this.empinfo.employeeId;
    this.intializeForm();
    this.getAllRatingScaleTypes();
  }

  intializeForm() {
    this.createForm = this.fb.group(
      {
        formHeader: [
          '',
          [
            Validators.required,
            Validators.maxLength(255),
            this.noWhitespaceValidator(),
            this.formNameValidator(),
          ],
        ],
        moduleId: ['', Validators.required],
        ratingScaleRange: [null, Validators.required],
        cutOffRating: [null, [Validators.min(1)]],
        overAllRating: [null, [Validators.min(1)]],
        sections: this.fb.array([this.createSection()]),
      },
      {
        validators: [
          this.atLeastOneSectionValidator(),
          this.atLeastOneQuestionInSectionValidator(),
          this.cutOffRatingLessThanOverallRating,
          this.weightageValidator(),
        ],
      }
    );
    this.handleOptionWeightageValidation();
  }

  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isWhitespace = (control.value || '').trim() === '';
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
    };
  }

  onModuleChange(module?: any): void {
    if (module?.id === 24) {
      // Clear validators and reset fields for module ID 24
      this.createForm.get('overAllRating')?.clearValidators();
      this.createForm.get('cutOffRating')?.clearValidators();
      this.createForm.get('overAllRating')?.reset();
      this.createForm.get('cutOffRating')?.reset();
    } else if (module?.id === 20) {
      this.createForm.get('cutOffRating')?.setValidators([Validators.required]);
      this.createForm.get('overAllRating')?.setValidators([Validators.required]);
    }
    // Update form validity
    this.createForm.get('overAllRating')?.updateValueAndValidity();
    this.createForm.get('cutOffRating')?.updateValueAndValidity();
  }

  disableKeyboard(event: KeyboardEvent): void {
    // Allow only arrow keys for increment/decrement
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      return; // Allow arrow keys to function
    }
    // Prevent any other key press (including typing numbers)
    event.preventDefault();
  }

  onDropSection(event: CdkDragDrop<string[]>) {
    const sections = this.createForm.get('sections') as FormArray;
    moveItemInArray(sections.controls, event.previousIndex, event.currentIndex);
    sections.controls.forEach((section, index) => {
      section.get('order')?.setValue(index);
    });
  }

  onRatingScaleRangeChange(event: any): void {
    const selectedValue = event.value; // This is an object: { minimum: number, maximum: number }
    if (selectedValue) {
      const { minimum: selectedMinimum, maximum: selectedMaximum } = selectedValue;
      // Reset ratingScaleType in each section
      const sectionsArray = this.createForm.get('sections') as FormArray;
      sectionsArray.controls.forEach((section) => {
        const ratingScaleTypeControl = section.get('ratingScaleType') as FormControl;
        if (ratingScaleTypeControl) {
          ratingScaleTypeControl.setValue(null, { emitEvent: false });
        }
      });
      // Reset top-level ratingScaleType (if exists)
      const ratingScaleTypeControl = this.createForm.get('ratingScaleType') as FormControl;
      if (ratingScaleTypeControl) {
        ratingScaleTypeControl.setValue(null, { emitEvent: false });
      }
      // Filter rating scale types
      this.filteredRatingScaleTypes = this.ratingScaleTypes.filter(
        (type) => type.minimumRatingScale === selectedMinimum &&
          type.maximumRatingScale === selectedMaximum
      );
    } else {
      this.filteredRatingScaleTypes = [];
    }
  }

  // Reorder questions within a section
  onDropQuestion(event: CdkDragDrop<string[]>, sectionIndex: number) {
    const questions = this.getQuestions(sectionIndex);
    moveItemInArray(questions.controls,event.previousIndex,event.currentIndex);
    questions.controls.forEach((question, index) => {
      question.get('order')?.setValue(index);
    });
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
    const sectionIndex = this.sections.controls.findIndex((s) => s === section);
    this.updateQuestionTypes(sectionIndex); // Update question types based on the current section type
    if (sectionIndex) {
      this.createForm.get('ratingScaleType')?.reset();
      this.createForm.get('ratingScaleType')?.reset(null);
    }
  }

  weightageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const formGroup = control as FormGroup; // Assert control as FormGroup
      const moduleId = formGroup.get('moduleId')?.value?.id;
      const overAllRating = formGroup.get('overAllRating')?.value;
      const sections = formGroup.get('sections') as FormArray; // Assert as FormArray
      if (!sections || sections.length === 0) {
        return null; // Return null if no sections exist
      }
      if (moduleId === 20) {
        // Validation logic for module ID 20
        const isValid = sections.controls.every(section => {
          const weightage = section.get('weightage')?.value || 0;
          return weightage <= overAllRating;
        });
        return isValid ? null : { weightageGreaterThanOverall: true };
      } else if (moduleId === 24) {
        let errors: any = {};
        // Calculate total weightage of all sections
        const totalWeightage = sections.controls.reduce((sum, section) => {
          const weightage = section.get('weightage')?.value || 0;
          return sum + weightage;
        }, 0);

        if (totalWeightage !== 100) {
          errors.weightageNotEqualTo100 = true; // Error for total weightage
        }
        // Validate each section's question weightage separately
        sections.controls.forEach((section, index) => {
          const questions = section.get('questions')?.value || [];
          const sectionQuestionWeightage = questions.reduce((sum: any, question: { questionWeightage: any; }) => {
            return sum + (question.questionWeightage || 0);
          }, 0);
          if (sectionQuestionWeightage !== 100) {
            errors[`section${index}QuestionWeightageNotEqualTo100`] = true; // Error for section questions
          }
        });
        return Object.keys(errors).length ? errors : null;
      }
      return null; // Return null for other module IDs
    };
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
    const control = this.getQuestions(sectionIndex).at(questionIndex).get('question');
    if ((event.target as HTMLInputElement).checked) {
      control?.setValidators([Validators.required]);
    } else {
      control?.clearValidators();
    }
    control?.updateValueAndValidity();
  }

  // Method to toggle edit mode
  editSection(sectionIndex: number) {
    const section = this.sections.at(sectionIndex) as FormGroup;
    section.get('isEditing')?.setValue(true); // Enable editing
  }

  // Method to finish editing and switch back to display mode
  finishEditingSection(sectionIndex: number) {
    const section = this.sections.at(sectionIndex) as FormGroup;
    section.get('isEditing')?.setValue(false); // Disable editing
  }

  getQuestionTypeLabel(value: string) {
    const type = this.questionTypes.find((type) => type.value === value);
    return type ? type.label : null;
  }

  selectType(type: any, sectionIndex: number, questionIndex: number) {
    const question = this.getQuestions(sectionIndex).at(questionIndex);
    question.get('type')?.setValue(type.value);
    // Reset the options if the type is changed to checkbox or boolean
    if (type.value === 'checkbox' || type.value === 'boolean') {
      const optionsArray = question.get('options') as FormArray;
      // Clear existing options
      while (optionsArray.length) {
        optionsArray.removeAt(0);
      }
      // Add a default option
      this.addOption(sectionIndex, questionIndex);
    }
  }

  createSection(): FormGroup {
    return this.fb.group({
      sectionName: ['', [Validators.required, Validators.maxLength(255),this.formNameValidator()]],
      type: ['', Validators.required],
      order: [0],
      ratingScaleType: [null],
      weightage: [null, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([this.createQuestion('')]), // Pass an empty string initially
    });
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
  
  
  createQuestion(sectionType: string): FormGroup {
    // Update to get the current section type from the parent form
    const typeValidators =
      sectionType === 'normal' ? [Validators.required] : [];
    const isRatingSection = sectionType === 'rating';
    return this.fb.group({
      type: ['', typeValidators],
      question: ['', [Validators.required, Validators.maxLength(1000)]],
      order: [0],
      isRequired: [false],
      questionWeightage: [null, [Validators.required, Validators.min(1)]],
      // unitofmeasurement: ['', isRatingSection ? [Validators.required] : []],
      // target: [null, isRatingSection ? [Validators.required] : []],
      options: this.fb.array([]),
    });
  }

  // Method to dynamically update the question type based on section type change
  updateQuestionTypes(sectionIndex: number) {
    const section = this.sections.at(sectionIndex) as FormGroup;
    const questions = this.getQuestions(sectionIndex);
    // Iterate through each question and update its validators based on section type
    questions.controls.forEach((question: any) => {
      const sectionType = section.get('type')?.value;
      question.get('type')?.setValidators(sectionType === 'normal' ? [Validators.required] : []);
      // question.get('unitofmeasurement')?.setValidators(sectionType === 'rating' ? [Validators.required] : []);
      // question.get('target')?.setValidators(sectionType === 'rating' ? [Validators.required] : []);
      question.get('type')?.updateValueAndValidity();
      // question.get('unitofmeasurement')?.updateValueAndValidity();
      // question.get('target')?.updateValueAndValidity();
    });
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
  }

  get sections(): FormArray {
    return this.createForm.get('sections') as FormArray;
  }

  addSection() {
    const newSection = this.createSection();
    newSection.patchValue({ order: this.sections.length }); // Set the order dynamically
    this.sections.push(newSection);
    this.updateSectionOrders(); // Update order for all sections
  }

  removeSection(index: number) {
    //this.sections.removeAt(index);
    this.updateSectionOrders(); // Recalculate order after removal
    if (this.sections.controls.length > 1) {
      this.sections.removeAt(index);
    } else {
      console.warn('At least one section must remain.');
    }
  }

  // Method to update section orders dynamically
  updateSectionOrders() {
    this.sections.controls.forEach((section, index) => {
      section.patchValue({ order: index }); // Set the order based on current index
    });
  }

  toggleAccordion(event: Event, sectionIndex: number): void {
    event.stopPropagation(); // Stop propagation so it doesn't toggle the whole header
    // Add logic to expand/collapse the accordion programmatically
  }

  getQuestions(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('questions') as FormArray;
  }

  addQuestion(sectionIndex: number) {
    const newQuestion = this.createQuestion(
      this.sections.at(sectionIndex).get('type')?.value
    );
    const questions = this.getQuestions(sectionIndex);
    newQuestion.patchValue({ order: questions.length }); // Set the question order dynamically
    questions.push(newQuestion);
    this.updateQuestionOrders(sectionIndex); // Update order for all questions in the section
  }

  removeQuestion(sectionIndex: number, questionIndex: number) {
    const questions = this.getQuestions(sectionIndex);
    questions.removeAt(questionIndex);
    this.updateQuestionOrders(sectionIndex); // Recalculate order after removal
  }

  // Method to update question orders dynamically
  updateQuestionOrders(sectionIndex: number) {
    const questions = this.getQuestions(sectionIndex);
    questions.controls.forEach((question, index) => {
      question.patchValue({ order: index }); // Set the order based on current index
    });
  }

  addOption(sectionIndex: number, questionIndex: number) {
    const options = this.getQuestions(sectionIndex).at(questionIndex).get('options') as FormArray;
    options.push(
      this.fb.group({
        option: ['', Validators.required],
        optionWeightage: [null],
      })
    );
  }

  getOptions(sectionIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(sectionIndex).at(questionIndex).get('options') as FormArray;
  }

  // Method to get the option form group control (includes option and optionWeightage)
  getOptionControl(sectionIndex: number, questionIndex: number, optionIndex: number): FormGroup {
    return this.getOptions(sectionIndex, questionIndex).at(optionIndex) as FormGroup;
  }

  // Method to remove an option
  removeOption(sectionIndex: number, questionIndex: number, optionIndex: number) {
    const options = this.getQuestions(sectionIndex).at(questionIndex).get('options') as FormArray;
    options.removeAt(optionIndex);
  }

  // form.component.ts
  getRatingScaleOptions(ratingType: string): { scale: number; description: string }[] | null {
    // Check if ratingScaleTypes is available
    if (!this.ratingScaleTypes) {
      return null;
    }
    const selectedRatingType = this.ratingScaleTypes.find(
      (scale) => scale.ratingType === ratingType
    );
    return selectedRatingType ? selectedRatingType.scales : null;
  }

  handleOptionWeightageValidation() {
    this.sections.controls.forEach((sectionGroup: any) => {
      const questions = sectionGroup.get('questions') as FormArray;
      questions.controls.forEach((questionGroup: any) => {
        const typeControl = questionGroup.get('type');
        const optionWeightageControl = questionGroup.get('optionWeightage');
        typeControl?.valueChanges.subscribe((value: string) => {
          if (value === 'text area') {
            // Add required and min validators
            optionWeightageControl?.setValidators([
              Validators.required,
              Validators.min(1),
            ]);
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

  calculateTotalQuestionWeightage(sectionIndex: number): number {
    const questions = this.getQuestions(sectionIndex).controls;
    return questions.reduce((total, question) => {
      const questionWeightage = question.get('questionWeightage')?.value || 0;
      return total + questionWeightage;
    }, 0);
  }

  validateTotalWeightage(sectionIndex: number): boolean {
    const sectionWeightage = Number(this.sections.at(sectionIndex).get('weightage')?.value) || 0;
    const totalQuestionWeightage = this.calculateTotalQuestionWeightage(sectionIndex);
    // Only show error when all question weightages have been entered
    const allQuestionsHaveWeightage = this.getQuestions(sectionIndex).controls.every((question) => 
      question.get('questionWeightage')?.value);
    return (
      allQuestionsHaveWeightage && totalQuestionWeightage > sectionWeightage
    );
  }

  atLeastOneSectionValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const sections = (formGroup as FormGroup).get('sections') as FormArray;
      return sections && sections.length > 0 ? null : { atLeastOneSection: true };
    };
  }

  atLeastOneQuestionInSectionValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const sections = (formGroup as FormGroup).get('sections') as FormArray;
      // Check if sections is valid and of the correct type
      if (!sections || !(sections instanceof FormArray)) {
        return { atLeastOneQuestionInSection: true };
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
      return valid ? null : { atLeastOneQuestionInSection: true };
    };
  }

  getPopoverMessage(sectionIndex: number, questionIndex: number): string {
    const isRequired = this.getQuestions(sectionIndex).at(questionIndex).get('isRequired')?.value;
    return isRequired ? 'Mark question as not required' : 'Mark question as required';
  }

  restrictToNumbers(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  }

  convertOptionsArray(sections: any[]): any[] {
    return sections.map((section) => ({
      sectionName: section.sectionName,
      sectionType: section.type,
      status: this.isDraftType ? 'draft' : 'active',
      order: section.order,
      createdBy: this.dynamicForm.employeeId,
      updatedBy: this.dynamicForm.employeeId,
      ratingType: section.ratingScaleType,
      questions: section.questions.map((question: any) => {
        // Explicitly typing the options as an array of objects
        const baseQuestion: {
          type: string;
          question: string;
          required: boolean;
          order: number;
          status: string;
          questionWeightage: number;
          // targetfield: string;
          // unitofmeasurement: string;
          createdBy: number;
          updatedBy: number;
          options: {
            option: string;
            isDefault: boolean;
            optionWeightage: string;
            createdBy: number;
            updatedBy: number;
            meta: string;
          }[];
        } = {
          type:
            section.type === 'rating' ? section.ratingScaleType : question.type,
          question: question.question,
          required: question.isRequired,
          order: question.order,
          status: this.isDraftType ? 'draft' : 'active',
          questionWeightage: question.questionWeightage,
          // targetfield: question.target ? question.target.toString() : null,
          // unitofmeasurement: question.unitofmeasurement ? question.unitofmeasurement : '',
          createdBy: this.dynamicForm.employeeId,
          updatedBy: this.dynamicForm.employeeId,
          options: [],
        };
        // Handling rating scale type questions
        if (section.type === 'rating') {
          // Add rating scale options to the question if it's a rating type
          const ratingScaleOptions = this.getRatingScaleOptions(
            section.ratingScaleType
          );
          if (ratingScaleOptions) {
            baseQuestion.options = ratingScaleOptions.map((scale) => ({
              option: scale.description,
              isDefault: false,
              optionWeightage: scale.scale.toString(), // Assign option weightage if needed
              createdBy: this.dynamicForm.employeeId,
              updatedBy: this.dynamicForm.employeeId,
              meta: '',
            }));
          }
        } else {
          // For non-rating type questions, handle other option types
          baseQuestion.options = question.options.map((option: any) => ({
            option: option.option,
            isDefault: false,
            optionWeightage: '0', // Default handling of optionWeightage
            createdBy: this.dynamicForm.employeeId,
            updatedBy: this.dynamicForm.employeeId,
            meta: '',
          }));
        }
        return baseQuestion;
      }),
      sectionItems: [
        {
          weightage: section.weightage,
          status: this.isDraftType ? 'draft' : 'active',
          createdBy: this.dynamicForm.employeeId,
          updatedBy: this.dynamicForm.employeeId,
          meta: 'Weightage',
        },
      ],
    }));
  }

  onSaveSubmit() {
    this.isDraftType = true;
    if (this.createForm.valid) {
      const selectedRange = this.createForm.value.ratingScaleRange;
      this.dynamicForm.ratingScaleRange = selectedRange ? `${selectedRange.minimum}-${selectedRange.maximum}` : null;
      this.dynamicForm.formName = this.createForm.value.formHeader;
      this.dynamicForm.moduleId = Number(this.createForm.value.moduleId.id);
      this.dynamicForm.overAllRating = this.createForm.value.overAllRating;
      this.dynamicForm.cutOffRating = this.createForm.value.cutOffRating;
      this.dynamicForm.createdBy = this.dynamicForm.employeeId;
      // this.dynamicForm.updatedBy = this.dynamicForm.employeeId;
      this.dynamicForm.status = 'draft';
      this.dynamicForm.sectionDetails = this.convertOptionsArray(
        this.createForm.value.sections
      );
      this.http
        .postData(`Form/SubmitFormDetails`, this.dynamicForm, {
          responseType: 'text',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.openSuccessModal(false, true);

            setTimeout(() => {
              this.route.navigate(['/settings/dynamic-forms/draft-forms']);
            }, 2000);

            this.isDraftType = false;
            // this.intializeForm()
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    const selectedRange = this.createForm.value.ratingScaleRange;
    this.dynamicForm.ratingScaleRange = selectedRange ? `${selectedRange.minimum}-${selectedRange.maximum}` : null;
    this.dynamicForm.formName = this.createForm.value.formHeader;
    this.dynamicForm.moduleId = Number(this.createForm.value.moduleId.id);
    this.dynamicForm.overAllRating = this.createForm.value.overAllRating;
    this.dynamicForm.cutOffRating = this.createForm.value.cutOffRating;
    this.dynamicForm.createdBy = this.dynamicForm.employeeId;
    // this.dynamicForm.updatedBy = this.dynamicForm.employeeId;
    this.dynamicForm.status = 'active';
    this.dynamicForm.sectionDetails = this.convertOptionsArray(
      this.createForm.value.sections
    );
    this.http.postData(`Form/SubmitFormDetails`, this.dynamicForm, {
      responseType: 'text',
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.openSuccessModal(true, false);
          // this.createForm.reset();
          this.isSubmitted = false;
          // setTimeout(() => {
          //   this.route.navigate(['/form']);
          // }, 2000);

          //this.intializeForm()
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getAllRatingScaleTypes() {
    this.http.getData('Form/getallratings').subscribe({
      next: (data: any) => {
        this.ratingScaleTypes = data as IRatingScale[];
        this.uniqueRatingScaleRanges = [
          ...new Map(
            this.ratingScaleTypes.filter((type) => type.minimumRatingScale != null && type.maximumRatingScale != null) // Ensure minimum and maximum are defined
              .map((type) => [
                `${type.minimumRatingScale}-${type.maximumRatingScale}`,
                {
                  minimum: type.minimumRatingScale!,
                  maximum: type.maximumRatingScale!,
                },
              ]) // Use non-null assertion
          ).values(),
        ];
      },
    });
  }

  backToTableView() {
    this.location.back();
    this.modalService.dismissAll();
  }

  openModal(content: any, options: any = { size: 'lm', centered: true }) {
    this.modalService.open(content, options);
  }

  openSuccessModal(isFormSubmitted: boolean, isDraft: boolean) {
    if (isDraft) {
      this.successMessage = 'Form drafted successfully';
    } else {
      this.successMessage = 'Form submitted successfully';
    }
    this.sharedModalService.openSuccessModal(this.successMessage);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}