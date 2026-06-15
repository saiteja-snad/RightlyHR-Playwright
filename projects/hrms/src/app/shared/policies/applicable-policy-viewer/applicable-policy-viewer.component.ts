import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Subject, takeUntil } from 'rxjs';
import { ApplicablePoliciesService } from '../applicable-policies.service';
import { ApplicablePolicyItem } from '../applicable-policies.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-applicable-policy-viewer',
  imports: [CommonModule, ReactiveFormsModule, NgxDocViewerModule, TranslateModule],
  templateUrl: './applicable-policy-viewer.component.html',
  styleUrl: './applicable-policy-viewer.component.scss'
})
export class ApplicablePolicyViewerComponent implements OnDestroy {
  @Output() policyAcknowledged = new EventEmitter<number>();
  @ViewChild('policyViewerModal') policyViewerModal!: TemplateRef<any>;

  ackForm: FormGroup;
  selectedPolicy: ApplicablePolicyItem | null = null;
  previewUrl: string | null = null;
  imageUrl: SafeUrl | null = null;
  loading = false;
  documentLoading = false;
  private readonly destroy$ = new Subject<void>();
  private imageObjectUrl: string | null = null;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private applicablePoliciesService: ApplicablePoliciesService
  ) {
    this.ackForm = this.fb.group({
      acknowledged: [false, Validators.requiredTrue]
    });
  }

  open(policy: ApplicablePolicyItem): void {
    this.selectedPolicy = policy;
    this.previewUrl = null;
    this.imageUrl = null;
    this.ackForm.reset({ acknowledged: false });
    this.documentLoading = true;

    this.modalService.open(this.policyViewerModal, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    const attachment = policy.policyAttachment ?? '';
    const lowerAttachment = attachment.toLowerCase();

    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(lowerAttachment)) {
      this.applicablePoliciesService.downloadPolicyAttachment(attachment)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            this.revokeImageObjectUrl();
            this.imageObjectUrl = URL.createObjectURL(blob);
            this.imageUrl = this.applicablePoliciesService.createSafeImageUrl(this.imageObjectUrl);
            this.previewUrl = null;
            this.documentLoading = false;
          },
          error: () => {
            this.documentLoading = false;
          }
        });
      return;
    }

    this.previewUrl = `${environment.viewUrl}${attachment}`;
    this.documentLoading = false;
  }

  downloadSelectedPolicy(): void {
    const attachment = this.selectedPolicy?.policyAttachment;
    if (!attachment) {
      return;
    }

    const fallbackName = attachment.split('/').pop() || `${this.selectedPolicy?.policyName ?? 'policy'}`;
    this.applicablePoliciesService.downloadPolicyAttachment(attachment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => this.applicablePoliciesService.saveAttachment(blob, fallbackName)
      });
  }

  acknowledgeSelectedPolicy(): void {
    const employeeId = this.getLoggedInEmployeeId();
    if (this.ackForm.invalid || !this.selectedPolicy?.id || !employeeId) {
      return;
    }

    this.loading = true;
    this.applicablePoliciesService.acknowledgePolicy(this.selectedPolicy.id, employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.selectedPolicy) {
            this.selectedPolicy.acknowledged = true;
          }
          this.loading = false;
          this.policyAcknowledged.emit(this.selectedPolicy!.id);
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  close(): void {
    this.modalService.dismissAll();
    this.previewUrl = null;
    this.imageUrl = null;
    this.revokeImageObjectUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokeImageObjectUrl();
  }

  private revokeImageObjectUrl(): void {
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
      this.imageObjectUrl = null;
    }
  }

  private getLoggedInEmployeeId(): number | null {
    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = Number(user?.employeeId);
    return Number.isFinite(employeeId) && employeeId > 0 ? employeeId : null;
  }
}
