import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { ExpenseApprovalResponse, IExpense, IExpenseHeaders } from '../../../Interfaces/claimsandexpenses.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DownloadExpenseComponent } from "../../download-expense/download-expense.component";
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import moment from 'moment';
import { SignalsService } from '../../../services/signals.service';
import { SelectModule } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';

@Component({
  selector: 'app-pending-expenses',
  imports: [CommonModule, DateformatPipe, TranslateModule, NgxDocViewerModule, FormsModule, NoDataFoundComponent, DataLoaderContentComponent, DownloadExpenseComponent, DocumentViewIconComponent, TableModule, ReactiveFormsModule, SelectModule, ConfirmationIconComponent],
  templateUrl: './pending-expenses.component.html',
  styleUrl: './pending-expenses.component.scss'
})

export class PendingExpensesComponent implements OnInit, OnDestroy {
  originalData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredWaitingforApprovalExpenses = new BehaviorSubject<any[]>([]);
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  @ViewChild('verificationViewattamchment') private verificationViewattamchment!: NgbModal;
  @ViewChild('checklistconfirmationmodal') checklistconfirmationmodal: any;
  @ViewChild('verificationofModal') verificationofModal: any;
  @ViewChild('dt1') table!: Table;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  commentsrecivced = [] as any
  searchTerm: any = ''
  approverComments = [] as any[];
  seletedMouthly: any;
  loading = false
  @ViewChild('commentspopup') modalContent: any;
  expenesEmplyeedata: IExpense[] = [];
  originalExpenseData: IExpense[] = [];
  draftsCount: number = 0;
  expensesAttachment: any;
  selectedData = {} as any;
  selectedExpenseData: any;
  responseSummary: any;
  spinnerLoader = false;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  selectedLeaveStatus: any;
  checklistdata: any[] = [];
  storeapprovalRequest: any;
  verifyForm!: FormGroup;
  markAsPaidForm!: FormGroup;
  verifiedExpenseIds: number[] = [];
  isloading = false;
  paymentmodedata: any[] = [];
  minPaymentDate!: string;
  selectedLeaveData = {} as ExpenseApprovalResponse;
  totalCount: any;
  expenseheaderpending = [] as ExpenseApprovalResponse[];
  allVerifiedMap: Map<number, boolean> = new Map<number, boolean>();
  verifyModalRef: NgbModalRef | null = null;
  expenseImageUrl: any;
  expenseViewURL: any;


  @ViewChild('expenseSummary') expenseSummary: any;
  constructor(private http: HttpService, private signalService: SignalsService, public formValidation: FormValidationService, private modalService: NgbModal, private sanitizer: DomSanitizer, private SelectedyeartimeOffService: TimeoffYearFilterService, private fb: FormBuilder, private sharedModalService: OpenModalService, public rbac: RbacService,) { }

