
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { subLocationData } from './sub-location-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-sub-location',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './sub-location.component.html',
  styleUrl: './sub-location.component.scss'
})
export class SubLocationComponent {
  subscription!: Subscription;
  SubLocationdetails = [] as any;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
  locationDetail:any;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  AddForm!: FormGroup;
  updateForm!: FormGroup;
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
    this.AddForm = this.fb.group({
      AddLocation: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      AddSubLocation: ['', Validators.required],
    });

    this.updateForm = this.fb.group({
      UpdateSubLocation: ['', [Validators.required]],
      updateLocation: ['', [Validators.required]],
    });
    this.getSubLocation();
    this.getLocation();
  }
  getLocation() {
    this.http.getData('JobLocation/GetJobLocations').subscribe((data: any) => {
      this.locationDetail = data;
      // this.locationDetail = data.map((item: any) => item.jobLocationName);
      console.log("joblocation", this.locationDetail);
    });
  }
  // // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getSubLocation() {
    this.subscription = this.http.getData('SubLocation/GetLocationNames').subscribe({
      next: (data: any) => {
        console.log(data);
        this.SubLocationdetails = data;
      },
    });
  }
  //ADD
  addSublocation(modal: any) {
    const request: subLocationData = {
      jobSubLocationName: this.AddForm.value.AddLocation.trim(),
      jobLocationId: this.AddForm.value.AddSubLocation,
      isDeleted: false
    };

    this.subscription = this.http.postdata('SubLocation/PostJobSubLocation', request).subscribe({
      next: () => {

        this.getSubLocation();
        modal.close();
        this.conformationPopup.openSuccessModal('Sub location added successfully');

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
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.id;
    this.updateForm.patchValue({ UpdateSubLocation: jobroletypelist.jobSubLocationName });
    this.updateForm.patchValue({ updateLocation: jobroletypelist.jobLocationId });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateSublocation(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: subLocationData = {
        id: this.selectedId,
        jobSubLocationName: this.updateForm.value.UpdateSubLocation.trim(),
        jobLocationId: this.updateForm.value.updateLocation,
        isDeleted: false
      };

      this.subscription = this.http.postdata('SubLocation/UPDATER', request).subscribe({
        next: () => {

          this.getSubLocation();
          modal.close();
          this.conformationPopup.openSuccessModal('Sub location updated successfully');
          this.resetForm();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');
          this.resetForm();
        }
      });
    }
  }
  //  Method to open the delete modal dialog
  //  DELETE
  opendelete(jobroletypelist: any) {
    this.selectedDeleteRole = jobroletypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeleteRole) return;

    this.subscription = this.http
      .getData(`SubLocation/deleteById/${this.selectedDeleteRole.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getSubLocation();
          this.conformationPopup.openSuccessModal('Sub location deleted successfully');

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
    this.selectedId = null;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
