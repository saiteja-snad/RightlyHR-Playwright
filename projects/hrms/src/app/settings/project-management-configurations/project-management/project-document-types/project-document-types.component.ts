import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { IEAV } from '../../models/project-type.modal';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SettingsLoaderComponent } from '../../../../shared/settings-loader/settings-loader.component';
import { SettingsUpdateIconComponent } from '../../../../icons/settings-update-icon/settings-update-icon.component';
import { SettingsDeleteIconComponent } from '../../../../icons/settings-delete-icon/settings-delete-icon.component';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-project-document-types',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, SettingsLoaderComponent, SettingsUpdateIconComponent, SettingsDeleteIconComponent, NoDataFoundComponent],
  templateUrl: './project-document-types.component.html',
  styleUrl: './project-document-types.component.scss'
})
export class ProjectDocumentTypesComponent {
  subscription!: Subscription;
  addForm!: FormGroup;
  updateForm!: FormGroup;
  documentTypes: IEAV[] = [];
  loading = false;
  selectedEAV!: IEAV;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService) { }

  ngOnInit(): void {
    this.initialiseForm();
    this.getEAV();
  }

  initialiseForm() {
    this.addForm = this.fb.group({
      documentType: [null, [Validators.required, this.formValidations.minCharactersValidator(2), this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      documentType: [null, [Validators.required, this.formValidations.minCharactersValidator(2), this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
  }

  getEAV() {
    this.loading = true;
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Project Document Type').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.documentTypes = data;
      },
      error: (error: any) => {
        this.loading = false;
        this.documentTypes = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onAddSubmit(form: FormGroup) {
    if (form.valid) {
      const payload = {
        entity: 'Project',
        attribute: 'Project Document Type',
        value: form.value.documentType,
        meta: ''
      };
      this.subscription = this.http.postdata('entityAttributeValues', payload).subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Document type added successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to add Document Type');
        },
        complete: () => {
          this.getEAV();
          form.reset();
        }
      });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openupdate(item: IEAV, content: any): void {
    this.addForm.reset()
    this.selectedEAV = item;
    this.updateForm?.patchValue({
      documentType: this.selectedEAV.value
    });
    this.openModal(content);
  }

  close(): void {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }

  updateEAV(form: FormGroup): void {
    if (form.valid && this.selectedEAV) {
      const payload = {
        id: this.selectedEAV.id,
        value: form.value.documentType,
      };
      this.subscription = this.http.postdata('entityAttributeValues/update', payload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Document type updated successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to update Document Type');
        },
        complete: () => {
          this.getEAV();
          form.reset();
          this.selectedEAV = {} as IEAV;
        }
      });
    }
  }

  opendelete(project: IEAV, content: any): void {
    this.addForm.reset();
    this.selectedEAV = project;
    this.openModal(content);
  }

  deleteEAV(): void {
    if (this.selectedEAV) {
      this.subscription = this.http.deleteData(`entityAttributeValues/${this.selectedEAV.id}`).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Document type deleted successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to delete Document Type');
        },
        complete: () => {
          this.getEAV();
          this.selectedEAV = {} as IEAV;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
