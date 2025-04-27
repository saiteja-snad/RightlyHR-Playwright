import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-status',
  imports: [CommonModule,TranslateModule,ReactiveFormsModule],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss'
})

export class StatusComponent {
  updateForm!: FormGroup;
  statusForm!: FormGroup;
  submitted = false;
  status = {} as any;
  statusDeletedata = {} as any;
  subscription!: Subscription;
  statusdetails = [] as any[];
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, 
    private conformationPopup: OpenModalService, public formValidations: FormValidationsService,
    public rbac: RbacService) { }

  ngOnInit(): void {
    this.statusForm = this.fb.group({
      status: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
    this.updateForm = this.fb.group({
      statusname: ['', Validators.required]
    });
    this.getstatus();
  }

  getstatus() {
    this.subscription = this.http.getData("Status").subscribe({
      next: (data: any) => {
        this.statusdetails = data as [];
      },
      error: (reason: any) => {
        console.log(reason);
      }
    })
  }

  onSubmit() {
    const request = {
      isdeleted: 'Active',
      statusname: this.statusForm.get('status')?.value
    };

    this.subscription = this.http.postdata('Status', request).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.getstatus();
        this.conformationPopup.openSuccessModal('Status added successfully');
        this.statusForm.reset();
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Failed to add status');
      }
    });
  }

  openupdate(status: any): void {
    this.statusDeletedata = status;
    this.updateForm?.patchValue({
      statusname: status.statusname // assuming this is the field you edit
    });
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }

  opendelete(status: any): void {
    this.statusDeletedata = status;
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  updateStatus(): void {
    if (this.updateForm.valid) {
      this.statusDeletedata.statusname = this.updateForm.get('statusname')?.value;
      this.subscription = this.http.postdata('Status/UPDATER', this.statusDeletedata).subscribe({
        next: (data: any) => {
          this.getstatus();
          this.updateForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Status updated successfully');
        },
        error: (err: any) => {
          console.error('Update failed:', err);
          this.conformationPopup.openErrorModal('Update failed. Please try again.');
        }
      });
    } else {
      this.conformationPopup.openErrorModal('Form is invalid. Please check the inputs.');
    }
  }

  // Confirm delete action
  deleteStatus(status: any): void {
    const deleteRequest = {
      sno: status.sno,
      statusname: status.statusname,// assuming this is the field you edit
      isdeleted: 'void'
    };
    this.subscription = this.http.postdata('Status/UPDATER', deleteRequest).subscribe({
      next: (data: any) => {
        this.getstatus();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Status data deleted successfully');
      },
      error: (err: any) => {
        console.error('Delete status failed:', err);
        this.conformationPopup.openErrorModal('Failed to delete status data');
      }
    });
  }
}
