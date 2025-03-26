import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { Ibank } from '../../../Interfaces/personal-modal';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-bank-details',
  imports: [Select, CommonModule, ReactiveFormsModule],
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.scss'
})
export class BankDetailsComponent {
  banknames: Ibank[] = [];
  bankDetailsForm!: FormGroup;
  allBanks: any[] = [];
  empinfo: any = {};
  subscription!: Subscription
  proofValid: boolean = true;
  bankdocument: any
  constructor(private modalService: NgbModal, private http: HttpService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    this.initializeBankDetailsForm();
    this.getbanknames()

  }
  initializeBankDetailsForm(): void {
    this.bankDetailsForm = this.fb.group({
      bankName: ['', Validators.required], 
      accountName: ['', [Validators.required, ]],
      accountNo: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(20)]], 
      ifscCode: ['', [Validators.required, Validators.pattern('^[^\s].*$')]], 
      isPrimary: [false], 
      attachment: [null, Validators.required] 
    });
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }


  getbanknames() {
    this.subscription = this.http.getData(`Bank`).subscribe({
      next: (data: any) => {
        this.banknames = data;
        this.allBanks = this.banknames.map((item) => item.bankName1);
      },
    });
  }

  // onBankProofSelected(event: any): void {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const fileSizeInMB = file.size / (1024 * 1024);
  //     const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
  //     const fileExtension = file.name.split('.').pop()?.toLowerCase();

  //     if (fileSizeInMB > 25 || !allowedExtensions.includes(fileExtension || '')) {
  //       console.error('Invalid file. Only PDF and image files under 25MB are allowed.');
  //       // this.proofValid = false;
  //       // this.bankDetailsForm.get('attachment')?.setErrors({ invalidFile: true });
  //     } 
  //   }
  // }

  onBankProofSelected(event: any): void {
    const file = event.target.files[0];
    const timestamp = new Date().getTime();
    this.bankdocument = this.renameFileAttachment(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );
    console.log('Identity attachment:', this.bankdocument);
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  postBankDetails(): void {
    if (this.bankDetailsForm.valid) {
      const payload = this.createBankDetailsPayload();

      if (this.bankdocument) {
        this.uploadBankProof(payload);
      } else {
        this.saveBankDetails(payload);
      }
    } else {
      this.bankDetailsForm.markAllAsTouched();
    }
  }

  uploadBankProof(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Bank Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankdocument)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.attachment = data.path;
            this.saveBankDetails(payload);
          }
        },
        error: () => {
          console.error('File upload failed');
        }
      });
  }

  saveBankDetails(payload: any): void {
    this.subscription = this.http.postdata('BankDetail', payload).subscribe({
      next: () => {
        this.bankDetailsForm.reset();

      },
      error: (err: any) => {
        console.error('Error saving bank details:', err);

      }
    });
  }

  createBankDetailsPayload(attachmentPath: string = ''): any {
    return {
      empId: parseInt(this.empinfo.employeeId),
      bankName: this.bankDetailsForm.get('bankName')?.value,
      accountName: this.bankDetailsForm.get('accountName')?.value,
      accountNo: this.bankDetailsForm.get('accountNo')?.value,
      ifscCode: this.bankDetailsForm.get('ifscCode')?.value,
      isPrimary: this.bankDetailsForm.get('isPrimary')?.value,
      attachment: attachmentPath || ''
    };
  }
}
