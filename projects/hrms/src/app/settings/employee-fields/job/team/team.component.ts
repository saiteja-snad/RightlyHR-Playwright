import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TeamData } from './team.model';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
 
@Component({
  selector: 'app-team',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, SelectModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent implements OnInit, OnDestroy {
  departmentdetails = [] as any;
  teamDetails = [] as any[];
  subscription!: Subscription;
  departments = [] as any;
  teamManagerDetails = [] as any;
  updateDepartmentDetails: any;
  teamdetailsdata = [] as any;
  teamdetails = [] as any[];
  deptdetails = [] as any[];
  isEditMode = false;
 
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  sortdeaprtmentName: any;
  selectedEmployee = {} as any;
  sortedDesignations: any[] = [];
  selectedId: boolean | undefined;
 
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService, 
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {
 
  }
  onDepartmentChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log('Selected Department:', selectedValue);
  }
  ngOnInit(): void {
    this.getTable() 
    this.AddForm = this.fb.group({
      teamName: ['', [Validators.required]],
      departmentId:[null,[Validators.required]],
      teamManager: ['', [Validators.required]],

    });
 
    this.updateForm = this.fb.group({
      updateddepartmentId: ['', [Validators.required]],
      UpdatedTeamName: ['', [Validators.required]],
      updatedteamManager: ['', [Validators.required]]
    });
    this.getTeam();
    this.getDepartmentName()
  }

  getDepartmentName() {
    this.subscription = this.http.getData('Subdepartments/Getalldept').subscribe({
      next: (data: any) => {
        this.deptdetails = data as [];
        console.log(this.deptdetails)
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }
 
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getTeam() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        console.log(data);
        if (data) {
          this.teamdetails = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
            };
          });
        }
        console.log("Team details"+this.teamdetails)
      },
      error: (reason: any) => {
        console.log(reason);
        alert("Insertion of data is failed")
      }
    });
  }
 
  sortdepartments() {
    this.deptdetails = this.deptdetails.sort((a, b) => {
      const nameA = a.departmentName.toLowerCase();
      const nameB = b.departmentName.toLowerCase();
 
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }
 
 
  getTable() {
    this.subscription = this.http.getDatabyid("Subdepartments/Getalldept").subscribe({
      next: (data: any) => {
        console.log(data);
 
        // Map the data to include manager names
        this.teamdetailsdata = data.map((team: any) => {
          // Find manager name if reportingmanagerId exists
          let managerName = 'N/A';
          if (team.reportingmanagerId) {
            const manager = this.teamDetails.find(m => m.employeeId === team.reportingmanagerId);
            if (manager) {
              managerName = `${manager.firstName} ${manager.lastName}`;
            }
          }
 
          return {
            ...team,
            teamManagerName: managerName
          };
        });
 
        console.log('Team data processed with manager names:', this.teamdetailsdata);
      },
      error: (reason: any) => {
        console.log(reason);
      }
    })
  }
  //ADD
  addTeam(modal: any) {
    if (this.AddForm.valid) {
      console.log('Form values:', this.AddForm.value);
 
      // Create payload according to Swagger API specification
      const request = {
        subdepartmentName: this.AddForm.get('teamName')?.value,
        departmentId: this.AddForm.get('departmentId')?.value, // This should be the sno value
        reportingmanagerId: Number(this.AddForm.get('teamManager')?.value) || null,
        isdeleted: false
      };
 
      console.log('Adding team with request:', request);
 
      this.subscription = this.http.postdata('Subdepartments', request).subscribe({
        next: (response) => {
          this.getDepartmentName()
          console.log('Team added successfully, response:', response);
          modal.close();
          this.conformationPopup.openSuccessModal('Team added successfully');
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Error adding team:', error);
          this.conformationPopup.openErrorModal('Failed to add team');
        }
      });
    } else {
      console.warn('Add form is invalid:', this.AddForm.errors);
      // // Mark all fields as touched to trigger validation errors
      // Object.keys(this.AddForm.controls).forEach(key => {
      //   const control = this.AddForm.get(key);
      //   control?.markAsTouched();
      // });
    }
  }
  close(modal: any) {
    modal.close();
    this.resetForm();
  }
 
  openupdateDialog(team: any) {
    this.updateDepartmentDetails = team;
  
    this.updateForm.patchValue({
      updateddepartmentId: team.departmentId,       // Should match dept.departmentId
      UpdatedTeamName: team.subdepartmentName,      // Text input
      updatedteamManager: team.reportingmanagerId   // Should match manager.employeeId
    });
  
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateTeam(modal: any) {
    if (this.updateForm.valid && this.updateDepartmentDetails?.subdepartmentId) {
      console.log('Update form values:', this.updateForm.value);
      // Create payload according to Swagger API specification
      const request = {
        subdepartmentId: this.updateDepartmentDetails.subdepartmentId,
        subdepartmentName: this.updateForm.value.UpdatedTeamName?.trim(),
        departmentId: this.updateForm.value.updateddepartmentId,       
        reportingmanagerId: Number(this.updateForm.value.updatedteamManager) || null, 
        isdeleted: false
      };
  
      console.log('Updating team with request:', request);
  
      this.subscription = this.http.postdata('Subdepartments/Update', request).subscribe({
        next: (response) => {
          console.log('Team updated successfully, response:', response);
          modal.close();
          this.conformationPopup.openSuccessModal('Team updated successfully');
          this.resetForm();
          this.getTable(); 
        },
        error: (error: any) => {
          console.error('Error updating team:', error);
          this.conformationPopup.openErrorModal('Failed to update team');
        }
      });
    } else {
      console.warn('Update form is invalid or selected ID is missing:', this.updateForm.errors, this.updateDepartmentDetails?.subdepartmentId);
    }
  }
 
  // Handle department selection in update form
  onUpdateDepartmentChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    console.log('Update Form - Selected Department value (raw):', selectedValue);
 
    // Convert to number if it's a numeric string and not "null" or empty
    let departmentId: string | number | null = selectedValue;
 
    if (selectedValue === "null" || selectedValue === "") {
      departmentId = null;
      console.log('Department value is null or empty, setting to null');
    } else if (!isNaN(Number(selectedValue))) {
      departmentId = Number(selectedValue);
      console.log('Department value is numeric, converted to Number:', departmentId);
    } else {
      console.log('Department value is non-numeric string:', departmentId);
    }
 
    console.log('Update Form - Selected Department value (processed):', departmentId);
 
    // Set the value directly to ensure it's properly recognized
    this.updateForm.get('departmentId')?.setValue(departmentId);
    this.updateForm.get('departmentId')?.markAsDirty();
    this.updateForm.get('departmentId')?.updateValueAndValidity();
 
    console.log('Update form after department change:', this.updateForm.value);
  }
 
  // Handle team manager selection in update form
  onUpdateManagerChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    console.log('Update Form - Selected Team Manager value (raw):', selectedValue);
 
    // Convert to number if it's a numeric string and not "null" or empty
    let managerId: string | number = selectedValue;
    if (selectedValue !== "null" && selectedValue !== "" && !isNaN(Number(selectedValue))) {
      managerId = Number(selectedValue);
    }
 
    console.log('Update Form - Selected Team Manager value (processed):', managerId);
 
    // Set the value directly to ensure it's properly recognized
    this.updateForm.get('teamManagerId')?.setValue(managerId);
    this.updateForm.get('teamManagerId')?.markAsDirty();
    this.updateForm.get('teamManagerId')?.updateValueAndValidity();
 
    console.log('Update form after manager change:', this.updateForm.value);
  }
 
  // DELETE
  opendelete(teams: any) {
    this.updateDepartmentDetails = teams;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    console.log(this.updateDepartmentDetails)
    this.subscription = this.http.getData(`Subdepartments/deletebyid/${this.updateDepartmentDetails.subdepartmentId}`).subscribe({
      next: () => {
        this.getDepartmentName()
        modal.close();
        this.conformationPopup.openSuccessModal('Team deleted successfully');
      },
      error: (error: any) => {
        console.error('Error deleting team:', error);
        this.conformationPopup.openErrorModal('Failed to delete team');
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
    console.log('Forms reset');
  }
 
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}