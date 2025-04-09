import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IRelation } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { Ipersonal } from '../../../Interfaces/members-model';
import { IProbationEmployees } from '../../../Interfaces/letters-model';
import { IJob } from '../../../Interfaces/job-model';

@Component({
  selector: 'app-family-details',
  imports: [CommonModule, Select, ReactiveFormsModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './family-details.component.html',
  styleUrl: './family-details.component.scss'
})
export class FamilyDetailsComponent implements OnInit {
  subscription!: Subscription;
  familyRelations: IRelation[] = [];
  selectedFamilyMembername: any
  empinfo = {} as IJob; 
  familyDetailsForm!: FormGroup;
  selectedFamilyMember: any
  familyDetailsupdateForm!: FormGroup
  selectedFamilyMemberid:any
  familyDetailsdisplay = new BehaviorSubject<any[]>([]);
 
    employedata={} as IProbationEmployees;
  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder,   public formValidation: FormValidationService,) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeFamilyDetailsForm();
    this.initializeFamilyDetailsupdateForm();
    this.getFamilyRelations();
    this.getfamilyDetailsByEmployeid();
    this.getEmployeeId();
  }

  initializeFamilyDetailsForm(): void {
    this.familyDetailsForm = this.fb.group({
      memberName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      dateOfBirth: ['', Validators.required],
      relationShipId: ['', Validators.required],
      isDependent: [false],
    });
  }

  initializeFamilyDetailsupdateForm(): void {
    this.familyDetailsupdateForm = this.fb.group({
      memberNameupdate: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
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
          this.conformationPopup.openSuccessModal('Family details added successfully');

        },
        error: (err: any) => {
          console.error('Error saving family details:', err);
          this.conformationPopup.openErrorModal('Family details added failed');

        },
      });
    } else {
      this.familyDetailsForm.markAllAsTouched();
    }
  }

  //get family relations dropdown
  getFamilyRelations() {
    this.subscription = this.http
      .getData('Relationship?isDependent=true')
      .subscribe({
        next: (data: any) => {
          this.familyRelations = data as IRelation[];
        },
      });
  }

  //get family details by employee id
  getfamilyDetailsByEmployeid() {
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`FamilyMembers/getByEmpId/${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.familyDetailsdisplay.next(data);
        },
        error: (err: any) => {
          console.error('Error fetching family details:', err);
        },
      });
  }
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data as IProbationEmployees;;
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
  
    console.log(this.familyDetailsForm.value); 
  }
  
  openModalupdate(content: any, familyDetail: any): void {
    console.log(familyDetail)
    this.selectedFamilyMembername = familyDetail.relationShipName
    this.selectedFamilyMember = familyDetail.id;
    const selectedRelationship = this.familyRelations.find(
      (relation) => relation.sno === familyDetail.relationShipId
    );
    const formattedDateOfBirth = familyDetail.dateOfBirth
      ? new Date(familyDetail.dateOfBirth).toISOString().split('T')[0]
      : null;
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
      console.log('Selected Relationship:', selectedRelationship);
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
          this.conformationPopup.openSuccessModal('Family details updated successfully')

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
   this.selectedFamilyMemberid=educationDetails
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

 
  familyDelete() {
    this.subscription = this.http
      .getData(`FamilyMembers/deleteById/${this.selectedFamilyMemberid.id}`)
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll()
          this.getfamilyDetailsByEmployeid()
          this.conformationPopup.openSuccessModal('Family details deleted successfully')
        },
        error: (err: any) => {
          console.log(err);
          this.conformationPopup.openErrorModal('Family details deleted failed')
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
}
