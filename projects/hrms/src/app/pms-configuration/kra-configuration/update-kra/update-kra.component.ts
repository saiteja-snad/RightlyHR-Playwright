import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { KraCategory } from '../add-kra/kra.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-kra',
  templateUrl: './update-kra.component.html',
  styleUrl: './update-kra.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class UpdateKraComponent implements OnInit {
  @Input() updateData!: KraCategory;
  kraForm: FormGroup;
  isLoading = false;

  @ViewChild('cancel') cancel: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpService,
    private popup: OpenModalService,
    private auth: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.kraForm = this.fb.group({
      categoryName: ['', [Validators.required]],
      categoryCode: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.kraForm.patchValue({
      categoryName: this.updateData.categoryName,
      categoryCode: this.updateData.categoryCode,
      description: this.updateData.description
    });
  }

  openconfirmationModelforcancle(content: any) {
    this.modalService.open(content, { centered: true });
  }

  onUpdate() {
    if (this.kraForm.invalid) {
      this.kraForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.kraForm.value;
    const user = this.auth.getToken();

    const payload = {
      categoryId: this.updateData.categoryId,
      categoryName: formValue.categoryName.trim(),
      categoryCode: formValue.categoryCode.trim().toUpperCase(),
      description: formValue.description?.trim() || '',
      status: "Active",
      effectiveFrom: new Date().toISOString(),
      createdBy: this.updateData.createdBy,
      createdOn: this.updateData.createdOn,
      updatedBy: user.employeeId,
      updatedOn: new Date().toISOString()
    };

    this.http.postdata('Kra/updateconfiguration', payload).subscribe({
      next: () => {
        this.popup.openSuccessModal('KRA Category updated successfully');
        this.http.tirggerCountSignal.update(s => ({ ...s, global: true }));
        this.activeModal.close();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.popup.openErrorModal(err.error?.message || 'Update failed');
      }
    });
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


  closeModal() {
    this.modalService.dismissAll();
    this.activeModal.dismiss();
  }
}
