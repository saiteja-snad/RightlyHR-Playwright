
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { jobRoleDATA } from './jobrole-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';



@Component({
  selector: 'app-jobrole',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule],
  templateUrl: './jobrole.component.html',
  styleUrls: ['./jobrole.component.scss']
})
export class JobroleComponent {
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
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      Addjobrole: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(100)]],
      gradeId: ['', Validators.required],
    });

    this.updateForm = this.fb.group({
      Updatejobrole: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$'), Validators.maxLength(100)]],
      updategradeId: ['', Validators.required],
    });
    this.getgradeid();
    this.getJobrole();
  }

  getJobrole() {
    this.subscription = this.http
      .getData('DesignationGradeMapper?sort=designationName')
      .subscribe({
        next: (data: any) => {
          this.JobroleDetails = data;
          this.sortDesignations();
        },
      });
  }
  // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getgradeid() {
    this.subscription = this.http.getData('GradeTable').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.gradedetails = data;
      },
    });
  }
  sortedDesignations: any[] = [];
  sortDesignations() {
    // Sort designations alphabetically based on the 'designation' field
    this.sortedDesignations = this.JobroleDetails.sort((a: { designationName: number; }, b: { designationName: number; }) => {
      if (a.designationName < b.designationName) return -1;
      if (a.designationName > b.designationName) return 1;
      return 0;
    });
  }
  //ADD
  addjobrole(modal: any) {
    const request: jobRoleDATA = {
      designationName: this.AddForm.value.Addjobrole.trim(),
      gradeId: Number(this.AddForm.value.gradeId)
    };

    this.subscription = this.http.postdata('DesignationGradeMapper', request).subscribe({
      next: () => {

        this.getJobrole();
        modal.close();
        this.conformationPopup.openSuccessModal('Job Role added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        const errorMessage = error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
        this.resetForm();
      }
    });
  }

  close(modal: any) {
    modal.close();
  }

  // Method to open the update modal dialog
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.id;
    this.updateForm.patchValue({ Updatejobrole: jobroletypelist.designationName });
    this.updateForm.patchValue({ updategradeId: jobroletypelist.gradeId });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: jobRoleDATA = {
        id: this.selectedId,
        designationName: this.updateForm.value.Updatejobrole.trim(),
        gradeId: Number(this.updateForm.value.updategradeId)
      };

      this.subscription = this.http.postdata('DesignationGradeMapper/UPDATER', request).subscribe({
        next: () => {

          this.getJobrole();
          modal.close();
          this.conformationPopup.openSuccessModal('Job Role updated successfully');
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
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;

    this.subscription = this.http
      .getData(`DesignationGradeMapper/deleteById/${this.selectedDeleteRole.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getJobrole();
          this.conformationPopup.openSuccessModal('Job Role deleted successfully');

        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
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
