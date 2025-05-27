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
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-sub-location',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule,SelectModule],
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
  locationDetail: any;
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
      AddLocation: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]],
      AddSubLocation: ['', Validators.required, ],
    });

    this.updateForm = this.fb.group({
      UpdateSubLocation: ['', [Validators.required, this.formValidations.maxCharactersValidator(101)]],
      updateLocation: [null, [Validators.required, ]],
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
        this.SubLocationdetails = data.sort((a: any, b: any) => {
          // First sort by location name
          const locationComparison = a.jobLocationName.localeCompare(b.jobLocationName);
          // If location names are the same, sort by sub-location name
          if (locationComparison === 0) {
            return a.jobSubLocationName.localeCompare(b.jobSubLocationName);
          }
          return locationComparison;
        });
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
        const errorMessage= error.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      }
    });
  }

  close(modal: any) {
    modal.close();
  }
  // Method to open the update modal dialog
  openupdateDialog(jobroletypelist: any) {
    this.selectedId = jobroletypelist.id;
    console.log(jobroletypelist.jobLocationId);
    console.log(this.locationDetail);
    console.log(this.locationDetail.find((loc: { id: number; }) => loc.id == jobroletypelist.jobLocationId));
    
    this.updateForm.patchValue({ 
      updateLocation: jobroletypelist.jobLocationId,
      UpdateSubLocation: jobroletypelist.jobSubLocationName
    });
  
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
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
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
          const errorMessage = error.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);

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
