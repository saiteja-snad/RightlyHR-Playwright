
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
@Component({
  selector: 'app-degree',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './degree.component.html',
  styleUrl: './degree.component.scss',
})
export class DegreeComponent implements OnInit {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  degreedetails = [] as any[];
  updateDegreeDetails = {} as any;

  subscription!: Subscription;
  degree = {} as any;

  constructor(
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}

  degreeFrom!: FormGroup;
  updateForm!: FormGroup;

  ngOnInit(): void {
    this.degreeFrom = this.fb.group({
      degree: [null, [Validators.required]],
    });
    this.updateForm = this.fb.group({
      degreeName: ['', Validators.required],
    });
    this.getdegree();
  }

  getdegree() {
    this.subscription = this.http.getData('Degree').subscribe({
      next: (data: any) => {
        this.degreedetails = data as any[];
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  onSubmit() {
    const request = {
      degreeName: this.degreeFrom.get('degree')?.value,
      isdeleted: 'Active',
    };

    this.subscription = this.http.postdata('Degree', request).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.degreeFrom.reset();
        this.getdegree();
        this.conformationPopup.openSuccessModal('Degree added successfully');
      },
      error: (reason: any) => {
        const errorMessage = reason.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }
  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }

  openupdate(degree: any) {
    this.modalService.open(this.updatepopup, {
      centered: true,
      backdrop: 'static',
    });
    this.updateDegreeDetails = degree;
    this.updateForm?.patchValue({ degreeName: degree.degreeName });
  }
  opendelete(degree: any) {
    this.updateDegreeDetails = degree;
    this.modalService.open(this.deletepopup, {
      centered: true,
      backdrop: 'static',
    });
  }

  updateDegree(): void {
    if (this.updateForm.valid) {
      this.updateDegreeDetails.degreeName =
        this.updateForm.get('degreeName')?.value;
      this.subscription = this.http
        .postdata(`Degree/UPDATER`, this.updateDegreeDetails)
        .subscribe({
          next: (data: any) => {
            this.updateForm.reset();
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Degree updated successfully'
            );
          },
          error: (err: any) => {
            const errorMessage = err.error?.Message;
            this.conformationPopup.openErrorModal(
              errorMessage
            );
          },
        });
    } else {
      this.conformationPopup.openErrorModal(
        'Form is invalid. Please check the inputs.'
      );
    }
  }

  deleteDegree(degree: any): void {
    const deleteRequest = {
      sno: degree.sno,
      degreeName: degree.degreeName,
      isdeleted: 'void',
    };

    this.subscription = this.http
      .postdata('Degree/UPDATER', deleteRequest)
      .subscribe({
        next: (data: any) => {
          this.getdegree();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Degree deleted successfully'
          );
        },
        error: (err: any) => {
          console.error('Delete degree failed:', err);
          this.conformationPopup.openErrorModal('Failed to delete degree data');
        },
      });
  }
}