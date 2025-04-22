import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IAllFormsData, IDynamicForm } from '../../../Interfaces/dynamic-forms.model';
import { IJob } from '../../../Interfaces/letters-model';
import { SearchFormPipe } from "../search-form.pipe";
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-active-forms',
  imports: [
    NoDataFoundComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    SearchFormPipe,
  ],
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss',
})
export class ActiveFormsComponent implements OnInit, OnDestroy {
  dynamicForm = {} as IDynamicForm;
  updateDetails = {} as IDynamicForm;
  updateForm!: FormGroup;
  setfromid: any;
  successMessage!: string;
  weightageArray: any[] = [];
  allFormsDetails = [] as IAllFormsData[];
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  searchValue: any;
  formStatus = 'Draft';
  empinfo = {} as IJob;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private route: ActivatedRoute,
    private sharedModalService: OpenModalService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
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
      sections: this.fb.array([]), // Sections FormArray
    });
    this.getAllFormDetails();
  }

  openModal(content: any, options: any = { size: 'xl', centered: true }) {
    this.modalService.open(content, options);
  }
  openmodal(content: any) {
    this.modalService.open(content, { centered: true });
  }
  openSuccessModal() {
    // Check if formStatus is 'Draft' and set the success message
    this.successMessage = 'Form inactivated successfully';

    // Open the modal with the success message
    this.openModal(this.successModal, { centered: true });

    // Automatically dismiss the modal after 1 second
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 1000);
  }
  getAllFormDetails() {
    this.http
      .getData('Form/getAllFormDetails')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.allFormsDetails = (data as IAllFormsData[]).filter(
            (form) => form.status === 'active'
          );
        },
      });
  }
  deleteFormDestails(formId: number) {
    this.http
      .getData(`Form/getFormDetailsByFormId/${formId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.assignValuestoDeleteForm(data);
          this.onDelete();
        },
        error: (err) => console.error(err),
        complete:() =>{
          
        }
      });
  }
  assignValuestoDeleteForm(data: any) {
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

  navigateToUpdateComponent(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/update-form'], {
      state: { formId: formId },
    });
  }
  navigateToViewComponent(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/view-form'], {
      state: { formId: formId },
    });
  }

  convertUpdateOptionsArray(sections: any[]): any[] {
    return sections.map((section) => {
      const sectionObj: any = {
        sectionName: section.sectionName,
        status: 'Active',
        sectionType: section.sectionType,
        order: section.order,
        createdBy: this.updateDetails.employeeId,
        updatedBy: this.updateDetails.employeeId,
        questions: section.questions.map((question: any) => {
          const questionObj: any = {
            type: question.type,
            question: question.question,
            required: question.required,
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
  onDelete() {
    this.updateDetails.formName = this.updateForm.value.formHeader;
    this.updateDetails.formId = this.updateForm.value.formId;
    this.updateDetails.sectionId = this.updateForm.value.sectionId;
    this.updateDetails.formHeaderId = this.updateForm.value.formHeaderId;
    this.updateDetails.createdBy = this.updateForm.value.createdBy;
    this.updateDetails.updatedBy = this.updateDetails.employeeId;
    this.updateDetails.ratingScaleRange =
      this.updateForm.value.ratingScaleRange;
    this.updateDetails.status = 'inactive';
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
          this.sharedModalService.openSuccessModal('Form inactivated successfully');
        },
        error: (error) => {
          console.log(error);
        },complete: () => {
          this.getAllFormDetails();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
