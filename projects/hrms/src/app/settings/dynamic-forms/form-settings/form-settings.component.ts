import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IFromsettings } from '../../../Interfaces/dynamic-forms.model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-form-settings',
  imports: [
    NoDataFoundComponent,
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './form-settings.component.html',
  styleUrl: './form-settings.component.scss',
})
export class FormSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('successhide') successModal!: TemplateRef<any>;
  @ViewChild('updateform') Updateformmodal!: TemplateRef<any>;
  @ViewChild('navigateToTable') navigateToTable!: TemplateRef<any>;
  @ViewChild('confirmPopUp') confirmPopUp!: TemplateRef<any>;
  @ViewChild('confirmPopUp1') confirmPopUp1!: TemplateRef<any>;
  @ViewChild('addRatingScale') addRatingScale!: TemplateRef<any>;
  fromsettings = {} as IFromsettings;
  destroy$: Subject<boolean> = new Subject<boolean>();
  ratingform!: FormGroup;
  updateFormRating!: FormGroup;
  formSettingDetails = [] as IFromsettings[];
  searchValue: any;
  showForm = false; // Property to control form visibility
  showTable = true;
  successMessage = '';

  ratingType!: string;
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private cdr: ChangeDetectorRef,
    private sharedModalService: OpenModalService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.ratingform = this.fb.group(
      {
        minimumRatingScale: [
          1,
          [Validators.required, Validators.min(1), Validators.max(10)],
        ],
        maximumRatingScale: [
          1,
          [Validators.required, Validators.min(1), Validators.max(10)],
        ], // Rating To
        finalRating: ['', Validators.required], // Round off options
        ratingType: [
          '',
          [
            Validators.required,
            Validators.maxLength(50),
            this.noWhitespaceValidator(),
          ],
        ], // Rating Type
        scales: this.fb.array([], Validators.required), // Array for scales and descriptions
      },
      { validators: this.validateRange() }
    );
    this.cdr.detectChanges();
    this.getAllRatingDetails();
  }
  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value || '').trim(); // Trim leading/trailing spaces
      const startsWithInvalidChar = /^[^a-zA-Z0-9]/.test(value); // Checks for non-alphanumeric character at the start
      const isEmptyAfterTrim = value === ''; // Check if only spaces were entered
      const isValid = !startsWithInvalidChar && !isEmptyAfterTrim;

      return isValid ? null : { invalidStart: true };
    };
  }
  get scales(): FormArray {
    return this.ratingform.get('scales') as FormArray;
  }
  restrictDecimal(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Allow only integer values by removing decimal points
    input.value = value.replace(/\D/g, ''); // Replace non-digit characters
  }
  disableKeyboard(event: KeyboardEvent): void {
    // Allow only arrow keys for increment/decrement
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      return; // Allow arrow keys to function
    }

    // Prevent any other key press (including typing numbers)
    event.preventDefault();
  }

  restrictToMaxValue(
    event: Event,
    formGroup: FormGroup,
    controlName: string,
    maxValue: number,
    maxLength: number
  ): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (value === '') {
      formGroup.get(controlName)?.setValue(null);
      // Set the form control value to null
      return;
    }
    // Enforce the maximum value
    if (Number(value) > maxValue) {
      value = maxValue.toString();
    }

    // Ensure the length does not exceed maxLength
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }

    // Update the input and the form control value
    input.value = value;
    formGroup.get(controlName)?.setValue(Number(value));
    formGroup
      .get('minimumRatingScale')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe(() => {
        this.generateScales();
      });
    formGroup
      .get('maximumRatingScale')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe(() => {
        this.generateScales();
      });
  }

  validateRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const min = control.get('minimumRatingScale')?.value;
      const max = control.get('maximumRatingScale')?.value;

      if (min !== null && max !== null && min > max) {
        return { invalidRange: true }; // Return error if "From" > "To"
      }
      return null; // No error
    };
  }

  // generateScales(): void {
  //   const from = this.ratingform.get('minimumRatingScale')?.value;
  //   const to = this.ratingform.get('maximumRatingScale')?.value;

  //   // Check that from and to are not null and are within the range
  //   if (from != null && to != null && from <= to && from >= 1 && to <= 10 )  {
  //     // Ensure that the range does not exceed 10

  //       // Reset the scales form array
  //       this.scales.clear();

  //       // Add scale and description form groups based on the range
  //       for (let i = from; i <= to; i++) {
  //         this.scales.push(
  //           this.fb.group({
  //             scale: [i, Validators.required], // Pre-fill scale value
  //             description: ['', [Validators.required, Validators.maxLength(50)]], // Empty description
  //           })
  //         );
  //       }

  //   }
  //   else {
  //     console.warn('The range must be between 1 and 10.'); // Optional: Log a warning if the range exceeds 10
  //   }
  // }
  generateScales(): void {
    const from = this.ratingform.get('minimumRatingScale')?.value;
    const to = this.ratingform.get('maximumRatingScale')?.value;

    // Check that from and to are not null and are within the range
    if (from != null && to != null && from <= to && from >= 1 && to <= 10) {
      // Ensure that the range does not exceed 10

      // Get existing descriptions if any
      const existingDescriptions = this.scales.controls.map(
        (scaleGroup) => scaleGroup.get('description')?.value
      );

      // Reset the scales form array
      this.scales.clear();

      // Add scale and description form groups based on the range
      for (let i = from; i <= to; i++) {
        const description = existingDescriptions[i - from] || ''; // Preserve existing description if available

        this.scales.push(
          this.fb.group({
            scale: [i, Validators.required], // Pre-fill scale value
            description: [
              description,
              [Validators.required, Validators.maxLength(50)],
            ], // Use preserved or empty description
          })
        );
      }
    } else {
      this.scales.clear();
      // Optional: Log a warning if the range exceeds 10
    }
  }

  // Method to open the confirmation modal
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  // Method to toggle between the form and table view
  toggleForm(): void {
    this.showForm = !this.showForm;
    this.showTable = !this.showTable; // Toggle table visibility when toggling form
    // this.ratingform.reset();
    this.ratingform.reset();
    this.scales.clear();
  }
  updateAndClose() {
    this.ratingform.reset();
    this.modalService.dismissAll();
  }

  // Method to go back to the table view
  backToTableView(modal: any): void {
    modal.dismiss(); // Close the modal
    this.toggleForm(); // Toggle back to the table view
  }
  removeScale(index: number): void {
    // Remove the selected scale from the array

    this.scales.removeAt(index);

    // Get the current values of 'minimumRatingScale' and 'maximumRatingScale'
    const from = this.ratingform.get('minimumRatingScale')?.value;
    const to = this.ratingform.get('maximumRatingScale')?.value;

    // Check if there are any scales left
    if (this.scales.length > 0) {
      // If the 'maximumRatingScale' is greater than 1, decrement it
      if (to > from && to > 1) {
        this.ratingform.patchValue({
          maximumRatingScale: to - 1,
        });
      }
    } else {
      // If no scales are left, reset both 'minimumRatingScale' and 'maximumRatingScale'
      this.ratingform.patchValue({
        minimumRatingScale: null,
        maximumRatingScale: null,
      });
    }
  }

  removeUpdateScale(index: number): void {
    // Remove the scale at the specified index
    const scales = this.scalesUpdateform.value;

    // Check if there is more than one scale
    if (scales.length > 1) {
      this.scalesUpdateform.removeAt(index);
      const to = this.updateFormRating.get('maximumRatingScale')?.value;
      // Get the updated scales array after removal
      const scales = this.updateFormRating.get('scales')?.value;

      // Check if there are scales left
      if (scales.length > 0) {
        // Update the scales array by adjusting their values (if necessary)
        const updatedScales = scales.map(
          (scale: { description: any }, i: number) => ({
            scale: i + 1, // Resetting or adjusting the scale value as needed
            description: scale.description,
          })
        );

        // Patch the updated scales back to the form
        this.updateFormRating.patchValue({
          scales: updatedScales,
        });

        // Optionally adjust maximumRatingScale based on the new scales
        this.updateFormRating.patchValue({
          maximumRatingScale: to - 1,
        });
      } else {
        // If no scales are left, reset maximumRatingScale or other fields as necessary
        this.updateFormRating.patchValue({
          minimumRatingScale: null,
          maximumRatingScale: null, // or any other default value
          scales: [], // Clear scales
        });
      }
    } else {
      // Display an error message or handle the case when only one scale is left
      console.log('At least one scale must remain.');
      // Optionally, you can show a message to the user using an alert or a UI message
    }
  }

  closeModal() {
    this.modalService.dismissAll(); // This will close all open modals
  }
  onClose() {
    this.openModal(this.confirmPopUp1, { centered: true });
    // this.openSuccessModal('');
  }


  
  onUpdate(ratingType: string) {
    if (this.updateFormRating.valid) {
      this.http
        .putData(
          `Form/byRatingType?ratingType=${ratingType}`,
          this.updateFormRating.value
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.openSuccessModal('update');
            this.updateFormRating.reset();
            this.scalesUpdateform.clear();
            
          },
          error: (error: any) => {
            console.log(error);
          },complete:()  =>{
            this.getAllRatingDetails();
          },
        });
    }
  }

  openDeleteModal(ratingType: string) {
    this.openModal(this.confirmPopUp, { centered: true });
    this.ratingType = ratingType;
  }
  onDelete() {
    this.http
      .deleteData(`Form?ratingType=${this.ratingType}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.openSuccessModal('delete');     
        },
        error: (error: any) => {
          console.log(error);
        },complete: ()  =>{
          this.getAllRatingDetails();
        },
      });
  }
  onSubmit(): void {
    if (this.ratingform.valid) {
      this.http
        .postData(`Form/rating`, this.ratingform.value, {
          responseType: 'text',
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.modalService.dismissAll();
            this.openSuccessModal('submit');
            
          },
          error: (error: any) => {
            console.log(error);
            if (error.status === 409) {
              this.sharedModalService.openErrorModal(error.error)
            }
          },complete: () =>{
            this.getAllRatingDetails();
          }
        });
    }
  }
  // Function to handle changes in min/max rating scale
  listenForRatingScaleChanges() {
    this.updateFormRating
      .get('minimumRatingScale')
      ?.valueChanges.subscribe(() => {
        this.updateScales();
      });

    this.updateFormRating
      .get('maximumRatingScale')
      ?.valueChanges.subscribe(() => {
        this.updateScales();
      });
  }

  ratingScaleValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const min = this.ratingform.get('minimumRatingScale')?.value;
    const max = this.ratingform.get('maximumRatingScale')?.value;

    if (min != null && max != null && min > max) {
      return { invalidRange: true }; // Custom error
    }
    return null; // No error
  };
  // Function to update the scales array based on min and max
  updateScales() {
    const minScale = this.updateFormRating.get('minimumRatingScale')?.value;
    const maxScale = this.updateFormRating.get('maximumRatingScale')?.value;

    const scalesArray = this.updateFormRating.get('scales') as FormArray;

    if (
      minScale !== null &&
      maxScale !== null &&
      minScale <= maxScale &&
      minScale >= 1 &&
      maxScale <= 10
    ) {
      const existingScales = scalesArray.controls.map(
        (control) => control.value
      ); // Get current scales

      scalesArray.clear(); // Clear the current scales array

      // Create a map of existing descriptions based on the scale value
      const existingDescriptions = existingScales.reduce((acc, scaleItem) => {
        acc[scaleItem.scale] = scaleItem.description;
        return acc;
      }, {});

      // Populate the scales array based on min and max values
      for (let i = minScale; i <= maxScale; i++) {
        const description = existingDescriptions[i] || ''; // Retain existing description or set as empty
        scalesArray.push(
          this.fb.group({
            scale: [i, Validators.required], // Auto-populate the scale with a number between min and max
            description: [
              description,
              [Validators.required, Validators.maxLength(50)],
            ], // Initialize description with existing or empty
          })
        );
      }

      // Force change detection if needed
      // this.cd.detectChanges();
    } else {
      scalesArray.clear(); // Clear the current scales array
    }
  }

  // }
  openModal(content: any, options: any = { size: 'sm', centered: true }) {
    this.modalService.open(content, options);
  }

  openSuccessModal(action: any) {
    switch (action) {
      case 'submit':
        this.successMessage = 'Rating scale submitted successfully';
        break;
      case 'update':
        this.successMessage = 'Rating scale updated successfully';
        break;
      case 'delete':
        this.successMessage = 'Rating scale deleted successfully';
        break;
      default:
        this.successMessage = '';
    }

    this.sharedModalService.openSuccessModal(this.successMessage);
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
  
  assignValues(ratingType: string) {
    this.ratingType = ratingType;
    // Find the form data that matches the ratingType
    this.updateFormRating = this.fb.group(
      {
        minimumRatingScale: [null, [Validators.required, Validators.min(1)]], // Rating From
        maximumRatingScale: [null, [Validators.required, Validators.min(1)]], // Rating To
        finalRating: ['', Validators.required], // Round off options
        ratingType: ['', Validators.required], // Rating Type
        scales: this.fb.array([]), // Array for scales and descriptions
      },
      { validators: this.validateRange() }
    );
    this.listenForRatingScaleChanges();
    const formToEdit = this.formSettingDetails.find(
      (form) => form.ratingType === ratingType
    );

    // Check if the form with the given ratingType exists
    if (formToEdit) {
      // Patch the form with the filtered data
      this.updateFormRating.patchValue({
        minimumRatingScale: formToEdit.minimumRatingScale,
        maximumRatingScale: formToEdit.maximumRatingScale,
        finalRating: formToEdit.finalRating,
        ratingType: formToEdit.ratingType,
      });

      // Clear the existing scales array
      const scalesArray = this.updateFormRating.get('scales') as FormArray;
      scalesArray.clear();

      // Populate the scales array with the data
      formToEdit.scales.forEach((scaleItem: any) => {
        scalesArray.push(
          this.fb.group({
            scale: [scaleItem.scale, Validators.required],
            description: [scaleItem.description, Validators.required],
          })
        );
      });
      this.openModal(this.Updateformmodal, { size: 'lg', centered: true });
    } else {
      console.error('Form with the given rating type not found');
    }

    // Optionally, trigger the modal or other actions here if needed
  }
  get scalesUpdateform(): FormArray {
    return this.updateFormRating.get('scales') as FormArray;
  }

  getAllRatingDetails() {
    this.http.getData('Form/getallratings').subscribe({
      next: (data: any) => {
        this.formSettingDetails = data as IFromsettings[];
      },
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
