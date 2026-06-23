import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { HttpService } from '../../services/http.service';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { KraKpiManagementLayoutComponent } from '../kra-kpi-management-layout/kra-kpi-management-layout.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef } from '@angular/core';
import { OpenModalService } from '../../services/open-modal.service';
import { InfoIconComponent } from '../../icons/info-icon/info-icon.component';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { Router } from '@angular/router';
import { MODULE_INFOS } from '../../shared/modules-info';
import { Subscription } from 'rxjs';
import { ApplicablePoliciesTriggerComponent } from '../../shared/policies/applicable-policies-trigger/applicable-policies-trigger.component';
import { APPLICABLE_POLICIES_KEYS } from '../../shared/policies/policy-visibility.catalog';

@Component({
  selector: 'app-my-kra-kpi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbPopoverModule,
    PaginatorModule,
    AccordionModule,
    TableModule,
    Select,
    ModuleInfoIconComponent,
    ApplicablePoliciesTriggerComponent,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    KraKpiManagementLayoutComponent,
    InfoIconComponent,
    ModuleInformationComponent,
  ],
  templateUrl: './my-kra-kpi.component.html',
  styleUrl: './my-kra-kpi.component.scss',
})
export class MyKraKpiComponent implements OnInit, OnDestroy {
  applicablePolicies = APPLICABLE_POLICIES_KEYS.PMS_KRA_KPI;
  kraList: any[] = [];
  dataload = false;
  moduleinfo = '';

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

  myKpiList: any[] = [];
  selectedKra: any;

  reviewCycleOptions: { label: string; value: string }[] = [];
  selectedReviewCycleId: string | null = null;

  // totalAssignedWeightage = 0;
  // isWeightageExceeded = false;

  isAllSelected = false;
  selectedKpis: any[] = [];

  private subscription!: Subscription;

  constructor(
    private http: HttpService,
    private offcanvasService: NgbOffcanvas,
    public modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadReviewCycles();
    this.callApiTwice();
    this.updateModuleInfo();
  }

