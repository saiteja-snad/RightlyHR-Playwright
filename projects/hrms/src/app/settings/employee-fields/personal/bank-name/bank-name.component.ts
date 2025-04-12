import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-bank-name',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './bank-name.component.html',
  styleUrl: './bank-name.component.scss'
})
export class BankNameComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  bankdetails=[]as any[];
  updateBankdetails={} as any;
  
  subscription!: Subscription;
  bank=[]as any[];


// salDeletedata: any;
constructor(private modalService: NgbModal,private conformationPopup: OpenModalService,private http: HttpService, private fb:FormBuilder) { }
  
bankForm!: FormGroup;
  updateForm!: FormGroup;
  
  ngOnInit(): void {
    this.bankForm = this.fb.group({
     
      bank: [null, [Validators.required]]
      });
      this.updateForm = this.fb.group({
        bankName2: ["", Validators.required] 
      });
    this.getBank();
  
      
    }
  getBank() {
    this.subscription = this.http.getData("Bank").subscribe({
       next: (data: any) => {
         console.log(data);
         this.bankdetails = data as any[];
         console.log(this.bankdetails)
       },
       error: (reason: any) => {
         console.log(reason);
         alert("Insertion of data is failed")
       }
     })
   }
onSubmit() {
  const request = {
    bankName1: this.bankForm?.get('bank')?.value,
    IsDeleted: "Active"
  };

  console.log('Sending request:', request); 

  this.subscription = this.http.postdata("Bank", request).subscribe({
    next: (data: any) => {
      console.log('Response:', data);
      this.modalService.dismissAll();
      this.bankForm.reset();
      this.getBank(); 
      this.conformationPopup.openSuccessModal('Bank added successfully');
    },
    error: (reason: any) => {
      console.error('Error:', reason);
      this.conformationPopup.openErrorModal('Failed to add bank data');
    }
  });
}

  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(bank:any) {
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
    console.log(bank)
    this.updateBankdetails=bank;
    this.updateForm?.patchValue({bankName1 : bank.bankName1});

}
opendelete(bank:any) {
console.log(bank)
this.updateBankdetails=bank;
this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
}
updateBank(): void {
  if (this.updateForm.valid) {
    
    this.updateBankdetails.bankName2 = this.updateForm.get('bankName2')?.value;
    this.subscription = this.http.postdata(`Bank/UPDATER`, this.updateBankdetails).subscribe({
      next: (data: any) => {
        this.updateForm.reset(); 
        this.modalService.dismissAll(); 
        this.conformationPopup.openSuccessModal('bank updated successfully');
      },
      error: (err: any) => {
        console.error('Update failed:', err);
        this.conformationPopup.openErrorModal('Update failed. Please try again.');
      }
    });
  } else {
    this.conformationPopup.openErrorModal('Form is invalid. Please check the inputs.');
  }
}
  deletebank(bank: any): void {
    const deleteRequest = {
      sno: bank.sno,
      bankName1 : bank.bankName1,
      isdeleted: 'void' 
    };
  
   this.subscription= this.http.postdata('Bank/UPDATER', deleteRequest).subscribe({
      next: (data:any) => {
       this.getBank(); 
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('bank data deleted successfully');
      },
      error: (err: any) => {
        console.error('Delete bank failed:', err);
        this.conformationPopup.openErrorModal('Failed to delete bank data');
      }
    });
  }
  
    
}