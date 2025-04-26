import { CommonModule, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { JobLocation } from './locationModule';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-location',
  imports: [CommonModule,ReactiveFormsModule,TranslateModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit,OnDestroy {
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  locationForm!: FormGroup;
  updateForm!: FormGroup;
  locationDetail: any[] = [];
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteLoc: any = null;
  subscription!: Subscription;
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
    this.locationForm = this.fb.group({
      jobLocationName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    this.updateForm = this.fb.group({
      jobLocationName: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]]
    });
    
    this.getLocation();
  }
  allowOnlyLettersAndSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const char = event.key;
    const pattern = /^[A-Za-z ]$/;
  
    // Block if the key is not a letter or space
    if (!pattern.test(char)) {
      event.preventDefault();
      return;
    }
  
    // Block if length is already 50
    if (input.value.length >= 100) {
      event.preventDefault();
    }
  }
  getLocation() {
    this.http.getData('JobLocation/GetJobLocations').subscribe((data: any) => {
      this.locationDetail = data;
    });
  }
  //ADD
  addLocation(){
    const request : JobLocation = {
      jobLocationName: this.locationForm.value.jobLocationName.trim(),
      isDeleted: false
    };

   this.subscription = this.http.postdata('JobLocation/PostJobLocation', request).subscribe({
      next: () => {
        this.getLocation();
        this.conformationPopup.openSuccessModal('Location added successfully');
        this.resetForm();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Insertion of data failed');
        this.resetForm();
      }
    });
  }
 
// UPDATE
  updateLocation(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request : JobLocation = {
        jobLocationName: this.updateForm.value.jobLocationName.trim(),
        isDeleted: false,
        id: this.selectedId
      };
   
      this.subscription = this.http.postdata('JobLocation/UPDATER', request).subscribe({
        next: () => {
          this.getLocation();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Location updated successfully');
        },
        error: (err: any) => {
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    }
  }
  close(modal: any) {
    modal.dismiss();
    this.updateForm.reset();
  }
  openupdate(loc: any) {
    this.selectedId = loc.id;
    this.updateForm.patchValue({ jobLocationName: loc.jobLocationName });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  opendelete(loc: any) {
    this.selectedDeleteLoc = loc;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
// DELETE
  onDelete(modal: any) {
    if (!this.selectedDeleteLoc) return;

    const deleteRequest : JobLocation = {
      jobLocationName: this.selectedDeleteLoc.jobLocationName,
      isDeleted: true,
      id: this.selectedDeleteLoc.id
    };

    this.http.postdata('JobLocation/UPDATER', deleteRequest).subscribe({
      next: () => {
        this.getLocation();
        modal.close();
        this.conformationPopup.openSuccessModal('Location deleted successfully');
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('Failed to delete the location');
      }
    });
  }

  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteLoc = null;
  }

  resetForm() {
    this.locationForm.reset();
    this.isEditMode = false;
    this.selectedId = null;
  }

    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
  }
  
}
