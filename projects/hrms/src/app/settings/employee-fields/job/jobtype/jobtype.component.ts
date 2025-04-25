import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import {JobtypeData } from './jobtype-module';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-jobtype',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './jobtype.component.html',
  styleUrl: './jobtype.component.scss'
})
export class JobtypeComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  JobtypeForm!: FormGroup;
  updateForm!: FormGroup;
  JobtypeDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
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
    this.JobtypeForm = this.fb.group({
      jobtype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]]
    });
    this.updateForm = this.fb.group({
      jobtype: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]]
    });

    this.getJobtype();
  }

  getJobtype() {
    this.subscription = this.http.getData('Jobtype').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobtypeDetail = data;
      },
    });
  }
 
  //ADD
  addjobType() {
    const request: JobtypeData = {
      jobType1: this.JobtypeForm.value.jobtype.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Jobtype', request).subscribe({
      next: () => {
        this.getJobtype();
        this.conformationPopup.openSuccessModal('Job Type added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
        this.resetForm();
      }
    });
  }
  // UPDATE
    updatejobtype(modal: any) {
      if (this.updateForm.valid && this.selectedId) {
        const request: JobtypeData = {
          jobType1: this.updateForm.value.jobtype,
          isdeleted: "Active",
          sno: this.selectedId
        };
  
        this.subscription = this.http.postdata('Jobtype/UPDATER', request).subscribe({
          next: () => {
            this.getJobtype();
            modal.close();
            this.updateForm.reset();
            this.conformationPopup.openSuccessModal('Job Type updated successfully');
          },
          error: (err: any) => {
            const errorMessage = err.error?.Message;
            this.conformationPopup.openErrorModal(errorMessage);
          }
        });
      }
    }
    close(modal: any) {
      modal.dismiss();
      this.updateForm.reset();
    }
    openupdate(jobtypelist: any) {
      this.selectedId = jobtypelist.sno;
      this.updateForm.patchValue({ jobtype: jobtypelist.jobType1 });
      this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
    }
    // DELETE
    opendelete(jobtypelist: any) {
      this.selectedDeleteDep = jobtypelist;
      this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
    }
    onDelete(modal: any) {
      if (!this.selectedDeleteDep) return;
  
      const deleteRequest: JobtypeData = {
        jobType1: this.selectedDeleteDep.jobType1,
        isdeleted: "void",
        sno: this.selectedDeleteDep.sno
      };
  
      this.http.postdata('Jobtype/UPDATER', deleteRequest).subscribe({
        next: () => {
          this.getJobtype();
          modal.close();
          this.conformationPopup.openSuccessModal('Job Type deleted successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  
    closeDelete(modal: any) {
      modal.dismiss();
      this.selectedDeleteDep = null;
    }
  
  resetForm() {
    this.JobtypeForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
