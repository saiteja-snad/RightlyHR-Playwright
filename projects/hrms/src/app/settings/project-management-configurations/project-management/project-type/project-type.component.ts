import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";
import { SettingsDeleteIconComponent } from "../../../../icons/settings-delete-icon/settings-delete-icon.component";
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";
import { IEAV } from '../../models/project-type.modal';

@Component({
  selector: 'app-project-type',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsUpdateIconComponent, SettingsDeleteIconComponent, SettingsLoaderComponent],
  templateUrl: './project-type.component.html',
  styleUrl: './project-type.component.scss'
})
export class ProjectTypeComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  addForm!: FormGroup;
  updateForm!: FormGroup;
  projectTypes: IEAV[] = [];
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
      projectType: [null, [Validators.required, this.formValidations.minCharactersValidator(2),this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      projectType: [null, [Validators.required, this.formValidations.minCharactersValidator(2), this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
  }

  getEAV() {
    this.loading = true;
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Project Type').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.projectTypes = data;
      },
      error: (error: any) => {
        this.loading = false;
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
        attribute: 'Project Type',
        value: form.value.projectType,
        meta: ''
      };
      this.subscription = this.http.postdata('entityAttributeValues', payload).subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Project Type added successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to add Project Type');
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

  openupdate(project: IEAV, content: any): void {
    this.addForm.reset();
    this.selectedEAV = project;
    this.updateForm?.patchValue({
      projectType: this.selectedEAV.value
    });
    this.openModal(content);
  }

  close(): void {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }

  updateProjectType(form: FormGroup): void {
    if (form.valid && this.selectedEAV) {
      const payload = {
        id: this.selectedEAV.id,
        value: form.value.projectType,
      };
      this.subscription = this.http.postdata('entityAttributeValues/update', payload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Project Type updated successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to update Project Type');
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

  deleteProjectType(): void {
    if (this.selectedEAV) {
      this.subscription = this.http.deleteData(`entityAttributeValues/${this.selectedEAV.id}`).subscribe({  
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Project Type deleted successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to delete Project Type');  
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
