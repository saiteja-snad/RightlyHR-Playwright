import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IRoles } from './permission.model';
import { filter, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { permissionsData } from './permissionsdata';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SettingsRolePermissionsModuleTabsComponent } from '../../../shared/settings-tabs/settings-role-permissions-module-tabs/settings-role-permissions-module-tabs.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-permissions',
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    SettingsRolePermissionsModuleTabsComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    TranslateModule,
    NgbPopoverModule
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PermissionsComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  roleId!: string;
  noRoleSelected = true;
  isSaveButtonEnabled = false;
  roles: IRoles[] = [];
  permissions!: any[];
  roleToFilter: any = null;
  filteredRole: any | undefined;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;
  @ViewChild('resetLoadingModal') resetLoadingModal: any;
  dataLoad: boolean = false;

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    this.dataLoad = true;
    setTimeout(() => {
      if (this.roleToFilter === null) {
        this.permissions = JSON.parse(JSON.stringify(permissionsData));
      }
      this.getAllroles();
      this.dataLoad = false;
    });

    this.updateModuleInfo();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  getAllroles(): void {
    this.http
      .getData('FusionRole')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.roles = data as IRoles[];
        },
        error: (error: any) => {
          console.log(error);
        },
      });
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
      this.dataLoad = true;
      this.noRoleSelected = false;
      this.roleId = id;
      this.getRolepermission(this.roleId);
    }
    this.updateSaveButtonState();
  }

  updateSaveButtonState() {
    this.noRoleSelected = !this.permissions.some(
      (per) => per.View || per.Create || per.Update || per.Delete
    );
    this.isSaveButtonEnabled = !this.noRoleSelected;
  }

  getRolepermission(id: string) {
    this.http
      .getData(`FusionRoleClaims/getRoleClaimsbyroleId/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Fetched role claims:', data);
          this.permissionsReset(data);
        },
        error: (error: any) => {
          this.dataLoad = false;
          this.permissionsReset([]);
        },
        complete: () => {
          this.dataLoad = false;
        },
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
        const permission = this.permissions.find(
          (p: any) => p.fields === claim.claimType
        );
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

  onCheckboxChange(
    permission: {
      [key: string]: any;
      View: boolean;
      Create: boolean;
      Update: boolean;
      Delete: boolean;
    },
    action: string
  ) {
    if (action === 'View' && !permission.View) {
      permission.Update = false;
      permission.Create = false;
      permission.Delete = false;
    } else if (
      (action === 'Create' || action === 'Update' || action === 'Delete') &&
      permission[action]
    ) {
      permission.View = true;
    }
  }

  isCheckboxDisabled(field: string, action: string): boolean {
    const disabledOptions = [
      'Employee Basic Information',
      'Employee Current Address',
      'Employee Permanent Address',
      'Employee Contact Details',
      'Employee Emergency Contact Details',
      'Employee Onboarding Documents',
      'Basic Information',
      'Current Address',
      'Permanent Address',
      'Contact Details',
      'Emergency Contact Details',
      'Onboarding Documents',
      'Employee Team Members',
      'Team Members',
      'Request for Onboard Button',
      'Separation Request',
      'Employee Separation Request',
      'Employee Info Desk Details',
      'Employee Info Asset Details',
      'Employee Info Asset Details',
      'Employee Info Desk Details',
      'Employee Info Pre-Onboarding Details',
      'Employee Info Offboarding Details',
      'Employee Info Separation Request Details',
      'Employee Info No Due Clearance Details',
      'Employee Info Probation Details',
      'Change RM Button',
      'Employee Info Onboarding Request Details',
      'No Due Form',
      'Employee Info Separation Request',
      'Employee Info Change RM Button',
      'Employee Info Change TM Button',
    ];

    return (
      disabledOptions.includes(field) &&
      (action === 'delete' || action === 'create')
    );
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

  permissionsCreate() {
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    const payload = this.preparePayload(this.roleId);
    this.http.postdata('FusionRoleClaims/rolePermissions', payload).subscribe({
      next: (data) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Permissions updated successfully');
      },
      error: (err) => {
        console.error('Error posting permissions:', err);
        this.modalService.dismissAll();
        this.modal.openErrorModal('Failed to update permissions!');
      },
    });
  }

  preparePayload(roleId: string): any[] {
    const claims: any[] = [];

    for (const p of this.permissions) {
      if (p.View) {
        claims.push({
          claimType: `${p.fields}`,
          claimValue: `${p.fields}.view`,
          roleId: roleId,
        });
      }
      if (p.Create) {
        claims.push({
          claimType: `${p.fields}`,
          claimValue: `${p.fields}.create`,
          roleId: roleId,
        });
      }
      if (p.Update) {
        claims.push({
          claimType: `${p.fields}`,
          claimValue: `${p.fields}.update`,
          roleId: roleId,
        });
      }
      if (p.Delete) {
        claims.push({
          claimType: `${p.fields}`,
          claimValue: `${p.fields}.delete`,
          roleId: roleId,
        });
      }
    }
    return claims;
  }

  isDisabled(field: string, action: string): boolean {
    const viewOnlyFields = [
      'Leave Allocation Tab',
      'Flexible Leave Allocation Tab',
      'Load Entitlements Tab',
      'Attendance Eligibility Criteria Tab',
      'Comp Off Entitlement Tab',
      'WFH Entitlement Tab',
      'Permission Elgibility Tab',
      'Attendance Regularization Eligibility Tab',
      'Shifts Published Tab',
      'Policies Published Tab',
      'Holidays Published Tab',
      'Weekends Published Tab',
      'Expense Allowed Days',
      'DST Published Tab',
      'Leave Category Published Tab',
      'Active Forms',
      'Inactive Forms',
      'Draft Forms',
      'Desk Allocation - Inactive',
      'Desk Allocation - Create',
      'Team Tickets Tab',
    ];
    return (
      viewOnlyFields.includes(field) &&
      (action === 'Create' || action === 'Update' || action === 'Delete')
    );
  }

  isActionEnabled(field: string, action: string): boolean {
    const enabledTabs = [
      'Document Tab',
      'NoDue Clearance Tab',
      'Leave Allocation Tab',
      'Flexible Leave Allocation Tab',
      'Dynamic Forms Module',
      'Desk Allocation - All',
      'Manage Weekends Tab',
      'Manage DST Tab',
      'My Info Job Details',
      'My Info Previous Experience Details',
      'My Info Certification Details',
      'Employee Info Onboarding Details',
      'Employee Info Job Details',
      'Employee Info Previous Experience Details',
      'Employee Info Certification Details',
      'Employee Info Compensation Details',
      'Draft Tab',
    ];
    return (
      enabledTabs.includes(field) &&
      (action === 'Create' || action === 'Update' || action === 'Delete')
    );
  }

  isFieldDisabled(field: string, permission: string): boolean {
    if (field === 'Asset Management - Create') {
      return permission !== 'View'; // Only 'View' is enabled
    }

    if (
      ['Asset Management - All', 'Asset Management - Available'].includes(field)
    ) {
      return permission !== 'View'; // Disable only 'Create'
    }
    //  if (['Asset Management - All', 'Asset Management - Available'].includes(field)) {
    //     return permission === 'Update'; // Disable only 'Create'
    //   }
    if (
      [
        'Asset Management - Under Maintenance',
        'Asset Management - Inactive',
        'Asset Management - Allocated',
      ].includes(field)
    ) {
      return !['View'].includes(permission); // Enable only 'View' and 'Update'
    }

    return false; // Default: all enabled
  }

  updateModuleInfo() {
    const url = this.router.url;

    const routeToInfoMap: { [key: string]: string } = {
      '/settings/roles-permissions/permissions':
        MODULE_INFOS.SETTINGS_ROLES_PERMISSION_MODULE_INFO,
    };

    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  reset() {
    this.modalService.dismissAll();
    this.modalService.open(this.resetLoadingModal, { centered: true });
    this.isSaveButtonEnabled = false;

    setTimeout(() => {
      this.permissions = JSON.parse(JSON.stringify(permissionsData));
      this.roleToFilter = null;
      this.modalService.dismissAll();
       setTimeout(() =>{
        this.openSuccess();
       }, 2000)
    });
  }

  openSuccess(){
    this.modal.openSuccessModal('Permissions reset successfully');
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
