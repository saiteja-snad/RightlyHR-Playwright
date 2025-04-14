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
  [x: string]: any;
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
  
 constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private conformationPopup: OpenModalService) {
  
    }
    onDepartmentChange(event: Event) {
      const selectedValue = (event.target as HTMLSelectElement).value;
      console.log('Selected Department:', selectedValue);
    }
    ngOnInit(): void {
      this.AddForm = this.fb.group({
        DepartmentName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        TeamName: ['', Validators.required],
        teamManager:['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      });
  
      this.updateForm = this.fb.group({
        UpdatedTeamName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        updatedDepartmentName: ['', Validators.required],
        updatedteamManager:['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
      });
      this.getTeam();
      this. getDepartmentName()
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
    getDepartmentName() {
      this.subscription = this.http.getData('Department').subscribe({
          next: (data: any) => {
            console.log(data);
            alert("hello");
          this.deptdetails= data as [];
            this.sortdeaprtmentName();
            console.log(this.deptdetails)
          },
          error: (reason: any) => {
            console.log(reason);
            alert("Insertion of data is failed")
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
          alert("hello");
          this.teamDetails= data;
          // this.sortdeaprtmentName();
          console.log(this.teamDetails)
        },
        error: (reason: any) => {
          console.log(reason);
          alert("Insertion of data is failed")
        }
      });
  }
  onEmployeeSelect(employeeId: number) {
    this.selectedEmployee = this.empids.find((e) => e.employeeId == employeeId);
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
        this.teamdetailsdata = data as TeamData[]
        console.log(this.teamdetailsdata)
      },
      error: (reason: any) => {
        console.log(reason);
        alert("Insertion of data is failed")
      }
    })
  }
  //ADD
  addTeam(modal: any) {
    const request = {
      reportingManagerId: this.AddForm?.get('DepartmentName')?.value,
      subDepartmentName: this.AddForm?.get('updatedDepartmentName')?.value,
      isdeleted: "Active"
    };
    this.subscription = this.http.postdata('Subdepartments', request).subscribe({
      next: () => {
        this.getTable();
        modal.close();
        this.conformationPopup.openSuccessModal('department Name added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
  close(modal: any) {
    modal.close();
  }

  // Method to open the update modal dialog

  openupdateDialog(teams: any) {
    this.selectedId = teams.id;
    this.updateForm.patchValue({ updatedDepartmentName: teams.updatedDepartmentName });
    this.updateForm.patchValue({ UpdatedTeamName: teams.UpdatedTeamName });
    this.updateForm.patchValue({ updatedteamManager: teams.updatedteamManager });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateDepartment() {
    if (this.updateForm.valid) {

      this.updateDepartmentDetails.UpdatedTeamName = this.updateForm.get('UpdatedTeamName')?.value;
      this.updateDepartmentDetails.updatedDepartmentName = this.updateForm.get('updatedDepartmentName')?.value;
      this.updateDepartmentDetails.updatedteamManager = this.updateForm.get('updatedteamManager')?.value;


      this.subscription = this.http.postdata('Subdepartments/Update', this.updateDepartmentDetails).subscribe({
        next: (data: any) => {
          this.getTable();
          this.updateForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Status updated successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Update failed');
          this.resetForm();
        }
      });
    }
  }


  // DELETE
  opendelete(teams: any) {
    this.updateDepartmentDetails = teams;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    const deleteRequest = {
      isdeleted: 'void',
      subdepartmentId: 0,
      subdepartmentName: "",
      departmentId: 0,
      reportingmanagerId: 0,
    
    }

    this.subscription = this.http.postdata("Subdepartments/deletebyid/{SubdepartmentId}", this.deleteRequest).subscribe({
      next: () => {
        modal.close();
        this.conformationPopup.openSuccessModal('department Name Deleted Successfully');

      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');

      }
    });
  }
  deleteRequest(arg0: string, deleteRequest: any) {
    throw new Error('Method not implemented.');
  }
  closeDelete(modal: any) {
    modal.dismiss();
  };


  resetForm() {
    this.AddForm.reset();
    this.isEditMode = false;

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


