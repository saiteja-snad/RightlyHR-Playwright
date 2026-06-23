import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
// kra-configuration.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { AddKraComponent } from './add-kra/add-kra.component';
import { UpdateKraComponent } from './update-kra/update-kra.component';
import { KraCategory } from '../kra-configuration/add-kra/kra.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { SettingsHeaderComponent } from '../../shared/settings-tabs/settings-header/settings-header.component';
import { effect } from '@angular/core';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-kra-configuration',
  templateUrl: './kra-configuration.component.html',
  styleUrl: './kra-configuration.component.scss',
  imports: [
    // Keep only what you use
    CommonModule,
    FormsModule,
    RouterModule,
    PaginatorModule,
    NgbPopoverModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    SettingsHeaderComponent,
    InfoIconComponent,
    TranslateModule,
  ],
})
export class KraConfigurationComponent implements OnInit, OnDestroy {
  dataload = false;
  subscription!: Subscription;
  deleteId: number | null = null;

  searchText = '';
   totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];

  kraCategories: KraCategory[] = [];

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private popup: OpenModalService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.loadKraCategories();

    effect(() => {
      const status = this.http.tirggerCountSignal();

      if (status.global) {
        this.loadKraCategories();

        // reset back to false
        this.http.tirggerCountSignal.update((s) => ({
          ...s,
          global: false,
        }));
      }
    });
  }

  loadKraCategories(): void {
    const params: any = {
      ...(this.searchText && { search: this.searchText }),
    };


    this.dataload = true;
    this.subscription = this.http.getDataIncludeParams('Kra/getallconfiguration', params).subscribe({
      next: (res: any) => {
        this.kraCategories = res.data || [];
        this.collectionSize = res.data?.length || 0;
      },
      error: () => (this.dataload = false),
      complete: () => (this.dataload = false),
    });
  }

  onSearchTextChange(): void {
    this.page = 1;
    this.first = 0;
    this.loadKraCategories();
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.loadKraCategories();
  }

  onPageSizeChange(size: number): void {
    this.rows = size;
    this.page = 1;
    this.first = 0;
    this.loadKraCategories();
  }

  openAdd(): void {
    const modalRef = this.modalService.open(AddKraComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.result.then(
      () => this.loadKraCategories(),
      () => {}
    );
  }

  editDetails(data: KraCategory): void {
    const modalRef = this.modalService.open(UpdateKraComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    modalRef.componentInstance.updateData = data;
    modalRef.result.then(
      () => this.loadKraCategories(),
      () => {}
    );
  }

  openDelete(template: any, id: number | undefined): void {
    if (!id) {
      this.popup.openErrorModal('Invalid category selected');
      return;
    }
    this.deleteId = id;
    this.modalService.open(template, { centered: true });
  }

  deleteCategory(): void {
    if (!this.deleteId) return;

    const categoryToDelete = this.kraCategories.find(
      (x: any) => x.categoryId === this.deleteId
    );

    if (!categoryToDelete) {
      this.popup.openErrorModal('Category not found');
      return;
    }

    const payload = {
      categoryId: categoryToDelete.categoryId,
      categoryName: categoryToDelete.categoryName,
      categoryCode: categoryToDelete.categoryCode,
      description: categoryToDelete.description || '',
      status: 'void',
      effectiveFrom: categoryToDelete.effectiveFrom || new Date().toISOString(),
      // createdBy: categoryToDelete.createdBy || this.authService.getToken().employeeId,
      createdOn: categoryToDelete.createdOn || new Date().toISOString(),
      // updatedBy: this.authService.getToken().employeeId,
      updatedOn: new Date().toISOString(),
    };

    this.http.postdata(`Kra/updateconfiguration`, payload).subscribe({
      next: () => {
        this.popup.openSuccessModal('KRA Category deleted successfully');
        this.loadKraCategories();
      },
      error: (err: any) => {
        this.popup.openErrorModal(
          err.error?.message || 'Failed to delete KRA category'
        );
      },
    });
  }

  getStatusClass(status?: string) {
    switch (status) {
      case 'Created':
        return 'status-created';
      case 'Active':
        return 'status-active';
      case 'On Hold':
        return 'status-onhold';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
