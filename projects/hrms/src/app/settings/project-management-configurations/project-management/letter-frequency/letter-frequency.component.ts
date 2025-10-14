import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";
import { IEAV } from '../../models/project-type.modal';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";
import { SettingsDeleteIconComponent } from "../../../../icons/settings-delete-icon/settings-delete-icon.component";
@Component({
  selector: 'app-letter-frequency',
  imports: [NoDataFoundComponent, SettingsLoaderComponent, CommonModule, TranslateModule, ReactiveFormsModule, SettingsUpdateIconComponent, SettingsDeleteIconComponent],
  templateUrl: './letter-frequency.component.html',
  styleUrl: './letter-frequency.component.scss'
})

export class LetterFrequencyComponent {
  loading = false;
  letterFrequencies: IEAV[] = [];
  subscription!: Subscription;
  selectedEAV!: IEAV;

  addForm!: FormGroup;
  updateForm!: FormGroup
  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService) { }

  ngOnInit(): void {
    this.getLetterFrequencies();
    this.initialiseForm();
    this.intialistonUpdate()
  }


  initialiseForm() {
    this.addForm = this.fb.group({
      letterfrequency: [null, [Validators.required, this.formValidations.minCharactersValidator(2), this.formValidations.maxCharactersValidator(51)]]
    });


  }

  intialistonUpdate() {
    this.updateForm = this.fb.group({
      letterfrequencyupdate: [null, [Validators.required, this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51)]]
    });
  }


  getLetterFrequencies() {
    this.loading = true;
    this.subscription = this.http
      .getData('entityAttributeValues?entity=ProjectManagementLetterConfiguration&attribute=frequency')
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.letterFrequencies = data;
        },
        error: (error: any) => {
          this.loading = false;
          this.letterFrequencies = [];
          console.error('Error fetching letter frequencies', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  onAddSubmit(form: FormGroup) {
    if (form.valid) {
      const payload = {
        entity: 'ProjectManagementLetterConfiguration',
        attribute: 'frequency',
        value: form.value.letterfrequency,
        meta: ''
      };
      this.subscription = this.http.postdata('entityAttributeValues', payload).subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Letter Frequency added successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to add Letter Frequency');
        },
        complete: () => {
          this.getLetterFrequencies();
          form.reset();
        }
      });
    }
  }
  
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openupdate(item: IEAV, content: any): void {
    this.addForm.reset();
    this.selectedEAV = item;
    this.updateForm?.patchValue({
      letterfrequencyupdate: this.selectedEAV.value
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
        value: form.value.letterfrequencyupdate,
      };
      this.subscription = this.http.postdata('entityAttributeValues/update', payload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Letter Frequency updated successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to update Letter Frequency');
        },
        complete: () => {
          this.getLetterFrequencies();
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
          this.conformationPopup.openSuccessModal('Letter Frequency deleted successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to delete Document Type');
        },
        complete: () => {
          this.getLetterFrequencies();
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