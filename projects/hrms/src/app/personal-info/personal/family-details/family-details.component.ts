import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Ipersonal, IRelation } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { IJob } from '../../../Interfaces/job-model';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
@Component({
  selector: 'app-family-details',
  imports: [CommonModule, Select, ReactiveFormsModule, TableModule, DateformatPipe, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './family-details.component.html',
  styleUrl: './family-details.component.scss'
})

export class FamilyDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('familyDetailsTable') familyDetailsTable!: Table;
  subscription!: Subscription;
  familyRelations: IRelation[] = [];
  selectedFamilyMembername: any
  empinfo = {} as IJob;
  familyDetailsForm!: FormGroup;
  selectedFamilyMember: any
  familyDetailsupdateForm!: FormGroup
  selectedFamilyMemberid: any
  familyDetailsTableData: any[] = []; // Data bound to the table
  originalFamilyDetails: any[] = []; // Store original unsorted data for reset
  loading = false
  employedata = {} as Ipersonal;
  currentdata = new Date();
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService, private http: HttpService, 
    private fb: FormBuilder, public formValidation: FormValidationService, public rbac: RbacService, 
    public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  ngOnInit(): void {
    this.initializeFamilyDetailsForm();
    this.initializeFamilyDetailsupdateForm();
    this.getFamilyRelations();
    this.getEmpInfoFromRoute();
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
      this.getfamilyDetailsByEmployeid();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
      this.getfamilyDetailsByEmployeid();
    }
  }

  initializeFamilyDetailsForm(): void {
    this.familyDetailsForm = this.fb.group({
      memberName: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirth: ['', Validators.required],
      relationShipId: ['', Validators.required],
      isDependent: [false],
    });
  }

  initializeFamilyDetailsupdateForm(): void {
    this.familyDetailsupdateForm = this.fb.group({
      memberNameupdate: ['', [Validators.required, Validators.maxLength(50)]],
      dateOfBirthupdate: ['', Validators.required],
      relationShipIdupdate: ['', Validators.required],
      isDependentupdate: [null],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  //post family details
  postFamilyDetails(): void {
    if (this.familyDetailsForm.valid) {
      const payload = {
        memberName: this.familyDetailsForm.get('memberName')?.value,
        dateOfBirth: this.familyDetailsForm.get('dateOfBirth')?.value,
        relationShipId: this.familyDetailsForm.get('relationShipId')?.value?.sno,
        isDependent: this.familyDetailsForm.get('isDependent')?.value ?? false,
        isDeleted: false,
        employeeId: parseInt(this.empinfo.employeeId),
      };
      this.subscription = this.http.postdata('FamilyMembers', payload).subscribe({
        next: (data: any) => {
          this.familyDetailsForm.reset();
          this.modalService.dismissAll();
          this.getfamilyDetailsByEmployeid();
          this.conformationPopup.openSuccessModal('Family member details added successfully');
        },
        error: (err: any) => {
          console.error('Error saving family details:', err);
          this.conformationPopup.openErrorModal('Family members details added failed');
        },
      });
    } else {
      this.familyDetailsForm.markAllAsTouched();
    }
  }

  //get family relations dropdown
  getFamilyRelations() {
    this.subscription = this.http.getData('Relationship').subscribe({
      next: (data: any) => {
        this.familyRelations = data as IRelation[];
      },
    });
  }

  //get family details by employee id
  getfamilyDetailsByEmployeid() {
    this.loading = true
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`FamilyMembers/getByEmpId/${EmpId}`).subscribe({
      next: (data: any) => {
        this.loading = false
        // Store the original data for resetting sorts
        this.originalFamilyDetails = [...data];
        this.familyDetailsTableData = [...data];
        // Reset sorting state when new data is loaded
        this.currentSortField = '';
        this.currentSortOrder = 0;
      },
      error: (err: any) => {
        this.loading = false
        console.error('Error fetching family details:', err);
      },
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.patchForm(data);
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {
    this.familyDetailsForm.patchValue({
      memberName: data.familyMemberName || '',
      dateOfBirth: data.familyMemberDOB || '',
      relationShipId: data.familyMemberRelation || '',
      isDependent: data.isDependent || false,
    });
  }

  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openModalupdate(content: any, familyDetail: any): void {
    this.selectedFamilyMembername = familyDetail.relationShipName
    this.selectedFamilyMember = familyDetail.id;
    const selectedRelationship = this.familyRelations.find(
      (relation) => relation.sno === familyDetail.relationShipId
    );
    const formattedDateOfBirth = this.formatDateToLocal(familyDetail.dateOfBirth)
    this.familyDetailsupdateForm.patchValue({
      memberNameupdate: familyDetail.memberName,
      dateOfBirthupdate: formattedDateOfBirth,
      relationShipIdupdate: selectedRelationship,
      isDependentupdate: familyDetail.isDependent
    });
    // Open the modal
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  updatefamilyDetails(): void {
    if (this.familyDetailsupdateForm.valid) {
      const EmpId = parseInt(this.empinfo.employeeId);
      const selectedRelationship = this.familyDetailsupdateForm.get('relationShipIdupdate')?.value;
      const payload = {
        id: this.selectedFamilyMember,
        employeeId: EmpId,
        memberName: this.familyDetailsupdateForm.get('memberNameupdate')?.value,
        dateOfBirth: this.familyDetailsupdateForm.get('dateOfBirthupdate')?.value,
        relationShipId: this.familyDetailsupdateForm.get('relationShipIdupdate')?.value?.sno,
        relationShipName: this.selectedFamilyMembername,
        employeeStatus: "Active",
        isDependent: this.familyDetailsupdateForm.get('isDependentupdate')?.value ?? false,
        isDeleted: false
      };
      this.subscription = this.http.postdata(`FamilyMembers/UPDATE`, payload).subscribe({
        next: (data: any) => {
          this.getfamilyDetailsByEmployeid();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Family member details updated successfully')
        },
        error: (err: any) => {
          console.error('Error updating family details:', err);
          this.conformationPopup.openErrorModal('Failed to update family details');
        }
      });
    } else {
      this.familyDetailsupdateForm.markAllAsTouched();
    }
  }

  opendeletModal(content: any, educationDetails: any): void {
    this.selectedFamilyMemberid = educationDetails
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  familyDelete() {
    this.subscription = this.http.getData(`FamilyMembers/deleteById/${this.selectedFamilyMemberid.id}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll()
        this.getfamilyDetailsByEmployeid()
        this.conformationPopup.openSuccessModal('Family member details deleted successfully')
      },
      error: (err: any) => {
        console.log(err);
        this.conformationPopup.openErrorModal('Family members deleted failed')
      },
    });
  }
  
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  resetdata() {
    this.familyDetailsForm.reset();
    this.familyDetailsupdateForm.reset();
    this.modalService.dismissAll()
  }

  getFamilyDetailsData(): any[] {
    return this.familyDetailsTableData || [];
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.familyDetailsTableData = [...this.originalFamilyDetails];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.familyDetailsTable) {
          this.familyDetailsTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      // Handle null/undefined values
      if (val1 == null && val2 == null) return 0;
      if (val1 == null) return event.order;
      if (val2 == null) return -event.order;

      // Handle date sorting
      if (field === 'dateOfBirth') {
        const date1 = new Date(val1).getTime();
        const date2 = new Date(val2).getTime();
        return event.order * (date1 - date2);
      }

      // Handle boolean sorting
      if (field === 'isDependent') {
        const bool1 = val1 ? 1 : 0;
        const bool2 = val2 ? 1 : 0;
        return event.order * (bool1 - bool2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1).trim();
      val2 = String(val2).trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}