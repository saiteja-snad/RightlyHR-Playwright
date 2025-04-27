import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OvertimeData } from './overtime-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-overtime',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './overtime.component.html',
  styleUrl: './overtime.component.scss'
})
export class OvertimeComponent implements OnInit,OnDestroy {

  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  OvertimeForm!: FormGroup;
  updateForm!: FormGroup;
  overtimeDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteovr: any = null;
  subscription!: Subscription;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.OvertimeForm = this.fb.group({
      overtime: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]]
    });
    this.updateForm = this.fb.group({
      overtime: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]]
    });

    this.getovertime();
  }

  getovertime() {
    this.http.getData('Overtime').subscribe((data: any) => {
      this.overtimeDetail = data;
    });
  }
  //ADD
  AddOvertime() {
    const request: OvertimeData = {
      overtimeeligibility1: this.OvertimeForm.value.overtime.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Overtime', request).subscribe({
      next: () => {
        this.getovertime();
        this.conformationPopup.openSuccessModal('Overtime Eligibility added successfully');
         this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.message;
        this.conformationPopup.openErrorModal(errorMessage);
         this.resetForm();
      }
    });
  }
  // UPDATE
    updateovertime(modal: any) {
      if (this.updateForm.valid && this.selectedId) {
        const request: OvertimeData = {
          overtimeeligibility1: this.updateForm.value.overtime.trim(),
          isdeleted: "Active",
          sno: this.selectedId
        };
  
        this.subscription = this.http.postdata('Overtime/UPDATER', request).subscribe({
          next: () => {
            this.getovertime();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal('Overtime Eligibility updated successfully');
          },
          error: (err: any) => {
            const errorMessage = err.error?.message;
            this.conformationPopup.openErrorModal(errorMessage);
          }
        });
      }
    }
    close(modal: any) {
      modal.dismiss();
      this.updateForm.reset();
    }
    openupdate(overtimedetails: any) {
      this.selectedId = overtimedetails.sno;
      this.OvertimeForm.reset();
      this.updateForm.patchValue({ overtime: overtimedetails.overtimeeligibility1 });
      this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
    }
    // DELETE
      opendelete(overtimedetails: any) {
        this.selectedDeleteovr = overtimedetails;
        this.OvertimeForm.reset();
        this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
      }
      onDelete(modal: any) {
        if (!this.selectedDeleteovr) return;
    
        const deleteRequest: OvertimeData = {
          overtimeeligibility1: this.selectedDeleteovr.overtimeeligibility1,
          isdeleted: "void",
          sno: this.selectedDeleteovr.sno
        };
    
        this.http.postdata('Overtime/UPDATER', deleteRequest).subscribe({
          next: () => {
            this.getovertime();
            modal.close();
            this.conformationPopup.openSuccessModal('Overtime Eligibility deleted successfully');
          },
          error: (err: any) => {
            const errorMessage = err.error?.message;
            this.conformationPopup.openErrorModal(errorMessage);
          }
        });
      }
    
      closeDelete(modal: any) {
        modal.dismiss();
        this.selectedDeleteovr = null;
      }
    
      resetForm() {
        this.OvertimeForm.reset();
        this.isEditMode = false;
        this.selectedId = null;
      }
    
      ngOnDestroy(): void {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
      }
}
