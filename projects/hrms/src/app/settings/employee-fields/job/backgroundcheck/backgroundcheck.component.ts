import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import {backgroundcheckData } from './background-model';
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-backgroundcheck',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './backgroundcheck.component.html',
  styleUrl: './backgroundcheck.component.scss'
})
export class BackgroundcheckComponent {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  BackgroundCheckForm!: FormGroup;
  updateForm!: FormGroup;
  BackgroundCheckDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteBac: any = null;
  subscription!: Subscription;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService
  ) {}

  ngOnInit(): void {
    this.BackgroundCheckForm = this.fb.group({
      BackgroundCheck: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.updateForm = this.fb.group({
      BackgroundCheck: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });

    this.BackgroundChecktype();
  }

  // GET
  BackgroundChecktype(): void {
    this.subscription = this.http.getData('Background').subscribe({
      next: (data: any) => {
        console.log(data);
        this.BackgroundCheckDetail = data;
      }
    });
  }

  // ADD
  addBackgroundCheckType(): void {
    const request: backgroundcheckData = {
      backgroundcheckstatus1: this.BackgroundCheckForm.value.BackgroundCheck.trim(),
      isdeleted: 'Active'
    };

    this.subscription = this.http.postdata('Background', request).subscribe({
      next: () => {
        this.BackgroundChecktype();
        this.conformationPopup.openSuccessModal('Backgroundcheck name added successfully');
        this.resetForm();
      },
      error: () => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }

  // UPDATE
  updateBackgroundChecktype(modal: any): void {
    if (this.updateForm.valid && this.selectedId) {
      const request: backgroundcheckData = {
        backgroundcheckstatus1: this.updateForm.value.BackgroundCheck,
        isdeleted: 'Active',
        sno: this.selectedId
      };

      this.subscription = this.http.postdata('Background/UPDATER', request).subscribe({
        next: () => {
          this.BackgroundChecktype();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Backgroundcheck name updated successfully');
        },
        error: () => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    }
  }

  // OPEN UPDATE MODAL
  openupdate(backgroundchecklist: any): void {
    this.selectedId = backgroundchecklist.sno;
    this.updateForm.patchValue({ BackgroundCheck: backgroundchecklist.backgroundcheckstatus1 });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  // CLOSE UPDATE MODAL
  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }

  // OPEN DELETE MODAL
  opendelete(backgroundchecklist: any): void {
    this.selectedDeleteBac = backgroundchecklist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  // DELETE
  onDelete(modal: any): void {
    if (!this.selectedDeleteBac) return;

    const deleteRequest: backgroundcheckData = {
      backgroundcheckstatus1: this.selectedDeleteBac.backgroundcheckstatus1,
      isdeleted: 'void',
      sno: this.selectedDeleteBac.sno
    };

    this.http.postdata('Background/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.BackgroundChecktype();
        modal.close();
        this.conformationPopup.openSuccessModal('Backgroundcheck name deleted successfully');
      },
      error: () => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  // CLOSE DELETE MODAL
  closeDelete(modal: any): void {
    modal.dismiss();
    this.selectedDeleteBac = null;
  }

  // RESET FORM
  resetForm(): void {
    this.BackgroundCheckForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
