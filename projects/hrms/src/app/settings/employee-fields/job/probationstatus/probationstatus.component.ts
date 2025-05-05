
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { probitionData } from './provition-module';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';


@Component({
  selector: 'app-probationstatus',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './probationstatus.component.html',
  styleUrl: './probationstatus.component.scss'
})
export class ProbationstatusComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  probitionForm!: FormGroup;
  updateForm!: FormGroup;
  probitiontypeDetail: any[] = [];
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
    this.probitionForm = this.fb.group({
      probitiontype: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });
    this.updateForm = this.fb.group({
      probitiontype: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]]
    });

    this.getprobitiontype();
  }

  getprobitiontype() {
    this.subscription = this.http.getData('ProbationStatus').subscribe({
      next: (data: any) => {
        console.log(data);
        this.probitiontypeDetail = data;
      },
    });
  }
 
  //ADD
  addprobition() {
    const request: probitionData = {
      probationstatus1: this.probitionForm.value.probitiontype.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('ProbationStatus', request).subscribe({
      next: () => {
        this.getprobitiontype();
        this.conformationPopup.openSuccessModal('Probation Status added successfully');
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
      updateprobition(modal: any) {
        if (this.updateForm.valid && this.selectedId) {
          const request: probitionData = {
            probationstatus1: this.updateForm.value.probitiontype,
            isdeleted: "Active",
            sno: this.selectedId
          };
    
          this.subscription = this.http.postdata('ProbationStatus/UPDATER', request).subscribe({
            next: () => {
              this.getprobitiontype();
              modal.close();
              this.updateForm.reset();
              this.conformationPopup.openSuccessModal('Probation Status updated successfully');
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
        this.probitionForm.reset();
        this.updateForm.patchValue({ probitiontype: jobtypelist.probationstatus1 });
        this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
      }
      // DELETE
      opendelete(jobtypelist: any) {
        this.selectedDeleteDep = jobtypelist;
        this.probitionForm.reset();
        this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
      }
      onDelete(modal: any) {
        if (!this.selectedDeleteDep) return;
    
        const deleteRequest: probitionData = {
          probationstatus1: this.selectedDeleteDep.probationstatus1,
          isdeleted: "void",
          sno: this.selectedDeleteDep.sno
        };
    
        this.http.postdata('ProbationStatus/UPDATER', deleteRequest).subscribe({
          next: () => {
            this.getprobitiontype();
            modal.close();
            this.conformationPopup.openSuccessModal('Probation Status deleted successfully');
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
      this.probitionForm.reset();
      this.isEditMode = false;
      this.selectedId = null;
    }
  
    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}
