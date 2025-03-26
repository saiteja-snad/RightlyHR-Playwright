import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Iidentity, Iidentitydrop } from '../../../Interfaces/personal-modal';

@Component({
  selector: 'app-identity-details',
  imports: [CommonModule, Select, ReactiveFormsModule, DropdownModule],
  templateUrl: './identity-details.component.html',
  styleUrls: ['./identity-details.component.scss']
})
export class IdentityDetailsComponent implements OnInit {
  subscription!: Subscription;
  unmatchedIdentityDetails: any = [];

  getidentitydropdetails: Iidentitydrop[] = [];
  getIdentitydetails: Iidentity[] = [];
  identityForm!: FormGroup;
  empinfo: any = {};
  IdentityAttachment: any;
  IdentityMaxNumber = 12;
  IdentityMinNumber = 6;

  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getIdentityDropDown();
    this.initializeForm();
    this.getIdentityByEmpid();
  }

  initializeForm(): void {
    this.identityForm = this.fb.group({
      identityType: ['', Validators.required],
      identityNumber: ['', [
        Validators.required,
        Validators.minLength(this.IdentityMinNumber),
        Validators.maxLength(this.IdentityMaxNumber)
      ]],
      identityAttachment: ['', Validators.required]
    });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

 
  
  // Fetch identity details by employee ID
  getIdentityByEmpid(): void {
    const EmpId = parseInt(this.empinfo.employeeId);
    if (!EmpId) {
      console.error('Invalid Employee ID');
      return;
    }
  
    this.subscription = this.http.getData(`IdentityTable/${EmpId}`).subscribe({
      next: (data: any) => {
        this.getIdentitydetails = data;
        if (this.getIdentitydetails?.length) {
          this.getUnmatchedidentity();
        }
      },
      error: (err: any) => {
        console.error('Error fetching identity details:', err);
      },
    });
  }
  
  // Fetch identity dropdown options
  getIdentityDropDown(): void {
    this.subscription = this.http.getData(`OnboardingDocumentsList?identity=true`).subscribe({
      next: (data: any) => {
        this.getidentitydropdetails = data;
        if (this.getidentitydropdetails?.length) {
          this.getUnmatchedidentity();
        }
      },
      error: (err: any) => {
        console.error('Error fetching identity dropdown:', err);
      },
    });
  }
  
  // Filter unmatched identity details
  getUnmatchedidentity(): void {
    if (!this.getidentitydropdetails?.length || !this.getIdentitydetails?.length) {
      this.unmatchedIdentityDetails = [];
      return;
    }
  
    this.unmatchedIdentityDetails = this.getidentitydropdetails.filter((identityDetail) => {
      return !this.getIdentitydetails.some(
        (identity) => identity.identityType === identityDetail.documentName
      );
    });
  }
  
  onIdentityAttachmentSelected(event: any): void {
    const file = event.target.files[0];
    const timestamp = new Date().getTime();
    this.IdentityAttachment = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
    console.log('Identity attachment:', this.IdentityAttachment);
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  submitIdentityForm(form: FormGroup): void {
    if (form.valid) {
      const payload = this.createPayload();
      if (this.IdentityAttachment) {
        this.uploadIdentityAttachment(payload);
      } else {
        this.saveIdentityData(payload);
      }
    } else {
      form.markAllAsTouched();
    }
  }


  uploadIdentityAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Identity Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.IdentityAttachment)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path;
            this.saveIdentityData(payload);
          }
        },
        error: () => {
          console.error('File upload failed');
        }
      });
  }

  saveIdentityData(payload?: any): void {
    if (!payload) {
      payload = this.createPayload();
    }

    this.subscription = this.http.postdata('IdentityTable', payload).subscribe({
      next: () => {
        this.identityForm.reset();
        console.log('Data saved successfully');
      },
      error: () => {
        console.error('Error saving data');
      }
    });
  }

  createPayload(attachmentPath: string = ''): any {
    return {

      empId: parseInt(this.empinfo.employeeId),
      identityType: this.identityForm.get('identityType')?.value,
      identityNumber: this.identityForm.get('identityNumber')?.value,
      attachment: attachmentPath || '',

    };
  }
}