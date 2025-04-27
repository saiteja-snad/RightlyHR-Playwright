import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IServingPeriod } from './servingPeriod.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-serving-period',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './serving-period.component.html',
  styleUrl: './serving-period.component.scss'
})
export class ServingPeriodComponent {
  subscription!: Subscription;
  servingPeriodDetails = [] as any;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteserving: any = null;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      addServingPeriod: ['', [
        Validators.required
      ]],
      Duration: ['', [
        Validators.required, 
      ]]
    });

    this.updateForm = this.fb.group({ 
      UpdateServingPeriod: ['', [
        Validators.required, // Only letters and spaces

      ]],
      UpdateDuration: ['', [
        Validators.required
      ]]
    });
    this.getServingPeriod();
  }
  allowOnlyLettersAndSpace1(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    // Allow letters, numbers, spaces, periods, commas, slashes and hyphens
    const pattern = /^[A-Za-z0-9.,/\- ]$/;

    // Block if the key is not in the pattern
    if (!pattern.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
      event.preventDefault();
      return;
    }

    // Block if length is already 100 characters
    if (input.value.length >= 100 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
      event.preventDefault();
    }
  }
  allowOnlyLettersAndSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const pattern = /^[A-Za-z ]$/;
  
    // Block if the key is not a letter or space
    if (!pattern.test(char)) {
      event.preventDefault();
      return;
    }
  
    // Block space at the beginning
    if (input.selectionStart === 0 && char === ' ') {
      event.preventDefault();
      return;
    }
  
    // Block if length is already 100
    if (input.value.length >= 100) {
      event.preventDefault();
    }
  }

allowOnlyNumbers(event: any) {
  let value = event.target.value;
  
  // Remove any non-numeric characters and spaces
  value = value.replace(/[^0-9]/g, '');

  // Limit the length to 4 characters
  if (value.length > 4) {
    value = value.substring(0, 4);
  }

  // Set the sanitized value back to the input field
  event.target.value = value;
}

limitLength(event: any) {
  const inputValue = event.target.value;

  // Prevent input beyond 3 characters
  if (inputValue.length > 3) {
    event.preventDefault(); // Prevent the default behavior, which would allow more input
    event.target.value = inputValue.slice(0, 3); // Ensure the value is limited to 3 characters
  }
}



onDurationInput(event: KeyboardEvent): boolean {
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement.value;
  const char = event.key;

  if (char === '+' || char === '-' || char === '.') {
    event.preventDefault();
    return false;
  }

  if (value.length >= 3 && !this.isBackspaceOrDelete(event)) {
    event.preventDefault();
    return false;
  }

  return true;
}

private isBackspaceOrDelete(event: KeyboardEvent): boolean {
  return event.key === 'Backspace' || event.key === 'Delete';
}


  

  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getServingPeriod() {
    this.subscription = this.http.getData('ServingPeriods').subscribe({
      next: (data: any) => {
        console.log(data);
        this.servingPeriodDetails = data.sort((a: any, b: any) => {
          // Sort by serving period type alphabetically
          return a.servingPeriodType.localeCompare(b.servingPeriodType);
        });
      },
    });
  }
  //ADD
  addServingPeriod(modal: any) {
    const request: IServingPeriod = {
      servingPeriodType: this.AddForm.value.addServingPeriod.trim(),
      duration: this.AddForm.value.Duration,
      isDeleted: false
    };

    this.subscription = this.http.postdata('ServingPeriods', request).subscribe({
      next: () => {

        this.getServingPeriod();
        modal.close();
        this.conformationPopup.openSuccessModal('Serving Period added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message || 'An error occurred while adding the serving period.';
        this.conformationPopup.openErrorModal(errorMessage);
        this.resetForm();
      }
    });
  }

  close(modal: any) {
    this.resetForm();
    modal.close();
  }
  // Method to open the update modal dialog
  openupdateDialog(servingPeriodList: any) {
    this.selectedId = servingPeriodList.id;
    this.updateForm.patchValue({ UpdateServingPeriod: servingPeriodList.servingPeriodType });
    this.updateForm.patchValue({ UpdateDuration: servingPeriodList.duration });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IServingPeriod = {
        id: this.selectedId,
        servingPeriodType: this.updateForm.value.UpdateServingPeriod.trim(),
        duration: this.updateForm.value.UpdateDuration,
        isDeleted: false
      };

      this.subscription = this.http.postdata('ServingPeriods/UPDATER', request).subscribe({
        next: () => {

          this.getServingPeriod();
          modal.close();
          this.conformationPopup.openSuccessModal('Serving Period updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
          this.resetForm();
        }
      });
    }
  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(servingPeriodList: any) {
    this.selectedDeleteserving = servingPeriodList;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    if (!this.selectedDeleteserving) return;
    const deleteRequest: IServingPeriod = {
      id: this.selectedDeleteserving.id,
      servingPeriodType: this.selectedDeleteserving.servingPeriodType.trim(),
      duration: this.selectedDeleteserving.duration,
      isDeleted: true
    };

    this.http.postdata('ServingPeriods/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getServingPeriod();
        modal.close();
        this.conformationPopup.openSuccessModal('Serving Period deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  };


  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
