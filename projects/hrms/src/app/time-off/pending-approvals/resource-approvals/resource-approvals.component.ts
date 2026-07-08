import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
@Component({
  selector: 'app-resource-approvals',
  imports: [CommonModule, FormsModule, TranslateModule, TableModule, DateformatPipe, DataLoaderContentComponent, 
    NoDataFoundComponent, ConfirmationIconComponent],
  templateUrl: './resource-approvals.component.html',
  styleUrl: './resource-approvals.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class ResourceApprovalsComponent implements OnInit, OnDestroy {
  dataLoad = false;
  spinnerLoader = false;
  multiSelect = false;
  searchValue: string | null = null;
  empinfo = {} as IJob;
  resourceList: any[] = [];
  originalData: any[] = [];
  selectedResource: any = null;
  selectedProducts: any[] = [];
  currentSortField = '';
  currentSortOrder = 0;
  destroy$ = new Subject<boolean>();
  @ViewChild('dt') table!: Table;

  constructor(private http: HttpService, private modalService: NgbModal, private sharedModalService: OpenModalService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getResourceApprovals();
  }

  getResourceApprovals(): void {
    this.dataLoad = true;
    this.http.getData(`ProjectPhases/resource-approval-data/${this.empinfo.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.resourceList = response.data ?? [];
        this.originalData = [...this.resourceList];
        this.dataLoad = false;
      },
      error: () => {
        this.dataLoad = false;
      },
    });
  }

  getFilteredList(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    if (!search) return this.resourceList;
    return this.resourceList.filter(
      (item) =>
        item.fusionEmpId?.toLowerCase().includes(search) ||
        item.employeeName?.toLowerCase().includes(search) ||
        item.projectName?.toLowerCase().includes(search) ||
        item.phaseMilestone?.toLowerCase().includes(search) ||
        item.role?.toLowerCase().includes(search)
    );
  }

  selectCheck(value: any): void {
    this.multiSelect = Array.isArray(value) && value.length > 0;
    this.selectedProducts = Array.isArray(value) ? [...value] : [];
  }

  onSearchChange(): void {
    this.multiSelect = false;
    this.selectedProducts = [];
    if (this.table) {
      this.table.selection = null;
    }
  }

  // ── Single row ──────────────────────────────────────────────
  openApproveModal(content: any, row: any): void {
    this.selectedResource = row;
    this.selectedProducts = [];
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openRejectModal(content: any, row: any): void {
    this.selectedResource = row;
    this.selectedProducts = [];
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // ── Bulk ────────────────────────────────────────────────────
  bulkApprove(content: any): void {
    this.selectedResource = null;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  bulkReject(content: any): void {
    this.selectedResource = null;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // ── Handlers ────────────────────────────────────────────────
  handleApprove(): void {
    this.spinnerLoader = true;
    const items = this.selectedProducts.length > 0 ? this.selectedProducts : [this.selectedResource];
    const requests = items.map((item: any) => ({
      resourceId: item.resourceId,
      phaseId: item.phaseId,
      approvedBy: parseInt(this.empinfo.employeeId),
      status: 'Active',
      comments: '',
    }));
    this.processRequests(requests, 'Resource allocated successfully');
  }

  handleReject(): void {
    this.spinnerLoader = true;
    const items = this.selectedProducts.length > 0 ? this.selectedProducts : [this.selectedResource];
    const requests = items.map((item: any) => ({
      resourceId: item.resourceId,
      phaseId: item.phaseId,
      approvedBy: parseInt(this.empinfo.employeeId),
      status: 'Rejected',
      comments: '',
    }));

    this.processRequests(requests, 'Resource Rejected successfully');
  }

  private processRequests(requests: any[], successMessage: string): void {
    this.http.putData(`ProjectResource/resource-pending-approvals`, requests).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.onComplete(false, successMessage),
      error: () => this.onComplete(true, successMessage),
    });
  }

  private onComplete(hasError: boolean, successMessage: string): void {
    this.spinnerLoader = false;
    this.modalService.dismissAll();
    if (hasError) {
      this.sharedModalService.openErrorModal('One or more requests failed');
    } else {
      this.sharedModalService.openSuccessModal(successMessage);
    }
    this.selectedProducts = [];
    this.selectedResource = null;
    this.multiSelect = false;
    this.getResourceApprovals();
  }

  // ── Sort ────────────────────────────────────────────────────
  customSort(event: any): void {
    const field = event.field;
    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.resourceList = [...this.originalData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) this.table.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      const val1 = a[field];
      const val2 = b[field];
      if (field.toLowerCase().includes('date')) {
        return event.order * ((val1 ? new Date(val1).getTime() : 0) - (val2 ? new Date(val2).getTime() : 0));
      }
      if (field === 'allocatedHours') {
        return event.order * ((parseFloat(val1) || 0) - (parseFloat(val2) || 0));
      }
      return event.order * String(val1 ?? '').localeCompare(String(val2 ?? ''), undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}