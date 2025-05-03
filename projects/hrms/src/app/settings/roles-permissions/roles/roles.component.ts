import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Iroles } from './roles.model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-roles',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class RolesComponent implements OnInit, OnDestroy {
  updateForm!: FormGroup;
  model: any;
  subscription!: Subscription;
  roleForm!: FormGroup;
  submitted = false;
  rolesdetails : Iroles[]= [];
  rolesDeletedata! : Iroles;
  dataLoad= false;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public  formValidation: FormValidationService
  ) { }

  ngOnInit(): void {
    this.initializeRoleForm();
    this.getrole();
  }

  initializeRoleForm() {
    this.roleForm = this.fb.group({
      role: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)
      ]]
    });

    this.updateForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]]
    });
  }

  getrole() {
    this.dataLoad= true;
    this.subscription = this.http.getData("FusionRole").subscribe({
      next: (data: any) => {
        this.rolesdetails = data as Iroles[];
      },
      error: (reason: any) => {
        this.dataLoad= false;
      },
      complete:()=>{
        this.dataLoad= false;
      }
    })
  }

  onSubmit() {
    const request = {
      name: this.roleForm.get('role')?.value
    };
    this.subscription = this.http.postdata("FusionRole", request).subscribe({
      next: (data: any) => {
        this.conformationPopup.openSuccessModal('Role added successfully');
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.Message? error.error.Message : 'Failed to add role');
      },
      complete: ()=>{
        this.getrole();
        this.roleForm.reset();
      }
    })
  }

  updateRole(modal: any): void {
    if (this.updateForm.valid) {
      this.rolesDeletedata.name = this.updateForm.value.firstName,
        this.subscription = this.http.postdata(`FusionRole/Update`, this.rolesDeletedata).subscribe({
          next: (data: any) => {
            this.conformationPopup.openSuccessModal('Role updated successfully');
          },
          error: (error: any) => {
            this.conformationPopup.openErrorModal(error.error.Message? error.error.Message : 'Failed to update role');
          },
          complete: ()=>{
            this.getrole();
            this.updateForm.reset();
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
    this.rolesDeletedata = roles;
    this.updateForm?.patchValue({ firstName: roles.name });
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  opendelete(roles: any) {
    this.rolesDeletedata = roles;
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  deleteRole(modal: any): void {
    const deleteRequest = {
      id: modal.id,
      concurrencyStamp: modal.concurrencyStamp,
      name: modal.name,
      normalizedName: modal.normalizedName
    }

    this.subscription = this.http.postdata('FusionRole/Delete', deleteRequest).subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Role deleted successfully');
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error.error.Message? error.error.Message : 'Failed to delete the role');
      },
      complete:()=>{
        this.getrole();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
