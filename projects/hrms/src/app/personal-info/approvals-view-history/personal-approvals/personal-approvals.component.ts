import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { NgbModal, NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { Router } from '@angular/router';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { TooltipModule } from 'primeng/tooltip';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';


interface ApprovalItem {
  fieldName: string;
  oldValue: string;
  newValue: string;
  approvalStatus: string;
  createdDate: string;
  itemId: number;
  headerId: number;
  sourceFieldName:string;
  comments?:string;
  approvalScope?:string;
  moduleName?:string;
  meta?:any;
}

interface ModuleData {
  moduleName: string;
  items: ApprovalItem[];
}

@Component({
  selector: 'app-personal-approvals',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DataLoaderContentComponent,
    TooltipModule,
    NoDataFoundComponent,
    DateformatPipe,
    InfoIconComponent,
    NgbPopoverModule,
    NgxDocViewerModule
],
  templateUrl: './personal-approvals.component.html',
  styleUrls: ['./personal-approvals.component.scss'],
})
export class PersonalApprovalsComponent implements OnInit {
    subscription!: Subscription;

  moduleData: ModuleData[] = [];
  loading = true;
  cancelForm!: FormGroup;
  isLoading = false;
  selectedItem: ApprovalItem | null = null;
  private empdata: any = {};
  cameFromPersonalInfo = false;

  @ViewChild('cancelModal') cancelModal!: TemplateRef<any>;
  @ViewChild('confirmationModal') confirmationModal!: TemplateRef<any>;
  private employeeId!: number;
  private modalRef!: NgbModalRef;
  ImageUrl: any;
  ViewURL:any;
   @ViewChild('popupforaction') private popupforaction!: NgbModal;
  @ViewChild('popupforcurrentaction') private popupforcurrentaction!: NgbModal;
  constructor(
    public rbac: RbacService,
    private http: HttpService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.employeeId = this.empdata?.employeeId;
    this.fetchApprovalHistory();
  }
actionsDetails={} as any;
 openModalforaction(modal: any, request: any,){
  let parsedOldValue = {};
  if (request.oldValue && request.oldValue!='-') {
      parsedOldValue = JSON.parse(request.oldValue);
  }
  this.actionsDetails = {
    ...request,
    oldValue: parsedOldValue
  };
  this.actionsDetails.fieldName=request.fieldName;
  this.actionsDetails.moduleName=request.moduleName;
  this.modalService.open(modal, { centered: true, backdrop: 'static' });
 }
  mergedValues: any[] = [];
 openModalfornewvalueAction(modal: any, request: any) {
  // Parse oldValue and newValue
  let parsedOldValue = {};
  let parsedNewValue = {};
  if (request.oldValue&& request.oldValue!='-') {
    parsedOldValue = JSON.parse(request?.oldValue);
  }
  if (request.newValue && request.newValue!='-') {
    parsedNewValue = JSON.parse(request.newValue);
  }
  // Parse meta (ChangedFields)
  let parsedMeta: any = {};
  if (request.meta && request.meta!='') {
    parsedMeta = JSON.parse(request.meta);
  }
  this.actionsDetails = {
    ...request,
    oldValue: parsedOldValue,
    newValue: parsedNewValue,
    changedFields: parsedMeta?.ChangedFields ?? {}  // <<--- Correct extraction
  };
  const oldVal = this.actionsDetails.oldValue ?? {};
  const newVal = this.actionsDetails.newValue ?? {};
  const changedFields = this.actionsDetails.changedFields ?? {}; // <<--- Correct reference
  // Merge keys
  const keys = new Set([
    ...Object.keys(oldVal),
    ...Object.keys(newVal),
  ]);
  // Build merged list
  this.mergedValues = Array.from(keys).map(key => ({
    key,
    oldValue: oldVal[key],
    newValue: newVal[key],
    isChanged: this.isFieldChanged(key, changedFields)
  }));
  this.modalService.open(modal, { centered: true, backdrop: 'static' });
}
isFieldChanged(objectKey: string, changedFields: any): boolean {
  if (!changedFields) return false;
  const normalizedKey = objectKey.replace(/\s+/g, "").toLowerCase();
  const changedKeys = Object.keys(changedFields).map(k =>
    k.replace(/\s+/g, "").toLowerCase()
  );

  return changedKeys.includes(normalizedKey);
}
  shouldShowTooltip(element: HTMLElement): boolean {
    if (!element) return false;
    return element.offsetWidth < element.scrollWidth;
  }
  showdate(data:any):boolean{
    if(data?.sourceFieldName =='Dob' && data.oldValue && data.oldValue!='-'){
      return true
    }
    return false
  }
  showdatefornew(data:any):boolean{
  if(data?.sourceFieldName =='Dob' && data.newValue && data.newValue!='-'){
      return true
    }
    return false
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;

    if (fullPath.startsWith('/personalinfo')) {
      this.cameFromPersonalInfo = true;
      this.empdata = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.employeeId = this.empdata?.employeeId;
    } else if (fullPath.startsWith('/myinfo')) {
      this.cameFromPersonalInfo = false;
      this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    }
  }

