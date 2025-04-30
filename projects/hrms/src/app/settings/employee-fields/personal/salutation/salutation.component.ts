import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormGroup,ReactiveFormsModule,FormsModule, Validators, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Iroles } from '../../../roles-permissions/roles/roles.model';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-salutation',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule,],
  templateUrl: './salutation.component.html',
  styleUrl: './salutation.component.scss'
})
export class SalutationComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  saluationdetails=[]as any[];
  updatesalutation={} as any;
  deletesalutation={} as any;
  subscription!: Subscription;
  isEditMode = false;

// salDeletedata: any;
constructor(
  private modalService: NgbModal,
  private conformationPopup: OpenModalService,
  private http: HttpService, 
  private fb:FormBuilder, 
  public formValidations:FormValidationsService,
  public rbac:RbacService,
) { }
  
  saluationForm!: FormGroup;
  updateForm!: FormGroup;
  
  ngOnInit(): void {
    this.saluationForm = this.fb.group({
      saluation: [
        '',
        [Validators.required, this.formValidations.maxCharactersValidator(51)],
      ],
    });
    this.updateForm = this.fb.group({
      titlename: [
        '',
        [Validators.required, this.formValidations.maxCharactersValidator(51)],
      ],
    });
    this.getsaluation();
 
    }
   
  getsaluation() {
    this.subscription = this.http.getData("Title").subscribe({
       next: (data: any) => {
         this.saluationdetails = data as Iroles[]
       },
       error: (reason: any) => {
         console.log(reason);
       }
     })
   }
onSubmit() {
    const request = {
      titlename: this.saluationForm?.get('saluation')?.value,
      isdeleted: "Active"
    }; 
  
    this.subscription = this.http.postdata("Title", request).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.saluationForm.reset();
        this.getsaluation(); 
        this.conformationPopup.openSuccessModal('Salutation added successfully');
      },
      error: (reason: any) => {
        const errorMessage = reason.error?.Message
        this.conformationPopup.openErrorModal(errorMessage);
        this.resetForm();
      }
    });
    
  }
  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(sal:any) {
    this.resetForm();
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
    this.updatesalutation=sal;
    this.updateForm?.patchValue({titlename : sal.titlename});

}
opendelete(sal:any) {
this.updatesalutation=sal;
this.resetForm();
this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
}
  updateSal(): void {
    if (this.updateForm.valid) {
      
      this.updatesalutation.titlename = this.updateForm.get('titlename')?.value;
      this.subscription = this.http.postdata(`Title/UPDATER`, this.updatesalutation).subscribe({
        next: (data: any) => {
          this.updateForm.reset(); 
          this.modalService.dismissAll(); 
          this.conformationPopup.openSuccessModal('Salutation updated successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    } else {
      this.conformationPopup.openErrorModal('Form is invalid. Please check the inputs.');
    }
  }
  
  deletesal(sal: any): void {
    const deleteRequest = {
      sno: sal.sno,
      titlename: sal.titlename,
      isdeleted: 'void' 
    };
  
   this.subscription= this.http.postdata('Title/UPDATER', deleteRequest).subscribe({
      next: (data:any) => {
       this.getsaluation(); 
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Salutation deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  resetForm() {
    this.saluationForm.reset();
    this.isEditMode = false;
    // this.selectedId = null;
  }
}
  

