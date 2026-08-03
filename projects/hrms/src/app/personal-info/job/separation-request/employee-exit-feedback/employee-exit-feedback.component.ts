import { Component, TemplateRef, ViewChild } from '@angular/core';
import { SeparationSubTabsComponent } from "../../../../shared/personalinfo-tabs/separation-sub-tabs/separation-sub-tabs.component";
import { MyinfoSeparationSubTabsComponent } from "../../../../shared/myinfo-tabs/myinfo-separation-sub-tabs/myinfo-separation-sub-tabs.component";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Ipersonal } from '../../../../Interfaces/personal-modal';
import { AccessForEmployeeinfoService } from '../../../../services/access-for-employeeinfo.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { IExitFeedback } from './exitfeedback-interface';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DownloadIconComponent } from '../../../../icons/download-icon/download-icon.component';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-employee-exit-feedback',
  imports: [CommonModule, SeparationSubTabsComponent, MyinfoSeparationSubTabsComponent, TranslateModule, DataLoaderContentComponent, NoDataFoundComponent, RouterModule, ReactiveFormsModule, DownloadIconComponent, TableModule],
  templateUrl: './employee-exit-feedback.component.html',
  styleUrl: './employee-exit-feedback.component.scss'
})
export class EmployeeExitFeedbackComponent {

  @ViewChild('exitFeedbackTable') exitFeedbackTable!: Table;
  isDataLoaded = false;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  exitfeedbackdata = new BehaviorSubject<IExitFeedback[]>([]);
  originalExitFeedbackData: IExitFeedback[] = [];
  subscription!: Subscription;
  initiateForm!: FormGroup;
  availableForms: any[] = [];
  selectedItem: any;
  isLoading = false;
  @ViewChild('initiateModal') initiateModal!: TemplateRef<any>;
  @ViewChild('documentViewModal') documentViewModal!: TemplateRef<any>;
  documentViewUrl: SafeResourceUrl | null = null;
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  
  constructor(
    private router: Router,
    public permissionRouteService: AccessForEmployeeinfoService,
    private http: HttpService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private openModalService: OpenModalService,
    private sanitizer: DomSanitizer
  ) {
    this.initiateForm = this.fb.group({
      formId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.getAvailableForms();
  }

  canAccess(
    action: 'view' | 'create' | 'update' | 'delete',
    permission: string
  ) {
    const value = this.permissionRouteService.canAccessField(
      action,
      permission
    );
    return value;
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.fetchExitFeedbackDetails();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.fetchExitFeedbackDetails();
    }
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  fetchExitFeedbackDetails(): void {
    this.isDataLoaded = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`ExitFeedbackRequest/employee/${employeeId}`)
      .subscribe({
        next: (res: any) => {
          console.log(res)
          if (res) {
            const data = res?.data || [];
            this.exitfeedbackdata.next(data);
            this.originalExitFeedbackData = [...data];
            this.isDataLoaded = false;
          }
        },
        error: (err: any) => {
          this.isDataLoaded = false;
        },
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
        this.exitfeedbackdata.next([...this.originalExitFeedbackData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.exitFeedbackTable) {
          this.exitFeedbackTable.reset();
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

    // Get current data
    const currentData = this.exitfeedbackdata.value;

    if (!currentData || currentData.length === 0) {
      return;
    }

    // Perform sorting
    const sortedData = [...currentData].sort((a: any, b: any) => {
      let valueA = this.getNestedProperty(a, field);
      let valueB = this.getNestedProperty(b, field);

      // Handle null/undefined values
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return event.order;
      if (valueB == null) return -event.order;

      // Date handling
      if (field === 'initiatedAt' || field === 'lastWorkingDate' || field.toLowerCase().includes('date')) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
        return event.order * (valueA - valueB);
      }

      // String comparison
      valueA = String(valueA).toLowerCase().trim();
      valueB = String(valueB).toLowerCase().trim();
      
      return event.order * valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
    });

    // Update the data
    this.exitfeedbackdata.next(sortedData);
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  openForm(item: IExitFeedback): void {
    const formData = {
      entity: {
        employeeId: this.empinfo.employeeId,
        formId: item.empFormId, // Assuming formId exists in IExitFeedback
        exitFeedbackId: item.id,
        ...item
      }
    };
    localStorage.setItem('exitfeedbackformdata', JSON.stringify(formData));
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.router.navigate(['/personalinfo/job/separation-request/exit-feedback-form']);
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
     this.router.navigate(['/myinfo/job/separation-request/exit-feedback-form']);
    }
  }

  openInitiateModal(item: any): void {
    this.selectedItem = item;
    this.initiateForm.reset();
    this.modalService.open(this.initiateModal, { centered: true, backdrop: 'static' });
  }

  getAvailableForms(): void {
    this.subscription = this.http.getData('Form/getAllFormDetails?status=Active&moduleid=33').subscribe({
      next: (response: any) => {
        this.availableForms = response.data || response || [];
      },
      error: (err: any) => {
        console.error('Error loading forms:', err);
        this.availableForms = [];
      }
    });
  }

   onSelectBankProofDownload(file: any) {
    
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: (reason) => console.log(reason),
    });
  }

}
