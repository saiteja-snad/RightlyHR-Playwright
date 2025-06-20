import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-letters-ack',
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, SelectModule, DataLoaderContentComponent],
  templateUrl: './letters-ack.component.html',
  styleUrl: './letters-ack.component.scss'
})
export class LettersACKComponent {
  departmentdetails = [] as any;
  teamDetails = [] as any[];
  subscription!: Subscription;
  updateDepartmentDetails: any;
  teamdetailsdata = [] as any;
  teamdetails = [] as any[];
  deptdetails = [] as any[];
  isrequireddetails = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
  ];
  loader = false;
  isEditMode = false;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  updateForm!: FormGroup;
  getid: any;
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
    this.getTable();
    this.updateForm = this.fb.group({
      updateisrequired: ['', [Validators.required]],
      UpdatedDocumentName: ['', [Validators.required]]
    });
    this.getid = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  }

  // get table data
  getTable() {
    this.loader = true;
    this.subscription = this.http.getData("LetterAcknowledgment/getall").subscribe({
      next: (data: any) => {
        this.loader = false;
        console.log('Received team data:', data);
        this.teamdetailsdata = data
      },
      error: (reason: any) => {
        this.loader = false;
        const errorMessage = reason.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }
  // update pop up open
  openupdateDialog(team: any) {
    this.updateDepartmentDetails = team;
    console.log(team);
    console.log(this.deptdetails);

    this.updateForm.patchValue({
      updateisrequired: team.isAcknowledgementRequired ? 'yes' : 'no',
      // Should match dept.departmentId
      UpdatedDocumentName: team.documentName,      // Text input 
    });

    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }

  //  UPDATE
  updateDocument(modal: any) {
    let EmployeeId = parseInt(this.getid.employeeId)
    if (this.updateForm.valid && this.updateDepartmentDetails?.documentName) {
      const formValue = this.updateForm.value;
      console.log('Update form values:', this.updateForm.value);
      const payload = {
        id: this.updateDepartmentDetails.id,
        documentName: this.updateDepartmentDetails.documentName,
        documentType: this.updateDepartmentDetails.documentType || '',
        isAcknowledgementRequired: formValue.updateisrequired === 'yes',
        updatedBy: EmployeeId,
        updatedAt: new Date()
      };
      console.log('payload', payload);
      this.subscription = this.http.putData(`LetterAcknowledgment/${payload.id}`, payload).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Letter Acknowledgment updated successfully');
          this.updateForm.reset();
          this.getTable();
        },
        error: (error: any) => {
          const errorMessage = error.error?.Message ? error.error?.Message : 'Failed to update Letter Acknowledgment';
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    } else {
      console.warn('Update form is invalid or selected ID is missing:', this.updateForm.errors, this.updateDepartmentDetails?.subdepartmentId);
    }
  }


}
