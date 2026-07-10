import { Component, effect, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Table, TableModule } from 'primeng/table';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { AuthService } from '../../../services/auth.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trainee-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    InfoIconComponent,
  ],
  templateUrl: './trainee-requests.component.html',
  styleUrl: './trainee-requests.component.scss',
})
export class TraineeRequestsComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;
  loading = false;
  subscription!: Subscription;
  Trainees = new BehaviorSubject<any[]>([]);
  originalData: any[] = [];
  searchValue: string = '';
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  previousSearchValue: string = '';
  selectedRequest: any = null;
  selectedLeaveData: any = {
    trcomments: '',
    rejectedReason: '',
    extenddate: null,
  };
  extend = false;
  discontinue = false;
  isLoading = false;
  comments: any[] = [];
  LOGIN: any;

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
  ) {
    // Critical: Listen to employee switch signal (just like PermissionsComponent)
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.Trainees.next([]);
        }
        this.http.resetTriggerSignal(); // Reset signal after handling
      }
    });
  }

  ngOnInit(): void {
    // Initial load when component first loads
    const stored = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    if (stored?.employeeId) {
      this.LOGIN = stored;
      this.getAllPendingApprovals();
    }
  }

  getAllPendingApprovals() {
    if (!this.LOGIN?.employeeId) {
      this.Trainees.next([]);
      return;
    }

    this.loading = true;
    const employeeId = this.LOGIN.employeeId;

    this.subscription = this.http
      .getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.traineeoffboardingModuleId}`)
      .subscribe({
        next: (res: any) => {
          this.Trainees.next(res.data || []);
          this.originalData = [...(res.data || [])]; // Store original data for reset functionality
          this.loading = false;
        },
        error: () => {
          this.Trainees.next([]);
          this.loading = false;
        },
      });
  }

  handleRequests(request: any) {
    this.selectedRequest = request;
    this.selectedLeaveData = {
      trcomments: '',
      rejectedReason: '',
      extenddate: null,
    };
    this.extend = false;
    this.discontinue = false;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // Approve
  handleAccept() {
    if (!this.selectedLeaveData.trcomments?.trim()) {
      this.conformationPopup.openErrorModal('Feedback is required');
      return;
    }

    this.isLoading = true;
    const payload = {
      approvedBy: this.authService.getToken().employeeId.toString() ,
      status: 'Approved',
      comments: this.selectedLeaveData.trcomments,
      moduleId: environment.traineeoffboardingModuleId,
      onBehalfOfApproval: true,
      // headerID: this.selectedRequest.approvalHeader.id,
      currentStage: this.selectedRequest.approvalHeader.currentapprovalStage,
    };

    this.subscription = this.http
      .putData(`PendingApproval/${this.selectedRequest.approvalHeader.id}`, payload)
      .subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Trainee request approved successfully');
          this.refresh();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error?.message || 'Error');
        },
        complete: () => this.isLoading = false,
      });
  }

  // Reject + Extend
  handleExtend() {
    if (!this.selectedLeaveData.extenddate || !this.selectedLeaveData.trcomments?.trim()) {
      this.conformationPopup.openErrorModal('Extend date and feedback are required');
      return;
    }

    this.isLoading = true;
    const payload = {
      approvedBy: this.authService.getToken().employeeId.toString(),
      status: 'Processed',
      comments: this.selectedLeaveData.trcomments,
      trainingEndDate: this.selectedLeaveData.extenddate,
      moduleId: environment.traineeoffboardingModuleId,
      onBehalfOfApproval: true,
      currentStage: this.selectedRequest.approvalHeader.currentapprovalStage,

    };

    this.subscription = this.http
      .putData(`PendingApproval/process/${this.selectedRequest.approvalHeader.id}`, payload)
      .subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Training period extended successfully');
          this.refresh();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error?.message || 'Error');
        },
        complete: () => this.isLoading = false,
      });
  }

  // Reject + Discontinue
  handleReject() {
    if (!this.selectedLeaveData.rejectedReason?.trim()) {
      this.conformationPopup.openErrorModal('Reason is required');
      return;
    }

    this.isLoading = true;
    const payload = {
      approvedBy: this.authService.getToken().employeeId.toString(),
      status: 'Rejected',
      comments: this.selectedLeaveData.rejectedReason,
      moduleId: environment.traineeoffboardingModuleId,
      onBehalfOfApproval: true,
      currentStage:this.selectedRequest.approvalHeader.currentapprovalStage,

    };

    this.subscription = this.http
      .putData(`PendingApproval/${this.selectedRequest.approvalHeader.id}`, payload)
      .subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Trainee request rejected successfully');
          this.refresh();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(err.error?.message || 'Error');
        },
        complete: () => this.isLoading = false,
      });
  }

  // Final Process
handleProcess(request: any) {
  if (!request?.approvalHeader) {
    this.conformationPopup.openErrorModal('Invalid request');
    return;
  }

  this.isLoading = true;

  const payload = {
    approvedBy: this.authService.getToken().employeeId.toString(),
    status: 'Processed',
    moduleId: environment.traineeoffboardingModuleId,
    onBehalfOfApproval: true,
    currentStage: Number(request.approvalHeader.currentapprovalStage),
  };

  this.subscription = this.http
    .putData(`PendingApproval/process/${request.approvalHeader.id}`, payload)
    .subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Trainee request processed successfully');
        this.refresh();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.conformationPopup.openErrorModal(err.error?.message || 'Error');
      },
      complete: () => this.isLoading = false,
    });
}

  commentsFunction(comments: any, content: any) {
    this.comments = Array.isArray(comments) ? comments : (comments ? [comments] : []);
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  toggleExtend() {
    this.extend = true;
    this.discontinue = false;
    this.selectedLeaveData.rejectedReason = '';
  }

  toggleDiscontinue() {
    this.discontinue = true;
    this.extend = false;
    this.selectedLeaveData.extenddate = null;
    this.selectedLeaveData.trcomments = '';
  }

  refresh() {
    this.getAllPendingApprovals();
    this.http.triggerActionSignal?.();
  }

onCommentChange(field: 'trcomments' | 'rejectedReason', value: string) {
  if (field === 'trcomments') {
    this.selectedLeaveData.trcomments = value;
  } else if (field === 'rejectedReason') {
    this.selectedLeaveData.rejectedReason = value;
  }
}

setApproveComment(text: string) {
  this.selectedLeaveData.trcomments = text;
  this.onCommentChange('trcomments', text);
}

setRejectComment(text: string) {
  this.selectedLeaveData.rejectedReason = text;
  // No onCommentChange needed here unless you add counter for rejectedReason
}

setExtendComment(text: string) {
  this.selectedLeaveData.trcomments = text;
  this.onCommentChange('trcomments', text);
}

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  onSearchChange() {
    // Reset sorting when search changes
    if (this.searchValue !== this.previousSearchValue) {
      this.currentSortField = '';
      this.currentSortOrder = 0;
      this.previousSearchValue = this.searchValue;
      if (this.table) {
        this.table.reset();
      }
    }
  }

  getFilteredAndSortedTrainees(): any[] {
    const currentData = this.Trainees.getValue();
    if (!this.searchValue || this.searchValue.trim() === '') {
      return currentData;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return currentData.filter((trainee: any) => {
      const traineeId = trainee.entity?.fusionEmpId?.toLowerCase() || '';
      const traineeName = (trainee.entity?.empName || trainee.entity?.raisedForName || '').toLowerCase();
      const startDate = trainee.entity?.traineeStartDate?.toLowerCase() || '';
      const endDate = trainee.entity?.traineeEndDate?.toLowerCase() || '';
      
      return traineeId.includes(searchTerm) ||
             traineeName.includes(searchTerm) ||
             startDate.includes(searchTerm) ||
             endDate.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.Trainees.next([...this.originalData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) {
          this.table.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = this.getNestedProperty(a, field);
      let val2 = this.getNestedProperty(b, field);

      // Handle string sorting
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  private getNestedProperty(obj: any, field: string): any {
    if (field === 'traineeName') {
      return obj.entity?.empName || obj.entity?.raisedForName || '';
    }
    return obj.entity?.[field] ?? '';
  }
}
