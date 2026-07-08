import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
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
import { ApplicablePoliciesTriggerComponent } from "../../../shared/policies/applicable-policies-trigger/applicable-policies-trigger.component";
import { APPLICABLE_POLICIES_KEYS } from "../../../shared/policies/policy-visibility.catalog";
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';



@Component({
  selector: 'app-active-clients',
  imports: [CommonModule, FormsModule, ProjectManagementModuleInfoComponent, NoDataFoundComponent, PaginatorModule,
    DataLoaderContentComponent, TranslateModule, ConfirmationIconComponent, ActiveclientsPipe, ClientSideTabsComponent, ApplicablePoliciesTriggerComponent, TableModule],
  templateUrl: './active-clients.component.html',
  styleUrl: './active-clients.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class ActiveClientsComponent implements OnInit, OnDestroy {
  applicablePolicies = APPLICABLE_POLICIES_KEYS.PROJECT_MANAGEMENT_CLIENTS;
  loading: boolean = true;
  clients: Client[] = [];
  searchValue: any;
  empinfo: any = {};
  selectedClient: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  subscription!: Subscription;
  currentSortField = '';
  currentSortOrder = 0;
  currentUIField = '';
  @ViewChild('activeClientsTable') activeClientsTable!: Table;
  // Pagination
  page = 1;
  pageSize = 25;
  rows = 25;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 25, value: 25 },
    { label: 50, value: 50 },
    { label: 75, value: 75 },
    { label: 100, value: 100 },
  ];
  constructor(private modalService: NgbModal, public rbac: RbacService, private http: HttpService,
    public formValidation: FormValidationsService, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getClientsData();
  }

  getClientsData(): void {
    let url = `Client/GetAll?status=Active&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    if (this.currentSortField && this.currentSortOrder !== 0) {
      url += `&sortBy=${this.currentSortField}&sortOrder=${this.currentSortOrder === 1 ? 'asc' : 'desc'}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.clients = Array.isArray(res?.data?.items) ? res.data?.items : [];
        this.collectionSize = res?.data?.totalCount || 0;
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

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getClientsData();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getClientsData();
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
    this.router.navigate(['project-management/clients/details'], { queryParams: { id: clientId } });
  }

  openModalstatus(modal: any, client: any) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    this.selectedClient = { ...client }; // store client detail
  }

  confirmStatusChange(modal: any) {
    if (!this.selectedClient) return;
    const updatedClient = {
      ...this.selectedClient,
      status: 'Inactive',
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.subscription = this.http.putData(`Client/${this.selectedClient.clientId}`, updatedClient).subscribe({
      next: (res) => {
        this.conformationPopup.openSuccessModal('Client marked as Inactive successfully');
        modal.close();
        this.http.setnewcountDetailsfornewclient();
        this.getClientsData();
      },
      error: (err) => {
        console.error('Error updating project status:', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }

  confirmStatusChangetohold(modal: any) {
    if (!this.selectedClient) return;
    const updatedClient = {
      ...this.selectedClient,
      status: 'hold',
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Client/${this.selectedClient.clientId}`, updatedClient).subscribe({
      next: (res) => {
        this.conformationPopup.openSuccessModal('Client marked as Hold successfully');
        modal.close();
        this.http.setnewcountDetailsfornewclient();
        this.getClientsData();
      },
      error: (err) => {
        console.error('Error updating project status:', err);
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';
    if (this.currentUIField === field &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))) {
      return;
    }
    if (this.currentUIField === field && this.currentSortOrder === -1) {
      this.currentSortField = '';
      this.currentUIField = '';
      this.currentSortOrder = 0;
      if (this.activeClientsTable) {
        this.activeClientsTable.sortField = '';
        this.activeClientsTable.sortOrder = 0;
      }
      this.page = 1;
      this.first = 0;
      this.getClientsData();
      return;
    }
    this.currentUIField = field;
    this.currentSortField = field;
    this.currentSortOrder = order;
    this.page = 1;
    this.first = 0;
    this.getClientsData();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
