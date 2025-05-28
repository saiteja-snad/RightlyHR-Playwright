import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { Iroles } from './roles.model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { SettingsRolePermissionsModuleTabsComponent } from '../../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component';
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
@Component({
  selector: 'app-roles',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, DataLoaderContentComponent, NoDataFoundComponent,
    SettingsRolePermissionsModuleTabsComponent, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class RolesComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
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
    public  formValidation: FormValidationService,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.initializeRoleForm();
    this.getrole();

    this.updateModuleInfo();
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
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
      name: this.roleForm.get('role')?.value.trim()
    };
    this.subscription = this.http.postdata("FusionRole", request).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Role added successfully');
      },
      error: (error: any) => {
        this.modalService.dismissAll();
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
      this.rolesDeletedata.name = this.updateForm.value.firstName.trim(),
        this.subscription = this.http.postdata(`FusionRole/Update`, this.rolesDeletedata).subscribe({
          next: (data: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Role updated successfully');
          },
          error: (error: any) => {
            this.modalService.dismissAll();
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
    this.roleForm.reset();
    this.rolesDeletedata = roles;
    this.updateForm?.patchValue({ firstName: roles.name });
    this.modalService.open(this.updatepopup, { centered: true, backdrop: 'static' });
  }

  opendelete(roles: any) {
    this.roleForm.reset();
    this.rolesDeletedata = roles;
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  capitalizeFirstLetter(event: Event, form: string): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    if (value.length === 1) {
      inputElement.value = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (value.length > 1 && value.charAt(0) !== value.charAt(0).toUpperCase()) {
      inputElement.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    if(form === 'add'){
      this.roleForm.get('role')?.setValue(inputElement.value);
    }else if(form === 'update'){
      this.updateForm.get('firstName')?.setValue(inputElement.value);
    }
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
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Role deleted successfully');
      },
      error: (error: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal(error.error.Message? error.error.Message : 'Failed to delete the role');
      },
      complete:()=>{
        this.getrole();
      }
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/settings/roles-permissions/roles': MODULE_INFOS.SETTINGS_ROLES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}