import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { gradeDATA } from './grade-modeL';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-grade',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './grade.component.html',
  styleUrl: './grade.component.scss',
})
export class GradeComponent {
  subscription!: Subscription;
  gradedetails = [] as any;
  JobroleDetails = [] as any;
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
    public formValidations: FormValidationsService,
    public rbac: RbacService
  ) {}
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      Addgrade: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(101),
        ],
      ],
      jobgrade: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]],
    });

    this.updateForm = this.fb.group({
      Updatejobrole: [
        '',
        [
          Validators.required,
          this.formValidations.maxCharactersValidator(101),
        ],
      ],
      updategraderole: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]],
    });
    this.getgradeid();
  }

  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  getgradeid() {
    this.subscription = this.http.getData('GradeTable').subscribe({
      next: (data: any) => {
        console.log(data);
        this.gradedetails = data;
      },
    });
  }
  //ADD
  addjobrole(modal: any) {
    const request: gradeDATA = {
      gradeName: this.AddForm.value.Addgrade.trim(),
      jobGrade: this.AddForm.value.jobgrade,
      isdeleted: 'Active',
    };

    this.subscription = this.http.postdata('GradeTable', request).subscribe({
      next: () => {
        this.getgradeid();
        modal.close();
        this.conformationPopup.openSuccessModal(
          'Grade Details added successfully'
        );

        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }

  close(modal: any) {
    modal.close();
  }
  // Method to open the update modal dialog
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.gradeId;
    this.updateForm.patchValue({ Updatejobrole: jobroletypelist.gradeName });
    this.updateForm.patchValue({ updategraderole: jobroletypelist.jobGrade });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true,
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: gradeDATA = {
        gradeId: this.selectedId,
        gradeName: this.updateForm.value.Updatejobrole.trim(),
        jobGrade: this.updateForm.value.updategraderole,
        isdeleted: 'Active',
      };

      this.subscription = this.http
        .postdata('GradeTable/UPDATER', request)
        .subscribe({
          next: () => {
            this.getgradeid();
            modal.close();
            this.conformationPopup.openSuccessModal(
              'Grade Details updated successfully'
            );
            this.resetForm();
          },
          error: (error: any) => {
            const errorMessage = error.error?.Message;
            this.conformationPopup.openErrorModal(errorMessage);
          },
        });
    }
  }
  // Method to open the delete modal dialog
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
    const deleteRequest: gradeDATA = {
      gradeId: this.selectedDeleteRole.gradeId,
      gradeName: this.selectedDeleteRole.gradeName.trim(),
      jobGrade: this.selectedDeleteRole.jobGrade,
      isdeleted: 'void',
    };

    this.http.postdata('GradeTable/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getgradeid();
        modal.close();
        this.conformationPopup.openSuccessModal(
          'Grade Details deleted successfully '
        );
      },
      error: (err : any) => {
        const errorMessage = err.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
  }

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
