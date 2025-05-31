import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { filter, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { Location } from '@angular/common';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../shared/modules-info';
import { OpenModalService } from '../../services/open-modal.service';
@Component({
  selector: 'app-companypolicies',
  imports: [CommonModule, ReactiveFormsModule, NgxDocViewerModule, Select,NgbPopoverModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, ModuleInformationComponent],
  templateUrl: './companypolicies.component.html',
  styleUrl: './companypolicies.component.scss'
})

export class CompanypoliciesComponent {
  moduleinfo: string = '';
  policiesform!: FormGroup;
  ackForm!: FormGroup
  ExpenseViewURL: any;
  ExpenseImageUrl: any;
  empinfo: any;
  Policies: any = [];
  subscription!: Subscription;
  jobshiftdetials: any;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: { label: string; value: number }[] = [];
  loading = false
  filteredpolicy: any = []
  orgPolicyItemsArray: any[] = [];
  EduViewURL: any;
  EduImageUrl: any;
  attachmentUrl: any;
  item: any;
  showViewDetailsModal = false;
  isViewingAttachment = false;
  shouldOpenModal = false;
  viewPolicyname!: string;
  ackCheckboxChecked : any;
  selectedItem : any;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, private location: Location,
    private sanitizer: DomSanitizer, public readonly router: Router, private confirmation: OpenModalService) { }

  // @ViewChild('viewattamchment') private viewattamchment!: TemplateRef<any>;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  ngOnInit(): void {
    this.selectedYear = this.currentYear;
    this.policiesform = this.fb.group({
      selectedYear: [this.currentYear]
    });
    this.policiesform.get('selectedYear')?.valueChanges.subscribe((year: number) => {
      this.selectedYear = year;
      this.getpolicys(this.jobshiftdetials);
    });
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getjobDetails();
    this.currentYear = new Date().getFullYear();
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push({ label: i.toString(), value: i });
    }
    this.ackForm = this.fb.group({
      acknowledged: [false, Validators.requiredTrue]
    });
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/policies/companypolicies': MODULE_INFOS.POLICIES_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  openupdateModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  openModal(content: any) {
    this.modalService.open(this.viewattamchment, { size: 'xl', centered: true , backdrop : 'static', keyboard : false});
  }

  private handleImage(url: string) {
    const baseUrl = this.location.normalize('/');
    const imageUrl = `${baseUrl}${url}`;
    this.EduImageUrl = `${environment.viewUrl}${imageUrl}`;
    // Log imageUrl to console
  }

  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = this.location.normalize('/');
    const pdfUrl = `${baseUrl}${url}`;
    this.EduViewURL = `${environment.viewUrl}${pdfUrl}`;
  }

  onViewClick(policyAttachment: string) {
    this.shouldOpenModal = true;
    this.EduImageUrl = '';
    this.EduViewURL = '';
    this.ackCheckboxChecked = false;
    const isImage = /\.(jpg|jpeg|png)$/i.test(policyAttachment);
    const isPDF = policyAttachment.toLowerCase().endsWith('.pdf');
    this.modalService.dismissAll();
    if (isImage) {
      this.handleImage(policyAttachment);
    } else if (isPDF) {
      this.handlePDF(policyAttachment);
    } else {
      console.log(`Unsupported file type: ${policyAttachment}`);
      return;
    }
    this.openModal(this.viewattamchment);
  }

  onViewAttachement(url: any, name: any, selectedItem : any) {
    this.viewPolicyname = name;
    this.selectedItem = selectedItem;
    this.ackCheckboxChecked = false;
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res['body']], { type: 'image/png' });
          const objectURL = URL.createObjectURL(blob);
          this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.ExpenseViewURL = null;
          this.toggleViewModal();
          this.ackForm.reset({ acknowledged: false });
        },
        error: (err) => console.error('Error downloading image:', err),
      });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
      this.ackForm.reset({ acknowledged: false });
    } else {
      // fallback for other types if needed
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
      this.ackForm.reset({ acknowledged: false });
    }
  }

  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment);
  }

  getjobDetails() {
    let EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`JobDetails/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobshiftdetials = data;
        this.getpolicys(data);
      }
    });
  }

  getpolicys(jobShiftDetails: any) {
    this.loading = true;
    let policies = {
      locationId: jobShiftDetails[0]?.locationid,
      subLocationId: jobShiftDetails[0]?.sublocationid,
      shiftId: jobShiftDetails[0]?.shiftId,
      Applicableyear: this.selectedYear,
      employeeId: this.empinfo.employeeId
    };
    this.subscription = this.http.getDataWithQueryParams(`v2/orgPolicies/getpolicybylocation`, policies).subscribe({
      next: (response: any) => {
        this.loading = false
        this.Policies = response;
        this.filteredpolicy = response.map((policy: any) => policy.orgPolicyItems);
        this.orgPolicyItemsArray = [].concat(...this.filteredpolicy);
        console.log(this.orgPolicyItemsArray);
      },
      error: (reason: any) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  postacknowledgement(selectedItem : any) {
    let data = {
      orgPolicyItemId: selectedItem.id,
      employeeId: this.empinfo.employeeId,
      acknowledged: true,
      acknowledgedDate: new Date(),
      source: "Web"
    }
    console.log(data);
    this.subscription = this.http.postdata('OrgPolicyAcknowledgment', data).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loading = false;
        this.confirmation.openSuccessModal('Policy Acknowledged successfully');
        selectedItem.acknowledged = true;
        this.getjobDetails();
      },
      error: (reason: any) => console.log(reason)
    });
  }

}