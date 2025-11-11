
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { environment } from '../../../../environments/environment';
import { RbacService } from '../../../services/rbac.service';
import { Client } from '../../../clients.model';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { ActiveclientsPipe } from "../../../Pipes/activeclients.pipe";
import { FormsModule } from '@angular/forms';
import { ClientSideTabsComponent } from "../../../shared/project-management-tabs/client-side-tabs/client-side-tabs.component";
@Component({
  selector: 'app-hold-clients',
  imports: [CommonModule, FormsModule, ProjectManagementModuleInfoComponent, NoDataFoundComponent,
    DataLoaderContentComponent, TranslateModule, ConfirmationIconComponent, ActiveclientsPipe, ClientSideTabsComponent],
  templateUrl: './hold-clients.component.html',
  styleUrl: './hold-clients.component.scss'
})
export class HoldClientsComponent {
  loading: boolean = true;
  clients: Client[] = [];
  searchValue: any;
  empinfo: any = {};
  selectedClient: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private modalService: NgbModal, public rbac: RbacService, private http: HttpService,
    public formValidation: FormValidationsService, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getClientsData();
  }

  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=hold`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.clients = Array.isArray(res?.data) ? res.data : [];
        this.clients = this.clients.map((client: any) => ({
          ...client,
          logoUrl: this.getImageUrl(client.logoPath)
        }));
      },
      error: (err) => {
        this.loading = false;
        this.clients = [];
        console.error('Error fetching clients:', err);
      }
    });
  }

  getImageUrl(imagePath: string): string | null {
    if (!imagePath) return null;
    // If it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    // If logoPath is from FusionDocuments
    if (imagePath.startsWith('ProjectManagement/Clients/logos/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    // Fallback
    return `${environment.viewUrl}${imagePath}`;
  }

  navigate() {
    this.router.navigate(['project-management/clients/inactive']);
  }

  navigateAddClient() {
    this.router.navigate(['project-management/clients/add']);
  }

  navigateView(clientId: number) {
    localStorage.setItem('clientProjectId', clientId.toString());
    this.router.navigate(
      ['project-management/clients/details'],
      { queryParams: { id: clientId } } // using query params
    );
  }

  openModalstatus(modal: any, client: any) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    this.selectedClient = { ...client }; // store client detail
  }


  confirmStatusChange(modal: any) {
    if (!this.selectedClient) return;
    const updatedClient = {
      ...this.selectedClient,
      status: 'Active',
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Client/${this.selectedClient.clientId}`, updatedClient).subscribe({
      next: (res) => {
        this.conformationPopup.openSuccessModal('Client marked as Active successfully');
        modal.close();
        this.getClientsData();
        this.http.setnewcountDetailsfornewclient();
      },
      error: (err) => {
        console.error('Error updating project status:', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }



  confirmStatusChangetoInactive(modal: any) {
    if (!this.selectedClient) return;
    const updatedClient = {
      ...this.selectedClient,
      status: 'Inactive',
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Client/${this.selectedClient.clientId}`, updatedClient).subscribe({
      next: (res) => {
        this.conformationPopup.openSuccessModal('Client marked as Inactive successfully');
        modal.close();
        this.getClientsData();
        this.http.setnewcountDetailsfornewclient();
      },
      error: (err) => {
        console.error('Error updating project status:', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }

}
