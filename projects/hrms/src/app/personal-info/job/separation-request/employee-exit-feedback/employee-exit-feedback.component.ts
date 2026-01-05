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
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-employee-exit-feedback',
  imports: [CommonModule, SeparationSubTabsComponent, MyinfoSeparationSubTabsComponent, TranslateModule, DataLoaderContentComponent, NoDataFoundComponent, RouterModule, ReactiveFormsModule, Select],
  templateUrl: './employee-exit-feedback.component.html',
  styleUrl: './employee-exit-feedback.component.scss'
})
export class EmployeeExitFeedbackComponent {

  isDataLoaded = false;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  exitfeedbackdata = new BehaviorSubject<IExitFeedback[]>([]);
  subscription!: Subscription;
  initiateForm!: FormGroup;
  availableForms: any[] = [];
  selectedItem: any;
  isLoading = false;
  @ViewChild('initiateModal') initiateModal!: TemplateRef<any>;
  
  constructor(
    private router: Router,
    public permissionRouteService: AccessForEmployeeinfoService,
    private http: HttpService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private openModalService: OpenModalService
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
            this.exitfeedbackdata.next(res?.data || []);
            this.isDataLoaded = false;
          }
        },
        error: (err: any) => {
          this.isDataLoaded = false;
        },
      });
  }

  openForm(item: IExitFeedback): void {
    // Store the form data in localStorage similar to assessmentform component
    const formData = {
      entity: {
        employeeId: this.empinfo.employeeId,
        formId: item.empFormId, // Assuming formId exists in IExitFeedback
        exitFeedbackId: item.id,
        ...item
      }
    };
    localStorage.setItem('exitfeedbackformdata', JSON.stringify(formData));
    
    // Navigate to the exit feedback form component
    this.router.navigate(['/personalinfo/job/separation-request/exit-feedback-form']);
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

  initiateExitFeedback(): void {
    if (this.initiateForm.valid && this.selectedItem) {
      this.isLoading = true;
      const payload = {
        employeeId : this.selectedItem.employeeId,
        empFormId: this.initiateForm.get('formId')?.value,
        status: 'Initiated',
        initiatedBy: this.empinfo.employeeId
      };
      
      this.subscription = this.http.putData(`ExitFeedbackRequest/${this.selectedItem.id}`, payload).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.openModalService.openSuccessModal('Exit feedback form initiated successfully');
          this.fetchExitFeedbackDetails(); // Refresh the data
        },
        error: (err: any) => {
          this.isLoading = false;
          this.openModalService.openErrorModal(err.error?.message || 'Failed to initiate form');
        }
      });
    }
  }

}
