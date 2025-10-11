import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { Subscription } from 'rxjs';
import { IEAV } from '../../../../settings/project-management-configurations/models/project-type.modal';
import { Select } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-client-info',
  imports: [ReactiveFormsModule, CommonModule, TranslateModule, ConfirmationIconComponent, Select],
  templateUrl: './add-client-info.component.html',
  styleUrl: './add-client-info.component.scss'
})
export class AddClientInfoComponent implements OnInit, OnDestroy {
  clientForm!: FormGroup;
  empinfo: any = {};
  industryTypes: IEAV[] = [];
  spinnerLoader: boolean = false;
  clientAttachment: File | null = null;
  displayClientAttachment: string = '';
  fileErrorMessage: string = '';
  subscription!: Subscription;

  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal, private route: Router, private http: HttpService,
    public formValidation: FormValidationsService, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.clientForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(2), this.formValidations.maxCharactersValidator(51), this.formValidation.noEmojiValidator()]],
      taxId: ['', [Validators.required, Validators.minLength(3), this.formValidations.maxCharactersValidator(51), this.formValidation.noEmojiValidator()]],
      website: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/), this.formValidation.noEmojiValidator()]],
      industryType: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), this.formValidation.noEmojiValidator()]],
      logo: [null, Validators.required],
      clientAddress: ['', [Validators.required, this.formValidations.minCharactersValidator(5), this.formValidations.maxCharactersValidator(250), this.formValidation.noEmojiValidator()]],
      overtimeEligibility: [false],
      billable: [false],
      allowWeekendWork: [false]
    });
    this.getEAV();
    // Clean emojis dynamically as user types or pastes
    Object.keys(this.clientForm.controls).forEach(controlName => {
      this.formValidation.cleanEmojiOnChange(this.clientForm.get(controlName)!);
    });
  }

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Industry Type').subscribe({
      next: (data: any) => {
        this.industryTypes = data;
      },
      error: (error: any) => {
        this.industryTypes = [];
      }
    });
  }

  submitClientForm(): void {
    if (this.clientForm.valid) {
      this.spinnerLoader = true;
      const payload = this.createClientPayload();
      if (this.clientAttachment) {
        this.uploadClientAttachment(payload);
      } else {
        this.saveClientData(payload);
      }
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  uploadClientAttachment(payload: any): void {
    // Convert client name to snake_case
    const clientNameSnake = payload.clientName.trim().toLowerCase().replace(/\s+/g, "_");
    // Create timestamp
    const timestamp = new Date().getTime();
    // Get file extension
    const fileName = this.clientAttachment?.name;
    const fileExt = fileName?.substring(fileName?.lastIndexOf('.') + 1);
    // Build custom file path
    const filePath = `/ProjectManagement/Clients/logos/${clientNameSnake}_${timestamp}_logo.${fileExt}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          payload.logoPath = data.path; // Add uploaded file path to payload
          this.saveClientData(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload failed');
      }
    });
  }

  saveClientData(payload: any): void {
    this.subscription = this.http.postdata('Client', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.clientForm.reset();
        this.modalService.dismissAll();
        localStorage.setItem('newlyAddedClientId', res.data.clientId);
        // this.conformationPopup.openSuccessModal('Client added successfully');
        this.route.navigate(['/project-management/clients/add/contact-info'])
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err.error?.message);
      }
    });
  }

  createClientPayload(logoPath: string = ''): any {
    const formValue = this.clientForm.value;
    return {
      clientName: formValue.clientName,
      taxId: formValue.taxId,
      websiteUrl: formValue.website,
      industryType: formValue.industryType,
      logoPath: logoPath || '',
      address: formValue.clientAddress,
      status: "Archive",
      overtimeEligibile: formValue.overtimeEligibility,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowWeekendWork,
      createdBy: this.empinfo.employeeId,
      updatedBy: this.empinfo.employeeId
    };

  }

  onChangeClientAttachment(event: any): void {
    this.displayClientAttachment = '';
    this.fileErrorMessage = '';
    const file: File = event.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (!allowedTypes.includes(file.type)) {
      this.fileErrorMessage = 'Invalid file type. Only jpg, png, jpeg are allowed.';
      this.clientAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.clientAttachment = null;
      this.displayClientAttachment = '';
      this.fileErrorMessage = 'The file size should be less than 25MB.';
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.clientAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayClientAttachment = this.clientAttachment.name;
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  resetClientFormAttachment() {
    this.clientForm.get('logo')?.reset();
    this.clientForm.get('logo')?.markAsUntouched();
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    this.route.navigate(['/project-management/clients/active'])
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}