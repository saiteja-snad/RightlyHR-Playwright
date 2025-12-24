// add-kra/add-kra.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';  // Keep only NgForm, NOT FormsModule
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { KraCategory } from '../add-kra/kra.model';  // Correct path
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';

@Component({
  selector: 'app-add-kra',
  templateUrl: './add-kra.component.html',
  styleUrl: './add-kra.component.scss',
  imports: [
    FormsModule
  ]
})
export class AddKraComponent {
  kra: KraCategory = {
    categoryName: '',
    categoryCode: '',
    description: ''
  };

  isLoading = false;
  myForm!: NgForm;

  @ViewChild('cancel') cancel: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpService,
    private popup: OpenModalService,
    private auth: AuthService,
    private modalService: NgbModal,
     public formValidation: FormValidationService
  ) {}


  openconfirmationModelforcancle(content: any, form: NgForm) {
    this.myForm = form;
    this.modalService.open(content, { centered: true });
  }

  onSubmit() {
    if (!this.kra.categoryName?.trim() || !this.kra.categoryCode?.trim()) return;

    this.isLoading = true;

    const user = this.auth.getToken();
    const payload = {
      categoryName: this.kra.categoryName.trim(),
      categoryCode: this.kra.categoryCode.trim().toUpperCase(),
      description: this.kra.description?.trim() || '',
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
    this.kra = { categoryName: '', categoryCode: '', description: '' };
  }

  onCategoryInput(model: any): void {
  // mark touched so error shows immediately
  model.control.markAsTouched();

  // trim leading spaces only
  if (typeof model.control.value === 'string') {
    const trimmed = model.control.value.replace(/^\s+/, '');
    if (trimmed !== model.control.value) {
      model.control.setValue(trimmed);
    }
  }
}

}
