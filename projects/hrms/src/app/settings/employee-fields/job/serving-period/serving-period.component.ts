import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IServingPeriod } from './servingPeriod.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
  selectedDeleteRole: any = null;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      Addgrade: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      jobgrade: ['', Validators.required],
    });

    this.updateForm = this.fb.group({
      Updatejobrole: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      updategraderole: ['', Validators.required],
    });
    this.getgradeid();
   
  }
  // alphabet allowed only
  blockNonAlphabets(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    const char = String.fromCharCode(event.keyCode);
    // const pattern = /^[a-zA-Z][a-zA-Z ]*$/;
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
  }
 
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getgradeid() {
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
      isDeleted: true
    };

    this.subscription = this.http.postdata('ServingPeriods', request).subscribe({
      next: () => {

        this.getgradeid();
        modal.close();
        this.conformationPopup.openSuccessModal('Serving period added successfully');
        
         this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
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
    this.updateForm.patchValue({ UpdateServingPeriod: servingPeriodList.duration });
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
        servingPeriodType: this.updateForm.value.Updatejobrole.trim(),
        duration: this.updateForm.value.updategraderole,
        isDeleted: true
      };

      this.subscription = this.http.postdata('GradeTable/UPDATER', request).subscribe({
        next: () => {

          this.getgradeid();
          modal.close();
          this.conformationPopup.openSuccessModal('GreadeDetails  Updated Successfully');
           this.resetForm();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');
          this.resetForm();
        }
      });
    }
  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
   onDelete(modal: any) {
      if (!this.selectedDeleteRole) return;
      const deleteRequest: IServingPeriod = {
        id: this.selectedDeleteRole.gradeId,
        servingPeriodType: this.selectedDeleteRole.gradeName.trim(),
        duration: this.selectedDeleteRole.jobGrade,
        isDeleted: false
      };
  
      this.http.postdata('GradeTable/UPDATER', deleteRequest).subscribe({
        next: () => {
         this.getgradeid();
          modal.close();
          this.conformationPopup.openSuccessModal('GreadeDetails Deleted successfully');
        },
        error: () => {
          this.conformationPopup.openErrorModal('Failed to delete the frequency');
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
