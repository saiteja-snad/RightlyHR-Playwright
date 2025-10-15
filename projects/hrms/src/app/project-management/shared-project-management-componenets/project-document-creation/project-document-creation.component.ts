import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IEAV } from '../../../settings/project-management-configurations/models/project-type.modal';
import { Select } from 'primeng/select';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-project-document-creation',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, Select],
  templateUrl: './project-document-creation.component.html',
  styleUrl: './project-document-creation.component.scss'
})

export class ProjectDocumentCreationComponent {
  addDocumentForm!: FormGroup;
  subscription!: Subscription;
  Documentdata = [] as any;
  entitytype = 'Project';
  empinfo: any;
  currentDate: any;
  employeeDetails: any;
  clientAttachment: File | null = null;
  spinnerLoader: boolean = false;
  displayClientAttachment: string = '';
  documentTypes: IEAV[] = [];
  fileErrorMessage: string = '';
  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpService,
    private modalService: NgbModal, private conformationPopup: OpenModalService ,public formValidations: FormValidationsService,) { }

  ngOnInit() {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createDocumentForm();
    this.getAllActiveEmployees();
    this.getEAV();
  }

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Project Document Type').subscribe({
      next: (data: any) => {
        this.documentTypes = data;
      },
      error: (error: any) => {
        this.documentTypes = [];
      }
    });
  }

  // initialization of form
  createDocumentForm() {
    this.addDocumentForm = this.fb.group({
      documentName: [null, [Validators.required,  Validators.maxLength(101),
        Validators.minLength(2),
        this.formValidations.minCharactersValidator(2),
        this.formValidations.maxCharactersValidator(100),
        Validators.pattern(/^[^\s].*$/)
      ]],
    //  createdDate: [null, Validators.required],
      documentType: [null, Validators.required],
      documentUrl: [null, Validators.required]
    });
  }

  // get all active employees function
  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            id: employee.employeeId,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  // open delete modal
  opendeletModal(content: any,): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // open add modal
  openModal(content: any, data: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    this.addDocumentForm.patchValue({
      documentName: data?.documentName,
      createdDate: this.formatDateToLocal(data?.createdAt),
      documentType: data?.documentType,
      documentUrl: data?.documentUrl
    });
  }

  // data formatting function
  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  // file select function
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.addDocumentForm.patchValue({ documentUrl: file });
      this.addDocumentForm.get('documentUrl')?.markAsTouched();
    }
  }

  // file select and validation function
  onChangeClientAttachment(event: any): void {
      this.displayClientAttachment = '';
     this.fileErrorMessage = ''; 
    const file: File = event.target.files[0];
    if (!file) return;
     const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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

  // file rename function
  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  // file reset function
  resetClientFormAttachment() {
    this.addDocumentForm.get('documentUrl')?.reset();
    this.addDocumentForm.get('documentUrl')?.markAsUntouched();
  }

  // File upload function
  uploadClientAttachment(payload: any): void {
    let receivedData: any;
    this.http.clientId$.subscribe(data => {
      receivedData = data;
    });
    const clientIddata = receivedData;
    const filePath = `/ProjectManagement/Clients/${clientIddata}/Projects/${this.route.snapshot.queryParams['id']}/Documents`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          payload.documentUrl = data.path;
          this.saveProjectData(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload failed');
      }
    });
  }

  // Add document payload function
  AddDocument(logoPath: string = '') {
    if (this.addDocumentForm.invalid) {
      this.addDocumentForm.markAllAsTouched();
      return;
    }
    const formValue = this.addDocumentForm.value;
    const payload = {
      entityType: "project",
      entityId: this.route.snapshot.queryParams['id'],
      documentName: formValue.documentName,
      type: '',
      documentType: formValue.documentType,
      documentUrl: logoPath,
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: this.empinfo.employeeId,
    };
    return payload;
  }

  // Add document submit function
  addDocument(): void {
    if (this.addDocumentForm.valid) {
      this.spinnerLoader = true;
      const payload = this.AddDocument();
      if (this.clientAttachment) {
        this.uploadClientAttachment(payload);
      } else {
        this.saveProjectData(payload);
      }
    } else {
      this.addDocumentForm.markAllAsTouched();
    }
  }

  // project add document function
  saveProjectData(payload: any): void {
    this.http.postdata('Documents', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.addDocumentForm.reset();
        this.modalService.dismissAll();
        this.http.setnewdocumentsDetails();
        this.conformationPopup.openSuccessModal('Document added successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false;
         this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.addDocumentForm.reset();
  }

  close() {
    this.modalService.dismissAll();
  }
}