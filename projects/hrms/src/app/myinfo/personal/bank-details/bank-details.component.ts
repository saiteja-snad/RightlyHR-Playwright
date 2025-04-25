import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { Ibank, Ibankdetails } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-bank-details',
  imports: [Select, CommonModule, ReactiveFormsModule, NoDataFoundComponent],
  templateUrl: './bank-details.component.html',
  styleUrl: './bank-details.component.scss'
})
export class BankDetailsComponent implements OnInit,OnDestroy {
  banknames: Ibank[] = [];
  bankDetailsForm!: FormGroup;
  bankid: any
  bankDetailsUpdateForm!: FormGroup
  bankDetails = new BehaviorSubject<Ibankdetails[]>([])
  empinfo: any = {};
  subscription!: Subscription
  proofValid: boolean = true;
  bankdocument: any
  displayblankdocument:any
  constructor(private readonly modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService,public rbac: RbacService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeBankDetailsForm();
    this.initializeBankDetailsupdateForm()
    this.getbanknames()
    this.getbankempid()
  }
  initializeBankDetailsForm(): void {
    this.bankDetailsForm = this.fb.group({
      bankName: ['', Validators.required],
      accountName: ['', [Validators.required,]],
      accountNo: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern('^[^\s].*$')]],
      isPrimary: [false],
      attachment: [null, Validators.required]
    });
  }
  initializeBankDetailsupdateForm(): void {
    this.bankDetailsUpdateForm = this.fb.group({
      bankNameupdate: ['', Validators.required],
      accountNameupdate: ['', [Validators.required,]],
      accountNoupdate: ['', [Validators.required]],
      ifscCodeupdate: ['', [Validators.required, Validators.pattern('^[^\s].*$')]],
      isPrimaryupdate: [false],
      attachmentupdate: [null]
    });
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
  //drop drown
  getbanknames(): void {
    this.subscription = this.http.getData(`Bank`).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.banknames = data.sort((a: any, b: any) =>
            (a.bankName1 || '').localeCompare(b.bankName1 || '')
          );
        } else {
          console.warn('No bank names found');
          this.banknames = [];
        }
      },
      error: (err: any) => {
        console.error('Error fetching bank names:', err);
      }
    });
  }
  //Bank Details
  getbankempid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`BankDetail/${EmpId}`).subscribe({
      next: (data: any) => {
        this.bankDetails.next(data);
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
            payload.docUrl= data.path;
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
        this.getbankempid()
        this.bankDetailsForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Bank details added successfully')
      },
      error: (err: any) => {
        console.error('Error saving bank details:', err);
        this.conformationPopup.openErrorModal('Bank details added failed')
      }
    });
  }

  createBankDetailsPayload(attachmentPath: string = ''): any {
    return {
      empId: parseInt(this.empinfo.employeeId),
      bankName: this.bankDetailsForm.get('bankName')?.value?.bankName1,
      accountName: this.bankDetailsForm.get('accountName')?.value,
      accountNo: this.bankDetailsForm.get('accountNo')?.value,
      ifscCode: this.bankDetailsForm.get('ifscCode')?.value,
      isPrimary: this.bankDetailsForm.get('isPrimary')?.value || false,
     
    };
  }
  //download Functionality
  onSelectBankProofDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.docUrl)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.docUrl.split('/')[file.docUrl.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }

  //keypress
  restrictInput(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;

    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }

    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    const isAlphabetic = /^[A-Za-z\s]$/.test(key);
    if (!isAlphabetic) {
      event.preventDefault();
    }
  }



  openModalupdate(content: any, bankDetail: any): void {
    console.log(bankDetail)
    this.bankid = bankDetail.bankId
    const selectedBank = this.banknames.find(
      (bank) => bank.bankName1 === bankDetail.bankName
    );

    // Patch the values into the form
    this.bankDetailsUpdateForm.patchValue({
      bankNameupdate: selectedBank,
      accountNameupdate: bankDetail.accountName,
      accountNoupdate: bankDetail.accountNo,
      ifscCodeupdate: bankDetail.ifscCode,
      isPrimaryupdate: bankDetail.isPrimary,

    });
    this.displayblankdocument= bankDetail.docUrl
    ? bankDetail.docUrl.split('/').pop()
    : null;
   
    this.bankdocument = bankDetail.docUrl
   

    // Open the modal
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updateBankDetails(): void {
    if (this.bankDetailsUpdateForm.valid) {
      const formData = this.bankDetailsUpdateForm.value;

      // Prepare the payload
      const payload = {
        bankId: this.bankid,
        empId: parseInt(this.empinfo.employeeId),
        docUrl:this.bankdocument,
        bankName: formData.bankNameupdate?.bankName1 || formData.bankNameupdate, // Extract bank name
        accountName: formData.accountNameupdate, // Account holder's name
        accountNo: formData.accountNoupdate, // Account number
        ifscCode: formData.ifscCodeupdate,
        isPrimary: formData.isPrimaryupdate || false, // Primary account flag
        isDeleted: false,

      };

      console.log('Payload being sent:', payload); // Debugging log

      // Check if a new attachment is selected
      if (this.bankdocument instanceof File) {
        this.uploadUpdatedBankAttachment(payload);
      } else {
        this.saveUpdatedBankDetails(payload);
      }
    } else {
      this.bankDetailsUpdateForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  uploadUpdatedBankAttachment(payload: any): void {
    const filePath = `/FusionDocuments/Employee Documents/Bank Documents/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.bankdocument)
      .subscribe({
        next: (data: any) => {
          if (data) {
            payload.docUrl = data.path; // Update the payload with the uploaded file path
            this.saveUpdatedBankDetails(payload);
          }
        },
        error: () => {
          console.error('File upload failed');
          this.conformationPopup.openErrorModal('Failed to upload bank proof. Please try again.');
        }
      });
  }

  saveUpdatedBankDetails(payload: any): void {
    this.subscription = this.http.postdata(`BankDetail/Update`, payload).subscribe({
      next: (data: any) => {
        console.log('Bank details updated successfully:', data);
        this.bankDetailsUpdateForm.reset();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Bank details updated successfully');
        this.getbankempid(); // Refresh the bank details list
      },
      error: (reason: any) => {
        console.error('Error updating bank details:', reason);
        this.conformationPopup.openErrorModal('Failed to update bank details. Please check all fields.');
      }
    });
  }
  opendeletModal(content: any, bankDetail: any): void {
    this.bankid = bankDetail.bankId; 
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  bankDelete(): void {
    if (!this.bankid) {
      console.error('Bank ID is not set. Cannot delete bank details.');
      return;
    }
  
    this.subscription = this.http
      .getData(`BankDetail/deletebyid/${this.bankid}`)
      .subscribe({
        next: (data: any) => {
          console.log('Bank details deleted successfully:', data);
          this.getbankempid(); // Refresh the bank details list
          this.modalService.dismissAll(); // Close the modal
        this.conformationPopup.openSuccessModal('Bank details deleted successfully')
       
        },
        error: (reason: any) => {
          console.error('Error deleting bank details:', reason);
          this.conformationPopup.openErrorModal('Failed to delete bank details. Please try again.');
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
