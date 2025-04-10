import { CommonModule } from '@angular/common';

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Iroles } from './roles.model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {


  updateForm!: FormGroup<any>;
  model: any;


  addrole = {} as Iroles;
  roleForm!: FormGroup;
  submitted = false;
  roles = {} as Iroles;
  subscription!: Subscription;
  rolesdetails = {} as Iroles[];
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  rolesDeletedata = {} as any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      role: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
    this.updateForm = this.fb.group({
      firstName: ['', Validators.required] // Replace with your actual field name if needed
    });
    this.getrole();
  }
  // /
  // this.updateForm = this.fb.group({
  //   firstName: ['', Validators.required] // Replace with your actual field name if needed
  // });

  // /accesslevels

  getrole() {
    this.subscription = this.http.getData("FusionRole").subscribe({
      next: (data: any) => {
        console.log(data);
        this.rolesdetails = data as Iroles[]
        console.log(this.rolesdetails)
      },
      error: (reason: any) => {
        console.log(reason);
        alert("Insertion of data is failed")
      }
    })
  }

  onSubmit() {

    const request = {
      name: this.roleForm.get('role')?.value
    };
    this.subscription = this.http.postdata("FusionRole", request).subscribe({
      next: (data: any) => {
        console.log(data);
        this.modalService.dismissAll();
        this.getrole();
        this.conformationPopup.openSuccessModal('Role added successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        // alert("Insertion of data is failed")
        this.conformationPopup.openErrorModal('Role added data is failed');
      }
    })
  }


  updateRole(modal: any): void {
    if (this.updateForm.valid) {
      this.rolesDeletedata.name = this.updateForm.value.firstName,
        this.subscription = this.http.postdata(`FusionRole/Update`, this.rolesDeletedata).subscribe({
          next: (data: any) => {
            this.getrole(); // refresh role list
            this.updateForm.reset(); // reset the form
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Role updated successfully');
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

  openupdate(roles: any) {
    console.log(roles)
    this.rolesDeletedata = roles;
    this.updateForm?.patchValue({ firstName: roles.normalizedName });
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  opendelete(roles: any) {
    console.log(roles)
    this.rolesDeletedata = roles;
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  // Confirm delete action
  deleteRole(modal: any): void {


    const deleteRequest = {
      id: modal.id,
      concurrencyStamp: modal.concurrencyStamp,
      name: modal.name,
      normalizedName: modal.normalizedName
    }

    this.http.postdata('FusionRole/Delete', deleteRequest).subscribe({
      next: () => {
        this.getrole(); // refresh role list
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