  initForm(): void {
    this.cancelForm = this.fb.group({
      cancelReason: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(250),
          Validators.pattern(/^[^ ]/),
        ],
      ],
    });
  }

  fetchApprovalHistory(): void {
    this.loading = true;
    this.subscription = this.http
      .getData(
        `EmployeeInfoFieldUpdate/employeeInfoFieldsHistory/${this.employeeId}`
      )
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success && response.data?.length > 0) {
            this.parseApprovalData(response.data);
          } else {
            this.moduleData = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching approval history:', err);
          this.moduleData = [];
        },
      });
  }

  private parseApprovalData(data: any[]): void {
    const moduleMap = new Map<string, ApprovalItem[]>();

    data.forEach((entry: any) => {
      if (entry.displayName === 'Personal' && entry.modules) {
        entry.modules.forEach((module: any) => {
          const moduleName = module.moduleName;
          const items: ApprovalItem[] = [];

          module.headers?.forEach((header: any) => {
            header.items?.forEach((item: any) => {
              items.push({
                fieldName: this.formatFieldName(item.fieldName),
                oldValue: item.oldValue ?? '-',
                newValue: item.newValue ?? '-',
                approvalStatus: item.approvalStatus ?? '-',
                createdDate: item.createdDate,
                itemId: item.itemId,
                headerId: header.headerId,
                sourceFieldName:item.sourceFieldName,
                comments:item.comments,
                approvalScope:item.approvalScope,
                moduleName:item.moduleName,
                meta: item?.meta ?? ''
              });
            });
          });

          if (items.length > 0) {
            const existing = moduleMap.get(moduleName) || [];
            moduleMap.set(moduleName, [...existing, ...items]);
          }
        });
      }
    });
    this.moduleData = Array.from(moduleMap.entries()).map(
      ([moduleName, items]) => ({
        moduleName,
        items,
      })
    );
  }

  private formatFieldName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB');
    } catch {
      return '-';
    }
  }

  get defaultAccordionValue(): string {
    return this.moduleData.length > 0
      ? this.moduleData[0].moduleName.replace(/\s+/g, '').toLowerCase()
      : '';
  }

  getAccordionValue(moduleName: string): string {
    return moduleName.replace(/\s+/g, '').toLowerCase();
  }

  // Open cancel modal
  openCancelModal(item: ApprovalItem, modal: TemplateRef<any>): void {
    this.selectedItem = item;
    this.cancelForm.reset();
    this.modalRef = this.modalService.open(modal, {
      centered: true,
      backdrop: 'static',
    });
  }

  // Final cancel submission
  cancelRequest(): void {
    if (!this.selectedItem || this.cancelForm.invalid) return;

    this.isLoading = true;

    const payload = {
      itemId: String(this.selectedItem.itemId),
      updatedBy: String(this.employeeId),
      comments: this.cancelForm.get('cancelReason')?.value.trim(),
    };

    this.subscription = this.http
      .putData(`EmployeeInfoFieldUpdate/cancelEmployeeFieldItem`, payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            // Close only the cancel modal (no second popup now)
            this.modalRef.close();

            // Refresh table data
            this.fetchApprovalHistory();

            // Show success popup
            this.conformationPopup.openSuccessModal(
              'Request cancelled successfully'
            );
          }
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  // Clear data & close
  clearData(): void {
    this.modalRef.close();
    this.selectedItem = null;
    this.cancelForm.reset();
  }

  // Validation helper
  validateInput(control: any): void {
    if (control) control.markAsTouched();
  }

  // Check if item is pending
  isPending(status: string): boolean {
    return status.toLowerCase() === 'pending';
  }

  getStatusClass(status: string): string {
    const normalized = status.toLowerCase();

    switch (normalized) {
      case 'approved':
        return 'status-approved';
      case 'cancelled':
      case 'rejected':
        return 'status-cancelled';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }
  onViewAttachement(url: any,content:any) {
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res['body']], { type: 'image/png' });
          const objectURL = URL.createObjectURL(blob);
          this.ImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.ViewURL = null;
          this.toggleViewModal(content);
        },
        error: (err) => console.error('Error downloading image:', err),
      });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ImageUrl = null;
      this.ViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal(content);
    } else {
      // fallback for other types if needed
      this.ImageUrl = null;
      this.ViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal(content);
    }
  }

  toggleViewModal(content:any) {
    this.modalService.dismissAll();
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }
  // destroy the component

  closeonlyattemchment(){
    this.modalService.dismissAll();
    this.ImageUrl = null;
    this.ViewURL = null;
    this.modalService.open(this.popupforaction, {  centered: true, backdrop: 'static', keyboard: false });
  }
 closeonlyattemchmentforcurrent(){
    this.modalService.dismissAll();
    this.ImageUrl = null;
    this.ViewURL = null;
    this.modalService.open(this.popupforcurrentaction, {  centered: true, backdrop: 'static', keyboard: false });
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
