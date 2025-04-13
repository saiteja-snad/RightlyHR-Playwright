import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { IStatus } from '../../../../Interfaces/personal-modal';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-status',
  imports: [TranslateModule,ReactiveFormsModule,CommonModule],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss'
})
export class StatusComponent {

  
  updateForm!: FormGroup<any>;
  model: any;
   
  
  addrole={}as IStatus;
  statusForm!: FormGroup;
    submitted = false;
    status= {} as IStatus;
    subscription!: Subscription;
    statusdetails = {} as IStatus[];
    @ViewChild('deletepopup') deletepopup: any;
    @ViewChild('updatepopup') updatepopup: any;
    rolesDeletedata={} as any;
  statusDeletedata: any;
    constructor(private fb: FormBuilder,private modalService: NgbModal,private http: HttpService,private conformationPopup: OpenModalService) {}
    
    ngOnInit(): void {
      this.statusForm = this.fb.group({
        status: [null, [Validators.required, Validators.minLength(3),Validators.maxLength(50)]]
      });
        this.updateForm = this.fb.group({
      firstName: ['', Validators.required] // Replace with your actual field name if needed
    });
      this.getstatus();
    }
    // /
    // this.updateForm = this.fb.group({
    //   firstName: ['', Validators.required] // Replace with your actual field name if needed
    // });
  
  // /accesslevels
  
  getstatus() {
    this.subscription = this.http.getData("Status").subscribe({
      next: (data: any) => {
        console.log(data);
        this.statusdetails = data as IStatus[]
        console.log(this.statusdetails)
      },
      error: (reason: any) => {
        console.log(reason);
        alert("Insertion of data is failed")
      }
    })
  }
  
  onSubmit() {
    const request = {
      isdeleted: 'Active',
      statusname: this.statusForm.get('status')?.value  // Assuming "gh" comes from the form control 'role'
    };
  
    this.subscription = this.http.postdata('Status', request).subscribe({
      next: (data: any) => {
        console.log(data);
        this.modalService.dismissAll();
        this.getstatus();
        this.conformationPopup.openSuccessModal('Status added successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Failed to add status');
      }
    });
  }
  
      
  updateStatus(modal: any): void {
    if (this.updateForm.valid) {
    
      const updatePayload = {
        isdeleted: 'Active',
        sno: this.statusDeletedata.sno, 
        statusname: this.updateForm.value.firstName 
      };
  
      this.subscription = this.http.postdata('Status/UPDATER', updatePayload).subscribe({
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
  
  close(modal: any): void {
    modal.dismiss();
    this.updateForm.reset();
  }
  
  openupdate(status: any): void {
    console.log(status);
    this.statusDeletedata = status;
    this.updateForm?.patchValue({
      firstName: status.statusname // assuming this is the field you edit
    });
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }
  
    opendelete(status:any) {
      console.log(status)
      this.statusDeletedata=status;
      this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
    }
    
  // Confirm delete action
  deleteStatus(modal: any): void {
  
  
    const deleteRequest = {
      id:modal.id,
      concurrencyStamp: modal.concurrencyStamp,
      name: modal.name,
      normalizedName: modal.normalizedName
    }
  
    this.http.postdata('', deleteRequest).subscribe({
      next: () => {
        this.getstatus(); // refresh role list
        this.modalService.dismissAll()
        this.conformationPopup.openSuccessModal('Role deleted successfully');
      
      },
      error: (err: any) => {
        console.error('Delete failed:', err);
        this.conformationPopup.openErrorModal('Failed to delete the role');
      }
    });
  }
   
  }
