import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import {
  IAllFormsData,
  IDynamicForm,
  IRatingScale,
} from '../../../Interfaces/dynamic-forms.model';
import { IJob } from '../../../Interfaces/letters-model';
import { SearchFormPipe } from '../search-form.pipe';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';
import { OpenModalService } from '../../../services/open-modal.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-inactive-forms',
  imports: [
    NoDataFoundComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    SearchFormPipe,
    DataLoaderContentComponent
],
  templateUrl: './inactive-forms.component.html',
  styleUrl: './inactive-forms.component.scss',
})
export class InactiveFormsComponent implements OnInit, OnDestroy {
  allFormsDetails = [] as IAllFormsData[];
  searchValue: any;
  updateForm!: FormGroup;
  
  modules: any[] = environment.modules;
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
  updateDetails = {} as IDynamicForm;
  successMessage!: string;
  formId!: number;
  weightageArray: any[] = [];
  ratingScaleTypes!: IRatingScale[];
  seletedid: any;
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  sectionDetails: any;
  empinfo = {} as IJob;
  loader = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private router: Router,
    private route: ActivatedRoute,
    private sharedModalService: OpenModalService,
    public rbac: RbacService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.getAllFormDetails();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateDetails.employeeId =this.empinfo.employeeId;
    this.updateForm = this.fb.group(
      {
        formHeader: ['', [Validators.required, Validators.maxLength(255)]],
        moduleId: ['', Validators.required],
        cutOffRating: [null, [Validators.required, Validators.min(1)]],
        overAllRating: [null, [Validators.required, Validators.min(1)]],
        formId: [null, Validators.required],
        createdBy: [null, Validators.required],
        updatedBy: [null, Validators.required],
        ratingScaleRange: [null, Validators.required],
        status: ['', Validators.required],
        meta: [''],
        sectionId: [null, Validators.required],
        formHeaderId: [null, Validators.required],
        sections: this.fb.array([this.createSection()]), // Sections FormArray
      },
      {
        validators: [
          this.atLeastOneSectionValidator(),
          this.atLeastOneQuestionInSectionValidator(),
          this.cutOffRatingLessThanOverallRating,
        ],
      }
    );

    this.formId = Number(this.route.snapshot.paramMap.get('formId'));
    this.handleOptionWeightageValidation();

