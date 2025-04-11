import { Component, ViewChild } from '@angular/core';
import { IRelationShip } from './relationship.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  ngOnInit(): void {
    this.RelationForm = this.fb.group({
      Relationship: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      Relationship: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.getRelationship();
  }
  // alphabet allowed only
  blockNonAlphabets(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    const char = String.fromCharCode(event.keyCode);
    // const pattern = /^[a-zA-Z][a-zA-Z ]*$/;
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    // if (!pattern.test(inputChar)) {
    //   event.preventDefault(); // blocks numbers or symbols
    // }
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
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
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
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
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    }
  }
  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(relationlist: any) {
    this.selectedId = relationlist.sno;
    this.updateForm.patchValue({ Relationship: relationlist.relationship1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  // DELETE
  opendelete(relationlist: any) {
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
        this.conformationPopup.openErrorModal('Failed to delete the location');
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
