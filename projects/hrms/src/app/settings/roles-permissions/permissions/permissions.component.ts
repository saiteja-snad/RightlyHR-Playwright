import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { IRoles } from './permission.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { permissionsData } from './permissionsdata';

@Component({
  selector: 'app-permissions',
  imports: [CommonModule, SelectModule, FormsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent implements OnInit, OnDestroy {
  roleId!: any;
  noRoleSelected = true;
  isSaveButtonEnabled = false;
  roles: IRoles[] = [];
  permissions!: any[];
  roleToFilter: any = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('stagingLoadingModal') stagingLoadingModal: any;

  ngOnInit(): void {
    this.getAllrole();
    if (this.roleToFilter === null) {
      this.permissions = JSON.parse(JSON.stringify(permissionsData));
    }
  }

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
  ) { }

  getAllrole(): void {
    this.http.getData('FusionRole').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data);
        this.roles = data as IRoles[]
        console.log(this.roles)
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  onRoleSelect(event: any) {
    const selectedRoleId = event?.value?.id;
    console.log(selectedRoleId);
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
    // this.updateSaveButtonState();
  }

  
  getRolepermission(Value: any) {
    this.http.getData(Value).subscribe((res) => {
      this.permissionsReset(res);
    });
  }

  permissionsReset(data: any) {
    // Reset the tick marks in the checkboxes
    this.permissions.forEach((permission: any) => {
      permission.View = false;
      permission.Create = false;
      permission.Update = false;
      permission.Delete = false;
    });
    // Set the tick marks based on the received claim values
    if (data.data.claims?.length > 0) {
      data.data.claims.forEach((claim: any) => {
        const permission = this.permissions.find((p: any) => p.fields?.toLowerCase() === claim.claimType);
        if (permission) {
          if (claim.claimValue.includes('.view')) {
            permission.View = true;
          }
          if (claim.claimValue.includes('.create')) {
            permission.Create = true;
          }
          if (claim.claimValue.includes('.update')) {
            permission.Update = true;
          }
          if (claim.claimValue.includes('.delete')) {
            permission.Delete = true;
          }
        }
      });
    } else {
      this.isSaveButtonEnabled = false
    }
  }


  onCheckboxChange(permission: { [key: string]: any; View: boolean; Create: boolean; Update: boolean; Delete: boolean; }, action: string) {
    console.log(permission, action)
    if (action === 'View' && !permission.View) {
      permission.Update = false;
      permission.Create = false;
      permission.Delete = false;
    } else if ((action === 'Create' || action === 'Update' || action === 'Delete') && permission[action]) {
      permission.View = true;
    }
  }

  permissionsCreate() {
    this.modalService.open(this.stagingLoadingModal, { centered: true });
    // const payload: IPermissions = { claims: [] };
    // this.permissions.forEach((permission: any) => {
    //   if (permission.View) {
    //     payload.claims.push({ claimType: permission?.fields?.toLowerCase(), claimValue: `${permission?.fields?.toLowerCase()}.view` });
    //   }
    //   if (permission.Create) {
    //     payload.claims.push({ claimType: permission?.fields?.toLowerCase(), claimValue: `${permission?.fields?.toLowerCase()}.create` });
    //   }
    //   if (permission.Update) {
    //     payload.claims.push({ claimType: permission?.fields?.toLowerCase(), claimValue: `${permission?.fields?.toLowerCase()}.update` });
    //   }
    //   if (permission.Delete) {
    //     payload.claims.push({ claimType: permission?.fields?.toLowerCase(), claimValue: `${permission?.fields?.toLowerCase()}.delete` });
    //   }
    // });
    // this.http.createPermission(this.roleId, payload).subscribe({
    //   next: (data) => {
    //     this.modalService.dismissAll();
    //     this.sharedService.openSuccessOffCanvas('Permissions Updated Successfully!');
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   },
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