    this.getAllRatingScaleTypes();
  }

  getAllFormDetails() {
    this.loader = true;
    this.http
      .getData('Form/getAllFormDetails')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Filter forms with 'inactive' status
          this.loader = false;
          this.allFormsDetails = (data as IAllFormsData[]).filter(
            (form) => form.status === 'inactive'
          );
        },
        error: (err) => {
          this.loader = false;
          this.allFormsDetails = [];
        },
      });
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

        if (
          !questions ||
          !(questions instanceof FormArray) ||
          questions.length === 0
        ) {
          valid = false;
        }
      });

      return valid ? null : { atLeastOneQuestionInSection: true };
    };
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

    moveItemInArray(
      questions.controls,
      event.previousIndex,
      event.currentIndex
    );
    questions.controls.forEach((question, index) => {
      question.get('order')?.setValue(index);
    });
  }
  cutOffRatingLessThanOverallRating(
    group: AbstractControl
  ): { [key: string]: boolean } | null {
    const overallRating = group.get('overAllRating')?.value;
    const cutOffRating = group.get('cutOffRating')?.value;

    if (
      cutOffRating !== null &&
      overallRating !== null &&
      cutOffRating > overallRating
    ) {
      return { cutOffGreaterThanOverall: true };
    }
    return null;
  }
  toggleRequired(sectionIndex: number, questionIndex: number, event: Event) {
    const control = this.getUpdateQuestions(sectionIndex)
      .at(questionIndex)
      .get('question');

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
    const sectionIndex = this.updateSections.controls.findIndex(
      (s) => s === section
    );
    this.updateQuestionTypes(sectionIndex); // Update question types based on the current section type
  }
  // Method to dynamically update the question type based on section type change
  updateQuestionTypes(sectionIndex: number) {
    const section = this.updateSections.at(sectionIndex) as FormGroup;
    const questions = this.getUpdateQuestions(sectionIndex);

    // Iterate through each question and update its validators based on section type
    questions.controls.forEach((question: any) => {
      const sectionType = section.get('type')?.value;
      question
        .get('type')
        ?.setValidators(sectionType === 'normal' ? [Validators.required] : []);
      question.get('type')?.updateValueAndValidity();
    });
  }

  validateTotalWeightage(sectionIndex: number): boolean {
    const sectionWeightage =
      this.updateSections.at(sectionIndex).get('weightage')?.value || 0;
    const totalQuestionWeightage =
      this.calculateTotalQuestionWeightage(sectionIndex);

    // Only show error when all question weightages have been entered
    const allQuestionsHaveWeightage = this.getUpdateQuestions(
      sectionIndex
    ).controls.every((question) => question.get('questionWeightage')?.value);

    return (
      allQuestionsHaveWeightage && totalQuestionWeightage > sectionWeightage
    );
  }
  removeUpdateSection(index: number) {
    this.updateSections.removeAt(index);
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

  get updateSections(): FormArray {
    return this.updateForm.get('sections') as FormArray;
  }

  // Method to add a new section
  addUpdateSection() {
    const sectionGroup = this.fb.group({
      id: [null],
      sectionName: ['', Validators.required],
      sectionType: ['', Validators.required],
      order: [0],
      weightage: [null, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([this.createQuestion('')]), // Questions FormArray
    });

    this.updateSections.push(sectionGroup);
  }

  // Method to create a new question form group
  createQuestion(sectionType: string): FormGroup {
    const typeValidators =
      sectionType === 'normal' ? [Validators.required] : [];
    const questionGroup = this.fb.group({
      id: [null],
      description: [''],
      type: ['', Validators.required],
      question: ['', Validators.required],
      options: this.fb.array([]), // Options FormArray
      order: [0],
      required: [false, Validators.required],
      questionWeightage: [null, [Validators.required, Validators.min(1)]], // Add optionWeightage here
    });

    // Listen to changes in 'type' and update validation accordingly
    questionGroup.get('type')?.valueChanges.subscribe((questionType: any) => {
      this.updateOptionsValidation(questionGroup, questionType);
    });

    return questionGroup;
  }
  selectType(type: any, sectionIndex: number, questionIndex: number) {
    this.getUpdateQuestions(sectionIndex)
      .at(questionIndex)
      .get('type')
      ?.setValue(type.value);
  }
  // Method to add a question to a section
  addUpdateQuestion(sectionIndex: number) {
    const questionGroup = this.createQuestion('');
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
    const questionGroup = this.getUpdateQuestions(sectionIndex).at(
      questionIndex
    ) as FormGroup;
    const optionsArray = questionGroup.get('options') as FormArray;

    const optionGroup = this.fb.group({
      optionId: [''],
      option: [''],
      isDefault: [false],
      optionWeightage: [null, [Validators.required, Validators.min(1)]],
      createdBy: [''],
      updatedBy: [''],
      meta: [''],
    });

    optionsArray.push(optionGroup);

    // Apply validation based on the question type
    const questionType = questionGroup.get('type')?.value;
    this.updateOptionsValidation(questionGroup, questionType);
  }

  // Method to remove an option from a question
  removeUpdateOption(
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number
  ) {
    const optionsArray = this.getUpdateOptions(sectionIndex, questionIndex);
    optionsArray.removeAt(optionIndex);
  }

  // Method to get the options FormArray for a question
  getUpdateOptions(sectionIndex: number, questionIndex: number): FormArray {
    return this.getUpdateQuestions(sectionIndex)
      .at(questionIndex)
      .get('options') as FormArray;
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
    const type = this.questionTypes.find((type) => type.value === value);
    return type ? type.label : null;
  }

  removeFormData() {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }

  createSection(): FormGroup {
    return this.fb.group({
      sectionName: ['', [Validators.required, Validators.maxLength(255)]],
      sectionType: ['', Validators.required],
      order: [0],
      ratingScaleType: [''],
      weightage: [null, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([this.createQuestion('')]),
    });
  }

  assignValuestoUpdateForm(data: any) {
    this.updateForm.patchValue({
      formHeader: data.formName,
      moduleId: data.moduleId,
      formId: data.formId,
      createdBy: data.createdBy,
      updatedBy: this.updateDetails.employeeId,
      ratingScaleRange: data.ratingScaleRange,
      status: data.status,
      meta: data.meta,
      overAllRating: data.overAllRating,
      cutOffRating: data.cutOffRating,
      sectionId: data.sectionId,
      formHeaderId: data.formHeaderId,
    });

    const sectionsArray = this.updateForm.get('sections') as FormArray;
    sectionsArray.clear(); // Clear existing sections

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
                targetfield: [question?.targetfield?.toString()],
                unitofmeasurement: [question.unitofmeasurement],
                createdBy: [this.updateDetails.employeeId],
                updatedBy: [this.updateDetails.employeeId],
                meta: [option.meta],
              });

              optionsArray.push(optionGroup);
            }
          });
        }
        section.sectionItems.forEach((item: any) => {
          this.weightageArray.push(item.weightage);
        });
        const questionGroup = this.fb.group({
          id: [question.id],
          question: [question.question, Validators.required],
          description: [question.description],
          type: [question.type], // Initially without validation
          order: [question.order],
          required: [question.required],
          questionWeightage: [
            question.questionWeightage,
            [Validators.required, Validators.min(1)],
          ],
          targetfield: [
            question.targetfield,
            [Validators.required, Validators.min(1)],
          ],
          unitofmeasurement: [
            question.unitofmeasurement,
            [Validators.required],
          ],
          createdBy: question.createdBy || this.updateDetails.createdBy,
          options: optionsArray,
        });

        // Apply dynamic validation based on section type
        if (section.sectionType === 'normal') {
          questionGroup.get('type')?.setValidators([Validators.required]);
        } else {
          questionGroup.get('type')?.clearValidators();
        }

        questionGroup.get('type')?.updateValueAndValidity(); // Update validity after setting/clearing validators

        questionsArray.push(questionGroup);
      });

      const ratingScaleType =
        section.sectionType === 'rating' && questionsArray.length > 0
          ? questionsArray.at(0).get('type')?.value
          : null;

      const sectionGroup = this.fb.group({
        id: [section.id],
        order: [section.order],
        sectionName: [section.sectionName, Validators.required],
        sectionType: [section.sectionType, Validators.required],
        ratingScaleType: [ratingScaleType],
        weightage: [
          Number(this.weightageArray.at(this.weightageArray.length - 1)),
          [Validators.required, Validators.min(1)],
        ],
        questions: questionsArray,
        createdBy: section.createdBy || this.updateDetails.createdBy,
      });

      if (section.sectionType === 'normal') {
        sectionGroup
          .get('ratingScaleType')
          ?.setValidators([Validators.required]);
      } else {
        sectionGroup.get('ratingScaleType')?.clearValidators();
      }

      sectionsArray.push(sectionGroup);
    });
  }

  updateFormDetails(formId: number) {
    this.http
      .getData(`Form/getFormDetailsByFormId/${formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assignValuestoUpdateForm(data);
          this.onUpdate();
        },
        error: (err) => console.error(err),
      });
  }

  onUpdate() {
    this.updateDetails.formName = this.updateForm.value.formHeader;
    this.updateDetails.formId = this.updateForm.value.formId;
    this.updateDetails.sectionId = this.updateForm.value.sectionId;
    this.updateDetails.formHeaderId = this.updateForm.value.formHeaderId;
    this.updateDetails.createdBy = this.updateForm.value.createdBy;
    this.updateDetails.updatedBy = this.updateDetails.employeeId;
    this.updateDetails.ratingScaleRange =this.updateForm.value.ratingScaleRange,
    this.updateDetails.status = 'active';
    this.updateDetails.moduleId = this.updateForm.value.moduleId;
    this.updateDetails.overAllRating = this.updateForm.value.overAllRating;
    this.updateDetails.cutOffRating = this.updateForm.value.cutOffRating;
    this.updateDetails.sectionDetails = this.convertUpdateOptionsArray(
      this.updateForm.value.sections
    );
   this.http
      .postData(`Form/SubmitFormDetails`, this.updateDetails, {
        responseType: 'text',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.openSuccessModal(true);

          this.updateForm.reset();
        },
        error: (error) => {
          console.log(error);
        },complete: () =>{
          this.getAllFormDetails();
        },
      });
  }
  getAllRatingScaleTypes() {
     this.http
      .getData('Form/getallratings')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.ratingScaleTypes = data as IRatingScale[];
        },error: (err) =>{
          this.ratingScaleTypes = [];
        }
      });
  }
  convertUpdateOptionsArray(sections: any[]): any[] {
    return sections.map((section) => {
      const sectionObj: any = {
        sectionName: section.sectionName,
        sectionType: section.sectionType,
        status: 'Active',
        order: section.order,
        createdBy: this.updateDetails.employeeId,
        updatedBy: this.updateDetails.employeeId,
        questions: section.questions.map((question: any) => {
          const questionObj: any = {
            type:
              section.sectionType === 'rating'
                ? section.ratingScaleType
                : question.type,
            required: question.required,
            question: question.question,
            order: question.order,
            questionWeightage: question.questionWeightage,
            targetfield: question.targetfield,
            unitofmeasurement: question.unitofmeasurement,
            status: 'Active',
            createdBy: this.updateDetails.employeeId,
            updatedBy: this.updateDetails.employeeId,
            options: question.options.map((option: any) => {
              const optionObj: any = {
                option: option.option,
                isDefault: false,
                optionWeightage: option.optionWeightage.toString(),
                createdBy: this.updateDetails.employeeId,
                updatedBy: this.updateDetails.employeeId,
                meta: '',
              };

              // Conditionally add 'optionId' if present
              if (option.optionId) {
                optionObj.optionId = option.optionId;
              }

              return optionObj;
            }),
          };

          // Conditionally add 'id' to question object if present
          if (question.id) {
            questionObj.id = question.id;
            questionObj.createdBy = question.createdBy;
          }
          // Handling rating scale type questions
          if (section.sectionType === 'rating') {
            // Add rating scale options to the question if it's a rating type
            const ratingScaleOptions = this.getRatingScaleOptions(
              section.ratingScaleType
            );
            if (ratingScaleOptions) {
              questionObj.options = ratingScaleOptions.map((scale) => ({
                option: scale.description,
                isDefault: false,
                optionWeightage: scale.scale.toString(), // Assign option weightage if needed
                createdBy: this.updateDetails.employeeId,
                updatedBy: this.updateDetails.employeeId,
                meta: '',
              }));
            }
          } else {
            // For non-rating type questions, handle other option types
            questionObj.options = question.options.map((option: any) => ({
              option: option.option,
              isDefault: false,
              optionWeightage: '0', // Default handling of optionWeightage
              createdBy: this.updateDetails.employeeId,
              updatedBy: this.updateDetails.employeeId,
              meta: '',
            }));
          }
          return questionObj;
        }),
        sectionItems: [
          {
            weightage: section.weightage,
            status: 'Active',
            createdBy: this.updateDetails.employeeId,
            updatedBy: this.updateDetails.employeeId,
            meta: 'Weightage',
          },
        ],
      };

      // Conditionally add 'id' to section object if present
      if (section.id) {
        sectionObj.id = section.id;
        sectionObj.createdBy = section.createdBy;
        // Conditionally add 'sectionHeaderId' if section.id exists
        sectionObj.sectionItems[0].sectionHeaderId = section.id;
        sectionObj.sectionItems[0].createdBy = section.createdBy;
      }

      return sectionObj;
    });
  }
  openmodal(content: any) {
    this.modalService.open(content, { centered: true });
  }
  openModal(content: any, options: any = { size: 'xl', centered: true }) {
    this.modalService.open(content, options);
  }

  openSuccessModal(isFormSubmitted: boolean) {
    this.successMessage = 'Form actived successfully';
    this.sharedModalService.openSuccessModal(this.successMessage);
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
      options.push(
        this.fb.group({
          option: [''],
          optionWeightage: ['', [Validators.required, Validators.min(1)]],
        })
      );
    }
  }
  preserveWeightageOnTypeChange(sectionIndex: number, questionIndex: number) {
    const question = this.getUpdateQuestions(sectionIndex).at(questionIndex);
    const options = question.get('options') as FormArray;

    // Check existing options and if needed, transfer weightage to new options
    if (options.length > 0) {
      // Transfer weightage from existing options
      const weightages = options.controls.map(
        (option) => option.get('optionWeightage')?.value
      );

      // Clear current options
      this.clearOptions(sectionIndex, questionIndex);

      // Add new options for the new type, preserving weightage if applicable
      weightages.forEach((weightage) => {
        options.push(
          this.fb.group({
            option: ['', [Validators.required, Validators.min(1)]],
            optionWeightage: [
              weightage,
              [Validators.required, Validators.min(1)],
            ],
          })
        );
      });
    }
  }

  navigateToViewComponent(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/view-form'], { state: { formId: formId } });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
