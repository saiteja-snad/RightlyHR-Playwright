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

@Component({
    selector: 'app-pre-on-boarding-documents',
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './pre-on-boarding-documents.component.html',
    styleUrl: './pre-on-boarding-documents.component.scss'
})
export class PreOnBoardingDocumentsComponent {

    subscription!: Subscription;
    gradedetails = [] as any;
    preonboardingDetails = [] as any;
    isEditMode = false;
    selectedId: number | null = null;
    selectedDeleteRole: any = null;
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
        public formValidations: FormValidationsService
    ) {

    }
    ngOnInit(): void {
        this.AddForm = this.fb.group({
            PreOnboardDocuments: ['', [
                Validators.required,
                Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'),
                Validators.maxLength(100)
            ]],
            isApplicableFresher: [false],
            isApplicableTrainee: [false],
            isApplicableExperienced: [false],
            isManadatory: [false],
            isIdentityDocument: [false]
        });

        this.updateForm = this.fb.group({
            UpdatePreOnboardDocuments: ['', [
                Validators.required,
                Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'),
                Validators.maxLength(100)
            ]]
        });
        // this.getgradeid();
        this.getPreonboarding();
    }

    getPreonboarding() {
        this.subscription = this.http
            .getData('OnboardingDocumentsList')
            .subscribe({
                next: (data: any) => {
                    this.preonboardingDetails = data;

                },
            });
    }
    // // Method to open the add modal dialog
    openDialog() {
        this.modalService.open(this.addpopup, {
            backdrop: 'static',
            centered: true
        });
    }
   
    //ADD
    addPreonboarding(modal: any) {
        // Determine isApplicable value based on checkboxes
        let isApplicable = "0"; 

        const isApplicableFresher = this.AddForm.value.isApplicableFresher;
        const isApplicableTrainee = this.AddForm.value.isApplicableTrainee;
        const isApplicableExperienced = this.AddForm.value.isApplicableExperienced;

        // If any specific option is selected, create a comma-separated string
        if (isApplicableFresher || isApplicableTrainee || isApplicableExperienced) {
            const applicableValues = [];
            if (isApplicableFresher) applicableValues.push("Fresher");
            if (isApplicableTrainee) applicableValues.push("Trainee");
            if (isApplicableExperienced) applicableValues.push("Experienced");

            if (applicableValues.length > 0) {
                isApplicable = applicableValues.join(",");
            }
        }

        const request: PreOnBoardingDocumentsData = {
            documentName: this.AddForm.value.PreOnboardDocuments.trim(),
            createdBy: 12443,  // You might want to get this from your user session
            isAppilicable: isApplicable,
            isDeleted: false,
            isIdentityDocument: this.AddForm.value.isIdentityDocument,
            isManadatory: this.AddForm.value.isManadatory,
            updatedBy: 12443   // You might want to get this from your user session
        };

        this.subscription = this.http.postdata('OnboardingDocumentsList', request).subscribe({
            next: () => {
                this.getPreonboarding();
                modal.close();
                this.conformationPopup.openSuccessModal('Document added successfully');
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
    openupdateDialog(updateDocumenttype: any) {
        this.selectedId = updateDocumenttype.id;

        this.updateForm.patchValue({
            UpdatePreOnboardDocuments: updateDocumenttype.documentName
        });

        this.modalService.open(this.updatepopup, {
            backdrop: 'static',
            centered: true
        });
    }
    //  UPDATE
    updatePreOnboarding(modal: any) {
        if (this.updateForm.valid && this.selectedId) {
            // Find the current document to preserve existing values
            const currentDocument = this.preonboardingDetails.find((doc: any) => doc.id === this.selectedId);

            if (!currentDocument) {
                this.conformationPopup.openErrorModal('Document not found');
                return;
            }

            const request: PreOnBoardingDocumentsData = {
                id: this.selectedId,
                documentName: this.updateForm.value.UpdatePreOnboardDocuments.trim(),
                // Preserve existing values for these fields
                isAppilicable: currentDocument.isAppilicable,
                isDeleted: currentDocument.isDeleted || false,
                isIdentityDocument: currentDocument.isIdentityDocument,
                isManadatory: currentDocument.isManadatory,
                createdBy: 12443,
                updatedBy: 12443
            };

            this.subscription = this.http.postdata('OnboardingDocumentsList/update', request).subscribe({
                next: () => {
                    this.getPreonboarding()
                    modal.close();
                    this.conformationPopup.openSuccessModal('Document updated successfully');
                    this.resetForm();
                },
                error: (error: any) => {
                    this.conformationPopup.openErrorModal('Update failed');
                    this.resetForm();
                }
            });
        }
     }
    
    // DELETE
    opendelete(jobroletypelist: any) {
        this.selectedDeleteRole = jobroletypelist;
        this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
    }
    onDelete(modal: any) {
        if (!this.selectedDeleteRole) return;

        this.subscription = this.http
            .getData(`OnboardingDocumentsList/deleteById/${this.selectedDeleteRole.id}`)
            .subscribe({
                next: () => {
                    modal.close();
                    this.getPreonboarding()
                    this.conformationPopup.openSuccessModal('Document deleted successfully');
                },
                error: (error: any) => {
                    this.conformationPopup.openErrorModal('Delete operation failed');
                }
            });
    }
    closeDelete(modal: any) {
        modal.dismiss();
    };


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