  selectedYear: any;
  selectemp: any;
  ngOnInit(): void {
    this.SelectedyeartimeOffService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;

        this.SelectedyeartimeOffService.selectedMounthly$.subscribe(mounthly => {
          if (mounthly !== null) {
            this.seletedMouthly = mounthly;

          }
        })
        this.http.selectedEmployeeIdExpenses$.subscribe((id) => {
          if (id) {
            this.selectemp = id;
            this.getexpensesheaderbyemployeeid();
          } else {
            this.selectemp = null;
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getexpensesheaderbyemployeeid();
          }
        });
      }
    });

    this.getCheckListData();
    this.getpaymentmode();
  }

  getpaymentmode() {
    this.subscription = this.http.getData("entityAttributeValues?entity=ExpensesPaymentModeConfiguration&attribute=PaymentMode").subscribe({
      next: (data: any) => {
        this.paymentmodedata = data as any[];
      },
      error: () => {

      },
      complete: () => {

      },
    })
  }
  getCheckListData() {
    this.http
      .getData(`ExpensesCheckListConfiguration/getall`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.checklistdata = response.data
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.approveForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
  //download expenses popup open function
  openpopupforDownload(content: any, expenseDetails: any) {
    this.selectedData = expenseDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  comments_Function(comments: any) {
    this.commentsrecivced = comments
  }

  getexpensesheaderbyemployeeid(): void {
    let empId = this.selectemp ?? this.empinfo?.employeeId;
    this.loading = true
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=Waiting for Approval&month=${this.seletedMouthly}&year=${this.selectedYear}&searchQuery=${cleanSearchQuery}`,).subscribe({
        next: (data: any) => {
          this.loading = false
          const filteredData = data.filter((item: any) => !item.expenseSummary);
          this.originalExpenseData = [...filteredData];
          this.expenesEmplyeedata = [...filteredData];

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  getFilteredAndSortedExpenses() {
    return this.expenesEmplyeedata;
  }

  customSort(event: any) {
    const field = event.field;
    const order = event.order;

    if (order === 0) {
      // Reset to original order
      this.expenesEmplyeedata = [...this.originalExpenseData];
    } else {
      this.expenesEmplyeedata.sort((a: any, b: any) => {
        let aVal, bVal;

        if (field === 'expenses_Title') {
          aVal = a.expenses_Title?.toLowerCase() || '';
          bVal = b.expenses_Title?.toLowerCase() || '';
        } else if (field === 'expense_Date') {
          aVal = new Date(a.expenseitem?.[0]?.expense_Date || 0);
          bVal = new Date(b.expenseitem?.[0]?.expense_Date || 0);
        } else if (field === 'applied_date') {
          aVal = new Date(a.applied_date || 0);
          bVal = new Date(b.applied_date || 0);
        } else if (field === 'totalExpenseAmount') {
          aVal = parseFloat(a.totalExpenseAmount) || 0;
          bVal = parseFloat(b.totalExpenseAmount) || 0;
        } else if (field === 'status') {
          aVal = a.status?.toLowerCase() || '';
          bVal = b.status?.toLowerCase() || '';
        } else {
          aVal = a[field];
          bVal = b[field];
        }

        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }
  }
  
  viewItem(expid: number,) {
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.approverComments = value;
  }
  private renameFiles(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }
  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        // Check if the response body is of type Blob
        const blob: Blob = res.body as Blob;
        if (!blob) {
          return;
        }
        // Extract filename from 'content-disposition' header if available
        const contentDisposition = res.headers.get('content-disposition');
        let fileName = 'defaultFileName.pdf'; // Default filename
        if (contentDisposition) {
          const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (fileNameMatch !== null && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Extract filename from the original file path if 'content-disposition' is not available
          const filePath = file;
          const parts = filePath.split('/');
          fileName = parts[parts.length - 1] || 'defaultFileName.pdf';
        }
        // Create a link element and trigger the download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (reason) => {
        console.error('File download error:', reason);
      }
    });
  }

  onViewAttachement(url: any) {
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.ExpenseViewURL = null;
            this.toggleViewModal();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
    } else {
      // fallback for other types if needed
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }

  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment)
  }

  isImageFile(url: any): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png');
  }


  approveExpense(popup: any, item: any) {
    this.selectedExpenseData = item;

    this.modalService.open(popup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectExpense(popup: any, item: any) {
    this.selectedExpenseData = item;

    this.modalService.open(popup, {
      centered: true,
      backdrop: 'static'
    });
  }

  handleAccept(form: FormGroup) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Approved',
      comments: this.approveForm.value.comments,
      moduleId: 19, // Replace with actual Expense Module Id
      headerRequests: [
        {
          headerID: this.selectedExpenseData.pendingApprovalHeader.id,
          currentStage: this.selectedExpenseData.pendingApprovalHeader.currentapprovalStage
        }
      ]
    };

    this.http.putData(
      'v2/PendingApproval/multiapprovals',
      payload
    ).subscribe({
      next: (response: any) => {

        const selectedCount = 1;
        this.modalService.dismissAll();

        this.responseSummary = response.data;

        if (selectedCount > 1) {

          this.modalService.open(this.expenseSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

        } else {

          this.sharedModalService.openSuccessModal(
            'Expense request approved successfully'
          );

        }

        this.approveForm.reset();
        this.getexpensesheaderbyemployeeid();

        // Refresh pending approval count
        this.http.setnewcountDetails();

        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          expenses: true,
        }));
      },
      error: (err) => {
        console.log(err);
        this.modalService.dismissAll();
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  handleReject(form: FormGroup) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Rejected',
      comments: this.rejectForm.value.comments,
      moduleId: 19, // Replace with actual Expense Module Id
      headerRequests: [
        {
          headerID: this.selectedExpenseData.pendingApprovalHeader.id,
          currentStage: this.selectedExpenseData.pendingApprovalHeader.currentapprovalStage
        }
      ]
    };

    this.http.putData(
      'v2/PendingApproval/multiapprovals',
      payload
    ).subscribe({
      next: (response: any) => {

        const selectedCount = 1;


        this.modalService.dismissAll();

        this.responseSummary = response.data;

        if (selectedCount > 1) {

          this.modalService.open(this.expenseSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

        } else {

          this.sharedModalService.openSuccessModal(
            'Expense request rejected successfully'
          );

        }

        this.rejectForm.reset();
        this.getexpensesheaderbyemployeeid();

        this.http.setnewcountDetails();

        this.http.tirggerPendingApprovalCountSignal.update((status) => ({
          ...status,
          expenses: true,
        }));
      },
      error: (err) => {
        console.log(err);
        this.modalService.dismissAll();
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }
  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  }

  openApproveModal(content: any, item: any) {
    this.selectedLeaveStatus = null;   // add this
    this.intializeApproveForm();
    this.selectedExpenseData = item;

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  openRejectModal(content: any, item: any) {
    this.selectedLeaveStatus = null;   // add this
    this.intializeRejectForm();
    this.selectedExpenseData = item;

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  canApproveExpense(exp: any): boolean {

    const currentApproverId =
      exp?.pendingApprovalHeader?.currentApproverId;

    const approvedType =
      exp?.pendingApprovalHeader?.approvedType;

    const loginId =
      this.LOGIN.employeeId?.toString();

    // Employee-based approvals (RM/TM)
    if (
      approvedType === 'EMP' &&
      currentApproverId?.toString() === loginId
    ) {
      return true;
    }

    // Role-based approvals (HR)
    if (
      approvedType === 'ROLE' &&
      this.rbac.allowedToAccess('For Role (Claims and Expenses).update')
    ) {
      return true;
    }

    return false;
  }

  isHRApproval(exp: any): boolean {
    return (
      exp?.pendingApprovalHeader?.approvedType === 'ROLE' &&
      exp?.pendingApprovalHeader?.status === 'Waiting for Approval'
    );
  }

  isRMStage(exp: any): boolean {
    return (
      +exp?.pendingApprovalHeader?.currentapprovalStage === 1 &&
      exp?.pendingApprovalHeader?.currentApproverId?.toString() ===
      this.LOGIN?.employeeId?.toString()
    );
  }

  isHRStage(exp: any): boolean {
    return (
      +exp?.pendingApprovalHeader?.currentapprovalStage === 2
    );
  }

  isFinanceStage(exp: any): boolean {
    return (
      +exp?.pendingApprovalHeader?.currentapprovalStage === 3
    );
  }

  isFinancePaymentStage(exp: any): boolean {
    return (
      +exp?.pendingApprovalHeader?.currentapprovalStage === 4
    );
  }


  // isFinanceStage(exp: any): boolean {
  //   return +exp.pendingApprovalHeader.currentapprovalStage === 4;
  // }

  isAllChecked(): boolean {
    return this.checklistdata
      .filter(x => x.isMandatory)
      .every(x => x.checked);
  }

  confirmApproval(modal: any) {
    console.log('storeapprovalRequest', this.storeapprovalRequest);
    this.isloading = true;
    const payload = this.checklistdata.map((item: any) => ({
      expenseHeaderId: this.storeapprovalRequest.pendingApprovalHeader.referenceEntityId,
      employeeId: this.storeapprovalRequest.employeeId,         // current employee id
      checklistConfigurationId: item.id,          // checklist item id
      isChecked: item.checked || false,
      checkedBy: this.empinfo.employeeId,
      checkedAt: moment().format('YYYY-MM-DD'),
      comments: item.comments || '',
      createdAt: moment().format('YYYY-MM-DD'),
    }));
    this.http.postdata('ExpensesCheckListTracking', payload).subscribe({
      next: (res) => {
        this.isloading = false;

        if (res) {
          if (this.storeapprovalRequest.action === 'Approve') {
            this.handleAccept(this.approveForm);
          } else if (this.storeapprovalRequest.action === 'Verify') {
            modal.close();

            const payload = {
              requestProcessedBy: this.LOGIN.employeeId.toString(),
              status: 'Approved',
              comments: this.approveForm.value.comments,
              moduleId: 19,
              headerRequests: [
                {
                  headerID: this.storeapprovalRequest.pendingApprovalHeader.id,
                  currentStage: this.storeapprovalRequest.pendingApprovalHeader.currentapprovalStage
                }
              ]
            };

            this.http.putData(
              'v2/PendingApproval/multiapprovals',
              payload
            ).subscribe({
              next: () => {
                this.getexpensesheaderbyemployeeid();
              },
              error: (err) => {
                console.error(err);
              }
            });
          }
        }

        this.storeapprovalRequest = {} as ExpenseApprovalResponse;
        modal.close();
      },
      error: (err) => {
        this.isloading = false;
        console.error(err);
      }
    });
  }

  handleProcess(request: ExpenseApprovalResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
      currentStage: parseInt(
        this.selectedLeaveData?.approvalHeader?.currentapprovalStage
      ),
    };
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...'
    );
    this.http
      .putData(
        `PendingApproval/process/${request?.approvalHeader?.id}`,
        requestBody
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.http.setnewcountDetails();
          this.sharedModalService.openSuccessModal(
            'Expense request processed successfully'
          );
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            expenses: true,
          }));
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.http.triggerActionSignal();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.getApprovalStatusCounts();
        },
      });
  }

  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=19&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
      this.http.updatePendingApprovalCounts(this.totalCount);
    });
  }

  getAllPendingApprovals() {
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=19&approvedType=ROLE`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.expenseheaderpending = (
            response.data as ExpenseApprovalResponse[]
          ).filter(
            (item) =>
              item.approvalHeader.status != 'Processed' &&
              item.approvalHeader.status != 'Rejected'
          );

          this.refreshAllVerifiedStates();
        },
        error: (reason) => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
  selectedItem: any = null;
  refreshAllVerifiedStates(): void {
    this.expenseheaderpending.forEach(record => {
      const expId = record.entity.expenses_ID;
      if (!this.allVerifiedMap.has(expId)) {
        this.http.getitembyid(`Expenses_Header/getby_Expense_ID`, expId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data: any) => {
              const allDone = data.expenseitem?.length > 0 &&
                data.expenseitem.every((item: any) => item.isVerified === true);
              if (allDone) {
                this.allVerifiedMap.set(expId, true);
                console.log(this.allVerifiedMap);
              }
            }
          });
      }
    });
  }

  onCancel(modal: any) {
    // 1. Reset form
    this.approveForm.reset();
    // 2. Reset checklist selection
    this.checklistdata.forEach(item => item.checked = false);
    // 4. Close modal
    modal.dismiss();
  }

  isAllVerifiedForRecord(expensesId: number): boolean {
    return this.allVerifiedMap.get(expensesId) === true;
  }
  openVerifyModal(item: any, content: any) {
    this.verifyModalRef = this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeVerifyForm();
    this.selectedItem = item; // store clicked item
  }
  intializeVerifyForm() {
    this.verifyForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  handleVerify(verifyForm: FormGroup): void {
    if (!verifyForm.valid || !this.selectedItem) return;

    const formData = verifyForm.value;
    const verifiedItem = this.selectedItem;

    const requestBody = {
      isVerified: true,
      verifiedBy: this.empinfo.employeeId?.toString(),
      status: 'Verified',
      meta: JSON.stringify({
        addedBy: this.empinfo.employeeId?.toString(),
        addedComments: formData.comments,
        addedOn: moment().format('YYYY-MM-DD')
      })
    };
    this.http.putData(`Expenses_Header/ExpensesItemUpdate/${verifiedItem.expenseitem_id}`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Close only the Verify modal
          this.verifyModalRef?.close();

          // Show success popup
          this.sharedModalService.openSuccessModal('Expense item verified successfully');

          // Update local UI immediately
          if (this.expenseheaderiteams?.expenseitem?.length) {
            const idx = this.expenseheaderiteams.expenseitem.findIndex(
              it => it.expenseitem_id === verifiedItem.expenseitem_id
            );
            if (idx > -1) {
              this.expenseheaderiteams.expenseitem[idx].isVerified = true;
            }
          }

          this.selectedItem = null;

          // Update verified IDs for template checks
          this.verifiedExpenseIds.push(verifiedItem.expenseitem_id);

          if (this.expenseheaderiteams?.expenseitem?.length) {
            const allDone = this.expenseheaderiteams.expenseitem.every(
              (it: any) =>
                it.isVerified === true ||
                this.verifiedExpenseIds.includes(it.expenseitem_id)
            );

            if (allDone) {
              this.allVerifiedMap.set(
                this.expenseheaderiteams.expenses_ID,
                true
              );
            }
          }

          // Refresh headers in background, but the modal stays open
          this.getAllPendingApprovals();
        },
        error: (err: any) => {
          this.verifyModalRef?.close();
          this.sharedModalService.openErrorModal(err?.error?.Message || 'Verification failed');
        }
      });
  }

  intializeMarkAsPaidForm() {
    this.markAsPaidForm = this.fb.group({
      paymentDate: ['', [Validators.required]],
      paymentMode: ['', [Validators.required]],
      transactionId: ['', [Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      comments: ['', [Validators.maxLength(500)]]
    });
  }

  onViewAttachementverification(url: any) {
    const lowerUrl = url?.toLowerCase();

    if (
      lowerUrl?.endsWith('jpg') ||
      lowerUrl?.endsWith('jpeg') ||
      lowerUrl?.endsWith('png')
    ) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.expenseImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.expenseViewURL = null;
            this.toggleViewModalforverification();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.expenseImageUrl = null;
      this.expenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModalforverification();
    } else {
      // fallback for other types if needed
      this.expenseImageUrl = null;
      this.expenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModalforverification();
    }
  }


  openMarkAsPaidModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeMarkAsPaidForm();
    this.selectedLeaveData = request;
    const appliedDate = moment(request.entity.applied_date);
    const today = moment();
    // Get latest date between applied date and today
    this.minPaymentDate = moment.max(appliedDate, today).format('YYYY-MM-DD');
    console.log("selectedLeaveDatagvhcvbn", this.selectedLeaveData)
  }
  openRequiredCalrificationModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }


  onStatusVerifySelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'verified') {
      this.verifyForm.get('comments')?.setValue('Verified');
    }
  }

  toggleViewModalforverification() {
    this.modalService.dismissAll();
    this.openModal(this.verificationViewattamchment);
  }

  expensesCheckList(request: ExpenseApprovalResponse, action?: string): void {
    console.log('request', request);
    this.storeapprovalRequest = request;
    this.storeapprovalRequest.action = action || '';
    this.intializeApproveForm();
    this.selectedLeaveData = request;
    this.modalService.open(this.checklistconfirmationmodal, {
      centered: true,
      backdrop: 'static'
    });
  }

  markasPaid(modal: any) {
    this.isloading = true;
    if (!this.markAsPaidForm.valid || !this.selectedLeaveData) return;
    console.log(this.selectedLeaveData);

    const formData = this.markAsPaidForm.value;
    const verifiedItem = this.selectedLeaveData;

    const requestBody = {
      expenses_ID: this.selectedLeaveData.entity.expenses_ID,
      applied_date: this.selectedLeaveData.entity.applied_date || new Date().toISOString(),
      expenses_Title: this.selectedLeaveData.entity.expenses_Title || '',
      additional_details: '',
      status: 'Processed',
      expenseName: this.selectedLeaveData.entity.expenseType || '',
      currentRole: '',
      totalamount: this.selectedLeaveData.entity.totalExpenseAmount || 0,
      employeeId: this.selectedLeaveData.entity.employeeId,
      submissionDate: new Date().toISOString(),
      expense_Amount: this.selectedLeaveData.entity.totalExpenseAmount || 0,
      attachment_url: '',
      currentApprover:
        this.selectedLeaveData.approvalHeader?.currentApproverId?.toString() || '',
      nextApprover: '',
      approverEmail: '',
      comments: formData.comments || 'Marked as paid',
      isCheckListRequired: false,
      paymentDate: formData.paymentDate || new Date().toISOString(),
      paymentMode: formData.paymentMode || '',
      refTransactionId: formData.transactionId || '',
      expenseitem: []
    };

    this.http.putData(`Expenses_Header/updateexpenses?id=${this.selectedLeaveData.entity.expenses_ID}`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.handleProcess(this.selectedLeaveData);
          }
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.http.setnewcountDetails();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            expenses: true,
          }));
          this.storeapprovalRequest = {} as ExpenseApprovalResponse;
          modal.close();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  handleVerifyReject(verifyForm: FormGroup): void {
    if (!verifyForm.valid || !this.selectedItem) return;

    const formData = verifyForm.value;
    const verifiedItem = this.selectedItem;

    const requestBody = {
      isVerified: true,
      status: 'Rejected',
      meta: JSON.stringify({
        addedBy: this.empinfo.employeeId?.toString(),
        addedComments: formData.comments,
        addedOn: moment().format('YYYY-MM-DD')
      })
    };

    this.http.putData(`Expenses_Header/ExpensesItemUpdate/${verifiedItem.expenseitem_id}`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Close only the Verify modal
          this.verifyModalRef?.close();

          // Show success popup
          this.sharedModalService.openSuccessModal('Expense item rejected successfully');

          // Update local UI immediately
          if (this.expenseheaderiteams?.expenseitem?.length) {
            const idx = this.expenseheaderiteams.expenseitem.findIndex(
              it => it.expenseitem_id === verifiedItem.expenseitem_id
            );
            if (idx > -1) {
              this.expenseheaderiteams.expenseitem[idx].isVerified = true;
            }
          }

          this.selectedItem = null;

          // Update verified IDs for template checks
          this.verifiedExpenseIds.push(verifiedItem.expenseitem_id);

          // Refresh headers in background, but the modal stays open
          this.getAllPendingApprovals();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.http.setnewcountDetails();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            expenses: true,
          }));
        },
        error: (err: any) => {
          this.verifyModalRef?.close();
          this.sharedModalService.openErrorModal(err?.error?.Message || 'Verification failed');
        }
      });
  }

  approveForPayment(exp: any) {
  console.log('Approve For Payment', exp);
}
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}