import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Select, SelectModule } from 'primeng/select';

import { HttpService } from '../../../services/http.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { RbacService } from '../../../services/rbac.service';
import { PendingApprovalsComponent } from '../pending-approvals.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-kra-kpi-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    TableModule,
    PaginatorModule,
    Select,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    SelectModule,
    Select,
  ],
  templateUrl: './kra-kpi-approvals.component.html',
  styleUrl: './kra-kpi-approvals.component.scss',
})
export class KraKpiApprovalsComponent implements OnInit {
  // ===== DATA =====
  teamKpiData: any[] = [];
  loading = true;

  // ===== EMPLOYEE DROPDOWN =====
  activeEmplist: any[] = [];
  myTeamEmployees: any[] = [];
  selectedEmployeeId: number | null = null;

  empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  @ViewChild('kraKpiHeader', { static: true })
  kraKpiHeader!: TemplateRef<any>;

  // ===== UI =====
  activeAccordionIndex: number | null = null;
  searchText = '';

  page = 1;
  rows = 10;
  first = 0;
  collectionSize = 0;

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  // ===== ACTION MODAL RELATED =====
  actionForm!: FormGroup;
  isSubmitting = false;
  selectedRow: any = null;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  ratingOptions = [
    { label: '1 - Poor', value: '1' },
    { label: '2 - Fair', value: '2' },
    { label: '3 - Good', value: '3' },
    { label: '4 - Very Good', value: '4' },
    { label: '5 - Excellent', value: '5' },
  ];

  private modalRef!: NgbModalRef;

  currentMinRating!: number;
currentMaxRating!: number;

  @ViewChild('approveModal') approveModal!: TemplateRef<any>;
  @ViewChild('rejectModal') rejectModal!: TemplateRef<any>;

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private parent: PendingApprovalsComponent,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService
  ) {

  }

  ngOnInit(): void {
    this.parent.setHeaderTemplate(this.kraKpiHeader);
    if (this.rbac.allowedToAccess('All Employees (Expenses).view')) {
      this.loadAllActiveEmployees();
    }

    if (this.rbac.allowedToAccess('My Team (Expenses).view')) {
      this.loadMyTeamEmployees();
    }

    this.loadKraKpiData();
  }

  // ===== FORM INITIALIZATION =====
