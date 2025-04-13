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

  sortedDesignations: any[] = [];
  selectedId: boolean | undefined;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {

  }
  onDepartmentChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    console.log('Selected Department value (raw):', selectedValue);

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

    console.log('Selected Department value (processed):', departmentId);

    // Set the value directly to ensure it's properly recognized
    this.AddForm.get('departmentId')?.setValue(departmentId);
    this.AddForm.get('departmentId')?.markAsDirty();
    this.AddForm.get('departmentId')?.updateValueAndValidity();

    console.log('Form after department change:', this.AddForm.value);
    console.log('Department valid:', this.AddForm.get('departmentId')?.valid);
  }
  onManagerChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    console.log('Selected Team Manager value (raw):', selectedValue);

    // Convert to number if it's a numeric string and not "null" or empty
    let managerId: string | number = selectedValue;
    if (selectedValue !== "null" && selectedValue !== "" && !isNaN(Number(selectedValue))) {
      managerId = Number(selectedValue);
    }

    console.log('Selected Team Manager value (processed):', managerId);

    // Set the value directly to ensure it's properly recognized
    this.AddForm.get('teamManagerId')?.setValue(managerId);
    this.AddForm.get('teamManagerId')?.markAsDirty();
    this.AddForm.get('teamManagerId')?.updateValueAndValidity();

    console.log('Form after manager change:', this.AddForm.value);
    console.log('Team Manager valid:', this.AddForm.get('teamManagerId')?.valid);
  }
  ngOnInit(): void {
    console.log('Team Component initialized');
    this.loadInitialData();
    this.initializeForms();
  }

  private initializeForms(): void {
    this.AddForm = this.fb.group({
      departmentId: ['', Validators.required],
      teamName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      teamManagerId: ['', Validators.required]
    });

    this.updateForm = this.fb.group({
      departmentId: ['', Validators.required],
      teamName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      teamManagerId: ['', Validators.required]
    });
    console.log('Forms initialized');

    // Add form value change listener for debugging
    this.AddForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });
  }

  loadInitialData(): void {
    console.log('Starting to load initial data');

    // Load team managers first
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        console.log('Team managers API response:', data);

        // Simplify manager data
        this.teamDetails = data.map((employee: any) => {
          return {
            employeeId: employee.employeeId || employee.id || null,
            firstName: employee.firstName || '',
            lastName: employee.lastName || ''
          };
        });

        this.teamManagerDetails = this.teamDetails;
        console.log('Team managers loaded:', this.teamDetails.length);

        if (this.teamDetails.length > 0) {
          console.log('Sample team manager data:', this.teamDetails[0]);
        }

        // After managers are loaded, load departments
        this.getDepartments();

        // Then load team data
        this.getTeamAndDepartments();
      },
      error: (error: any) => {
        console.error('Error fetching team managers:', error);
        this.conformationPopup.openErrorModal('Failed to load team managers');

        // Still try to load departments and teams even if managers fail
        this.getDepartments();
        this.getTeamAndDepartments();
      }
    });
  }

  // Get Departments
  getDepartments() {
    console.log('Fetching departments from: Department');
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        console.log('Raw Departments API response:', data);

        if (data && data.length > 0) {
          // Check the first item to understand the structure
          const sample = data[0];
          console.log('Department sample raw structure:', JSON.stringify(sample));
        }

        // Map departments using the 'sno' field as departmentId
        this.deptdetails = data.map((dept: any) => {
          // For debugging
          console.log('Processing department:', dept);

          // Use sno field as the departmentId
          let id = null;
          if (dept.sno !== undefined) {
            // Use sno as the primary ID
            id = dept.sno;
            console.log('Using sno as departmentId:', id);
          } else if (dept.departmentId !== undefined) {
            id = dept.departmentId;
          } else if (dept.id !== undefined) {
            id = dept.id;
          }

          // Try to find department name from different possible fields
          const name = dept.departmentName || dept.name || dept.Department || 'Unknown Department';

          const mappedDept = {
            departmentId: id,
            departmentName: name
          };

          console.log('Mapped department:', mappedDept);
          return mappedDept;
        });

        this.departments = this.deptdetails;
        console.log('Departments loaded:', this.deptdetails.length);

        if (this.deptdetails.length > 0) {
          console.log('Sample department data after mapping:', this.deptdetails[0]);
          console.log('departmentId type:', typeof this.deptdetails[0].departmentId);
        }

        this.sortDepartments();
      },
      error: (error: any) => {
        console.error('Error fetching departments:', error);
        this.conformationPopup.openErrorModal('Failed to load departments');
      }
    });
  }

  // Get Team and Departments for table
  getTeamAndDepartments() {
    console.log('Fetching team and departments data from: Subdepartments/Getalldept');
    this.subscription = this.http.getDatabyid("Subdepartments/Getalldept").subscribe({
      next: (data: any) => {
        console.log('Team and departments API response:', data);

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

        console.log('Team and departments loaded with manager names:', this.teamdetailsdata.length);
        if (this.teamdetailsdata.length > 0) {
          console.log('Sample team and department data with manager:', this.teamdetailsdata[0]);
        }
      },
      error: (error: any) => {
        console.error('Error fetching team and departments:', error);
        this.conformationPopup.openErrorModal('Failed to load team and department data');
      }
    });
  }

  // Sort departments alphabetically
  sortDepartments() {
    if (!this.deptdetails || this.deptdetails.length === 0) {
      console.warn('Cannot sort departments: Empty or invalid department data');
      return;
    }

    try {
      this.deptdetails = this.deptdetails.sort((a, b) => {
        const nameA = a.departmentName.toLowerCase();
        const nameB = b.departmentName.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      console.log('Departments sorted successfully');
    } catch (error) {
      console.error('Error sorting departments:', error);
    }
  }

  // alphabet allowed only
  blockNonAlphabets(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.keyCode);
    const char = String.fromCharCode(event.keyCode);
    // const pattern = /^[a-zA-Z][a-zA-Z ]*$/;
    const pattern = /^[a-zA-Z ]$/;
    const input = (event.target as HTMLInputElement).value;
    if (!pattern.test(char) || (char === ' ' && input.length === 0)) {
      event.preventDefault();
    }
  }

  openDialog() {
    this.resetForm();
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
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
        alert("Insertion of data is failed")
      }
    })
  }
  //ADD
  addTeam(modal: any) {
    if (this.AddForm.valid) {
      console.log('Form values:', this.AddForm.value);

      // Get departmentId (which should be the sno value from the department)
      const departmentIdValue = this.AddForm.get('departmentId')?.value;

      // Ensure departmentId is properly processed
      let departmentId: number | null = null;

      if (departmentIdValue !== null && departmentIdValue !== undefined && departmentIdValue !== '') {
        if (typeof departmentIdValue === 'number') {
          departmentId = departmentIdValue;
        } else if (typeof departmentIdValue === 'string' && !isNaN(Number(departmentIdValue))) {
          departmentId = Number(departmentIdValue);
        }
      }

      console.log('Department ID value (sno from department):', departmentIdValue);
      console.log('Department ID value (processed):', departmentId);
      console.log('Department ID value type:', typeof departmentId);

      // Create payload according to Swagger API specification
      const request = {
        subdepartmentId: 0, // This will be assigned by the API
        subdepartmentName: this.AddForm.get('teamName')?.value,
        departmentId: departmentId, // This should be the sno value
        reportingmanagerId: Number(this.AddForm.get('teamManagerId')?.value) || null,
        isdeleted: false
      };

      console.log('Adding team with request:', request);

      this.subscription = this.http.postdata('Subdepartments', request).subscribe({
        next: (response) => {
          console.log('Team added successfully, response:', response);
          this.getTeamAndDepartments();
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
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.AddForm.controls).forEach(key => {
        const control = this.AddForm.get(key);
        control?.markAsTouched();
      });
    }
  }
  close(modal: any) {
    modal.close();
    this.resetForm();
  }

  // Method to open the update modal dialog
  openupdateDialog(team: any) {
    console.log('Opening update dialog for team:', team);
    this.updateDepartmentDetails = team;

    // Reset form first to clear any previous values
    this.updateForm.reset({
      departmentId: '',
      teamName: '',
      teamManagerId: ''
    });

    // Set values with a slight delay to ensure form controls are ready
    setTimeout(() => {
      // Convert IDs to strings to match HTML select behavior
      const departmentId = team.departmentId ? String(team.departmentId) : '';
      const reportingManagerId = team.reportingmanagerId ? String(team.reportingmanagerId) : '';

      this.updateForm.patchValue({
        departmentId: departmentId,
        teamName: team.subdepartmentName || '',
        teamManagerId: reportingManagerId
      });
      console.log('Update form patched with values:', this.updateForm.value);
    }, 100);

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateTeam(modal: any) {
    if (this.updateForm.valid) {
      console.log('Update form values:', this.updateForm.value);

      // Get departmentId (which should be the sno value from the department)
      const departmentIdValue = this.updateForm.get('departmentId')?.value;

      // Ensure departmentId is properly processed
      let departmentId: number | null = null;

      if (departmentIdValue !== null && departmentIdValue !== undefined && departmentIdValue !== '') {
        if (typeof departmentIdValue === 'number') {
          departmentId = departmentIdValue;
        } else if (typeof departmentIdValue === 'string' && !isNaN(Number(departmentIdValue))) {
          departmentId = Number(departmentIdValue);
        }
      }

      console.log('Department ID value (sno from department):', departmentIdValue);
      console.log('Department ID value (processed):', departmentId);
      console.log('Department ID value type:', typeof departmentId);

      // Create payload according to Swagger API specification
      const request = {
        subdepartmentId: this.updateDepartmentDetails.subdepartmentId,
        subdepartmentName: this.updateForm.get('teamName')?.value,
        departmentId: departmentId, // This should be the sno value
        reportingmanagerId: Number(this.updateForm.get('teamManagerId')?.value) || null,
        isdeleted: false
      };

      console.log('Updating team with request:', request);

      this.subscription = this.http.postdata('Subdepartments/Update', request).subscribe({
        next: (response) => {
          console.log('Team updated successfully, response:', response);
          this.getTeamAndDepartments();
          modal.close();
          this.conformationPopup.openSuccessModal('Team updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          console.error('Error updating team:', error);
          this.conformationPopup.openErrorModal('Failed to update team');
        }
      });
    } else {
      console.warn('Update form is invalid:', this.updateForm.errors);
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.updateForm.controls).forEach(key => {
        const control = this.updateForm.get(key);
        control?.markAsTouched();
      });
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
  onDelete(modal: any, subdepartmentId: number) {
    console.log('Deleting team with subdepartmentId:', subdepartmentId);

    // Using getData instead of postdata as per Swagger documentation
    this.subscription = this.http.getData(`Subdepartments/deletebyid/${subdepartmentId}`).subscribe({
      next: (response) => {
        console.log('Team deleted successfully, response:', response);
        modal.close();
        this.getTeamAndDepartments();
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
    this.AddForm.reset({
      departmentId: '',
      teamName: '',
      teamManagerId: ''
    });
    this.updateForm.reset({
      departmentId: '',
      teamName: '',
      teamManagerId: ''
    });
    this.isEditMode = false;
    console.log('Forms reset');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}



