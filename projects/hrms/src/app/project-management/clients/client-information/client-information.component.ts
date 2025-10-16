import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Client } from '../../../Interfaces/clients.model';
import { DomSanitizer } from '@angular/platform-browser';
import { OpenModalService } from '../../../services/open-modal.service';
import { EditIconComponent } from "../../../icons/edit-icon/edit-icon.component";
import { RbacService } from '../../../services/rbac.service';
import { Skeleton } from 'primeng/skeleton';
import { FormValidationsService } from '../../../services/form-validations.service';
import { Select } from 'primeng/select';
import { IEAV } from '../../../settings/project-management-configurations/models/project-type.modal';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-client-information',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Skeleton, EditIconComponent, Select],
  templateUrl: './client-information.component.html',
  styleUrl: './client-information.component.scss'
})

export class ClientInformationComponent {
  clientForm!: FormGroup;
  empinfo: any = {};
  logoimg: any;
  clients: Client[] = [];
  subscription!: Subscription;
  clientID: any;
  buttons = false;
  spinnerLoader: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  clientAttachment: any;
  loading: boolean = false;
  displayClientAttachment: any;
  industryTypes: IEAV[] = [];
  inactiveClientStatus: any;

  constructor(private fb: FormBuilder, public formValidation: FormValidationsService, private http: HttpService,
    private route: ActivatedRoute, private sanitizer: DomSanitizer, private conformationPopup: OpenModalService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.intizationFrom()
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.getClientsData(clientID);
        this.clientID = clientID;
      }
    });
    this.getEAV();
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

  intizationFrom() {
    const attachmentValidators = this.clientAttachment ? [] : [Validators.required];
    this.clientForm = this.fb.group({
      clientName: [{ value: null, disabled: true }, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51), this.formValidation.noEmojiValidator()]],
      taxId: [{ value: null, disabled: true }, [Validators.required, this.formValidation.minCharactersValidator(3), this.formValidation.maxCharactersValidator(51), this.formValidation.noEmojiValidator()]],
      website: [{ value: null, disabled: true }, [Validators.required, this.formValidation.minCharactersValidator(5), this.formValidation.maxCharactersValidator(51), Validators.pattern(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/), this.formValidation.noEmojiValidator()]],
      industryType: [{ value: null, disabled: true }, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51), this.formValidation.noEmojiValidator()]],
      clientAddress: [{ value: null, disabled: true }, [Validators.required, this.formValidation.minCharactersValidator(5), this.formValidation.maxCharactersValidator(250), this.formValidation.noEmojiValidator()]],
      overtimeEligibility: [{ value: null, disabled: true }],
      billable: [{ value: null, disabled: true }],
      allowWeekendWork: [{ value: null, disabled: true }],
      logo: [{ value: '', disabled: true }, attachmentValidators]
    });
    // Clean emojis dynamically as user types or pastes

    // Object.keys(this.clientForm.controls).forEach(controlName => {
    //   this.formValidation.cleanEmojiOnChange(this.clientForm.get(controlName)!);
    // });

  }

  getClientsData(clientID: any): void {
    this.loading = true;
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res?.data) ? res.data : [];
        if (res.success && res.data) {
          //from bind 
          this.loadClientDetails(res.data);
          // download and bind logo
          if (res.data.logoPath) {
            this.onSelectprofilePicDownload(res.data.logoPath);
          }
        }
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        this.clients = [];
        this.loading = false
        console.error('Error fetching clients:', err);
      }
    });
  }

  loadClientDetails(client: Client): void {
    this.loading = false
    this.clientForm.patchValue({
      clientName: client.clientName,
      taxId: client.taxId,
      website: client.websiteUrl,
      industryType: client.industryType,
      clientAddress: client.address,
      overtimeEligibility: client.overtimeEligibile,
      billable: client.billable,
      allowWeekendWork: client.weekendWorkAllowed
    });
    this.clientAttachment = client.logoPath
    this.displayClientAttachment = client.logoPath
      ? client.logoPath.split('/').pop() : null;
    const attachmentValidators = this.displayClientAttachment ? [] : [Validators.required];
    this.clientForm.get('logo')?.setValidators(attachmentValidators);
    this.clientForm.get('logo')?.updateValueAndValidity();
  }

  onSelectprofilePicDownload(logoPath: string): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', logoPath).subscribe({
      next: (res: any) => {
        const blob = new Blob([res.body], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        this.logoimg = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (err) => {
        console.error('Error downloading logo:', err);
      }
    });
  }

  onChangeClientAttachment(event: any): void {
    const attachmentValidators = this.displayClientAttachment ? [] : [Validators.required];
    this.clientForm.get('logo')?.setValidators(attachmentValidators);
    this.clientForm.get('logo')?.updateValueAndValidity();
    this.displayClientAttachment = '';
    const file: File = event.target.files[0];

      
  if (!file) {
    this.clientAttachment = null;
     const attachmentValidators = this.displayClientAttachment ? [] : [Validators.required];
    this.clientForm.get('logo')?.setValidators(attachmentValidators);
    this.clientForm.get('logo')?.updateValueAndValidity();
    this.resetClientFormAttachment();
    return;
  }
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (!allowedTypes.includes(file.type)) {
      this.conformationPopup.openErrorModal('Invalid file type. Only jpg, png, jpeg, are allowed.');
      this.clientAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.clientAttachment = null;
      this.displayClientAttachment = '';
      this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.clientAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayClientAttachment = this.clientAttachment.name;
  }

  resetClientFormAttachment() {
    this.clientForm.get('logo')?.reset();
    this.clientForm.get('logo')?.markAsUntouched();
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  showButtons(): void {
    this.buttons = !this.buttons;
    if (this.buttons) {
      this.clientForm.enable()
    }
    else {
      this.clientForm.disable();
      this.clientForm.reset();
      this.getClientsData(this.clientID);
    }
  }

  submitClientForm(): void {
    if (this.clientForm.valid) {
      this.spinnerLoader = true;
      const payload = this.createClientPayload();
      if (this.clientAttachment instanceof File) {
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
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
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
    this.http.putData(`Client/${this.clientID}`, payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.getClientsData(this.clientID);
        this.conformationPopup.openSuccessModal('Client Info updated successfully');
        setTimeout(() => {
          this.clientForm.disable();
          this.buttons = false;
        }, 0);
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('Failed to add client. Please try again.');
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
      status: "Active",
      overtimeEligibile: formValue.overtimeEligibility,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowWeekendWork,
      createdBy: this.empinfo.employeeId,
      updatedBy: this.empinfo.employeeId
    };
  }
}