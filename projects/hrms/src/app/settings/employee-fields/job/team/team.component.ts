import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  originalTeamValues: any = {}; // Store original values for comparison

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
    this.getDepartmentName();
    this.getTeam();
    this.getTable();

    this.AddForm = this.fb.group({
      teamName: ['', [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]],
      departmentId: [null, [Validators.required]],
      teamManager: [null, [Validators.required]],
    });

    this.updateForm = this.fb.group({
      updateddepartmentId: ['', [Validators.required]],
      UpdatedTeamName: [null, [Validators.required, this.formValidations.maxCharactersValidator(101),Validators.pattern(/^[^\s].*$/)]],
      updatedteamManager: ['', [Validators.required]]
    });
  }

  getDepartmentName() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.deptdetails = data as [];
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
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            };
          });
        }
        console.log("Team details" + this.teamdetails)
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
        console.log('Received team data:', data);

        if (!data || !Array.isArray(data)) {
          console.warn('Received invalid data for teams:', data);
          this.teamdetailsdata = [];
          return;
        }

        // Sort the data by department name and team name
        this.teamdetailsdata = data
          .filter((team: any) => !team.isdeleted) // Filter out deleted teams
          .sort((a: any, b: any) => {
            // First sort by department name
            const deptCompare = (a.departmentName || '').localeCompare(b.departmentName || '');
            if (deptCompare !== 0) return deptCompare;

            // Then by team name
            return (a.subdepartmentName || '').localeCompare(b.subdepartmentName || '');
          });

      },
      error: (reason: any) => {
        const errorMessage = reason.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }
  //ADD
  addTeam(form: any) {
    if (form.valid) {
      const formData = form.value
      const request = {
        subdepartmentName: formData.teamName.trim(),
        departmentId: formData.departmentId, 
        reportingmanagerId: formData.teamManager,
        isdeleted: false
      };

      this.subscription = this.http.postdata('Subdepartments', request).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Team added successfully');
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message? error.error?.Message : 'Failed to add Team';
          this.conformationPopup.openErrorModal(errorMessage);
        },
        complete: ()=>{
          this.AddForm.reset();
          this.getDepartmentName();
          this.getTable();
        }
      });
    } 
  }

  openupdateDialog(team: any) {
    this.updateDepartmentDetails = team;
    console.log(team);
    console.log(this.deptdetails);
    
    this.updateForm.patchValue({
      updateddepartmentId:  team.departmentId,       // Should match dept.departmentId
      UpdatedTeamName: team.subdepartmentName,      // Text input
      updatedteamManager: team.reportingmanagerId   // Should match manager.employeeId
    });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }

  // Check if the update form values have changed from original
  hasFormChanged(): boolean {
    if (!this.updateForm || !this.originalTeamValues) return false;

    const currentValues = {
      departmentId: this.updateForm.get('updateddepartmentId')?.value,
      teamName: this.updateForm.get('UpdatedTeamName')?.value?.trim(),
      managerId: this.updateForm.get('updatedteamManager')?.value
    };

    return (
      currentValues.departmentId !== this.originalTeamValues.departmentId ||
      currentValues.teamName !== this.originalTeamValues.teamName ||
      currentValues.managerId !== this.originalTeamValues.managerId
    );
  }

  //  UPDATE
  updateTeam(modal: any) {
    if (this.updateForm.valid && this.updateDepartmentDetails?.subdepartmentId) {
      console.log('Update form values:', this.updateForm.value);
      const request = {
        subdepartmentId: this.updateDepartmentDetails.subdepartmentId,
        subdepartmentName: this.updateForm.value.UpdatedTeamName?.trim(),
        departmentId: this.updateForm.value.updateddepartmentId,
        reportingmanagerId: Number(this.updateForm.value.updatedteamManager) || null,
        isdeleted: false
      };
      this.subscription = this.http.postdata('Subdepartments/Update', request).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Team updated successfully');
          this.updateForm.reset();
          this.getTable();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message? error.error?.Message : 'Failed to update Team';
          this.conformationPopup.openErrorModal(errorMessage);
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

    // Convert to number if it's a numeric string and not "null" or empty
    let managerId: string | number = selectedValue;
    if (selectedValue !== "null" && selectedValue !== "" && !isNaN(Number(selectedValue))) {
      managerId = Number(selectedValue);
    }

    // Set the value directly to ensure it's properly recognized
    this.updateForm.get('teamManagerId')?.setValue(managerId);
    this.updateForm.get('teamManagerId')?.markAsDirty();
    this.updateForm.get('teamManagerId')?.updateValueAndValidity();

  }

  // DELETE
  opendelete(teams: any) {
    this.updateDepartmentDetails = teams;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  onDelete(modal: any) {
    console.log('Deleting team:', this.updateDepartmentDetails);

    if (!this.updateDepartmentDetails || !this.updateDepartmentDetails.subdepartmentId) {
      this.conformationPopup.openErrorModal('Cannot delete: No valid team selected');
      return;
    }

    this.subscription = this.http.getData(`Subdepartments/deletebyid/${this.updateDepartmentDetails.subdepartmentId}`).subscribe({
      next: () => {
        modal.close();
        this.conformationPopup.openSuccessModal('Team deleted successfully');

        // Refresh both data sources to ensure UI is updated
        this.getDepartmentName();
        this.getTable();
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


  // resetForm() {
  //   this.AddForm.reset({
  //     teamName: '',
  //     departmentId: '',
  //     teamManager: ''
  //   });
  //   this.updateForm.reset({
  //     updateddepartmentId: '',
  //     UpdatedTeamName: '',
  //     updatedteamManager: ''
  //   });
  //   this.isEditMode = false;
  //   this.originalTeamValues = {}; // Reset original values
  //   console.log('Forms reset');
  // }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}