import { Component, ViewChild } from '@angular/core';
import { IRelationShip } from './relationship.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-relationship',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './relationship.component.html',
  styleUrl: './relationship.component.scss'
})
export class RelationshipComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  RelationForm!: FormGroup;
  updateForm!: FormGroup;
  RelationshipDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleterelation: any = null;
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
    this.RelationForm = this.fb.group({
      Relationship: ['', [Validators.required, this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });
    this.updateForm = this.fb.group({
      Relationship: ['', [Validators.required, this.formValidations.maxCharactersValidator(51), Validators.pattern(/^[^\s].*$/)]]
    });

    this.getRelationship();
  }

  getRelationship() {
    this.http.getData('Relationship').subscribe((data: any) => {
      this.RelationshipDetail = data;
    });
  }
  //ADD
  addRelationship() {
    const request: IRelationShip = {
      relationship1: this.RelationForm.value.Relationship.trim(),
      isdeleted: "Active"
    };

    this.subscription = this.http.postdata('Relationship', request).subscribe({
      next: () => {
        this.getRelationship();
        this.conformationPopup.openSuccessModal('Relationship added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
        // this.resetForm();
      }
    });
  }
  // UPDATE
  updateRelation(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IRelationShip = {
        relationship1: this.updateForm.value.Relationship.trim(),
        isdeleted: "Active",
        sno: this.selectedId
      };

      this.subscription = this.http.postdata(`Relationship/UPDATER`, request).subscribe({
        next: () => {
          this.getRelationship();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Relationship updated successfully');
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
  openupdate(relationlist: any) {
    this.resetForm();
    this.selectedId = relationlist.sno;
    this.updateForm.patchValue({ Relationship: relationlist.relationship1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(relationlist: any) {
    this.resetForm();
    this.selectedDeleterelation = relationlist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleterelation) return;

    const deleteRequest: IRelationShip = {
      relationship1: this.selectedDeleterelation.relationship1,
      isdeleted: "void",
      sno: this.selectedDeleterelation.sno
    };

    this.http.postdata('Relationship/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getRelationship();
        modal.close();
        this.conformationPopup.openSuccessModal('Relationship deleted successfully');
      },
      error: (err: any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleterelation = null;
  }

  resetForm() {
    this.RelationForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
