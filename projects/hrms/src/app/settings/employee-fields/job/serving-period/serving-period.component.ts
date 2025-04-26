import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IServingPeriod } from './servingPeriod.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-serving-period',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './serving-period.component.html',
  styleUrl: './serving-period.component.scss'
})
export class ServingPeriodComponent {
  subscription!: Subscription;
  servingPeriodDetails = [] as any;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteserving: any = null;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
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
    this.AddForm = this.fb.group({
      addServingPeriod: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]],
      Duration: ['',[ Validators.required, Validators.maxLength(50), Validators.pattern('^[0-9]*$')]],
    });

    this.updateForm = this.fb.group({
      UpdateServingPeriod: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(50)]],
      UpdateDuration: ['',[ Validators.required,Validators.maxLength(50), Validators.pattern('^[0-9]*$')]],
    });
    this.getServingPeriod();
   
  }
 
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getServingPeriod() {
    this.subscription = this.http.getData('ServingPeriods').subscribe({
      next: (data: any) => {
        console.log(data);
        this.servingPeriodDetails = data;
      },
    });
  }
  //ADD
  addServingPeriod(modal: any) {
    const request: IServingPeriod = {
      servingPeriodType: this.AddForm.value.addServingPeriod.trim(),
      duration: this.AddForm.value.Duration,
      isDeleted: false
    };

    this.subscription = this.http.postdata('ServingPeriods', request).subscribe({
      next: () => {

        this.getServingPeriod();
        modal.close();
        this.conformationPopup.openSuccessModal('Serving Period added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message || 'An error occurred while adding the serving period.';
        this.conformationPopup.openErrorModal(errorMessage);
         this.resetForm();
      }
    });
  }

  close(modal: any) {
    modal.close();
  }
// Method to open the update modal dialog
  openupdateDialog(servingPeriodList: any) {
    this.selectedId = servingPeriodList.id;
    this.updateForm.patchValue({ UpdateServingPeriod: servingPeriodList.servingPeriodType });
    this.updateForm.patchValue({ UpdateDuration: servingPeriodList.duration });
    this.modalService.open(this.updatepopup, {
    backdrop: 'static',
    centered: true
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IServingPeriod = {
        id: this.selectedId,
        servingPeriodType: this.updateForm.value.UpdateServingPeriod.trim(),
        duration: this.updateForm.value.UpdateDuration,
        isDeleted: false
      };

      this.subscription = this.http.postdata('ServingPeriods/UPDATER', request).subscribe({
        next: () => {

          this.getServingPeriod();
          modal.close();
          this.conformationPopup.openSuccessModal('Serving Period updated successfully');
           this.resetForm();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
          this.resetForm();
        }
      });
    }
  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(servingPeriodList: any) {
    this.selectedDeleteserving = servingPeriodList;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
   onDelete(modal: any) {
      if (!this.selectedDeleteserving) return;
      const deleteRequest: IServingPeriod = {
        id: this.selectedDeleteserving.id,
        servingPeriodType: this.selectedDeleteserving.servingPeriodType.trim(),
        duration: this.selectedDeleteserving.duration,
        isDeleted: true
      };
  
      this.http.postdata('ServingPeriods/UPDATER', deleteRequest).subscribe({
        next: () => {
         this.getServingPeriod();
          modal.close();
          this.conformationPopup.openSuccessModal('Serving Period deleted successfully');
        },
        error: ( err : any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  
  closeDelete(modal: any) {
    modal.dismiss();
  };


  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
