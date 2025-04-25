import { Component, ViewChild } from '@angular/core';
import { IProbation } from './probation-details.model';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-probation-details',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './probation-details.component.html',
  styleUrl: './probation-details.component.scss'
})
export class ProbationDetailsComponent {
  subscription!: Subscription;
  getProbationconfigValues = [] as any;
  ProbationDetails = [] as any;
  isEditMode = false;
  selectedId: number | null = null;
  selectedDeletedetail: any = null;
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
      Type: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      Duration: ['', Validators.required],
    });

    this.updateForm = this.fb.group({
      Type: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
      Duration: ['', Validators.required],
    });
    this.getProbationDetailstoselectthevalue();
    this.getProbationDetails();
  }

  getProbationDetails() {
    this.subscription = this.http
      .getData('ProbationFlow/settingsprobationconfiggetall')
      .subscribe({
        next: (data: any) => {
          this.ProbationDetails = data;
        },
      error: (err: any) => {
        // console.log(err);

      },
      complete: () => {
        this.getProbationDetailstoselectthevalue();
      },
      });
  }
  // Method to open the add modal dialog
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  getProbationDetailstoselectthevalue() {
    const moduleId=environment.ProbationrequestmoduleId;
    this.subscription = this.http.getData(`ProbationFlow/settingsconfigvalue/${moduleId}`).subscribe({
      next: (data: any) => {
        // console.log(data);
        this.getProbationconfigValues = data;
        this.getProbationconfigValues = this.getProbationconfigValues.filter(
          (item: any) => !this.ProbationDetails.find((selectedItem: any) => selectedItem.configValueId  == item.id)
        );
    },
      error: (err) => {
        // console.error('Error fetching data:', err);
      }
    });
  }
  //ADD
  addPtobationDetails(modal: any) {
    const request: IProbation = {
      value: this.AddForm.value.Type.trim(),
      noOfDays: this.AddForm.value.Duration,
      configValueId: this.AddForm.value.AddSubLocation,
      isDeleted : false,
    };

    this.subscription = this.http.postdata('ProbationFlow/settingsprobationconfigpost', request).subscribe({
      next: () => {

        this.getProbationDetails();
        modal.close();
        this.conformationPopup.openSuccessModal('Jobrole Name added successfully');
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
  openupdateDialog(probationDetailslist: any) {
    this.selectedId = probationDetailslist.id;
    // console.log("update details:" + probationDetailslist.value);
    this.updateForm.patchValue({ Type: probationDetailslist.value });
    this.updateForm.patchValue({ Duration: probationDetailslist.noOfDays });
    this.modalService.open(this.updatepopup, {
      backdrop: 'static',
      centered: true
    });
  }
  //  UPDATE
  updateJobroletype(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      const request: IProbation = {
        value: this.updateForm.value.Type.trim(),
        noOfDays: this.updateForm.value.Duration,
        configValueId: this.selectedId,
        isDeleted : false
      };

      this.subscription = this.http.postdata('ProbationFlow/settingsprobationconfigupdate', request).subscribe({
        next: () => {
          modal.close();
          this.conformationPopup.openSuccessModal('Probation details updated successfully');
          this.getProbationDetails();
          this.resetForm();
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal('Insertion of data failed');
          this.resetForm();
        }
      });
    }
  }
  // Method to open the delete modal dialog
  // DELETE
  opendelete(probationDetailslist: any) {
    this.selectedDeletedetail = probationDetailslist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    if (!this.selectedDeletedetail) return;

    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfigdelete/${this.selectedDeletedetail.id}`)
      .subscribe({
        next: () => {
          modal.close();
          this.getProbationDetails();
          this.conformationPopup.openSuccessModal('Probation detail deleted successfully');

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
