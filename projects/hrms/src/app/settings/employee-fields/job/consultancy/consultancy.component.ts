import { CommonModule, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { Iconsoltancy } from './consoltancy-model';
import { SettingsLoaderComponent } from "../../../../shared/settings-loader/settings-loader.component";


@Component({
  selector: 'app-consultancy',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent],
  templateUrl: './consultancy.component.html',
  styleUrl: './consultancy.component.scss'
})
export class ConsultancyComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  consultancyForm!: FormGroup;
  updateForm!: FormGroup;
  consultancyDetail: any[] = [];
  loader = false;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteCos: any = null;
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
    this.consultancyForm = this.fb.group({
      jobConsultancyName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      jobConsultancyName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    
    this.getconsoltancyDetail();
  }
  
  getconsoltancyDetail() {
    this.loader = true;
    this.http.getData('JobPosting/getAllConsultancyData').subscribe((data: any) => {
      this.consultancyDetail = data;
      this.loader = false;
    }, (error: any) => {
      this.loader = false;
    
    });
  }
  //ADD
  addConsoltancy(){
    const request : Iconsoltancy = {
      consultancyName: this.consultancyForm.value.jobConsultancyName.trim(),
      isdeleted: false
    };

   this.subscription = this.http.postdata('JobPosting/postConsultancyData', request).subscribe({
      next: () => {
        this.getconsoltancyDetail();
        this.conformationPopup.openSuccessModal('Consultancy Name added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
 
// UPDATE
  updateLocation(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request : Iconsoltancy = {
        consultancyName: this.updateForm.value.jobConsultancyName.trim(),
        isdeleted: false,
        id: this.selectedId
      };
   
      this.subscription = this.http.postdata('JobPosting/updateConsultancyData', request).subscribe({
        next: () => {
          this.getconsoltancyDetail();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Consultancy Name updated successfully');
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    }
  }
  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(cos: any) {
    this.selectedId = cos.id;
    this.updateForm.patchValue({ jobConsultancyName: cos.consultancyName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  opendelete(cos: any) {
    this.selectedDeleteCos = cos;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
// DELETE
  onDelete(modal: any) {
    if (!this.selectedDeleteCos) return;
    this.http.getData(`JobPosting/deleteConsultancyData/${this.selectedDeleteCos.id}`).subscribe({
      next: () => {
        this.getconsoltancyDetail();
        modal.close();
        this.conformationPopup.openSuccessModal('Consultancy Name deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the ConsultancyName');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteCos = null;
  }

  resetForm() {
    this.consultancyForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }
}