private initActionForm(min: number, max: number): void {
  this.currentMinRating = min;
  this.currentMaxRating = max;
  this.actionForm = this.fb.group({
    rating: [
      '',
      [
        Validators.required,
        Validators.min(min),
        Validators.max(max),
      ],
    ],
    comments: [''],
  });
}


  // ===== API CALL =====
  loadKraKpiData(employeeId?: number | null): void {
    this.loading = true;

    const params: any = {
      pageNumber: this.page,
      pageSize: this.rows,
      ...(this.searchText && { search: this.searchText }),
    };

    if (employeeId) {
      params.employeeId = employeeId;
    }

    this.http
      .getDataIncludeParams('Kpi/getPendingApprovalsData', params)
      .subscribe({
        next: (res: any) => {
          const rawData = res?.data || [];

          this.teamKpiData = rawData.map((item: any) => {
            const emp = item.employeedata;

            return {
              employeeId: emp.employeeId,
              employeeName: `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''} - (${emp.fusionEmpId ?? ''})`.trim(),
              rows: item.kpiKraList || [],
            };
          });

          this.collectionSize = res?.pagination?.totalRecords || 0;
          this.loading = false;
        },

        error: () => {
          this.teamKpiData = [];
          this.collectionSize = 0;
          this.loading = false;
        },
      });
  }

  // ===== EMPLOYEE LOADERS =====
  loadMyTeamEmployees(): void {
    const employeeId = this.empinfo?.employeeId;

    this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${employeeId}`)
      .subscribe((res: any) => {
        this.myTeamEmployees = (res || [])
          .filter((e: any) => e.isAccess)
          .map((emp: any) => {
            const fusion = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
            return {
              ...emp,
              fullName: `${fusion}${emp.firstName ?? ''} ${
                emp.middleName ?? ''
              } ${emp.lastName ?? ''}`.trim(),
            };
          });
      });
  }

  loadAllActiveEmployees(): void {
    const statuses = ['Active', 'Trainee Active'];

    this.http
      .getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`)
      .subscribe((res: any) => {
        this.activeEmplist = (res || [])
          .filter((e: any) => e.employeeId !== this.empinfo?.employeeId)
          .map((e: any) => ({
            label: `${e.fusionEmpId ?? ''} - ${e.firstName ?? ''} ${
              e.lastName ?? ''
            }`.trim(),
            value: e.employeeId,
          }));
      });
  }

  // ===== EVENTS =====
  onEmployeeChange(employeeId: number | null): void {
    this.selectedEmployeeId = employeeId ?? null;
    this.page = 1;
    this.first = 0;
    this.loadKraKpiData(this.selectedEmployeeId);
  }

  onSearchTextChange(): void {
    this.page = 1;
    this.first = 0;
    this.loadKraKpiData(this.selectedEmployeeId);
  }

  // ===== ACTION MODAL HANDLERS =====
  openApproveModal(row: any, modal: TemplateRef<any>, employeeId: number): void {
    this.selectedRow = { ...row, employeeId };


  const min = row?.optionsRating?.minimumRatingScale;
  const max = row?.optionsRating?.maximumRatingScale;
    this.initActionForm(min, max); // Reset form
    this.selectedFile = null;
    this.selectedFileName = '';

    // Comments optional for approve
    this.actionForm.get('comments')?.clearValidators();
    this.actionForm.get('comments')?.updateValueAndValidity();

    this.modalRef = this.modalService.open(modal, {
      centered: true,
      backdrop: 'static',
    });
  }

  openRejectModal(row: any, modal: TemplateRef<any>, employeeId: number): void {
    this.selectedRow = { ...row, employeeId };

     const min = row?.optionsRating?.minimumRatingScale;
  const max = row?.optionsRating?.maximumRatingScale;
    this.initActionForm(min, max); // Reset form
    this.selectedFile = null;
    this.selectedFileName = '';

    // Comments required for reject
    this.actionForm.get('comments')?.setValidators([Validators.required]);
    this.actionForm.get('comments')?.updateValueAndValidity();

    this.modalRef = this.modalService.open(modal, {
      centered: true,
      backdrop: 'static',
    });
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  private pendingApprovalPayload: any = null;

async submitAction(status: 'Approved' | 'Rejected'): Promise<void> {
  if (!this.selectedRow || this.actionForm.invalid || this.isSubmitting) return;

  this.isSubmitting = true;

  const employeeId = this.empinfo?.employeeId || 0;

  const payload = {
    id: this.selectedRow.assigneeId || 0,
    employeeId: this.selectedRow.employeeId || 0,
    reviewCycleId: this.selectedRow.reviewCycleData?.id || 0,
    kraId: this.selectedRow.kraId || 0,
    kpiId: this.selectedRow.kpiId || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: employeeId,
    updatedBy: employeeId,
    status: status,
    approverRating: String(this.actionForm.get('rating')?.value),
    approverRejectedComments: this.actionForm.get('comments')?.value?.trim(),
    approverAttachmentUrl: '',
  };

  try {
    // Upload file first if selected
    if (this.selectedFile) {
      const uploadedPath = await this.uploadAttachment(
        this.selectedRow.kraId,
        this.selectedRow.kpiId,
        this.selectedRow.employeeId,
        this.selectedFile
      );
      payload.approverAttachmentUrl = uploadedPath;
    }

    // Submit payload
    await this.http.postdata('Kpi/submitkrakpi', [payload]).toPromise();

    // Success handler
    this.afterApprovalSuccess(status);
  } catch (err) {
    console.error('Error submitting approval:', err);
    this.isSubmitting = false;
    this.conformationPopup.openErrorModal('Failed to submit approval');
  }
}


  // Upload file using the exact pattern from KraComponent
 private uploadAttachment(kraId: number, kpiId: number, employeeId: number, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = `/KRA/${kraId}/KPI/${kpiId}/Documents/${employeeId}/Attachments`;

    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data?.path) {
          resolve(data.path); // return the uploaded file path
        } else {
          reject('File upload returned no path');
        }
      },
      error: (err) => reject(err),
    });
  });
}

  // Success handler (called after final step)
  private afterApprovalSuccess(status: string): void {
    this.isSubmitting = false;
    this.modalRef.close();

    const message =
      status === 'Approved'
        ? 'KRA/KPI has been approved successfully'
        : 'KRA/KPI has been rejected successfully';

    this.conformationPopup.openSuccessModal(message);
    this.loadKraKpiData(this.selectedEmployeeId); // Refresh

    // Reset
    this.selectedFile = null;
    this.selectedFileName = '';
    this.pendingApprovalPayload = null;
  }

  // ===== STATUS STYLING =====
  getStatusClass(status: string): string {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
