import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IRoles } from './permission.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { permissionsData } from './permissionsdata';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-permissions',
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
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

  ngOnInit(): void {
    this.getAllroles();
    if (this.roleToFilter === null) {
      this.permissions = JSON.parse(JSON.stringify(permissionsData));
    }
  }

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private modal: OpenModalService
  ) { }

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
    this.noRoleSelected = !this.permissions.some(per =>
      per.View || per.Create || per.Update || per.Delete
    );
    this.isSaveButtonEnabled = !(this.noRoleSelected);
  }

  getRolepermission(roleId: any) {
    this.http.getData(`FusionRoleClaims/${roleId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.permissionsReset(res);
      }, error: (error: any) => {
        console.error('Error fetching role permissions:', error);
        this.permissionsReset([]);
      }
    });
  }

  permissionsReset(data: any) {
    this.permissions.forEach((permission: any) => {
      permission.View = false;
      permission.Create = false;
      permission.Update = false;
      permission.Delete = false;
    });

    if (data?.length > 0) {
      data.forEach((role: any) => {
        role.sections?.forEach((section: any) => {
          section.permissions?.forEach((perm: any) => {
            const match = this.permissions.find((p: any) =>
              p.section === section.section && p.fields === perm.permission
            );
            if (match) {
              match.View = perm.view;
              match.Create = perm.create;
              match.Update = perm.update;
              match.Delete = perm.delete;
            }
          });
        });
      });
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
    const disabledOptions = ['User Management', 'Employee Management', 'Dashboard'];
    // Check if the field and action match the criteria to disable the checkbox
    return disabledOptions.includes(field) && (action === 'create' || action === 'update' || action === 'delete');
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

  preparePayload(roleTypeId: string): any[] {
    return this.permissions
      .filter(p => p.View || p.Update || p.Create || p.Delete)
      .map(p => ({
        roleTypeId: roleTypeId,
        section: p.section,
        permission: p.fields,
        view: p.View,
        update: p.Update,
        create: p.Create,
        delete: p.Delete
      }));
  }

  permissionsCreate() {
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    const payload = this.preparePayload(this.roleId);

    this.http.postdata('FusionRoleClaims', payload).subscribe({
      next: (data) => {
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Permissions updated successfully!');
      },
      error: (err) => {
        console.error('Error posting permissions:', err);
        this.modalService.dismissAll();
        this.modal.openErrorModal('Failed to update permissions!');
      },
      complete: () => {
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
