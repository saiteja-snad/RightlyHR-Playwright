import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { IRoles } from './permission.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { permissionsData } from './permissionsdata';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SettingsRolePermissionsModuleTabsComponent } from "../../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component";
@Component({
  selector: 'app-permissions',
  imports: [CommonModule, FormsModule, AutoCompleteModule, SettingsRolePermissionsModuleTabsComponent],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class PermissionsComponent implements OnInit, OnDestroy {
  roleId!: string;
  noRoleSelected = true;
  isSaveButtonEnabled = false;
  roles: IRoles[] = [];
  permissions!: any[];
  roleToFilter: any = null;
  filteredRole: any | undefined;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;

  

  constructor(
    private http: HttpService, 
    private modalService: NgbModal, 
    private modal: OpenModalService, 
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    if (this.roleToFilter === null) {
      this.permissions = JSON.parse(JSON.stringify(permissionsData));
    }
    this.getAllroles();
  }

  getAllroles(): void {
    this.http.getData('FusionRole').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.roles = data as IRoles[]
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  filterRoles(event: any) {
    const filtered: any[] = [];
    const query = event.query;
    this.roles.forEach((t: any) => {
      if (t.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(t);
      }
    });
    this.filteredRole = filtered;
  }

  onRoleSelect(event: any) {
    const selectedRoleId = event?.value?.id;
    this.onCategoryName(selectedRoleId);
  }

  onCategoryName(id: any) {
    if (id == null) {
      this.noRoleSelected = true;
    } else {
      this.noRoleSelected = false;
      this.roleId = id;
      this.getRolepermission(this.roleId);
    }
    this.updateSaveButtonState();
  }

  updateSaveButtonState() {
    this.noRoleSelected = !this.permissions.some(per => per.View || per.Create || per.Update || per.Delete);
    this.isSaveButtonEnabled = !(this.noRoleSelected);
  }

  getRolepermission(id: string) {
    this.http.getData(`FusionRoleClaims/getRoleClaimsbyroleId/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Fetched role claims:', data);
          this.permissionsReset(data);
        },
        error: (error: any) => {
          console.error('Error fetching role permissions:', error);
          this.permissionsReset([]);
        }
      });
  }
  
  permissionsReset(data: any) {
    // Reset all checkbox flags
    this.permissions.forEach((permission: any) => {
      permission.View = false;
      permission.Create = false;
      permission.Update = false;
      permission.Delete = false;
    });
  
    if (data?.length > 0) {
      data.forEach((claim: any) => {
        const permission = this.permissions.find((p: any) => p.fields === claim.claimType);
        if (permission) {
          const value = claim.claimValue.toLowerCase();
  
          if (value.endsWith('.view')) {
            permission.View = true;
          }
          if (value.endsWith('.create')) {
            permission.Create = true;
          }
          if (value.endsWith('.update')) {
            permission.Update = true;
          }
          if (value.endsWith('.delete')) {
            permission.Delete = true;
          }
        }
      });
      this.isSaveButtonEnabled = true;
    } else {
      this.isSaveButtonEnabled = false;
    }
  }
  

  onCheckboxChange(permission: { [key: string]: any; View: boolean; Create: boolean; Update: boolean; Delete: boolean; }, action: string) {
    if (action === 'View' && !permission.View) {
      permission.Update = false;
      permission.Create = false;
      permission.Delete = false;
    } else if ((action === 'Create' || action === 'Update' || action === 'Delete') && permission[action]) {
      permission.View = true;
    }
  }

  isCheckboxDisabled(field: string, action: string): boolean {
    const disabledOptions = ['Employee Basic Information', 'Employee Current Address', 'Employee Permanent Address', 'Employee Contact Details',
                             'Employee Emergency Contact Details', 'Employee Onboarding Documents', 'Basic Information', 'Current Address', 'Permanent Address', 'Contact Details',
                             'Emergency Contact Details', 'Onboarding Documents','Employee Team Members','Team Members','Employee Onboarding Request','Separation Request','Employee Separation Request'
                            ];

    return disabledOptions.includes(field) && (action === 'delete' || action === 'create');
}

isDisabled(field: string, action: string): boolean {
  const viewOnlyFields = ['Leave Allocation Tab', 'Flexible Leave Allocation Tab', 'Load Entitlements Tab', 'Attendance Eligibility Criteria Tab', 'Comp Off Entitlement Tab',
    'WFH Entitlement Tab', 'Permission Elgibility Tab', 'Attendance Regularization Eligibility Tab', 'Shifts Published Tab', 'Policies Published Tab', 'Holidays Published Tab',
    'Weekends Published Tab', 'Expense Allowed Days', 'DST Published Tab', 'Leave Category Published Tab','Active Forms','Inactive Forms','Draft Forms', 'Desk Allocation - Inactive',
    'Desk Allocation - Create'
  ];
  return viewOnlyFields.includes(field) && (action === 'Create' || action === 'Update' || action === 'Delete');
}

isActionEnabled(field: string, action: string): boolean {
  const enabledTabs = ['Document Tab', 'NoDue Clearance Tab', 'Leave Allocation Tab', 'Flexible Leave Allocation Tab', 'Dynamic Forms Module', 'Desk Allocation - All', 
    'Manage Policies Tab', 'Manage Weekends Tab', 'Manage DST Tab'];
  return enabledTabs.includes(field) && (action === 'Create' || action === 'Update' || action === 'Delete');
}

  changePermissions() {
    if (!this.roleToFilter?.id) {
      this.permissions.forEach((permission: any) => {
        permission.View = false;
        permission.Create = false;
        permission.Update = false;
        permission.Delete = false;
      });
      this.isSaveButtonEnabled = false;
    }
  }

  // preparePayload(roleTypeId: string): any[] {
  //   return this.permissions
  //     .filter(p => p.View || p.Update || p.Create || p.Delete)
  //     .map(p => ({
  //       roleTypeId: roleTypeId,
  //       section: p.section,
  //       permission: p.fields,
  //       view: p.View,
  //       update: p.Update,
  //       create: p.Create,
  //       delete: p.Delete
  //     }));
  // }

  // permissionsCreate() {
  //   this.modalService.open(this.stagingLoadingModal, { centered: true });
  //   const payload = this.preparePayload(this.roleId);

  //   this.http.postdata('FusionRoleClaims', payload).subscribe({
  //     next: (data) => {
  //       this.modalService.dismissAll();
  //       this.modal.openSuccessModal('Permissions updated successfully!');
  //     },
  //     error: (err) => {
  //       console.error('Error posting permissions:', err);
  //       this.modalService.dismissAll();
  //       this.modal.openErrorModal('Failed to update permissions!');
  //     },
  //     complete: () => {
  //     }
  //   });
  // }

  permissionsCreate() {
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    const payload = this.preparePayload(this.roleId);
    this.http.postdata("FusionRoleClaims/rolePermissions", payload).subscribe({
      next: (data) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal("Permissions updated successfully!");
      },
      error: (err) => {
        console.error("Error posting permissions:", err);
        this.modalService.dismissAll();
        this.modal.openErrorModal("Failed to update permissions!");
      }
    });
  }

  preparePayload(roleId: string): any[] {
    const claims: any[] = [];
  
    for (const p of this.permissions) {
      if (p.View) {
        claims.push({
          claimType: `${p.fields}`, claimValue: `${p.fields}.view`, roleId: roleId
        });
      }
      if (p.Create) {
        claims.push({
          claimType: `${p.fields}`, claimValue: `${p.fields}.create`, roleId: roleId
        });
      }
      if (p.Update) {
        claims.push({ claimType: `${p.fields}`, claimValue: `${p.fields}.update`, roleId: roleId
        });
      }
      if (p.Delete) {
        claims.push({
          claimType: `${p.fields}`, claimValue: `${p.fields}.delete`, roleId: roleId
        });
      }
    }
    return claims;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}