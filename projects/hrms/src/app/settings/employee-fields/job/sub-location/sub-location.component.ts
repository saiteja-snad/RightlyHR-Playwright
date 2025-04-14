
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

@Component({
  selector: 'app-sub-location',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './sub-location.component.html',
  styleUrl: './sub-location.component.scss'
})
export class SubLocationComponent {
opendelete() {
throw new Error('Method not implemented.');
}
openupdateDialog() {
throw new Error('Method not implemented.');
}
  subscription!: Subscription;
  SubLocationdetails = [] as any;
  JobroleDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeleteRole: any = null;
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
    public formValidations: FormValidationsService
  ) {

  }
  ngOnInit(): void {
      this.AddForm = this.fb.group({
        AddLocation: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        AddSubLocation: ['', Validators.required],
      });
  
      this.updateForm = this.fb.group({
        Updatejobrole: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        updategraderole: ['', Validators.required],
      });
      this.getSubLocation();
     
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
        isDeleted:false
      };
  
      this.subscription = this.http.postdata('SubLocation/PostJobSubLocation', request).subscribe({
        next: () => {
  
          this.getSubLocation();
          modal.close();
          this.conformationPopup.openSuccessModal('Sub location added successfully');
          
          //  this.resetForm();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');
          //  this.resetForm();
        }
      });
    }
  
    close(modal: any) {
      modal.close();
    }
}
