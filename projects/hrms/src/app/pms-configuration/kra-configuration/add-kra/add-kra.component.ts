// add-kra/add-kra.component.ts
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { KraCategory } from '../add-kra/kra.model';  // Correct path
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-kra',
  templateUrl: './add-kra.component.html',
  styleUrl: './add-kra.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class AddKraComponent {
  kraForm: FormGroup;
  isLoading = false;

  @ViewChild('cancel') cancel: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpService,
    private popup: OpenModalService,
    private auth: AuthService,
    private modalService: NgbModal,
    public formValidation: FormValidationService,
    private fb: FormBuilder
  ) {
    this.kraForm = this.fb.group({
      categoryName: ['', [Validators.required]],
      categoryCode: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }


  openconfirmationModelforcancle(content: any) {
    this.modalService.open(content, { centered: true });
  }

  onSubmit() {
    if (this.kraForm.invalid) {
      this.kraForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.kraForm.value;
    const user = this.auth.getToken();

    const payload = {
      categoryName: formValue.categoryName.trim(),
      categoryCode: formValue.categoryCode.trim().toUpperCase(),
      description: formValue.description.trim(),
      createdBy: user.employeeId,
      createdOn: new Date().toISOString()
    };

    this.http.postdata('Kra/postconfiguration', payload).subscribe({
      next: () => {
        this.popup.openSuccessModal('KRA Category created successfully');
        this.http.tirggerCountSignal.update(s => ({ ...s, global: true }));
        this.activeModal.close();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.popup.openErrorModal(err.error?.message || 'Failed to create KRA category');
      }
    });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.activeModal.dismiss();
    this.kraForm.reset();
  }

  onCategoryInput(controlName: string): void {
    const control = this.kraForm.get(controlName);
    if (control && typeof control.value === 'string') {
      const trimmed = control.value.replace(/^\s+/, '');
      if (trimmed !== control.value) {
        control.setValue(trimmed);
      }
    }
  }

  getCharacterCount(): number {
    return this.kraForm.get('description')?.value?.length || 0;
  }

}
