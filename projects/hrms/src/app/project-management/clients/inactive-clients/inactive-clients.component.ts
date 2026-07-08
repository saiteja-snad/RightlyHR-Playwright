import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { Client } from '../../../Interfaces/clients.model';
import { environment } from '../../../../environments/environment.dev';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { InactiveclientPipe } from "../../../Pipes/inactiveclient.pipe";
import { ClientSideTabsComponent } from "../../../shared/project-management-tabs/client-side-tabs/client-side-tabs.component";
import { PaginatorModule } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
@Component({
  selector: 'app-inactive-clients',
  imports: [CommonModule, ProjectManagementModuleInfoComponent, FormsModule, NoDataFoundComponent, PaginatorModule,
    DataLoaderContentComponent, ConfirmationIconComponent, TranslateModule, InactiveclientPipe, ClientSideTabsComponent, TableModule],
  templateUrl: './inactive-clients.component.html',
  styleUrl: './inactive-clients.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class InactiveClientsComponent implements OnInit {
  loading: boolean = true;
  clients: Client[] = [];
  empinfo: any = {};
  searchValue: any;
  selectedClient: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  currentSortField = '';
  currentSortOrder = 0;
  currentUIField = '';
  @ViewChild('inactiveClientsTable') inactiveClientsTable!: Table;
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
  constructor(private modalService: NgbModal, private route: ActivatedRoute, private http: HttpService,
    public formValidation: FormValidationsService, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getClientsData();
  }

  getClientsData(): void {
    let url = `Client/GetAll?status=Inactive&pageNumber=${this.page}&pageSize=${this.pageSize}`;
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

  navigateView(clientId: number) {
    localStorage.setItem('clientProjectId', clientId.toString());
    this.router.navigate(
      ['project-management/clients/details'],
      { queryParams: { id: clientId } } // using query params
    );
  }

  openModalstatus(modal: any, client: any) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    this.selectedClient = { ...client }; // store client details
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
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
      if (this.inactiveClientsTable) {
        this.inactiveClientsTable.sortField = '';
        this.inactiveClientsTable.sortOrder = 0;
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

  navigate() {
    this.router.navigate(['project-management/clients/active']);
  }
}