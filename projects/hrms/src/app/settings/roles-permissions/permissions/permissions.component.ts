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
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsHeaderComponent } from "../../../shared/settings-tabs/settings-header/settings-header.component";
@Component({
  selector: 'app-permissions',
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    DataLoaderContentComponent,
    TranslateModule,
    NgbPopoverModule,
    SettingsHeaderComponent,
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
  ) { }

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
      setTimeout(() => {
        this.openSuccess();
      }, 2000)
    });
  }

  openSuccess() {
    this.modal.openSuccessModal('Permissions reset successfully');
  }

  sidebarFields = [
    'Roles', 'Employee Fields Module', 'Settings Timeoff Module',
    'Assets Management Configuration Module', 'Dynamic Forms Module'
  ];
  employeeFields = [
    'Personal Tab',
    'Job Tab',
    'Document Tab',
    'Manage Shifts Tab',
    'Manage Policies Tab',
    'Manage Holidays Tab',
    'Manage Weekends Tab',
    'Manage DST Tab',
    'Expense Tab',
    'NoDue Clearance Tab'
  ];
  settingsEmployeeJobFields = [
    'Job Role',
    'Job Type',
    'Probation Status',
    'Background check Status',
    'Notice Period',
    'Frequency',
    'Paytype',
    'Overtime Eligibility',
    'Business Area',
    'Termination Reason',
    'Eligible For Rehire',
    'Department',
    'Team',
    'Grade Details',
    'Compensation Reason',
    'Location',
    'Sub Location',
    'Pre Onboard Documents',
    'Serving Period',
    'Consultancy',
    'Signature Authority',
    'Settings Job Probation Details'
  ];
  settingsEmployeePersonalFields = [
    'Salutation',
    'Status',
    'Gender',
    'Marital Status',
    'Degree',
    'Visa Type',
    'Identity Type',
    'Relationship',
    'Bank Names'
  ];
  settingsManageShiftsTabFields = [
    'Shifts Pending Tab',
    'Shifts Published Tab'
  ];
  settingsManagePoliciesTabFields = [
    'Policies Pending Tab',
    'Policies Published Tab'
  ];
  settingsManageHolidaysTab = [
    'Holidays Pending Tab',
    'Holidays Published Tab'
  ]
  settingsManageWeekendsTab = [
    'Weekends Pending Tab',
    'Weekends Published Tab'
  ]
  settingsManageDSTTab = [
    'DST Pending Tab',
    'DST Published Tab'
  ]
  settingsManageExpenseTab = [
    'Expenes Configuartion',
    'Expense Allowed Days'
  ]
  timeoffSettingsFields = [
    'Leave Category Tab',
    'Leave Allocation Tab',
    'Flexible Leave Allocation Tab',
    'Attendance Eligibility Criteria Tab',
    'Load Entitlements Tab'
  ];
  leaveCategoryTabsFields = [
    'Leave Category Pending Tab',
    'Leave Category Published Tab'
  ];
  attendanceEligibilityFields = [
    'Comp Off Entitlement Tab',
    'WFH Entitlement Tab',
    'Attendance Eligibility Permissions Tab',
    'Permission Elgibility Tab',
    'Attendance Regularization Tab',
    'Attendance Regularization Eligibility Tab',
    'Eligibility Global Permissions Tab'
  ];
  settingsAssetConfigurationFields = [
    'Vendor Details',
    'Asset Catagory',
    'Asset Sub Catagory'
  ];
  expensesTypeFields = [
    'Expenses Type',
    'Expense Types Tab'
  ];
  settingsDynamicFormsFields = [
    'Active Forms',
    'Inactive Forms',
    'Draft Forms',
    'Form Settings'
  ];
  sidebarTabsFields = [
    'Dashboard',
    'My Info',
    'Employees',
    'Events',
    'Time-Off',
    'Expenses',
    'Reports',
    'Policies',
    'Calendar',
    'IT Support',
    'Org Hierarchy',
    'PMS',
    'PMS Configurations',
    'Desk Allocation',
    'Asset Management',
    'Holidays',
    'Attendance',
    'Blood Bank'

  ];
  expensesModuleTabs = [
    'Draft Tab',
    'Approved Tab',
    'Pending Tab',
    'Processed Tab',
    'Rejected Tab'
  ];
  itSupportModule = [
    'Team Tickets Tab',
    'My Tickets Tab'
  ]
  TeamTicketsTabs = [
    'Rejected Tickets Tab',
    'Await On User Tickets Tab',
    'Solved Tickets Tab',
    'Rejected Tickets Tab',
    'All Tickets Tab',
    'Open Tickets Tab'
  ]
  HolidaysModule = [
    'Public Holidays Tab',
    'Optional Holidays Tab'
  ]
  OrgHierarchyModule = [
    'Organization Hierarchy - HR',
    'Organization Hierarchy - Compensation',
    'Organization Hierarchy - Download JPG',
    'Organization Hierarchy - TM',
    'Organization Hierarchy - Download PDF'
  ]

  deskAllocationModuleFields = [
    'Desk Allocation - Create',
    'Desk Allocation - All',
    'Desk Allocation - Available',
    'Desk Allocation - Allocated',
    'Desk Allocation - Under Maintenance',
    'Desk Allocation - Inactive',
    'Desk Allocation - Waiting For Approval'
  ];
  deskAllocationAllTabActions = [
    'Request for Allocation',
    'Inactive desk',
    'Schedule for Maintenance',
    'Reallocate desk',
    'Release Desk',
    'Mark as Active',
    'Mark as Available',
    'View Desk Details'
  ];
  deskAllocationAvailableTabActions = [
    'Available Request for Allocation',
    'Available Inactive desk',
    'Available Schedule for Maintenance',
    'Available View Desk Details'
  ];
  deskAllocationAllocatedTabActions = [
    'Allocated Reallocate desk',
    'Allocated Release Desk',
    'Allocated View Desk Details'
  ];
  deskAllocationUnderMaintenanceTabActions = [
    'Under Maintenance Mark as Available',
    'Under Maintenance View Desk Details',

  ];
  deskAllocationInactiveTabActions = [
    'Inactive Mark as Available',
    'Inactive View Desk Details'
  ];
  deskAllocationWaitingForApprovalTabActions = [
    'Waiting For Approval View Desk Detailssk',

  ];
  timeOffTabsFields = [
    'Time Off Module',
    'WFH/On Duty Module',
    'Remote Login Module',
    'Comp Off Module',
    'Permissions Module',
    'Regularization Module',
    'On Behalf Of Module',
    'On Behalf Of Approvals Module',
    'Global Permissions Module',
    'Pending Approvals Module'
  ];
  timeOffModuleSubTabs = [
    'Waiting For Approval (Time Off)',
    'Approved (Time Off)',
    'Processed (Time Off)',
    'Rejected (Time Off)',
    'Request Leave Button',
    'Cancelled (Time Off)',
  
  ];

  // ////////
  WFHModuleSubTabs = [
    'Waiting For Approval (WFH)',
    'Approved (WFH)',
    'Processed (WFH)',
    'Cancel (WFH)',
    'Rejected (WFH)',
    'Request WFH Button'
  ];
  compOffModuleSubTabs = [
    'Waiting For Approval (Comp Off)',
    'Approved (Comp Off)',
    'Processed (Comp Off)',
    'Rejected (Comp Off)',
    'Request Comp Off Button'
  ];
  permissionsModuleSubTabs = [
    'Waiting For Approval (Permissions)',
    'Approved (Permissions)',
    'Cancel (Permissions)',
    'Rejected (Permissions)',
    'Request Permission Button'
  ];
  regularizationModuleSubTabs = [
    'Waiting For Approval (Regularization)',
    'Approved (Regularization)',
    'Rejected (Regularization)',
    'Processed (Regularization)'
  ];
  onBehalfOfModuleSubTabs = [
    'Waiting For Approval (On Behalf Of)',
    'Approved (On Behalf Of)',
    'Request On Behalf Button',
    'Rejected (On Behalf Of)',
    'Processed (On Behalf Of)'
  ];
  attendanceModuleSubTabs = [
    'Request Regularization',
    'Request Leave',
    'Attendance Select Employee For Manager',
    'Attendance Select Employee For HR'
  ];
  globalPermissionModuleSubTabs = [
    'Global Permissions',
    'Request Global Permission Button'
  ];
  pendingApprovalsSubTabs = [
    'Time Off Tab',
    'WFH Tab',
    'Comp Off Tab',
    'Permissions Tab',
    'Regularization Tab',
    'Separation Request Tab',
    'Recall Request Tab',
    'Trainee Details Tab',
    'No Due Clearence Requests Tab',
    'Claims and Expenses Tab',
    'Desk Requests Tab',
    'Probation Details Tab'
  ];
  pendingApprovalTimeOffSubTabs = [
    'For You (Time Off)',
    'For Role (Time Off)'
  ];
  pendingApprovalWFHSubTabs = [
    'For You (WFH)',
    'For Role (WFH)'
  ];
  pendingApprovalCompOffSubTabs = [
    'For You (Comp Off)',
    'For Role (Comp Off)'
  ];
  pendingApprovalPermissionSubTabs = [
    'For You (Permission)',
    'For Role (Permission)'
  ];
  pendingApprovalRegularizationSubTabs = [
    'For You (Regularization)',
    'For Role (Regularization)'
  ];
  pendingApprovalSeparationRequestsSubTabs = [
    'For You (Separation Requests)',
    'For Role (Separation Requests)'
  ];
  pendingApprovalRecallRequestsSubTabs = [
    'For You (Recall Requests)',
    'For Role (Recall Requests)'
  ];
  pendingApprovalClaimsAndExpensesSubTabs = [
    'For You (Claims and Expenses)',
    'For Role (Claims and Expenses)'
  ];
  pendingApprovalDeskRequestsSubTabs = [
    'For You (Desk Requests)',
    'For Role (Desk Requests)'
  ];
  onBehalfOfApprovalsSubTabs = [
    'Time Off (On Behalf Of Approvals)',
    'WFH (On Behalf Of Approvals)',
    'Comp Off (On Behalf Of Approvals)',
    'Permission (On Behalf Of Approvals)'
  ];
  reportsTabsFields = [
    'Standard Reports',
    'Custom Reports',
    'Attendance reports',
    'Monthly Attendance Reports',
      'Org Leave Balance',
    'Team Leave Balance Summary',
    'Team Leave Balance'
  ];
  standardReportsTabsFields = [
    'Employee Master Data',
    'Employee Master Data - Generate',
    'Employee Master Data - Export',
    'Job Location Wise Data',
    'Job Location Wise Data - Generate',
    'Job Location Wise Data - Export',
    'Branch Location Wise Data',
    'Branch Location Wise Data - Generate',
    'Branch Location Wise Data - Export',
    'Family Members Data',
    'Family Members Data - Generate',
    'Family Members Data - Export'
  ];
  customReportsTabsFields = [
    'Custom Reports - Generate',
    'Custom Reports - Export'
  ];
  attendanceReportsTabsFields = [
    'Leave Report',
    'Leave Report - Generate',
    'Leave Report - Export',
    'Leave Summary Report',
    'Leave Summary Report - Generate',
    'Leave Summary Report - Export',
    'Comp Off Report',
    'Comp Off Report - Generate',
    'Comp Off Report - Export',
    'WFH Report',
    'WFH Report - Generate',
    'WFH Report - Export',
    'Absent Report',
    'Absent Report - Generate',
    'Absent Report - Export',
    'Inactive Empolyee Report',
    'Inactive Empolyee Report - Generate',
    'Inactive Empolyee Report - Export',
    'Yearly Summary Report',
    'Yearly Summary Report - Generate',
    'Yearly Summary Report - Export',
    'Permission Report',
    'Permission Report - Generate',
    'Permission Report - Export',
    'Regularization Report',
    'Regularization Report - Generate',
    'Regularization Report - Export'
  ];
  attendanceReportsEmployeeTeamTabsFields = [
    'Attendance All Employees List(Leaves)',
    'Attendance Team Manager List(Leaves)',
    'My Team Report(Leave)',
    'Attendance All Employees List(Compoff)',
    'Attendance Team Manager List(Compoff)',
    'My Team Report(Compoff)',
    'Attendance All Employees List(WFH)',
    'Attendance Team Manager List(WFH)',
    'My Team Report(WFH)',
    'Attendance All Employees List(Permission)',
    'Attendance Team Manager List(Permission)',
    'My Team Report(Permission)',
    'Attendance All Employees List(Regularization)',
    'Attendance Team Manager List(Regularization)',
    'My Team Report(Regularization)'
  ];
  assetManagementTabsFields = [
    'Asset Management - Create',
    'Asset Management - All',
    'Asset Management - Available',
    'Asset Management - Allocated',
    'Asset Management - Under Maintenance',
    'Asset Management - Inactive'
  ];

  // allAssetActionsFields = [

  assetManagementAllTabActions = [
    'All Allocate Asset',
    'All Inactive Asset',
    'All Mark as Maintenance',
    'All Transfer Asset',
    'All Reallocate Asset',
    'All Release Asset',
    'All Mark as Available Asset',
    'All Mark as Active Asset',
    'All View Asset Details',
    'All Update Asset Details'
  ];

  assetManagementAvailableTabActions = [
    'Available Allocate Asset',
    'Available Inactive Asset',
    'Available Mark as Maintenance Asset',
    'Available Transfer Asset',
    'Available View Asset Details',
    'Available Update Asset Details'
  ];

  assetManagementAllocatedTabActions = [
    'Allocated Reallocate Asset',
    'Allocated Release Asset',
    'Allocated View Asset Details',
    'Allocated Update Asset Details'
  ];
  assetManagementUnderMaintenanceTabActions = [
    'Under Maintenance Mark as Available Asset',
    'Under Maintenance View Asset Details',
    'Under Maintenance Update'
  ];

  assetManagementInactiveTabActions = [
    'Inactive Mark as Active Asset',
    'Inactive View Asset Details',
    'Inactive Update Asset Details'
  ];
  myInfoSubTabsFields = [
    'My Info Personal Tab',
    'My Info Job Tab',
    'My Info Documents Tab',
    'My Info Team Members Tab',
    'My Info Onboard Request Tab'
  ];
  myInfoPersonalSubTabsFields = [
    'My Info Basic Information',
    'My Info Address Details',
    'My Info Contact Details',
    'My Info Emergency Contact Details',
    'My Info Education Details',
    'My Info Identity Details',
    'My Info Family Details',
    'My Info Bank Details',
    'My Info Visa Details'
  ];
  myInfoJobModuleFields = [
    'My Info Pre-Onboarding Details',
    'My Info Onboarding Details',
    'My Info Offboarding Details',
    'My Info Job Details',
    'My Info Separation Request Details',
    'My Info No Due Clearance Details',
    'My Info Probation Details',
    'My Info Previous Experience Details',
    'My Info Certification Details',
    'My Info Compensation Details',
    'My Info Desk Details',
    'My Info Asset Details',
    'My Info Separation Request Button'
  ];
  myInfoSeparationRequestFields = [
    'Raise No Due',
    'Recall',
    'Early relieving'
  ];
  myInfoNoDueClearanceFields = [
    'Submission Of No Due Clearance',
    'Re-request for no due'
  ];
  employeeInfoSubTabsFields = [
    'Employee Info Personal Tab',
    'Employee Info Job Tab',
    'Employee Info Documents Tab',
    'Employee Info Team Members Tab'
  ];
  employeeInfoJobModuleFields = [
    'Employee Info Pre-Onboarding Details',
    'Employee Info Onboarding Details',
    'Employee Info Offboarding Details',
    'Employee Info Job Details',
    'Employee Info Separation Request Details',
    'Employee Info No Due Clearance Details',
    'Employee Info Probation Details',
    'Employee Info Previous Experience Details',
    'Employee Info Certification Details',
    'Employee Info Onboarding Request Details',
    'Employee Info Compensation Details',
    'Employee Info Desk Details',
    'Employee Info Asset Details',
    'Employee Info Separation Request',
    'No Due Form'
  ];

  employeeInfoJobModuleUpdateDisabledFields = [
    'Employee Info Asset Details',
    'Employee Info Desk Details',
    'Employee Info Pre-Onboarding Details',
    'Employee Info Offboarding Details',
    'Employee Info Separation Request Details',
    'Employee Info No Due Clearance Details',
    'Employee Info Probation Details',
    'Employee Info Onboarding Request Details',
    'No Due Form',
    'Employee Info Separation Request'
  ];

  employeeInfoJobModuleCreateDeleteDisabledFields = [
    'Employee Info Onboarding Details',
    'Employee Info Asset Details',
    'Employee Info Desk Details',
    'Employee Info Pre-Onboarding Details',
    'Employee Info Offboarding Details',
    'Employee Info Separation Request Details',
    'No Due Form',
    'Employee Info Separation Request',
    'Employee Info No Due Clearance Details',
    'Employee Info Probation Details',
    'Employee Info Onboarding Request Details'
  ];
  employeeSeparationRequestFields = [
    'Employee Raise No Due',
    'Employee Recall',
    'Employee Early relieving'
  ];
  employeeNoDueClearanceFields = [
    'Employee Submission Of No Due Clearance',
    'Employee Re-request for no due'
  ];

  employeeProbationRequestFields = [
    'Employee Request for Probation Confirmation',
    'Employee Re-Request for Probation Confirmation'
  ];

  dashboardModuleCardItemsFields = [
    'Dashboard Prospective Employees Card',
    'Dashboard Active Employees Card',
    'Dashboard Inactive Employees Card',
    'Dashboard Prospective Trainee Card',
    'Dashboard Active Trainees Card',
    'Dashboard Inactive Trainees Card',
    'Dashboard Current Openings Card',
    'Dashboard Probation Employees Card',
    'Add Prospective Employee',
    'Add Prospective Trainee',
    'Dashboard Active Invite New User',
    'Invite New User',
    'Dashboard Trainee Active Invite New User'
  ];
  activeLettersFields = [
    'Address Proof Letter',
    'Bank Loan Letter',
    'Apprisal Letter',
    'Salary Revision Letter',
    'Promotion Letter'
  ];
  probationGenerateDocumentsFields = [
    'Probation Confirmation Letter',
    'Probation Extension Letter'
  ];
  dashboardDocumentHistoryActionsFields = [
    'Offer Letter Download',
    'Offer Letter Release Offer',
    'Offer Letter Approve',
    'Offer Letter Reject',
    'Appointment Letter Download',
    'Trainee Offer Letter Download',
    'Trainee Offer Letter Release Offer',
    'Trainee Offer Letter Approve',
    'Trainee Offer Letter Reject',
    'Trainee Appointment Letter Download'
  ];
  documentsHistoryFields = [
    'Documents History Offer Letter',
    'Documents History Appointment Letter',
    'Documents History Trainee Offer Letter',
    'Documents History Trainee Appointment Letter'
  ];
  dashboardGenerateDocumentsFields = [
    'Dashboard Generate Documents Offer Letter',
    'Dashboard Generate Documents Appointment Letter',
    'Dashboard Generate Documents Trainee Offer Letter',
    'Dashboard Generate Documents Trainee Appointment Letter',
    'Dashboard Generate Documents Welcome Letter'
  ];
  employeeInfoTeamManagerFields = [
    'Employee Info Reporting Manager Tab',
    'Employee Info Change RM Button',
    'Employee Info Team Managers Tab',
    'Employee Info Change TM Button'
  ];
  pmsModuleFields = [
    'Review Cycle List',
    'Review Cycle Employee List',
    'My Performance Review',
    'My Team Performance Review'
  ];
  reviewCycleListActionsFields = [
    'Create Review Cycle',
    'Hold',
    'Resume',
    'Update',
    'View',
    'Initiate'
  ];
  reviewCycleEmployeeListActionsFields = [
    'Assign Review Template',
    'Employee List Add Employee',
    'Download Appraisal Report',
    'Generate Appraisal Letters',
    'Send Appraisal Letters',
    'Generate Promotion Letters',
    'Send Promotion Letters',
    'Employee List Hold',
    'Assign Review Template(Employee)',
    'Assign Review Template(Review on Hold)',
    'Update Review Template',
    'Employee List Resume',
    'Promotion Letter Download',
    'Appraisal Letter Download',
    'Generate Appraisal Letter(Status - Completed)',
    'Send Appraisal Letter(Appraisal Letter Generated)',
    'Re-Generate Appraisal Letter',
    'Re-Send Appraisal Letter',
    'Re-Generate Appraisal Letter(Promotion Letter Generated)',
    'Re-Send Appraisal Letter(Promotion Letter Sent)',
    'Generate Promotion Letter(Status - Completed)',
    'Re-Generate Promotion Letter',
    'Send Promotion Letter',
    'Re-Send Promotion Letter',
    'Re-Generate Promotion Letter(Appraisal Letter Generated)',
    'Re-Send Promotion Letter(Appraisal Letter Sent)'
  ];
  myPerformanceReviewTabsFields = [
    'Pending Reviews',
    'Completed Reviews'
  ];
  completedReviewsActionsFields = [
    'My Performance Assessment View',
    'My Performance Promotion Letter Download',
    'My Performance Appraisal Letter Download'
  ];
  teamPerformanceReviewTabsFields = [
    'Team Pending Reviews',
    'Team Completed Reviews'
  ];
  teamCompletedReviewsFields = [
    'Team Assessment View',
    'Team Promotion Letter Download',
    'Team Appraisal Letter Download'
  ];
  pmsConfigurationFields = [
    'Increment Percentage',
    'Assessor Configuration'
  ];
  incrementActionsFields = [
    'Increment Create',
    'Increment Update(Status - Created)',
    'Increment Delete(Status - Created)',
    'Increment View(Status - Initialted)',
    'Increment Update(Status - Review On Hold)'
  ];
  assessorFields = [
    'Assessor Create',
    'Assessor Update(Status - Created)',
    'Assessor Delete(Status - Created)',
    'Assessor Update(Status - Initialted)',
    'Assessor Update(Status - Review On Hold)'
  ];
  employeeInfoPersonalSubTabsFields = [
  'Employee Info Basic Information',
  'Employee Info Address Details',
  'Employee Info Contact Details',
  'Employee Info Emergency Contact Details',
  'Employee Info Education Details',
  'Employee Info Identity Details',
  'Employee Info Family Details',
  'Employee Info Bank Details',
  'Employee Info Visa Details',
  'Employee Info Documents Verification'
];

  // Generic toggle function for checkboxes
  toggleSelectAll(
    fields: string[],
    checked: any,
    disableFn: (per: any, action: 'View' | 'Update' | 'Create' | 'Delete') => boolean
  ) {
    if (!Array.isArray(this.permissions)) return;
    this.permissions
      .filter(per => fields.includes(per.fields))
      .forEach(per => {
        (['View', 'Update', 'Create', 'Delete'] as const).forEach(action => {
          if (!disableFn(per, action)) {
            per[action] = checked;
            this.onCheckboxChange(per, action);
          }
        });
      });
  }


  // Generic "all selected" function
  isAllSelected(fields: string[]): boolean {
    if (!Array.isArray(this.permissions)) return false;
    return this.permissions
      .filter(per => fields.includes(per.fields))
      .every(per => per.View);
  }

  // Generic "some selected" function
  isSomeSelected(fields: string[]): boolean {
    if (!Array.isArray(this.permissions)) return false;
    const filtered = this.permissions.filter(per => fields.includes(per.fields));
    return filtered.some(per => per.View) && !this.isAllSelected(fields);
  }


  isSidebarCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return true;
    }
    if (action === 'Create') {
      return !this.isActionEnabled(per.fields, 'Create') || !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }



  isemployeeCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      // Only enabled for 'NoDue Clearance Tab'
      return !this.roleToFilter?.id || !['NoDue Clearance Tab'].includes(per.fields);
    }
    if (action === 'Create' || action === 'Delete') {

      return !this.roleToFilter?.id || !['Document Tab', 'NoDue Clearance Tab'].includes(per.fields);
    }
    return false;
  }
  isSettingsEmployeeJobCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Create' || action === 'Delete') {
      return !this.roleToFilter?.id;
    }
    return false;
  }


  isSettingsEmployeePersonalCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Create' || action === 'Delete') {
      return !this.roleToFilter?.id; // Only enabled if role is selected
    }
    return false;
  }


  isSettingsManageShiftsCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      // Disabled if no role or if your isDisabled helper says so
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }


  isSettingsManagePoliciesCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }


  isSettingsManageHolidaysCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }


  isSettingsManageWeekendsCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }




  isSettingsManageExpensesCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Create') {

      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }
    if (action === 'Delete') {

      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Delete');
    }
    return false;
  }


  isSettingsManageDSTCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }


  istimeoffSettingsCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return true;
    }
    if (action === 'Create') {

      return !this.isActionEnabled(per.fields, 'Update') || !this.roleToFilter?.id;
    }
    if (action === 'Delete') {

      return true;
    }
    return false;
  }



  isleaveCategoryCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    if (action === 'Create') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }


  isattendanceEligibilityCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Create') {
      return this.isDisabled(per.fields, 'Create') || !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      return this.isDisabled(per.fields, 'Delete') || !this.roleToFilter?.id;
    }
    return false;
  }



  isSettingsAssetConfigurationCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      // View is only enabled if a role is selected
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Create') {
      // Create is only enabled if a role is selected
      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {
      // Delete is only enabled if a role is selected
      return !this.roleToFilter?.id;
    }
    return false;
  }



  isDynamicFormsCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Create') {

      return this.isDisabled(per.fields, 'Create') || !this.roleToFilter?.id;
    }
    if (action === 'Delete') {

      return !this.roleToFilter?.id || !['Active Forms', 'Draft Forms', 'Form Settings'].includes(per.fields);
    }
    return false;
  }
  isAllSelectedDynamicForms(): boolean {
    if (!Array.isArray(this.permissions)) return false;
    return this.permissions
      .filter(per => this.settingsDynamicFormsFields.includes(per.fields))
      .every(per => per.View);
  }
  isSomeSelectedDynamicForms(): boolean {
    if (!Array.isArray(this.permissions)) return false;
    const filtered = this.permissions.filter(per => this.settingsDynamicFormsFields.includes(per.fields));
    return filtered.some(per => per.View) && !this.isAllSelectedDynamicForms();
  }


  isExpensesTypeCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Create') {

      return !this.roleToFilter?.id;
    }
    if (action === 'Delete') {

      return !this.roleToFilter?.id;
    }
    return false;
  }

  issideCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      // View is only enabled if a role is selected
      return !this.roleToFilter?.id;
    }
    // Update, Create, Delete are always disabled
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true;
    }
    return false;
  }

  isexpensesdActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    // Example logic, adjust as needed for your requirements
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.isActionEnabled(per.fields, 'Update') || !this.roleToFilter?.id;
    }
    if (action === 'Create' || action === 'Delete') {
      return true; // Always disabled in your current example
    }
    return false;
  }

  isItSupportActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Delete') {
      return true; // Always disabled
    }
    if (action === 'Create') {
      // Only enabled if role is selected and your custom logic (if any)
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Create');
    }
    return false;
  }
  isItSupportteamActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    if (action === 'Update') {
      // Only enabled if role is selected and your custom logic (if any)
      return !this.roleToFilter?.id || this.isDisabled(per.fields, 'Update');
    }
    return false;
  }

  isHolidaysActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }

    return false;
  }

  isOrgHierarchyActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }
  isdekActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }

  isdeskallActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }

  isdeskavilableActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }

  isdeskallocationActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }
  isdeskundermaintanceDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }

  isdeskinactiveDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }

  isonlyviewfunction(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true; // Always disabled
    }
    return false;
  }


  isonlycreatfunction(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'Create') {
      return true;
    }
    if (action === 'Update' || action === 'View' || action === 'Delete') {
      return !this.roleToFilter?.id;
    }
    return false;
    return false;
  }

  isEmployeeInfoJobActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      // Only enabled for fields NOT in the disabled list
      return !this.roleToFilter?.id || [
        'Employee Info Asset Details', 'Employee Info Desk Details',
        'Employee Info Pre-Onboarding Details', 'Employee Info Offboarding Details',
        'Employee Info Separation Request Details', 'Employee Info No Due Clearance Details',
        'Employee Info Probation Details', 'Employee Info Onboarding Request Details',
        'No Due Form', 'Employee Info Separation Request'
      ].includes(per.fields);
    }
    if (action === 'Create' ) {
      // Only enabled for fields NOT in the disabled list
      return !this.roleToFilter?.id || [
        'Employee Info Onboarding Details', 'Employee Info Asset Details', 'Employee Info Desk Details',
        'Employee Info Pre-Onboarding Details', 'Employee Info Offboarding Details',
        'Employee Info Separation Request Details', 'No Due Form', 'Employee Info Separation Request',
        'Employee Info No Due Clearance Details', 'Employee Info Probation Details',
        'Employee Info Onboarding Request Details'
      ].includes(per.fields);
    }
     if (action === 'Delete') {
      // Only enabled for fields NOT in the disabled list
      return !this.roleToFilter?.id || [
        'Employee Info Onboarding Details', 'Employee Info Asset Details', 'Employee Info Desk Details',
        'Employee Info Pre-Onboarding Details', 'Employee Info Offboarding Details',
        'Employee Info Separation Request Details', 'No Due Form', 'Employee Info Separation Request',
        'Employee Info No Due Clearance Details', 'Employee Info Probation Details',
        'Employee Info Onboarding Request Details','Employee Info Job Details'
      ].includes(per.fields);
    }
    return false;
  }

  isEmployeeInfoPersonalActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
  if (action === 'View' || action === 'Update') {
    return !this.roleToFilter?.id;
  }
  if (action === 'Create') {
    return !this.roleToFilter?.id || ![
      'Employee Info Education Details',
      'Employee Info Identity Details',
      'Employee Info Family Details',
      'Employee Info Bank Details',
      'Employee Info Visa Details'
    ].includes(per.fields);
  }
  if (action === 'Delete') {
    return !this.roleToFilter?.id || ![
      'Employee Info Education Details',
      'Employee Info Identity Details',
      'Employee Info Family Details',
      'Employee Info Bank Details',
      'Employee Info Visa Details',
      'Employee Info Documents Verification'
    ].includes(per.fields);
  }
  return false;
}

isMyInfoPersonalActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
  if (action === 'View' || action === 'Update') {
    return !this.roleToFilter?.id;
  }
  if (action === 'Create') {
    return !this.roleToFilter?.id || ![
      'My Info Education Details',
      'My Info Identity Details',
      'My Info Family Details',
      'My Info Bank Details',
      'My Info Visa Details'
    ].includes(per.fields);
  }
  if (action === 'Delete') {
    return !this.roleToFilter?.id || ![
      'My Info Education Details',
      'My Info Identity Details',
      'My Info Family Details',
      'My Info Bank Details',
      'My Info Visa Details'
    ].includes(per.fields);
  }
  return false;
}
isMyInfoJobActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
  if (action === 'View') {
    return !this.roleToFilter?.id;
  }
  if (action === 'Update') {
    // Only enable Update for Previous Experience and Certification Details
    return !this.roleToFilter?.id || ![
      'My Info Previous Experience Details',
      'My Info Certification Details'
    ].includes(per.fields);
  }
  if (action === 'Create' || action === 'Delete') {
    // Only enable Create/Delete for Previous Experience and Certification Details
    return !this.roleToFilter?.id || ![
      'My Info Previous Experience Details',
      'My Info Certification Details'
    ].includes(per.fields);
  }
  return false;
}

isemployeeinfoteamActionDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
  if (action === 'View') {
    return !this.roleToFilter?.id;
  }
  if (action === 'Update') {
    // Only enable Update for Previous Experience and Certification Details
    return !this.roleToFilter?.id || ![
      'Employee Info Change TM Button' ,'Employee Info Change RM Button'
    ].includes(per.fields);
  }
  if (action === 'Create' || action === 'Delete') {
  return true
  }
  return false;
}
  isemployeeInfoCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      return !this.roleToFilter?.id;
    }
    if (action === 'Update') {
      return !this.isActionEnabled(per.fields, 'Update') || !this.roleToFilter?.id;

    }
    if (action === 'Create') {
      return true;
    }
    if (action === 'Delete') {
      return true;
    }
    return false;
  }
  isPmsConfigurationCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      // Enable 'View' only if a role is selected
      return !this.roleToFilter?.id;
    }
    // 'Update', 'Create', 'Delete' are always disabled for PMS Configuration actions
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true;
    }
    return false;
  }

  isAssetCheckboxDisabled(per: any, action: 'View' | 'Update' | 'Create' | 'Delete'): boolean {
    if (action === 'View') {
      // Enable 'View' only if a role is selected
      return !this.roleToFilter?.id;
    }
    // 'Update', 'Create', 'Delete' are always disabled for asset fields
    if (action === 'Update' || action === 'Create' || action === 'Delete') {
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
