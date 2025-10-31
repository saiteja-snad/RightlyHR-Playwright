import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { SelectModule } from 'primeng/select';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { projectRoleDATA } from './project-role-modal';

@Component({
  selector: 'app-project-role',
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, SelectModule, DataLoaderContentComponent],
  templateUrl: './project-role.component.html',
  styleUrl: './project-role.component.scss'
})
export class ProjectRoleComponent {
  subscription!: Subscription;
  gradedetails = [] as any;
  loader = false;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
  @ViewChild('addpopup') addpopup: any;
    @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  isActive= 'true';
  AddForm!: FormGroup;
   empinfo: any;
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
       this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');// assuming user details stored here
    this.AddForm = this.fb.group({
      Addprojectrole: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]],
      department: ['', Validators.required],
    });

    // this.updateForm = this.fb.group({
    //   Updatejobrole: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]],
    //   updategradeId: ['', Validators.required],
    // });
    // this.getgradeid();
    this.getJobrole();
  }
getJobrole() {
  this.loader = true;
  this.subscription = this.http.getData('ProjectRoles?isActive=true').subscribe({
    next: (response: any) => {
      this.loader = false;
      if (response && response.success && Array.isArray(response.data)) {
        this.JobroleDetails = response.data.map((item: any) => ({
          id: item.id,
          projectrole: item.roleName,                // Job role name
          entityname: item.entity?.entityName || '-',      // Department name
          entityReferenceId: item.entity?.entityReferenceId || item.entityReferenceId || 0, // Department ID
          entityType: item.entityType || 'department',    // Entity type
          isActive: item.isActive
        }));
        this.sortDesignations();
      } else {
        this.JobroleDetails = [];
      }
    },
    error: () => {
      this.loader = false;
    }
  });
}


  // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  // getgradeid() {
  //   this.subscription = this.http.getData('Department').subscribe({
  //     next: (data: any) => {
  //       // console.log(data);
  //       this.gradedetails = data;
  //     },
  //   });
  // }
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
  if (this.AddForm.invalid) return;

  const request = {
    roleName: this.AddForm.value.Addprojectrole.trim(),
    entityType: 'department',
    entityReferenceId: Number(this.AddForm.value.department), // selected department id
    isActive: true,
    createdBy: this.empinfo?.employeeId || 0 // fallback if user not found
  };

  this.subscription = this.http.postdata('ProjectRoles', request).subscribe({
    next: () => {
      this.getJobrole();
      modal.close();
      this.conformationPopup.openSuccessModal('project Role added successfully');
      this.resetForm();
    },
    error: (error: any) => {
      const errorMessage = error.error?.Message || 'Failed to add job role';
      this.conformationPopup.openErrorModal(errorMessage);
    }
  });
}

  close(modal: any) {
    modal.close();
  }

  // Method to open the delete modal dialog
  // DELETE
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
onDelete(modal: any) {
  if (!this.selectedDeleteRole) return;

  const payload = {
    id: this.selectedDeleteRole.id,
    roleName: this.selectedDeleteRole.designationName || '',
    entityType: this.selectedDeleteRole.entityType || 'department',
    entityReferenceId: this.selectedDeleteRole.entityReferenceId || 0, // department id
    isActive: false,
    createdBy: this.empinfo?.employeeId || 0,
    updatedBy: this.empinfo?.employeeId || 0
  };
//  this.http.putData(`ProjectManagementAuthority/${this.selectedAuthority.id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
  this.subscription = this.http.putData(`ProjectRoles/${this.selectedDeleteRole.id}`,payload).subscribe({
    next: () => {
      modal.close();
      this.getJobrole();
      this.conformationPopup.openSuccessModal('Project Role deleted successfully');
    },
    error: (error: any) => {
      const errorMessage = error.error?.Message || 'Something went wrong!';
      this.conformationPopup.openErrorModal(errorMessage);
    }
  });
}


  closeDelete(modal: any) {
    modal.dismiss();
  };

 // Method to open the update modal dialog
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.id;
    this.updateForm.patchValue({ updatedepartment: jobroletypelist.entityname });
    this.updateForm.patchValue({ Updateprojectrole: jobroletypelist.projectrole });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }

  
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: projectRoleDATA = {
        id: this.selectedId,
        rolename: this.updateForm.value.Updatejobrole.trim(),
        departmentid: Number(this.updateForm.value.updategradeId)
      };

      this.subscription = this.http.postdata('ProjectRoles', request).subscribe({
        next: () => {

          this.getJobrole();
          modal.close();
          this.conformationPopup.openSuccessModal('Job Role updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }


  // Open Update popup
// openupdateDialog(jobrole: any) {
//   this.selectedId = jobrole.id;
//   this.updateForm.patchValue({
//     Updateprojectrole: jobrole.projectrole,
//     updatedepartment: jobrole.entityReferenceId,
//   });
//   this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
// }

// Call PUT API
updateProjectRole(modal: any) {
  if (this.updateForm.invalid || !this.selectedId) return;

  const payload = {
    id: this.selectedId,
    roleName: this.updateForm.value.Updateprojectrole.trim(),
    entityType: 'department',
    entityReferenceId: Number(this.updateForm.value.updatedepartment),
    isActive: true,
    updatedBy: this.empinfo?.employeeId || 0,
  };

  this.subscription = this.http.putData(`ProjectRoles/${this.selectedId}`, payload).subscribe({
    next: () => {
      this.getJobrole();
      modal.close();
      this.conformationPopup.openSuccessModal('Project Role updated successfully');
      this.updateForm.reset();
    },
    error: (error: any) => {
      const errorMessage = error.error?.Message || 'Failed to update Project Role';
      this.conformationPopup.openErrorModal(errorMessage);
    },
  });
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
