import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { filter, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
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
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { TableModule, Table } from 'primeng/table';
import { DocumentViewIconComponent } from "../../icons/document-view-icon/document-view-icon.component";
@Component({
  selector: 'app-companypolicies',
  imports: [CommonModule, ReactiveFormsModule, NgxDocViewerModule, Select, NgbPopoverModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent, ModuleInformationComponent, ModuleInfoIconComponent, TableModule, DocumentViewIconComponent],
  templateUrl: './companypolicies.component.html',
  styleUrl: './companypolicies.component.scss'
})

export class CompanypoliciesComponent implements OnInit, OnDestroy {
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
  documentLoading = false
  filteredpolicy: any = []
  orgPolicyItemsArray: any[] = [];
  viewPolicyname!: string;
  selectedItem: any;
  
  // PrimeNG table selection properties
  selectedPolicyItems: any[] = [];
  bulkAcknowledging = false;

  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  @ViewChild('dt') table!: Table;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, private location: Location,
    private sanitizer: DomSanitizer, public readonly router: Router, private confirmation: OpenModalService) { }
  ngOnInit(): void {
    this.selectedYear = this.currentYear;
    this.policiesform = this.fb.group({
      selectedYear: [this.currentYear]
    });
    this.policiesform.get('selectedYear')?.valueChanges.subscribe((year: number) => {
      this.selectedYear = year;
      // Clear selections when year changes
      this.selectedPolicyItems = [];
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

  isAcknowledgeButtonDisabled(): boolean {
    return this.ackForm.invalid || this.loading;
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.ExpenseViewURL = null;
    this.ExpenseImageUrl = null;
  }

  shouldShowAcknowledgeFooter(): boolean {
    return this.selectedItem?.requiresAcknowledgment && !this.selectedItem?.acknowledged;
  }

  // PrimeNG table selection handling
  onSelectionChange(selectedItems: any[]) {
    // Update selection state and filter out invalid selections
    if (!selectedItems || selectedItems.length === 0) {
      this.selectedPolicyItems = [];
      this.sortPolicyItems();
      return;
    }

    // Only keep policies that require acknowledgment and are not yet acknowledged
    const validSelections = selectedItems.filter(item => 
      item.requiresAcknowledgment && !item.acknowledged
    );

    // Update the selection to only include valid items
    this.selectedPolicyItems = [...validSelections];

    // Sort the array to bring selected items to the top
    this.sortPolicyItems();

    // If some items were filtered out, update the table selection to match
    if (validSelections.length !== selectedItems.length && this.table) {
      setTimeout(() => {
        this.table.selection = validSelections;
      });
    }
  }

  // Method to sort policy items with selected items at the top
  private sortPolicyItems() {
    if (!this.orgPolicyItemsArray || this.orgPolicyItemsArray.length === 0) {
      return;
    }

    // Get selected item IDs for quick lookup
    const selectedIds = new Set(this.selectedPolicyItems.map(item => item.id));

    // Sort the array: selected items first, then non-selected items
    this.orgPolicyItemsArray = this.orgPolicyItemsArray.sort((a, b) => {
      const aIsSelected = selectedIds.has(a.id);
      const bIsSelected = selectedIds.has(b.id);

      // If both are selected or both are not selected, maintain original order
      if (aIsSelected === bIsSelected) {
        return 0;
      }

      // Selected items come first (return -1 for a if a is selected and b is not)
      return aIsSelected ? -1 : 1;
    });
  }

  isCheckboxDisabled(item: any): boolean {
    // Disable checkbox if policy doesn't require acknowledgment or is already acknowledged
    return !item.requiresAcknowledgment || item.acknowledged;
  }

  // Get count of policies that require acknowledgment and are not yet acknowledged
  get pendingAcknowledgmentCount(): number {
    if (!this.orgPolicyItemsArray || this.orgPolicyItemsArray.length === 0) {
      return 0;
    }
    return this.orgPolicyItemsArray.filter(item => 
      item.requiresAcknowledgment && !item.acknowledged
    ).length;
  }

  // Get count of currently selected valid policies (for acknowledgment)
  get validSelectedCount(): number {
    if (!this.selectedPolicyItems || this.selectedPolicyItems.length === 0) {
      return 0;
    }
    return this.selectedPolicyItems.filter(policy => 
      policy.requiresAcknowledgment && !policy.acknowledged
    ).length;
  }

  // Check if individual acknowledge buttons should be disabled (when multi-select is active)
  isIndividualAcknowledgeDisabled(): boolean {
    return this.selectedPolicyItems && this.selectedPolicyItems.length > 0;
  }

  // Check if header checkbox should be disabled (when no records need acknowledgment)
  isHeaderCheckboxDisabled(): boolean {
    return this.pendingAcknowledgmentCount === 0;
  }

  openModal(content: any) {
    this.modalService.open(this.viewattamchment, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }

  onViewAttachement(url: any, name: any, selectedItem: any) {
    this.viewPolicyname = name;
    this.selectedItem = selectedItem;
    this.documentLoading = true;
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res['body']], { type: 'image/png' });
          const objectURL = URL.createObjectURL(blob);
          this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.ExpenseViewURL = null;
          this.modalService.dismissAll();
          this.openModal(this.viewattamchment);
          this.ackForm.reset({ acknowledged: false });
          this.documentLoading = false;
        },
        error: (err) => {
          console.error('Error downloading image:', err);
          this.documentLoading = false;
        }
      });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.modalService.dismissAll();
      this.openModal(this.viewattamchment);
      this.ackForm.reset({ acknowledged: false });
      setTimeout(() => {
        this.documentLoading = false;
      }, 1000);
    } else {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.modalService.dismissAll();
      this.openModal(this.viewattamchment);
      this.ackForm.reset({ acknowledged: false });
      setTimeout(() => {
        this.documentLoading = false;
      }, 1000);
    }
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
        
        // Clear selections when new data is loaded and reset table selection
        this.selectedPolicyItems = [];
        if (this.table) {
          this.table.selection = [];
        }
        
        // Sort items initially to maintain consistent ordering
        this.sortPolicyItems();
        
        console.log(this.orgPolicyItemsArray);
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  postacknowledgement(selectedItem: any) {
    let data = [{
      orgPolicyItemId: selectedItem.id,
      employeeId: this.empinfo.employeeId,
      acknowledged: true,
      acknowledgedDate: new Date(),
      source: "Web"
    }]
    console.log(data);
    this.loading = true;
    this.subscription = this.http.postdata('OrgPolicyAcknowledgment', data).subscribe({
      next: (response: any) => {
        console.log(response);
        this.loading = false;

        this.confirmation.openSuccessModal('Policy Acknowledged successfully');

        setTimeout(() => {
          this.modalService.dismissAll();
        }, 2000);
        selectedItem.acknowledged = true;
        
        // Clear selections and reset sorting when individual acknowledgment is completed
        this.selectedPolicyItems = [];
        this.sortPolicyItems();
        
        this.getjobDetails();
      },
      error: (reason: any) => {
        console.log(reason);
        this.loading = false;
      }
    });
  }

  bulkAcknowledgePolicies() {
    if (!this.selectedPolicyItems || this.selectedPolicyItems.length === 0) {
      this.confirmation.openErrorModal('Please select at least one policy to acknowledge');
      return;
    }

    // Double-check: Only process policies that require acknowledgment and are not yet acknowledged
    const validPoliciesForAcknowledgment = this.selectedPolicyItems.filter(policy => 
      policy.requiresAcknowledgment && !policy.acknowledged
    );

    if (validPoliciesForAcknowledgment.length === 0) {
      this.confirmation.openErrorModal('No valid policies selected for acknowledgment');
      this.selectedPolicyItems = []; // Clear invalid selections
      return;
    }

    this.bulkAcknowledging = true;
    
    // Create array payload for only valid policies that require acknowledgment
    const acknowledgmentData = validPoliciesForAcknowledgment.map(policy => ({
      orgPolicyItemId: policy.id,
      employeeId: this.empinfo.employeeId,
      acknowledged: true,
      acknowledgedDate: new Date(),
      source: "Web"
    }));

    console.log('Bulk acknowledgment payload (filtered array):', acknowledgmentData);
    console.log('Valid policies count:', validPoliciesForAcknowledgment.length);

    // Send array to the same single endpoint
    this.subscription = this.http.postdata('OrgPolicyAcknowledgment', acknowledgmentData).subscribe({
      next: (response: any) => {
        console.log(response);
        // Update selectedPolicyItems to reflect only the valid ones that were processed
        this.selectedPolicyItems = validPoliciesForAcknowledgment;
        this.handleBulkAcknowledgmentSuccess();
      },
      error: (reason: any) => {
        console.log('Error:', reason);
        this.bulkAcknowledging = false;
        this.confirmation.openErrorModal('Failed to acknowledge policies. Please try again.');
      }
    });
  }

  private handleBulkAcknowledgmentSuccess() {
    this.bulkAcknowledging = false;
    // this.confirmation.openSuccessModal(`${this.selectedPolicyItems.length} policies acknowledged successfully`);
    this.confirmation.openSuccessModal(`Policies acknowledged successfully`);
    
    // Update the acknowledged status for selected policies
    this.selectedPolicyItems.forEach(policy => {
      policy.acknowledged = true;
    });
    
    this.selectedPolicyItems = [];
    // Reset sorting when selections are cleared
    this.sortPolicyItems();
    this.getjobDetails();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.selectedPolicyItems = [];
  }
}
