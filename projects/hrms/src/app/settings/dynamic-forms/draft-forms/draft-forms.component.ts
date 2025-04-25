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
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import {
  IAllFormsData,
  IDynamicForm,
  IRatingScale,
} from '../../../Interfaces/dynamic-forms.model';
import { IJob } from '../../../Interfaces/letters-model';
import { SearchFormPipe } from '../search-form.pipe';
import { OpenModalService } from '../../../services/open-modal.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-draft-forms',
  imports: [
    NoDataFoundComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    SearchFormPipe,
    DataLoaderContentComponent
],
  templateUrl: './draft-forms.component.html',
  styleUrl: './draft-forms.component.scss',
})
export class DraftFormsComponent implements OnInit, OnDestroy {
  allFormsDetails = [] as IAllFormsData[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  searchValue: any;
  formStatus = 'draft'; // This would typically come from your form data
  successMessage = '';
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  @ViewChild('confirmPopUp') confirmPopUp!: TemplateRef<any>;
  formId!: number;
  updateForm!: FormGroup;
  ratingScaleTypes!: IRatingScale[];
  weightageArray: any[] = [];
  updateDetails = {} as IDynamicForm;
  seletedid: any;
  empinfo = {} as IJob;
  loader = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private sharedModalService: OpenModalService,
    public rbac: RbacService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.getAllFormDetails();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateDetails.employeeId = this.empinfo.employeeId;
    this.updateForm = this.fb.group({
      formHeader: ['', [Validators.required, Validators.maxLength(255)]],
      moduleId: ['', Validators.required],
      cutOffRating: [null, [Validators.required, Validators.min(1)]],
      overAllRating: [null, [Validators.required, Validators.min(1)]],
      formId: [null, Validators.required],
      createdBy: [null, Validators.required],
      ratingScaleRange: [null, Validators.required],
      updatedBy: [null, Validators.required],
      status: ['', Validators.required],
      meta: [''],
      sectionId: [null, Validators.required],
      formHeaderId: [null, Validators.required],
      sections: this.fb.array([this.createSection()]), // Sections FormArray
    });
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

  openModal(content: any, options: any = { size: 'lm', centered: true }) {
    this.modalService.open(content, options);
  }

  getAllFormDetails() {
    this.loader = true;
    this.http
      .getData('Form/getAllFormDetails')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.loader = false;
          this.allFormsDetails = (data as IAllFormsData[]).filter(
            (form) => form.status === 'draft'
          );
          // Set formStatus based on fetched data
          this.formStatus = data.status;
          

        },error: (err) =>{
          this.loader = false;
          this.allFormsDetails = [];
        }
      });
  }

  openConfirmModal(formId: number) {
    this.formId = formId;
    this.openModal(this.confirmPopUp, { centered: true });
  }

  navigateToFormAction(formId: number) {
    if (this.formStatus === 'Draft') {
      this.router.navigate(['form/update-form'], { state: { formId: formId } });
      // Navigate to 'Create Form' page
    } else {
      this.router.navigate(['form/update-form'], { state: { formId: formId } });
      // Navigate to 'Update Form' page
    }
  }
  navigationToFrom(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/update-form'], { state: { formId: formId } });
  }

  deleteFormDetails() {
    this.http
      .deleteData(`Form/${this.formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.openSuccessModal(true);
          this.getAllFormDetails();
        },
        error: (error) => {
          console.log(error);
        },
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
          targetfield: [question.targetfield, [Validators.required]],
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
  onUpdate() {
    this.updateDetails.formName = this.updateForm.value.formHeader;
    this.updateDetails.formId = this.updateForm.value.formId;
    this.updateDetails.sectionId = this.updateForm.value.sectionId;
    this.updateDetails.formHeaderId = this.updateForm.value.formHeaderId;
    this.updateDetails.createdBy = this.updateForm.value.createdBy;
    this.updateDetails.updatedBy = this.updateDetails.employeeId;
    (this.updateDetails.ratingScaleRange =
      this.updateForm.value.ratingScaleRange),
      (this.updateDetails.status = 'active');
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
          this.openSuccessModal(false);
          this.updateForm.reset();
        },
        error: (error) => {
          console.log(error);
        },
        complete: () => {
          this.getAllFormDetails();
        },
      });
  }

  openmodal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  openSuccessModal(isFormSubmitted: boolean) {
    if (isFormSubmitted) {
      this.successMessage = 'Form deleted successfully';
    } else {
      this.successMessage = 'Form actived successfully';
    }

    this.sharedModalService.openSuccessModal(this.successMessage);

   
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
