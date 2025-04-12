import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TeamData } from './team.model';

@Component({
  selector: 'app-team',
  imports: [TranslateModule,CommonModule,ReactiveFormsModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  departmentdetails=[] as any;
  teamDetails=[] as any[];
    subscription!: Subscription;
    departments=[] as any;
    teamManagerDetails=[] as any;
    updateDepartmentDetails: any; 

    teamdetails=[] as any[];
    deptdetails=[] as any;
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
      this.subscription = this.http.getData('Subdepartments/Getalldept').subscribe({
          next: (data: any) => {
            console.log(data);
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
      this.subscription = this.http.getData('Subdepartments/Getalldept').subscribe({
        next: (data: any) => {
          console.log(data);
          this.sortdeaprtmentName();
          console.log(this.deptdetails)
        },
        error: (reason: any) => {
          console.log(reason);
          alert("Insertion of data is failed")
        }
      });
  }
    
   sortDepartments() {
      // Sort designations alphabetically based on the 'designation' field
      this. sortDepartments= this.departmentdetails.sort((a: { departmentName: number; }, b: { departmentName: number; }) => {
        if (a.departmentName < b.departmentName) return -1;
        if (a.departmentName > b.departmentName) return 1;
        return 0;
      });
    }
    //ADD
    addTeam(modal: any) {
      const request: TeamData = {
        departmentId: 1,                        
        isDeleted: false,                      
        reportingManagerId: '14463',      
        subDepartmentName: 'uuiki'             
      };
    
      this.subscription = this.http.postdata('Subdepartments/Getalldept', request).subscribe({
        next: () => {
          this.getDepartmentName(); 
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
  
    openupdateDialog(updateDepartmentDetails: any) {
      this.selectedId = updateDepartmentDetails.id;
      this.updateForm.patchValue({updatedDepartmentName:updateDepartmentDetails. updatedDepartmentName });
      this.updateForm.patchValue({UpdatedTeamName:updateDepartmentDetails.UpdatedTeamName });
      this.updateForm.patchValue({updatedteamManager:updateDepartmentDetails.updatedteamManager });
     
      this.modalService.open(this.updatepopup, {
        backdrop: 'static',
        centered: true
      });
    }
    //  UPDATE
    updateDepartment(modal: any) {
      if (this.updateForm.valid && this.selectedId) {
        const request = {
          departmentId: this.updateForm.value.departmentId,            
          isDeleted: false,
          reportingmanagerId: this.updateForm.value.updatedteamManager ,        
          subdepartmentId: this.updateForm.value.subdepartmentId,      
          subdepartmentName: this.updateForm.value.UpdatedTeamName.trim()      
        };
    
        this.subscription = this.http.postdata('Subdepartments/Update', request).subscribe({
          next: () => {
            this.getDepartmentName();
            modal.close();
            this.conformationPopup.openSuccessModal(' department name Updated Successfully');
            this.resetForm();
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal('Update failed');
            this.resetForm();
          }
        });
      }
    }
    
    
    // DELETE
    opendelete(updateDepartmentDetails: any) {
      this.updateDepartmentDetails = updateDepartmentDetails;
      this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
    }
    onDelete(modal: any) {
      if (!this.updateDepartmentDetails) return;
  
      this.subscription = this.http
        .getData(`Subdepartments/deletebyid/${this.updateDepartmentDetails.id}`)// i need to check it Once api Subdepartments/deletebyid/1213
        .subscribe({
          next: () => {
            modal.close();
            this. getDepartmentName()
            this.conformationPopup.openSuccessModal('department Name Deleted Successfully');
  
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal('Insertion of data failed');
  
          }
        });
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
  