  private callApiTwice(): void {
    this.getMyKraList();
    setTimeout(() => {
      this.getMyKraList();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from active subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Close any open modals
    this.modalService.dismissAll();
    // Close any open offcanvas
    this.offcanvasService.dismiss();
  }

  updateModuleInfo() {
    const url = this.router.url;
    this.moduleinfo = url.includes('/pms/kpi-kra/my-kpi-kra')
      ? MODULE_INFOS.PMS_MY_KRA_KPI_LIST_MODULE_INFO
      : '';
  }

  getMyKraList(): void {
    const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const employeeId = user?.employeeId || 0;

    const params: any = {
      employeeId,
      pageNumber: this.page,
      pageSize: this.rows,
    };

    if (this.selectedReviewCycleId) {
      params.reviewCycleId = this.selectedReviewCycleId;
    }

    if (this.searchText?.trim()) {
      params.search = this.searchText.trim();
    }

    this.dataload = true;

    this.subscription = this.http
      .getDataIncludeParams('Kpi/getEmployeeAssignKpiKra', params)
      .subscribe({
        next: (res: any) => {
          if (res.success && Array.isArray(res.data)) {
            // Process new response format with review cycles
            this.kraList = res.data.flatMap((emp: any) =>
              (emp.reviewCycles || []).map((reviewCycle: any) => {
                const kras = (reviewCycle.kras || []).map((kraItem: any) => {
                  const kpis = kraItem.kpis || [];
                  return {
                    kraId: kraItem.kra?.kraId,
                    kraName: kraItem.kra?.kraName,
                    effectiveDate: kraItem.kra?.effectiveDate,
                    targetDate: kraItem.kra?.targetDate,
                    weightageValue: kpis.length > 0 ? kpis[0].assignedKraWeightage : kraItem.kra?.weightageValue,
                    overallStatus: kraItem.overallStatus,
                    status: kraItem.kra?.status,
                    kpisCount: kraItem.kpisCount || 0,
                    kpis: kpis,
                    progress: this.calculateKraProgress(kpis),
                  };
                });

                return {
                  reviewCycleName: reviewCycle.reviewCycle?.reviewCycleName || 'Unknown Review Cycle',
                  reviewCycleId: reviewCycle.reviewCycle?.id,
                  reviewCycleStatus: reviewCycle.reviewCycle?.status,
                  kras: kras,
                  totalKraWeightage: this.calculateTotalKraWeightage(kras)
                };
              })
            );

            this.collectionSize = res.pagination?.totalRecords ?? this.kraList.length;
          } else {
            this.kraList = [];
            this.collectionSize = 0;
          }

          this.dataload = false;
        },
        error: () => {
          this.kraList = [];
          this.collectionSize = 0;
          this.dataload = false;
        },
      });
  }

calculateKraProgress(kpis: any[]): number {
  if (!kpis || kpis.length === 0) {
    return 0;
  }

  const totalKpis = kpis.length;

  let committedSum = 0;

  kpis.forEach((kp: any) => {
    let weightage = 0;

    if (kp.assignedStatus === 'Approved') {
      // Use approver's final value if available
      weightage = Number(kp.assignedApproverWeightage ?? kp.assignedWeightage ?? 0);
    } else if (kp.assignedStatus === 'Waiting for Approval') {
      // Use employee's submitted value
      weightage = Number(kp.assignedWeightage ?? 0);
    }
    // Draft, Rejected, etc. → contribute 0

    committedSum += weightage;
  });

  if (totalKpis === 0) return 0;

  const averageProgress = committedSum / totalKpis;
  return Math.round(Math.min(100, Math.max(0, averageProgress)));
}

calculateTotalKraWeightage(kras: any[]): number {
  return kras.reduce((total, kra) => total + Number(kra.weightageValue || 0), 0);
}

calculateOverallRating(kras: any[]): string {
  if (!kras || kras.length === 0) return '-';

  let totalKraRatings = 0;

  kras.forEach((kra: any) => {
    const kraRating = this.calculateKraRating(kra);
    totalKraRatings += kraRating;
  });

  const overallRating = totalKraRatings;

  // Round to 1 decimal place, with special handling for .x8 values
  const rounded = Math.round(overallRating * 10) / 10;

  return overallRating > 0 ? rounded.toFixed(1) : '-';
}

calculateKraRating(assignment: any): number {
  if (!assignment.kpis || assignment.kpis.length === 0) {
    return 0;
  }

  let weightedKpiSum = 0;

  assignment.kpis.forEach((kpi: any) => {
    const rating = Number(kpi.assignedApproverRating) || 0;
    const kpiWeight = Number(kpi.assignedKpiWeightage) || 0;

    weightedKpiSum += rating * (kpiWeight / 100);
  });

  // Multiply by KRA weightage to get final KRA rating
  const kraWeight = Number(assignment.weightageValue) || 0;
  const kraRating = weightedKpiSum * (kraWeight / 100);

  return kraRating;
}

getKraRating(kra: any): string {
  const rating = this.calculateKraRating(kra);
  return rating > 0 ? rating.toFixed(1) : '-';
}

loadReviewCycles(): void {
  this.http.getData('reviewCycleHeader/getallnames').subscribe({
    next: (res: any) => {
      if (Array.isArray(res)) {
        this.reviewCycleOptions = res.map((item: any) => ({
          label: item.reviewCycleName,
          value: item.id,
        }));
      } else {
        this.reviewCycleOptions = [];
      }
    },
    error: (err) => {
      console.error('Failed to load review cycles', err);
      this.reviewCycleOptions = [];
    },
  });
}

onReviewCycleChange(reviewCycleId: string | null) {
  this.selectedReviewCycleId = reviewCycleId;
  this.page = 1;
  this.first = 0;
  this.getMyKraList();
}

  openKraKpiModal(kra: any, content: any) {
    this.selectedKra = kra;
    this.loadKpisForMyKra(kra);

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
  }

  async submitForApproval() {
    try {
      const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = user?.employeeId || 0;

      const payloadArray: any[] = [];

      const selectedKpis = this.getSelectedKpis();

      if (selectedKpis.length === 0) {
        this.conformationPopup.openErrorModal('Please select at least one KPI');
        return;
      }

      for (let kpi of this.selectedKpis) {
        let documentUrl = null;

        // Upload file if exists
        if (kpi.attachment) {
          documentUrl = await this.uploadKpiFile(
            this.selectedKra.kraId,
            kpi.kpiId || 0,
            kpi.attachment
          );
        }

        payloadArray.push({
          id: kpi.assigneeId || 0,
          employeeId: employeeId,
          reviewCycleId: kpi.reviewCycleId,
          kraId: this.selectedKra.kraId,
          kpiId: kpi.kpiId || 0,
          assignedTarget: kpi.targetValue?.toString() || '',
          weightage: kpi.assignedWeightage?.toString() || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: employeeId,
          updatedBy: employeeId,
          targetedDate: kpi.targetDate || new Date().toISOString(),
          status: 'Waiting for Approval', // or as per your workflow
          documentUrl: documentUrl || '',
        });
      }

      // Call API
      this.http.postdata('Kpi/submitkrakpi', payloadArray).subscribe({
        next: (res: any) => {
          console.log('KPIs submitted successfully', res);
          this.modalService.dismissAll();
          this.getMyKraList();
          this.conformationPopup.openSuccessModal(
            "KRA/KPI's submitted successfully"
          );
        },
        error: (err: any) => {
          console.error('Submit for Approval failed', err);
          this.conformationPopup.openErrorModal(err.error?.message);
        },
      });
    } catch (err) {
      console.error('Error uploading KPI files', err);
    }
  }

  async saveKpis() {
    try {
      const user = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = user?.employeeId || 0;

      const payloadArray: any[] = [];

      const selectedKpis = this.getSelectedKpis();


      if (selectedKpis.length === 0) {
        this.conformationPopup.openErrorModal('Please select at least one KPI');
        return;
      }

      for (let kpi of this.selectedKpis) {
        let documentUrl = null;

        // Upload file if exists
        if (kpi.attachment) {
          documentUrl = await this.uploadKpiFile(
            this.selectedKra.kraId,
            kpi.kpiId || 0,
            kpi.attachment
          );
        }

        payloadArray.push({
          id: kpi.assigneeId || 0,
          employeeId: employeeId,
          reviewCycleId: kpi.reviewCycleId,
          kraId: this.selectedKra.kraId,
          kpiId: kpi.kpiId || 0,
          assignedTarget: kpi.targetValue?.toString() || '',
          weightage: kpi.assignedWeightage?.toString() || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: employeeId,
          updatedBy: employeeId,
          targetedDate: kpi.targetDate || new Date().toISOString(),
          status: 'Draft',
          documentUrl: documentUrl || '',
        });
      }

      this.http.postdata('Kpi/submitkrakpi', payloadArray).subscribe({
        next: (res: any) => {
          console.log('KPIs saved as Draft', res);

          // Close KPI modal first
          this.modalService.dismissAll();

          // Refresh list
          this.getMyKraList();

          // Show success popup AFTER modal close
          setTimeout(() => {
            this.conformationPopup.openSuccessModal(
              'KPIs saved as Draft successfully'
            );
          }, 300);
        },
        error: (err: any) => {
          console.error('Save KPI Draft failed', err);
        },
      });
    } catch (err) {
      console.error('Error while saving KPI draft', err);
    }
  }

  onSearchTextChange() {
    this.page = 1;
    this.first = 0;
    this.getMyKraList();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.getMyKraList();
  }

  onPageSizeChange(newSize: number) {
    this.rows = newSize;
    this.page = 1;
    this.first = 0;
    this.getMyKraList();
  }


  getProgressClass(value: number): string {
    if (value >= 70) return 'bg-success';
    if (value >= 30) return 'bg-warning';
    return 'bg-danger';
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Inprogress':
        return 'status-waiting';
      case 'Completed':
        return 'status-active';
      case 'Overdue':
        return 'status-onhold';
      default:
        return '';
    }
  }

  openMyKpiCanvas(content: TemplateRef<any>, kra: any): void {
    this.selectedKra = kra;
    this.loadKpisForMyKra(kra);

    setTimeout(() => {
      this.offcanvasService.open(content, {
        position: 'end',
        backdrop: 'static',
        panelClass: 'custom-kpi-canvas',
      });
    }, 150);
  }

  closeMyKpiCanvas(): void {
    this.offcanvasService.dismiss();
  }

  loadKpisForMyKra(kra: any): void {
  this.myKpiList = [];
  this.isAllSelected = false;
  this.selectedKpis = [];

  if (kra?.kpis && kra.kpis.length > 0) {
    kra.kpis.forEach((kpi: any) => {
      // Determine the correct CURRENT committed weightage
      let currentCommittedWeightage = 0;

      if (kpi.assignedStatus === 'Approved') {
        currentCommittedWeightage = Number(kpi.assignedApproverWeightage || 0);
      } else if (kpi.assignedStatus === 'Waiting for Approval') {
        currentCommittedWeightage = Number(kpi.assignedWeightage || 0);
      } else if (kpi.assignedStatus === 'Rejected') {
        currentCommittedWeightage = 0;
      } else {
        currentCommittedWeightage = Number(kpi.assignedWeightage || 0);
      }

      this.myKpiList.push({
        kpiId: kpi.kpiId,
        kpiName: kpi.kpiName,
        weightageValue: kpi.weightageValue,
        assignedKpiWeightage: kpi.assignedKpiWeightage,
        unitOfMeasurement: kpi.targetType || 'N/A',
        targetValue: kpi.targetValue,
        targetType: kpi.targetType,
        targetDate: kpi.targetDate
          ? this.formatDateForInput(kpi.targetDate)
          : null,
        description: kpi.description,

        // Use the committed value as the base
        assignedWeightage: currentCommittedWeightage,

        selected: false,
        attachment: null,
        assigneeId: kpi.assigneeId,
        assignedStatus: kpi.assignedStatus || 'Draft',

        reviewCycleId: kpi.reviewCycleData?.id || 0,

        // Optional: preserve original fields if needed later
        assignedApproverWeightage: kpi.assignedApproverWeightage,
        assignedApproverRating: kpi.assignedApproverRating,
        assignedApproverRejectedComments: kpi.assignedApproverRejectedComments || '',
      });
    });
  }

  console.log('My KPIs loaded:', this.myKpiList);

  // Trigger validation after load
  setTimeout(() => {
    // this.updateWeightageValidation();
  }, 0);
}

  formatDateForInput(dateStr: string) {
    const d = new Date(dateStr);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${d.getFullYear()}-${month}-${day}`;
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.myKpiList[index].attachment = file;
      this.myKpiList[index].attachmentName = file.name; // optional for display
      console.log('File attached for row', index, file);
    }
  }

  uploadKpiFile(kraId: number, kpiId: number, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const filePath = `/KRA/${kraId}/KPI/${kpiId}/Documents`;
      this.http
        .uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
        .subscribe({
          next: (res: any) => {
            if (res?.path) {
              resolve(res.path); // Return uploaded file path
            } else {
              reject('No path returned');
            }
          },
          error: (err) => {
            console.error('File upload failed', err);
            reject(err);
          },
        });
    });
  }



onRowSelectionChange(): void {
  this.selectedKpis = this.myKpiList.filter((kpi) => kpi.selected);

  this.isAllSelected =
    this.myKpiList.length > 0 &&
    this.myKpiList.every((kpi) => kpi.selected || this.isWaitingForApproval(kpi));

  // this.updateWeightageValidation(); // ← Must be called here
}

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;

    this.myKpiList.forEach((kpi) => {
      if (!this.isWaitingForApproval(kpi)) {
        kpi.selected = checked;
      }
    });

    this.selectedKpis = this.getSelectedKpis();
    this.isAllSelected =
      this.myKpiList.length > 0 &&
      this.myKpiList.every(
        (kpi) => kpi.selected || this.isWaitingForApproval(kpi)
      );
      this.onRowSelectionChange();
  }

  getSelectedKpis(): any[] {
    return this.myKpiList.filter((kpi) => kpi.selected);
  }

  getApproverStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Approved':
      case 'Active':
        return 'status-active';

      case 'Rejected':
        return 'status-onhold';

      case 'Waiting for Approval':
      case 'Pending':
      case null:
      case undefined:
        return 'status-waiting';

      default:
        return 'bg-secondary';
    }
  }

  isWaitingForApproval(kpi: any): boolean {
    return (
      kpi?.assignedStatus === 'Waiting for Approval' ||
      kpi?.assignedStatus === 'Approved' ||
      this.selectedKra?.overallStatus === 'Overdue'
    );
  }

// updateWeightageValidation(): void {
//   let totalProgress = 0;

//   this.myKpiList.forEach((kpi) => {
//     let weightageToAdd = 0;

//     const isLocked = this.isWaitingForApproval(kpi); // Approved or Waiting

//     if (isLocked) {
//       // For locked KPIs: always count their current committed value
//       weightageToAdd = Number(kpi.assignedWeightage || 0);
//     } else {
//       // For editable KPIs: only count if selected
//       if (kpi.selected) {
//         weightageToAdd = Number(kpi.assignedWeightage || 0);
//       }
//     }

//     totalProgress += weightageToAdd;
//   });

//   this.totalAssignedWeightage = Math.round(totalProgress);
//   this.isWeightageExceeded = totalProgress > 100;
// }
onAssignedWeightageChange(): void {
  // Clamp value to 0-100 per field
  this.myKpiList.forEach(kpi => {
    if (!this.isWaitingForApproval(kpi)) {
      if (kpi.assignedWeightage > 100) kpi.assignedWeightage = 100;
      if (kpi.assignedWeightage < 0) kpi.assignedWeightage = 0;
    }
  });

  // this.updateWeightageValidation();
}

onWeightageInput(event: any, index: number): void {
  let input = event.target;
  let value = input.value.replace(/[^0-9]/g, ''); // Remove any non-digit

  let num = value === '' ? 0 : parseInt(value, 10);

  // Strictly enforce: if > 100, cap at 100 and stop further typing
  if (num > 100) {
    num = 100;
    value = '100';
    input.value = '100'; // Immediately reflect in UI
  } else {
    input.value = value; // Update input to cleaned value
  }

  // Update model
  this.myKpiList[index].assignedWeightage = num;

  // Trigger total validation
  // this.updateWeightageValidation();
}

clampWeightage(index: number): void {
  const kpi = this.myKpiList[index];

  if (this.isWaitingForApproval(kpi)) return;

  let value = kpi.assignedWeightage;

  if (isNaN(value) || value < 0) {
    kpi.assignedWeightage = 0;
  } else if (value > 100) {
    kpi.assignedWeightage = 100;
  }

  // this.updateWeightageValidation();
}
}


  // calculateAssignedWeightage(): void {
  //   debugger;
  //   this.totalAssignedWeightage = this.myKpiList
  //     .filter(
  //       (kpi : any) =>
  //         kpi.selected &&
  //         (kpi.assignedStatus === 'Waiting for Approval' ||
  //           kpi.assignedStatus === 'Active' ||
  //           kpi.assignedStatus === 'Approved')
  //     )
  //     .reduce((sum, kpi) => {
  //       return sum + kpi.assignedWeightage || 0;
  //     }, 0);

  //   this.isWeightageExceeded = this.totalAssignedWeightage > 100;
  //   console.log(
  //     this.myKpiList.map((k) => ({
  //       name: k.kpiName,
  //       selected: k.selected,
  //       weight: k.assignedWeightage,
  //     }))
  //   );
  // }
