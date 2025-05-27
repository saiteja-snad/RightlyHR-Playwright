import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { PreOnBoardingDocumentsData } from './pre-on-boarding.model';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-pre-on-boarding-documents',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './pre-on-boarding-documents.component.html',
  styleUrl: './pre-on-boarding-documents.component.scss',
})
export class PreOnBoardingDocumentsComponent {
  subscription!: Subscription;
  gradedetails = [] as any;
  preonboardingDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  displayforbothforfresher: number | null = null;
  displayforbothforexperience: number | null = null;
  displayforbothfortrainee: number | null = null;
  selectedDeleteRole: any = null;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  getid: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      PreOnboardDocuments: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(101)
        ],
      ],
      isApplicableFresher: [false],
      isApplicableTrainee: [false],
      isApplicableExperienced: [false],
      isManadatory: [false],
      isIdentityDocument: [false],
    });

    this.updateForm = this.fb.group({
      UpdatePreOnboardDocuments: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(101)
        ],
      ],
    });
    this.getid = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getPreonboarding();
  }

  getPreonboarding() {
    this.subscription = this.http.getData('OnboardingDocumentsList').subscribe({
      next: (data: any) => {
        this.preonboardingDetails = data;
      },
    });
  }
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true,
    });
  }

  //ADD
  // Click handlers (used for toggling logic and setting display flags)
  onClickFresherToggle() {
    const isChecked = this.AddForm.value.isApplicableFresher;
    this.displayforbothforfresher = isChecked ? 0 : 1;
    this.AddForm.patchValue({ isApplicableFresher: !isChecked });
  }

  onClickExperiencedToggle() {
    const isChecked = this.AddForm.value.isApplicableExperienced;
    this.displayforbothforexperience = isChecked ? 0 : 1;
    this.AddForm.patchValue({ isApplicableExperienced: !isChecked });
  }

  onClickTraineeToggle() {
    const isChecked = this.AddForm.value.isApplicableTrainee;
    this.displayforbothfortrainee = isChecked ? 0 : 1;
    this.AddForm.patchValue({ isApplicableTrainee: !isChecked });
  }

  // Uncheck/reset logic when modal closes
  uncheckMandatory() {
    this.AddForm.patchValue({
      isIdentityDocument: false,
      isManadatory: false,
      isApplicableExperienced: false,
      isApplicableTrainee: false,
      isApplicableFresher: false,
    });
    this.displayforbothforfresher = null;
    this.displayforbothforexperience = null;
    this.displayforbothfortrainee = null;
  }
  addPreonboarding(modal: any) {
    let isApplicable = '0';
    // Determine numeric mapping
    const applicableCodes = []; //array to store the selected values
    if (this.AddForm.value.isApplicableFresher) applicableCodes.push('1');
    if (this.AddForm.value.isApplicableExperienced) applicableCodes.push('2');
    if (this.AddForm.value.isApplicableTrainee) applicableCodes.push('3');
    if (applicableCodes.length === 3) {
      isApplicable = '0'; //if all the check boxes are selected related to the fresher,experince,trinee we nned to send 0(zero)
    } else if (applicableCodes.length > 0) {
      isApplicable = applicableCodes.join(','); //based on the selected value we need send the data
    } else if (applicableCodes.length <= 0) {
      isApplicable = '4'; //if all the check boxes are not selected related to the fresher,experince,trinee we nned to send 4
    }
    const request: PreOnBoardingDocumentsData = {
      documentName: this.AddForm.value.PreOnboardDocuments.trim(),
      createdBy: this.getid.employeeId,
      isAppilicable: isApplicable,
      isDeleted: false,
      isIdentityDocument: this.AddForm.value.isIdentityDocument,
      isManadatory: this.AddForm.value.isManadatory,
      updatedBy: this.getid.employeeId,
    };

    this.subscription = this.http
      .postdata('OnboardingDocumentsList', request)
      .subscribe({
        next: () => {
          this.getPreonboarding();
          modal.close();
          this.conformationPopup.openSuccessModal(
            'Document added successfully'
          );
          this.resetForm();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');
        },
      });
  }

  close(modal: any) {
    this.uncheckMandatory();
    modal.close();
  }

  // Method to open the update modal dialog
  openupdateDialog(updateDocumenttype: any) {
    this.selectedId = updateDocumenttype.id;

    this.updateForm.patchValue({
      UpdatePreOnboardDocuments: updateDocumenttype.documentName,
    });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  //  UPDATE
  updatePreOnboarding(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const currentDocument = this.preonboardingDetails.find(
        (doc: any) => doc.id === this.selectedId
      );

      if (!currentDocument) {
        this.conformationPopup.openErrorModal('Document not found');
        return;
      }

      const request: PreOnBoardingDocumentsData = {
        id: this.selectedId,
        documentName: this.updateForm.value.UpdatePreOnboardDocuments.trim(),
        isAppilicable: currentDocument.isAppilicable,
        isDeleted: currentDocument.isDeleted || false,
        isIdentityDocument: currentDocument.isIdentityDocument,
        isManadatory: currentDocument.isManadatory,
        createdBy: this.getid.employeeId,
        updatedBy: this.getid.employeeId,
      };

      this.subscription = this.http
        .postdata('OnboardingDocumentsList/update', request)
        .subscribe({
          next: () => {
            this.getPreonboarding();
            modal.close();
            this.conformationPopup.openSuccessModal(
              'Document updated successfully'
            );
            this.resetForm();
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal('Update failed');
          },
        });
    }
  }

  // DELETE
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;

    this.subscription = this.http
      .getData(
        `OnboardingDocumentsList/deleteById/${this.selectedDeleteRole.id}`
      )
      .subscribe({
        next: () => {
          modal.close();
          this.getPreonboarding();
          this.conformationPopup.openSuccessModal(
            'Document deleted successfully'
          );
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Delete operation failed');
        },
      });
  }
  closeDelete(modal: any) {
    modal.dismiss();
  }

  resetForm() {
    this.AddForm.reset();
    this.updateForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


