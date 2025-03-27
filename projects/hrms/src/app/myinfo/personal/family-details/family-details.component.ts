import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { IRelation } from '../../../Interfaces/personal-modal';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-family-details',
  imports: [CommonModule, Select, ReactiveFormsModule],
  templateUrl: './family-details.component.html',
  styleUrl: './family-details.component.scss'
})
export class FamilyDetailsComponent implements OnInit {
  subscription!: Subscription;
  familyRelations: IRelation[] = [];
  empinfo: any = {};
  familyDetailsForm!: FormGroup;
  familyDetailsdisplay = new BehaviorSubject<any[]>([]);
  educationtypes = [
    { label: 'Select', value: null },]

  constructor(private modalService: NgbModal, private conformationPopup: OpenModalService, private http: HttpService, private fb: FormBuilder) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('fusionuser') ?? '{}');
    this.initializeFamilyDetailsForm();
    this.getFamilyRelations();
    this.getfamilyDetailsByEmployeid();
  }

  initializeFamilyDetailsForm(): void {
    this.familyDetailsForm = this.fb.group({
      memberName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      dateOfBirth: ['', Validators.required],
      relationShipId: ['', Validators.required],
      isDependent: [false],
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
      this.familyDetailsForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
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

  openModalupdate(content: any, familyDetail: any): void {
    this.familyDetailsForm.patchValue({
      memberName: familyDetail.memberName,
      dateOfBirth: familyDetail.dateOfBirth,
      relationShipId: familyDetail.relationShipId,
      isDependent: familyDetail.isDependent
    });
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }


  deleteFamilyDetail(id: number): void {
    if (confirm('Are you sure you want to delete this family detail?')) {
      this.subscription = this.http.deleteData(`FamilyMembers/${id}`).subscribe({
        next: () => {
          this.getfamilyDetailsByEmployeid(); // Refresh the table after deletion
          console.log('Family detail deleted successfully');
        },
        error: (err: any) => {
          console.error('Error deleting family detail:', err);
        }
      });
    }
  }
}
