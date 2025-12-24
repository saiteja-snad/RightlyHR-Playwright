import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { AuthService } from '../../../services/auth.service';
import { KraCategory } from '../add-kra/kra.model';

@Component({
  selector: 'app-update-kra',
  templateUrl: './update-kra.component.html',
  styleUrl: './update-kra.component.scss',
  imports: [
    FormsModule
  ]
})
export class UpdateKraComponent implements OnInit {
  @Input() updateData!: KraCategory;
  kra!: KraCategory;
  isLoading = false;

  myForm!: NgForm;
  @ViewChild('cancel') cancel: any;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpService,
    private popup: OpenModalService,
    private auth: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.kra = { ...this.updateData };
  }

  openconfirmationModelforcancle(content: any, form: NgForm) {
    this.myForm = form;
    this.modalService.open(content, { centered: true });
  }

  onUpdate() {
    this.isLoading = true;

    const user = this.auth.getToken();
    const payload = {
      categoryId: this.kra.categoryId,
      categoryName: this.kra.categoryName.trim(),
      categoryCode: this.kra.categoryCode.trim().toUpperCase(),
      description: this.kra.description?.trim() || '',
      status: "Active",
      effectiveFrom: new Date().toISOString(),
      createdBy: this.kra.createdBy,
      createdOn: this.kra.createdOn,
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


  closeModal() {
    this.modalService.dismissAll();
    this.activeModal.dismiss();
  }
}
